// Repository implementation
import { Tag } from '@/src/domain/entities/Tag';
import { getSafeDatabase } from '@/src/db/runtime';
import { normalizeTimestamp } from '@/src/util/timestamp';

// Private型定義: DBの生データ構造（snake_case）
type TagRow = {
  id: string;
  name: string;
  color: string | null;
  created_at: number; // INTEGER型（UNIX timestamp）
  updated_at: number; // INTEGER型（UNIX timestamp）
};

export class TagRepository {
  // Private: DBの行データをドメインエンティティに変換
  private rowToEntity(row: TagRow): Tag {
    return new Tag(
      row.id,
      row.name,
      row.color ?? undefined,
      new Date(normalizeTimestamp(row.created_at)),
      new Date(normalizeTimestamp(row.updated_at))
    );
  }

  async findAll(): Promise<Tag[]> {
    const db = await getSafeDatabase();
    const rows = await db.getAllAsync<TagRow>(
      'SELECT * FROM tags ORDER BY name'
    );
    return (rows || []).map(row => this.rowToEntity(row));
  }

  async findById(id: string): Promise<Tag | null> {
    const db = await getSafeDatabase();
    const row = await db.getFirstAsync<TagRow>(
      'SELECT * FROM tags WHERE id = ?',
      [id]
    );
    return row ? this.rowToEntity(row) : null;
  }

  async findByName(name: string): Promise<Tag | null> {
    const db = await getSafeDatabase();
    const row = await db.getFirstAsync<TagRow>(
      'SELECT * FROM tags WHERE name = ?',
      [name]
    );
    return row ? this.rowToEntity(row) : null;
  }

  async save(tag: Tag): Promise<void> {
    const db = await getSafeDatabase();

    // UPSERT: レースコンディション回避＆I/O削減
    await db.runAsync(
      `INSERT INTO tags (id, name, color, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         name = excluded.name,
         color = excluded.color,
         updated_at = excluded.updated_at`,
      [tag.id, tag.name, tag.color ?? null, tag.createdAt.getTime(), tag.updatedAt.getTime()]
    );
  }

  async delete(id: string): Promise<boolean> {
    const db = await getSafeDatabase();
    const result = await db.runAsync(
      'DELETE FROM tags WHERE id = ?',
      [id]
    );
    return result.changes > 0;
  }

  async search(query: string): Promise<Tag[]> {
    const db = await getSafeDatabase();
    const rows = await db.getAllAsync<TagRow>(
      'SELECT * FROM tags WHERE name LIKE ? ORDER BY name',
      [`%${query}%`]
    );
    return (rows || []).map(row => this.rowToEntity(row));
  }

  // フォルダのタグ
  async findByFolderId(folderId: string): Promise<Tag[]> {
    const db = await getSafeDatabase();
    const rows = await db.getAllAsync<TagRow>(
      `SELECT t.* FROM tags t
       JOIN folder_tags ft ON t.id = ft.tag_id
       WHERE ft.folder_id = ?
       ORDER BY t.name`,
      [folderId]
    );
    return (rows || []).map(row => this.rowToEntity(row));
  }

  // プロジェクトのタグ
  async findByProjectId(projectId: string): Promise<Tag[]> {
    const db = await getSafeDatabase();
    const rows = await db.getAllAsync<TagRow>(
      `SELECT t.* FROM tags t
       JOIN project_tags pt ON t.id = pt.tag_id
       WHERE pt.project_id = ?
       ORDER BY t.name`,
      [projectId]
    );
    return (rows || []).map(row => this.rowToEntity(row));
  }

  // フレーズのタグ
  async findByPhraseId(phraseId: string): Promise<Tag[]> {
    const db = await getSafeDatabase();
    const rows = await db.getAllAsync<TagRow>(
      `SELECT t.* FROM tags t
       JOIN phrase_tags pt ON t.id = pt.tag_id
       WHERE pt.phrase_id = ?
       ORDER BY t.name`,
      [phraseId]
    );
    return (rows || []).map(row => this.rowToEntity(row));
  }

  // タグ関連付け
  async addToFolder(folderId: string, tagId: string): Promise<void> {
    const db = await getSafeDatabase();
    await db.runAsync(
      'INSERT OR IGNORE INTO folder_tags (folder_id, tag_id) VALUES (?, ?)',
      [folderId, tagId]
    );
  }

  async addToProject(projectId: string, tagId: string): Promise<void> {
    const db = await getSafeDatabase();
    await db.runAsync(
      'INSERT OR IGNORE INTO project_tags (project_id, tag_id, created_at) VALUES (?, ?, ?)',
      [projectId, tagId, Date.now()]
    );
  }

  async addToPhrase(phraseId: string, tagId: string): Promise<void> {
    const db = await getSafeDatabase();
    await db.runAsync(
      'INSERT OR IGNORE INTO phrase_tags (phrase_id, tag_id, created_at) VALUES (?, ?, ?)',
      [phraseId, tagId, Date.now()]
    );
  }

  // タグ関連付け解除
  async removeFromFolder(folderId: string, tagId: string): Promise<void> {
    const db = await getSafeDatabase();
    await db.runAsync(
      'DELETE FROM folder_tags WHERE folder_id = ? AND tag_id = ?',
      [folderId, tagId]
    );
  }

  async removeFromProject(projectId: string, tagId: string): Promise<void> {
    const db = await getSafeDatabase();
    await db.runAsync(
      'DELETE FROM project_tags WHERE project_id = ? AND tag_id = ?',
      [projectId, tagId]
    );
  }

  async removeFromPhrase(phraseId: string, tagId: string): Promise<void> {
    const db = await getSafeDatabase();
    await db.runAsync(
      'DELETE FROM phrase_tags WHERE phrase_id = ? AND tag_id = ?',
      [phraseId, tagId]
    );
  }
}

// シングルトンインスタンス
export const tagRepository = new TagRepository();
