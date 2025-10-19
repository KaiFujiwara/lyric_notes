// 初期スキーマの作成

const migration = {
  name: '002_create_initial_schema',
  statements: [
  // フォルダテーブル
  `CREATE TABLE IF NOT EXISTS folders (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL CHECK(length(name) >= 1 AND length(name) <= 100),
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`,

  // ジャンルテーブル
  `CREATE TABLE IF NOT EXISTS genres (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL CHECK(length(name) >= 1 AND length(name) <= 50),
    template_sections TEXT NOT NULL DEFAULT '[]',
    is_preset INTEGER NOT NULL DEFAULT 0 CHECK(is_preset IN (0, 1)),
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`,

  // タグテーブル
  `CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL CHECK(length(name) >= 1 AND length(name) <= 30),
    color TEXT CHECK(color IS NULL OR (color GLOB '#[0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f]' OR color GLOB '#[0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f]')),
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`,

  // プロジェクトテーブル
  `CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL CHECK(length(title) >= 1 AND length(title) <= 200),
    folder_id TEXT,
    genre_id TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    is_deleted INTEGER NOT NULL DEFAULT 0 CHECK(is_deleted IN (0, 1)),
    FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL,
    FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE SET NULL
  )`,

  // セクションテーブル
  `CREATE TABLE IF NOT EXISTS sections (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    name TEXT NOT NULL CHECK(length(name) >= 1 AND length(name) <= 50),
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
  )`,

  // 行テーブル
  `CREATE TABLE IF NOT EXISTS lines (
    id TEXT PRIMARY KEY,
    section_id TEXT NOT NULL,
    text TEXT NOT NULL DEFAULT '',
    line_index INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
  )`,

  // フレーズテーブル
  `CREATE TABLE IF NOT EXISTS phrases (
    id TEXT PRIMARY KEY,
    text TEXT NOT NULL CHECK(length(text) >= 1 AND length(text) <= 500),
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`,

  // プロジェクト-タグ中間テーブル
  `CREATE TABLE IF NOT EXISTS project_tags (
    project_id TEXT NOT NULL,
    tag_id TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    PRIMARY KEY (project_id, tag_id),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
  )`,

  // フレーズ-タグ中間テーブル
  `CREATE TABLE IF NOT EXISTS phrase_tags (
    phrase_id TEXT NOT NULL,
    tag_id TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    PRIMARY KEY (phrase_id, tag_id),
    FOREIGN KEY (phrase_id) REFERENCES phrases(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
  )`,

  // インデックス作成
  `CREATE INDEX IF NOT EXISTS idx_projects_folder_id ON projects(folder_id)`,
  `CREATE INDEX IF NOT EXISTS idx_projects_genre_id ON projects(genre_id)`,
  `CREATE INDEX IF NOT EXISTS idx_projects_is_deleted ON projects(is_deleted)`,
  `CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_sections_project_id_order ON sections(project_id, order_index)`,
  `CREATE INDEX IF NOT EXISTS idx_lines_section_id_index ON lines(section_id, line_index)`,
  `CREATE INDEX IF NOT EXISTS idx_project_tags_project_id ON project_tags(project_id)`,
  `CREATE INDEX IF NOT EXISTS idx_project_tags_tag_id ON project_tags(tag_id)`,
  `CREATE INDEX IF NOT EXISTS idx_phrase_tags_phrase_id ON phrase_tags(phrase_id)`,
  `CREATE INDEX IF NOT EXISTS idx_phrase_tags_tag_id ON phrase_tags(tag_id)`,
  `CREATE INDEX IF NOT EXISTS idx_folders_order_index ON folders(order_index)`
  ]
};

export default migration;