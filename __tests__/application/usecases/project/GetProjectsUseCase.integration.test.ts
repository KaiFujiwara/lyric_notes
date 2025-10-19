import { setupTestDatabase, cleanupTestDatabase, clearAllTables, SQLiteDatabase } from '@/__tests__/helpers/test-db-setup';
import { GetProjectsUseCase } from '@/src/application/usecases/project/GetProjectsUseCase';
import { GetProjectByIdUseCase } from '@/src/application/usecases/project/GetProjectByIdUseCase';
import { ProjectRepository } from '@/src/data/repositories/ProjectRepository';

// データベースランタイムをモック
jest.mock('@/src/db/runtime', () => ({
  getSafeDatabase: jest.fn(),
}));

describe('GetProjects UseCases 統合テスト', () => {
  let db: SQLiteDatabase;
  let getProjectsUseCase: GetProjectsUseCase;
  let getProjectByIdUseCase: GetProjectByIdUseCase;
  let repository: ProjectRepository;

  beforeAll(async () => {
    db = await setupTestDatabase();

    // モックをテストDBに差し替え
    const { getSafeDatabase } = require('@/src/db/runtime');
    getSafeDatabase.mockResolvedValue(db);

    repository = new ProjectRepository();
    getProjectsUseCase = new GetProjectsUseCase(repository);
    getProjectByIdUseCase = new GetProjectByIdUseCase(repository);
  });

  afterAll(async () => {
    await cleanupTestDatabase(db);
  });

  beforeEach(async () => {
    await clearAllTables(db);
  });

  describe('GetProjectsUseCase', () => {
    it('全プロジェクトを取得できる', async () => {
      // テストデータ作成
      const now = Date.now();
      await db.runAsync(
        'INSERT INTO projects (id, title, created_at, updated_at, is_deleted) VALUES (?, ?, ?, ?, ?)',
        ['project-1', 'First Project', now, now, 0]
      );
      await db.runAsync(
        'INSERT INTO projects (id, title, created_at, updated_at, is_deleted) VALUES (?, ?, ?, ?, ?)',
        ['project-2', 'Second Project', now + 1000, now + 1000, 0]
      );

      const projects = await getProjectsUseCase.execute();

      expect(projects).toHaveLength(2);
      // updated_at DESCでソートされる
      expect(projects[0].title).toBe('Second Project');
      expect(projects[1].title).toBe('First Project');
    });

    it('削除済みプロジェクトは取得しない', async () => {
      const now = Date.now();
      await db.runAsync(
        'INSERT INTO projects (id, title, created_at, updated_at, is_deleted) VALUES (?, ?, ?, ?, ?)',
        ['project-1', 'Active Project', now, now, 0]
      );
      await db.runAsync(
        'INSERT INTO projects (id, title, created_at, updated_at, is_deleted) VALUES (?, ?, ?, ?, ?)',
        ['project-2', 'Deleted Project', now, now, 1]
      );

      const projects = await getProjectsUseCase.execute();

      expect(projects).toHaveLength(1);
      expect(projects[0].title).toBe('Active Project');
    });

    it('プロジェクトが0件の場合は空配列を返す', async () => {
      const projects = await getProjectsUseCase.execute();
      expect(projects).toEqual([]);
    });
  });

  describe('GetProjectByIdUseCase', () => {
    it('IDでプロジェクトを取得できる', async () => {
      const now = Date.now();
      await db.runAsync(
        'INSERT INTO projects (id, title, created_at, updated_at, is_deleted) VALUES (?, ?, ?, ?, ?)',
        ['project-1', 'Test Project', now, now, 0]
      );

      const project = await getProjectByIdUseCase.execute('project-1');

      expect(project).not.toBeNull();
      expect(project!.id).toBe('project-1');
      expect(project!.title).toBe('Test Project');
    });

    it('存在しないIDの場合はnullを返す', async () => {
      const project = await getProjectByIdUseCase.execute('nonexistent');
      expect(project).toBeNull();
    });

    it('削除済みプロジェクトはnullを返す', async () => {
      const now = Date.now();
      await db.runAsync(
        'INSERT INTO projects (id, title, created_at, updated_at, is_deleted) VALUES (?, ?, ?, ?, ?)',
        ['project-1', 'Deleted Project', now, now, 1]
      );

      const project = await getProjectByIdUseCase.execute('project-1');
      expect(project).toBeNull();
    });
  });
});
