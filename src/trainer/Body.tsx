import { useEffect, useMemo, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Card } from "../db";
import { bestOf, minutesLabel } from "../logic";
import { GRADE_LABEL, intervalLabel, schedule, type Grade } from "../srs";
import { Group, Segmented, useUI } from "../components/ui";
import { round1, Setup, type TrainerProps } from "./shared";

// ---------------- Atemübungen ----------------

interface Phase { label: string; sec: number; from: number; to: number }

const PATTERNS: Record<string, { name: string; hint: string; phases: Phase[] }> = {
  box: {
    name: "Box Breathing",
    hint: "4 Sekunden ein, halten, aus, halten",
    phases: [
      { label: "Einatmen", sec: 4, from: 0.45, to: 1 },
      { label: "Halten", sec: 4, from: 1, to: 1 },
      { label: "Ausatmen", sec: 4, from: 1, to: 0.45 },
      { label: "Halten", sec: 4, from: 0.45, to: 0.45 },
    ],
  },
  sigh: {
    name: "Physiologischer Seufzer",
    hint: "Doppelt einatmen, lang ausatmen",
    phases: [
      { label: "Einatmen", sec: 2, from: 0.45, to: 0.8 },
      { label: "Noch ein kurzer Zug", sec: 1, from: 0.8, to: 1 },
      { label: "Lang ausatmen", sec: 6, from: 1, to: 0.45 },
    ],
  },
};

const smooth = (k: number) => k * k * (3 - 2 * k);

function phaseAt(phases: Phase[], tSec: number) {
  const cycle = phases.reduce((a, p) => a + p.sec, 0);
  const t = tSec % cycle;
  let acc = 0;
  for (let i = 0; i < phases.length; i++) {
    const p = phases[i];
    if (t < acc + p.sec) {
      const k = (t - acc) / p.sec;
      return { i, p, left: Math.ceil(p.sec - (t - acc)), level: p.from + (p.to - p.from) * smooth(k), cycle };
    }
    acc += p.sec;
  }
  return { i: 0, p: phases[0], left: phases[0].sec, level: phases[0].from, cycle };
}

export function BreathTrainer({ skill, onFinish }: TrainerProps) {
  const [pattern, setPattern] = useState(skill.title.includes("Seufzer") ? "sigh" : "box");
  const [minutes, setMinutes] = useState("2");
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState<{ ms: number; rounds: number } | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const startAt = useRef(0);
  const lastIdx = useRef(-1);
  const phases = PATTERNS[pattern].phases;
  const cycle = phases.reduce((a, p) => a + p.sec, 0);

  useEffect(() => {
    if (!running) return;
    startAt.current = performance.now();
    lastIdx.current = -1;
    let raf = 0;
    const total = Number(minutes) * 60000;
    const loop = () => {
      const ms = performance.now() - startAt.current;
      if (ms >= total) {
        setRunning(false);
        setFinished({ ms: total, rounds: Math.floor(total / 1000 / cycle) });
        return;
      }
      setElapsed(ms);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [running, minutes, cycle]);

  const state = useMemo(() => phaseAt(phases, elapsed / 1000), [phases, elapsed]);
  useEffect(() => {
    if (running && state.i !== lastIdx.current) {
      lastIdx.current = state.i;
      navigator.vibrate?.(14);
    }
  }, [running, state.i]);

  const stop = () => {
    const ms = performance.now() - startAt.current;
    setRunning(false);
    setFinished({ ms, rounds: Math.floor(ms / 1000 / cycle) });
  };

  if (finished) {
    return (
      <div className="tr-result">
        <div className="tr-big"><span className="num">{finished.rounds}</span><span className="unit"> {finished.rounds === 1 ? "Runde" : "Runden"}</span></div>
        <div className="tr-sub">{PATTERNS[pattern].name} · {minutesLabel(Math.round(finished.ms / 60000))}</div>
        <div className="tr-result-actions">
          <button className="btn btn-secondary" onClick={() => { setFinished(null); setElapsed(0); }}>Nochmal</button>
          <button className="btn btn-primary" onClick={() => onFinish({ elapsedMs: finished.ms, headline: `${finished.rounds} ${finished.rounds === 1 ? "Runde" : "Runden"} geatmet` })}>Fertig</button>
        </div>
      </div>
    );
  }

  if (!running) {
    return (
      <Setup title="Atemübung" lead="Atme ruhig durch die Nase, folge dem Kreis." onStart={() => { setElapsed(0); setRunning(true); }}>
        <Group header="Übung" footer={PATTERNS[pattern].hint}>
          <div className="row segmented-row">
            <Segmented options={[{ value: "box", label: "Box" }, { value: "sigh", label: "Seufzer" }]} value={pattern} onChange={setPattern} />
          </div>
        </Group>
        <Group header="Dauer">
          <div className="row segmented-row">
            <Segmented options={[{ value: "1", label: "1 min" }, { value: "2", label: "2 min" }, { value: "5", label: "5 min" }]} value={minutes} onChange={setMinutes} />
          </div>
        </Group>
      </Setup>
    );
  }

  const left = Math.max(0, Number(minutes) * 60 - Math.floor(elapsed / 1000));
  return (
    <div className="br-wrap">
      <div className="br-stage">
        <div className="br-ring" />
        <div className="br-circle" style={{ transform: `scale(${state.level})` }} />
        <div className="br-label">
          <div className="br-phase">{state.p.label}</div>
          <div className="br-count">{state.left}</div>
        </div>
      </div>
      <div className="br-meta">Runde {Math.floor(elapsed / 1000 / cycle) + 1} · noch {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}</div>
      <button className="btn btn-secondary" onClick={stop}>Beenden</button>
    </div>
  );
}

// ---------------- Stoppuhr mit Bestzeit ----------------

const pad = (n: number) => String(n).padStart(2, "0");
export const clock = (ms: number) => `${Math.floor(ms / 60000)}:${pad(Math.floor(ms / 1000) % 60)},${Math.floor(ms / 100) % 10}`;

export function StopwatchTrainer({ skill, onFinish }: TrainerProps) {
  const { toast } = useUI();
  const higher = skill.metric?.higher ?? true;
  const label = skill.metric?.label ?? "Bestzeit";
  const records = useLiveQuery(() => db.records.where("skillId").equals(skill.id).toArray(), [skill.id]) ?? [];
  const stored = bestOf(records, higher);
  const [running, setRunning] = useState(false);
  const [ms, setMs] = useState(0);
  const [attempts, setAttempts] = useState<number[]>([]);
  const t0 = useRef(0);
  const first = useRef(0);

  useEffect(() => {
    if (!running) return;
    let raf = 0;
    const loop = () => {
      setMs(performance.now() - t0.current);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  const toggle = () => {
    navigator.vibrate?.(12);
    if (!running) {
      t0.current = performance.now();
      if (!first.current) first.current = Date.now();
      setMs(0);
      setRunning(true);
      return;
    }
    const final = performance.now() - t0.current;
    setRunning(false);
    setMs(final);
    const sec = round1(final / 1000);
    const earlier = [...records.map((x) => x.value), ...attempts.map((a) => round1(a / 1000))];
    const prevBest = earlier.length ? (higher ? Math.max(...earlier) : Math.min(...earlier)) : null;
    setAttempts((a) => [...a, final]);
    if (prevBest !== null && (higher ? sec > prevBest : sec < prevBest)) toast(`Neue ${label}: ${clock(final)}`);
  };

  const best = attempts.length ? (higher ? Math.max(...attempts) : Math.min(...attempts)) : null;
  const finish = () => {
    if (best === null) return;
    onFinish({
      elapsedMs: Date.now() - first.current,
      headline: `${label} ${clock(best)}`,
      record: { value: round1(best / 1000), label, unit: "s", higher },
    });
  };

  return (
    <div className="sw">
      {skill.profile?.safety && <div className="safety tr-notice"><p>{skill.profile.safety}</p></div>}
      <div className={`sw-time${running ? " is-running" : ""}`}>{clock(ms)}</div>
      <div className="sw-best">{stored !== null ? `${label}: ${clock(stored * 1000)}` : "Noch keine Bestzeit"}</div>
      <button className={`sw-btn${running ? " is-running" : ""}`} onClick={toggle} aria-label={running ? "Stoppen" : "Starten"}>{running ? "Stopp" : attempts.length ? "Nochmal" : "Start"}</button>
      {attempts.length > 0 && (
        <Group header={`Versuche · beste ${best !== null ? clock(best) : ""}`}>
          {attempts.map((a, i) => (
            <div key={i} className="row"><div className="row-main"><div className="row-title">Versuch {i + 1}</div></div><div className="row-detail">{clock(a)}{a === best ? " · beste" : ""}</div></div>
          ))}
        </Group>
      )}
      <button className="btn btn-primary tr-start" disabled={!attempts.length || running} onClick={finish}>Fertig</button>
      {attempts.length === 0 && <div className="tr-hint">Gestoppt wird per Tipp. Die beste Zeit wird als Rekord gespeichert.</div>}
    </div>
  );
}

// ---------------- Karteikarten ----------------

export function CardsReview({ skill, onFinish }: TrainerProps) {
  const [queue, setQueue] = useState<Card[] | null>(null);
  const [cram, setCram] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(0);
  const started = useRef(Date.now());
  const [total, setTotal] = useState(0);

  const load = async (all: boolean) => {
    const cards = await db.cards.where("skillId").equals(skill.id).toArray();
    const list = (all ? cards : cards.filter((c) => c.due <= Date.now())).sort((a, b) => a.due - b.due);
    setCram(all);
    setQueue(list);
    setTotal(list.length);
    setDone(0);
    setFlipped(false);
    started.current = Date.now();
  };
  useEffect(() => { void load(false); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!queue) return <div className="tr-lead">Karten werden geladen …</div>;

  const finish = () => onFinish({ elapsedMs: Date.now() - started.current, headline: `${done} Karten wiederholt` });

  if (queue.length === 0) {
    return (
      <div className="tr-result">
        {done > 0 ? (
          <>
            <div className="tr-big"><span className="num">{done}</span><span className="unit"> {done === 1 ? "Karte" : "Karten"}</span></div>
            <div className="tr-sub">wiederholt – für heute geschafft</div>
            <div className="tr-result-actions"><button className="btn btn-primary" onClick={finish}>Fertig</button></div>
          </>
        ) : (
          <>
            <div className="tr-big"><span className="num">0</span><span className="unit"> fällig</span></div>
            <div className="tr-sub">Heute ist nichts zu wiederholen.</div>
            <div className="tr-result-actions">
              <button className="btn btn-secondary" onClick={() => void load(true)}>Trotzdem durchgehen</button>
              <button className="btn btn-primary" onClick={() => onFinish({ elapsedMs: 0, headline: "Keine fälligen Karten" })}>Schließen</button>
            </div>
          </>
        )}
      </div>
    );
  }

  const card = queue[0];
  const grade = async (g: Grade) => {
    navigator.vibrate?.(8);
    const rest = queue.slice(1);
    if (!cram) {
      const s = schedule(card, g);
      await db.cards.update(card.id, { interval: s.interval, ease: s.ease, reps: s.reps, lapses: s.lapses, due: s.due });
      if (g === 0) rest.push({ ...card, ...s });
    } else if (g === 0) rest.push(card);
    setDone((d) => d + (g === 0 ? 0 : 1));
    setQueue(rest);
    setFlipped(false);
  };

  return (
    <div className="fc">
      <div className="tr-top"><span>{Math.min(total, done + 1)} von {total}{cram ? " · Übungsrunde" : ""}</span><span className="tr-clock">{queue.length} übrig</span></div>
      <div className="tr-progress"><i style={{ width: `${(done / Math.max(1, total)) * 100}%` }} /></div>
      <button className={`fc-card${flipped ? " is-flipped" : ""}`} onClick={() => setFlipped(true)} aria-label={flipped ? "Rückseite" : "Antwort zeigen"}>
        <span className="fc-side">{flipped ? "Antwort" : "Frage"}</span>
        <span className="fc-text">{flipped ? card.back : card.front}</span>
        {!flipped && <span className="fc-hint">Antippen zum Umdrehen</span>}
      </button>
      {flipped ? (
        <div className="fc-grades">
          {([0, 1, 2, 3] as Grade[]).map((g) => (
            <button key={g} className={`fc-grade g${g}`} onClick={() => void grade(g)}>
              <span>{GRADE_LABEL[g]}</span>
              <small>{cram ? "" : intervalLabel(card, g)}</small>
            </button>
          ))}
        </div>
      ) : (
        <button className="btn btn-primary" onClick={() => setFlipped(true)}>Antwort zeigen</button>
      )}
    </div>
  );
}
