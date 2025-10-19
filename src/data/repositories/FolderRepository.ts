// Repository implementation
import { Folder } from '@/src/domain/entities/Folder';
import { getSafeDatabase } from '@/src/db/runtime';
import { normalizeTimestamp } from '@/src/util/timestamp';

// Private型定義: DBの生データ構造（snake_case）
type FolderRow = {
  id: string;
  name: string;
  order_index: number;
  created_at: number; // INTEGER型（UNIX timestamp）
  updated_at: number; // INTEGER型（UNIX timestamp）
};

export class FolderRepository {
  // Private: DBの行データをドメインエンティティに変換
  private rowToEntity(row: FolderRow): Folder {
    return new Folder(
      row.id,
      row.name,
      row.order_index,
      new Date(normalizeTimestamp(row.created_at)),
      new Date(normalizeTimestamp(row.updated_at))
    );
  }

  async findAll(): Promise<Folder[]> {
    const db = await getSafeDatabase();
    const rows = await db.getAllAsync<FolderRow>(
      'SELECT * FROM folders ORDER BY order_index'
    );
    return (rows || []).map(row => this.rowToEntity(row));
  }

  async findById(id: string): Promise<Folder | null> {
    const db = await getSafeDatabase();
    const row = await db.getFirstAsync<FolderRow>(
      'SELECT * FROM folders WHERE id = ?',
      [id]
    );
    return row ? this.rowToEntity(row) : null;
  }

  async save(folder: Folder): Promise<void> {
    const db = await getSafeDatabase();

    // UPSERT: レースコンディション回避＆I/O削減
    await db.runAsync(
      `INSERT INTO folders (id, name, order_index, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         name = excluded.name,
         order_index = excluded.order_index,
         updated_at = excluded.updated_at`,
      [
        folder.id,
        folder.name,
        folder.orderIndex,
        folder.createdAt.getTime(),
        folder.updatedAt.getTime()
      ]
    );
  }

  async delete(id: string): Promise<boolean> {
    const db = await getSafeDatabase();

    await db.withTransactionAsync(async () => {
      // フォルダ内のプロジェクトをフォルダなしに変更
      await db.runAsync(
        'UPDATE projects SET folder_id = NULL WHERE folder_id = ?',
        [id]
      );

      // フォルダを削除
      await db.runAsync(
        'DELETE FROM folders WHERE id = ?',
        [id]
      );
    });

    return true;
  }

  async reorder(folderIds: string[]): Promise<void> {
    const db = await getSafeDatabase();

    await db.withTransactionAsync(async () => {
      for (let i = 0; i < folderIds.length; i++) {
        await db.runAsync(
          'UPDATE folders SET order_index = ? WHERE id = ?',
          [i, folderIds[i]]
        );
      }
    });
  }
}

// シングルトンインスタンス
export const folderRepository = new FolderRepository();
