import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import { songPagePath } from './songPages/publishedSongPageIds';
import { registerPwaServiceWorker } from './utils/pwaInstall';
import './index.css';

document.querySelectorAll<HTMLLinkElement>('link[data-async-font]').forEach((link) => {
  link.media = 'all';
});

const legacySongId = window.location.hash.slice(1).split('/')[1];
const pagePath = legacySongId ? songPagePath(legacySongId) : null;
if (pagePath) {
  window.location.replace(`${import.meta.env.BASE_URL}${pagePath}`);
} else {
  registerPwaServiceWorker();
  const rootElement = document.getElementById('root');
  if (rootElement) {
    createRoot(rootElement).render(
      <ErrorBoundary onResetApp={() => window.location.reload()}>
        <App />
      </ErrorBoundary>,
    );
  }
}
