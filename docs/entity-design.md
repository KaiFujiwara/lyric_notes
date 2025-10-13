# エンティティ設計書

## 概要
Lyrics Notesアプリケーションのドメインエンティティ設計

## エンティティ一覧

### 1. Folder（フォルダ）
**目的**: プロジェクト（曲）をグループ化して整理

**属性**:
- `id: string` - 一意識別子（UUID）
- `name: string` - フォルダ名
- `orderIndex: number` - 表示順序
- `createdAt: Date` - 作成日時
- `updatedAt: Date` - 更新日時

**ビジネスルール**:
- フォルダ名は必須
- フォルダは入れ子にしない（フラット構造）
- 削除時は配下のプロジェクトをフォルダなしに変更

### 2. Project（プロジェクト/曲）
**目的**: 楽曲単位での歌詞管理

**属性**:
- `id: string` - 一意識別子（UUID）
- `folderId?: string` - 所属フォルダID（null可）
- `title: string` - 曲タイトル
- `createdAt: Date` - 作成日時
- `updatedAt: Date` - 更新日時
- `isDeleted: boolean` - 論理削除フラグ

**ビジネスルール**:
- タイトルは必須
- フォルダに属さないプロジェクトも許可
- 論理削除（完全削除は別途）

### 3. Section（セクション）
**目的**: 曲の各セクション（Aメロ、サビなど）の管理

**属性**:
- `id: string` - 一意識別子（UUID）
- `projectId: string` - 所属プロジェクトID
- `type: SectionType` - セクションタイプ
- `name?: string` - カスタムセクション名（例: "Aメロ2"）
- `orderIndex: number` - プロジェクト内での表示順序
- `createdAt: Date` - 作成日時
- `updatedAt: Date` - 更新日時

**セクションタイプ定義**:
```typescript
type SectionType =
  | 'intro'      // イントロ
  | 'verse'      // Aメロ
  | 'pre_chorus' // Bメロ
  | 'chorus'     // サビ
  | 'bridge'     // Cメロ/ブリッジ
  | 'outro'      // アウトロ
  | 'other'      // その他
```

**ビジネスルール**:
- 1つのプロジェクトに複数のセクション
- 同じセクションタイプを複数持てる（Aメロ1、Aメロ2など）
- nameでカスタマイズ可能
- セクションは独立したエンティティ（作成・編集・削除が可能）

### 4. Line（行）
**目的**: 歌詞の1行単位での管理と解析

**属性**:
- `id: string` - 一意識別子（UUID）
- `sectionId: string` - 所属セクションID
- `text: string` - 歌詞テキスト
- `lineIndex: number` - セクション内での行番号
- `moraCount?: number` - 音数（解析結果）
- `rhymeTail?: string` - 韻の末尾母音（解析結果）

**ビジネスルール**:
- 空行も1つのLineとして扱う
- 行番号は0から開始
- 解析結果は後から付与可能（null許容）

### 5. Tag（タグ）
**目的**: フォルダ、プロジェクト、フレーズの分類・検索用ラベル

**属性**:
- `id: string` - 一意識別子（UUID）
- `name: string` - タグ名（例: "失恋", "雨", "夏"）
- `color?: string` - 表示色（HEXカラーコード）
- `createdAt: Date` - 作成日時
- `updatedAt: Date` - 更新日時

**ビジネスルール**:
- タグ名は一意（重複不可）
- タグは編集・削除可能
- 削除時は紐付けのみ解除（データは残る）
- フォルダ、プロジェクト、フレーズに紐付け可能

### 6. Phrase（フレーズ）
**目的**: 曲と独立したフレーズメモの管理

**属性**:
- `id: string` - 一意識別子（UUID）
- `text: string` - フレーズテキスト
- `note?: string` - メモ・備考
- `createdAt: Date` - 作成日時
- `updatedAt: Date` - 更新日時

**ビジネスルール**:
- プロジェクトに属さない独立したメモ
- 後からプロジェクトに取り込み可能
- タグ付けによる分類が可能

### 7. Analysis（解析結果）※検討中
**目的**: 行ごとの詳細な解析結果の保存

**現状**: Lineエンティティに統合するか、別エンティティとするか検討中

**候補となる解析情報**:
- 音数カウント
- 韻判定（頭韻、脚韻、内部韻）
- 単語分解
- 読み仮名

## 関連エンティティ（多対多の関係）

### FolderTag（フォルダ-タグ関連）
**属性**:
- `folderId: string` - フォルダID
- `tagId: string` - タグID

### ProjectTag（プロジェクト-タグ関連）
**属性**:
- `projectId: string` - プロジェクトID
- `tagId: string` - タグID

### PhraseTag（フレーズ-タグ関連）
**属性**:
- `phraseId: string` - フレーズID
- `tagId: string` - タグID

## エンティティ関係図

```
Folder
├── Project[]（0..n）
│   ├── Section[]（1..n）
│   │   └── Line[]（0..n）
│   │       └── Analysis?（0..1）※検討中
│   └── Tag[]（多対多）
└── Tag[]（多対多）

Phrase（独立）
└── Tag[]（多対多）

Tag（独立）
├── Folder[]（多対多）
├── Project[]（多対多）
└── Phrase[]（多対多）
```

## データベース設計との対応

### テーブル構造
```sql
-- フォルダ
CREATE TABLE folders (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- プロジェクト
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  folder_id TEXT,
  title TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  is_deleted INTEGER DEFAULT 0,
  FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL
);

-- セクション
CREATE TABLE sections (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('intro', 'verse', 'pre_chorus', 'chorus', 'bridge', 'outro', 'other')),
  name TEXT,
  order_index INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- 行
CREATE TABLE lines (
  id TEXT PRIMARY KEY,
  section_id TEXT NOT NULL,
  text TEXT NOT NULL,
  line_index INTEGER NOT NULL,
  mora_count INTEGER,
  rhyme_tail TEXT,
  FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE,
  UNIQUE(section_id, line_index)
);

-- タグ
CREATE TABLE tags (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  color TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- フレーズ
CREATE TABLE phrases (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  note TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- プロジェクト-タグ関連
CREATE TABLE project_tags (
  project_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  PRIMARY KEY (project_id, tag_id),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- フォルダ-タグ関連
CREATE TABLE folder_tags (
  folder_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  PRIMARY KEY (folder_id, tag_id),
  FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- フレーズ-タグ関連
CREATE TABLE phrase_tags (
  phrase_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  PRIMARY KEY (phrase_id, tag_id),
  FOREIGN KEY (phrase_id) REFERENCES phrases(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
```

## 今後の拡張予定

### Phase 2
- **Template**: セクション構成のテンプレート
- **Rule**: 韻ルールや音数制限の定義
- **Bookmark**: お気に入りのプロジェクト/フレーズ

### Phase 3
- **Collaboration**: 共同編集のためのユーザー管理
- **Comment**: 行ごとのコメント・メモ
- **Revision**: より詳細なバージョン管理（Git的な）
- **Export**: 歌詞の各種フォーマットエクスポート