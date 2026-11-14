# 楽曲ページの共通テンプレート

紙面風のレイアウトと操作は `src/songPages/EditorialSongPage.tsx`、見た目は `EditorialSongPage.css` にまとめる。全90曲が同じテンプレートを使い、演奏時間、テンポ、音域、発売日は `src/data/songEvidence.json` を参照する。

独立した原稿があるミックスナッツ、Pretender、Subtitle、Cry Baby、ホワイトノイズは `src/songPages/data/<ID>.ts` の文章を使う。そのほかは `src/songPages/autoSongPage.ts` が確認済みの作品、配信日、曲調、タイアップと出典から概要を組み立てる。歌詞や曲の意味を推測して補わない。ミックスナッツのフェイクを除いた音域は、共通テンプレートの「データと出典」に追加の採譜値として記載する。

全曲の画像欄は共通テンプレートの `.cover` 内で同じ正方形に収め、検証済みの Apple Music ジャケット画像（`src/data/songAppleArtwork.ts`）と公式バッジ（`brand/badges/listen-on-apple-music-ja.svg`）を表示する（画像を取得できない場合のみ共通の仮枠へフォールバックし、既存の挿絵データは `brand/song-art/` に保持する）。解説は読みやすい文字の大きさを保ち、画面に収まらない場合は縦にスクロールする。PCでは「大きな文字で読む」に切り替えられる。

次の曲を加えるときは `src/data/songEvidence.json`、`src/data/catalogEntries.ts`、必要に応じて `src/data/songTieUps.ts` と `src/data/songReadings.ts` に、曲IDと出典を登録する。固有の紹介文を載せる場合は `src/songPages/data/<ID>.ts` を作る。歌詞や公式ジャケットを使う場合は掲載条件を別途確認する。曲調や音域は採用資料と値を曲ごとに照合する。

`npm run build` はページの初期HTMLと公開ID一覧を生成する。新しいURLは `/higedanfan/songs/<ID>/` となり、楽曲ガイドのカードからもリンクする。生成された `songs/<ID>/index.html` と `src/songPages/publishedSongPageIds.ts` は直接編集しない。公開時には生成物を既存のPublic・Private配信手順へ反映する。
