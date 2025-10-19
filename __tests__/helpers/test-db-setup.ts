// 統合テスト用のデータベースセットアップヘルパー

import { migrations } from '@/src/db/migrations';

// SQLiteDatabaseインターフェースの型定義（expo-sqliteのモック用）
export interface SQLiteDatabase {
  execAsync(source: string): Promise<void>;
  runAsync(source: string, params?: unknown[]): Promise<{ changes: number; lastInsertRowId: number }>;
  getFirstAsync<T>(source: string, params?: unknown[]): Promise<T | null>;
  getAllAsync<T>(source: string, params?: unknown[]): Promise<T[]>;
  withTransactionAsync<T>(task: () => Promise<T>): Promise<T>;
  closeAsync(): Promise<void>;
}

/**
 * テスト用のインメモリデータベースを作成し、マイグレーションを実行
 */
export async function setupTestDatabase(): Promise<SQLiteDatabase> {
  // Node.js環境でSQLiteを使用（better-sqlite3）
  const Database = require('better-sqlite3');
  const sqlite = new Database(':memory:');

  // IMPORTANT: 外部キー制約を有効化（SQLiteはデフォルトでOFF）
  // これがないと参照整合性チェックが効かない
  sqlite.pragma('foreign_keys = ON');

  // expo-sqliteのインターフェースに合わせたラッパーを作成
  const db: SQLiteDatabase = {
    execAsync: async (source: string) => {
      sqlite.exec(source);
    },
    runAsync: async (source: string, params?: unknown[]) => {
      const result = sqlite.prepare(source).run(...(params || []));
      return {
        changes: result.changes,
        lastInsertRowId: Number(result.lastInsertRowid),
      };
    },
    getFirstAsync: async <T,>(source: string, params?: unknown[]): Promise<T | null> => {
      const result = sqlite.prepare(source).get(...(params || []));
      return result || null;
    },
    getAllAsync: async <T,>(source: string, params?: unknown[]): Promise<T[]> => {
      const results = sqlite.prepare(source).all(...(params || []));
      return results || [];
    },
    withTransactionAsync: async <T,>(task: () => Promise<T>): Promise<T> => {
      // better-sqlite3はトランザクションが同期的なので、
      // 手動でトランザクションを管理
      try {
        sqlite.prepare('BEGIN').run();
        const result = await task();
        sqlite.prepare('COMMIT').run();
        return result;
      } catch (error) {
        sqlite.prepare('ROLLBACK').run();
        throw error;
      }
    },
    closeAsync: async () => {
      sqlite.close();
    },
  };

  // マイグレーションテーブル作成
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS migrations (
      name TEXT PRIMARY KEY,
      applied_at INTEGER NOT NULL
    )
  `);

  // 全マイグレーションを実行
  for (const migration of migrations) {
    await db.withTransactionAsync(async () => {
      // SQL文を順次実行
      for (const statement of migration.statements) {
        const cleaned = statement
          .trim()
          .replace(/--.*$/gm, '')
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .trim();

        if (cleaned.length > 0) {
          await db.execAsync(cleaned);
        }
      }

      // マイグレーション履歴に記録
      await db.runAsync(
        'INSERT INTO migrations (name, applied_at) VALUES (?, ?)',
        [migration.name, Date.now()]
      );
    });
  }

  return db;
}

/**
 * テスト用データベースのクリーンアップ
 */
export async function cleanupTestDatabase(db: SQLiteDatabase): Promise<void> {
  await db.closeAsync();
}

/**
 * データベースの全テーブルをクリア（テストケース間のクリーンアップ用）
 *
 * IMPORTANT:
 * - 外部キー制約を一時的にOFFにしてクリア
 * - AUTOINCREMENTをリセット
 * - テーブル名を安全にエスケープ
 */
export async function clearAllTables(db: SQLiteDatabase): Promise<void> {
  // 外部キー制約を一時的に無効化（削除順序を気にしなくて済む）
  await db.execAsync('PRAGMA foreign_keys = OFF');

  // 全テーブルを取得
  const tables = await db.getAllAsync<{ name: string }>(
    `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name != 'migrations'`
  );

  // 全テーブルのデータを削除
  for (const table of tables) {
    // SECURITY: テーブル名をダブルクオートでエスケープ（SQLインジェクション対策）
    await db.execAsync(`DELETE FROM "${table.name}"`);
  }

  // AUTOINCREMENT のリセット（sqlite_sequence テーブルをクリア）
  // これがないとテスト間でIDが連番になり続ける
  const sequenceExists = await db.getFirstAsync<{ name: string }>(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='sqlite_sequence'`
  );

  if (sequenceExists) {
    await db.execAsync('DELETE FROM sqlite_sequence');
  }

  // 外部キー制約を再度有効化
  await db.execAsync('PRAGMA foreign_keys = ON');
}
