import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Skill } from "../db";
import { elapsedLabel } from "../logic";

export interface TrainerResult {
  /** Übungszeit, wird als Session gespeichert (ab 1 Minute) */
  elapsedMs: number;
  headline: string;
  record?: { value: number; label: string; unit: string; higher: boolean };
}

export interface TrainerProps {
  skill: Skill;
  onFinish: (r: TrainerResult) => void;
}

export const r = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
export const pick = <T,>(list: T[]): T => list[Math.floor(Math.random() * list.length)];
export const shuffle = <T,>(list: T[]): T[] => {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
export const round1 = (n: number) => Math.round(n * 10) / 10;
export const de1 = (n: number) => round1(n).toString().replace(".", ",");

/** Einrichtungsmaske vor dem Start */
export function Setup({ title, lead, children, onStart, startLabel = "Los", notice }: {
  title: string;
  lead?: string;
  children?: ReactNode;
  onStart: () => void;
  startLabel?: string;
  notice?: string;
}) {
  return (
    <div className="tr-setup">
      <h2 className="tr-title">{title}</h2>
      {lead && <p className="tr-lead">{lead}</p>}
      {notice && <div className="safety tr-notice"><p>{notice}</p></div>}
      {children}
      <button className="btn btn-primary tr-start" onClick={onStart}>{startLabel}</button>
    </div>
  );
}

export interface RoundStat {
  right: number;
  total: number;
  totalMs: number;
}

interface RoundProps<T> {
  tasks: T[];
  prompt: (t: T, i: number) => ReactNode;
  input: { kind: "number" } | { kind: "text"; placeholder?: string } | { kind: "choices"; options: (t: T) => string[]; columns?: number };
  isRight: (t: T, answer: string) => boolean;
  /** Anzeige der richtigen Lösung */
  correct: (t: T) => string;
  onFinish: (s: RoundStat) => void;
  onRestart: () => void;
  note?: (s: RoundStat) => string | null;
}

/** Eine Runde mit mehreren Aufgaben: Frage, Eingabe, Rückmeldung, Auswertung. */
export function Round<T>({ tasks, prompt, input, isRight, correct, onFinish, onRestart, note }: RoundProps<T>) {
  const [i, setI] = useState(0);
  const [value, setValue] = useState("");
  const [fb, setFb] = useState<{ ok: boolean; chosen: string } | null>(null);
  const [stat, setStat] = useState<RoundStat>({ right: 0, total: tasks.length, totalMs: 0 });
  const [done, setDone] = useState(false);
  const started = useRef(Date.now());
  const timer = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 500);
    return () => {
      window.clearInterval(t);
      window.clearTimeout(timer.current);
    };
  }, []);

  useEffect(() => {
    if (!done) inputRef.current?.focus();
  }, [i, done]);

  const task = tasks[i];

  const next = (s: RoundStat) => {
    if (i + 1 >= tasks.length) {
      setDone(true);
      return;
    }
    setI(i + 1);
    setValue("");
    setFb(null);
    started.current = Date.now();
    void s;
  };

  const answer = (a: string) => {
    if (fb || !a.trim()) return;
    const ok = isRight(task, a.trim());
    const s = { right: stat.right + (ok ? 1 : 0), total: tasks.length, totalMs: stat.totalMs + (Date.now() - started.current) };
    setStat(s);
    setFb({ ok, chosen: a.trim() });
    if (ok) {
      navigator.vibrate?.(8);
      timer.current = window.setTimeout(() => next(s), 550);
    }
  };

  if (done) {
    const avg = stat.totalMs / 1000 / stat.total;
    const n = note?.(stat);
    return (
      <div className="tr-result">
        <div className="tr-big"><span className="num">{stat.right}</span><span className="unit"> von {stat.total}</span></div>
        <div className="tr-sub">richtig · Ø {de1(avg)} s pro Aufgabe</div>
        {n && <p className="tr-note">{n}</p>}
        <div className="tr-result-actions">
          <button className="btn btn-secondary" onClick={onRestart}>Nochmal</button>
          <button className="btn btn-primary" onClick={() => onFinish(stat)}>Fertig</button>
        </div>
      </div>
    );
  }

  return (
    <div className="tr-run">
      <div className="tr-top">
        <span>{i + 1} von {tasks.length}</span>
        <span className="tr-clock">{elapsedLabel(now - started.current)}</span>
      </div>
      <div className="tr-progress"><i style={{ width: `${(i / tasks.length) * 100}%` }} /></div>

      <div className="tr-prompt">{prompt(task, i)}</div>

      {input.kind === "choices" ? (
        <div className="tr-choices" style={{ ["--cols" as string]: input.columns ?? 2 }}>
          {input.options(task).map((o) => {
            const state = !fb ? "" : isRight(task, o) ? " is-right" : fb.chosen === o ? " is-wrong" : " is-dim";
            return <button key={o} className={`tr-choice${state}`} onClick={() => answer(o)} disabled={!!fb}>{o}</button>;
          })}
        </div>
      ) : (
        <div className="tr-answer">
          <input ref={inputRef} className="tr-input" value={value} disabled={!!fb}
            inputMode={input.kind === "number" ? "numeric" : "text"} autoCapitalize="characters" autoCorrect="off" autoComplete="off" spellCheck={false}
            placeholder={input.kind === "text" ? input.placeholder ?? "Antwort" : "Antwort"}
            onChange={(e) => setValue(input.kind === "number" ? e.target.value.replace(/[^0-9-]/g, "") : e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && answer(value)} />
          {!fb && <button className="btn btn-primary" disabled={!value.trim()} onClick={() => answer(value)}>Prüfen</button>}
        </div>
      )}

      {fb && (
        <div className={`tr-fb${fb.ok ? " is-ok" : " is-bad"}`}>
          {fb.ok ? "Richtig" : <>Richtig wäre: <b>{correct(task)}</b></>}
          {!fb.ok && <button className="btn btn-secondary btn-small" onClick={() => next(stat)}>Weiter</button>}
        </div>
      )}
    </div>
  );
}

// ---------------- Ton (Morse) ----------------

let ctx: AudioContext | null = null;

/** Muss durch eine Berührung ausgelöst werden (iOS), danach spielt der Ton auch automatisch. */
export function prepareAudio() {
  const C = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!C) return;
  ctx ??= new C();
  void ctx.resume?.();
}

export function playMorse(code: string, unit = 0.09): number {
  if (!ctx) prepareAudio();
  if (!ctx) return 0;
  let t = ctx.currentTime + 0.06;
  for (const sym of code) {
    if (sym === " ") {
      t += unit * 2;
      continue;
    }
    const len = sym === "-" ? unit * 3 : unit;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 620;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.25, t + 0.008);
    gain.gain.setValueAtTime(0.25, t + len - 0.012);
    gain.gain.linearRampToValueAtTime(0, t + len);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + len + 0.02);
    t += len + unit;
  }
  return t - ctx.currentTime;
}
