import type { SongItem, VocalRangeInfo } from './higedanData';
import { catalogEntries } from './catalogEntries';
import { songTieUps } from './songTieUps';
import records from './songEvidence.json';

export const songEvidence = records;

const pitchBases: Record<string, number> = { low: 33, mid1: 45, mid2: 57, hi: 69, hihi: 81 };
const noteOffsets: Record<string, number> = { A: 0, B: 2, C: 3, D: 5, E: 7, F: 8, G: 10 };
const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function pitchNumber(note: string): number {
  const match = /^(low|mid1|mid2|hi|hihi)([A-G])(#?)$/.exec(note);
  if (!match) throw new Error('Invalid pitch: ' + note);
  return pitchBases[match[1]] + noteOffsets[match[2]] + Number(Boolean(match[3]));
}

function displayPitch(note: string | null): string {
  if (!note) return '記載なし';
  const midi = pitchNumber(note);
  return note + ' (' + noteNames[midi % 12] + (Math.floor(midi / 12) - 1) + ')';
}

function vocalRange(fact: { low: string; chest: string; falsetto: string | null }): VocalRangeInfo {
  const chest = pitchNumber(fact.chest);
  const high = fact.falsetto ? Math.max(chest, pitchNumber(fact.falsetto)) : chest;
  return {
    lowestNote: displayPitch(fact.low),
    highestChestNote: displayPitch(fact.chest),
    highestFalsettoNote: displayPitch(fact.falsetto),
    chestSemitoneScore: chest,
    rangeSpanSemitones: high - pitchNumber(fact.low),
    lowNoteSection: '',
    highNoteSection: '',
    singingAdvice: '',
  };
}

export const verifiedSongs: SongItem[] = catalogEntries.map(entry => {
  const fact = records[entry.id];
  const tieUps = songTieUps[entry.id] ?? [];
  return {
    ...entry,
    tieUps,
    tieUp: tieUps.map(item => item.text).join(' ／ '),
    trackNumber: entry.album.startsWith('Single /') ? undefined : entry.trackNumber,
    englishSub: fact.album,
    releaseDate: fact.release,
    durationSec: fact.seconds,
    bpm: fact.tempo,
    musicalHighlight: fact.style,
    linerNotes: fact.style,
    iconicLyricQuote: '',
    lyricAnalysis: '',
    liveArrangementNote: '',
    keyChanges: null,
    vocalRange: vocalRange(fact),
    votes: { overall: 0, lyric: 0, live: 0, hiddenGem: 0 },
  };
});
