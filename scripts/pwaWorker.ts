import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const HIGEDAN_SW_CACHE_PREFIX = 'higedanfan-pwa-';

const BASE_SHELL_ASSETS = [
  '/higedanfan/',
  '/higedanfan/manifest.webmanifest',
  '/higedanfan/fonts/kiwi-maru-medium-c8f08bbe.woff2',
  '/higedanfan/fonts/noto-sans-jp-52eb61f0.woff2',
  '/higedanfan/hige-mark.svg?v=34b8cc7',
  '/higedanfan/hige-icon-192.png',
  '/higedanfan/hige-icon-512.png',
  '/higedanfan/hige-touch-180.png?v=cd4d0ca',
];

/** Extracts local stylesheet and script entry paths referenced by the built index.html. */
export function extractIndexShellAssets(indexHtml: string): string[] {
  const discovered = new Set<string>(BASE_SHELL_ASSETS);
  for (const match of indexHtml.matchAll(/<script\b[^>]*\bsrc=["'](\/higedanfan\/[^"']+)["']/gi)) {
    discovered.add(match[1]);
  }
  for (const match of indexHtml.matchAll(/<link\b[^>]*\brel=["']stylesheet["'][^>]*\bhref=["'](\/higedanfan\/assets\/[^"']+\.css)["']/gi)) {
    discovered.add(match[1]);
  }
  for (const match of indexHtml.matchAll(/<link\b[^>]*\bhref=["'](\/higedanfan\/assets\/[^"']+\.css)["'][^>]*\brel=["']stylesheet["']/gi)) {
    discovered.add(match[1]);
  }
  return [...discovered];
}

function walkBuildFiles(rootDir: string): string[] {
  const files: string[] = [];
  for (const entry of fs.readdirSync(rootDir, { withFileTypes: true })) {
    if (entry.name === 'sw.js') continue;
    const fullPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkBuildFiles(fullPath));
    } else if (/\.(?:html|js|css|webmanifest)$/i.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files.sort();
}

export function buildServiceWorkerSource(options: {
  cacheName: string;
  coreAssets: readonly string[];
}): string {
  const cacheName = JSON.stringify(options.cacheName);
  const cachePrefix = JSON.stringify(HIGEDAN_SW_CACHE_PREFIX);
  const coreAssets = JSON.stringify([...options.coreAssets]);

  return `'use strict';
const CACHE_NAME = ${cacheName};
const CACHE_PREFIX = ${cachePrefix};
const CORE_ASSETS = ${coreAssets};
const MAX_RUNTIME_ENTRIES = 80;
const NETWORK_TIMEOUT_MS = 4500;

function canonicalUrl(rawUrl) {
  const url = new URL(rawUrl, self.registration.scope);
  if (url.pathname.endsWith('/index.html')) {
    url.pathname = url.pathname.slice(0, -'index.html'.length);
  }
  return url;
}

const CORE_KEYS = new Set(
  CORE_ASSETS.map(asset => {
    const url = canonicalUrl(asset);
    if (url.pathname.endsWith('/') || url.pathname.endsWith('.webmanifest')) {
      url.search = '';
    }
    return url.href;
  }),
);

function cacheKeyFor(request) {
  const url = canonicalUrl(request.url);
  url.hash = '';
  const bare = new URL(url.href);
  bare.search = '';
  if (request.mode === 'navigate' || CORE_KEYS.has(bare.href)) {
    url.search = '';
  }
  return url.href;
}

function offlineFallbackResponse() {
  return new Response(
    '<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>オフライン｜115万キロのファンノート</title><body style="margin:0;padding:24px;font-family:sans-serif;background:#faf6eb;color:#253331;"><main style="max-width:480px;margin:40px auto;background:#fffdf8;border:1px solid #dfd7c7;border-radius:16px;padding:24px;"><h1 style="font-size:20px;margin:0 0 12px;">通信に接続できません</h1><p style="font-size:14px;line-height:1.7;margin:0 0 16px;">電波のよい場所で再読み込みすると、最新のページを開けます。</p><a href="" style="display:inline-block;text-decoration:none;padding:10px 18px;border-radius:10px;border:none;background:#253331;color:#faf6eb;font-size:14px;cursor:pointer;">再読み込み</a></main></body></html>',
    {
      status: 503,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
        'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'",
        'Referrer-Policy': 'no-referrer',
        'X-Content-Type-Options': 'nosniff',
      },
    },
  );
}

async function fetchBounded(request) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), NETWORK_TIMEOUT_MS);
  try {
    return await fetch(request, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function expectedContentTypeMatches(urlPathname, isNavigation, response) {
  const ct = (response.headers.get('Content-Type') || '').toLowerCase();
  if (!ct) return true;
  if (isNavigation) return ct.includes('text/html');
  if (urlPathname.endsWith('.js')) return ct.includes('javascript');
  if (urlPathname.endsWith('.css')) return ct.includes('text/css');
  return true;
}

async function storeSafely(cache, key, response, urlPathname, isNavigation) {
  if (!cache || !response || response.status !== 200 || response.type !== 'basic' || response.redirected) return;
  const cacheControl = response.headers.get('Cache-Control') || '';
  if (/no-store/i.test(cacheControl)) return;
  if (!expectedContentTypeMatches(urlPathname, isNavigation, response)) return;
  try {
    await cache.put(key, response.clone());
    const keys = await cache.keys();
    const extra = keys.filter(req => !CORE_KEYS.has(cacheKeyFor(req)));
    for (const obsolete of extra.slice(0, Math.max(0, extra.length - MAX_RUNTIME_ENTRIES))) {
      await cache.delete(obsolete);
    }
  } catch {
    // 端末の保存容量上限でも表示を失敗させない。
  }
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(CORE_ASSETS.map(url => new Request(url, { cache: 'reload' })));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(
      names
        .filter(name => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
        .map(name => caches.delete(name)),
    );
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  if (request.cache === 'only-if-cached' && request.mode !== 'same-origin') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (!url.pathname.startsWith('/higedanfan/')) return;
  if (url.pathname === '/higedanfan/sw.js') return;

  const isNavigation = request.mode === 'navigate';
  const isHashedAsset = url.pathname.startsWith('/higedanfan/assets/');
  const isManifest = request.destination === 'manifest' || url.pathname.endsWith('/manifest.webmanifest');
  if (!isNavigation && !isHashedAsset && !isManifest && !['style', 'script', 'image', 'font'].includes(request.destination)) {
    return;
  }

  const key = cacheKeyFor(request);

  if (isHashedAsset) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME).catch(() => null);
      if (cache) {
        const cached = await cache.match(key).catch(() => undefined);
        if (cached) return cached;
      }
      try {
        const response = await fetchBounded(request);
        if (cache) {
          event.waitUntil(storeSafely(cache, key, response, url.pathname, false));
        }
        return response;
      } catch {
        return Response.error();
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME).catch(() => null);
    try {
      const response = await fetchBounded(request);
      if (response.status >= 500 && isNavigation) {
        throw new Error('Server error during navigation');
      }
      if (cache) {
        event.waitUntil(storeSafely(cache, key, response, url.pathname, isNavigation));
      }
      return response;
    } catch {
      if (cache) {
        const cached = await cache.match(key).catch(() => undefined);
        if (cached) return cached;
        if (isNavigation && !url.pathname.startsWith('/higedanfan/songs/')) {
          const homeCached = await cache.match(canonicalUrl('/higedanfan/').href).catch(() => undefined);
          if (homeCached) return homeCached;
        }
      }
      if (isNavigation) return offlineFallbackResponse();
      return Response.error();
    }
  })());
});
`;
}

/** Emits a content-hashed Service Worker script into the Vite dist directory. */
export function emitPwaServiceWorker(distDir: string): string {
  const indexHtmlPath = path.join(distDir, 'index.html');
  const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
  const coreAssets = extractIndexShellAssets(indexHtml);

  const hash = crypto.createHash('sha256');
  for (const filePath of walkBuildFiles(distDir)) {
    hash.update(path.relative(distDir, filePath).replaceAll('\\', '/'));
    hash.update(fs.readFileSync(filePath));
  }
  const cacheName = `${HIGEDAN_SW_CACHE_PREFIX}${hash.digest('hex').slice(0, 16)}`;
  const source = buildServiceWorkerSource({ cacheName, coreAssets });
  fs.writeFileSync(path.join(distDir, 'sw.js'), source, 'utf8');
  return cacheName;
}
