import { useState } from 'react';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import type { MoodTag, SituationTag, SoundTag } from '../../data/higedanData';
import type { MoodCriteria } from '../../utils/fanLogic';

interface Choice<T extends string> {
  id: T;
  code: string;
  label: string;
  sub: string;
}

const MOOD_OPTIONS: Choice<MoodTag>[] = [
  { id: 'push_back', code: 'A', label: '背中を押してほしい', sub: '前を向く勇気と肯定感がほしいとき' },
  { id: 'heartbreak_night', code: 'B', label: '切ない夜に浸りたい', sub: '心に寄り添う優しい旋律を聴きたいとき' },
  { id: 'euphoric_drive', code: 'C', label: '最高に盛り上がりたい', sub: '高揚感あふれるグルーヴに飛び込みたいとき' },
  { id: 'deep_lyric', code: 'D', label: '深い歌詞を味わいたい', sub: '余韻の残る言葉と物語に浸りたいとき' },
];

const SITUATION_OPTIONS: Choice<SituationTag>[] = [
  { id: 'morning_commute', code: 'A', label: '朝の通勤・通学', sub: '1日のスタートを気持ちよく切りたい場面' },
  { id: 'late_night_alone', code: 'B', label: 'ひとり静かな夜', sub: '部屋の明かりを落としてじっくり聴く場面' },
  { id: 'live_warmup', code: 'C', label: 'ライブ前・ドライブ', sub: 'テンションを一気に引き上げたい場面' },
  { id: 'weekend_walk', code: 'D', label: '休日の散歩・カフェ', sub: '肩の力を抜いてリラックスしたい場面' },
];

const SOUND_OPTIONS: Choice<SoundTag>[] = [
  { id: 'piano_pop', code: 'A', label: '王道ピアノポップ', sub: '美しいピアノリフとグッドメロディ' },
  { id: 'brass_funk', code: 'B', label: 'ブラス＆ファンク', sub: '華やかなホーン隊と躍動するリズム' },
  { id: 'emotional_ballad', code: 'C', label: 'エモーショナルバラード', sub: '胸を締め付ける歌声と壮大なストリングス' },
  { id: 'stadium_rock', code: 'D', label: 'スタジアムロック', sub: '熱量あふれるバンドサウンドと転調の嵐' },
];

interface QuestionProps<T extends string> {
  title: string;
  description: string;
  options: Choice<T>[];
  onChoose: (answer: T) => void;
}

function Question<T extends string>({title, description, options, onChoose}: QuestionProps<T>) {
  return (
    <div>
      <h3 className="text-lg sm:text-2xl font-bold text-[#1C1917]">
        {title}
      </h3>
      <p className="mt-1 text-xs sm:text-sm text-[#57534E]">
        {description}
      </p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChoose(opt.id)}
            className="group flex items-center justify-between rounded-xl border border-[#E6E1D6] bg-[#FBF9F5] p-4 sm:p-5 text-left hover:border-[#1C1917] hover:bg-white transition-all cursor-pointer"
          >
            <div className="flex items-start gap-3.5 pr-3">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#F2EFE9] font-mono-num text-xs font-bold text-[#1C1917] group-hover:bg-[#C83E2B] group-hover:text-white transition-colors">
                {opt.code}
              </span>
              <div>
                <div className="text-sm sm:text-base font-bold text-[#1C1917]">
                  {opt.label}
                </div>
                <div className="mt-1 text-xs text-[#57534E]">
                  {opt.sub}
                </div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-[#78716C] group-hover:translate-x-0.5 group-hover:text-[#1C1917] transition-transform" />
          </button>
        ))}
      </div>
    </div>
  );
}

export function MoodQuestionnaire({onComplete}: {onComplete: (criteria: MoodCriteria) => void}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [mood, setMood] = useState<MoodTag>('push_back');
  const [situation, setSituation] = useState<SituationTag>('morning_commute');

  return (
    <div className="mt-6 rounded-2xl border border-[#E6E1D6] bg-white p-5 sm:p-8 shadow-[0_2px_12px_rgba(28,25,23,0.03)]">
      {/* Step Progress Header */}
      <div className="flex items-center justify-between gap-4 pb-5 mb-6 border-b border-[#E6E1D6]">
        <div className="flex items-center gap-2.5">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep((prev) => (prev === 3 ? 2 : 1))}
              className="inline-flex items-center gap-1 rounded-md border border-[#D5CEC2] bg-[#FBF9F5] px-2.5 py-1 text-xs font-bold text-[#57534E] hover:border-[#1C1917] hover:text-[#1C1917] transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              戻る
            </button>
          )}
          <span className="text-xs font-bold text-[#C83E2B] font-mono-num">
            質問 {step} / 3
          </span>
        </div>

        <div className="flex items-center gap-1.5 w-32 sm:w-48" aria-hidden="true">
          {[1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                idx <= step ? 'bg-[#C83E2B]' : 'bg-[#E6E1D6]'
              }`}
            />
          ))}
        </div>
      </div>
      {step === 1 && (
        <Question
          title="Q1. 今のあなたの気分はどれに一番近いですか？"
          description="直感でひとつ選ぶと、次の質問へ進みます。"
          options={MOOD_OPTIONS}
          onChoose={answer => {
            setMood(answer);
            setStep(2);
          }}
        />
      )}
      {step === 2 && (
        <Question
          title="Q2. どんな場面・時間帯に聴きたいですか？"
          description="選んだ場面と、曲ごとの分類を照らし合わせます。"
          options={SITUATION_OPTIONS}
          onChoose={answer => {
            setSituation(answer);
            setStep(3);
          }}
        />
      )}
      {step === 3 && (
        <Question
          title="Q3. 今一番聴きたいサウンド・曲調はどれですか？"
          description="選択すると、あなたへのマイソング診断結果が表示されます。"
          options={SOUND_OPTIONS}
          onChoose={sound => onComplete({mood, situation, sound})}
        />
      )}
    </div>
  );
}
