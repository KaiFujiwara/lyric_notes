# データモデル（Firestore）

アプリで扱うドメインエンティティと Firestore スキーマを1枚に集約する。

## ドメインエンティティ

- **Folder**: プロジェクトをまとめるフォルダ。`id`, `name`, `orderIndex`, `createdAt`, `updatedAt`
- **Project**: 曲単位のコンテナ。`id`, `title`, `folderId?`, `genreId?`, `isDeleted`, `createdAt`, `updatedAt`
- **Section**: 曲内のパート（Aメロ/サビなど）。`id`, `projectId`, `name`, `orderIndex`, `createdAt`, `updatedAt`
- **Line**: 歌詞1行とその解析。`id`, `sectionId`, `text`, `lineIndex`, `moraCount?`, `rhymeTail?`, `createdAt`, `updatedAt`
- **Phrase**: プロジェクト外のストックメモ。`id`, `text`, `note?`, `tagIds[]`, `createdAt`, `updatedAt`
- **Tag**: フレーズに付けるラベル。`id`, `name`, `color?`, `createdAt`, `updatedAt` （フレーズのみ紐付け）
- **Genre**: ジャンル別のセクション構成テンプレ。`id`, `name`, `description?`, `templateSections: { name, orderIndex, defaultLineCount? }[]`, `createdAt`, `updatedAt`

## コレクションツリー

```
users/{userId}
 ├─ profile
 ├─ folders/{folderId}
 ├─ tags/{tagId}
 │    └─ phraseRefs/{phraseId}
 ├─ phrases/{phraseId}
 ├─ projects/{projectId}
 │    ├─ sections/{sectionId}
 │    │    └─ lines/{lineId}
 └─ genres/{genreId}            # ユーザーが保持するジャンルテンプレ
genre_presets/{presetId}        # 運営マスタ（別コレクション）
```
運営マスタのプリセットはユーザー配下ではなく、別コレクションで管理する（例: `/genre_presets/{presetId}`）。読み取り専用で、ユーザーには自動でコピーしない。

## ドキュメント仕様（主フィールド）

- `folders/{folderId}`: `id`, `name`, `orderIndex`, `createdAt`, `updatedAt`
- `projects/{projectId}`: `id`, `title`, `titleLower`, `folderId|null`, `genreId|null`, `isDeleted`, `createdAt`, `updatedAt`, `deletedAt|null`
- `projects/{projectId}/sections/{sectionId}`: `id`, `userId`, `projectId`, `name`, `orderIndex`, `createdAt`, `updatedAt`
- `projects/{projectId}/sections/{sectionId}/lines/{lineId}`: `id`, `userId`, `projectId`, `sectionId`, `text`, `lineIndex`, `moraCount|null`, `rhymeTail|null`, `createdAt`, `updatedAt`
- `tags/{tagId}`: `id`, `name`, `nameLower`, `color|null`, `createdAt`, `updatedAt`
- `phrases/{phraseId}`: `id`, `text`, `note|null`, `tagIds[]`, `createdAt`, `updatedAt`
- `tags/{tagId}/phraseRefs/{phraseId}`: `phraseId`, `taggedAt`
- `genres/{genreId}`: `id`, `name`, `description|null`, `templateSections[]`, `createdAt`, `updatedAt`（ユーザー配下。元マスタとの紐付けは保持しない）
- `/genre_presets/{presetId}`（運営マスタ）: `id`, `name`, `description|null`, `templateSections[]`, `revision`（数値や semver）, `createdAt`, `updatedAt`（`userId` は持たない）

 collectionGroup で検索するドキュメント（sections, lines など必要なものだけ）には `userId` を保持する。

## クエリとインデックス（必須）

※ パスはすべて `users/{userId}/...` を前提に、表では簡略表記しています。

| 用途 | パス | クエリ | インデックス |
|------|------|--------|--------------|
| プロジェクト一覧 | `projects` | `where(isDeleted==false).orderBy(updatedAt, desc)` | `isDeleted ASC, updatedAt DESC` |
| プロジェクト検索 | `projects` | `where(isDeleted==false).orderBy(titleLower).startAt(q).endAt(q+'\uf8ff')` | `isDeleted ASC, titleLower ASC` |
| セクション取得 | `projects/{id}/sections` | `orderBy(orderIndex, asc)` | 既定 |
| 行取得 | `projects/{id}/sections/{sid}/lines` | `orderBy(lineIndex, asc)` | 既定 |
| タグ一覧/検索 | `tags` | `orderBy(nameLower)` / `startAt` | `nameLower ASC` |
| フレーズ一覧 | `phrases` | `orderBy(updatedAt, desc)` | 既定 |
| タグ別フレーズ一覧 | `tags/{id}/phraseRefs` | `orderBy(taggedAt, desc)` | 既定 |

インデックスは Firebase Console で作成し、`apps/firebase/firestore.indexes.json` にエクスポートする。

## ジャンルテンプレ（運営プリセット）の運用
- 運営マスタ: `/genre_presets` で管理し、`userId` を持たない。更新は追記＋`revision` 更新で履歴を残す。
- ユーザー側: プロジェクト作成時などに「マスタ」リストと「自分のテンプレ」リストを並べて選択できるようにする。編集したい場合はマスタからコピーしてユーザー配下に保存。マスタ更新は自動反映しない。
- UI例: ジャンル選択ダイアログで「プリセット（マスタ）」「自分のテンプレ」をセクション分け表示。マスタは常に参照専用で残し、ユーザー版は自由に編集。

### userId フィールドの扱い
- collectionGroup クエリが必要なもの（sections, lines など）にのみ `userId` を持たせる。
- ユーザー配下で完結するコレクション（projects, folders, phrases, tags, genres, phraseRefs など）はパスでスコープされるため `userId` を持たせない。
- 全ユーザー横断の集計をしたい場合は、別途 Cloud Functions で集計コレクションを作るか、admin SDK で path を辿って処理する。

## フレーズのタグ検索とプロジェクトへの引用

- タグでフレーズを探す: `tags/{tagId}/phraseRefs` で phraseId を取得 → `phrases` 本体を `where(documentId(), "in", chunk)` で10件ずつフェッチ（または phraseRefs の updatedAt/assignedAt で並べる）。
- UIフロー案: プロジェクト編集画面の「フレーズを挿入」モーダルでタグフィルタを実行 → 選択したフレーズの `text` を行として挿入する。プロジェクトにタグを付けなくてもタグ軸検索が可能。

## セキュリティルール（骨子）

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // 運営プリセット（読み取り専用）
    match /genre_presets/{presetId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```
