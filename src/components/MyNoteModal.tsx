import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
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
import { SACRED_SPOTS, TOUR_ARCHIVES, type FanReview, type SongItem } from '../data/higedanData';
import { DEFAULT_SETLIST_TITLE } from '../hooks/fanRecordStore';
import { calculateSetlistStats } from '../utils/fanLogic';
import {
  displayMyNoteNickname,
  hasCustomMyNoteNickname,
  loadMyNoteProfile,
  MY_NOTE_NAME_MAX_LENGTH,
  persistMyNoteProfile,
  sanitizeMyNoteNickname,
  type MyNoteProfile,
} from '../utils/myNoteProfile';
import {
  buildAttendedTimeline,
  buildMyNoteSnapshot,
  buildQuizRecordSummary,
  buildSacredProgressByRegion,
  getStampDisplayDetails,
  type MyNoteDetailTab,
  type MyNoteEngagementInput,
  type MyNoteRadarAxis,
  type MyNoteStampItem,
} from '../utils/myNoteSummary';
import {
  DEFAULT_SAVED_SETLIST_TITLE,
  loadSavedSetlists,
  persistSavedSetlists,
  switchSavedSetlist,
} from '../utils/savedSetlists';
import { SETLIST_TITLE_LIMIT, type SetlistEntry } from '../utils/setlist';
import { sanitizeUserText } from '../utils/userInput';
import { loadQuizVolumeScores } from './quiz/quizVolumeRecords';
import type { SiteTab } from './SiteHeader';
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

const formatDisplayDate = (date: string) => date.replaceAll('-', '.');

const STAMPS_PER_PAGE = 20;

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

function RadarPentagonChart({
  axes,
  hasAnyActivity,
}: {
  axes: readonly MyNoteRadarAxis[];
  hasAnyActivity: boolean;
}) {
  const cx = 160;
  const cy = 124;
  const maxRadius = 80;
  const rings = [0.25, 0.5, 0.75, 1];

  const pointAt = (index: number, ratio: number): [number, number] => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / 5;
    return [
      Number((cx + maxRadius * ratio * Math.cos(angle)).toFixed(2)),
      Number((cy + maxRadius * ratio * Math.sin(angle)).toFixed(2)),
    ];
  };

  const labelAnchor = (index: number): { x: number; y: number; anchor: 'middle' | 'start' | 'end' } => {
    const [x, y] = pointAt(index, 1.15);
    if (index === 0) return { x, y: y - 6, anchor: 'middle' };
    if (index === 1 || index === 2) return { x: x + 6, y: y + 4, anchor: 'start' };
    return { x: x - 6, y: y + 4, anchor: 'end' };
  };

  const polygonPoints = axes
    .map((axis, idx) => pointAt(idx, Math.max(0.08, axis.value)).join(','))
    .join(' ');

  return (
    <div className="mn-radar-wrap">
      <svg
        viewBox="0 0 320 240"
        className="mn-radar-svg"
        role="img"
        aria-label={`推し活バランスグラフ: ${axes.map((a) => `${a.label} ${a.rawLabel}`).join(' / ')}`}
      >
        {rings.map((ratio) => {
          const pts = Array.from({ length: 5 }, (_, idx) => pointAt(idx, ratio).join(',')).join(' ');
          return (
            <polygon
              key={ratio}
              points={pts}
              fill="none"
              stroke="#e5dccb"
              strokeWidth="1"
            />
          );
        })}

        {axes.map((axis, idx) => {
          const [px, py] = pointAt(idx, 1);
          const lbl = labelAnchor(idx);
          return (
            <g key={axis.id}>
              <line
                x1={cx}
                y1={cy}
                x2={px}
                y2={py}
                stroke="#dcd1bd"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <text
                x={lbl.x}
                y={lbl.y}
                textAnchor={lbl.anchor}
                fontSize="11"
                fontWeight="700"
                fill="#44403C"
              >
                {axis.label}
              </text>
            </g>
          );
        })}

        {hasAnyActivity ? (
          <g>
            <polygon
              points={polygonPoints}
              fill="rgba(200, 62, 43, 0.17)"
              stroke="#C83E2B"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            {axes.map((axis, idx) => {
              const [px, py] = pointAt(idx, Math.max(0.08, axis.value));
              return (
                <circle
                  key={axis.id}
                  cx={px}
                  cy={py}
                  r="3.2"
                  fill="#C83E2B"
                  stroke="#ffffff"
                  strokeWidth="1.2"
                />
              );
            })}
          </g>
        ) : (
          <text
            x={cx}
            y={cy + 4}
            textAnchor="middle"
            fontSize="10.5"
            fontWeight="700"
            fill="#78716C"
          >
            記録が増えると形が育ちます
          </text>
        )}
      </svg>
    </div>
  );
}

export const MyNoteModal: React.FC<MyNoteModalProps> = ({
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
}) => {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<MyNoteProfile>(() => loadMyNoteProfile(resetEpoch));
  const [isEditingName, setIsEditingName] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [activeTab, setActiveTab] = useState<MyNoteDetailTab>('tours');
  const [stampFilter, setStampFilter] = useState<StampCategoryFilter>('all');
  const [stampPage, setStampPage] = useState(0);
  const [selectedStampId, setSelectedStampId] = useState<string | null>(null);
  const [switchNotice, setSwitchNotice] = useState<string | null>(null);

  useEffect(() => {
    setProfile(loadMyNoteProfile(resetEpoch));
  }, [resetEpoch]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen) {
      const latest = loadMyNoteProfile(resetEpoch);
      const openedProfile = latest.opened ? latest : { ...latest, opened: true };
      if (!latest.opened) {
        persistMyNoteProfile(openedProfile, resetEpoch);
      }
      setProfile(openedProfile);
      setIsEditingName(false);
      setSwitchNotice(null);
      setSelectedStampId(null);
      setStampFilter('all');
      setStampPage(0);
      if (!dialog.open) {
        dialog.showModal();
      }
      if (bodyRef.current) {
        bodyRef.current.scrollTop = 0;
      }
    } else if (dialog.open) {
      dialog.close();
    }
  }, [isOpen, resetEpoch]);

  // Safari fallback for <dialog closedby="any">
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || 'closedBy' in HTMLDialogElement.prototype) return undefined;

    const isOutside = (e: PointerEvent) => {
      const rect = dialog.getBoundingClientRect();
      return (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      );
    };

    let pressedOutside = false;
    const handlePointerDown = (e: PointerEvent) => {
      pressedOutside = isOutside(e);
    };
    const handlePointerUp = (e: PointerEvent) => {
      if (pressedOutside && isOutside(e)) {
        dialog.close();
      }
      pressedOutside = false;
    };

    dialog.addEventListener('pointerdown', handlePointerDown);
    dialog.addEventListener('pointerup', handlePointerUp);
    return () => {
      dialog.removeEventListener('pointerdown', handlePointerDown);
      dialog.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

  useEffect(() => {
    if (isEditingName) {
      nameInputRef.current?.focus();
    }
  }, [isEditingName]);

  const validSongIds = useMemo(() => new Set(songs.map((song) => song.id)), [songs]);
  const songById = useMemo(() => new Map(songs.map((song) => [song.id, song])), [songs]);

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
    const hasCustomTitle = allSetlists.some(
      (item) =>
        item.title.length > 0 &&
        item.title !== DEFAULT_SETLIST_TITLE &&
        item.title !== DEFAULT_SAVED_SETLIST_TITLE,
    );
    return {
      noteOpened: profile.opened || isOpen,
      hasCustomNickname: hasCustomMyNoteNickname(profile),
      exportedBackup: profile.exportedBackup,
      attendedTourIds,
      visitedSpotIds,
      setlists: allSetlists,
      savedSetlistCount: savedSetlists.items.length,
      hasCustomSetlistTitle: hasCustomTitle,
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
    quizVolumeScores,
    quizSummary.bestQuizScore,
    votedSongCount,
    reviews.length,
  ]);

  const { stamps, rank, radar } = useMemo(
    () => buildMyNoteSnapshot(engagementInput),
    [engagementInput],
  );

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
    dialogRef.current?.close();
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
    setProfile(loadMyNoteProfile(resetEpoch));
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
      {...({ closedby: 'any' } as Record<string, string>)}
      aria-labelledby={titleId}
      className="my-note-dialog"
      onClose={() => {
        if (dialogRef.current) {
          dialogRef.current.returnValue = '';
        }
        onClose();
      }}
    >
      <header className="mn-head">
        <h2 id={titleId} className="mn-head-title">
          マイノート
        </h2>
        <p className="mn-head-sub">
          集めたスタンプとあなたの推し旅の記録を一冊に。
        </p>
        <button
          type="button"
          className="mn-close-x"
          aria-label="マイノートを閉じる"
          autoFocus
          onClick={handleRequestClose}
        >
          <X size={16} aria-hidden="true" />
        </button>
      </header>

      <div ref={bodyRef} className="mn-body">
        <div className="mn-hero-grid">
          {/* Left column: Stamps collection */}
          <section className="mn-card mn-card--soft" aria-label="訪問・記念スタンプ">
            <div className="mn-card-header">
              <h3 className="mn-card-label">訪問・記念スタンプ</h3>
              <span className="mn-card-count">
                {rank.unlockedCount} / {rank.totalStamps}
              </span>
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
                          setActiveTab(stamp.targetTab);
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
                      <span className="mn-stamp-text">{details.tileLabel}</span>
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
                    <span className="mn-hint-serial">No.{activeStamp.serialCode} / 115</span>
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

          {/* Right column: Rank + Identity & 5-axis Balance Graph */}
          <div className="mn-right-stack">
            <section className="mn-card mn-card--profile" aria-label="ランク">
              <p className="mn-card-label">ランク</p>
              <div className="mn-rank-identity">
                <span className="mn-rank-badge">{rank.title}</span>
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
              <p className="mn-rank-sub">{rank.subtitle}</p>
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
        <section className="mn-detail-box" aria-label="くわしい記録一覧">
          <div className="mn-detail-tabs" role="tablist" aria-label="記録の切り替え">
            <button
              id={`${titleId}-tab-tours`}
              type="button"
              role="tab"
              aria-selected={activeTab === 'tours'}
              aria-controls={`${titleId}-panel`}
              className={`mn-tab-btn ${activeTab === 'tours' ? 'mn-tab-btn--active' : ''}`}
              onClick={() => setActiveTab('tours')}
            >
              <Ticket size={14} aria-hidden="true" />
              <span>参戦年表 ({timeline.totalAttended})</span>
            </button>
            <button
              id={`${titleId}-tab-spots`}
              type="button"
              role="tab"
              aria-selected={activeTab === 'spots'}
              aria-controls={`${titleId}-panel`}
              className={`mn-tab-btn ${activeTab === 'spots' ? 'mn-tab-btn--active' : ''}`}
              onClick={() => setActiveTab('spots')}
            >
              <Compass size={14} aria-hidden="true" />
              <span>
                聖地進捗 ({spotProgress.totalVisited}/{spotProgress.totalCheckable})
              </span>
            </button>
            <button
              id={`${titleId}-tab-setlists`}
              type="button"
              role="tab"
              aria-selected={activeTab === 'setlists'}
              aria-controls={`${titleId}-panel`}
              className={`mn-tab-btn ${activeTab === 'setlists' ? 'mn-tab-btn--active' : ''}`}
              onClick={() => setActiveTab('setlists')}
            >
              <ListMusic size={14} aria-hidden="true" />
              <span>MYセトリ ({savedSetlists.items.length})</span>
            </button>
            <button
              id={`${titleId}-tab-quiz`}
              type="button"
              role="tab"
              aria-selected={activeTab === 'quiz'}
              aria-controls={`${titleId}-panel`}
              className={`mn-tab-btn ${activeTab === 'quiz' ? 'mn-tab-btn--active' : ''}`}
              onClick={() => setActiveTab('quiz')}
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
                          <p style={{ margin: 0, fontSize: '11px', color: '#78716C' }}>
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
                              <span style={{ fontSize: '11px', color: '#78716C', alignSelf: 'center' }}>
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
        <div className="mn-footer-left">
          <span className="mn-footer-note">※記録はお使いのブラウザ内に保存</span>
          <button
            type="button"
            className="mn-export-btn"
            onClick={() => {
              onExportRecords();
              setProfile(loadMyNoteProfile(resetEpoch));
            }}
          >
            <Download size={14} aria-hidden="true" />
            <span>ファイルに保存</span>
          </button>
        </div>
        <button type="button" className="mn-close-btn" onClick={handleRequestClose}>
          とじる
        </button>
      </footer>
    </dialog>
  );
};
