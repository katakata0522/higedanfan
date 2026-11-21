import { useCallback, useEffect, useRef } from 'react';
import type { MouseEvent, PointerEvent, RefObject, SyntheticEvent } from 'react';

export interface UseModalDialogOptions {
  isOpen: boolean;
  onClose: () => void;
  initialFocusRef?: RefObject<HTMLElement | null>;
  restoreFocus?: boolean;
}

function isOutsideElementRect(el: HTMLElement, clientX: number, clientY: number): boolean {
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return false;
  return (
    clientX < rect.left ||
    clientX > rect.right ||
    clientY < rect.top ||
    clientY > rect.bottom
  );
}

/**
 * Coordinates native `<dialog>` top-layer lifecycle, initial/restored focus,
 * and press-and-release backdrop dismissal without body overflow locking.
 */
export function useModalDialog({
  isOpen,
  onClose,
  initialFocusRef,
  restoreFocus = true,
}: UseModalDialogOptions) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const pointerDownOutsideRef = useRef(false);
  const onCloseRef = useRef(onClose);
  const initialFocusRefHolder = useRef(initialFocusRef);
  const isOpenRef = useRef(isOpen);

  onCloseRef.current = onClose;
  initialFocusRefHolder.current = initialFocusRef;
  isOpenRef.current = isOpen;

  const restorePreviousFocus = useCallback(() => {
    if (!restoreFocus) {
      previousFocusRef.current = null;
      return;
    }
    const prev = previousFocusRef.current;
    previousFocusRef.current = null;
    if (prev && prev.isConnected) {
      prev.focus({ preventScroll: true });
    }
  }, [restoreFocus]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !isOpen) return undefined;

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (!dialog.open) {
      dialog.showModal();
    }
    const target = initialFocusRefHolder.current?.current;
    if (target) {
      target.focus({ preventScroll: true });
    }

    return () => {
      if (dialog.open) {
        dialog.close();
      }
      restorePreviousFocus();
    };
  }, [isOpen, restorePreviousFocus]);

  const handleCancel = useCallback((event: SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault();
    onCloseRef.current();
  }, []);

  const handleNativeClose = useCallback(() => {
    const dialog = dialogRef.current;
    if (dialog) {
      dialog.returnValue = '';
    }
    pointerDownOutsideRef.current = false;
    if (isOpenRef.current) {
      onCloseRef.current();
    }
    restorePreviousFocus();
  }, [restorePreviousFocus]);

  const handlePointerDown = useCallback((event: PointerEvent<HTMLDialogElement>) => {
    const dialog = dialogRef.current;
    if (!dialog || event.target !== dialog) {
      pointerDownOutsideRef.current = false;
      return;
    }
    pointerDownOutsideRef.current = isOutsideElementRect(
      dialog,
      event.clientX,
      event.clientY,
    );
  }, []);

  const handlePointerCancel = useCallback(() => {
    pointerDownOutsideRef.current = false;
  }, []);

  const handleClick = useCallback((event: MouseEvent<HTMLDialogElement>) => {
    const dialog = dialogRef.current;
    const startedOutside = pointerDownOutsideRef.current;
    pointerDownOutsideRef.current = false;
    if (!dialog || !startedOutside || event.target !== dialog || event.detail === 0) {
      return;
    }
    if (isOutsideElementRect(dialog, event.clientX, event.clientY)) {
      onCloseRef.current();
    }
  }, []);

  return {
    dialogRef,
    dialogProps: {
      onCancel: handleCancel,
      onClose: handleNativeClose,
      onPointerDown: handlePointerDown,
      onPointerCancel: handlePointerCancel,
      onClick: handleClick,
    },
  };
}
