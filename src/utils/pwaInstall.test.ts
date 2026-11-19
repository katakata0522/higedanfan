import assert from 'node:assert/strict';
import test from 'node:test';
import { createPwaInstallManager } from './pwaInstall';
import { buildServiceWorkerSource, extractIndexShellAssets, HIGEDAN_SW_CACHE_PREFIX } from '../../scripts/pwaWorker';

function createMockWindow(options: {
  standalone?: boolean;
  hasNativeInstall?: boolean;
  installImpl?: () => Promise<void>;
} = {}) {
  const listeners = new Map<string, Set<(event: unknown) => void>>();
  const mediaListeners = new Set<(event: MediaQueryListEvent) => void>();
  const mockNavigator: Record<string, unknown> = {
    standalone: options.standalone === true,
  };
  if (options.hasNativeInstall) {
    mockNavigator.install = options.installImpl ?? (async () => {});
  }
  const win = {
    navigator: mockNavigator,
    matchMedia(query: string) {
      return {
        media: query,
        matches: Boolean(options.standalone && query === '(display-mode: standalone)'),
        addEventListener(_type: string, listener: (event: MediaQueryListEvent) => void) {
          mediaListeners.add(listener);
        },
        removeEventListener(_type: string, listener: (event: MediaQueryListEvent) => void) {
          mediaListeners.delete(listener);
        },
      };
    },
    addEventListener(type: string, listener: (event: unknown) => void) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type)!.add(listener);
    },
    removeEventListener(type: string, listener: (event: unknown) => void) {
      listeners.get(type)?.delete(listener);
    },
    dispatchMockEvent(type: string, event: unknown) {
      for (const listener of listeners.get(type) ?? []) {
        listener(event);
      }
    },
    emitDisplayModeChange(matches: boolean) {
      for (const listener of mediaListeners) {
        listener({ matches } as MediaQueryListEvent);
      }
    },
  };
  return win;
}

test('createPwaInstallManager stays inert when window is unavailable (SSR/Node)', async () => {
  const manager = createPwaInstallManager(undefined);
  assert.equal(manager.getSnapshot().canInstall, false);
  assert.equal(manager.getSnapshot().isInstalled, false);
  assert.equal(await manager.install(), 'unavailable');
});

test('beforeinstallprompt triggers single-use native install prompt and hides button afterward', async () => {
  const win = createMockWindow();
  const manager = createPwaInstallManager(win as unknown as Window);
  assert.equal(manager.getSnapshot().canInstall, false);

  let prevented = false;
  let prompted = 0;
  let resolveChoice: ((choice: { outcome: 'accepted' | 'dismissed' }) => void) | undefined;

  win.dispatchMockEvent('beforeinstallprompt', {
    preventDefault() {
      prevented = true;
    },
    async prompt() {
      prompted++;
    },
    userChoice: new Promise<{ outcome: 'accepted' | 'dismissed' }>((resolve) => {
      resolveChoice = resolve;
    }),
  });

  assert.equal(prevented, true);
  assert.equal(manager.getSnapshot().canInstall, true);

  const pendingInstall = manager.install();
  // 確認ダイアログ表示中は二重送信を防ぎつつボタン自体は保持する。
  assert.equal(manager.getSnapshot().isInstalling, true);
  assert.equal(manager.getSnapshot().canInstall, true);
  assert.equal(await manager.install(), 'unavailable');

  resolveChoice!({ outcome: 'accepted' });
  assert.equal(await pendingInstall, 'accepted');
  assert.equal(prompted, 1);
  assert.equal(manager.getSnapshot().isInstalled, true);
  assert.equal(manager.getSnapshot().canInstall, false);
  assert.equal(manager.getSnapshot().isInstalling, false);
  manager.destroy();
});

test('navigator.install() handles cancellation cleanly and allows retrying', async () => {
  let attempt = 0;
  const win = createMockWindow({
    hasNativeInstall: true,
    installImpl: async () => {
      attempt++;
      if (attempt === 1) {
        const err = new Error('User canceled');
        err.name = 'AbortError';
        throw err;
      }
    },
  });
  const manager = createPwaInstallManager(win as unknown as Window);
  assert.equal(manager.getSnapshot().canInstall, true);

  assert.equal(await manager.install(), 'dismissed');
  assert.equal(manager.getSnapshot().canInstall, true);
  assert.equal(manager.getSnapshot().statusMessage, 'インストールをキャンセルしました。');

  assert.equal(await manager.install(), 'accepted');
  assert.equal(manager.getSnapshot().canInstall, false);
  assert.equal(manager.getSnapshot().isInstalled, true);
  manager.destroy();
});

test('standalone launch or appinstalled hides install CTA immediately', async () => {
  const standaloneWin = createMockWindow({ standalone: true, hasNativeInstall: true });
  const standaloneManager = createPwaInstallManager(standaloneWin as unknown as Window);
  assert.equal(standaloneManager.getSnapshot().isInstalled, true);
  assert.equal(standaloneManager.getSnapshot().canInstall, false);
  standaloneManager.destroy();

  const win = createMockWindow({ hasNativeInstall: true });
  const manager = createPwaInstallManager(win as unknown as Window);
  assert.equal(manager.getSnapshot().canInstall, true);
  win.emitDisplayModeChange(true);
  assert.equal(manager.getSnapshot().canInstall, false);
  assert.equal(manager.getSnapshot().isInstalled, true);
  manager.destroy();
});

test('pwaWorker extracts entry shell assets and scopes cache + fetch strictly to /higedanfan/', () => {
  const html = `<!doctype html><html><head>
    <link rel="stylesheet" href="/higedanfan/assets/main-ABC123.css" />
    <script type="module" src="/higedanfan/assets/main-XYZ789.js"></script>
  </head></html>`;
  const assets = extractIndexShellAssets(html);
  assert.ok(assets.includes('/higedanfan/'));
  assert.ok(assets.includes('/higedanfan/manifest.webmanifest'));
  assert.ok(assets.includes('/higedanfan/hige-icon-192.png'));
  assert.ok(assets.includes('/higedanfan/hige-icon-512.png'));
  assert.ok(assets.includes('/higedanfan/assets/main-ABC123.css'));
  assert.ok(assets.includes('/higedanfan/assets/main-XYZ789.js'));

  const sw = buildServiceWorkerSource({
    cacheName: `${HIGEDAN_SW_CACHE_PREFIX}deadbeef12345678`,
    coreAssets: assets,
  });
  assert.match(sw, /higedanfan-pwa-deadbeef12345678/);
  assert.match(sw, /\/higedanfan\/sw\.js/);
  assert.match(sw, /url\.origin !== self\.location\.origin/);
  assert.match(sw, /!url\.pathname\.startsWith\('\/higedanfan\/'\)/);
});
