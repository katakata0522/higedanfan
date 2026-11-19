import { useLayoutEffect, useRef } from 'react';
import { EditorProfile } from './EditorProfile';
import { SourcesAndThanks } from './SourcesAndThanks';
import { TermsOfUse } from './TermsOfUse';
import { PrivacyPolicy } from './PrivacyPolicy';
import { type InfoPageId } from './infoPages';
import type { SiteTab } from '../SiteHeader';

interface InfoPageProps {
  page: InfoPageId;
  onSelectTab?: (tab: SiteTab) => void;
  onExportRecords?: () => void;
  onImportRecords?: (file: File) => Promise<void>;
  onResetAllUserData?: (options?: { skipConfirm?: boolean }) => void | Promise<void>;
}

export default function InfoPage({
  page,
  onSelectTab,
  onExportRecords,
  onImportRecords,
  onResetAllUserData,
}: InfoPageProps) {
  const region = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const heading = region.current?.querySelector('h1');
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [page]);
  return (
    <div ref={region} className="mx-auto max-w-4xl px-4 pb-12 pt-4 sm:px-6 sm:pt-5">
      {page === 'editor' && <EditorProfile onSelectTab={onSelectTab} />}
      {page === 'sources' && <SourcesAndThanks onSelectTab={onSelectTab} />}
      {page === 'terms' && <TermsOfUse onSelectTab={onSelectTab} />}
      {page === 'privacy' && (
        <PrivacyPolicy
          onSelectTab={onSelectTab}
          onExportRecords={onExportRecords}
          onImportRecords={onImportRecords}
          onResetAllUserData={onResetAllUserData}
        />
      )}
    </div>
  );
}
