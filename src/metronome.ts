import { prepareAudio, readyAudio, releaseAudio, suspendAudio } from "./trainer/audio";

/** Metronom: BPM-Grenzen, Taktarten, genaue Planung über AudioContext.currentTime (kein setInterval für den Takt). */

export const BPM_MIN = 30;
export const BPM_MAX = 240;
export const BPM_DEFAULT = 80;

export const clampBpm = (n: number): number => Math.min(BPM_MAX, Math.max(BPM_MIN, Math.round(Number.isFinite(n) ? n : BPM_DEFAULT)));

export interface Meter {
  id: string;
  /** Schläge pro Takt (jeder Schlag klickt, die Eins ist betont) */
  beats: number;
}

export const METERS: Meter[] = [
  { id: "2/4", beats: 2 },
  { id: "3/4", beats: 3 },
  { id: "4/4", beats: 4 },
  { id: "5/4", beats: 5 },
  { id: "6/8", beats: 6 },
  { id: "7/8", beats: 7 },
  { id: "9/8", beats: 9 },
  { id: "12/8", beats: 12 },
];
export const DEFAULT_METER = "4/4";
export const meterOf = (id?: string): Meter => METERS.find((m) => m.id === id) ?? METERS.find((m) => m.id === DEFAULT_METER)!;

/** Wahl-Rad: Wert ↔ Position */
export const wheelIndex = (value: number, min = BPM_MIN, max = BPM_MAX) => Math.min(max, Math.max(min, Math.round(value))) - min;
export const wheelValue = (index: number, min = BPM_MIN, max = BPM_MAX) => Math.min(max, Math.max(min, min + Math.round(index)));
export const wheelFromScroll = (scrollTop: number, itemH: number, min = BPM_MIN, max = BPM_MAX) => wheelValue(scrollTop / itemH, min, max);

/** Tempo und Taktart eines Abschnitts: eigener Wert, sonst der Standard des Stücks, sonst 80 / 4/4. */
export function effectiveMetronome(part?: { bpm?: number; meter?: string } | null, unit?: { bpm?: number; meter?: string } | null): { bpm: number; meter: string } {
  return { bpm: clampBpm(part?.bpm ?? unit?.bpm ?? BPM_DEFAULT), meter: meterOf(part?.meter ?? unit?.meter).id };
}

export interface PlannedClick {
  time: number;
  /** Schlag im Takt, 0 = betonte Eins */
  beat: number;
  accent: boolean;
}

/** Plant alle Schläge, die zwischen `next.time` und `until` (Sekunden der Audio-Uhr) fallen. Reine Funktion, gut testbar. */
export function planClicks(next: { time: number; beat: number }, bpm: number, beats: number, until: number): { clicks: PlannedClick[]; next: { time: number; beat: number } } {
  const step = 60 / clampBpm(bpm);
  const clicks: PlannedClick[] = [];
  let { time, beat } = next;
  while (time < until) {
    clicks.push({ time, beat, accent: beat === 0 });
    time += step;
    beat = (beat + 1) % beats;
  }
  return { clicks, next: { time, beat } };
}

const LOOKAHEAD = 0.14; // s
const TICK_MS = 30;

const instances = new Set<Metronome>();
/** Läuft irgendwo ein Metronom? */
export const metronomeRunning = (): boolean => [...instances].some((m) => m.running);
/** Stoppt jedes laufende Metronom (z. B. vor einer Aufnahme) und gibt das Audio frei. */
export function stopAllMetronomes(): void {
  const was = metronomeRunning();
  [...instances].forEach((m) => m.stop());
  if (was) suspendAudio();
}

export class Metronome {
  private ctx: AudioContext | null = null;
  private timer = 0;
  private next = { time: 0, beat: 0 };
  private blinkTimers = new Set<number>();
  running = false;
  bpm = BPM_DEFAULT;
  beats = 4;
  muted = false;
  onBeat: (beat: number) => void = () => {};
  /** Wird aufgerufen, wenn das Metronom von außen gestoppt wurde */
  onStop: () => void = () => {};
  private wake = () => {
    // Nach App-Wechsel läuft die Audio-Uhr weiter oder stand still: neu aufsetzen, damit nichts aufholt
    if (document.visibilityState !== "visible" || !this.running || !this.ctx) return;
    void this.ctx.resume().catch(() => undefined);
    this.next.time = Math.max(this.next.time, this.ctx.currentTime + 0.06);
  };

  /** Direkt im Antipp-Ereignis aufrufen. */
  start(bpm: number, beats: number): void {
    if (this.running) return;
    prepareAudio();
    this.bpm = clampBpm(bpm);
    this.beats = beats;
    this.running = true;
    instances.add(this);
    void readyAudio().then((c) => {
      if (!this.running) return;
      if (!c) { this.running = false; instances.delete(this); this.onStop(); return; }
      this.ctx = c;
      this.next = { time: c.currentTime + 0.08, beat: 0 };
      document.addEventListener("visibilitychange", this.wake);
      window.addEventListener("pageshow", this.wake);
      this.tick();
    });
  }

  stop(): void {
    const was = this.running;
    this.running = false;
    instances.delete(this);
    window.clearTimeout(this.timer);
    this.blinkTimers.forEach((t) => window.clearTimeout(t));
    this.blinkTimers.clear();
    if (typeof document !== "undefined" && typeof document.removeEventListener === "function") document.removeEventListener("visibilitychange", this.wake);
    if (typeof window !== "undefined" && typeof window.removeEventListener === "function") window.removeEventListener("pageshow", this.wake);
    releaseAudio();
    if (was) this.onStop();
  }

  setBpm(bpm: number) { this.bpm = clampBpm(bpm); }
  setBeats(beats: number) { this.beats = beats; if (this.next.beat >= beats) this.next.beat = 0; }

  private tick = () => {
    const c = this.ctx;
    if (!this.running || !c) return;
    if (c.state === "running") {
      const plan = planClicks(this.next, this.bpm, this.beats, c.currentTime + LOOKAHEAD);
      this.next = plan.next;
      for (const k of plan.clicks) {
        if (!this.muted) click(c, k.time, k.accent);
        const delay = Math.max(0, (k.time - c.currentTime) * 1000);
        const id = window.setTimeout(() => { this.blinkTimers.delete(id); if (this.running) this.onBeat(k.beat); }, delay);
        this.blinkTimers.add(id);
      }
    }
    this.timer = window.setTimeout(this.tick, TICK_MS);
  };
}

/** Kurzer Klick, zwei Tonhöhen: betonte Eins hoch und etwas lauter. */
function click(c: AudioContext, at: number, accent: boolean) {
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = "sine";
  osc.frequency.value = accent ? 1568 : 988;
  const vol = accent ? 0.55 : 0.38;
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(vol, at + 0.002);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.05);
  osc.connect(gain).connect(c.destination);
  osc.start(at);
  osc.stop(at + 0.07);
}
