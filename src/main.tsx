import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { songPagePath } from './songPages/publishedSongPageIds';
import './index.css';

const legacySongId = window.location.hash.slice(1).split('/')[1];
const pagePath = legacySongId ? songPagePath(legacySongId) : null;
if (pagePath) {
  window.location.replace(`${import.meta.env.BASE_URL}${pagePath}`);
} else {
  createRoot(document.getElementById('root')!).render(<App />);
}
