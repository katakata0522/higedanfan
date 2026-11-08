# 楽曲ページの共通テンプレート

紙面風のレイアウトと操作は `src/songPages/EditorialSongPage.tsx`、見た目は `EditorialSongPage.css` にまとめる。全90曲が同じテンプレートを使い、演奏時間、テンポ、音域、発売日は `src/data/songEvidence.json` を参照する。

独立した原稿があるミックスナッツ、Pretender、Subtitle、Cry Baby は `src/songPages/data/<ID>.ts` の文章と挿絵を使う。そのほかは `src/songPages/autoSongPage.ts` が確認済みの作品、配信日、曲調、タイアップと出典から概要を組み立てる。歌詞や曲の意味を推測して補わない。図柄は当サイト制作の抽象画で、公式ジャケットではない。ミックスナッツのフェイクを除いた音域は、共通テンプレートの「データと出典」に追加の採譜値として記載する。

次の曲を加えるときは `src/data/songEvidence.json`、`src/data/catalogEntries.ts`、必要に応じて `src/data/songTieUps.ts` と `src/data/songReadings.ts` に、曲IDと出典を登録する。固有の紹介文や挿絵を載せる場合だけ `src/songPages/data/<ID>.ts` を作り、画像を `brand/` に置く。歌詞や公式ジャケットを使う場合は掲載条件を別途確認する。曲調や音域は採用資料と値を曲ごとに照合する。

`npm run build` はページの初期HTMLと公開ID一覧を生成する。新しいURLは `/higedanfan/songs/<ID>/` となり、楽曲ガイドのカードからもリンクする。生成された `songs/<ID>/index.html` と `src/songPages/publishedSongPageIds.ts` は直接編集しない。公開時には生成物と挿絵を既存のPublic・Private配信手順へ反映する。
