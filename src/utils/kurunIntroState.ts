import { getBrowserLocalStorage } from './browserStorage';

export const KURUN_INTRO_SEEN_KEY = 'higedan_intro_seen_v2';

export function markKurunIntroSeen(): void {
  try {
    getBrowserLocalStorage()?.setItem(KURUN_INTRO_SEEN_KEY, '1');
  } catch {
    // Ignore storage quota or sandbox restrictions
  }
}

export function isKurunIntroSeen(): boolean {
  try {
    return getBrowserLocalStorage()?.getItem(KURUN_INTRO_SEEN_KEY) === '1';
  } catch {
    return false;
  }
}
