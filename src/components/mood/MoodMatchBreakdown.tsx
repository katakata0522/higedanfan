import type { ScoredSongMatch } from '../../utils/fanLogic';

export function MoodMatchBreakdown({ match }: { match: ScoredSongMatch }) {
  return (
    <div className="rounded-xl border border-[#E6E1D6] bg-[#FBF9F5] p-4">
      <h4 className="text-xs font-bold text-[#1C1917]">この曲が候補に入った条件</h4>
      {match.matchReasons.length ? (
        <>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {match.matchReasons.map(reason => (
              <li key={reason} className="rounded-full border border-[#D5CEC2] bg-white px-2.5 py-1 text-xs text-[#292524]">{reason}</li>
            ))}
          </ul>
          <p className="mt-2 text-xs leading-relaxed text-[#57534E]">当サイトの楽曲分類と、曲の長さをもとに選んでいます。</p>
        </>
      ) : (
        <p className="mt-2 text-xs leading-relaxed text-[#57534E]">一致する条件はありませんでした。ほかの答えも試してみてください。</p>
      )}
    </div>
  );
}
