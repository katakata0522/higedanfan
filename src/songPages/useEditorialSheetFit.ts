import { useLayoutEffect, useRef, useState } from 'react';

const SHEET_WIDTH = 980;

type SheetFit = { scale: number; height: number } | null;

// PCでは紙面全体を同じ比率で縮める。出典を開いたときは縮小率を変えずに続きをスクロールできる。
export function useEditorialSheetFit(pageId: string, readable: boolean) {
  const frameRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLElement>(null);
  const [fit, setFit] = useState<SheetFit>(null);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    const sheet = sheetRef.current;
    const main = frame?.parentElement;
    if (!frame || !sheet || !main) return;

    if (readable) {
      setFit(previous => previous === null ? previous : null);
      return;
    }

    const desktop = window.matchMedia('(min-width: 761px), (min-width: 521px) and (hover: hover) and (pointer: fine)');
    const details = sheet.querySelector('details');
    let collapsedHeight = 0;
    let animationFrame = 0;
    let disposed = false;

    const measure = () => {
      if (!desktop.matches) {
        setFit(previous => previous === null ? previous : null);
        return;
      }

      const height = sheet.offsetHeight;
      if (!details?.open || collapsedHeight === 0) collapsedHeight = height;
      const mainStyle = window.getComputedStyle(main);
      const availableWidth = main.clientWidth - parseFloat(mainStyle.paddingLeft) - parseFloat(mainStyle.paddingRight);
      const top = frame.getBoundingClientRect().top + window.scrollY;
      const availableHeight = Math.max(1, window.innerHeight - top - parseFloat(mainStyle.paddingBottom));
      const scale = Math.min(1, availableWidth / SHEET_WIDTH, availableHeight / collapsedHeight);

      setFit(previous => previous && Math.abs(previous.scale - scale) < 0.0001 && previous.height === height
        ? previous : { scale, height });
    };

    const schedule = () => {
      if (disposed) return;
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(measure);
    };

    const observer = new ResizeObserver(schedule);
    observer.observe(sheet);
    observer.observe(main);
    desktop.addEventListener('change', schedule);
    window.addEventListener('resize', schedule);
    details?.addEventListener('toggle', schedule);
    void document.fonts.ready.then(schedule);
    measure();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationFrame);
      observer.disconnect();
      desktop.removeEventListener('change', schedule);
      window.removeEventListener('resize', schedule);
      details?.removeEventListener('toggle', schedule);
    };
  }, [pageId, readable]);

  return {
    frameRef,
    sheetRef,
    frameStyle: !readable && fit ? { width: SHEET_WIDTH * fit.scale, height: fit.height * fit.scale } : undefined,
    sheetStyle: !readable && fit ? { transform: `scale(${fit.scale})` } : undefined,
  };
}
