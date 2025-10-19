import { setupTestDatabase, cleanupTestDatabase, SQLiteDatabase } from '@/__tests__/helpers/test-db-setup';
import { CreateProjectUseCase } from '@/src/application/usecases/project/CreateProjectUseCase';
import { ProjectRepository } from '@/src/data/repositories/ProjectRepository';

// データベースランタイムをモック
jest.mock('@/src/db/runtime', () => ({
  getSafeDatabase: jest.fn(),
}));

describe('CreateProjectUseCase 統合テスト', () => {
  let db: SQLiteDatabase;
  let useCase: CreateProjectUseCase;
  let repository: ProjectRepository;

  beforeAll(async () => {
    db = await setupTestDatabase();

    // モックをテストDBに差し替え
    const { getSafeDatabase } = require('@/src/db/runtime');
    getSafeDatabase.mockResolvedValue(db);

    repository = new ProjectRepository();
    useCase = new CreateProjectUseCase(repository);
  });

  afterAll(async () => {
    await cleanupTestDatabase(db);
  });

  describe('execute - プロジェクト作成', () => {
    it('タイトルのみでプロジェクトを作成できる', async () => {
      const projectId = await useCase.execute({
        title: 'My First Song',
      });

      // プロジェクトが作成されていることを確認
      expect(projectId).toBeDefined();
      expect(typeof projectId).toBe('string');

      // DBから取得して検証
      const project = await repository.findById(projectId);
      expect(project).not.toBeNull();
      expect(project!.title).toBe('My First Song');
      expect(project!.folderId).toBeUndefined();
      expect(project!.genreId).toBeUndefined();
      expect(project!.isDeleted).toBe(false);
    });

    it('フォルダIDとジャンルIDを指定してプロジェクトを作成できる', async () => {
      // フォルダとジャンルを事前に作成
      const now = Date.now();
      await db.runAsync(
        'INSERT INTO folders (id, name, order_index, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
        ['folder-1', 'Rock Songs', 0, now, now]
      );
      await db.runAsync(
        'INSERT INTO genres (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)',
        ['genre-1', 'J-Rock', now, now]
      );

      const projectId = await useCase.execute({
        title: 'Rock Song',
        folderId: 'folder-1',
        genreId: 'genre-1',
      });

      const project = await repository.findById(projectId);
      expect(project!.title).toBe('Rock Song');
      expect(project!.folderId).toBe('folder-1');
      expect(project!.genreId).toBe('genre-1');
    });

    it('空のタイトルでエラーになる', async () => {
      await expect(
        useCase.execute({ title: '' })
      ).rejects.toThrow();
    });

    it('タイトルが長すぎるとエラーになる', async () => {
      const longTitle = 'a'.repeat(201);
      await expect(
        useCase.execute({ title: longTitle })
      ).rejects.toThrow();
    });

    it('存在しないフォルダIDでエラーになる', async () => {
      await expect(
        useCase.execute({
          title: 'Test Project',
          folderId: 'nonexistent-folder',
        })
      ).rejects.toThrow();
    });

    it('存在しないジャンルIDでエラーになる', async () => {
      await expect(
        useCase.execute({
          title: 'Test Project',
          genreId: 'nonexistent-genre',
        })
      ).rejects.toThrow();
    });
  });
});
