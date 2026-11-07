import { useEffect, useRef, useState } from 'react';
import { HIGEDAN_SONGS } from '../data/higedanData';
import { songEvidence } from '../data/fullCatalogSongs';
import { useFanRecords } from '../hooks/useFanRecords';
import { formatDuration } from '../utils/fanLogic';
import type { EditorialSongPageData } from './EditorialSongPageData';

const base = import.meta.env.BASE_URL;

export function EditorialSongPage({ page }: { page: EditorialSongPageData }) {
  const song = HIGEDAN_SONGS.find(item => item.id === page.id)!;
  const fact = songEvidence[page.id as keyof typeof songEvidence];
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
          <span aria-current="page">{song.title}</span>
        </nav>

        <article className="song-sheet" aria-labelledby="song-title">
          <header className="song-hero">
            <figure className="cover">
              <img
                src={`${base}${page.artwork.path}`}
                alt={page.artwork.alt}
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
                  <div className="fact-item"><dt>裏声最高</dt><dd>{fact.falsetto ?? '記載なし'}</dd></div>
                </div>
              </dl>
            </div>
          </header>

          <div className="feature-line" aria-label="当サイトによる曲の紹介文">
            <p className="feature-phrase">{page.feature.text}</p>
            <p className="feature-credit">{page.feature.credit}</p>
          </div>

          <section className="overview" aria-labelledby="overview-title">
            <h2 id="overview-title">この曲の概要</h2>
            <div className="overview-copy">
              {page.overview.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
              {page.rangeNote && <p className="range-note">{page.rangeNote}</p>}
            </div>
          </section>

          <details className="sources">
            <summary><strong>データと出典</strong><span>音域・発売日・参考資料を確認する <span aria-hidden="true">↗</span></span></summary>
            <div className="sources-body">
              <dl className="source-facts">
                <div><dt>配信日</dt><dd>{fact.release}</dd></div>
                <div><dt>収録作品</dt><dd>{fact.album}{page.albumTrack ? `（${page.albumTrack}曲目）` : ''}</dd></div>
                <div><dt>演奏時間</dt><dd>{formatDuration(fact.seconds)}（掲載音源）</dd></div>
                <div><dt>音域</dt><dd>地声 {fact.low}〜{fact.chest} ／ 裏声最高 {fact.falsetto ?? '記載なし'}</dd></div>
              </dl>
              <ul className="source-list">
                {page.sources.map((source, index) => (
                  <li key={`${source.label}-${index}`}>
                    <a href={source.evidence ? fact[source.evidence] : source.url} target="_blank" rel="noreferrer">{source.label}</a>：{source.purpose}
                  </li>
                ))}
              </ul>
              <p className="source-caveat">{page.sourceCaveat}</p>
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
