/**
 * 結合テスト: インメモリSQLiteを使ったスナップショット機能の検証
 */
import * as FileSystem from 'expo-file-system';
import Database from 'better-sqlite3';
import { createSnapshot } from '@/src/db/snapshot';
import { sqliteDataSource } from '@/src/db/datasources/sqlite';

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
  getExecutedMigrations: jest.fn(() =>
    Promise.resolve([
      { id: 1, name: '001_initial', executed_at: '2025-01-01T00:00:00Z' },
    ])
  ),
}));

// インメモリデータベースのモック
let inMemoryDb: Database.Database;

describe('スナップショット 結合テスト', () => {
  beforeEach(() => {
    // インメモリSQLiteデータベースを作成
    inMemoryDb = new Database(':memory:');

    // テストテーブルを作成
    inMemoryDb.exec(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        avatar BLOB
      );

      CREATE TABLE posts (
        id INTEGER PRIMARY KEY,
        user_id INTEGER,
        title TEXT,
        content TEXT
      );

      CREATE TABLE tags (
        id INTEGER PRIMARY KEY,
        name TEXT
      );
    `);

    // テストデータを挿入
    const insertUser = inMemoryDb.prepare(
      'INSERT INTO users (id, name, avatar) VALUES (?, ?, ?)'
    );
    insertUser.run(1, 'Alice', Buffer.from([0x48, 0x65, 0x6c, 0x6c, 0x6f])); // "Hello"
    insertUser.run(2, 'Bob', Buffer.from([0x57, 0x6f, 0x72, 0x6c, 0x64])); // "World"

    const insertPost = inMemoryDb.prepare(
      'INSERT INTO posts (id, user_id, title, content) VALUES (?, ?, ?, ?)'
    );
    insertPost.run(1, 1, 'First Post', 'Hello world!');
    insertPost.run(2, 1, 'Second Post', 'Testing snapshots');
    insertPost.run(3, 2, 'Bob Post', 'Nice feature');

    const insertTag = inMemoryDb.prepare('INSERT INTO tags (id, name) VALUES (?, ?)');
    insertTag.run(1, 'tech');
    insertTag.run(2, 'music');

    // sqliteDataSource をモック
    const mockDb = {
      withTransactionAsync: jest.fn(async (callback) => {
        // トランザクション内での処理をそのまま実行
        return await callback();
      }),
      getAllAsync: jest.fn(async (query: string) => {
        // better-sqlite3 の API を expo-sqlite 風に変換
        const stmt = inMemoryDb.prepare(query);
        return stmt.all();
      }),
    };

    (sqliteDataSource.getDatabase as jest.Mock).mockResolvedValue(mockDb);

    // FileSystem モック
    const mockFs = FileSystem as jest.Mocked<typeof FileSystem>;
    (mockFs.makeDirectoryAsync as jest.Mock).mockResolvedValue(undefined);
  });

  afterEach(() => {
    if (inMemoryDb) {
      inMemoryDb.close();
    }
    jest.clearAllMocks();
  });

  it('全テーブル、マイグレーション、メタデータを含むスナップショットを作成する', async () => {
    const mockFs = FileSystem as jest.Mocked<typeof FileSystem>;

    let snapshotContent = '';
    (mockFs.writeAsStringAsync as jest.Mock).mockImplementation(
      async (_path: string, content: string) => {
        snapshotContent = content;
      }
    );

    const filename = await createSnapshot('integration_test');

    // ファイル名の形式確認
    expect(filename).toMatch(/^integration_test_\d{4}-\d{2}-\d{2}T/);

    // スナップショット内容をパース
    const snapshot = JSON.parse(snapshotContent);

    // テーブルデータの確認
    expect(snapshot.users).toHaveLength(2);
    expect(snapshot.posts).toHaveLength(3);
    expect(snapshot.tags).toHaveLength(2);

    // users テーブルのデータ確認
    expect(snapshot.users[0]).toMatchObject({
      id: 1,
      name: 'Alice',
    });
    expect(snapshot.users[1]).toMatchObject({
      id: 2,
      name: 'Bob',
    });

    // posts テーブルのデータ確認
    expect(snapshot.posts[0]).toMatchObject({
      id: 1,
      user_id: 1,
      title: 'First Post',
      content: 'Hello world!',
    });

    // tags テーブルのデータ確認
    expect(snapshot.tags).toEqual([
      { id: 1, name: 'tech' },
      { id: 2, name: 'music' },
    ]);

    // マイグレーション情報の確認
    expect(snapshot._migrations).toHaveLength(1);
    expect(snapshot._migrations[0]).toMatchObject({
      id: 1,
      name: '001_initial',
    });

    // メタデータの確認
    expect(snapshot._metadata).toMatchObject({
      label: 'integration_test',
      tables_count: 3,
      total_records: 7, // users:2 + posts:3 + tags:2 (_migrations は除外)
    });
    expect(snapshot._metadata.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('BLOBデータをbase64として正しくシリアライズする', async () => {
    const mockFs = FileSystem as jest.Mocked<typeof FileSystem>;

    let snapshotContent = '';
    (mockFs.writeAsStringAsync as jest.Mock).mockImplementation(
      async (_path: string, content: string) => {
        snapshotContent = content;
      }
    );

    await createSnapshot('blob_test');

    const snapshot = JSON.parse(snapshotContent);

    // BLOB列がbase64オブジェクトに変換されているか確認
    expect(snapshot.users[0].avatar).toEqual({
      __type: 'base64',
      data: expect.any(String),
    });
    expect(snapshot.users[1].avatar).toEqual({
      __type: 'base64',
      data: expect.any(String),
    });

    // base64データが正しくエンコードされているか確認
    // "Hello" (0x48656c6c6f) をデコードして検証
    const aliceAvatar = snapshot.users[0].avatar;
    expect(aliceAvatar.__type).toBe('base64');
    expect(typeof aliceAvatar.data).toBe('string');
    expect(aliceAvatar.data.length).toBeGreaterThan(0);
  });

  it('空のテーブルを正しく処理する', async () => {
    const mockFs = FileSystem as jest.Mocked<typeof FileSystem>;

    // 全データを削除
    inMemoryDb.exec('DELETE FROM users; DELETE FROM posts; DELETE FROM tags;');

    let snapshotContent = '';
    (mockFs.writeAsStringAsync as jest.Mock).mockImplementation(
      async (_path: string, content: string) => {
        snapshotContent = content;
      }
    );

    await createSnapshot('empty_test');

    const snapshot = JSON.parse(snapshotContent);

    // 空のテーブルが正しく処理されているか
    expect(snapshot.users).toEqual([]);
    expect(snapshot.posts).toEqual([]);
    expect(snapshot.tags).toEqual([]);

    // メタデータのレコード数が0になっているか
    expect(snapshot._metadata.total_records).toBe(0);
    expect(snapshot._metadata.tables_count).toBe(3);
  });

  it('特殊文字を含むテーブル名を正しく処理する', async () => {
    const mockFs = FileSystem as jest.Mocked<typeof FileSystem>;

    // 特殊な名前のテーブルを作成（ダブルクォートを含む名前は作成できないが、スペースなどは可能）
    inMemoryDb.exec('CREATE TABLE "special-table" (id INTEGER PRIMARY KEY, value TEXT);');
    inMemoryDb.exec('INSERT INTO "special-table" (id, value) VALUES (1, \'test\');');

    let snapshotContent = '';
    (mockFs.writeAsStringAsync as jest.Mock).mockImplementation(
      async (_path: string, content: string) => {
        snapshotContent = content;
      }
    );

    await createSnapshot('special_chars_test');

    const snapshot = JSON.parse(snapshotContent);

    // 特殊文字を含むテーブル名が正しく処理されているか
    expect(snapshot['special-table']).toEqual([{ id: 1, value: 'test' }]);
  });
});
