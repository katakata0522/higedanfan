import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'default' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}

/** Accessible native <dialog> confirmation prompt matching the notebook design. */
export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = '実行する',
  cancelLabel = 'キャンセル',
  tone = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !isOpen) return undefined;

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    if (!dialog.open) {
      dialog.showModal();
    }

    const focusTimer = window.setTimeout(() => {
      if (tone === 'danger') {
        cancelButtonRef.current?.focus({ preventScroll: true });
      } else {
        confirmButtonRef.current?.focus({ preventScroll: true });
      }
    }, 0);

    return () => {
      window.clearTimeout(focusTimer);
      if (dialog.open) {
        dialog.close();
      }
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) {
        previousFocus.focus({ preventScroll: true });
      }
    };
  }, [isOpen, tone]);

  if (!isOpen) return null;

  const paragraphs = description
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-desc"
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) onCancel();
      }}
      className="fixed inset-0 m-auto w-[calc(100vw-2rem)] max-w-md rounded-2xl border border-[#D5CEC2] bg-[#FFFDF8] p-0 text-[#1C1917] shadow-2xl backdrop:bg-black/45"
    >
      <div className="flex items-start justify-between gap-3 border-b border-[#E6E1D6] px-5 py-3.5">
        <h2
          id="confirm-dialog-title"
          className="font-note-serif text-base font-bold leading-snug text-[#253331]"
        >
          {title}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          aria-label="閉じる"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#57534E] hover:bg-[#F2EFE9] hover:text-[#1C1917] cursor-pointer"
        >
          <X aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>

      <div id="confirm-dialog-desc" className="space-y-2 px-5 py-4 text-sm leading-relaxed text-[#57534E]">
        {paragraphs.map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>

      <div className="flex flex-wrap-reverse items-center justify-end gap-2.5 border-t border-[#E6E1D6] bg-[#FAF6EB]/70 px-5 py-3.5">
        <button
          ref={cancelButtonRef}
          type="button"
          onClick={onCancel}
          className="min-h-10 rounded-full border border-[#D5CEC2] bg-white px-4 py-2 text-xs font-bold text-[#253331] hover:border-[#253331] hover:bg-[#F2EFE9] transition-colors cursor-pointer"
        >
          {cancelLabel}
        </button>
        <button
          ref={confirmButtonRef}
          type="button"
          onClick={onConfirm}
          className={`min-h-10 rounded-full px-4 py-2 text-xs font-bold text-white transition-colors cursor-pointer ${
            tone === 'danger'
              ? 'bg-[#A93020] hover:bg-[#8E2618]'
              : 'bg-[#253331] hover:bg-[#C83E2B]'
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
