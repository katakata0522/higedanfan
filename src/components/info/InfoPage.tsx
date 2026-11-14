import { useLayoutEffect, useRef } from 'react';
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
}

export default function InfoPage({
  page,
  onExportRecords,
  onImportRecords,
  onResetAllUserData,
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
