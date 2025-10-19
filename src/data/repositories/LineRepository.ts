// Repository implementation
import { Line } from '@/src/domain/entities/Line';
import { getSafeDatabase } from '@/src/db/runtime';
import { normalizeTimestamp } from '@/src/util/timestamp';

// Private型定義: DBの生データ構造（snake_case）
type LineRow = {
  id: string;
  section_id: string;
  text: string;
  line_index: number;
  mora_count: number | null;
  rhyme_tail: string | null;
  created_at: number; // INTEGER型（UNIX timestamp）
  updated_at: number; // INTEGER型（UNIX timestamp）
};

export class LineRepository {
  // Private: DBの行データをドメインエンティティに変換
  private rowToEntity(row: LineRow): Line {
    return new Line(
      row.id,
      row.section_id,
      row.text,
      row.line_index,
      row.mora_count ?? undefined,
      row.rhyme_tail ?? undefined,
      new Date(normalizeTimestamp(row.created_at)),
      new Date(normalizeTimestamp(row.updated_at))
    );
  }

  async findBySectionId(sectionId: string): Promise<Line[]> {
    const db = await getSafeDatabase();
    const rows = await db.getAllAsync<LineRow>(
      'SELECT * FROM lines WHERE section_id = ? ORDER BY line_index',
      [sectionId]
    );
    return (rows || []).map(row => this.rowToEntity(row));
  }

  async findById(id: string): Promise<Line | null> {
    const db = await getSafeDatabase();
    const row = await db.getFirstAsync<LineRow>(
      'SELECT * FROM lines WHERE id = ?',
      [id]
    );
    return row ? this.rowToEntity(row) : null;
  }

  async save(line: Line): Promise<void> {
    const db = await getSafeDatabase();

    // UPSERT: レースコンディション回避＆I/O削減
    await db.runAsync(
      `INSERT INTO lines (id, section_id, text, line_index, mora_count, rhyme_tail, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         text = excluded.text,
         line_index = excluded.line_index,
         mora_count = excluded.mora_count,
         rhyme_tail = excluded.rhyme_tail,
         updated_at = excluded.updated_at`,
      [
        line.id,
        line.sectionId,
        line.text,
        line.lineIndex,
        line.moraCount ?? null,
        line.rhymeTail ?? null,
        line.createdAt.getTime(),
        line.updatedAt.getTime()
      ]
    );
  }

  async delete(id: string): Promise<boolean> {
    const db = await getSafeDatabase();
    const result = await db.runAsync(
      'DELETE FROM lines WHERE id = ?',
      [id]
    );
    return result.changes > 0;
  }

  async reorderLines(sectionId: string, lineIds: string[]): Promise<void> {
    const db = await getSafeDatabase();

    await db.withTransactionAsync(async () => {
      for (let i = 0; i < lineIds.length; i++) {
        await db.runAsync(
          'UPDATE lines SET line_index = ? WHERE id = ? AND section_id = ?',
          [i, lineIds[i], sectionId]
        );
      }
    });
  }

  async deleteBySectionId(sectionId: string): Promise<void> {
    const db = await getSafeDatabase();
    await db.runAsync(
      'DELETE FROM lines WHERE section_id = ?',
      [sectionId]
    );
  }
}

// シングルトンインスタンス
export const lineRepository = new LineRepository();
