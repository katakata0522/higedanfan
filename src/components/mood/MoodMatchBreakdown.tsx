import { BarChart3 } from 'lucide-react';
import type { ScoredSongMatch } from '../../utils/fanLogic';

export function MoodMatchBreakdown({ match }: { match: ScoredSongMatch }) {
  const breakdown = match.matchBreakdown;
  const rows = [
    {
      label: '今の気分とのシンクロ度',
      matches: breakdown.moodSyncPercent >= 90,
      textColor: 'text-[#C83E2B]',
      barColor: 'bg-[#C83E2B]',
    },
    {
      label: 'シーン・時間帯の適合度',
      matches: breakdown.sceneFitPercent >= 90,
      textColor: 'text-[#1E3A5F]',
      barColor: 'bg-[#1E3A5F]',
    },
    {
      label: 'サウンド・曲調の一致度',
      matches: breakdown.soundMatchPercent === 99,
      textColor: 'text-[#1C1917]',
      barColor: 'bg-[#1C1917]',
    },
  ];
  return (
    <div className="rounded-xl border border-[#E6E1D6] bg-[#FBF9F5] p-4 space-y-2.5">
      <div className="flex items-center justify-between text-xs font-bold text-[#1C1917] border-b border-[#E6E1D6] pb-2">
        <span className="flex items-center gap-1.5">
          <BarChart3 className="h-3.5 w-3.5 text-[#C83E2B]" />
          編集部の選曲基準（基本60点＋気分18点・場面11点・曲調10点）
        </span>
        <span className="font-mono-num text-[#C83E2B]">
          選曲スコア {match.matchScore}点
        </span>
      </div>

      <div className="space-y-2.5 pt-0.5">
        {rows.map(({ label, matches, textColor, barColor }) => (
          <div key={label}>
            <div className="flex justify-between text-[11px] font-medium text-[#1C1917]">
              <span>{label}</span>
              <span className={`font-mono-num font-bold ${textColor}`}>
                {matches ? '一致' : '対象外'}
              </span>
            </div>
            <div aria-hidden="true" className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#E6E1D6]">
              <div
                className={`h-full rounded-full ${barColor}`}
                style={{ width: matches ? '100%' : '0%' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
