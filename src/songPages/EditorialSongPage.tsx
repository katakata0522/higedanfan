import { useEffect, useRef, useState } from 'react';
import { HIGEDAN_SONGS } from '../data/higedanData';
import { GuideArtwork } from '../components/GuideArtwork';
import { songEvidence } from '../data/fullCatalogSongs';
import { useFanRecords } from '../hooks/useFanRecords';
import { formatDuration } from '../utils/fanLogic';
import { guideReturnView } from '../utils/guideReturnState';
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
  const [returnView] = useState(guideReturnView);

  useEffect(() => () => {
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
  }, []);

  return (
    <div className="song-page">
      <a className="skip-link" href="#main">本文へ移動</a>
      <header className="site-topbar">
        <a className="site-brand" href={base} aria-label="115万キロのファンノート トップへ">
          <img src={`${base}hige-mark.svg?v=34b8cc7`} alt="" width="40" height="40" />
          <span>115万キロのファンノート</span>
        </a>
        <nav aria-label="サイト内の移動">
          <a href={`${base}#discography`}>楽曲ガイド</a>
          <a href={`${base}#setlist`}>マイセトリ</a>
        </nav>
      </header>

      <main id="main" className="page-main">
        <article className="song-sheet" aria-labelledby="song-title">
          <header className="song-hero">
            <figure className="cover">
              {'path' in page.artwork ? (
                <img src={`${base}${page.artwork.path}`} alt={page.artwork.alt} width="220" height="220" />
              ) : (
                <GuideArtwork src={page.artwork.theme} alt={page.artwork.alt} className="guide-artwork" />
              )}
            </figure>
            <div className="hero-content">
              <h1 id="song-title">{song.title}</h1>
              <p className="recording">収録作品：<span>{fact.album}</span></p>

              <dl className="song-facts">
                <div className="fact-item"><dt>演奏時間</dt><dd>{formatDuration(fact.seconds)}</dd></div>
                <div className="fact-item"><dt>テンポ</dt><dd>{fact.tempo} <small>BPM</small></dd></div>
                <div className="fact-item"><dt>地声最低</dt><dd>{fact.low}</dd></div>
                <div className="fact-item"><dt>地声最高</dt><dd>{fact.chest}</dd></div>
                <div className="fact-item"><dt>裏声最高</dt><dd>{fact.falsetto ?? '記載なし'}</dd></div>
              </dl>
              <div className="feature-line" aria-label="当サイトによる曲の紹介文">
                <p className="feature-phrase">{page.feature.text}</p>
                <p className="feature-credit">{page.feature.credit}</p>
              </div>
            </div>
          </header>

          <section className="overview" aria-labelledby="overview-title">
            <h2 id="overview-title">この曲の概要</h2>
            <div className="overview-copy">
              {page.overview.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
              {page.rangeNote && <p className="range-note">{page.rangeNote}</p>}
            </div>
          </section>

          <details className="sources">
            <summary><strong>データと出典</strong><span>音域・発売日・参考資料を確認する <span aria-hidden="true">▼</span></span></summary>
            <div className="sources-body">
              <dl className="source-facts">
                <div><dt>配信日</dt><dd>{fact.release}</dd></div>
                <div><dt>収録作品</dt><dd>{fact.album}{page.albumTrack ? `（${page.albumTrack}曲目）` : ''}</dd></div>
                <div><dt>演奏時間</dt><dd>{formatDuration(fact.seconds)}（掲載音源）</dd></div>
                <div><dt>音域</dt><dd>地声 {fact.low}〜{fact.chest} ／ 裏声最高 {fact.falsetto ?? '記載なし'}</dd></div>
              </dl>
              {page.vocalVariants?.map(variant => (
                <p className="vocal-variant" key={variant.label}>
                  <strong>{variant.label}：</strong>{variant.value}（<a href={variant.sourceUrl} target="_blank" rel="noreferrer">{variant.sourceLabel}</a>の採譜）
                </p>
              ))}
              {fact.otherRange && !page.vocalVariants?.length && (
                <p className="vocal-variant">
                  <strong>別の採譜：</strong>地声最低 {fact.otherRange[0]} ／ 地声最高 {fact.otherRange[1]} ／ 裏声最高 {fact.otherRange[2]}（<a href={fact.otherSource} target="_blank" rel="noreferrer">音域調査 Wiki</a>の採譜）
                </p>
              )}
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
            <a className="back-button" href={`${base}#${returnView}`}>{returnView === 'vocal_range' ? '音域一覧に戻る' : '曲一覧に戻る'}</a>
          </div>
          {toast && <p className="toast" role="status" aria-live="polite">{toast}</p>}
        </article>
      </main>
    </div>
  );
}
