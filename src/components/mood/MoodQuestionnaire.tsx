import { useEffect, useRef } from 'react';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import type { MoodAnswer, MoodSession, MoodStep } from './moodSession';

interface Choice {
  id: MoodAnswer;
  label: string;
  sub?: string;
}

interface QuestionDefinition {
  title: string;
  description: string;
  options: Choice[];
}

const QUESTIONS: Record<MoodStep, QuestionDefinition> = {
  1: {
    title: '今、どんな気分？',
    description: '直感にいちばん近いものを選んでみて。',
    options: [
      { id: 'push_back', label: '背中を押してほしい', sub: '一歩踏み出すきっかけがほしい' },
      { id: 'heartbreak_night', label: '切なさに浸りたい', sub: '今の気持ちをゆっくり味わいたい' },
      { id: 'euphoric_drive', label: '思いきり盛り上がりたい', sub: '気分を上げて、音に身を任せたい' },
      { id: 'deep_lyric', label: '言葉や音をじっくり味わいたい', sub: '何度も聴き返したくなる曲に出会いたい' },
    ],
  },
  2: {
    title: 'どんな場面で聴きたい？',
    description: 'これから過ごす時間を思い浮かべて。',
    options: [
      { id: 'morning_commute', label: '朝の通勤・通学', sub: '一日が始まる、その前に' },
      { id: 'late_night_alone', label: 'ひとり静かな夜', sub: '自分の時間にそっと流したい' },
      { id: 'live_warmup', label: 'ライブ前・ドライブ', sub: '出かける前から気分を高めたい' },
      { id: 'weekend_walk', label: '休日の散歩・カフェ', sub: 'のんびり過ごす時間のおともに' },
    ],
  },
  3: {
    title: '今、惹かれるサウンドは？',
    description: '迷ったら、今日いちばん聴きたい音を。',
    options: [
      { id: 'piano_pop', label: '王道ピアノポップ', sub: 'ピアノとメロディを楽しみたい' },
      { id: 'brass_funk', label: 'ブラス＆ファンク', sub: '華やかな音とリズムに乗りたい' },
      { id: 'emotional_ballad', label: 'エモーショナルバラード', sub: '歌声にじっくり耳を傾けたい' },
      { id: 'stadium_rock', label: 'スタジアムロック', sub: 'バンドの力強い音を浴びたい' },
    ],
  },
  4: {
    title: '聴きたい時期や作品はある？',
    description: '選んだ分類の曲を優先します。ほかの時期も候補に入ります。',
    options: [
      { id: 'any', label: 'どの時期の曲も聴きたい' },
      { id: 'indies_escaparade', label: '初期〜エスカパレード' },
      { id: 'traveler', label: 'Traveler期' },
      { id: 'editorial', label: 'Editorial期' },
      { id: 'rejoice', label: 'Rejoice期' },
      { id: 'latest_2025_2026', label: '2024〜2026年の曲' },
    ],
  },
  5: {
    title: '曲の長さはどれくらいがいい？',
    description: '選んだ長さを優先します。決めずに探しても大丈夫。',
    options: [
      { id: 'any', label: '長さはこだわらない' },
      { id: 'under4', label: '４分未満' },
      { id: 'fourToFive', label: '４分以上５分未満' },
      { id: 'fivePlus', label: '５分以上' },
    ],
  },
};

const ANSWER_FIELDS = ['mood', 'situation', 'sound', 'era', 'length'] as const;

interface MoodQuestionnaireProps {
  session: MoodSession;
  onChoose: (answer: MoodAnswer) => void;
  onBack: () => void;
  onCancelEdit: () => void;
}

export function MoodQuestionnaire({ session, onChoose, onBack, onCancelEdit }: MoodQuestionnaireProps) {
  const { step, answers, editing } = session;
  const question = QUESTIONS[step];
  const selected = answers[ANSWER_FIELDS[step - 1]];
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  return (
    <div className="mt-6 rounded-2xl border border-[#E6E1D6] bg-white p-5 sm:p-8 shadow-[0_2px_12px_rgba(28,25,23,0.03)]">
      <div className="flex items-center justify-between gap-4 pb-5 mb-6 border-b border-[#E6E1D6]">
        <div className="flex items-center gap-2.5">
          {(step > 1 || editing) && (
            <button
              type="button"
              onClick={editing ? onCancelEdit : onBack}
              className="inline-flex items-center gap-1 rounded-md border border-[#D5CEC2] bg-[#FBF9F5] px-2.5 py-1 text-xs font-bold text-[#57534E] hover:border-[#1C1917] hover:text-[#1C1917] transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              {editing ? '結果に戻る' : '戻る'}
            </button>
          )}
          <span className="text-xs font-bold text-[#C83E2B] font-mono-num">
            質問 {step} / 5
          </span>
        </div>
        <div className="flex items-center gap-1.5 w-24 sm:w-48" aria-hidden="true">
          {[1, 2, 3, 4, 5].map(idx => (
            <div key={idx} className={['h-1.5 flex-1 rounded-full transition-colors', idx <= step ? 'bg-[#C83E2B]' : 'bg-[#E6E1D6]'].join(' ')} />
          ))}
        </div>
      </div>

      <h3 ref={headingRef} tabIndex={-1} className="text-lg sm:text-2xl font-bold text-[#1C1917] focus:outline-none">
        {question.title}
      </h3>
      <p className="mt-1 text-xs sm:text-sm text-[#57534E]">{question.description}</p>
      {editing && <p className="mt-2 text-xs text-[#57534E]">選ぶと、この回答だけを変えて結果に戻ります。</p>}

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {question.options.map((option, index) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChoose(option.id)}
            aria-pressed={option.id === selected}
            className={[
              'group flex items-center justify-between rounded-xl border p-4 sm:p-5 text-left hover:border-[#1C1917] hover:bg-white transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C83E2B]',
              option.id === selected ? 'border-[#C83E2B] bg-[#FFF6F3]' : 'border-[#E6E1D6] bg-[#FBF9F5]',
            ].join(' ')}
          >
            <div className="flex items-start gap-3.5 pr-3">
              <span aria-hidden="true" className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#F2EFE9] font-mono-num text-xs font-bold text-[#1C1917] group-hover:bg-[#C83E2B] group-hover:text-white transition-colors">
                {String.fromCharCode(65 + index)}
              </span>
              <div>
                <div className="text-sm sm:text-base font-bold text-[#1C1917]">{option.label}</div>
                {option.sub && <div className="mt-1 text-xs text-[#57534E]">{option.sub}</div>}
                {option.id === selected && <div className="mt-1 text-xs font-bold text-[#A93020]">選択中</div>}
              </div>
            </div>
            <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 text-[#78716C] group-hover:translate-x-0.5 group-hover:text-[#1C1917] transition-transform" />
          </button>
        ))}
      </div>
    </div>
  );
}
