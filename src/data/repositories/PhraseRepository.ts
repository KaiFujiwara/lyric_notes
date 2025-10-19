// Repository implementation
import { Phrase } from '@/src/domain/entities/Phrase';
import { getSafeDatabase } from '@/src/db/runtime';
import { normalizeTimestamp } from '@/src/util/timestamp';

// Private型定義: DBの生データ構造（snake_case）
type PhraseRow = {
  id: string;
  text: string;
  note: string | null;
  created_at: number; // INTEGER型（UNIX timestamp）
  updated_at: number; // INTEGER型（UNIX timestamp）
};

export class PhraseRepository {
  // Private: DBの行データをドメインエンティティに変換
  private rowToEntity(row: PhraseRow): Phrase {
    return new Phrase(
      row.id,
      row.text,
      row.note ?? undefined,
      new Date(normalizeTimestamp(row.created_at)),
      new Date(normalizeTimestamp(row.updated_at))
    );
  }

  async findAll(): Promise<Phrase[]> {
    const db = await getSafeDatabase();
    const rows = await db.getAllAsync<PhraseRow>(
      'SELECT * FROM phrases ORDER BY updated_at DESC'
    );
    return (rows || []).map(row => this.rowToEntity(row));
  }

  async findById(id: string): Promise<Phrase | null> {
    const db = await getSafeDatabase();
    const row = await db.getFirstAsync<PhraseRow>(
      'SELECT * FROM phrases WHERE id = ?',
      [id]
    );
    return row ? this.rowToEntity(row) : null;
  }

  async save(phrase: Phrase): Promise<void> {
    const db = await getSafeDatabase();

    // UPSERT: レースコンディション回避＆I/O削減
    await db.runAsync(
      `INSERT INTO phrases (id, text, note, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         text = excluded.text,
         note = excluded.note,
         updated_at = excluded.updated_at`,
      [phrase.id, phrase.text, phrase.note ?? null, phrase.createdAt.getTime(), phrase.updatedAt.getTime()]
    );
  }

  async delete(id: string): Promise<boolean> {
    const db = await getSafeDatabase();
    const result = await db.runAsync(
      'DELETE FROM phrases WHERE id = ?',
      [id]
    );
    return result.changes > 0;
  }

  async search(query: string): Promise<Phrase[]> {
    const db = await getSafeDatabase();
    const rows = await db.getAllAsync<PhraseRow>(
      'SELECT * FROM phrases WHERE text LIKE ? OR note LIKE ? ORDER BY updated_at DESC',
      [`%${query}%`, `%${query}%`]
    );
    return (rows || []).map(row => this.rowToEntity(row));
  }

  async findByTagId(tagId: string): Promise<Phrase[]> {
    const db = await getSafeDatabase();
    const rows = await db.getAllAsync<PhraseRow>(
      `SELECT p.* FROM phrases p
       JOIN phrase_tags pt ON p.id = pt.phrase_id
       WHERE pt.tag_id = ?
       ORDER BY p.updated_at DESC`,
      [tagId]
    );
    return (rows || []).map(row => this.rowToEntity(row));
  }
}

// シングルトンインスタンス
export const phraseRepository = new PhraseRepository();
