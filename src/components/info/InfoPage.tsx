import { useLayoutEffect, useRef } from 'react';
import { SourcesAndThanks } from './SourcesAndThanks';
import { TermsOfUse } from './TermsOfUse';
import { PrivacyPolicy } from './PrivacyPolicy';
import { infoPages, type InfoPageId } from './infoPages';

const content = { sources: SourcesAndThanks, terms: TermsOfUse, privacy: PrivacyPolicy };

export default function InfoPage({ page }: { page: InfoPageId }) {
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
  const Content = content[page];
  return (
    <div ref={region} className="mx-auto max-w-4xl px-4 pb-12 pt-5 sm:px-6">
      <Content />
    </div>
  );
}
