import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

export const KURUN_INTRO_SEEN_KEY = 'higedan_intro_seen_v2';
const INTRO_TOTAL_MS = 5700;
const INTRO_LEAVE_MS = 1150;
const INTRO_STATIC_MS = 1100;

const CRAYON_A_PATHS = [
  'M13 16 L22 8 L22 46',
  'M38 16 L46 8 L46 46',
  'M72 9 L70 25',
  'M70 25 C78 19, 98 20, 99 33 C100 45, 84 49, 69 44',
  'M69 10 C80 9, 91 9, 98 8',
  'M115 13 C131 11, 147 10, 162 10',
  'M138 22 L153 21 C152 34, 146 44, 137 46 L132 42',
  'M141 11 C137 26, 127 39, 113 47',
  'M177 15 C186 14, 196 13, 205 11',
  'M173 27 C186 25, 199 24, 212 22',
  'M189 7 C191 20, 194 34, 196 47',
  'M226 14 L228 43',
  'M226 15 C236 14, 246 13, 255 13 C255 23, 254 33, 252 42',
  'M228 42 C237 41, 245 40, 253 40',
  'M290 15 C286 26, 281 36, 275 40 C271 42, 268 35, 270 26 C273 15, 285 9, 297 12 C307 15, 311 26, 306 37 C302 44, 294 47, 286 46',
] as const;

const CRAYON_B_PATHS = [
  'M19 14 C31 13, 44 12, 55 11 C48 28, 36 42, 18 51',
  'M69 24 C78 23, 88 22, 97 21 C93 26, 89 30, 84 32',
  'M82 27 C82 37, 77 45, 69 51',
  'M115 15 C120 18, 125 21, 129 24',
  'M116 48 C131 44, 146 31, 157 15',
  'M196 11 C190 28, 179 43, 165 52',
  'M212 31 C226 30, 241 29, 255 29',
  'M276 9 C276 23, 276 38, 276 53',
  'M277 25 C287 28, 298 33, 307 38',
] as const;

export function markKurunIntroSeen(): void {
  try {
    window.localStorage.setItem(KURUN_INTRO_SEEN_KEY, '1');
  } catch {
    // Ignore storage quota or sandbox restrictions
  }
}

export function isKurunIntroSeen(): boolean {
  try {
    return window.localStorage.getItem(KURUN_INTRO_SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

interface KurunIntroOverlayProps {
  isOpen: boolean;
  replayToken: number;
  onClose: () => void;
}

type IntroPhase = 'idle' | 'playing' | 'static' | 'leaving';

/** First-visit crayon reveal & curly-mustache ("ひげくるん") opening overlay. */
export function KurunIntroOverlay({ isOpen, replayToken, onClose }: KurunIntroOverlayProps) {
  const [phase, setPhase] = useState<IntroPhase>('idle');
  const overlayRef = useRef<HTMLDivElement>(null);
  const crayonARef = useRef<SVGSVGElement>(null);
  const crayonBRef = useRef<SVGSVGElement>(null);
  const timersRef = useRef<Set<number>>(new Set());
  const rafRef = useRef<number | null>(null);
  const isClosingRef = useRef(false);

  const clearScheduledWork = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current.clear();
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const scheduleTimer = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timersRef.current.delete(id);
      fn();
    }, ms);
    timersRef.current.add(id);
    return id;
  }, []);

  const startLeaving = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    clearScheduledWork();
    markKurunIntroSeen();
    document.body.classList.remove('kurun-intro-active');
    setPhase('leaving');
    scheduleTimer(() => {
      onClose();
    }, INTRO_LEAVE_MS);
  }, [clearScheduledWork, onClose, scheduleTimer]);

  useLayoutEffect(() => {
    if (!isOpen) {
      clearScheduledWork();
      document.body.classList.remove('kurun-intro-active');
      setPhase('idle');
      return;
    }

    const overlay = overlayRef.current;
    const svgA = crayonARef.current;
    const svgB = crayonBRef.current;
    if (!overlay || !svgA || !svgB) return;

    clearScheduledWork();
    isClosingRef.current = false;
    markKurunIntroSeen();
    document.body.classList.add('kurun-intro-active');

    const strokesA = Array.from(svgA.querySelectorAll<SVGPathElement>('.kurun-stroke'));
    const strokesB = Array.from(svgB.querySelectorAll<SVGPathElement>('.kurun-stroke'));
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    if (reducedMotion) {
      [...strokesA, ...strokesB].forEach((path) => {
        path.style.transition = 'none';
        path.style.strokeDasharray = 'none';
        path.style.strokeDashoffset = '0';
      });
      setPhase('static');
      scheduleTimer(startLeaving, INTRO_STATIC_MS);
      return () => {
        clearScheduledWork();
        document.body.classList.remove('kurun-intro-active');
      };
    }

    // Initialize total lengths for stroke-by-stroke crayon hand-drawing timing
    [...strokesA, ...strokesB].forEach((path) => {
      const len = path.getTotalLength();
      path.style.transition = 'none';
      path.style.strokeDasharray = String(len + 1);
      path.style.strokeDashoffset = String(len + 1);
    });

    // Commit initial dashoffset before arming transitions
    void overlay.getBoundingClientRect();

    let delay = 1.04;
    strokesA.forEach((path) => {
      const len = path.getTotalLength();
      const dur = Math.max(0.042, Math.min(0.088, len * 0.00138));
      path.style.transitionProperty = 'stroke-dashoffset';
      path.style.transitionDuration = `${dur.toFixed(3)}s`;
      path.style.transitionDelay = `${delay.toFixed(3)}s`;
      delay += dur + 0.015;
    });

    // 「ファンノート」は画数が少ないため一文字ずつ余韻が残るゆったりめの運筆にする
    delay = Math.max(delay + 0.14, 2.24);
    strokesB.forEach((path) => {
      const len = path.getTotalLength();
      const dur = Math.max(0.068, Math.min(0.135, len * 0.0023));
      path.style.transitionProperty = 'stroke-dashoffset';
      path.style.transitionDuration = `${dur.toFixed(3)}s`;
      path.style.transitionDelay = `${delay.toFixed(3)}s`;
      delay += dur + 0.028;
    });

    setPhase('idle');
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null;
      setPhase('playing');
      [...strokesA, ...strokesB].forEach((path) => {
        path.style.strokeDashoffset = '0';
      });
    });

    scheduleTimer(startLeaving, INTRO_TOTAL_MS);

    return () => {
      clearScheduledWork();
      document.body.classList.remove('kurun-intro-active');
    };
  }, [clearScheduledWork, isOpen, replayToken, scheduleTimer, startLeaving]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        startLeaving();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, startLeaving]);

  if (!isOpen) return null;

  const phaseClass =
    phase === 'playing'
      ? 'is-playing'
      : phase === 'static'
        ? 'is-static'
        : phase === 'leaving'
          ? 'is-leaving'
          : '';

  return (
    <div
      id="kurun-intro-overlay"
      ref={overlayRef}
      onClick={startLeaving}
      className={`kurun-intro kurun-paper-grain ${phaseClass}`.trim()}
      role="dialog"
      aria-modal="true"
      aria-label="115万キロのファンノート オープニング演出"
    >
      <button
        id="kurun-skip-btn"
        className="kurun-skip"
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          startLeaving();
        }}
      >
        スキップする ↗
      </button>

      {/* 背景の手描きクレヨンモチーフ（雪の結晶・コーヒーカップ・ライブ風船・フィルム） */}
      <svg className="kurun-doodle kurun-snowflake" viewBox="0 0 64 64" aria-hidden="true">
        <g filter="url(#kurun-crayon-ink)" fill="none" stroke="#6c8ea4" strokeLinecap="round" strokeLinejoin="round">
          <path strokeWidth="2.1" d="M32 7 L32 57 M10.3 19.5 L53.7 44.5 M53.7 19.5 L10.3 44.5" />
          <path strokeWidth="1.8" d="M26.5 11 L32 16.5 L37.5 11 M47.4 16.7 L45.4 24.3 L52.9 26.3 M52.9 37.7 L45.4 39.7 L47.4 47.3 M26.5 53 L32 47.5 L37.5 53 M11.1 37.7 L18.6 39.7 L16.6 47.3 M16.6 16.7 L18.6 24.3 L11.1 26.3" />
          <path strokeWidth="1.5" d="M32 26.5 L36.8 29.3 L36.8 34.7 L32 37.5 L27.2 34.7 L27.2 29.3 Z" />
        </g>
      </svg>

      <svg className="kurun-doodle kurun-coffee" viewBox="0 0 88 88" aria-hidden="true">
        <g filter="url(#kurun-crayon-ink)" strokeLinecap="round" strokeLinejoin="round">
          <path fill="none" stroke="#9b7857" strokeWidth="1.5" opacity=".82" d="M30 30.5 C27.5 25.5, 32.5 21.5, 29.5 16.5" />
          <path fill="none" stroke="#7e5d40" strokeWidth="1.8" d="M39 29 C35.5 23.5, 43 18, 38.5 11.5 C37.5 10, 40 8.5, 41 8" />
          <path fill="none" stroke="#9b7857" strokeWidth="1.4" opacity=".76" d="M48 31 C45.5 26.5, 50.5 23, 48 18.5" />
          <path fill="rgba(140,109,80,.13)" stroke="#7e5d40" strokeWidth="1.95" d="M7.5 65.5 C7.5 60.8, 21.5 58.2, 39 58.2 C56.5 58.2, 70.5 60.8, 70.5 65.5 C70.5 70.4, 56.5 73.4, 39 73.4 C21.5 73.4, 7.5 70.4, 7.5 65.5 Z" />
          <path fill="none" stroke="#7e5d40" strokeWidth="1.75" opacity=".84" d="M13 69.5 C19.5 74.4, 29.5 76.5, 39 76.5 C48.5 76.5, 58.5 74.4, 65 69.5" />
          <path fill="none" stroke="#7e5d40" strokeWidth="1.55" opacity=".72" d="M27.5 75.9 Q39 78.2 50.5 75.9" />
          <path fill="rgba(140,109,80,.20)" stroke="#7e5d40" strokeWidth="1.45" d="M51.5 67.2 C52.2 64.6, 56.8 63.8, 59.0 65.0 C59.4 67.0, 54.6 69.0, 51.5 67.2 Z" />
          <path fill="none" stroke="#7e5d40" strokeWidth="1.65" d="M59.2 65.2 Q67.5 62.6 74.5 58.5" />
          <path fill="none" stroke="#7e5d40" strokeWidth="2.15" d="M57.6 41.2 C70.5 40.5, 71.5 56.8, 54.8 57.8" />
          <path fill="none" stroke="#7e5d40" strokeWidth="1.45" opacity=".82" d="M57.2 44.8 C65.0 44.5, 65.5 53.2, 56.2 54.4" />
          <path fill="rgba(253,249,241,.95)" stroke="#7e5d40" strokeWidth="2.15" d="M19.5 38.5 C19.8 55.2, 26.5 64.8, 39 64.8 C51.5 64.8, 58.2 55.2, 58.5 38.5 C58.5 35.0, 49.8 33.2, 39 33.2 C28.2 33.2, 19.5 35.0, 19.5 38.5 Z" />
          <path fill="rgba(140,109,80,.19)" stroke="none" d="M45 43.2 C49.2 51.4, 47.6 60.8, 39 64.4 C51.0 64.2, 57.8 55.2, 58.2 39.0 C55.4 41.8, 50.6 42.9, 45 43.2 Z" />
          <path fill="none" stroke="rgba(255,253,248,.94)" strokeWidth="2.0" d="M24.2 46.2 C24.5 52.4, 27.0 57.6, 30.4 60.4" />
          <path fill="rgba(255,252,246,.55)" stroke="#7e5d40" strokeWidth="1.95" d="M19.5 38.5 C19.5 35.0, 28.2 33.2, 39 33.2 C49.8 33.2, 58.5 35.0, 58.5 38.5 C58.5 42.2, 49.8 44.0, 39 44.0 C28.2 44.0, 19.5 42.2, 19.5 38.5 Z" />
          <path fill="rgba(86,52,29,.58)" stroke="#6a4326" strokeWidth="1.35" d="M22.0 39.2 C24.4 36.8, 31 35.8, 39 35.8 C47 35.8, 53.6 36.8, 56.0 39.2 C53.4 41.8, 46.8 42.6, 39 42.6 C31.2 42.6, 24.6 41.8, 22.0 39.2 Z" />
          <path fill="none" stroke="rgba(255,247,232,.86)" strokeWidth="1.4" d="M28.2 39.1 C32.2 37.9, 38.2 38.0, 42.2 39.3 M46 38.7 C48.2 38.2, 50.2 38.4, 51.6 38.9" />
          <path fill="none" stroke="#7e5d40" strokeWidth="1.3" opacity=".52" d="M23 65.8 C30 68.4, 48 68.4, 55 65.8" />
        </g>
      </svg>

      <svg className="kurun-doodle kurun-balloon" viewBox="0 0 80 124" aria-hidden="true">
        <g filter="url(#kurun-crayon-coral)" strokeLinecap="round" strokeLinejoin="round" transform="rotate(-5 41 56)">
          <path fill="none" stroke="#b45c4b" strokeWidth="1.8" d="M41 78 C37 87, 46 94, 39.5 103 C35.5 108.5, 40.5 114.5, 37.8 119.5" />
          <path fill="none" stroke="#c48e44" strokeWidth="1.4" opacity=".84" d="M41.3 77.6 C44.5 82.2, 47.4 85.2, 50.2 88.5" />
          <path fill="rgba(200,150,72,.26)" stroke="#c48e44" strokeWidth="1.5" d="M40.5 76.8 C34.2 73.8, 31.8 77.8, 35.2 80.2 C37.5 81.6, 39.5 78.8, 40.5 76.8 Z M41.5 76.8 C47.8 73.8, 50.2 77.8, 46.8 80.2 C44.5 81.6, 42.5 78.8, 41.5 76.8 Z" />
          <path fill="rgba(202,102,82,.26)" stroke="#bd604e" strokeWidth="2.2" d="M41 8.5 C24.5 8.5, 14.5 21.5, 15.2 37.5 C16.0 53.5, 29.0 66.5, 41 72 C53.0 66.5, 66.0 53.5, 66.8 37.5 C67.5 21.5, 57.5 8.5, 41 8.5 Z" />
          <path fill="rgba(189,96,78,.22)" stroke="none" d="M55.5 16 C61.2 23, 62.2 35, 58.5 47.5 C54.8 58.2, 46.2 66.2, 41 70.4 C52.2 65.5, 64.8 53.0, 65.8 37.5 C66.5 25.0, 60.8 18.2, 55.5 16 Z" />
          <path fill="none" stroke="rgba(189,96,78,.45)" strokeWidth="1.35" d="M55.0 21.5 C58.5 27.8, 59.0 37.5, 55.5 47.0" />
          <path fill="none" stroke="rgba(255,253,246,.95)" strokeWidth="2.45" d="M24.2 21.0 C20.8 26.2, 20.0 33.0, 21.6 39.8" />
          <path fill="none" stroke="rgba(255,253,246,.90)" strokeWidth="2.0" d="M23.8 44.8 C24.5 46.5, 25.4 48.0, 26.6 49.2" />
          <path fill="none" stroke="#bd604e" strokeWidth="1.35" opacity=".76" d="M37.5 66.2 L39.6 70.5 M44.5 66.2 L42.4 70.5" />
          <path fill="rgba(189,96,78,.34)" stroke="#bd604e" strokeWidth="1.85" d="M37.5 76.2 Q41 78.6 44.5 76.2 L42 71.8 L40 71.8 Z" />
        </g>
      </svg>

      <svg className="kurun-doodle kurun-film" viewBox="0 0 96 68" aria-hidden="true">
        <g filter="url(#kurun-crayon-ink)" fill="none" stroke="#61726d" strokeLinecap="round" strokeLinejoin="round">
          <path strokeWidth="2.0" d="M8 22 Q48 10 88 18 M10 52 Q50 40 90 48" />
          <path strokeWidth="1.8" d="M8 22 L10 52 M34 15 L36 45 M62 14 L64 44 M88 18 L90 48" />
          <path strokeWidth="2.2" strokeDasharray="2.4 5.6" d="M13 25 Q48 14 84 21 M14 47.5 Q50 37 85 44" />
          <path fill="#bd604e" stroke="none" opacity="0.82" d="M49 26.5 C46 23, 42 25.5, 43 29 C44 31.5, 49 34.5, 49 34.5 C49 34.5, 54 31.5, 55 29 C56 25.5, 52 23, 49 26.5 Z" />
        </g>
      </svg>

      <div className="kurun-center">
        <svg className="pointer-events-none absolute h-0 w-0 overflow-hidden" aria-hidden="true">
          <defs>
            <filter id="kurun-crayon-coral" x="-16%" y="-20%" width="132%" height="140%">
              <feTurbulence type="fractalNoise" baseFrequency="0.24 0.30" numOctaves="3" seed="4" result="noiseCoral" />
              <feDisplacementMap in="SourceGraphic" in2="noiseCoral" scale="1.75" xChannelSelector="R" yChannelSelector="G" />
            </filter>
            <filter id="kurun-crayon-ink" x="-16%" y="-20%" width="132%" height="140%">
              <feTurbulence type="fractalNoise" baseFrequency="0.23 0.29" numOctaves="3" seed="7" result="noiseInk" />
              <feDisplacementMap in="SourceGraphic" in2="noiseInk" scale="1.85" xChannelSelector="R" yChannelSelector="G" />
            </filter>
            <filter id="kurun-crayon-moustache" x="-6%" y="-14%" width="112%" height="128%">
              <feTurbulence type="fractalNoise" baseFrequency="0.20 0.25" numOctaves="3" seed="11" result="edgeGrain" />
              <feDisplacementMap in="SourceGraphic" in2="edgeGrain" scale="1.65" xChannelSelector="R" yChannelSelector="G" result="roughShape" />
              <feTurbulence type="fractalNoise" baseFrequency="0.52" numOctaves="2" seed="29" result="paperTooth" />
              <feColorMatrix
                in="paperTooth"
                type="matrix"
                values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -2.2 0 0 0 2.42"
                result="toothMask"
              />
              <feComposite in="roughShape" in2="toothMask" operator="in" />
            </filter>
          </defs>
        </svg>

        <h2 className="kurun-title" aria-label="115万キロのファンノート">
          <svg ref={crayonARef} className="kurun-crayon-a" viewBox="0 0 326 56" role="img" aria-label="115万キロの">
            <g filter="url(#kurun-crayon-coral)" stroke="#C83E2B" strokeWidth="5.1">
              {CRAYON_A_PATHS.map((d, idx) => (
                <path key={idx} className="kurun-stroke" d={d} />
              ))}
            </g>
          </svg>

          <svg ref={crayonBRef} className="kurun-crayon-b" viewBox="0 0 326 60" role="img" aria-label="ファンノート">
            <g filter="url(#kurun-crayon-ink)" stroke="#253331" strokeWidth="5.8">
              {CRAYON_B_PATHS.map((d, idx) => (
                <path key={idx} className="kurun-stroke" d={d} />
              ))}
            </g>
          </svg>
        </h2>

        <p className="kurun-sub">Official髭男dism 非公式ファンサイト</p>

        <svg
          className="kurun-art"
          viewBox="0 0 740 215"
          role="img"
          aria-label="中央から左右へくるんと描かれ、クレヨンの質感とハートが弾ける髭マーク"
        >
          <defs>
            <clipPath id="kurunClipLeftHalf"><rect x="0" y="0" width="371" height="215" /></clipPath>
            <clipPath id="kurunClipRightHalf"><rect x="369" y="0" width="371" height="215" /></clipPath>
            <mask id="kurunMoustacheMaskV2" maskUnits="userSpaceOnUse">
              <rect width="740" height="215" fill="black" />
              <g clipPath="url(#kurunClipLeftHalf)">
                <path pathLength={100} className="kurun-mask-body kurun-body-left" d="M426 104 L365 104 C334 101 292 120 238 148" />
                <path pathLength={100} className="kurun-mask-curl kurun-curl-left" d="M244 152 C192 178 126 176 102 142 C86 118 98 90 128 88 C154 86 168 104 162 122 C156 136 134 136 128 122" />
              </g>
              <g clipPath="url(#kurunClipRightHalf)">
                <path pathLength={100} className="kurun-mask-body kurun-body-right" d="M314 104 L375 104 C406 101 448 120 502 148" />
                <path pathLength={100} className="kurun-mask-curl kurun-curl-right" d="M496 152 C548 178 614 176 638 142 C654 118 642 90 612 88 C586 86 572 104 578 122 C584 136 606 136 612 122" />
              </g>
            </mask>
          </defs>

          <g mask="url(#kurunMoustacheMaskV2)" filter="url(#kurun-crayon-moustache)">
            <path
              fill="#2d3c3a"
              d="M370 86 C356 66 338 62 316 62 C254 62 234 156 174 156 C138 156 112 142 112 120 C112 102 125 94 140 94 C153 94 160 103 160 114 C160 124 151 130 142 130 C136 130 132 126 132 121 C132 117 125 117 125 122 C125 132 133 139 144 139 C159 139 170 128 170 112 C170 94 155 82 136 82 C108 82 88 104 88 134 C88 172 144 188 214 188 C286 188 336 156 362 128 C366 124 368 122 370 122 C372 122 374 124 378 128 C404 156 454 188 526 188 C596 188 652 172 652 134 C652 104 632 82 604 82 C585 82 570 94 570 112 C570 128 581 139 596 139 C607 139 615 132 615 122 C615 117 608 117 608 121 C608 126 604 130 598 130 C589 130 580 124 580 114 C580 103 587 94 600 94 C615 94 628 102 628 120 C628 142 602 156 566 156 C506 156 486 62 424 62 C402 62 384 66 370 86 Z"
            />
            <path
              fill="none"
              stroke="#5a6e6a"
              strokeWidth="2.6"
              strokeLinecap="round"
              opacity="0.24"
              d="M362 93 C346 75, 326 73, 304 78 C272 86, 246 146, 198 164 M378 93 C394 75, 414 73, 436 78 C468 86, 494 146, 542 164"
            />
          </g>

          <g className="kurun-heart" filter="url(#kurun-crayon-coral)">
            <path
              d="M370 96 C360 82 346 88 349 101 C351 110 370 120 370 120 C370 120 389 110 391 101 C394 88 380 82 370 96 Z"
              fill="#bd604e"
            />
          </g>
          <g className="kurun-spark" filter="url(#kurun-crayon-coral)" fill="none" stroke="#bd604e" strokeLinecap="round" strokeWidth="3.1">
            <path d="M82 72 L66 48 M64 96 L38 91 M106 62 L105 36" />
          </g>
          <g className="kurun-spark delay" filter="url(#kurun-crayon-ink)" fill="none" stroke="#7f977f" strokeLinecap="round" strokeWidth="3.1">
            <path d="M658 72 L674 48 M676 96 L702 91 M634 62 L635 36" />
          </g>
        </svg>
      </div>

      <div className="kurun-loading" aria-hidden="true"><span /></div>
    </div>
  );
}
