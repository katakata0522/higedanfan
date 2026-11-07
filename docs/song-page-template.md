# 楽曲ページの共通テンプレート

紙面風のレイアウトと操作は `src/songPages/EditorialSongPage.tsx`、見た目は `EditorialSongPage.css` にまとめる。ミックスナッツの文章・挿絵・出典の並びは `src/songPages/data/mixed-nuts.ts` が正本。演奏時間、テンポ、音域、発売日は既存の `src/data/songEvidence.json` を参照する。

次の曲を追加するときは、検証済みの楽曲IDに対応する `src/songPages/data/<ID>.ts` を作る。概要、紹介文、注記、出典、挿絵と代替テキストをその曲に合わせて記入し、挿絵のファイルを `brand/` に置く。歌詞や公式ジャケットを使う場合は、掲載条件と出典を別途確認する。曲調や音域などの既存データも、採用する資料と値を曲ごとに照合する。

`npm run build` はページの初期HTMLと公開ID一覧を生成する。新しいURLは `/higedanfan/songs/<ID>/` となり、楽曲ガイドのカードからもリンクする。生成された `songs/<ID>/index.html` と `src/songPages/publishedSongPageIds.ts` は直接編集しない。公開時には生成物と挿絵を既存のPublic・Private配信手順へ反映する。
