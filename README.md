# 115万キロのファンノート

[公開サイト](https://katakatalab.com/higedanfan/)の編集元です。Node.js 24 で `npm ci`、`npm run dev` の順に実行して開発します。配信用のファイルを作る前に `npm run lint`、`npm test`、`npm run build` を実行します。

| 編集したいもの | 場所 |
| --- | --- |
| 画面の切り替え、曲への直リンク | `src/App.tsx` |
| トップの案内、メンバー・機能カードの表示 | `src/components/home/` |
| 診断の質問・選曲結果・シェアカード | `src/components/mood/` |
| 検定のコース・問題表示・認定証・出典検索 | `src/components/quiz/`（問題そのものは `src/data/quizData.ts`） |
| セトリ・投票などの個人記録と旧データの復元 | `src/hooks/useFanRecords.ts`、`src/hooks/fanRecordStorage.ts` |
| 曲順やタグなどの編集情報／録音の曲長・音域・出典 | `src/data/catalogEntries.ts` ／ `src/data/songEvidence.json` |
| 選曲・採点・検索・セトリ集計 | `src/utils/` 内の機能別モジュール |
| 楽曲ガイドの読み検索 | `src/data/songReadings.ts`、[曲ごとの確認資料](docs/song-readings.md) |

楽曲ガイドとセトリは同じ録音データを参照します。曲の情報を更新するときは該当する曲IDのデータと出典を確認してください。個人記録の保存形式を変更するときは、以前のブラウザに残っている記録の復元も確認します。

検索向けのHTMLは `scripts/generateSongPages.ts` と `vite.config.ts` から生成します。`songs/*/index.html` を直接編集せず、紹介文やデータの正本を更新して `npm run generate:song-pages` を実行してください。曲のタイトル・説明・canonicalと、JavaScript実行前にも読める曲リンクは `npm run test:browser` で検証します。

CSPは `scripts/siteHtml.ts` が正本です。本番では同じサイトの外部ファイルからだけJavaScriptを実行し、ページへ直接書くコードやイベント属性は許可しません。Viteの開発用コードとWebSocket接続は開発時だけ許可します。CSPのマーカーが残った編集用HTMLをそのまま配信せず、`npm run build` の `dist/` を使用してください。ブラウザ検証では入力・保存・復元とCSPの実効性も確認します。

依存の既知の脆弱性は `npm audit --audit-level=low` で確認し、PRのCIでも失敗時に公開を止めます。TypeScriptの `strict` を維持し、入力値はテキストとして扱い、HTMLへ直接挿入しないでください。
