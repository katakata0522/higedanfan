import { useEffect, useRef } from 'react';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { MOOD_CHOICE_LABELS, SITUATION_CHOICE_LABELS, SOUND_PREFERENCE_LABELS } from '../../utils/moodMatching';
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
    title: '今日の気持ちに、いちばん近いのは？',
    description: '深く考えず、心に浮かんだものを。',
    options: [
      { id: 'push_back', label: MOOD_CHOICE_LABELS.push_back, sub: '一歩を踏み出すきっかけに' },
      { id: 'heartbreak_night', label: MOOD_CHOICE_LABELS.heartbreak_night, sub: '今の気持ちを、そのまま大切に' },
      { id: 'euphoric_drive', label: MOOD_CHOICE_LABELS.euphoric_drive, sub: '気分を上げて、音に身を任せて' },
      { id: 'deep_lyric', label: MOOD_CHOICE_LABELS.deep_lyric, sub: '何度も聴き返したくなる一曲を' },
    ],
  },
  2: {
    title: 'この曲、どんな時間に聴こう？',
    description: 'これから過ごすひとときを思い浮かべて。',
    options: [
      { id: 'morning_commute', label: SITUATION_CHOICE_LABELS.morning_commute, sub: '一日のはじまりのおともに' },
      { id: 'late_night_alone', label: SITUATION_CHOICE_LABELS.late_night_alone, sub: '静かな自分の時間に' },
      { id: 'live_warmup', label: SITUATION_CHOICE_LABELS.live_warmup, sub: '出かける時間を音楽と一緒に' },
      { id: 'weekend_walk', label: SITUATION_CHOICE_LABELS.weekend_walk, sub: 'のんびり過ごす時間に' },
    ],
  },
  3: {
    title: '今日は、どんな音と過ごしたい？',
    description: '聴いている自分を想像しながら選んでみて。',
    options: [
      { id: 'rhythm', label: SOUND_PREFERENCE_LABELS.rhythm, sub: '思わず体が動くような音を' },
      { id: 'gentle', label: SOUND_PREFERENCE_LABELS.gentle, sub: 'ゆっくり耳を傾けたいときに' },
      { id: 'melody', label: SOUND_PREFERENCE_LABELS.melody, sub: '歌声やピアノの響きと一緒に' },
      { id: 'powerful', label: SOUND_PREFERENCE_LABELS.powerful, sub: 'バンドの音をたっぷりと' },
    ],
  },
  4: {
    title: 'どの頃のヒゲダンに会いたい？',
    description: '選んだ時期から探します。迷ったらおまかせで。',
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
    title: '今日は、どのくらい聴いていられそう？',
    description: '今の時間に合う長さを選んでみて。',
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

      <div key={step} className="mood-question-enter">
      <h3 ref={headingRef} tabIndex={-1} className="text-lg sm:text-2xl font-bold text-[#1C1917] focus:outline-none">
        {question.title}
      </h3>
      <p className="mt-1 text-xs sm:text-sm text-[#57534E]">{question.description}</p>
      {editing && <p className="mt-2 text-xs text-[#57534E]">選ぶと、この回答だけを変えて結果に戻ります。</p>}

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {question.options.map(option => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChoose(option.id)}
            aria-pressed={option.id === selected}
            className={[
              'mood-answer group flex items-center justify-between rounded-xl border p-4 sm:p-5 text-left hover:border-[#1C1917] hover:bg-white transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C83E2B]',
              option.id === selected ? 'border-[#C83E2B] bg-[#FFF6F3]' : 'border-[#E6E1D6] bg-[#FBF9F5]',
            ].join(' ')}
          >
            <div className="flex items-start gap-3.5 pr-3">
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
    </div>
  );
}
