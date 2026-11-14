import { useLayoutEffect, useRef, type CSSProperties } from 'react';
import { ArrowLeft } from 'lucide-react';
import { EditorProfile } from './EditorProfile';
import { SourcesAndThanks } from './SourcesAndThanks';
import { TermsOfUse } from './TermsOfUse';
import { PrivacyPolicy } from './PrivacyPolicy';
import { infoPages, type InfoPageId } from './infoPages';

interface InfoPageProps {
  page: InfoPageId;
  onExportRecords?: () => void;
  onImportRecords?: (file: File) => Promise<void>;
  onResetAllUserData?: () => void;
  onBackHome?: () => void;
}

export default function InfoPage({
  page,
  onExportRecords,
  onImportRecords,
  onResetAllUserData,
  onBackHome,
}: InfoPageProps) {
  const region = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const previousTitle = document.title;
    document.title = infoPages[page] + '｜115万キロのファンノート';
    const heading = region.current?.querySelector('h1');
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
    return () => { document.title = previousTitle; };
  }, [page]);
  return (
    <div ref={region} className="mx-auto max-w-4xl px-4 pb-12 pt-5 sm:px-6">
      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        {onBackHome && (
          <button
            type="button"
            onClick={onBackHome}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#dfd7c7] bg-[#fffdf8] px-3 py-1 text-xs font-bold text-[#253331] hover:border-[#253331] hover:bg-[#f4efe4] transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-[#C83E2B]" aria-hidden="true" />
            <span>付箋一覧へ戻る</span>
          </button>
        )}
        <span
          className="fusen-washi-tag"
          style={{ '--tape-bg': 'rgba(229, 222, 203, 0.85)' } as CSSProperties}
        >
          ノートの案内
        </span>
      </div>
      {page === 'editor' && <EditorProfile />}
      {page === 'sources' && <SourcesAndThanks />}
      {page === 'terms' && <TermsOfUse />}
      {page === 'privacy' && (
        <PrivacyPolicy
          onExportRecords={onExportRecords}
          onImportRecords={onImportRecords}
          onResetAllUserData={onResetAllUserData}
        />
      )}
    </div>
  );
}
