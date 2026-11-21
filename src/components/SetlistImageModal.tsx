import React, { useEffect, useRef, useState } from 'react';
import { Download, X } from 'lucide-react';
import type { SongItem } from '../data/higedanTypes';
import { formatDuration } from '../utils/format';
import { useModalDialog } from '../hooks/useModalDialog';

export type PosterTheme = 'notebook' | 'stage';

export interface PosterTrackItem {
  song: SongItem;
}

interface SetlistImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  mainTracks: PosterTrackItem[];
  encoreTracks: PosterTrackItem[];
  formattedDuration: string;
}

const CANVAS_WIDTH = 1080;
const PADDING_X = 88;

function wrapTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines = 2,
): string[] {
  const tokens = text.trim().match(/[A-Za-z0-9.,'’&/()-]+|\s+|./gu) ?? [];
  const lines: string[] = [];
  let current = '';

  const clampLastLine = (): string[] => {
    const chars = Array.from(lines[maxLines - 1]);
    while (chars.length > 1 && ctx.measureText(`${chars.join('')}…`).width > maxWidth) {
      chars.pop();
    }
    lines[maxLines - 1] = `${chars.join('')}…`;
    return lines;
  };

  const pushWrappedCharByChar = (raw: string): boolean => {
    for (const ch of Array.from(raw)) {
      const test = current + ch;
      if (ctx.measureText(test).width > maxWidth && current.length > 0) {
        lines.push(current.trimEnd());
        if (lines.length >= maxLines) return true;
        current = ch;
      } else {
        current = test;
      }
    }
    return false;
  };

  for (const token of tokens) {
    if (/^\s+$/.test(token) && current === '') continue;
    const test = current + token;
    if (current.length > 0 && ctx.measureText(test).width > maxWidth) {
      lines.push(current.trimEnd());
      if (lines.length >= maxLines) return clampLastLine();
      current = '';
      if (/^\s+$/.test(token)) continue;
      if (ctx.measureText(token).width > maxWidth) {
        if (pushWrappedCharByChar(token)) return clampLastLine();
      } else {
        current = token;
      }
    } else if (ctx.measureText(test).width > maxWidth) {
      if (pushWrappedCharByChar(token)) return clampLastLine();
    } else {
      current = test;
    }
  }
  if (current.trimEnd()) lines.push(current.trimEnd());
  return lines.length > 0 ? lines : ['マイ・ドリームライブ'];
}

function truncateText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  const chars = Array.from(text);
  while (chars.length > 1 && ctx.measureText(`${chars.join('')}…`).width > maxWidth) {
    chars.pop();
  }
  return `${chars.join('')}…`;
}

function buildSafeFileBase(rawTitle: string): string {
  const cleaned = rawTitle
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/^\.+/, '')
    .trim()
    .replace(/\s+/g, '-');
  if (!cleaned || /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i.test(cleaned)) {
    return 'higedan-setlist';
  }
  return Array.from(cleaned).slice(0, 40).join('');
}

function drawMustacheEmblem(ctx: CanvasRenderingContext2D, cx: number, cy: number, color: string) {
  ctx.save();
  ctx.translate(cx - 24, cy - 10);
  ctx.scale(2, 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(2, 8);
  ctx.bezierCurveTo(2, 8, 6, 4, 10, 6);
  ctx.bezierCurveTo(11.5, 6.8, 12, 8, 12, 8);
  ctx.bezierCurveTo(12, 8, 12.5, 6.8, 14, 6);
  ctx.bezierCurveTo(18, 4, 22, 8, 22, 8);
  ctx.stroke();
  ctx.restore();
}

type PosterRow =
  | { kind: 'heading'; label: string }
  | {
      kind: 'track';
      badge: string;
      title: string;
      durationSec: number;
      isEncore: boolean;
      badgeOffset: number;
    };

function drawPosterTrackRow(
  ctx: CanvasRenderingContext2D,
  row: PosterRow,
  x: number,
  cursorY: number,
  colWidth: number,
  colors: { accent: string; textPrimary: string; textMuted: string; divider: string },
  fonts: { body: string; mono: string },
) {
  if (row.kind === 'heading') {
    ctx.font = `700 20px ${fonts.mono}`;
    ctx.fillStyle = colors.accent;
    ctx.fillText(row.label, x, cursorY + 26);
    return;
  }

  const y = cursorY + 28;
  ctx.font = `700 ${row.isEncore ? 22 : 24}px ${fonts.mono}`;
  ctx.fillStyle = colors.accent;
  ctx.fillText(row.badge, x, y);

  const durText = formatDuration(row.durationSec);
  ctx.font = `600 22px ${fonts.mono}`;
  const durW = ctx.measureText(durText).width;
  ctx.fillStyle = colors.textMuted;
  ctx.fillText(durText, x + colWidth - durW, y);

  ctx.font = `700 28px ${fonts.body}`;
  ctx.fillStyle = colors.textPrimary;
  const safeSongTitle = truncateText(ctx, row.title, colWidth - durW - row.badgeOffset - 24);
  ctx.fillText(safeSongTitle, x + row.badgeOffset, y);

  ctx.strokeStyle = colors.divider;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y + 22);
  ctx.lineTo(x + colWidth, y + 22);
  ctx.stroke();
}

export function renderSetlistPosterDataUrl({
  title,
  mainTracks,
  encoreTracks,
  formattedDuration,
  theme,
}: {
  title: string;
  mainTracks: PosterTrackItem[];
  encoreTracks: PosterTrackItem[];
  formattedDuration: string;
  theme: PosterTheme;
}): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const fontDisplay = '"Fan Note Kiwi", "Kiwi Maru", "Shippori Mincho", "Hiragino Mincho ProN", serif';
  const fontBody = '"Fan Note Sans", "Noto Sans JP", "Hiragino Sans", "Yu Gothic", system-ui, sans-serif';
  const fontMono = 'ui-monospace, "SFMono-Regular", Consolas, monospace';

  const totalCount = mainTracks.length + encoreTracks.length;
  const twoColumns = totalCount >= 13;
  const canvasWidth = twoColumns ? 1440 : CANVAS_WIDTH;
  const paddingX = twoColumns ? 84 : PADDING_X;
  const columnGap = 56;
  const contentWidth = canvasWidth - paddingX * 2;
  const colWidth = twoColumns ? (contentWidth - columnGap) / 2 : contentWidth;

  ctx.font = `500 50px ${fontDisplay}`;
  const titleLines = wrapTextLines(ctx, title, contentWidth - 24, 2);

  const rowHeight = 62;
  const headerHeight = 200 + titleLines.length * 64;
  const footerHeight = 132;

  const combinedRows: PosterRow[] = [
    ...mainTracks.map((item, index) => ({
      kind: 'track' as const,
      badge: String(index + 1).padStart(2, '0'),
      title: item.song.title,
      durationSec: item.song.durationSec,
      isEncore: false,
      badgeOffset: 64,
    })),
    ...(encoreTracks.length > 0
      ? [
          { kind: 'heading' as const, label: 'ENCORE' },
          ...encoreTracks.map((item, index) => ({
            kind: 'track' as const,
            badge: `EN${index + 1}`,
            title: item.song.title,
            durationSec: item.song.durationSec,
            isEncore: true,
            badgeOffset: 82,
          })),
        ]
      : []),
  ];

  let splitAt = Math.ceil(combinedRows.length / 2);
  if (twoColumns && combinedRows[splitAt - 1]?.kind === 'heading') {
    splitAt -= 1;
  }
  const leftRows = twoColumns ? combinedRows.slice(0, splitAt) : [];
  const rightRows = twoColumns ? combinedRows.slice(splitAt) : [];
  const twoColRowCount = Math.max(leftRows.length, rightRows.length);

  const mainSectionHeight = mainTracks.length > 0 ? 58 + mainTracks.length * rowHeight : 78;
  const encoreSectionHeight = encoreTracks.length > 0 ? 84 + encoreTracks.length * rowHeight : 0;
  const bodyHeight = twoColumns
    ? (mainTracks.length > 0 ? 58 : 24) + twoColRowCount * rowHeight
    : mainSectionHeight + encoreSectionHeight;
  const totalHeight = Math.max(760, headerHeight + bodyHeight + footerHeight);

  canvas.width = canvasWidth;
  canvas.height = totalHeight;

  const isStage = theme === 'stage';
  const bg = isStage ? '#18181B' : '#FAF6EB';
  const cardBg = isStage ? '#222126' : '#FFFDF8';
  const border = isStage ? 'rgba(217, 119, 6, 0.35)' : '#DCD3C0';
  const accent = isStage ? '#F59E0B' : '#C83E2B';
  const textPrimary = isStage ? '#F4EDE0' : '#1C1917';
  const textMuted = isStage ? '#A8A29E' : '#57534E';
  const divider = isStage ? 'rgba(255, 255, 255, 0.12)' : '#E6E1D6';

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvasWidth, totalHeight);

  // Subtle background motif: notebook grid vs soft ambient stage spotlight
  if (!isStage) {
    ctx.strokeStyle = 'rgba(155, 140, 115, 0.14)';
    ctx.lineWidth = 1;
    for (let x = 24; x < canvasWidth; x += 28) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, totalHeight);
      ctx.stroke();
    }
    for (let y = 24; y < totalHeight; y += 28) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasWidth, y);
      ctx.stroke();
    }
  } else {
    const grad = ctx.createRadialGradient(canvasWidth / 2, 120, 40, canvasWidth / 2, 200, 760);
    grad.addColorStop(0, 'rgba(217, 119, 6, 0.16)');
    grad.addColorStop(1, 'rgba(24, 24, 27, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvasWidth, totalHeight);
  }

  // Outer poster frame
  ctx.fillStyle = cardBg;
  ctx.strokeStyle = border;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(44, 44, canvasWidth - 88, totalHeight - 88, 28);
  ctx.fill();
  ctx.stroke();

  // Top accent band
  ctx.fillStyle = accent;
  ctx.fillRect(paddingX, 92, 64, 5);
  drawMustacheEmblem(ctx, canvasWidth - paddingX - 24, 96, accent);

  ctx.font = `700 21px ${fontMono}`;
  ctx.fillStyle = accent;
  ctx.fillText('MY LIVE SETLIST', paddingX + 82, 102);

  // Title
  let cursorY = 170;
  ctx.font = `500 50px ${fontDisplay}`;
  ctx.fillStyle = textPrimary;
  for (const line of titleLines) {
    ctx.fillText(line, paddingX, cursorY);
    cursorY += 64;
  }

  // Stats strip
  ctx.font = `700 23px ${fontBody}`;
  ctx.fillStyle = textMuted;
  ctx.fillText(
    `全${totalCount}曲（本編 ${mainTracks.length} · EN ${encoreTracks.length}）  ／  合計時間 ${formattedDuration}`,
    paddingX,
    cursorY + 6,
  );

  cursorY += 38;
  ctx.strokeStyle = divider;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(paddingX, cursorY);
  ctx.lineTo(canvasWidth - paddingX, cursorY);
  ctx.stroke();

  cursorY += 48;

  const colors = { accent, textPrimary, textMuted, divider };
  const fonts = { body: fontBody, mono: fontMono };

  if (twoColumns) {
    if (mainTracks.length > 0) {
      ctx.font = `700 20px ${fontMono}`;
      ctx.fillStyle = textMuted;
      ctx.fillText('MAIN SET', paddingX, cursorY);
      cursorY += 34;
    }

    const rightX = paddingX + colWidth + columnGap;
    leftRows.forEach((row, index) => {
      drawPosterTrackRow(ctx, row, paddingX, cursorY + index * rowHeight, colWidth, colors, fonts);
    });
    rightRows.forEach((row, index) => {
      drawPosterTrackRow(ctx, row, rightX, cursorY + index * rowHeight, colWidth, colors, fonts);
    });
  } else {
    // Main tracks
    ctx.font = `700 20px ${fontMono}`;
    ctx.fillStyle = textMuted;
    ctx.fillText('MAIN SET', paddingX, cursorY);
    cursorY += 34;

    if (mainTracks.length === 0) {
      ctx.font = `500 24px ${fontBody}`;
      ctx.fillStyle = textMuted;
      ctx.fillText('（本編の曲はまだ選ばれていません）', paddingX, cursorY + 14);
      cursorY += 56;
    } else {
      mainTracks.forEach((item, index) => {
        drawPosterTrackRow(
          ctx,
          {
            kind: 'track',
            badge: String(index + 1).padStart(2, '0'),
            title: item.song.title,
            durationSec: item.song.durationSec,
            isEncore: false,
            badgeOffset: 64,
          },
          paddingX,
          cursorY,
          colWidth,
          colors,
          fonts,
        );
        cursorY += rowHeight;
      });
    }

    // Encore tracks
    if (encoreTracks.length > 0) {
      cursorY += 28;
      ctx.font = `700 20px ${fontMono}`;
      ctx.fillStyle = accent;
      ctx.fillText('ENCORE', paddingX, cursorY);
      cursorY += 34;

      encoreTracks.forEach((item, index) => {
        drawPosterTrackRow(
          ctx,
          {
            kind: 'track',
            badge: `EN${index + 1}`,
            title: item.song.title,
            durationSec: item.song.durationSec,
            isEncore: true,
            badgeOffset: 82,
          },
          paddingX,
          cursorY,
          colWidth,
          colors,
          fonts,
        );
        cursorY += rowHeight;
      });
    }
  }

  // Footer watermark
  const footerY = totalHeight - 76;
  ctx.font = `600 20px ${fontBody}`;
  ctx.fillStyle = textMuted;
  ctx.fillText('115万キロのファンノート  |  Official髭男dism 非公式ファンサイト', paddingX, footerY);

  return canvas.toDataURL('image/png');
}

export const SetlistImageModal: React.FC<SetlistImageModalProps> = ({
  isOpen,
  onClose,
  title,
  mainTracks,
  encoreTracks,
  formattedDuration,
}) => {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const { dialogRef, dialogProps } = useModalDialog({
    isOpen,
    onClose,
    initialFocusRef: closeButtonRef,
  });
  const [theme, setTheme] = useState<PosterTheme>('notebook');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [generationError, setGenerationError] = useState<boolean>(false);
  const [retryNonce, setRetryNonce] = useState<number>(0);

  useEffect(() => {
    if (!isOpen) {
      setGenerationError(false);
      return;
    }
    let cancelled = false;
    setGenerationError(false);
    setPreviewUrl('');
    const generate = async () => {
      try {
        if (document.fonts) {
          await Promise.allSettled([
            document.fonts.ready,
            document.fonts.load('500 50px "Fan Note Kiwi"'),
          ]);
        }
      } catch {
        // Fallback to system fonts if FontFaceSet check fails.
      }
      if (cancelled) return;
      try {
        const url = renderSetlistPosterDataUrl({
          title,
          mainTracks,
          encoreTracks,
          formattedDuration,
          theme,
        });
        if (!cancelled) {
          if (url) {
            setPreviewUrl(url);
          } else {
            setPreviewUrl('');
            setGenerationError(true);
          }
        }
      } catch {
        if (!cancelled) {
          setPreviewUrl('');
          setGenerationError(true);
        }
      }
    };
    void generate();
    return () => {
      cancelled = true;
    };
  }, [isOpen, title, mainTracks, encoreTracks, formattedDuration, theme, retryNonce]);

  if (!isOpen) return null;

  const safeFileBase = buildSafeFileBase(title);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="setlist-image-modal-title"
      {...dialogProps}
      className="fixed inset-0 m-auto max-h-[92vh] w-[calc(100vw-1.5rem)] max-w-xl rounded-2xl border border-[#D5CEC2] bg-[#FFFDF8] p-0 text-[#1C1917] shadow-2xl backdrop:bg-black/55"
    >
      <div className="flex items-center justify-between border-b border-[#E6E1D6] px-5 py-3.5">
        <h2 id="setlist-image-modal-title" className="font-editorial text-base font-bold text-[#1C1917]">
          シェア用セットリスト画像
        </h2>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="閉じる"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#57534E] hover:bg-[#F2EFE9] hover:text-[#1C1917] cursor-pointer"
        >
          <X aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4 p-5 overflow-y-auto max-h-[calc(92vh-4rem)]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div
            role="group"
            aria-label="画像テーマの選択"
            className="inline-flex rounded-lg border border-[#D5CEC2] bg-[#F2EFE9] p-1 text-xs font-bold"
          >
            <button
              type="button"
              aria-pressed={theme === 'notebook'}
              onClick={() => setTheme('notebook')}
              className={`rounded-md px-3 py-1.5 transition-colors cursor-pointer ${
                theme === 'notebook'
                  ? 'bg-white text-[#1C1917] shadow-xs'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              ファンノート（白）
            </button>
            <button
              type="button"
              aria-pressed={theme === 'stage'}
              onClick={() => setTheme('stage')}
              className={`rounded-md px-3 py-1.5 transition-colors cursor-pointer ${
                theme === 'stage'
                  ? 'bg-[#18181B] text-[#FDE68A] shadow-xs'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              ライブステージ（黒）
            </button>
          </div>

          {previewUrl && (
            <a
              href={previewUrl}
              download={`${safeFileBase}.png`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#1C1917] px-4 py-2 text-xs font-bold text-white hover:bg-[#3A3531] transition-colors"
            >
              <Download aria-hidden="true" className="h-3.5 w-3.5" />
              PNG画像を保存
            </a>
          )}
        </div>

        {previewUrl ? (
          <div className="rounded-xl bg-[#F2EFE9] p-3 text-center">
            <img
              src={previewUrl}
              alt={`${title} のセットリスト画像プレビュー`}
              className="mx-auto max-h-[56vh] w-auto rounded-lg border border-[#D5CEC2] shadow-sm object-contain"
            />
            <p className="mt-2 text-[11px] text-[#57534E]">
              ※ スマホでは上の画像を長押しして「写真に保存」することもできます
            </p>
          </div>
        ) : generationError ? (
          <div
            role="alert"
            className="rounded-xl border border-[#E6E1D6] bg-[#F2EFE9] p-6 text-center text-xs text-[#57534E] space-y-3"
          >
            <p>画像の生成に失敗しました。もう一度お試しください。</p>
            <button
              type="button"
              onClick={() => setRetryNonce((n) => n + 1)}
              className="inline-flex min-h-9 items-center justify-center rounded-lg border border-[#D5CEC2] bg-white px-4 py-1.5 text-xs font-bold text-[#1C1917] hover:bg-[#FAF6EB] cursor-pointer"
            >
              再試行
            </button>
          </div>
        ) : (
          <p className="rounded-xl border border-[#E6E1D6] bg-[#F2EFE9] p-6 text-center text-xs text-[#57534E]">
            画像を生成しています…
          </p>
        )}
      </div>
    </dialog>
  );
};
