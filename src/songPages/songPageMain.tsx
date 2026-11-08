import { createRoot } from 'react-dom/client';
import { EditorialSongPage } from './EditorialSongPage';
import { autoSongPage } from './autoSongPage';
import { applySongEditorial } from './applySongEditorial';
import type { EditorialSongPageData } from './EditorialSongPageData';
import './EditorialSongPage.css';

const root = document.getElementById('root')!;
const songId = root.dataset.songId;
const pages = import.meta.glob<{ default: EditorialSongPageData }>('./data/*.ts');
const loadPage = songId ? pages[`./data/${songId}.ts`] : undefined;

if (songId) {
  void (loadPage ? loadPage().then(module => module.default) : Promise.resolve(autoSongPage(songId))).then(page => {
    if (page.id !== songId) throw new Error('楽曲ページのIDが一致しません');
    createRoot(root).render(<EditorialSongPage page={applySongEditorial(page)} />);
  }).catch(error => console.error('楽曲ページを読み込めませんでした', error));
}
