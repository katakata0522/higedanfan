import React, { Fragment, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useModalDialog } from '../hooks/useModalDialog';
import {
  ArrowLeftRight,
  ArrowRight,
  Award,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Compass,
  Download,
  ListMusic,
  MapPin,
  NotebookPen,
  Pencil,
  Sparkles,
  Ticket,
  X,
} from 'lucide-react';
import { SACRED_SPOTS } from '../data/sacredSpotsData';
import { TOUR_ARCHIVES } from '../data/tourArchivesData';
import type { FanReview, SongItem } from '../data/higedanTypes';
import { DEFAULT_SETLIST_TITLE } from '../hooks/fanRecordStore';
import { calculateSetlistStats } from '../utils/setlist';
import {
  displayMyNoteNickname,
  hasCustomMyNoteNickname,
  loadMyNoteProfile,
  loadMyNoteTitleMode,
  loadSetlistShareImageGenerated,
  MY_NOTE_NAME_MAX_LENGTH,
  persistMyNoteProfile,
  persistMyNoteTitleMode,
  sanitizeMyNoteNickname,
  type MyNoteProfile,
  type MyNoteTitleDisplayMode,
} from '../utils/myNoteProfile';
import {
  buildAttendedTimeline,
  buildMyNoteSnapshot,
  buildQuizRecordSummary,
  buildSacredProgressByRegion,
  getStampDisplayDetails,
  isCustomSetlistTitle,
  type MyNoteDetailTab,
  type MyNoteEngagementInput,
  type MyNoteStampItem,
} from '../utils/myNoteSummary';
import {
  loadSavedSetlists,
  persistSavedSetlists,
  switchSavedSetlist,
} from '../utils/savedSetlists';
import { SETLIST_TITLE_LIMIT, type SetlistEntry } from '../utils/setlist';
import { formatIsoDateDot as formatDisplayDate } from '../utils/format';
import { sanitizeUserText } from '../utils/userInput';
import { loadQuizVolumeScores } from './quiz/quizVolumeRecords';
import type { SiteTab } from './SiteHeader';
import { MyNoteRadarChart as RadarPentagonChart } from './myNote/MyNoteRadarChart';
import './MyNoteModal.css';

interface MyNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  songs: SongItem[];
  setlist: SetlistEntry[];
  setlistTitle: string;
  resetEpoch: string;
  visitedSpotIds: string[];
  attendedTourIds: string[];
  bestQuizScore: number | null;
  votedKeys: string[];
  reviews: FanReview[];
  onNavigateTab: (tab: SiteTab) => void;
  onNavigateSong: (songId: string) => void;
  onSwitchSavedSetlist: (entries: SetlistEntry[], title: string) => void;
  onExportRecords: () => void;
}

const STAMPS_PER_PAGE = 20;

const STAMP_TILE_PHRASES: Record<string, readonly string[]> = {
  記憶のタイムカプセル: ['記憶の', 'タイムカプセル'],
  '2つめのワクワクへ': ['2つめの', 'ワクワクへ'],
  広がる推し活の景色: ['広がる', '推し活の景色'],
  '4つの世界をまたぐ者': ['4つの世界を', 'またぐ者'],
  すべてを楽しむ全力髭団: ['すべてを楽しむ', '全力髭団'],
  'これからも、ここからも': ['これからも、', 'ここからも'],
  アンコールの余韻: ['アンコールの', '余韻'],
  ライブの常連さん: ['ライブの', '常連さん'],
  歓声のなかで生きる: ['歓声のなかで', '生きる'],
  ステージを追い続けて: ['ステージを', '追い続けて'],
  ライブハウスの生き字引: ['ライブハウスの', '生き字引'],
  歴代ライブの生き証人: ['歴代ライブの', '生き証人'],
  ツアーバスを追いかけて: ['ツアーバスを', '追いかけて'],
  日本列島ライブ行脚: ['日本列島', 'ライブ行脚'],
  全国ツアーの覇者: ['全国ツアーの', '覇者'],
  ワンマンの熱気に飲まれて: ['ワンマンの', '熱気に飲まれて'],
  特別な夜の目撃者: ['特別な夜の', '目撃者'],
  画面越しの最前列: ['画面越しの', '最前列'],
  街角に響いたフリーライブ: ['街角に響いた', 'フリーライブ'],
  インディーズの初期衝動: ['インディーズの', '初期衝動'],
  夢の武道館の景色: ['夢の', '武道館の景色'],
  Travelerの航海日誌: ['Travelerの', '航海日誌'],
  Editorialの夜明け: ['Editorialの', '夜明け'],
  'SHOCKING NUTSの衝撃': ['SHOCKING', ' NUTSの衝撃'],
  スタジアムを揺らした歓声: ['スタジアムを', '揺らした歓声'],
  国境を越えたシンガロング: ['国境を越えた', 'シンガロング'],
  ゆかりの地コレクション: ['ゆかりの地', 'コレクション'],
  あの風景をこの目で: ['あの風景を', 'この目で'],
  音と景色をつなぐ足あと: ['音と景色を', 'つなぐ足あと'],
  記憶の地図を塗りつぶす旅人: ['記憶の地図を', '塗りつぶす旅人'],
  はじまりの街の風: ['はじまりの', '街の風'],
  原点の地をめぐる旅: ['原点の地を', 'めぐる旅'],
  山陰の路地まで知り尽くす: ['山陰の路地まで', '知り尽くす'],
  ヒゲダンの生まれ育った地: ['ヒゲダンの', '生まれ育った地'],
  都会の片隅でみつけた聖地: ['都会の片隅で', 'みつけた聖地'],
  ネオンとメロディの散歩道: ['ネオンと', 'メロディの', '散歩道'],
  関東エリアのコンパス: ['関東エリアの', 'コンパス'],
  まだ見ぬ街へトランクひとつ: ['まだ見ぬ街へ', 'トランクひとつ'],
  ちょっと遠い国へ行って: ['ちょっと遠い', '国へ行って'],
  パスポートにヒゲダンの記憶: ['パスポートに', 'ヒゲダンの記憶'],
  MVの風景を追いかけて: ['MVの風景を', '追いかけて'],
  '4人の青春の足あと': ['4人の青春の', '足あと'],
  お墨付きの寄り道: ['お墨付きの', '寄り道'],
  街角にひそむヒゲダンの気配: ['街角にひそむ', 'ヒゲダンの気配'],
  二大スタジアムのアンセム: ['二大', 'スタジアムの', 'アンセム'],
  それじゃ夢の中へ: ['それじゃ', '夢の中へ'],
  ちいさなミニライブ開幕: ['ちいさな', 'ミニライブ開幕'],
  フェス枠のセットリスト: ['フェス枠の', 'セットリスト'],
  ホール公演の演出家: ['ホール公演の', '演出家'],
  夢のフルスケール公演: ['夢の', 'フルスケール', '公演'],
  鳴りやまないアンコール: ['鳴りやまない', 'アンコール'],
  奇跡の開幕3曲シンクロ: ['奇跡の開幕', '3曲シンクロ'],
  自分だけのツアーに名を: ['自分だけの', 'ツアーに名を'],
  ふたつめの妄想ステージ: ['ふたつめの', '妄想ステージ'],
  気分で着替える3つの宴: ['気分で着替える', '3つの宴'],
  セットリスト編集長: ['セットリスト', '編集長'],
  夢の公演アーカイブ館長: ['夢の公演', 'アーカイブ館長'],
  '115万キロから始まる夜': ['115万キロから', '始まる夜'],
  涙と笑顔の大団円: ['涙と笑顔の', '大団円'],
  '灼熱のアッパー・フロア': ['灼熱の', 'アッパー・フロア'],
  星降るバラード夜会: ['星降る', 'バラード夜会'],
  鍵盤とブラスの饗宴: ['鍵盤と', 'ブラスの饗宴'],
  ハイトーンの極限へ: ['ハイトーンの', '極限へ'],
  時代を駆け抜けるタイムマシン: ['時代を', '駆け抜ける', 'タイムマシン'],
  '4人のペンが交差する夜': ['4人のペンが', '交差する夜'],
  '拍手喝采のマイ・ベスト公演': ['拍手喝采の', 'マイ・ベスト公演'],
  はじめてのクイズ挑戦状: ['はじめての', 'クイズ挑戦状'],
  知識欲に火がついた: ['知識欲に', '火がついた'],
  検定ロードの折り返し: ['検定ロードの', '折り返し'],
  難問の森を突き進む: ['難問の森を', '突き進む'],
  '12のステージを駆け抜けて': ['12のステージを', '駆け抜けて'],
  髭団のたまご卒業: ['髭団の', 'たまご卒業'],
  ディープな沼の案内役: ['ディープな', '沼の案内役'],
  '難問 BROTHERS級の生還者': ['難問 ', 'BROTHERS級の', '生還者'],
  ディスコグラフィの探検家: ['ディスコグラフィの', '探検家'],
  溢れるヒゲダン愛: ['溢れる', 'ヒゲダン愛'],
  完璧まであとひとかけ: ['完璧まで', 'あとひとかけ'],
  満点のファンファーレ: ['満点の', 'ファンファーレ'],
  知識のハットトリック: ['知識の', 'ハットトリック'],
  ウォーミングアップ完了: ['ウォーミング', 'アップ完了'],
  頼れる先輩髭団: ['頼れる', '先輩髭団'],
  髭男知識のグランドマスター: ['髭男知識の', 'グランドマスター'],
  '1ページ目のライナーノーツ': ['1ページ目の', 'ライナーノーツ'],
  曲の秘密を知りし者: ['曲の秘密を', '知りし者'],
  音と言葉に酔いしれて: ['音と言葉に', '酔いしれて'],
  深まる楽曲のラビリンス: ['深まる楽曲の', 'ラビリンス'],
  全曲制覇のカウントダウン: ['全曲制覇の', 'カウントダウン'],
  すべての物語を抱きしめて: ['すべての物語を', '抱きしめて'],
  ラブとピースは君の中: ['ラブとピースは', '君の中'],
  それぞれの音楽性: ['それぞれの', '音楽性'],
  今日のわたしに届く1曲: ['今日のわたしに', '届く1曲'],
  気分の処方箋コレクター: ['気分の処方箋', 'コレクター'],
  喜怒哀楽を愛す者: ['喜怒哀楽を', '愛す者'],
  カラオケの達人: ['カラオケの', '達人'],
  インタビュー資料室の常連: ['インタビュー', '資料室の常連'],
  '115万キロのフィルム': ['115万キロの', 'フィルム'],
};

function renderStampTileLabel(label: string): React.ReactNode {
  const segments = Object.hasOwn(STAMP_TILE_PHRASES, label)
    ? STAMP_TILE_PHRASES[label]
    : null;
  if (!segments) return label;
  return segments.map((segment, index) => (
    <Fragment key={index}>
      {index > 0 && <wbr />}
      {segment}
    </Fragment>
  ));
}

// Rank subtitles and playstyle descriptions remain curated in myNoteSummary.ts
// so they can be surfaced cleanly once copy review is complete.
const SHOW_TITLE_SUBTITLES = false;

type StampCountMode = 'all' | 'normal' | 'gold';

type StampCategoryFilter =
  | 'all'
  | 'unlocked'
  | 'gold'
  | 'tour'
  | 'spot'
  | 'setlist'
  | 'quiz'
  | 'explore';

const STAMP_CATEGORY_FILTERS: readonly { id: StampCategoryFilter; label: string }[] = [
  { id: 'all', label: 'すべて' },
  { id: 'unlocked', label: '獲得済み' },
  { id: 'tour', label: 'ライブ' },
  { id: 'spot', label: '聖地' },
  { id: 'setlist', label: 'MYセトリ' },
  { id: 'quiz', label: '検定' },
  { id: 'explore', label: '楽曲・探索' },
  { id: 'gold', label: '特別称号' },
];

function SpecialSealIcon() {
  return (
    <svg viewBox="0 0 16 16" width="11" height="11" aria-hidden="true">
      <path
        fill="currentColor"
        d="M8 1.2L9.75 6.25L14.8 8L9.75 9.75L8 14.8L6.25 9.75L1.2 8L6.25 6.25Z"
      />
    </svg>
  );
}

function StampGlyph({ stamp }: { stamp: MyNoteStampItem }) {
  const cls = 'mn-stamp-svg';
  switch (stamp.category) {
    case 'welcome':
      return <NotebookPen size={16} className={cls} aria-hidden="true" />;
    case 'tour':
      return <Ticket size={16} className={cls} aria-hidden="true" />;
    case 'spot':
      return stamp.id.includes('explorer') || stamp.id.includes('spot-') ? (
        <Compass size={16} className={cls} aria-hidden="true" />
      ) : (
        <MapPin size={16} className={cls} aria-hidden="true" />
      );
    case 'setlist':
      return <ListMusic size={16} className={cls} aria-hidden="true" />;
    case 'quiz':
      return <Award size={16} className={cls} aria-hidden="true" />;
    case 'explore':
      return <BookOpen size={16} className={cls} aria-hidden="true" />;
    case 'profile':
    default:
      return <Sparkles size={16} className={cls} aria-hidden="true" />;
  }
}

interface MyNoteModalOpenProps extends MyNoteModalProps {
  activeTab: MyNoteDetailTab;
  onSelectActiveTab: (tab: MyNoteDetailTab) => void;
}

export const MyNoteModal: React.FC<MyNoteModalProps> = (props) => {
  const [activeTab, setActiveTab] = useState<MyNoteDetailTab>('tours');
  if (!props.isOpen) return null;
  return (
    <MyNoteModalOpen
      {...props}
      activeTab={activeTab}
      onSelectActiveTab={setActiveTab}
    />
  );
};

const MyNoteModalOpen: React.FC<MyNoteModalOpenProps> = ({
  isOpen,
  onClose,
  songs,
  setlist,
  setlistTitle,
  resetEpoch,
  visitedSpotIds,
  attendedTourIds,
  bestQuizScore,
  votedKeys,
  reviews,
  onNavigateTab,
  onNavigateSong,
  onSwitchSavedSetlist,
  onExportRecords,
  activeTab,
  onSelectActiveTab,
}) => {
  const titleId = useId();
  const bodyRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const detailBoxRef = useRef<HTMLElement>(null);
  const detailScrollRafRef = useRef<number | null>(null);
  const detailTabRefs = useRef<Partial<Record<MyNoteDetailTab, HTMLButtonElement | null>>>({});
  const nameInputRef = useRef<HTMLInputElement>(null);
  const validSongIds = useMemo(() => new Set(songs.map((song) => song.id)), [songs]);
  const songById = useMemo(() => new Map(songs.map((song) => [song.id, song])), [songs]);
  const { dialogRef, dialogProps } = useModalDialog({
    isOpen,
    onClose,
    initialFocusRef: closeButtonRef,
  });
  const [profile, setProfile] = useState<MyNoteProfile>(() =>
    loadMyNoteProfile(resetEpoch, undefined, validSongIds),
  );
  const [titleMode, setTitleMode] = useState<MyNoteTitleDisplayMode>(() =>
    loadMyNoteTitleMode(resetEpoch),
  );
  const [hasSetlistShareImage, setHasSetlistShareImage] = useState<boolean>(() =>
    loadSetlistShareImageGenerated(resetEpoch),
  );
  const [stampCountMode, setStampCountMode] = useState<StampCountMode>('all');
  const [isEditingName, setIsEditingName] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [stampFilter, setStampFilter] = useState<StampCategoryFilter>('all');
  const [stampPage, setStampPage] = useState(0);
  const [selectedStampId, setSelectedStampId] = useState<string | null>(null);
  const [switchNotice, setSwitchNotice] = useState<string | null>(null);

  useEffect(() => {
    setProfile(loadMyNoteProfile(resetEpoch, undefined, validSongIds));
    setTitleMode(loadMyNoteTitleMode(resetEpoch));
    setHasSetlistShareImage(loadSetlistShareImageGenerated(resetEpoch));
  }, [resetEpoch, validSongIds]);

  useEffect(() => {
    if (!isOpen) return;
    const latest = loadMyNoteProfile(resetEpoch, undefined, validSongIds);
    const openedProfile = latest.opened ? latest : { ...latest, opened: true };
    if (!latest.opened) {
      persistMyNoteProfile(openedProfile, resetEpoch);
    }
    setProfile(openedProfile);
    setTitleMode(loadMyNoteTitleMode(resetEpoch));
    setHasSetlistShareImage(loadSetlistShareImageGenerated(resetEpoch));
    setStampCountMode('all');
    setIsEditingName(false);
    setSwitchNotice(null);
    setSelectedStampId(null);
    setStampFilter('all');
    setStampPage(0);
    if (bodyRef.current) {
      bodyRef.current.scrollTop = 0;
    }
  }, [isOpen, resetEpoch, validSongIds]);

  useEffect(() => {
    return () => {
      if (detailScrollRafRef.current !== null) {
        window.cancelAnimationFrame(detailScrollRafRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isEditingName) {
      nameInputRef.current?.focus();
    }
  }, [isEditingName]);

  const timeline = useMemo(
    () => buildAttendedTimeline(TOUR_ARCHIVES, attendedTourIds),
    [attendedTourIds],
  );
  const spotProgress = useMemo(
    () => buildSacredProgressByRegion(SACRED_SPOTS, visitedSpotIds),
    [visitedSpotIds],
  );
  const quizVolumeScores = useMemo(
    () => loadQuizVolumeScores(resetEpoch),
    [resetEpoch, bestQuizScore, isOpen],
  );
  const quizSummary = useMemo(
    () => buildQuizRecordSummary(quizVolumeScores, bestQuizScore),
    [quizVolumeScores, bestQuizScore],
  );

  const savedSetlists = useMemo(
    () =>
      loadSavedSetlists(
        validSongIds,
        sanitizeUserText(setlistTitle, SETLIST_TITLE_LIMIT) || DEFAULT_SETLIST_TITLE,
        setlist,
        { expectedEpoch: resetEpoch },
      ),
    [validSongIds, setlistTitle, setlist, resetEpoch, isOpen],
  );

  const votedSongCount = useMemo(
    () => new Set(votedKeys.map((key) => key.split(':')[0]).filter(Boolean)).size,
    [votedKeys],
  );

  const engagementInput = useMemo<MyNoteEngagementInput>(() => {
    const liveActiveTitle =
      sanitizeUserText(setlistTitle, SETLIST_TITLE_LIMIT) || DEFAULT_SETLIST_TITLE;
    const allSetlists = savedSetlists.items.map((item) =>
      item.id === savedSetlists.activeId
        ? { title: liveActiveTitle, entries: setlist }
        : { title: item.title, entries: item.entries },
    );
    const hasCustomTitle = allSetlists.some((item) => isCustomSetlistTitle(item.title));
    return {
      noteOpened: profile.opened || isOpen,
      hasCustomNickname: hasCustomMyNoteNickname(profile),
      exportedBackup: profile.exportedBackup,
      attendedTourIds,
      visitedSpotIds,
      setlists: allSetlists,
      savedSetlistCount: savedSetlists.items.length,
      hasCustomSetlistTitle: hasCustomTitle,
      generatedSetlistShareImage: hasSetlistShareImage,
      quizVolumeScores,
      bestQuizScore: quizSummary.bestQuizScore,
      votedSongCount,
      reviewCount: reviews.length,
      readSongIds: profile.readSongIds,
      completedMoods: profile.completedMoods,
      moodCompletedCount: profile.moodCompletedCount,
      visitedVocalRange: profile.visitedVocalRange,
      visitedReferenceArchive: profile.visitedReferenceArchive,
    };
  }, [
    profile,
    isOpen,
    attendedTourIds,
    visitedSpotIds,
    savedSetlists,
    setlistTitle,
    setlist,
    hasSetlistShareImage,
    quizVolumeScores,
    quizSummary.bestQuizScore,
    votedSongCount,
    reviews.length,
  ]);

  const { stamps, rank, radar, playstyle } = useMemo(
    () => buildMyNoteSnapshot(engagementInput),
    [engagementInput],
  );

  const handleToggleTitleMode = () => {
    setTitleMode((prev) => {
      const next: MyNoteTitleDisplayMode = prev === 'rank' ? 'playstyle' : 'rank';
      persistMyNoteTitleMode(next, resetEpoch);
      return next;
    });
  };

  const handleSelectDetailTab = (nextTab: MyNoteDetailTab) => {
    onSelectActiveTab(nextTab);
    if (detailScrollRafRef.current !== null) {
      window.cancelAnimationFrame(detailScrollRafRef.current);
    }
    detailScrollRafRef.current = window.requestAnimationFrame(() => {
      detailScrollRafRef.current = null;
      const body = bodyRef.current;
      const box = detailBoxRef.current;
      if (!body || !box) return;
      const bodyRect = body.getBoundingClientRect();
      const boxRect = box.getBoundingClientRect();
      if (boxRect.top > bodyRect.bottom - 120) {
        body.scrollTo({
          top: Math.max(0, body.scrollTop + (boxRect.top - bodyRect.top) - 16),
          behavior: 'instant',
        });
      }
    });
  };

  const handleDetailTabKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const detailTabs: readonly MyNoteDetailTab[] = ['tours', 'spots', 'setlists', 'quiz'];
    const currentIndex = detailTabs.indexOf(activeTab);
    if (currentIndex === -1) return;
    let nextTab: MyNoteDetailTab | null = null;
    if (event.key === 'ArrowRight') {
      nextTab = detailTabs[(currentIndex + 1) % detailTabs.length];
    } else if (event.key === 'ArrowLeft') {
      nextTab = detailTabs[(currentIndex - 1 + detailTabs.length) % detailTabs.length];
    } else if (event.key === 'Home') {
      nextTab = detailTabs[0];
    } else if (event.key === 'End') {
      nextTab = detailTabs[detailTabs.length - 1];
    }
    if (!nextTab) return;
    event.preventDefault();
    handleSelectDetailTab(nextTab);
    detailTabRefs.current[nextTab]?.focus();
  };

  const handleCycleStampCountMode = () => {
    setStampCountMode((prev) =>
      prev === 'all' ? 'normal' : prev === 'normal' ? 'gold' : 'all',
    );
  };

  const isPlaystyleMain = titleMode === 'playstyle';
  const mainTitle = isPlaystyleMain ? playstyle.title : rank.title;
  const mainSubtitle = isPlaystyleMain ? playstyle.subtitle : rank.subtitle;
  const stampCountVisibleText =
    stampCountMode === 'all'
      ? `${rank.unlockedCount} / ${rank.totalStamps}`
      : stampCountMode === 'normal'
        ? `通常 ${rank.unlockedNormalCount} / ${rank.totalNormalStamps}`
        : `特別 ${rank.unlockedGoldCount} / ${rank.totalGoldStamps}`;
  const stampCountAriaLabel =
    stampCountMode === 'all'
      ? `${stampCountVisibleText}（タップで通常・特別の内訳に切り替え）`
      : stampCountMode === 'normal'
        ? `${stampCountVisibleText}（タップで特別称号の内訳に切り替え）`
        : `${stampCountVisibleText}（タップで全体表示に戻す）`;

  const filteredStamps = useMemo(
    () =>
      stamps.filter((stamp) => {
        if (stampFilter === 'all') return true;
        if (stampFilter === 'unlocked') return stamp.unlocked;
        if (stampFilter === 'gold') return stamp.tier === 'gold';
        return stamp.category === stampFilter;
      }),
    [stamps, stampFilter],
  );

  const totalPages = Math.max(1, Math.ceil(filteredStamps.length / STAMPS_PER_PAGE));
  const safePage = Math.min(stampPage, totalPages - 1);
  const pagedStamps = useMemo(
    () =>
      filteredStamps.slice(
        safePage * STAMPS_PER_PAGE,
        (safePage + 1) * STAMPS_PER_PAGE,
      ),
    [filteredStamps, safePage],
  );

  const activeStamp = useMemo(
    () => stamps.find((item) => item.id === selectedStampId) ?? null,
    [stamps, selectedStampId],
  );
  const activeDetails = useMemo(
    () => (activeStamp ? getStampDisplayDetails(activeStamp) : null),
    [activeStamp],
  );

  const handleRequestClose = () => {
    onClose();
  };

  const handleSaveNickname = (event: React.FormEvent) => {
    event.preventDefault();
    const cleaned = sanitizeMyNoteNickname(draftName);
    const nextProfile: MyNoteProfile = {
      ...profile,
      nickname: cleaned,
      opened: true,
    };
    persistMyNoteProfile(nextProfile, resetEpoch);
    setProfile(loadMyNoteProfile(resetEpoch, undefined, validSongIds));
    setIsEditingName(false);
  };

  const handleSwitchSetlist = (targetId: string) => {
    if (targetId === savedSetlists.activeId) return;
    const { state, target } = switchSavedSetlist(savedSetlists, targetId);
    if (!target) return;
    persistSavedSetlists(state, {
      expectedEpoch: resetEpoch,
      validSongIds,
    });
    onSwitchSavedSetlist(target.entries, target.title);
    setSwitchNotice(`「${target.title}」に切り替えました。`);
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className="my-note-dialog"
      {...dialogProps}
    >
      <header className="mn-head">
        <h2 id={titleId} className="mn-head-title">
          マイノート
        </h2>
        <p className="mn-head-sub">
          集めたスタンプとあなたの推し旅の記録を一冊に。
        </p>
        <button
          ref={closeButtonRef}
          type="button"
          className="mn-close-x"
          aria-label="マイノートを閉じる"
          onClick={handleRequestClose}
        >
          <X size={20} aria-hidden="true" />
        </button>
      </header>

      <div ref={bodyRef} className="mn-body">
        <div className="mn-hero-grid">
          {/* Left column: Stamps collection */}
          <section className="mn-card mn-card--soft" aria-label="訪問・記念スタンプ">
            <div className="mn-card-header">
              <h3 className="mn-card-label">訪問・記念スタンプ</h3>
              <button
                type="button"
                onClick={handleCycleStampCountMode}
                className={`mn-card-count mn-count-cycle-btn ${
                  stampCountMode === 'gold' ? 'mn-count-cycle-btn--gold' : ''
                }`}
                aria-label={stampCountAriaLabel}
              >
                {stampCountMode === 'gold' && <SpecialSealIcon />}
                <span>{stampCountVisibleText}</span>
              </button>
            </div>

            <div className="mn-filter-row" role="group" aria-label="スタンプの種類で絞り込み">
              {STAMP_CATEGORY_FILTERS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  aria-pressed={stampFilter === opt.id}
                  onClick={() => {
                    setStampFilter(opt.id);
                    setStampPage(0);
                  }}
                  className={`mn-filter-pill ${
                    stampFilter === opt.id ? 'mn-filter-pill--active' : ''
                  } ${opt.id === 'gold' ? 'mn-filter-pill--gold' : ''}`}
                >
                  {opt.id === 'gold' && <SpecialSealIcon />}
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>

            {pagedStamps.length > 0 ? (
              <div className="mn-stamp-grid">
                {pagedStamps.map((stamp) => {
                  const details = getStampDisplayDetails(stamp);
                  return (
                    <button
                      key={stamp.id}
                      type="button"
                      onClick={() => {
                        setSelectedStampId(stamp.id);
                        if (stamp.targetTab) {
                          onSelectActiveTab(stamp.targetTab);
                        }
                      }}
                      aria-pressed={selectedStampId === stamp.id}
                      aria-label={details.buttonAriaLabel}
                      className={`mn-stamp ${
                        stamp.unlocked ? 'mn-stamp--unlocked' : 'mn-stamp--locked'
                      } mn-stamp--${stamp.category} ${
                        stamp.tier === 'gold' ? 'mn-stamp--gold' : ''
                      }`}
                    >
                      {stamp.tier === 'gold' && (
                        <span className="mn-stamp-seal" aria-hidden="true">
                          <SpecialSealIcon />
                        </span>
                      )}
                      <span className="mn-stamp-serial" aria-hidden="true">
                        {stamp.serialCode}
                      </span>
                      <StampGlyph stamp={stamp} />
                      <span className="mn-stamp-text">{renderStampTileLabel(details.tileLabel)}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="mn-stamp-empty">
                この条件に当てはまるスタンプはまだありません。
              </p>
            )}

            <div className="mn-stamp-pager" aria-label="スタンプ帳のページ切り替え">
              <button
                type="button"
                className="mn-page-btn"
                aria-label="前のスタンプページ"
                disabled={safePage === 0}
                onClick={() => setStampPage((prev) => Math.max(0, prev - 1))}
              >
                <ChevronLeft size={14} aria-hidden="true" />
                <span>前へ</span>
              </button>
              <span className="mn-page-indicator">
                {safePage + 1} / {totalPages} ページ（全{filteredStamps.length}個）
              </span>
              <button
                type="button"
                className="mn-page-btn"
                aria-label="次のスタンプページ"
                disabled={safePage >= totalPages - 1}
                onClick={() => setStampPage((prev) => Math.min(totalPages - 1, prev + 1))}
              >
                <span>次へ</span>
                <ChevronRight size={14} aria-hidden="true" />
              </button>
            </div>

            <div className="mn-stamp-hint" aria-live="polite">
              {activeStamp && activeDetails ? (
                <div className="mn-hint-body">
                  <div className="mn-hint-top">
                    <span className="mn-hint-serial">No.{activeStamp.serialCode} / {stamps.length}</span>
                    <span
                      className={`mn-stamp-tier-pill ${
                        activeStamp.tier === 'gold' ? 'mn-stamp-tier-pill--gold' : ''
                      }`}
                    >
                      {activeStamp.tier === 'gold' ? '特別称号' : '記念スタンプ'}
                    </span>
                    <strong className="mn-hint-title">{activeDetails.titleText}</strong>
                    <span className="mn-stamp-progress-pill">{activeDetails.progressLabel}</span>
                  </div>
                  <p className="mn-hint-desc">{activeDetails.descriptionText}</p>
                </div>
              ) : (
                <span>各枠を押すと、条件や進捗を確認できます（★特別称号は達成まで詳細シークレット）。</span>
              )}
            </div>
          </section>

          {/* Right column: Rank + Playstyle & 5-axis Balance Graph */}
          <div className="mn-right-stack">
            <section className="mn-card mn-card--profile" aria-label="総合ランクと推し活タイプ">
              <div className="mn-card-header mn-profile-card-header">
                <h3 className="mn-card-label">
                  {isPlaystyleMain ? '推し活タイプ' : '総合ランク'}
                </h3>
                <button
                  type="button"
                  onClick={handleToggleTitleMode}
                  className="mn-mode-switch-btn"
                  aria-label={
                    isPlaystyleMain
                      ? '総合ランクへ切り替え'
                      : '推し活タイプへ切り替え'
                  }
                >
                  <ArrowLeftRight size={11} aria-hidden="true" />
                  <span>{isPlaystyleMain ? '総合ランクへ' : '推し活タイプへ'}</span>
                </button>
              </div>
              <div className="mn-rank-identity">
                <button
                  type="button"
                  onClick={handleToggleTitleMode}
                  className={`mn-rank-badge mn-rank-badge--btn ${
                    isPlaystyleMain ? 'mn-rank-badge--playstyle' : ''
                  }`}
                  aria-label={
                    isPlaystyleMain
                      ? `${playstyle.title}（タップで総合ランクへ切り替え）`
                      : `${rank.title}（タップで推し活タイプへ切り替え）`
                  }
                >
                  {mainTitle}
                </button>
                {isEditingName ? (
                  <form onSubmit={handleSaveNickname} className="mn-name-form">
                    <input
                      ref={nameInputRef}
                      type="text"
                      value={draftName}
                      maxLength={MY_NOTE_NAME_MAX_LENGTH}
                      placeholder="お名前を入力"
                      aria-label="お名前を入力"
                      className="mn-name-input"
                      onChange={(e) => setDraftName(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="mn-icon-btn"
                      aria-label="お名前を保存"
                    >
                      <Check size={14} className="mn-check-icon" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="mn-icon-btn"
                      aria-label="名前編集を取り消す"
                      onClick={() => setIsEditingName(false)}
                    >
                      <X size={14} aria-hidden="true" />
                    </button>
                  </form>
                ) : (
                  <div className="mn-profile-name-row">
                    <span className="mn-profile-name">{displayMyNoteNickname(profile)}</span>
                    <button
                      type="button"
                      className="mn-icon-btn"
                      aria-label="お名前を変更"
                      onClick={() => {
                        setDraftName(profile.nickname);
                        setIsEditingName(true);
                      }}
                    >
                      <Pencil size={13} aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>
              {SHOW_TITLE_SUBTITLES && mainSubtitle && (
                <p className="mn-rank-sub">{mainSubtitle}</p>
              )}
              <div
                className="mn-progress-track"
                role="progressbar"
                aria-valuenow={rank.progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="スタンプ達成率"
              >
                <div className="mn-progress-fill" style={{ width: `${rank.progressPercent}%` }} />
              </div>
              <p className="mn-rank-foot">
                <span>{rank.nextMilestoneText}</span>
                <span className="mn-card-count">{rank.progressPercent}%</span>
              </p>
            </section>

            <section className="mn-card mn-card--radar" aria-label="推し活バランスグラフ">
              <div className="mn-card-header">
                <h3 className="mn-card-label">推し活バランスグラフ</h3>
              </div>
              <RadarPentagonChart axes={radar.axes} hasAnyActivity={radar.hasAnyActivity} />
            </section>
          </div>
        </div>

        {/* Detailed Records Tabs */}
        <section ref={detailBoxRef} className="mn-detail-box" aria-label="くわしい記録一覧">
          <div
            className="mn-detail-tabs"
            role="tablist"
            aria-label="記録の切り替え"
            onKeyDown={handleDetailTabKeyDown}
          >
            <button
              ref={(el) => {
                detailTabRefs.current.tours = el;
              }}
              id={`${titleId}-tab-tours`}
              type="button"
              role="tab"
              aria-selected={activeTab === 'tours'}
              tabIndex={activeTab === 'tours' ? 0 : -1}
              aria-controls={`${titleId}-panel`}
              className={`mn-tab-btn ${activeTab === 'tours' ? 'mn-tab-btn--active' : ''}`}
              onClick={() => handleSelectDetailTab('tours')}
            >
              <Ticket size={14} aria-hidden="true" />
              <span>参戦年表 ({timeline.totalAttended})</span>
            </button>
            <button
              ref={(el) => {
                detailTabRefs.current.spots = el;
              }}
              id={`${titleId}-tab-spots`}
              type="button"
              role="tab"
              aria-selected={activeTab === 'spots'}
              tabIndex={activeTab === 'spots' ? 0 : -1}
              aria-controls={`${titleId}-panel`}
              className={`mn-tab-btn ${activeTab === 'spots' ? 'mn-tab-btn--active' : ''}`}
              onClick={() => handleSelectDetailTab('spots')}
            >
              <Compass size={14} aria-hidden="true" />
              <span>
                聖地進捗 ({spotProgress.totalVisited}/{spotProgress.totalCheckable})
              </span>
            </button>
            <button
              ref={(el) => {
                detailTabRefs.current.setlists = el;
              }}
              id={`${titleId}-tab-setlists`}
              type="button"
              role="tab"
              aria-selected={activeTab === 'setlists'}
              tabIndex={activeTab === 'setlists' ? 0 : -1}
              aria-controls={`${titleId}-panel`}
              className={`mn-tab-btn ${activeTab === 'setlists' ? 'mn-tab-btn--active' : ''}`}
              onClick={() => handleSelectDetailTab('setlists')}
            >
              <ListMusic size={14} aria-hidden="true" />
              <span>MYセトリ ({savedSetlists.items.length})</span>
            </button>
            <button
              ref={(el) => {
                detailTabRefs.current.quiz = el;
              }}
              id={`${titleId}-tab-quiz`}
              type="button"
              role="tab"
              aria-selected={activeTab === 'quiz'}
              tabIndex={activeTab === 'quiz' ? 0 : -1}
              aria-controls={`${titleId}-panel`}
              className={`mn-tab-btn ${activeTab === 'quiz' ? 'mn-tab-btn--active' : ''}`}
              onClick={() => handleSelectDetailTab('quiz')}
            >
              <Award size={14} aria-hidden="true" />
              <span>
                検定記録 ({quizSummary.completedSets}/{quizSummary.totalSets})
              </span>
            </button>
          </div>

          <div
            id={`${titleId}-panel`}
            role="tabpanel"
            aria-labelledby={`${titleId}-tab-${activeTab}`}
            className="mn-detail-panel"
          >
            {activeTab === 'tours' && (
              <div>
                <div className="mn-panel-head">
                  <h3 className="mn-panel-title">
                    参戦・視聴ツアー年表（{timeline.totalAttended} / {timeline.totalSeries}シリーズ）
                  </h3>
                  <button
                    type="button"
                    className="mn-action-link"
                    onClick={() => onNavigateTab('tour_archive')}
                  >
                    <span>歴代ツアー記録をひらく</span>
                    <ArrowRight size={12} aria-hidden="true" />
                  </button>
                </div>

                {timeline.years.length > 0 ? (
                  <div className="mn-year-list">
                    {timeline.years.map((group) => (
                      <div key={group.year} className="mn-year-row">
                        <span className="mn-year-pill">{group.year}</span>
                        <div className="mn-tour-cards">
                          {group.tours.map((tour) => (
                            <div key={tour.id} className="mn-tour-item">
                              <p className="mn-tour-title">{tour.tourTitle}</p>
                              <p className="mn-tour-meta">
                                {formatDisplayDate(tour.startDate)}
                                {tour.endDate !== tour.startDate
                                  ? ` 〜 ${formatDisplayDate(tour.endDate)}`
                                  : ''}
                                {` ・ 全${tour.events.length}公演`}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mn-empty">
                    <p style={{ margin: '0 0 8px' }}>
                      まだチェックした公演はありません。「歴代ツアー記録」で参戦や映像視聴した公演にチェックを入れると、ここにあなただけの年表が並びます。
                    </p>
                    <button
                      type="button"
                      className="mn-action-link"
                      onClick={() => onNavigateTab('tour_archive')}
                    >
                      <span>歴代ツアー記録でチェックする</span>
                      <ArrowRight size={12} aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'spots' && (
              <div>
                <div className="mn-panel-head">
                  <h3 className="mn-panel-title">
                    聖地巡礼 エリア別進捗（{spotProgress.totalVisited} / {spotProgress.totalCheckable}か所）
                  </h3>
                  <button
                    type="button"
                    className="mn-action-link"
                    onClick={() => onNavigateTab('sacred_map')}
                  >
                    <span>聖地巡礼マップへ</span>
                    <ArrowRight size={12} aria-hidden="true" />
                  </button>
                </div>

                <div className="mn-region-grid">
                  {spotProgress.regions.map((region) => {
                    const pct = region.total > 0 ? Math.round((region.visited / region.total) * 100) : 0;
                    return (
                      <div key={region.id} className="mn-region-card">
                        <div className="mn-region-top">
                          <span className="mn-region-name">{region.label}</span>
                          <span className="mn-region-num">
                            {region.visited} / {region.total}
                          </span>
                        </div>
                        <div className="mn-region-bar">
                          <div style={{ width: `${pct}%` }} />
                        </div>
                        {region.visitedSpots.length > 0 ? (
                          <div className="mn-spot-chips">
                            {region.visitedSpots.map((spot) => (
                              <span key={spot.id} className="mn-spot-chip">
                                <MapPin size={10} aria-hidden="true" />
                                {spot.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p style={{ margin: 0, fontSize: '11px', color: '#68625C' }}>
                            このエリアはまだ未チェック
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'setlists' && (
              <div>
                <div className="mn-panel-head">
                  <h3 className="mn-panel-title">
                    保存済みMYセトリ（{savedSetlists.items.length}件）
                  </h3>
                  <button
                    type="button"
                    className="mn-action-link"
                    onClick={() => onNavigateTab('setlist')}
                  >
                    <span>MYセトリビルダーをひらく</span>
                    <ArrowRight size={12} aria-hidden="true" />
                  </button>
                </div>

                {switchNotice && (
                  <p
                    role="status"
                    style={{
                      margin: '0 0 10px',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      background: '#edf6ef',
                      color: '#21522e',
                      fontSize: '12px',
                      fontWeight: 700,
                    }}
                  >
                    {switchNotice}
                  </p>
                )}

                <div className="mn-setlist-stack">
                  {savedSetlists.items.map((item) => {
                    const isActive = item.id === savedSetlists.activeId;
                    const liveEntries = isActive ? setlist : item.entries;
                    const liveTitle = isActive
                      ? sanitizeUserText(setlistTitle, SETLIST_TITLE_LIMIT) || DEFAULT_SETLIST_TITLE
                      : item.title;
                    const stats = calculateSetlistStats(liveEntries, songs);

                    return (
                      <div
                        key={item.id}
                        className={`mn-setlist-card ${isActive ? 'mn-setlist-card--active' : ''}`}
                      >
                        <div className="mn-setlist-top">
                          <div>
                            <p className="mn-setlist-name">
                              {liveTitle}
                              {isActive && <span className="mn-badge-active">使用中</span>}
                            </p>
                            <p className="mn-tour-meta">
                              {liveEntries.length}曲
                              {stats.totalDurationSec > 0 ? ` ・ 約${stats.formattedDuration}` : ''}
                            </p>
                          </div>
                          {isActive ? (
                            <button
                              type="button"
                              className="mn-action-link"
                              onClick={() => onNavigateTab('setlist')}
                            >
                              <span>編集する</span>
                              <ArrowRight size={12} aria-hidden="true" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="mn-action-link"
                              onClick={() => handleSwitchSetlist(item.id)}
                            >
                              <span>このセトリに切替</span>
                            </button>
                          )}
                        </div>

                        {liveEntries.length > 0 && (
                          <div className="mn-song-chips">
                            {liveEntries.slice(0, 6).map((entry) => {
                              const found = songById.get(entry.songId);
                              if (!found) return null;
                              return (
                                <button
                                  key={entry.songId}
                                  type="button"
                                  className="mn-song-chip"
                                  onClick={() => onNavigateSong(found.id)}
                                >
                                  {found.title}
                                </button>
                              );
                            })}
                            {liveEntries.length > 6 && (
                              <span style={{ fontSize: '11px', color: '#68625C', alignSelf: 'center' }}>
                                ほか {liveEntries.length - 6} 曲
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'quiz' && (
              <div>
                <div className="mn-panel-head">
                  <h3 className="mn-panel-title">Official髭男dism検定の記録</h3>
                  <button
                    type="button"
                    className="mn-action-link"
                    onClick={() => onNavigateTab('quiz')}
                  >
                    <span>検定へ挑戦する</span>
                    <ArrowRight size={12} aria-hidden="true" />
                  </button>
                </div>

                <div className="mn-quiz-summary">
                  <div className="mn-quiz-stat">
                    最高正答率：
                    <strong>
                      {quizSummary.bestQuizScore !== null ? `${quizSummary.bestQuizScore}%` : '未挑戦'}
                    </strong>
                  </div>
                  <div className="mn-quiz-stat">
                    挑戦済み：
                    <strong>
                      {quizSummary.completedSets} / {quizSummary.totalSets} セット
                    </strong>
                  </div>
                  <div className="mn-quiz-stat">
                    全問正解：<strong>{quizSummary.perfectSets} セット</strong>
                  </div>
                </div>

                <div className="mn-quiz-courses">
                  {quizSummary.courses.map((course) => (
                    <div key={course.id} className="mn-quiz-course">
                      <p className="mn-quiz-course-title">
                        {course.indexCode}. {course.title}
                      </p>
                      <div className="mn-quiz-vols">
                        {course.volumes.map((vol) => (
                          <div
                            key={vol.scope}
                            className={`mn-quiz-vol ${vol.record ? 'mn-quiz-vol--done' : ''}`}
                          >
                            <span>Vol.{vol.volNumber}</span>
                            <span style={{ fontWeight: 700 }}>
                              {vol.record
                                ? `${vol.record.score}/${vol.record.total} (${vol.record.percentage}%)`
                                : '未挑戦'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      <footer className="mn-footer">
        <span className="mn-footer-note">※記録はお使いのブラウザ内に保存</span>
        <button
          type="button"
          className="mn-export-btn"
          onClick={() => {
            onExportRecords();
            setProfile(loadMyNoteProfile(resetEpoch, undefined, validSongIds));
          }}
        >
          <Download size={14} aria-hidden="true" />
          <span>ファイルに保存</span>
        </button>
      </footer>
    </dialog>
  );
};
