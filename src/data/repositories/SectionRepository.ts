// Repository implementation
import { Section } from '@/src/domain/entities/Section';
import { getSafeDatabase } from '@/src/db/runtime';
import { normalizeTimestamp } from '@/src/util/timestamp';

// Private型定義: DBの生データ構造（snake_case）
type SectionRow = {
  id: string;
  project_id: string;
  name: string | null;
  order_index: number;
  created_at: number; // INTEGER型（UNIX timestamp）
  updated_at: number; // INTEGER型（UNIX timestamp）
};

export class SectionRepository {
  // Private: DBの行データをドメインエンティティに変換
  private rowToEntity(row: SectionRow): Section {
    return new Section(
      row.id,
      row.project_id,
      row.name ?? 'セクション',
      row.order_index,
      new Date(normalizeTimestamp(row.created_at)),
      new Date(normalizeTimestamp(row.updated_at))
    );
  }

  async findByProjectId(projectId: string): Promise<Section[]> {
    const db = await getSafeDatabase();
    const rows = await db.getAllAsync<SectionRow>(
      'SELECT * FROM sections WHERE project_id = ? ORDER BY order_index',
      [projectId]
    );
    return (rows || []).map(row => this.rowToEntity(row));
  }

  async findById(id: string): Promise<Section | null> {
    const db = await getSafeDatabase();
    const row = await db.getFirstAsync<SectionRow>(
      'SELECT * FROM sections WHERE id = ?',
      [id]
    );
    return row ? this.rowToEntity(row) : null;
  }

  async save(section: Section): Promise<void> {
    const db = await getSafeDatabase();

    // UPSERT: レースコンディション回避＆I/O削減
    await db.runAsync(
      `INSERT INTO sections (id, project_id, name, order_index, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         name = excluded.name,
         order_index = excluded.order_index,
         updated_at = excluded.updated_at`,
      [
        section.id,
        section.projectId,
        section.name ?? null,
        section.orderIndex,
        section.createdAt.getTime(),
        section.updatedAt.getTime()
      ]
    );

    // プロジェクトの更新日時も更新
    await db.runAsync(
      'UPDATE projects SET updated_at = ? WHERE id = ?',
      [Date.now(), section.projectId]
    );
  }

  async delete(id: string): Promise<boolean> {
    const db = await getSafeDatabase();

    // 削除前にプロジェクトIDを取得
    const section = await this.findById(id);
    if (!section) return false;

    const result = await db.runAsync(
      'DELETE FROM sections WHERE id = ?',
      [id]
    );

    // プロジェクトの更新日時を更新
    if (result.changes > 0) {
      await db.runAsync(
        'UPDATE projects SET updated_at = ? WHERE id = ?',
        [Date.now(), section.projectId]
      );
    }

    return result.changes > 0;
  }

  async reorder(projectId: string, sectionIds: string[]): Promise<void> {
    const db = await getSafeDatabase();

    await db.withTransactionAsync(async () => {
      for (let i = 0; i < sectionIds.length; i++) {
        await db.runAsync(
          'UPDATE sections SET order_index = ? WHERE id = ? AND project_id = ?',
          [i, sectionIds[i], projectId]
        );
      }

      await db.runAsync(
        'UPDATE projects SET updated_at = ? WHERE id = ?',
        [Date.now(), projectId]
      );
    });
  }
}

// シングルトンインスタンス
export const sectionRepository = new SectionRepository();
