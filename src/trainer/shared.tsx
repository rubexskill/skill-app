import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Skill } from "../db";
import { elapsedLabel } from "../logic";
import { audioState, playTestTone, type AudioState } from "./audio";

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

export interface HowTo {
  points: string[];
  sources: { label: string; url?: string }[];
}

/** Kurze Erklärung mit Quelle, klappt auf */
export function HowToBox({ how }: { how: HowTo }) {
  return (
    <details className="tr-how">
      <summary>So funktioniert’s</summary>
      <ul>{how.points.map((p) => <li key={p}>{p}</li>)}</ul>
      <div className="tr-sources">
        Quellen:{" "}
        {how.sources.map((s, i) => (
          <span key={s.label}>
            {i > 0 && " · "}
            {s.url ? <a href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a> : s.label}
          </span>
        ))}
      </div>
    </details>
  );
}

/** Einrichtungsmaske vor dem Start */
export function Setup({ title, lead, children, onStart, startLabel = "Los", notice, how }: {
  title: string;
  lead?: string;
  children?: ReactNode;
  onStart: () => void;
  startLabel?: string;
  notice?: string;
  how?: HowTo;
}) {
  return (
    <div className="tr-setup">
      <h2 className="tr-title">{title}</h2>
      {lead && <p className="tr-lead">{lead}</p>}
      {notice && <div className="safety tr-notice"><p>{notice}</p></div>}
      {children}
      <button className="btn btn-primary tr-start" onClick={onStart}>{startLabel}</button>
      {how && <HowToBox how={how} />}
    </div>
  );
}

/** Test-Ton mit Hinweisen, falls auf dem iPhone nichts zu hören ist */
export function AudioCheck({ always = false }: { always?: boolean }) {
  const [state, setState] = useState<AudioState | null>(null);
  const [tried, setTried] = useState(false);
  const press = async () => {
    setTried(true);
    setState(await playTestTone());
  };
  const blocked = state !== null && state !== "running";
  return (
    <div className="tr-audio">
      <button className="btn btn-secondary btn-small" onClick={() => void press()}>Test-Ton abspielen</button>
      {(tried || always) && (
        <p className={`tr-audio-note${blocked ? " is-warn" : ""}`}>
          {blocked
            ? "Der Ton wurde vom System noch nicht freigegeben. Tippe den Knopf noch einmal. Hilft das nicht: App schließen und neu öffnen."
            : tried
              ? "Hast du drei Töne gehört? Wenn nicht: Lautstärke am iPhone hochdrehen, den Stummschalter an der Seite prüfen, Bluetooth-Kopfhörer abtrennen und die App einmal schließen und neu öffnen."
              : "Kein Ton? Teste ihn hier."}
        </p>
      )}
    </div>
  );
}

export function useAudioState(): AudioState {
  const [s, setS] = useState<AudioState>(audioState());
  useEffect(() => {
    const t = window.setInterval(() => setS(audioState()), 800);
    return () => window.clearInterval(t);
  }, []);
  return s;
}

export interface RoundStat {
  right: number;
  /** Teilpunkte (z. B. Zeichen einer Gruppe), sonst gleich right */
  credit: number;
  total: number;
  totalMs: number;
}

interface RoundProps<T> {
  tasks: T[];
  prompt: (t: T, i: number) => ReactNode;
  input: { kind: "number" } | { kind: "text"; placeholder?: string } | { kind: "choices"; options: (t: T) => string[]; columns?: number };
  isRight: (t: T, answer: string) => boolean;
  /** Teilpunkte 0..1 für eine Antwort, wenn nicht nur richtig/falsch zählt */
  credit?: (t: T, answer: string) => number;
  /** Anzeige der richtigen Lösung */
  correct: (t: T) => string;
  /** Erklärung nach einer falschen Antwort */
  explain?: (t: T) => ReactNode;
  onFinish: (s: RoundStat) => void;
  onRestart: () => void;
  /** Wird einmal aufgerufen, sobald die Runde ausgewertet ist */
  onComplete?: (s: RoundStat) => void;
  note?: (s: RoundStat) => string | null;
}

/** Eine Runde mit mehreren Aufgaben, danach können die Fehler noch einmal geübt werden. */
export function Round<T>(props: RoundProps<T>) {
  const [retry, setRetry] = useState<{ tasks: T[]; orig: RoundStat } | null>(null);
  const [gen, setGen] = useState(0);
  return (
    <RoundCore key={gen} {...props} tasks={retry ? retry.tasks : props.tasks} practice={retry?.orig ?? null}
      onRetry={(wrong, s) => {
        setRetry({ tasks: shuffle(wrong), orig: retry ? { ...retry.orig, totalMs: retry.orig.totalMs + s.totalMs } : s });
        setGen((g) => g + 1);
      }} />
  );
}

function RoundCore<T>({ tasks, prompt, input, isRight, credit, correct, explain, onFinish, onRestart, onComplete, note, practice, onRetry }: RoundProps<T> & { practice: RoundStat | null; onRetry: (wrong: T[], s: RoundStat) => void }) {
  const [i, setI] = useState(0);
  const [value, setValue] = useState("");
  const [fb, setFb] = useState<{ ok: boolean; chosen: string } | null>(null);
  const [stat, setStat] = useState<RoundStat>({ right: 0, credit: 0, total: tasks.length, totalMs: 0 });
  const [wrong, setWrong] = useState<T[]>([]);
  const [done, setDone] = useState(false);
  const started = useRef(Date.now());
  const timer = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const [now, setNow] = useState(Date.now());
  const completed = useRef(false);

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
      if (!completed.current && !practice) {
        completed.current = true;
        onComplete?.(s);
      }
      return;
    }
    setI(i + 1);
    setValue("");
    setFb(null);
    started.current = Date.now();
  };

  const answer = (a: string) => {
    if (fb || !a.trim()) return;
    const text = a.trim();
    const ok = isRight(task, text);
    const c = credit ? credit(task, text) : ok ? 1 : 0;
    const s = { right: stat.right + (ok ? 1 : 0), credit: stat.credit + c, total: tasks.length, totalMs: stat.totalMs + (Date.now() - started.current) };
    setStat(s);
    setFb({ ok, chosen: text });
    if (ok) {
      navigator.vibrate?.(8);
      timer.current = window.setTimeout(() => next(s), 550);
    } else {
      setWrong((w) => [...w, task]);
    }
  };

  if (done) {
    const avg = stat.totalMs / 1000 / stat.total;
    const n = practice ? null : note?.(stat);
    return (
      <div className="tr-result">
        {practice && <div className="tr-sub">Fehler wiederholt</div>}
        <div className="tr-big"><span className="num">{stat.right}</span><span className="unit"> von {stat.total}</span></div>
        <div className="tr-sub">richtig · Ø {de1(avg)} s pro Aufgabe</div>
        {n && <p className="tr-note">{n}</p>}
        {wrong.length > 0 && (
          <button className="btn btn-secondary tr-retry" onClick={() => onRetry(wrong, stat)}>
            {wrong.length === 1 ? "Den Fehler wiederholen" : `${wrong.length} Fehler wiederholen`}
          </button>
        )}
        <div className="tr-result-actions">
          <button className="btn btn-secondary" onClick={onRestart}>Neue Runde</button>
          <button className="btn btn-primary" onClick={() => onFinish(practice ? { ...practice, totalMs: practice.totalMs + stat.totalMs } : stat)}>Fertig</button>
        </div>
      </div>
    );
  }

  return (
    <div className="tr-run">
      <div className="tr-top">
        <span>{practice ? "Fehler üben · " : ""}{i + 1} von {tasks.length}</span>
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
          {!fb.ok && explain && <div className="tr-explain">{explain(task)}</div>}
          {!fb.ok && <button className="btn btn-secondary btn-small" onClick={() => next(stat)}>Weiter</button>}
        </div>
      )}
    </div>
  );
}
