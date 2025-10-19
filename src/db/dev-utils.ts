// 開発用のデータベースユーティリティ

import { sqliteDataSource } from './datasources/sqlite';

/**
 * 開発用: データベースを完全にクリア
 * 全てのテーブルを削除して初期状態に戻す
 */
export async function clearDatabase(): Promise<void> {
  if (!__DEV__) {
    console.warn('clearDatabase() is only available in development mode');
    return;
  }

  const db = await sqliteDataSource.getDatabase();

  console.log('🗑️  Clearing database...');

  try {
    await db.withTransactionAsync(async () => {
      // 外部キー制約を一時的に無効化
      await db.execAsync('PRAGMA foreign_keys = OFF');

      // 全テーブル一覧を取得
      const tables = await db.getAllAsync<{ name: string }>(
        `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`
      );

      // 全テーブルを削除
      for (const table of tables) {
        console.log(`  Dropping table: ${table.name}`);
        await db.execAsync(`DROP TABLE IF EXISTS ${table.name}`);
      }

      // 外部キー制約を再度有効化
      await db.execAsync('PRAGMA foreign_keys = ON');
    });

    console.log('✅ Database cleared successfully');
    console.log('💡 Next app startup will run all migrations from scratch');
  } catch (error) {
    console.error('❌ Failed to clear database:', error);
    throw error;
  }
}

/**
 * 開発用: データベースの状態を確認
 * テーブル一覧とマイグレーション履歴を表示
 */
export async function inspectDatabase(): Promise<void> {
  if (!__DEV__) {
    console.warn('inspectDatabase() is only available in development mode');
    return;
  }

  const db = await sqliteDataSource.getDatabase();

  console.log('🔍 Database inspection:');

  try {
    // テーブル一覧
    const tables = await db.getAllAsync<{ name: string, sql: string }>(
      `SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name`
    );

    console.log('\n📋 Tables:');
    for (const table of tables) {
      const count = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM ${table.name}`
      );
      console.log(`  ${table.name}: ${count?.count || 0} rows`);
    }

    // マイグレーション履歴
    try {
      const migrations = await db.getAllAsync<{ name: string, applied_at: number }>(
        'SELECT name, applied_at FROM migrations ORDER BY applied_at'
      );

      console.log('\n📜 Migration history:');
      if (migrations.length === 0) {
        console.log('  No migrations applied yet');
      } else {
        for (const migration of migrations) {
          const date = new Date(migration.applied_at).toISOString();
          console.log(`  ${migration.name} (${date})`);
        }
      }
    } catch {
      console.log('\n📜 Migration history: migrations table not found');
    }

    console.log('\n✅ Inspection complete');
  } catch (error) {
    console.error('❌ Failed to inspect database:', error);
    throw error;
  }
}

/**
 * 開発用: データベースをクリアしてマイグレーションを再実行
 */
export async function resetDatabase(): Promise<void> {
  if (!__DEV__) {
    console.warn('resetDatabase() is only available in development mode');
    return;
  }

  console.log('🔄 Resetting database...');

  await clearDatabase();

  // マイグレーションは次回のアプリ起動時に自動実行される
  console.log('✅ Database reset complete');
  console.log('💡 Restart the app to apply all migrations');
}