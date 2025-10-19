import { setupTestDatabase, cleanupTestDatabase, clearAllTables, SQLiteDatabase } from '@/__tests__/helpers/test-db-setup';
import { DeleteProjectUseCase } from '@/src/application/usecases/project/DeleteProjectUseCase';
import { ProjectRepository } from '@/src/data/repositories/ProjectRepository';

// データベースランタイムをモック
jest.mock('@/src/db/runtime', () => ({
  getSafeDatabase: jest.fn(),
}));

describe('DeleteProjectUseCase 統合テスト', () => {
  let db: SQLiteDatabase;
  let useCase: DeleteProjectUseCase;
  let repository: ProjectRepository;

  beforeAll(async () => {
    db = await setupTestDatabase();

    const { getSafeDatabase } = require('@/src/db/runtime');
    getSafeDatabase.mockResolvedValue(db);

    repository = new ProjectRepository();
    useCase = new DeleteProjectUseCase(repository);
  });

  afterAll(async () => {
    await cleanupTestDatabase(db);
  });

  beforeEach(async () => {
    await clearAllTables(db);
  });

  describe('execute - プロジェクト削除', () => {
    it('プロジェクトを削除できる（論理削除）', async () => {
      // テストデータ作成
      const now = Date.now();
      await db.runAsync(
        'INSERT INTO projects (id, title, created_at, updated_at, is_deleted) VALUES (?, ?, ?, ?, ?)',
        ['project-1', 'Test Project', now, now, 0]
      );

      await useCase.execute('project-1');

      // findByIdでは取得できない（is_deleted = 1なので）
      const project = await repository.findById('project-1');
      expect(project).toBeNull();

      // DBには残っている（論理削除）
      const row = await db.getFirstAsync<{ is_deleted: number }>(
        'SELECT is_deleted FROM projects WHERE id = ?',
        ['project-1']
      );
      expect(row).not.toBeNull();
      expect(row!.is_deleted).toBe(1);
    });

    it('存在しないプロジェクトIDでエラーになる', async () => {
      await expect(
        useCase.execute('nonexistent')
      ).rejects.toThrow();
    });

    it('すでに削除済みのプロジェクトでエラーになる', async () => {
      const now = Date.now();
      await db.runAsync(
        'INSERT INTO projects (id, title, created_at, updated_at, is_deleted) VALUES (?, ?, ?, ?, ?)',
        ['project-1', 'Deleted Project', now, now, 1]
      );

      await expect(
        useCase.execute('project-1')
      ).rejects.toThrow();
    });
  });
});
