import { useCallback, useSyncExternalStore } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform?: string }>;
}

export interface InstallableNavigator extends Navigator {
  install?: () => Promise<void>;
  standalone?: boolean;
}

export type PwaInstallOutcome = 'accepted' | 'dismissed' | 'unavailable' | 'error';

export interface PwaInstallSnapshot {
  canInstall: boolean;
  isInstalling: boolean;
  isInstalled: boolean;
  statusMessage: string | null;
}

const SERVER_SNAPSHOT: PwaInstallSnapshot = Object.freeze({
  canInstall: false,
  isInstalling: false,
  isInstalled: false,
  statusMessage: null,
});

function isStandaloneMode(win: Window): boolean {
  const standaloneMedia = Boolean(win.matchMedia?.('(display-mode: standalone)')?.matches);
  const standaloneIos = (win.navigator as InstallableNavigator).standalone === true;
  return standaloneMedia || standaloneIos;
}

function supportsNativeWebInstall(win: Window): boolean {
  return typeof (win.navigator as InstallableNavigator).install === 'function';
}

/** Tracks browser PWA installability and runs native install prompts on user activation. */
export function createPwaInstallManager(win?: Window) {
  let deferredPrompt: BeforeInstallPromptEvent | null = null;
  let installed = win ? isStandaloneMode(win) : false;
  let isInstalling = false;
  let statusMessage: string | null = null;
  const listeners = new Set<() => void>();

  const computeSnapshot = (): PwaInstallSnapshot => {
    if (!win) return SERVER_SNAPSHOT;
    const standalone = installed || isStandaloneMode(win);
    // 確認ダイアログ表示中（isInstalling）はボタンを消さず、フォーカスと aria-disabled を保つ。
    const canInstall = !standalone && (supportsNativeWebInstall(win) || deferredPrompt !== null || isInstalling);
    return {
      canInstall,
      isInstalling,
      isInstalled: standalone,
      statusMessage,
    };
  };

  let snapshot = computeSnapshot();

  const notify = () => {
    snapshot = computeSnapshot();
    for (const listener of listeners) {
      listener();
    }
  };

  const handleBeforeInstallPrompt = (event: Event) => {
    if (!win || isStandaloneMode(win)) return;
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    installed = false;
    notify();
  };

  const handleAppInstalled = () => {
    deferredPrompt = null;
    installed = true;
    statusMessage = 'アプリをインストールしました。';
    notify();
  };

  const displayModeQuery = win?.matchMedia?.('(display-mode: standalone)');
  const handleDisplayModeChange = (event: MediaQueryListEvent) => {
    if (event.matches) {
      deferredPrompt = null;
      installed = true;
      notify();
    }
  };

  if (win) {
    win.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    win.addEventListener('appinstalled', handleAppInstalled);
    displayModeQuery?.addEventListener?.('change', handleDisplayModeChange);
  }

  async function install(): Promise<PwaInstallOutcome> {
    if (!win || isInstalling || installed || isStandaloneMode(win)) {
      return 'unavailable';
    }

    const nav = win.navigator as InstallableNavigator;
    if (typeof nav.install === 'function') {
      isInstalling = true;
      notify();
      try {
        // クリック操作のユーザー起動状態を保つため、そのまま即時に呼び出す。
        await nav.install();
        deferredPrompt = null;
        installed = true;
        statusMessage = 'アプリをインストールしました。';
        return 'accepted';
      } catch (error) {
        if ((error as { name?: string })?.name === 'AbortError') {
          statusMessage = 'インストールをキャンセルしました。';
          return 'dismissed';
        }
        console.error('Web install failed:', error);
        statusMessage = 'インストールを開始できませんでした。';
        return 'error';
      } finally {
        isInstalling = false;
        notify();
      }
    }

    if (deferredPrompt) {
      // beforeinstallpromptは1回限りのため、選択待ちの前に参照を外して二重実行を防ぐ。
      const promptEvent = deferredPrompt;
      deferredPrompt = null;
      isInstalling = true;
      notify();
      try {
        await promptEvent.prompt();
        const { outcome } = await promptEvent.userChoice;
        if (outcome === 'accepted') {
          installed = true;
          statusMessage = 'アプリをインストールしました。';
          return 'accepted';
        }
        statusMessage = 'インストールをキャンセルしました。';
        return 'dismissed';
      } catch (error) {
        console.error('beforeinstallprompt failed:', error);
        statusMessage = 'インストールを開始できませんでした。';
        return 'error';
      } finally {
        isInstalling = false;
        notify();
      }
    }

    return 'unavailable';
  }

  return {
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    install,
    destroy() {
      if (!win) return;
      win.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      win.removeEventListener('appinstalled', handleAppInstalled);
      displayModeQuery?.removeEventListener?.('change', handleDisplayModeChange);
      listeners.clear();
    },
  };
}

const defaultManager = createPwaInstallManager(typeof window !== 'undefined' ? window : undefined);
let registeredServiceWorker = false;

export function registerPwaServiceWorker(): void {
  if (
    registeredServiceWorker ||
    typeof window === 'undefined' ||
    !import.meta.env.PROD ||
    !('serviceWorker' in window.navigator)
  ) {
    return;
  }
  registeredServiceWorker = true;
  const baseUrl = import.meta.env.BASE_URL || '/higedanfan/';
  const swUrl = `${baseUrl}sw.js`;
  const register = () => {
    void window.navigator.serviceWorker
      .register(swUrl, { scope: baseUrl, updateViaCache: 'none' })
      .catch((error) => {
        console.warn('Service Worker registration failed:', error);
      });
  };
  if (document.readyState === 'complete') {
    register();
  } else {
    window.addEventListener('load', register, { once: true });
  }
}

export function pwaInstallOutcomeMessage(outcome: PwaInstallOutcome): string | null {
  switch (outcome) {
    case 'accepted':
      return 'スマホアプリとして追加しました。';
    case 'dismissed':
      return 'インストールをキャンセルしました。';
    case 'error':
      return 'インストールを開始できませんでした。';
    default:
      return null;
  }
}

export interface UsePwaInstallActionOptions {
  onFeedback?: (message: string) => void;
  onAccepted?: () => void;
  fallbackFocusElementId?: string;
}

export function usePwaInstallAction({
  onFeedback,
  onAccepted,
  fallbackFocusElementId = 'kurun-replay-btn',
}: UsePwaInstallActionOptions = {}) {
  const pwaInstall = usePwaInstall();

  const triggerInstall = useCallback(async () => {
    if (pwaInstall.isInstalling) return;
    const outcome = await pwaInstall.install();
    const message = pwaInstallOutcomeMessage(outcome);
    if (message) onFeedback?.(message);
    if (outcome === 'accepted') {
      onAccepted?.();
    } else if (outcome !== 'unavailable') {
      window.requestAnimationFrame(() => {
        if (!document.getElementById('pwa-install-btn') && document.activeElement === document.body) {
          document.getElementById(fallbackFocusElementId)?.focus();
        }
      });
    }
  }, [fallbackFocusElementId, onAccepted, onFeedback, pwaInstall]);

  return {
    ...pwaInstall,
    triggerInstall,
  };
}

export function usePwaInstall(): PwaInstallSnapshot & { install: () => Promise<PwaInstallOutcome> } {
  const snapshot = useSyncExternalStore(
    defaultManager.subscribe,
    defaultManager.getSnapshot,
    () => SERVER_SNAPSHOT,
  );
  return {
    ...snapshot,
    install: defaultManager.install,
  };
}
