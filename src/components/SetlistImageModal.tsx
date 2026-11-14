import React, { useEffect, useRef, useState } from 'react';
import { Download, X } from 'lucide-react';
import { SongItem } from '../data/higedanData';
import { formatDuration } from '../utils/fanLogic';

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
const CONTENT_WIDTH = CANVAS_WIDTH - PADDING_X * 2;

function wrapTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines = 2,
): string[] {
  const chars = Array.from(text);
  const lines: string[] = [];
  let current = '';

  for (let i = 0; i < chars.length; i += 1) {
    const test = current + chars[i];
    if (ctx.measureText(test).width > maxWidth && current.length > 0) {
      lines.push(current);
      if (lines.length >= maxLines) {
        let last = lines[maxLines - 1];
        while (last.length > 1 && ctx.measureText(`${last}…`).width > maxWidth) {
          last = last.slice(0, -1);
        }
        lines[maxLines - 1] = `${last}…`;
        return lines;
      }
      current = chars[i];
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : ['マイ・ドリームライブ'];
}

function truncateText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let trimmed = text;
  while (trimmed.length > 1 && ctx.measureText(`${trimmed}…`).width > maxWidth) {
    trimmed = trimmed.slice(0, -1);
  }
  return `${trimmed}…`;
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

  const fontDisplay = '"Kaisei Decol", "Shippori Mincho", "Hiragino Mincho ProN", serif';
  const fontBody = '"Noto Sans JP", "Hiragino Sans", sans-serif';
  const fontMono = '"JetBrains Mono", "Roboto Mono", monospace';

  ctx.font = `700 50px ${fontDisplay}`;
  const titleLines = wrapTextLines(ctx, title, CONTENT_WIDTH - 24, 2);

  const rowHeight = 62;
  const headerHeight = 200 + titleLines.length * 64;
  const mainSectionHeight = mainTracks.length > 0 ? 58 + mainTracks.length * rowHeight : 78;
  const encoreSectionHeight = encoreTracks.length > 0 ? 84 + encoreTracks.length * rowHeight : 0;
  const footerHeight = 132;
  const totalHeight = Math.max(760, headerHeight + mainSectionHeight + encoreSectionHeight + footerHeight);

  canvas.width = CANVAS_WIDTH;
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
  ctx.fillRect(0, 0, CANVAS_WIDTH, totalHeight);

  // Subtle background motif: notebook grid vs soft ambient stage spotlight
  if (!isStage) {
    ctx.strokeStyle = 'rgba(155, 140, 115, 0.14)';
    ctx.lineWidth = 1;
    for (let x = 24; x < CANVAS_WIDTH; x += 28) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, totalHeight);
      ctx.stroke();
    }
    for (let y = 24; y < totalHeight; y += 28) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }
  } else {
    const grad = ctx.createRadialGradient(CANVAS_WIDTH / 2, 120, 40, CANVAS_WIDTH / 2, 200, 760);
    grad.addColorStop(0, 'rgba(217, 119, 6, 0.16)');
    grad.addColorStop(1, 'rgba(24, 24, 27, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, totalHeight);
  }

  // Outer poster frame
  ctx.fillStyle = cardBg;
  ctx.strokeStyle = border;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(44, 44, CANVAS_WIDTH - 88, totalHeight - 88, 28);
  ctx.fill();
  ctx.stroke();

  // Top accent band
  ctx.fillStyle = accent;
  ctx.fillRect(PADDING_X, 92, 64, 5);
  drawMustacheEmblem(ctx, CANVAS_WIDTH - PADDING_X - 24, 96, accent);

  ctx.font = `700 21px ${fontMono}`;
  ctx.fillStyle = accent;
  ctx.fillText('MY LIVE SETLIST', PADDING_X + 82, 102);

  // Title
  let cursorY = 170;
  ctx.font = `700 50px ${fontDisplay}`;
  ctx.fillStyle = textPrimary;
  for (const line of titleLines) {
    ctx.fillText(line, PADDING_X, cursorY);
    cursorY += 64;
  }

  // Stats strip
  ctx.font = `700 23px ${fontBody}`;
  ctx.fillStyle = textMuted;
  const totalCount = mainTracks.length + encoreTracks.length;
  ctx.fillText(
    `全${totalCount}曲（本編 ${mainTracks.length} · EN ${encoreTracks.length}）  ／  演奏目安 ${formattedDuration}`,
    PADDING_X,
    cursorY + 6,
  );

  cursorY += 38;
  ctx.strokeStyle = divider;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(PADDING_X, cursorY);
  ctx.lineTo(CANVAS_WIDTH - PADDING_X, cursorY);
  ctx.stroke();

  cursorY += 48;

  // Main tracks
  ctx.font = `700 20px ${fontMono}`;
  ctx.fillStyle = textMuted;
  ctx.fillText('MAIN SET', PADDING_X, cursorY);
  cursorY += 34;

  if (mainTracks.length === 0) {
    ctx.font = `500 24px ${fontBody}`;
    ctx.fillStyle = textMuted;
    ctx.fillText('（本編の曲はまだ選ばれていません）', PADDING_X, cursorY + 14);
    cursorY += 56;
  } else {
    mainTracks.forEach((item, index) => {
      const y = cursorY + 28;
      ctx.font = `700 24px ${fontMono}`;
      ctx.fillStyle = accent;
      ctx.fillText(String(index + 1).padStart(2, '0'), PADDING_X, y);

      const durText = formatDuration(item.song.durationSec);
      ctx.font = `600 22px ${fontMono}`;
      const durW = ctx.measureText(durText).width;
      ctx.fillStyle = textMuted;
      ctx.fillText(durText, CANVAS_WIDTH - PADDING_X - durW, y);

      ctx.font = `700 28px ${fontBody}`;
      ctx.fillStyle = textPrimary;
      const safeSongTitle = truncateText(ctx, item.song.title, CONTENT_WIDTH - durW - 96);
      ctx.fillText(safeSongTitle, PADDING_X + 64, y);

      ctx.strokeStyle = divider;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(PADDING_X, y + 22);
      ctx.lineTo(CANVAS_WIDTH - PADDING_X, y + 22);
      ctx.stroke();

      cursorY += rowHeight;
    });
  }

  // Encore tracks
  if (encoreTracks.length > 0) {
    cursorY += 28;
    ctx.font = `700 20px ${fontMono}`;
    ctx.fillStyle = accent;
    ctx.fillText('ENCORE', PADDING_X, cursorY);
    cursorY += 34;

    encoreTracks.forEach((item, index) => {
      const y = cursorY + 28;
      ctx.font = `700 22px ${fontMono}`;
      ctx.fillStyle = accent;
      ctx.fillText(`EN${index + 1}`, PADDING_X, y);

      const durText = formatDuration(item.song.durationSec);
      ctx.font = `600 22px ${fontMono}`;
      const durW = ctx.measureText(durText).width;
      ctx.fillStyle = textMuted;
      ctx.fillText(durText, CANVAS_WIDTH - PADDING_X - durW, y);

      ctx.font = `700 28px ${fontBody}`;
      ctx.fillStyle = textPrimary;
      const safeSongTitle = truncateText(ctx, item.song.title, CONTENT_WIDTH - durW - 110);
      ctx.fillText(safeSongTitle, PADDING_X + 82, y);

      ctx.strokeStyle = divider;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(PADDING_X, y + 22);
      ctx.lineTo(CANVAS_WIDTH - PADDING_X, y + 22);
      ctx.stroke();

      cursorY += rowHeight;
    });
  }

  // Footer watermark
  const footerY = totalHeight - 76;
  ctx.font = `600 20px ${fontBody}`;
  ctx.fillStyle = textMuted;
  ctx.fillText('115万キロのファンノート  |  Official髭男dism 非公式ファンサイト', PADDING_X, footerY);

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
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [theme, setTheme] = useState<PosterTheme>('notebook');
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    const generate = async () => {
      try {
        if (document.fonts) {
          await Promise.allSettled([
            document.fonts.ready,
            document.fonts.load('700 44px "Kaisei Decol"'),
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
        if (!cancelled) setPreviewUrl(url);
      } catch {
        if (!cancelled) setPreviewUrl('');
      }
    };
    void generate();
    return () => {
      cancelled = true;
    };
  }, [isOpen, title, mainTracks, encoreTracks, formattedDuration, theme]);

  if (!isOpen) return null;

  const safeFileBase = (title.replace(/[\\/:*?"<>|]/g, '').trim() || 'my-setlist').slice(0, 40);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="setlist-image-modal-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
      className="fixed inset-0 m-auto max-h-[92vh] w-[calc(100vw-1.5rem)] max-w-xl rounded-2xl border border-[#D5CEC2] bg-[#FFFDF8] p-0 text-[#1C1917] shadow-2xl backdrop:bg-black/55"
    >
      <div className="flex items-center justify-between border-b border-[#E6E1D6] px-5 py-3.5">
        <h3 id="setlist-image-modal-title" className="font-editorial text-base font-bold text-[#1C1917]">
          シェア用セットリスト画像
        </h3>
        <button
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
          <div className="inline-flex rounded-lg border border-[#D5CEC2] bg-[#F2EFE9] p-1 text-xs font-bold">
            <button
              type="button"
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
        ) : (
          <p className="rounded-xl border border-[#E6E1D6] bg-[#F2EFE9] p-6 text-center text-xs text-[#57534E]">
            画像を生成しています…
          </p>
        )}
      </div>
    </dialog>
  );
};
