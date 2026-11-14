## 概要
<!-- このPRで何を改善・追加したかを簡潔に記載してください -->

## チェックリスト
- [ ] `npm run check`（`lint` / `test` / `build` / `audit`）を実行してエラーがない
- [ ] UI・導線・楽曲ページに影響がある場合は `npm run test:ux` または `npm run test:browser` を確認した
- [ ] `songs/*/index.html` や `src/songPages/publishedSongPageIds.ts` を手編集していない（`npm run generate:song-pages` の出力と一致）
- [ ] `brand/robots.txt` / `brand/sitemap.xml` を生成・同梱していない（ルートサイト側で管理）
- [ ] 本番反映が必要な場合、`docs/release-workflow.md` に沿って下流リポジトリ（`katakatalab-web` → `KatakataLab`）へ同期する
