# 115万キロのファンノート

[公開サイト](https://katakatalab.com/higedanfan/)の編集元です。Node.js 24 で `npm ci`、`npm run dev` の順に実行して開発します。配信用のファイルを作る前に `npm run lint`、`npm test`、`npm run build` を実行します。

| 編集したいもの | 場所 |
| --- | --- |
| 画面の切り替え、曲への直リンク | `src/App.tsx` |
| トップの案内、メンバー・機能カードの表示 | `src/components/home/` |
| 診断の質問・選曲結果・シェアカード | `src/components/mood/` |
| 検定のコース・問題表示・認定証 | `src/components/quiz/`（問題そのものは `src/data/quizData.ts`） |
| 参考記事・インタビューの書誌情報と検索 | `src/data/referenceArticles.ts`、`src/components/quiz/QuizSourceArchive.tsx` |
| セトリ・投票などの個人記録と旧データの復元 | `src/hooks/useFanRecords.ts`、`src/hooks/fanRecordStorage.ts` |
| 曲順やタグなどの編集情報／録音の曲長・音域・出典 | `src/data/catalogEntries.ts` ／ `src/data/songEvidence.json` |
| 選曲・採点・検索・セトリ集計 | `src/utils/` 内の機能別モジュール |
| 楽曲ガイドの読み検索 | `src/data/songReadings.ts`、[曲ごとの確認資料](docs/song-readings.md) |

楽曲ガイドとセトリは同じ録音データを参照します。曲の情報を更新するときは該当する曲IDのデータと出典を確認してください。個人記録の保存形式を変更するときは、以前のブラウザに残っている記録の復元も確認します。

参考記事は問題・正解から独立した資料一覧です。楽曲解説と検定の明示的な参照URLを `referenceArticles.ts` にまとめ、同じ記事の分割ページ・移転前URLは `referencedUrls` で対応を保ちます。資料の追加時は掲載元の記事名・媒体・日付を確認し、公開日が不明なら `date: null` にします。作品の発売日を記事公開日に代用せず、更新日・放送日・発行日・資料発売日は `dateKind` で区別してください。参照URLの網羅と重複・日付はユニットテスト、検索・媒体選択・日付順・追加表示と320/390pxの幅はPRのブラウザ検証で確認します。

検索向けのHTMLは `scripts/generateSongPages.ts` と `vite.config.ts` から生成します。`songs/*/index.html` を直接編集せず、紹介文やデータの正本を更新して `npm run generate:song-pages` を実行してください。曲のタイトル・説明・canonicalと、JavaScript実行前にも読める曲リンクは `npm run test:browser` で検証します。

CSPは `scripts/siteHtml.ts` が正本です。本番では同じサイトの外部ファイルからだけJavaScriptを実行し、ページへ直接書くコードやイベント属性は許可しません。Viteの開発用コードとWebSocket接続は開発時だけ許可します。CSPのマーカーが残った編集用HTMLをそのまま配信せず、`npm run build` の `dist/` を使用してください。ブラウザ検証では入力・保存・復元とCSPの実効性も確認します。

依存の既知の脆弱性は `npm audit --audit-level=low` で確認し、PRのCIでも失敗時に公開を止めます。TypeScriptの `strict` を維持し、入力値はテキストとして扱い、HTMLへ直接挿入しないでください。

PR前のローカル一括確認には `npm run check`（`lint` / `test` / `build` / `audit`）、主要画面のブラウザ確認には `npm run test:ux`、全90曲×5画面幅の完全検証には `npm run test:browser` を使用します。ブランチ作成から `katakatalab-web`・`KatakataLab` を経た本番反映の標準手順は [開発・公開リリース運用手順](docs/release-workflow.md) にまとめています。
