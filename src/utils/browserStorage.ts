export interface BrowserStorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const BLOCKED_OBJECT_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

export function getBrowserLocalStorage(): BrowserStorageLike | null {
  try {
    return typeof window !== 'undefined' && window.localStorage ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function getBrowserSessionStorage(): BrowserStorageLike | null {
  try {
    return typeof window !== 'undefined' && window.sessionStorage ? window.sessionStorage : null;
  } catch {
    return null;
  }
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/** Rejects own __proto__/constructor/prototype keys and objects nested deeper than maxDepth. */
export function hasBlockedKey(value: unknown, maxDepth = 12, depth = 0): boolean {
  if (depth > maxDepth) return true;
  if (value === null || typeof value !== 'object') return false;
  if (Array.isArray(value)) {
    for (const item of value) {
      if (hasBlockedKey(item, maxDepth, depth + 1)) return true;
    }
    return false;
  }
  const proto = Object.getPrototypeOf(value);
  if (proto !== Object.prototype && proto !== null) return true;
  for (const key of Object.getOwnPropertyNames(value)) {
    if (BLOCKED_OBJECT_KEYS.has(key)) return true;
    if (hasBlockedKey((value as Record<string, unknown>)[key], maxDepth, depth + 1)) {
      return true;
    }
  }
  return false;
}

export function safeJsonParseBounded(raw: string | null | undefined, maxBytes: number): unknown {
  if (typeof raw !== 'string' || raw.length === 0 || raw.length > maxBytes) return undefined;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return undefined;
  }
}

export function safeRandomUuid(): string {
  if (typeof crypto !== 'undefined') {
    if (typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    if (typeof crypto.getRandomValues === 'function') {
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      bytes[6] = (bytes[6] & 0x0f) | 0x40;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;
      const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
      return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    }
  }
  return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 14)}`;
}
