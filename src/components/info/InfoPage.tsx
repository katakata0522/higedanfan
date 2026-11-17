import { useLayoutEffect, useRef } from 'react';
import { EditorProfile } from './EditorProfile';
import { SourcesAndThanks } from './SourcesAndThanks';
import { TermsOfUse } from './TermsOfUse';
import { PrivacyPolicy } from './PrivacyPolicy';
import { infoPages, infoPageDescriptions, type InfoPageId } from './infoPages';

interface InfoPageProps {
  page: InfoPageId;
  onExportRecords?: () => void;
  onImportRecords?: (file: File) => Promise<void>;
  onResetAllUserData?: (options?: { skipConfirm?: boolean }) => void | Promise<void>;
}

export default function InfoPage({
  page,
  onExportRecords,
  onImportRecords,
  onResetAllUserData,
}: InfoPageProps) {
  const region = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const title = `${infoPages[page]}｜115万キロのファンノート — Official髭男dism 非公式ファンサイト`;
    const description = infoPageDescriptions[page];
    document.title = title;
    const setMeta = (selector: string, content: string) => {
      document.querySelector<HTMLMetaElement>(selector)?.setAttribute('content', content);
    };
    setMeta('meta[name="description"]', description);
    setMeta('meta[property="og:title"]', title);
    setMeta('meta[property="og:description"]', description);
    setMeta('meta[name="twitter:title"]', title);
    setMeta('meta[name="twitter:description"]', description);
    const heading = region.current?.querySelector('h1');
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [page]);
  return (
    <div ref={region} className="mx-auto max-w-4xl px-4 pb-12 pt-4 sm:px-6 sm:pt-5">
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
