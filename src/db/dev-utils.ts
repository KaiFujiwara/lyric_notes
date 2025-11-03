// 開発用のデータベースユーティリティ

import { sqliteDataSource } from './datasources/sqlite';
import * as SQLite from 'expo-sqlite';
import Constants from 'expo-constants';

// 環境別データベース名取得（datasources/sqlite.tsと同じロジック）
function getDatabaseName(): string {
  const env = Constants.expoConfig?.extra?.APP_ENV || (__DEV__ ? 'dev' : 'prod');
  return `lyrics_notes.${env}.db`;
}

/**
 * データベースファイルを完全削除（接続前に実行）
 * IMPORTANT: initializeDatabase()より前に呼ぶこと
 */
export async function forceDeleteDatabaseBeforeInit(): Promise<void> {
  if (!__DEV__) {
    console.warn('forceDeleteDatabaseBeforeInit() is only available in development mode');
    return;
  }

  try {
    const dbName = getDatabaseName();
    console.log(`🗑️  Force deleting database: ${dbName}`);

    // SQLiteのdeleteAsync APIを使用（ファイルシステムに直接アクセスせず削除）
    await SQLite.deleteDatabaseAsync(dbName);

    console.log('✅ Database file force-deleted successfully');
  } catch (error: any) {
    // データベースが存在しない場合もエラーになるが、問題ない
    if (error?.message?.includes('not found') || error?.message?.includes('does not exist')) {
      console.log('ℹ️  Database file does not exist, nothing to delete');
    } else {
      console.warn('⚠️  Failed to force-delete database (continuing anyway):', error);
    }
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
