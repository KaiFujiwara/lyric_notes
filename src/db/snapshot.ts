import * as FileSystem from 'expo-file-system';
import { encode as b64encode } from 'base-64';
import { sqliteDataSource } from './datasources/sqlite';
import { getExecutedMigrations } from './migration-runner';

// 型定義を追加
interface ExpoFileSystemType {
  documentDirectory: string | null;
  makeDirectoryAsync: (fileUri: string, options?: { intermediates?: boolean }) => Promise<void>;
  writeAsStringAsync: (fileUri: string, contents: string) => Promise<void>;
  getInfoAsync: (fileUri: string) => Promise<{ exists: boolean }>;
  readDirectoryAsync: (fileUri: string) => Promise<string[]>;
  deleteAsync: (fileUri: string) => Promise<void>;
}

// スナップショット保存先ディレクトリを動的に取得
const getSnapshotsDir = () => {
  const fs = FileSystem as unknown as ExpoFileSystemType;
  const docDir = fs.documentDirectory;
  if (!docDir) {
    throw new Error('Document directory is not available');
  }
  return `${docDir}db_snapshots/`;
};

// ラベルをファイル名として安全な文字列にサニタイズ
function sanitizeLabel(label: string): string {
  // ファイル名に使えない文字を _ に置換
  return label.replace(/[^a-zA-Z0-9_-]/g, '_');
}

// Uint8Array → base64文字列変換（React Native環境でも動作）
function u8ToBase64(u8: Uint8Array): string {
  // 文字列化は重いけど小規模ダンプならOK。サイズ大なら分割 or Buffer利用を検討。
  let s = '';
  for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]);
  return b64encode(s);
}

// BLOB/Uint8Arrayをbase64エンコード（JSON.stringify対策）
function serializeValue(value: unknown): unknown {
  if (value instanceof Uint8Array || value instanceof ArrayBuffer) {
    // Uint8Array/ArrayBufferをbase64文字列に変換
    const buffer = value instanceof ArrayBuffer ? new Uint8Array(value) : value;
    const base64 = u8ToBase64(buffer);
    return { __type: 'base64', data: base64 };
  }
  if (Array.isArray(value)) {
    return value.map(serializeValue);
  }
  if (value && typeof value === 'object') {
    const result: { [key: string]: unknown } = {};
    for (const [key, val] of Object.entries(value)) {
      result[key] = serializeValue(val);
    }
    return result;
  }
  return value;
}

// スナップショット作成
export async function createSnapshot(label: string = 'auto'): Promise<string> {
  const sanitizedLabel = sanitizeLabel(label);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${sanitizedLabel}_${timestamp}.json`;

  try {
    const SNAPSHOTS_DIR = getSnapshotsDir();

    // ディレクトリ作成
    const fs = FileSystem as unknown as ExpoFileSystemType;
    await fs.makeDirectoryAsync(SNAPSHOTS_DIR, { intermediates: true });

    // データベースからすべてのテーブル取得
    const db = await sqliteDataSource.getDatabase();

    // スナップショット用の型定義
    type AnyRow = Record<string, unknown>;
    type SnapshotData = Record<string, AnyRow[] | unknown>;

    const snapshot: SnapshotData = {};
    let tablesCount = 0;

    // CONSISTENCY: 読み取りトランザクションで一貫性のあるスナップショットを取得
    await db.withTransactionAsync(async () => {
      // 既存のテーブル一覧を動的に取得
      const tablesResult = await db.getAllAsync<{ name: string }>(
        `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name != 'migrations' ORDER BY name`
      );

      const tables = tablesResult.map(t => t.name);
      tablesCount = tables.length;
      console.log(`Found ${tables.length} tables to snapshot: ${tables.join(', ')}`);

      // 各テーブルのデータを取得
      for (const table of tables) {
        try {
          // SECURITY: テーブル名をダブルクオートでエスケープ（SQLインジェクション対策）
          // ダブルクォート内の " は "" にエスケープ
          const escapedTable = table.replace(/"/g, '""');
          const rows = await db.getAllAsync(`SELECT * FROM "${escapedTable}"`);
          // BLOB対策: Uint8Array/ArrayBufferをbase64エンコード
          const tableData = (rows || []).map(row => serializeValue(row)) as AnyRow[];
          snapshot[table] = tableData;
          console.log(`  ${table}: ${tableData.length} rows`);
        } catch (error) {
          console.warn(`Failed to backup table ${table}:`, error);
          snapshot[table] = [];
        }
      }

      // マイグレーション情報も保存
      try {
        const migrations = await getExecutedMigrations();
        snapshot['_migrations'] = migrations;
        console.log(`  migrations: ${migrations.length} entries`);
      } catch (error) {
        console.warn('Failed to backup migration history:', error);
        snapshot['_migrations'] = [];
      }
    });

    // メタデータ（テーブルデータのみカウント、_で始まる特殊エントリは除外）
    const totalRecords = Object.entries(snapshot).reduce((sum, [k, v]) => {
      if (k.startsWith('_')) return sum;
      return sum + (Array.isArray(v) ? v.length : 0);
    }, 0);

    const metadata = {
      created_at: new Date().toISOString(),
      label,
      tables_count: tablesCount,
      total_records: totalRecords
    };
    snapshot['_metadata'] = metadata;

    // ファイルに書き込み
    const filepath = `${SNAPSHOTS_DIR}${filename}`;
    await fs.writeAsStringAsync(filepath, JSON.stringify(snapshot, null, 2));

    console.log(`✅ Snapshot created: ${filename} (${totalRecords} total records)`);
    return filename;
  } catch (error) {
    console.error('❌ Failed to create snapshot:', error);
    throw error;
  }
}

// スナップショットファイル一覧取得
export async function getSnapshots(): Promise<string[]> {
  try {
    const SNAPSHOTS_DIR = getSnapshotsDir();
    const fs = FileSystem as unknown as ExpoFileSystemType;

    const info = await fs.getInfoAsync(SNAPSHOTS_DIR);
    if (!info.exists) return [];

    const files = await fs.readDirectoryAsync(SNAPSHOTS_DIR);
    return files
      .filter(file => file.endsWith('.json'))
      .sort((a, b) => {
        // ISO時刻をパースして時系列順にソート（ラベルが違っても正しく並ぶ）
        const timestampA = a.match(/_(\d{4}-\d{2}-\d{2}T[^.]+)\.json$/)?.[1] ?? '';
        const timestampB = b.match(/_(\d{4}-\d{2}-\d{2}T[^.]+)\.json$/)?.[1] ?? '';
        return timestampB.localeCompare(timestampA); // 新しい順（降順）
      });
  } catch (error) {
    console.warn('Failed to get snapshots list:', error);
    return [];
  }
}

// 古いスナップショットを削除（世代ローテーション）
export async function rotateSnapshots(keepCount: number = 3): Promise<void> {
  try {
    const SNAPSHOTS_DIR = getSnapshotsDir();
    const snapshots = await getSnapshots();
    const fs = FileSystem as unknown as ExpoFileSystemType;

    if (snapshots.length <= keepCount) {
      console.log(`Snapshot rotation: ${snapshots.length} files, no deletion needed`);
      return; // 削除対象なし
    }

    const toDelete = snapshots.slice(keepCount);
    console.log(`Snapshot rotation: deleting ${toDelete.length} old files, keeping ${keepCount}`);

    for (const filename of toDelete) {
      try {
        const filepath = `${SNAPSHOTS_DIR}${filename}`;
        await fs.deleteAsync(filepath);
        console.log(`  ✅ Deleted: ${filename}`);
      } catch (error) {
        console.warn(`  ❌ Failed to delete ${filename}:`, error);
      }
    }

    console.log('✅ Snapshot rotation complete');
  } catch (error) {
    console.error('❌ Failed to rotate snapshots:', error);
    // 失敗しても処理継続（スナップショット機能はオプショナル）
  }
}