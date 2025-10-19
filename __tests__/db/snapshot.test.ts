import * as FileSystem from 'expo-file-system';
import { sqliteDataSource } from '@/src/db/datasources/sqlite';
import {
  createSnapshot,
  getSnapshots,
  rotateSnapshots,
} from '@/src/db/snapshot';

// モック用のヘルパー
jest.mock('expo-file-system', () => ({
  documentDirectory: '/mock/',
  makeDirectoryAsync: jest.fn(),
  writeAsStringAsync: jest.fn(),
  getInfoAsync: jest.fn(),
  readDirectoryAsync: jest.fn(),
  deleteAsync: jest.fn(),
}));
jest.mock('expo-sqlite', () => ({}));
jest.mock('expo-constants', () => ({
  default: { expoConfig: { extra: { appEnv: 'test' } } },
}));
jest.mock('@/src/db/datasources/sqlite', () => ({
  sqliteDataSource: {
    getDatabase: jest.fn(),
  },
}));
jest.mock('@/src/db/migration-runner', () => ({
  getExecutedMigrations: jest.fn(() => Promise.resolve([])),
}));

// snapshot.ts から関数をインポートするために型定義を追加
// （本来は export されていないが、テストのために直接アクセス）
// NOTE: 実装ファイルで export すれば不要になる

describe('スナップショット ユーティリティ関数', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sanitizeLabel', () => {
    // sanitizeLabel は export されていないので、createSnapshot の動作から検証
    it('ファイル名に使えない文字をアンダースコアに置換する', async () => {
      const mockFs = FileSystem as jest.Mocked<typeof FileSystem>;
      const mockDb = {
        withTransactionAsync: jest.fn(async (cb) => await cb()),
        getAllAsync: jest.fn()
          .mockResolvedValueOnce([]) // テーブル一覧
          .mockResolvedValue([]),
      };

      (sqliteDataSource.getDatabase as jest.Mock).mockResolvedValue(mockDb);
      (mockFs.makeDirectoryAsync as jest.Mock).mockResolvedValue(undefined);
      (mockFs.writeAsStringAsync as jest.Mock).mockResolvedValue(undefined);

      // ファイル名に使えない文字を含むラベルでスナップショット作成
      const filename = await createSnapshot('test/label:with*special?chars');

      // ファイル名が sanitize されていることを確認
      expect(filename).toMatch(/^test_label_with_special_chars_\d{4}-\d{2}-\d{2}T/);
    });
  });

  describe('serializeValue', () => {
    it('Uint8Arrayをbase64オブジェクトに変換する', async () => {
      const mockFs = FileSystem as jest.Mocked<typeof FileSystem>;
      const testData = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"

      const mockDb = {
        withTransactionAsync: jest.fn(async (cb) => await cb()),
        getAllAsync: jest.fn()
          .mockResolvedValueOnce([{ name: 'test_table' }]) // テーブル一覧
          .mockResolvedValueOnce([{ id: 1, data: testData }]), // テーブルデータ
      };

      (sqliteDataSource.getDatabase as jest.Mock).mockResolvedValue(mockDb);
      (mockFs.makeDirectoryAsync as jest.Mock).mockResolvedValue(undefined);

      let writtenContent = '';
      (mockFs.writeAsStringAsync as jest.Mock).mockImplementation(
        async (_path: string, content: string) => {
          writtenContent = content;
        }
      );

      await createSnapshot('blob_test');

      // JSON をパースして BLOB が base64 化されているか確認
      const snapshot = JSON.parse(writtenContent);
      expect(snapshot.test_table[0].data).toEqual({
        __type: 'base64',
        data: expect.any(String),
      });
    });

    it('ArrayBufferをbase64オブジェクトに変換する', async () => {
      const mockFs = FileSystem as jest.Mocked<typeof FileSystem>;
      const buffer = new ArrayBuffer(5);
      const view = new Uint8Array(buffer);
      view.set([87, 111, 114, 108, 100]); // "World"

      const mockDb = {
        withTransactionAsync: jest.fn(async (cb) => await cb()),
        getAllAsync: jest.fn()
          .mockResolvedValueOnce([{ name: 'test_table' }])
          .mockResolvedValueOnce([{ id: 1, data: buffer }]),
      };

      (sqliteDataSource.getDatabase as jest.Mock).mockResolvedValue(mockDb);
      (mockFs.makeDirectoryAsync as jest.Mock).mockResolvedValue(undefined);

      let writtenContent = '';
      (mockFs.writeAsStringAsync as jest.Mock).mockImplementation(
        async (_path: string, content: string) => {
          writtenContent = content;
        }
      );

      await createSnapshot('arraybuffer_test');

      const snapshot = JSON.parse(writtenContent);
      expect(snapshot.test_table[0].data).toEqual({
        __type: 'base64',
        data: expect.any(String),
      });
    });
  });

  describe('getSnapshots', () => {
    it('スナップショットをタイムスタンプの降順（新しい順）でソートする', async () => {
      const mockFs = FileSystem as jest.Mocked<typeof FileSystem>;
      (mockFs.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true });
      (mockFs.readDirectoryAsync as jest.Mock).mockResolvedValue([
        'labelA_2025-01-15T10-00-00-000Z.json',
        'labelB_2025-01-20T14-30-00-000Z.json',
        'labelA_2025-01-10T08-00-00-000Z.json',
        'labelC_2025-01-18T12-00-00-000Z.json',
      ]);

      const snapshots = await getSnapshots();

      // 時系列降順（新しい順）になっているか確認
      expect(snapshots).toEqual([
        'labelB_2025-01-20T14-30-00-000Z.json',
        'labelC_2025-01-18T12-00-00-000Z.json',
        'labelA_2025-01-15T10-00-00-000Z.json',
        'labelA_2025-01-10T08-00-00-000Z.json',
      ]);
    });

    it('ディレクトリが存在しない場合は空配列を返す', async () => {
      const mockFs = FileSystem as jest.Mocked<typeof FileSystem>;
      (mockFs.getInfoAsync as jest.Mock).mockResolvedValue({ exists: false });

      const snapshots = await getSnapshots();

      expect(snapshots).toEqual([]);
    });
  });

  describe('rotateSnapshots', () => {
    it('指定した保持数を超える古いスナップショットを削除する', async () => {
      const mockFs = FileSystem as jest.Mocked<typeof FileSystem>;
      (mockFs.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true });
      (mockFs.readDirectoryAsync as jest.Mock).mockResolvedValue([
        'snap_2025-01-20T10-00-00-000Z.json',
        'snap_2025-01-19T10-00-00-000Z.json',
        'snap_2025-01-18T10-00-00-000Z.json',
        'snap_2025-01-17T10-00-00-000Z.json',
        'snap_2025-01-16T10-00-00-000Z.json',
      ]);
      (mockFs.deleteAsync as jest.Mock).mockResolvedValue(undefined);

      await rotateSnapshots(3);

      // 古い 2 つが削除されるはず
      expect(mockFs.deleteAsync).toHaveBeenCalledTimes(2);
      expect(mockFs.deleteAsync).toHaveBeenCalledWith(
        '/mock/db_snapshots/snap_2025-01-17T10-00-00-000Z.json'
      );
      expect(mockFs.deleteAsync).toHaveBeenCalledWith(
        '/mock/db_snapshots/snap_2025-01-16T10-00-00-000Z.json'
      );
    });

    it('保持数以下の場合は何も削除しない', async () => {
      const mockFs = FileSystem as jest.Mocked<typeof FileSystem>;
      (mockFs.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true });
      (mockFs.readDirectoryAsync as jest.Mock).mockResolvedValue([
        'snap_2025-01-20T10-00-00-000Z.json',
        'snap_2025-01-19T10-00-00-000Z.json',
      ]);
      (mockFs.deleteAsync as jest.Mock).mockResolvedValue(undefined);

      await rotateSnapshots(3);

      expect(mockFs.deleteAsync).not.toHaveBeenCalled();
    });
  });
});

describe('createSnapshot メタデータ', () => {
  it('total_recordsのカウントから_migrationsと_metadataを除外する', async () => {
    const mockFs = FileSystem as jest.Mocked<typeof FileSystem>;
    const mockDb = {
      withTransactionAsync: jest.fn(async (cb) => await cb()),
      getAllAsync: jest.fn()
        .mockResolvedValueOnce([
          { name: 'users' },
          { name: 'posts' },
        ])
        .mockResolvedValueOnce([
          { id: 1, name: 'Alice' },
          { id: 2, name: 'Bob' },
        ]) // users
        .mockResolvedValueOnce([
          { id: 1, title: 'Post1' },
          { id: 2, title: 'Post2' },
          { id: 3, title: 'Post3' },
        ]), // posts
    };

    (sqliteDataSource.getDatabase as jest.Mock).mockResolvedValue(mockDb);
    (mockFs.makeDirectoryAsync as jest.Mock).mockResolvedValue(undefined);

    let writtenContent = '';
    (mockFs.writeAsStringAsync as jest.Mock).mockImplementation(
      async (path: string, content: string) => {
        writtenContent = content;
      }
    );

    await createSnapshot('metadata_test');

    const snapshot = JSON.parse(writtenContent);

    // _migrations と _metadata は total_records にカウントされないはず
    expect(snapshot._metadata.total_records).toBe(5); // users:2 + posts:3
    expect(snapshot._metadata.tables_count).toBe(2);
  });
});
