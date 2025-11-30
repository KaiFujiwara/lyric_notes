# Lyrics Notes

歌詞制作に特化したマルチプラットフォーム向けメモアプリ。音数カウントや韻チェックなどラップ／ポップス制作で欲しくなる補助機能を、小さなチームでも運用しやすいモノレポ構成で実装しています。

## 🧭 プロダクト概要
- その場で歌詞の断片やメモをストックし、セクションごとに整理
- 音数カウントや韻チェックなど、歌詞制作特有の検証作業をアプリ内で完結
- Expo (React Native) を採用し、iOS / Android / Web (将来) を同一コードで展開

## 🏛 アーキテクチャ
DDD/Clean Architecture をベースにしつつ、個人開発でも扱いやすい 3 層構成に最適化しています。

```
┌───────────────────────────────┐
│ Presentation (apps/mobile)        │ Expo Router, Hooks, UI
└──────────────┬────────────────┘
               │ import
┌──────────────▼────────────────┐
│ Core (packages/core)            │ ドメイン + ユースケース + 共通ユーティリティ
└──────────────┬────────────────┘
               │ 接続
┌──────────────▼────────────────┐
│ Infrastructure (apps/mobile/src) │ Firebase (Firestore) Repositories
└───────────────────────────────┘
```

将来 Web クライアントを追加する場合も、UI だけを別アプリとして増やし `@lyrics-notes/core` を共通利用する方針です。

## 📁 モノレポ構成
```
lyrics-notes/
├── apps/
│   ├── mobile/            # Expo アプリ (React Native)
│   │   ├── app/           # Expo Router 画面
│   │   ├── components/    # UI コンポーネント
│   │   └── src/
│   │       ├── data/      # Repository 実装 (Firestore)
│   │       └── lib/       # Firebase 初期化など
│   └── firebase/          # Firebase Emulator & ルール
│       ├── firebase.json
│       ├── firestore.rules
│       └── firestore.indexes.json
├── packages/
│   └── core/              # ドメイン + ユースケース + Utils
│       ├── src/features/projects/domain
│       ├── src/features/projects/application
│       └── src/utils
├── __tests__/             # Node 上で動かすユニット/統合テスト
├── package.json           # ルートスクリプト & ワークスペース設定
└── tsconfig.base.json     # 共通 TypeScript 設定
```

## 🧰 技術スタック
| レイヤー | 主な技術 |
| --- | --- |
| Mobile App | Expo SDK 54, React Native 0.81, Expo Router, NativeWind |
| Storage / Backend | Firebase (Auth / Firestore) |
| Language / Tooling | TypeScript, Jest, ts-jest, EAS Build |
| Shared Logic | `@lyrics-notes/core` (uuid, strict TS) |

## 🗂 ワークスペース & npm Scripts
| コマンド (ルート) | 内容 |
| --- | --- |
| `npm run dev` | `apps/mobile` の Expo サーバーを起動 |
| `npm run firebase:emulator` | `apps/firebase` から Firebase Emulator Suite を起動 |
| `npm run dev:all` | 上記 2 つを `concurrently` で並列起動 |
| `npm run test` | すべてのワークスペースで `test` スクリプトを (存在すれば) 実行 |
| `npm run typecheck` | `tsc --noEmit` を各ワークスペースで実行 |
| `npm run lint` | Lint スクリプトを一括実行 |

> 個別に依存を追加したい場合は `npm install <pkg> -w @lyrics-notes/mobile` のように `-w` フラグを付けてください。ルートで `npm install` を実行すると `package-lock.json` が全体と同期します。

## 🚀 セットアップ手順
1. リポジトリ取得
   ```bash
   git clone https://github.com/somedon/lyrics-notes.git
   cd lyrics-notes
   ```
2. 依存関係をインストール
   ```bash
   npm install
   ```
3. 環境変数を設定
   ```bash
   cp apps/mobile/.env.example apps/mobile/.env
   # apps/mobile/.env に Firebase プロジェクト情報を記入
   ```
4. 開発サーバーを起動
   - Expo のみ: `npm run dev`
   - Firebase Emulator のみ: `npm run firebase:emulator`
   - 両方まとめて: `npm run dev:all`

Expo Go アプリで QR コードを読み込むか、iOS シミュレータ / Android Emulator を使用して接続します。

## 🔐 Firebase
- 設定ファイルは `apps/firebase` に集約 (Git 管理しやすい)
- ルートから `npm run firebase:emulator` を実行すると Firestore/Auth Emulator を起動 (UI: http://localhost:4000)
- Firestore データモデル
  ```
  users/{userId}/
    ├─ projects/{projectId}
    │   ├─ sections (subcollection)
    │   │   └─ lines (subcollection)
    ├─ folders/{folderId}
    ├─ genres/{genreId}
    ├─ tags/{tagId}
    └─ phrases/{phraseId}
  ```
- 本番ルール (`firestore.rules`)
  ```javascript
  match /users/{userId}/{document=**} {
    allow read, write: if request.auth != null && request.auth.uid == userId;
  }
  ```

## 🧪 テスト & 型チェック
```bash
npm run test         # Jest (apps/mobile) など、定義済みワークスペースのみ実行
npm run typecheck    # すべてのワークスペースで tsc --noEmit
npx tsc --noEmit     # 単体実行したいとき
```

## 📱 ビルド
```bash
npm run build:ios:dev   # EAS dev profile
npm run build:ios:prod  # EAS production profile
```

## 📦 機能ロードマップ (抜粋)
- [x] プロジェクト / セクション管理
- [x] 行単位の歌詞入力
- [ ] 音数カウント (自動計算)
- [ ] 韻チェック / フレーズストック / タグ管理
- [ ] 検索・テンプレート・コラボレーション
- [ ] Web クライアント

## 📏 コーディング規約
- TypeScript Strict モード、有効な型付けを必須
- React Components は関数コンポーネント + Hooks、Props は PascalCase ファイル名
- NativeWind (Tailwind) を優先し、インラインスタイルは最小限
- ドメインロジックは `@lyrics-notes/core` で完結させ、アプリ層から直接 Firebase SDK を触らない
