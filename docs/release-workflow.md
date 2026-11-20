# 開発・公開リリース運用手順

`115万キロのファンノート` の変更は、この編集元リポジトリから公開用ビルド・本番ロックの3段階で安全に本番反映します。

## 1. 日常の開発・Git運用（このリポジトリ `katakata0522/higedanfan`）

1. 最新の `main` からテーマごとに小さなブランチを作成します（例: `feat/add-song-xxx`、`fix/quiz-typo`）。
2. 変更後、ローカルで品質チェックを実行します。
   - 一括確認（型チェック・単体テスト・ビルド・依存脆弱性監査）: `npm run check`
   - 主要UXブラウザ確認（高速版）: `npm run test:ux`
   - 全90曲×5ビューポート＋CSP/SEO完全検証: `npm run test:browser`
3. GitHub へプッシュして Pull Request を作成し、`verify` ワークフローの通過を確認してから `main` へマージします。

## 2. 公開ビルド同期（`katakata0522/katakatalab-web`）

1. `higedanfan` の `main` で `npm ci && npm run lint && npm test && npm run build && npm run test:browser` を確認したうえで、`dist/` の `index.html`、`third-party-licenses.txt`、各コーナーディレクトリ（`discography/`, `vocal-range/`, `tour-archive/`, `sacred-map/`, `setlist/`, `mood/`, `quiz/`, `quiz-archive/`）、`songs/*/index.html`、`assets/*` を `katakatalab-web` の `higedanfan/` へ反映します。
   - **重要**: 旧HTMLタブを開いたままの利用者が遅延読み込みできるよう、`higedanfan/assets/` の既存ハッシュ付きアセットファイルは上書き以外削除せず維持します。
   - **重要**: `robots.txt` と `sitemap.xml` は `katakatalab-web` のルート側で一括管理しているため、`higedanfan/` サブディレクトリには置かないでください。
   - `brand/` に新しい画像やバッジ SVG を追加した場合は、Public の `.gitignore` と `qa/published-dependencies.json`（SHA-256 / サイズ / CI用ダミー指定）へ登録します。
   - `brand/fonts/` の WOFF2 は、[Google Fonts の原本](https://github.com/google/fonts/tree/cc5661d43cd4f9aad5567033a8e15ca28dc35c86/ofl)から作成した Kiwi Maru Medium と Noto Sans JP のサブセットです。更新時は同梱の OFL と一緒に Private の原本・`privateOverlay` に先行登録し、Public の依存台帳には同じファイルの SHA-256 とサイズを登録します。
2. `docs/higedanfan-release.md` のソースコミットSHA・変更概要を更新し、`boundary`・`education-no-tracking`・`root quality`・SEO検査を通過させて `main` へマージします。

## 3. 本番デプロイ（`katakata0522/KatakataLab`）

1. Private リポジトリの `config/public-source-lock.json` で `publicSha` を `katakatalab-web` の確定 `main` コミットへ更新します。
2. `brand/` の実画像・バッジを追加/変更した場合のみ、Private 側 `higedanfan/` へ実ファイルを配置して `privateOverlay` の SHA-256 を更新します。
3. PR チェック（`quality` / `private-source-inputs` / `release-contract`）の通過後に `main` へマージすると、GitHub Actions（`Deploy KatakataLab to Xserver`）が本番サーバーへ自動配信します。
