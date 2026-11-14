import { useEffect, useRef, useState } from 'react';
import { ChevronRight, Menu } from 'lucide-react';
import { HIGEDAN_SONGS } from '../data/higedanData';
import { songEvidence } from '../data/fullCatalogSongs';
import { useFanRecords } from '../hooks/useFanRecords';
import { formatSongBpm, formatDuration } from '../utils/fanLogic';
import { tempoAlternatives } from '../data/tempoAlternatives';
import { isTempoUnderReview } from '../data/tempoReviewStatus';
import { songReturnDestination } from '../utils/guideReturnState';
import { KurunIntroOverlay } from '../components/KurunIntroOverlay';
import { SITE_NAV_ITEMS } from '../components/SiteHeader';
import { infoPages } from '../components/info/infoPages';
import { officialVideoDescription, officialVideos, relatedSongs } from './songConnections';
import { songAppleArtwork } from '../data/songAppleArtwork';
import type { EditorialSongPageData } from './EditorialSongPageData';

const base = import.meta.env.BASE_URL;

export function EditorialSongPage({ page }: { page: EditorialSongPageData }) {
  const song = HIGEDAN_SONGS.find(item => item.id === page.id)!;
  const fact = songEvidence[page.id as keyof typeof songEvidence];
  const appleArtwork = songAppleArtwork[page.id];
  const otherTempos = tempoAlternatives[page.id];
  const tempoUnderReview = isTempoUnderReview(page.id);
  const related = relatedSongs(page.id);
  const video = officialVideos[page.id];
  const [toast, setToast] = useState<string | null>(null);
  const [readable, setReadable] = useState(false);
  const [artworkFailed, setArtworkFailed] = useState(false);
  const [isIntroOpen, setIsIntroOpen] = useState(false);
  const [introReplayToken, setIntroReplayToken] = useState(0);
  const sourcesRef = useRef<HTMLDetailsElement>(null);
  const siteMenuRef = useRef<HTMLDetailsElement>(null);
  const toastTimer = useRef<number | null>(null);
  const records = useFanRecords(message => {
    setToast(message);
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3200);
  });
  const inSetlist = records.setlist.some(item => item.songId === song.id);
  const [returnDest] = useState(songReturnDestination);

  useEffect(() => {
    setArtworkFailed(false);
  }, [page.id]);

  useEffect(() => () => {
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
  }, []);

  return (
    <div className="song-page">
      <KurunIntroOverlay
        isOpen={isIntroOpen}
        replayToken={introReplayToken}
        onClose={() => setIsIntroOpen(false)}
      />
      <a className="skip-link" href="#main">本文へ移動</a>
      <header className="site-topbar">
        <div className="site-topbar-inner">
          <a className="site-brand" href={base} aria-label="115万キロのファンノート トップへ">
            <svg viewBox="0 0 100 55" aria-hidden="true" className="site-brand-logo">
              <g transform="translate(50 28) scale(0.145) translate(-370 -125)">
                <path
                  fill="#2d3c3a"
                  d="M370 86 C356 66 338 62 316 62 C254 62 234 156 174 156 C138 156 112 142 112 120 C112 102 125 94 140 94 C153 94 160 103 160 114 C160 124 151 130 142 130 C136 130 132 126 132 121 C132 117 125 117 125 122 C125 132 133 139 144 139 C159 139 170 128 170 112 C170 94 155 82 136 82 C108 82 88 104 88 134 C88 172 144 188 214 188 C286 188 336 156 362 128 C366 124 368 122 370 122 C372 122 374 124 378 128 C404 156 454 188 526 188 C596 188 652 172 652 134 C652 104 632 82 604 82 C585 82 570 94 570 112 C570 128 581 139 596 139 C607 139 615 132 615 122 C615 117 608 117 608 121 C608 126 604 130 598 130 C589 130 580 124 580 114 C580 103 587 94 600 94 C615 94 628 102 628 120 C628 142 602 156 566 156 C506 156 486 62 424 62 C402 62 384 66 370 86 Z"
                />
                <path
                  d="M370 96 C360 82 346 88 349 101 C351 110 370 120 370 120 C370 120 389 110 391 101 C394 88 380 82 370 96 Z"
                  fill="#bd604e"
                />
              </g>
            </svg>
            <span aria-hidden="true" className="site-brand-text">
              <span className="site-brand-title">
                <span>115万キロの</span>
                <span>ファンノート</span>
              </span>
              <span className="site-brand-sub">Official髭男dism 非公式ファンサイト</span>
            </span>
          </a>
          <details className="song-site-menu" ref={siteMenuRef}
            onBlur={event => {
              if (!event.currentTarget.contains(event.relatedTarget)) siteMenuRef.current?.removeAttribute('open');
            }}
            onKeyDown={event => {
              if (event.key === 'Escape') {
                siteMenuRef.current?.removeAttribute('open');
                siteMenuRef.current?.querySelector('summary')?.focus();
              }
            }}>
            <summary aria-label="サイト内メニュー">
              <Menu className="song-menu-trigger-icon" aria-hidden="true" />
              <span>メニュー</span>
            </summary>
            <nav className="song-menu-panel" aria-label="サイト内メニュー">
              <div className="song-menu-header">
                <span className="song-menu-heading">ファンノートの目次</span>
                <span className="song-menu-note">押すと各ページへ移動します</span>
              </div>
              <div className="song-menu-items">
                {SITE_NAV_ITEMS.map(item => (
                  <a key={item.id} className="song-menu-card" href={`${base}#${item.id}`}>
                    <span className="song-menu-icon">{item.icon}</span>
                    <span className="song-menu-copy">
                      <span className="song-menu-label">{item.label}</span>
                      <span className="song-menu-desc">{item.shortDesc}</span>
                    </span>
                    <ChevronRight className="song-menu-chevron" aria-hidden="true" />
                  </a>
                ))}
              </div>
              <div className="song-menu-footer">
                <button
                  id="kurun-replay-btn"
                  type="button"
                  className="song-menu-sublink"
                  onClick={() => {
                    siteMenuRef.current?.removeAttribute('open');
                    setIntroReplayToken(token => token + 1);
                    setIsIntroOpen(true);
                  }}
                >
                  オープニングをもう一度見る
                </button>
                {Object.entries(infoPages).map(([id, label]) => (
                  <a key={id} className="song-menu-sublink" href={`${base}#${id}`}>{label}</a>
                ))}
                <button
                  className="reading-toggle"
                  type="button"
                  aria-pressed={readable}
                  onClick={() => {
                    setReadable(value => !value);
                    siteMenuRef.current?.removeAttribute('open');
                  }}
                >
                  {readable ? '標準の文字に戻す' : '大きな文字で読む'}
                </button>
              </div>
            </nav>
          </details>
        </div>
      </header>

      <main id="main" tabIndex={-1} className="page-main">
        <div className={`sheet-frame${readable ? ' sheet-frame--readable' : ''}`}>
        <article className="song-sheet" aria-labelledby="song-title">
          <a className="sheet-close" href={`${base}#${returnDest.hash}`} aria-label={returnDest.label}>×</a>
          <header className="song-hero">
            <figure className="cover">
              {appleArtwork && !artworkFailed ? (
                <img
                  className="cover-art"
                  src={appleArtwork.artworkUrl}
                  alt={`「${fact.recording}」（${appleArtwork.albumName}）ジャケット画像`}
                  width={225}
                  height={225}
                  loading="eager"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  onError={() => setArtworkFailed(true)}
                />
              ) : (
                <div className="cover-placeholder" role="img" aria-label="ジャケット画像の仮枠" />
              )}
              <figcaption className="cover-caption">
                <a
                  className="cover-apple-badge"
                  href={appleArtwork?.appleUrl ?? fact.apple}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Apple Musicで「${fact.recording}」を聴く`}
                >
                  <img
                    className="cover-apple-badge-img"
                    src={`${base}badges/listen-on-apple-music-ja.svg`}
                    alt="Apple Musicで聴く"
                    width={140}
                    height={40}
                  />
                </a>
              </figcaption>
            </figure>
            <div className="hero-content">
              <h1 id="song-title">{song.title}</h1>
              <p className="recording">収録作品：<span>{fact.album}</span></p>

              <dl className="song-facts">
                <div className="fact-item"><dt>演奏時間</dt><dd>{formatDuration(fact.seconds)}</dd></div>
                <div className="fact-item"><dt>テンポ</dt><dd>{formatSongBpm(page.id, fact.tempo)}{!tempoUnderReview && <> <small>BPM</small></>}</dd></div>
                <div className="fact-item"><dt>地声最低</dt><dd>{fact.low}</dd></div>
                <div className="fact-item"><dt>地声最高</dt><dd>{fact.chest}</dd></div>
                <div className="fact-item"><dt>裏声最高</dt><dd>{fact.falsetto ?? '記載なし'}</dd></div>
              </dl>
              {tempoUnderReview && <p className="tempo-explanation">テンポは資料によって値が異なるため、確認中です。</p>}
            </div>
          </header>

          <div className="feature-line" aria-label="当サイトによる曲の紹介文">
            <p className="feature-phrase">{page.feature.text}</p>
            <p className="feature-credit">{page.feature.credit}</p>
          </div>

          <section className="overview" aria-labelledby="overview-title">
            <h2 id="overview-title">この曲について</h2>
            <div className="overview-copy">
              {page.overview.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
              {page.rangeNote && <p className="range-note">{page.rangeNote}</p>}
            </div>
            <p className="overview-sources">参考にした資料：{' '}
              {page.sources.slice(0, 2).map((source, index) => (
                <span key={`${source.label}-${index}`}>{index > 0 && '、'}<a href={source.evidence ? fact[source.evidence] : source.url} target="_blank" rel="noreferrer">{source.label}</a></span>
              ))}
              {' '}<a href="#song-sources" onClick={() => { if (sourcesRef.current) sourcesRef.current.open = true; }}>ほかの資料を見る</a>
            </p>
          </section>

          <section className="listen-section" aria-labelledby="listen-title">
            <div>
              <h2 id="listen-title">この曲を聴く</h2>
              <p>紹介した音源を、もう一度聴いてみませんか。</p>
            </div>
            <div className="listen-links">
              <a href={fact.apple} target="_blank" rel="noreferrer">Apple Musicで聴く <span aria-hidden="true">↗</span></a>
              {video && <a href={video} target="_blank" rel="noreferrer">YouTubeで聴く{officialVideoDescription(page.id) && `（${officialVideoDescription(page.id)}）`} <span aria-hidden="true">↗</span></a>}
            </div>
            <p className="listen-note">※ ジャケット画像および配信情報は Apple Music の公開情報から参照しています（上記リンクから公式配信を聴けます）。</p>
          </section>

          {related.length > 0 && <section className="related-section" aria-labelledby="related-title">
            <h2 id="related-title">次に聴きたい曲</h2>
            <ul>{related.map(item => <li key={item.id}>
              <a href={`${base}songs/${item.id}/`}><span>{item.title}</span><span aria-hidden="true">→</span></a>
              <p>{item.reason}</p>
            </li>)}</ul>
          </section>}

          <details ref={sourcesRef} id="song-sources" className="sources">
            <summary><strong>データと出典</strong><span>楽曲データ・参考資料を確認する <span aria-hidden="true">▼</span></span></summary>
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
                  <strong>別の採譜：</strong>地声最低 {fact.otherRange[0]} ／ 地声最高 {fact.otherRange[1]} ／ 裏声最高 {fact.otherRange[2]}（<a href={fact.otherSource} target="_blank" rel="noreferrer">音域データ！＠ウィキ</a>の採譜）
                </p>
              )}
              <ul className="source-list">
                {page.sources.map((source, index) => (
                  <li key={`${source.label}-${index}`}>
                    <a href={source.evidence ? fact[source.evidence] : source.url} target="_blank" rel="noreferrer">{source.label}</a>：{source.purpose}
                  </li>
                ))}
              </ul>
              {tempoUnderReview && <p className="source-caveat">資料によって数値が異なるため、テンポは調査中です。参考資料には<a href={fact.tempoSource} target="_blank" rel="noreferrer">約{fact.tempo} BPM</a>との表記があります。</p>}
              {otherTempos && (
                <p className="source-caveat">別の資料では{otherTempos.map((tempo, index) => (
                  <span key={`${tempo.url}-${tempo.value}`}>{index > 0 && '、'}<a href={tempo.url} target="_blank" rel="noreferrer">約{tempo.value} BPM</a></span>
                ))}との表記もあります。拍の数え方や計測方法などによって数値が異なる場合があります。</p>
              )}
              <p className="source-caveat">{page.sourceCaveat}</p>
              <p className="source-caveat">BPMは資料の小数を四捨五入して表示しています。</p>
            </div>
          </details>

          {records.storageNotice && (
            <p className="storage-notice" role="alert">
              {records.storageNotice}{' '}
              <button type="button" onClick={records.downloadRecords}>画面上の記録を書き出す</button>
            </p>
          )}
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
            <a className="back-button" href={`${base}#${returnDest.hash}`}>{returnDest.label}</a>
          </div>
          {toast && <p className="toast" role="status" aria-live="polite">{toast}</p>}
        </article>
        </div>
      </main>

      <footer className="song-site-footer">
        <div className="song-site-footer-inner">
          <p className="song-site-footer-brand">
            © 115万キロのファンノート — Official髭男dism 非公式ファンサイト
          </p>
          <p className="song-site-footer-note">
            ※当サイトはファンによる非公式ファンサイトであり、Official髭男dism公式および所属事務所・レコード会社とは一切関係ありません。
          </p>
          <p className="song-site-footer-storage">
            ※マイセトリや参戦・訪問記録はお使いのブラウザ内に保存されます（書き出し・初期化は<a href={`${base}#privacy`}>プライバシーポリシー</a>から行えます）。
          </p>
        </div>
      </footer>
    </div>
  );
}
