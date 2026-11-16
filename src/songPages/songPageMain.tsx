import { Component, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { EditorialSongPage } from './EditorialSongPage';
import { autoSongPage } from './autoSongPage';
import { applySongEditorial } from './applySongEditorial';
import type { EditorialSongPageData } from './EditorialSongPageData';
import './EditorialSongPage.css';

function SongPageErrorFallback() {
  return (
    <div className="song-page">
      <main id="main" className="page-main">
        <div className="sheet-frame">
          <article className="song-sheet song-error-sheet" role="alert">
            <h1 id="song-title">ページの表示中に問題が発生しました</h1>
            <p className="song-error-copy">
              ページの再読み込み、または楽曲ガイド一覧への移動をお試しください。
            </p>
            <div className="song-error-actions">
              <button type="button" className="song-error-btn" onClick={() => window.location.reload()}>
                ページを再読み込み
              </button>
              <a className="song-error-link" href="/higedanfan/#discography">
                楽曲ガイドへ戻る
              </a>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}

class SongPageErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    return this.state.hasError ? <SongPageErrorFallback /> : this.props.children;
  }
}

const root = document.getElementById('root')!;
const songId = root.dataset.songId;
const pages = import.meta.glob<{ default: EditorialSongPageData }>('./data/*.ts');
const loadPage = songId ? pages[`./data/${songId}.ts`] : undefined;

if (songId) {
  const reactRoot = createRoot(root);
  void (loadPage ? loadPage().then(module => module.default) : Promise.resolve(autoSongPage(songId))).then(page => {
    if (page.id !== songId) throw new Error('楽曲ページのIDが一致しません');
    reactRoot.render(
      <SongPageErrorBoundary>
        <EditorialSongPage page={applySongEditorial(page)} />
      </SongPageErrorBoundary>,
    );
  }).catch(error => {
    console.error('楽曲ページを読み込めませんでした', error);
    reactRoot.render(<SongPageErrorFallback />);
  });
}
