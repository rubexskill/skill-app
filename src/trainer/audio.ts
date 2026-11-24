/** Tonausgabe für iPhone/iPad (Safari, installierte Web-App): Audio muss durch Antippen gestartet werden,
 *  kann nach App-Wechsel pausiert sein und wird vom Stummschalter unterdrückt, wenn man es nicht als Wiedergabe anmeldet. */
import { morseEvents } from "./morse";

type AudioCtor = typeof AudioContext;
let ctx: AudioContext | null = null;
let keepAlive: HTMLAudioElement | null = null;
let wired = false;

const Ctor = (): AudioCtor | undefined => window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioCtor }).webkitAudioContext;

/** 0,4 s Stille als WAV. Ein laufendes (stummes) Audio-Element schaltet iOS auf Wiedergabe, dann zählt der Stummschalter nicht mehr. */
function silentUrl(): string {
  const rate = 8000, n = 3200;
  const buf = new ArrayBuffer(44 + n);
  const v = new DataView(buf);
  const s = (o: number, t: string) => [...t].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  s(0, "RIFF"); v.setUint32(4, 36 + n, true); s(8, "WAVE"); s(12, "fmt ");
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, rate, true); v.setUint32(28, rate, true); v.setUint16(32, 1, true); v.setUint16(34, 8, true);
  s(36, "data"); v.setUint32(40, n, true);
  new Uint8Array(buf, 44).fill(128);
  return URL.createObjectURL(new Blob([buf], { type: "audio/wav" }));
}

function wire() {
  if (wired) return;
  wired = true;
  // Nach App-Wechsel, Sperrbildschirm oder Anruf den Ton wieder wecken
  const wake = () => {
    if (document.visibilityState === "visible" && ctx && ctx.state !== "running" && ctx.state !== "closed") void ctx.resume().catch(() => undefined);
    if (document.visibilityState === "visible" && keepAlive && keepAlive.paused && keepAlive.dataset.on === "1") void keepAlive.play().catch(() => undefined);
  };
  document.addEventListener("visibilitychange", wake);
  window.addEventListener("pageshow", wake);
  window.addEventListener("focus", wake);
}

export type AudioState = "none" | "running" | "suspended" | "interrupted" | "closed";
export const audioState = (): AudioState => (ctx ? (ctx.state as AudioState) : Ctor() ? "suspended" : "none");

/** Direkt im Antipp-Ereignis aufrufen (Knopf Los, Hören, Test-Ton). */
export function prepareAudio(): void {
  const nav = navigator as unknown as { audioSession?: { type: string } };
  try { if (nav.audioSession) nav.audioSession.type = "playback"; } catch { /* nicht unterstützt */ }
  const C = Ctor();
  if (!C) return;
  wire();
  if (!ctx || ctx.state === "closed") ctx = new C();
  void ctx.resume().catch(() => undefined);
  try {
    // klassischer iOS-Freischalter: ein winziger stummer Puffer innerhalb der Berührung
    const src = ctx.createBufferSource();
    src.buffer = ctx.createBuffer(1, 1, 22050);
    src.connect(ctx.destination);
    src.start(0);
  } catch { /* egal */ }
  try {
    if (!keepAlive) {
      keepAlive = new Audio(silentUrl());
      keepAlive.loop = true;
      keepAlive.setAttribute("playsinline", "");
    }
    keepAlive.dataset.on = "1";
    void keepAlive.play().catch(() => undefined);
  } catch { /* egal */ }
}

/** Beim Schließen des Trainers aufrufen, damit nichts im Hintergrund weiterläuft. */
export function releaseAudio(): void {
  try {
    if (keepAlive) keepAlive.dataset.on = "0";
    keepAlive?.pause();
  } catch { /* egal */ }
}

async function ready(): Promise<AudioContext | null> {
  if (!ctx || ctx.state === "closed") prepareAudio();
  if (!ctx) return null;
  if (ctx.state !== "running") await Promise.race([ctx.resume().catch(() => undefined), new Promise((r) => setTimeout(r, 700))]);
  return ctx;
}

function tone(c: AudioContext, at: number, dur: number, freq: number, vol = 0.35) {
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  const ramp = Math.min(0.01, dur / 4);
  gain.gain.setValueAtTime(0, at);
  gain.gain.linearRampToValueAtTime(vol, at + ramp);
  gain.gain.setValueAtTime(vol, Math.max(at + ramp, at + dur - ramp));
  gain.gain.linearRampToValueAtTime(0, at + dur);
  osc.connect(gain).connect(c.destination);
  osc.start(at);
  osc.stop(at + dur + 0.03);
}

/** Spielt Text als Morsecode. Gibt die Dauer in Sekunden zurück (0, wenn kein Ton möglich war). */
export async function playMorseText(text: string, charWpm = 20, effWpm = charWpm, freq = 620): Promise<number> {
  const c = await ready();
  if (!c) return 0;
  const { beeps, total } = morseEvents(text, charWpm, effWpm);
  const t0 = c.currentTime + 0.08;
  for (const b of beeps) tone(c, t0 + b.start, b.dur, freq);
  return total + 0.08;
}

/** Drei kurze Töne zum Prüfen von Lautstärke und Stummschalter. */
export async function playTestTone(): Promise<AudioState> {
  prepareAudio();
  const c = await ready();
  if (!c) return "none";
  const t0 = c.currentTime + 0.05;
  [0, 0.28, 0.56].forEach((d, i) => tone(c, t0 + d, 0.2, 520 + i * 100));
  await new Promise((r) => setTimeout(r, 150));
  return audioState();
}

/** Für andere Module (Metronom): der gemeinsame AudioContext, bereit zum Planen mit currentTime. */
export const audioContext = (): AudioContext | null => ctx;
export const readyAudio = ready;
