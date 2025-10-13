# データ管理設計書

## 概要
Lyrics Notesアプリのデータ管理戦略と実装方針

## データ管理フェーズ

### Phase 1: ローカルストレージ (MVP)
**目的**: ログイン不要で即座に使い始められる

#### 技術選定
- **SQLite** (expo-sqlite)
  - 理由: React Nativeで実績豊富、SQLによる柔軟なクエリが可能
  - Alternative: Realm (より高速だが学習コスト高)

#### データ永続化
```typescript
// ローカルDBのパス
const DB_NAME = 'lyrics_notes.db';

// データ構造
interface LocalProject {
  id: string;           // UUID v4
  title: string;
  createdAt: number;    // Unix timestamp
  updatedAt: number;
  isDeleted: boolean;   // 論理削除フラグ
}

interface LocalVersion {
  id: string;
  projectId: string;
  section: 'A' | 'B' | 'サビ' | 'その他';
  body: string;
  orderIndex: number;
  createdAt: number;
  updatedAt: number;
}

interface LocalAnalysis {
  id: string;
  versionId: string;
  lineIndex: number;
  moraCount: number;    // 音数
  rhymeTail: string;    // 韻の末尾母音
}
```

#### バックアップ戦略
- 自動エクスポート: 設定画面からJSONファイルとして出力
- 共有機能: iOS/Android標準の共有シートでバックアップ送信

### Phase 2: クラウド同期 (将来実装)

#### 技術選定
- **Supabase** (PostgreSQL + リアルタイム同期)
  - 理由: 認証機能込み、RLSによるセキュリティ、リアルタイム同期

#### 移行戦略
```typescript
// ハイブリッドモード
interface SyncableProject extends LocalProject {
  cloudId?: string;      // Supabase上のID
  syncStatus: 'local' | 'synced' | 'pending';
  lastSyncAt?: number;
}
```

#### 同期ロジック
1. **初回ログイン時**
   - ローカルデータを一括アップロード
   - cloudIdをローカルDBに保存

2. **通常同期**
   - オフライン時: ローカル優先で保存、syncStatus='pending'
   - オンライン復帰時: pending分を同期
   - 競合解決: タイムスタンプベース (最新優先)

## データベース設計

### ローカルDB (SQLite)
```sql
-- プロジェクトテーブル
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  is_deleted INTEGER DEFAULT 0,
  cloud_id TEXT,
  sync_status TEXT DEFAULT 'local'
);

-- バージョンテーブル
CREATE TABLE versions (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  section TEXT NOT NULL,
  body TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- 解析結果テーブル
CREATE TABLE analyses (
  id TEXT PRIMARY KEY,
  version_id TEXT NOT NULL,
  line_index INTEGER NOT NULL,
  mora_count INTEGER NOT NULL,
  rhyme_tail TEXT,
  FOREIGN KEY (version_id) REFERENCES versions(id)
);

-- インデックス
CREATE INDEX idx_projects_updated ON projects(updated_at);
CREATE INDEX idx_versions_project ON versions(project_id);
CREATE INDEX idx_analyses_version ON analyses(version_id);
```

### クラウドDB (Supabase/PostgreSQL)
```sql
-- ユーザーテーブル (Supabase Auth連携)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- プロジェクトテーブル
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE,
  local_id TEXT  -- ローカルDBとの紐付け
);

-- RLS (Row Level Security)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own projects"
  ON projects
  FOR ALL
  USING (auth.uid() = user_id);
```

## 実装優先順位

### MVP実装 (Phase 1)
1. SQLiteの初期化処理
2. 基本CRUD操作 (Project, Version)
3. 自動保存機能 (デバウンス付き)
4. エクスポート/インポート機能

### 将来実装 (Phase 2)
1. Supabaseセットアップ
2. 認証フロー実装
3. 同期エンジン開発
4. 競合解決UI

## セキュリティ考慮事項

### ローカルストレージ
- SQLiteファイルは端末の安全な領域に保存
- エクスポート時のみ外部アクセス可能

### クラウド同期
- Supabase RLSによるユーザー単位のアクセス制御
- HTTPSによる通信暗号化
- JWTトークンによる認証

## パフォーマンス最適化

### ローカル処理
- インデックスによるクエリ高速化
- 大量データ時はページネーション
- 解析結果のキャッシュ

### 同期処理
- バッチ同期による通信回数削減
- 差分同期による転送量削減
- バックグラウンド同期

## エラーハンドリング

### ローカルDB
- トランザクション処理によるデータ整合性確保
- 自動リトライ機構
- エラーログの記録

### 同期エラー
- オフライン時は自動的にローカルモードへ
- 同期失敗時はリトライキューへ
- ユーザーへの適切なフィードバック