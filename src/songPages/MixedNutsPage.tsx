import { useEffect, useRef, useState } from 'react';
import { HIGEDAN_SONGS } from '../data/higedanData';
import { songEvidence } from '../data/fullCatalogSongs';
import { useFanRecords } from '../hooks/useFanRecords';
import { formatDuration } from '../utils/fanLogic';

const song = HIGEDAN_SONGS.find(item => item.id === 'mixed-nuts')!;
const fact = songEvidence['mixed-nuts'];
const base = import.meta.env.BASE_URL;

export function MixedNutsPage() {
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);
  const records = useFanRecords(message => {
    setToast(message);
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3200);
  });
  const inSetlist = records.setlist.some(item => item.songId === song.id);

  useEffect(() => () => {
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
  }, []);

  return (
    <div className="song-page">
      <a className="skip-link" href="#main">本文へ移動</a>
      <header className="site-topbar">
        <a className="site-brand" href={base} aria-label="115万キロのファンノート トップへ">
          <img src={`${base}hige-mark.svg`} alt="" width="40" height="40" />
          <span>115万キロのファンノート</span>
        </a>
        <nav aria-label="サイト内の移動">
          <a href={`${base}#discography`}>楽曲ガイド</a>
          <a href={`${base}#setlist`}>マイセトリ</a>
        </nav>
      </header>

      <main id="main" className="page-main">
        <nav className="breadcrumb" aria-label="現在の場所">
          <a href={`${base}#discography`}>掲載86曲 楽曲ガイド</a>
          <span aria-hidden="true">／</span>
          <span aria-current="page">ミックスナッツ</span>
        </nav>

        <article className="song-sheet" aria-labelledby="song-title">
          <header className="song-hero">
            <figure className="cover">
              <img
                src={`${base}song-art/mixed-nuts-editorial.png`}
                alt="ピアノ、トランペット、赤いランプを描いた当サイト制作のイメージ画像"
                width="250"
                height="250"
              />
            </figure>
            <div className="hero-content">
              <h1 id="song-title">{song.title}</h1>
              <p className="recording">収録作品：<span>{fact.album}</span></p>

              <dl className="song-facts">
                <div className="fact-row fact-row-main">
                  <div className="fact-item"><dt>演奏時間</dt><dd>{formatDuration(fact.seconds)}</dd></div>
                  <div className="fact-item"><dt>テンポ</dt><dd>{fact.tempo} <small>BPM</small></dd></div>
                </div>
                <div className="fact-row fact-row-range">
                  <div className="fact-item"><dt>地声最低</dt><dd>{fact.low}</dd></div>
                  <div className="fact-item"><dt>地声最高</dt><dd>{fact.chest}</dd></div>
                  <div className="fact-item"><dt>裏声最高</dt><dd>{fact.falsetto}</dd></div>
                </div>
              </dl>
            </div>
          </header>

          <div className="feature-line" aria-label="当サイトによる曲の紹介文">
            <p className="feature-phrase">違いを抱えて、ひとつの家族になる。</p>
            <p className="feature-credit">— 当サイト編集部による紹介文</p>
          </div>

          <section className="overview" aria-labelledby="overview-title">
            <h2 id="overview-title">この曲の概要</h2>
            <div className="overview-copy">
              <p>「ミックスナッツ」は、TVアニメ『SPY×FAMILY』第1クールのオープニング主題歌として書き下ろされた。2022年4月15日に配信され、のちにアルバム『Rejoice』の3曲目にも収録された。</p>
              <p>Official髭男dismは作品の公式サイトで、ピーナッツが見た目の似たナッツとは異なる種類だと知ったことを、曲名の着想として語っている。その発見を、正体を隠して家族を演じるフォージャー家の物語に重ねた。メンバーのコメントには、本物かどうかより、そこで得られる幸せや喜びを大切にする視点も示されている。</p>
              <p className="range-note">※ 裏声最高音はラストのフェイクを含む採譜に基づきます。採譜方法によって値は異なります。</p>
            </div>
          </section>

          <details className="sources">
            <summary><strong>データと出典</strong><span>音域・発売日・参考資料を確認する <span aria-hidden="true">↗</span></span></summary>
            <div className="sources-body">
              <dl className="source-facts">
                <div><dt>配信日</dt><dd>{fact.release}</dd></div>
                <div><dt>収録作品</dt><dd>{fact.album}（3曲目）</dd></div>
                <div><dt>演奏時間</dt><dd>{formatDuration(fact.seconds)}（掲載音源）</dd></div>
                <div><dt>音域</dt><dd>地声 {fact.low}〜{fact.chest} ／ 裏声最高 {fact.falsetto}</dd></div>
              </dl>
              <ul className="source-list">
                <li><a href="https://spy-family.net/tvseries/music/music_op.php" target="_blank" rel="noreferrer">アニメ『SPY×FAMILY』公式サイト</a>：タイアップとアーティストコメント</li>
                <li><a href="https://higedan.com/discography/detail/20/" target="_blank" rel="noreferrer">Official髭男dism 公式作品情報</a>：配信日</li>
                <li><a href={fact.cdSource} target="_blank" rel="noreferrer">Official髭男dism『Rejoice』収録情報</a>：収録順とアルバム発売日</li>
                <li><a href={fact.apple} target="_blank" rel="noreferrer">Apple Music の掲載音源</a>：演奏時間</li>
                <li><a href={fact.rangeSource} target="_blank" rel="noreferrer">{fact.rangeLabel}</a>：歌の音域と曲調</li>
                <li><a href={fact.tempoSource} target="_blank" rel="noreferrer">テンポの参考資料</a>：BPM</li>
              </ul>
              <p className="source-caveat">音域とテンポは採譜・計測方法で表記が異なる場合があります。ジャケットは公式の作品画像ではありません。</p>
            </div>
          </details>

          {records.storageNotice && <p className="storage-notice" role="alert">{records.storageNotice}</p>}
          <div className="song-actions">
            {inSetlist ? (
              <a className="add-button add-button--saved" href={`${base}#setlist`}>
                <span aria-hidden="true">✓</span>マイセトリで確認
              </a>
            ) : (
              <button type="button" className="add-button" onClick={() => void records.addToSetlist(song.id)}>
                <span aria-hidden="true">+</span>マイセトリに追加
              </button>
            )}
            <a className="back-button" href={`${base}#discography`}>曲一覧に戻る</a>
          </div>
          {toast && <p className="toast" role="status" aria-live="polite">{toast}</p>}
        </article>
      </main>

      <footer className="site-footer">
        <p>115万キロのファンノート — Official髭男dism 非公式ファンサイト</p>
        <a href={`${base}#sources`}>参考資料・謝辞</a>
      </footer>
    </div>
  );
}
