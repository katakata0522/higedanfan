import { SoundTag } from '../data/higedanData';

let activeAudioCtx: AudioContext | null = null;
let activeTimerIds: number[] = [];

export function stopTempoPreview(): void {
  for (const id of activeTimerIds) {
    window.clearTimeout(id);
  }
  activeTimerIds = [];
  if (activeAudioCtx) {
    try {
      activeAudioCtx.close().catch(() => {});
    } catch {
      // Ignore close errors
    }
    activeAudioCtx = null;
  }
}

/**
 * Plays a gentle 4-beat electric-piano chord rhythm at the song's exact BPM
 * using the browser's built-in Web Audio API so fans can intuitively feel the tempo.
 */
export function playSongTempoPreview(
  bpm: number,
  sound: SoundTag,
  onComplete: () => void
): void {
  stopTempoPreview();

  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) {
    onComplete();
    return;
  }

  try {
    const ctx = new AudioCtx();
    activeAudioCtx = ctx;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    // Select warm chord frequencies by sound style
    const chordMap: Record<SoundTag, number[]> = {
      piano_pop: [261.63, 329.63, 392.0, 493.88], // Cmaj7
      brass_funk: [293.66, 369.99, 440.0, 523.25], // D7 funk
      emotional_ballad: [220.0, 261.63, 329.63, 392.0], // Am7
      stadium_rock: [329.63, 415.3, 493.88, 659.25], // E power/maj
    };

    const freqs = chordMap[sound] || chordMap.piano_pop;
    const safeBpm = Math.max(60, Math.min(200, Number(bpm) || 120));
    const beatIntervalMs = (60 / safeBpm) * 1000;
    const totalBeats = 4;

    for (let beat = 0; beat < totalBeats; beat++) {
      const timerId = window.setTimeout(() => {
        if (!activeAudioCtx || activeAudioCtx !== ctx || ctx.state === 'closed') return;
        const now = ctx.currentTime;

        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = sound === 'brass_funk' || sound === 'stadium_rock' ? 'triangle' : 'sine';
          const pitchMultiplier = beat === 3 && idx === freqs.length - 1 ? 1.125 : 1;
          osc.frequency.setValueAtTime(freq * pitchMultiplier, now);

          const peakGain = beat === 0 ? 0.06 : 0.04;
          gain.gain.setValueAtTime(0.001, now);
          gain.gain.exponentialRampToValueAtTime(peakGain, now + 0.02);
          gain.gain.exponentialRampToValueAtTime(
            0.0008,
            now + Math.min(0.45, beatIntervalMs / 1200)
          );

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.5);
        });
      }, beat * beatIntervalMs);

      activeTimerIds.push(timerId);
    }

    const endTimerId = window.setTimeout(() => {
      stopTempoPreview();
      onComplete();
    }, totalBeats * beatIntervalMs + 150);
    activeTimerIds.push(endTimerId);
  } catch {
    stopTempoPreview();
    onComplete();
  }
}
