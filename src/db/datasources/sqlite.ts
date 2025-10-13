import * as SQLite from 'expo-sqlite';
import Constants from 'expo-constants';

// 環境別データベース名
function getDatabaseName(): string {
  const env = Constants.expoConfig?.extra?.APP_ENV || (__DEV__ ? 'dev' : 'prod');
  return `lyrics_notes.${env}.db`;
}

// SQLiteデータソース（シングルトン）
export class SQLiteDataSource {
  private static instance: SQLiteDataSource;
  private db: SQLite.SQLiteDatabase | null = null;

  private constructor() {}

  static getInstance(): SQLiteDataSource {
    if (!SQLiteDataSource.instance) {
      SQLiteDataSource.instance = new SQLiteDataSource();
    }
    return SQLiteDataSource.instance;
  }

  async getDatabase(): Promise<SQLite.SQLiteDatabase> {
    if (!this.db) {
      this.db = await SQLite.openDatabaseAsync(getDatabaseName());
    }
    return this.db;
  }
}

export const sqliteDataSource = SQLiteDataSource.getInstance();