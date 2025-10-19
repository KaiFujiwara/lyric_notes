// Repository implementation
import { Project } from '@/src/domain/entities/Project';
import { getSafeDatabase } from '@/src/db/runtime';
import { normalizeTimestamp } from '@/src/util/timestamp';

// Private型定義: DBの生データ構造（snake_case）
type ProjectRow = {
  id: string;
  title: string;
  folder_id: string | null;
  genre_id: string | null;
  created_at: number; // INTEGER型（UNIX timestamp）
  updated_at: number; // INTEGER型（UNIX timestamp）
  is_deleted: number; // INTEGER型（0 or 1）
};

export class ProjectRepository {
  // タイムスタンプ判定閾値: UNIX秒（10桁）とミリ秒（13桁）の境界
  private static readonly SEC_MS_THRESHOLD = 1e10;

  // Private: DBの行データをドメインエンティティに変換
  private rowToEntity(row: ProjectRow): Project {
    return new Project(
      row.id,
      row.title,
      row.folder_id ?? undefined,
      row.genre_id ?? undefined,
      new Date(this.normalizeTimestamp(row.created_at)),
      new Date(this.normalizeTimestamp(row.updated_at)),
      Boolean(row.is_deleted)
    );
  }

  // Private: タイムスタンプを正規化（秒/ミリ秒両対応 → ミリ秒統一）
  private normalizeTimestamp(ts: number): number {
    return ts < ProjectRepository.SEC_MS_THRESHOLD ? ts * 1000 : ts;
  }

  async findAll(): Promise<Project[]> {
    const db = await getSafeDatabase();
    const rows = await db.getAllAsync<ProjectRow>(
      'SELECT * FROM projects WHERE is_deleted = 0 ORDER BY updated_at DESC'
    );
    return (rows || []).map(row => this.rowToEntity(row));
  }

  async findById(id: string): Promise<Project | null> {
    const db = await getSafeDatabase();
    const row = await db.getFirstAsync<ProjectRow>(
      'SELECT * FROM projects WHERE id = ? AND is_deleted = 0',
      [id]
    );
    return row ? this.rowToEntity(row) : null;
  }

  async save(project: Project): Promise<void> {
    const db = await getSafeDatabase();

    // UPSERT: レースコンディション回避＆I/O削減（存在確認不要）
    await db.runAsync(
      `INSERT INTO projects (id, title, folder_id, genre_id, created_at, updated_at, is_deleted)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         title = excluded.title,
         folder_id = excluded.folder_id,
         genre_id = excluded.genre_id,
         updated_at = excluded.updated_at,
         is_deleted = excluded.is_deleted`,
      [
        project.id,
        project.title,
        project.folderId ?? null,
        project.genreId ?? null,
        project.createdAt.getTime(),
        project.updatedAt.getTime(),
        project.isDeleted ? 1 : 0
      ]
    );
  }

  async delete(id: string): Promise<boolean> {
    const db = await getSafeDatabase();
    const result = await db.runAsync(
      'UPDATE projects SET is_deleted = 1, updated_at = ? WHERE id = ? AND is_deleted = 0',
      [Date.now(), id]
    );
    return result.changes > 0;
  }

  async search(query: string): Promise<Project[]> {
    const db = await getSafeDatabase();
    const rows = await db.getAllAsync<ProjectRow>(
      'SELECT * FROM projects WHERE title LIKE ? AND is_deleted = 0 ORDER BY updated_at DESC',
      [`%${query}%`]
    );
    return (rows || []).map(row => this.rowToEntity(row));
  }
}

// シングルトンインスタンス
export const projectRepository = new ProjectRepository();
