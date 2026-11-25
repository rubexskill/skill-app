// Würfel-Trainer: 3D-Würfel, Mischen/Zurück/Neu, Zeitnahme wie bei Speedcubern, Verlauf, Lernpfad für Anfänger.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Group, Row, useUI } from "../../components/ui";
import { Icon } from "../../components/Icon";
import { dayLabel, timeLabel } from "../../logic";
import type { TrainerProps } from "../shared";
import Cube3D from "./Cube3D";
import { applyMoves, cloneCube, FACE_COLORS, formatMoves, invertMove, isSolved, parseMoves, scramble as makeScramble, solvedCube, type Cube } from "./engine";
import type { CubeView } from "./scene";
import { webglAvailable } from "./scene";
import { STEPS, movesOf, setupOf, stepState, type Algo, type Step } from "./path";
import { formatTime, statsOf } from "./stats";
import { addCubePracticeTime, addCubeTime, deleteCubeTime, loadCubeTimes, loadProgress, restoreCubeTime, setAlgoState } from "./store";
import type { CubeTime } from "./types";

type Panel = "main" | "history" | "path" | "step" | "learn";
type Phase = "free" | "scrambling" | "ready" | "running" | "solved";

/** Schreibt Zug-Eingaben und Tempo in einer Schnittstelle, egal ob 3D oder Fallback-Netz */
interface Driver {
  getState(): Cube;
  setState(c: Cube): void;
  applyMoves(list: string[], opts?: { ms?: number; onMove?: (i: number) => void }): Promise<boolean>;
  preview(m: string): Promise<void>;
  cancel(): void;
  busy(): boolean;
}

function Bar({ title, onBack, label = "Zurück" }: { title: string; onBack: () => void; label?: string }) {
  return (
    <div className="fl-bar-top">
      <button className="fl-back" onClick={onBack}><Icon name="chevron-left" size={20} />{label}</button>
      <span className="fl-bar-title">{title}</span>
      <span className="fl-back-spacer" />
    </div>
  );
}

/** Notation: jeder Zug lässt sich antippen und dreht sich einmal vor. */
function Notation({ moves, current, onTap, className = "" }: { moves: string[]; current?: number; onTap?: (m: string) => void; className?: string }) {
  return (
    <div className={`cz-moves ${className}`}>
      {moves.map((m, i) => (
        <button key={i} className={`cz-move${current === i ? " is-now" : ""}${current !== undefined && i < current ? " is-done" : ""}`} onClick={() => onTap?.(m)} disabled={!onTap} aria-label={`Zug ${m}`}>{m}</button>
      ))}
    </div>
  );
}

/** Flaches Netz – nur wenn WebGL fehlt */
function Net({ cube }: { cube: Cube }) {
  const face = (f: number) => (
    <div className="cz-face" key={f}>{Array.from({ length: 9 }, (_, k) => <i key={k} style={{ background: FACE_COLORS[cube[f * 9 + k]] }} />)}</div>
  );
  return <div className="cz-net" aria-label="Würfel als Netz">{[0, 4, 2, 1, 5, 3].map(face)}</div>;
}

export default function CubeTrainer({ skill }: TrainerProps) {
  const { toast, undoable } = useUI();
  const [panel, setPanel] = useState<Panel>("main");
  const [step, setStep] = useState<Step | null>(null);
  const [learn, setLearn] = useState<{ algo: Algo; mode: "demo" | "practice" } | null>(null);
  const [gl, setGl] = useState<"pending" | "ok" | "none">(() => (webglAvailable() ? "pending" : "none"));
  const viewRef = useRef<CubeView | null>(null);
  const netState = useRef<Cube>(solvedCube());
  const [, bump] = useState(0);

  const [phase, setPhaseState] = useState<Phase>("free");
  const phaseRef = useRef<Phase>("free");
  const setPhase = (p: Phase) => { phaseRef.current = p; setPhaseState(p); };
  const [scr, setScr] = useState<string[]>([]);
  const scrRef = useRef<string[]>([]);
  const [moves, setMovesState] = useState<string[]>([]);
  const movesRef = useRef<string[]>([]);
  const setMoves = (m: string[]) => { movesRef.current = m; setMovesState(m); };
  const [notationOpen, setNotationOpen] = useState(true);
  const [typing, setTyping] = useState(false);
  const [text, setText] = useState("");
  const [typeError, setTypeError] = useState("");
  const [working, setWorking] = useState(false);
  const [note, setNote] = useState("");
  const timerEl = useRef<HTMLDivElement>(null);
  const startAt = useRef(0);
  const learnHandler = useRef<((move: string) => void) | null>(null);
  const panelRef = useRef<Panel>("main");
  panelRef.current = panel;
  const times = useLiveQuery(() => loadCubeTimes(), []);
  const progress = useLiveQuery(() => loadProgress(), []);

  // ---------- Übungszeit ----------
  const activeMs = useRef(0), reported = useRef(0), lastActive = useRef(0);
  const markActive = () => { lastActive.current = performance.now(); };
  useEffect(() => {
    const flush = () => { const d = activeMs.current - reported.current; if (d > 0) { reported.current = activeMs.current; void addCubePracticeTime(skill.id, d); } };
    const id = window.setInterval(() => { if (performance.now() - lastActive.current < 45000) activeMs.current += 1000; if (activeMs.current - reported.current >= 60000) flush(); }, 1000);
    return () => { window.clearInterval(id); flush(); };
  }, [skill.id]);

  // ---------- Treiber: 3D oder Netz ----------
  const driver: Driver = useMemo(() => ({
    getState: () => (viewRef.current ? viewRef.current.getState() : cloneCube(netState.current)),
    setState: (c) => { if (viewRef.current) viewRef.current.setState(c); else { netState.current = cloneCube(c); bump((n) => n + 1); } },
    applyMoves: async (list, o) => {
      if (viewRef.current) return viewRef.current.applyMoves(list, o);
      for (let i = 0; i < list.length; i++) { o?.onMove?.(i); netState.current = applyMoves(netState.current, [list[i]]); bump((n) => n + 1); await new Promise((r) => setTimeout(r, 60)); }
      return true;
    },
    preview: async (m) => { if (viewRef.current) await viewRef.current.preview(m); },
    cancel: () => viewRef.current?.cancelQueue(),
    busy: () => !!viewRef.current?.busy(),
  }), []);

  // ---------- Zeitnahme ----------
  const tickTimer = useRef(0);
  const stopTick = () => { window.clearInterval(tickTimer.current); tickTimer.current = 0; };
  const showTime = (ms: number) => { if (timerEl.current) timerEl.current.textContent = formatTime(ms); };
  useEffect(() => stopTick, []);
  const startTimer = () => {
    startAt.current = performance.now();
    setPhase("running");
    setNote("");
    stopTick();
    tickTimer.current = window.setInterval(() => showTime(performance.now() - startAt.current), 50);
  };
  const finishSolve = () => {
    const ms = performance.now() - startAt.current;
    stopTick();
    showTime(ms);
    setPhase("solved");
    const previousBest = times && times.length ? Math.min(...times.map((t) => t.ms)) : null;
    void addCubeTime(ms, formatMoves(scrRef.current)).then(() => {
      setNote(previousBest === null || ms < previousBest ? "Neue Bestzeit" : "Gelöst");
    });
    viewRef.current?.spin();
  };

  /** Nach jedem Zug des Benutzers (Ziehen oder Eingabe) */
  const afterMove = useCallback((move: string) => {
    markActive();
    if (panelRef.current === "learn") { learnHandler.current?.(move); return; }
    setMoves([...movesRef.current, move]);
    const st = driver.getState();
    if (phaseRef.current === "ready") startTimer();
    if (phaseRef.current === "running" && isSolved(st)) finishSolve();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driver, times]);

  const reset = (c: Cube) => { stopTick(); showTime(0); driver.setState(c); setMoves([]); scrRef.current = []; setScr([]); setPhase("free"); setNote(""); };

  const doScramble = async () => {
    if (working) return;
    markActive();
    setWorking(true);
    const s = makeScramble(25);
    stopTick(); showTime(0);
    driver.setState(solvedCube());
    setMoves([]); scrRef.current = s; setScr(s); setNote("");
    setPhase("scrambling");
    await driver.applyMoves(s, { ms: 70 });
    setPhase("ready");
    setWorking(false);
  };
  const doUndo = async () => {
    if (working || !movesRef.current.length || driver.busy()) return;
    markActive();
    setWorking(true);
    const last = movesRef.current[movesRef.current.length - 1];
    setMoves(movesRef.current.slice(0, -1));
    await driver.applyMoves([invertMove(last)], { ms: 160 });
    if (phaseRef.current === "running" && isSolved(driver.getState())) finishSolve();
    setWorking(false);
  };
  const doNew = () => { if (working) return; markActive(); reset(solvedCube()); };

  const typeMoves = async () => {
    let list: string[];
    try { list = parseMoves(text); } catch (e) { setTypeError((e as Error).message); return; }
    if (!list.length) return;
    setTypeError(""); setText("");
    setWorking(true);
    for (const m of list) { await driver.applyMoves([m], { ms: 170 }); afterMove(m); }
    setWorking(false);
  };

  const preview = (m: string) => { if (!driver.busy() && !working) { markActive(); void driver.preview(m); } };

  // ---------- Lernpfad ----------
  const snapshot = useRef<{ cube: Cube; scr: string[]; moves: string[]; phase: Phase } | null>(null);
  const openLearn = (algo: Algo, mode: "demo" | "practice") => {
    markActive();
    snapshot.current = { cube: driver.getState(), scr: scrRef.current, moves: movesRef.current, phase: phaseRef.current === "running" ? "free" : phaseRef.current };
    stopTick();
    setLearn({ algo, mode });
    setPanel("learn");
  };
  const closeLearn = () => {
    driver.cancel();
    learnHandler.current = null;
    const s = snapshot.current;
    snapshot.current = null;
    setLearn(null);
    setPanel("step");
    if (s) { driver.setState(s.cube); scrRef.current = s.scr; setScr(s.scr); setMoves(s.moves); setPhase(s.phase === "scrambling" ? "free" : s.phase); showTime(0); }
  };

  const stats = useMemo(() => statsOf((times ?? []).map((t) => t.ms)), [times]);
  const stage = panel === "main" || panel === "learn";

  return (
    <div className={`cz is-${panel}`}>
      <div className="cz-stage" hidden={!stage}>
        {gl === "none" ? (
          <div className="cz-nogl">
            <Net cube={netState.current} />
            <p>Auf diesem Gerät ist WebGL nicht verfügbar, deshalb gibt es keinen 3D-Würfel. Züge lassen sich über das Tastatur-Symbol eingeben.</p>
          </div>
        ) : (
          <Cube3D onReady={(v) => { viewRef.current = v; setGl("ok"); }} onUserMove={(m) => afterMove(m)} onTouch={(a) => { if (a) markActive(); }} onUnavailable={() => setGl("none")} />
        )}
        {panel === "main" && (
          <div className={`cz-timer is-${phase}`} aria-live="off">
            <div className="cz-time" ref={timerEl}>0,00</div>
            <div className="cz-note">{phase === "ready" ? "Bereit" : phase === "scrambling" ? "Mischen …" : note}</div>
          </div>
        )}
      </div>

      {panel === "main" && (
        <>
          <div className="cz-top">
            <div className="cz-icons">
              <button className="fl-icon" aria-label="Zeiten" onClick={() => setPanel("history")}><Icon name="clock" size={22} /></button>
              <button className="fl-icon" aria-label="Lernpfad" onClick={() => setPanel("path")}><Icon name="book" size={22} /></button>
              <button className={`fl-icon${typing ? " is-on" : ""}`} aria-label="Züge eingeben" aria-pressed={typing} onClick={() => setTyping((t) => !t)}><Icon name="keyboard" size={22} /></button>
            </div>
          </div>
          {typing && (
            <div className="cz-type">
              <input value={text} placeholder="z. B. R U R' U'" autoCapitalize="characters" autoCorrect="off" spellCheck={false} enterKeyHint="go"
                onChange={(e) => { setText(e.target.value); setTypeError(""); }} onKeyDown={(e) => e.key === "Enter" && void typeMoves()} aria-label="Züge in Notation" />
              <button className="cz-go" onClick={() => void typeMoves()} disabled={!text.trim() || working}>Los</button>
              {typeError && <div className="cz-err">{typeError}</div>}
            </div>
          )}
          {(scr.length > 0 || moves.length > 0) && (
            <div className="cz-notation">
              <button className="cz-fold" onClick={() => setNotationOpen((o) => !o)} aria-expanded={notationOpen}>
                Notation<Icon name="chevron-down" size={12} className={notationOpen ? "is-open" : ""} />
              </button>
              {notationOpen && (
                <div className="cz-nbody">
                  {scr.length > 0 && <><small>Mischung</small><Notation moves={scr} onTap={preview} className="is-dim" /></>}
                  {moves.length > 0 && <><small>Deine Züge</small><Notation moves={moves} onTap={preview} /></>}
                </div>
              )}
            </div>
          )}
          <div className="cz-buttons">
            <button className="cz-btn" onClick={() => void doScramble()} disabled={working}><Icon name="shuffle" size={18} />Mischen</button>
            <button className="cz-btn" onClick={() => void doUndo()} disabled={working || moves.length === 0} aria-label="Letzten Zug rückgängig"><Icon name="undo" size={18} />Zurück</button>
            <button className="cz-btn" onClick={doNew} disabled={working}><Icon name="plus" size={18} />Neu</button>
          </div>
        </>
      )}

      {panel === "history" && (
        <div className="fl">
          <Bar title="Zeiten" onBack={() => setPanel("main")} />
          <div className="cz-stats">
            <div><small>Bestzeit</small><b>{stats.best === null ? "–" : formatTime(stats.best)}</b></div>
            <div><small>Ao5</small><b>{stats.ao5 === null ? "–" : formatTime(stats.ao5)}</b></div>
            <div><small>Ao12</small><b>{stats.ao12 === null ? "–" : formatTime(stats.ao12)}</b></div>
          </div>
          {(times ?? []).length === 0 ? (
            <p className="cz-empty">Noch keine Zeit. Mische den Würfel und löse ihn, die Zeit läuft ab dem ersten Zug.</p>
          ) : (
            <Group header={`${times!.length} ${times!.length === 1 ? "Lösung" : "Lösungen"}`}>
              {times!.map((t: CubeTime) => (
                <Row key={t.id} title={<span className="cz-rowtime">{formatTime(t.ms)}</span>} subtitle={`${dayLabel(t.at)}${dayLabel(t.at) === "Heute" ? `, ${timeLabel(t.at)}` : ""}`}
                  trailing={<button className="rec-del" aria-label={`Zeit ${formatTime(t.ms)} löschen`} onClick={() => undoable("Zeit gelöscht", async () => { await deleteCubeTime(t.id); return async () => void (await restoreCubeTime(t)); })}><Icon name="trash" size={17} /></button>} />
              ))}
            </Group>
          )}
        </div>
      )}

      {panel === "path" && (
        <div className="fl">
          <Bar title="Lernpfad" onBack={() => setPanel("main")} />
          <p className="cz-lead">Schicht für Schicht zum gelösten Würfel. Weiß liegt unten, Gelb oben.</p>
          <Group>
            {STEPS.map((s, i) => {
              const st = stepState(s, progress ?? new Map());
              return (
                <Row key={s.id} title={`${i + 1}. ${s.title}`} detail={st === "kann" ? "kann ich" : st === "ueben" ? "noch üben" : undefined} chevron
                  leading={<span className={`cz-dot is-${st}`} aria-hidden="true" />} onClick={() => { setStep(s); setPanel("step"); }} />
              );
            })}
          </Group>
        </div>
      )}

      {panel === "step" && step && (
        <div className="fl">
          <Bar title={step.title} onBack={() => setPanel("path")} label="Lernpfad" />
          <p className="cz-lead">{step.text}</p>
          {step.algos.map((a) => {
            const st = progress?.get(a.id)?.state;
            return (
              <div key={a.id} className="cz-algo">
                <div className="cz-algo-head"><b>{a.name}</b>{st && <span className={`cz-chip is-${st}`}>{st === "kann" ? "kann ich" : "noch üben"}</span>}</div>
                <div className="cz-algo-not">{a.notation}</div>
                <div className="cz-algo-hint">{a.hint}</div>
                <div className="cz-algo-actions">
                  <button className="cz-btn is-flat" onClick={() => openLearn(a, "demo")}>Zeig mir</button>
                  <button className="cz-btn is-flat" onClick={() => openLearn(a, "practice")}>Üben</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {panel === "learn" && learn && (
        <LearnPanel key={`${learn.algo.id}-${learn.mode}`} algo={learn.algo} mode={learn.mode} driver={driver} register={(h) => { learnHandler.current = h; }} onExit={closeLearn}
          onMark={(state) => { void setAlgoState(learn.algo.id, state); if (state === "kann") toast("Gespeichert: kann ich"); }} typing={typing} setTyping={setTyping} onType={async (list) => { for (const m of list) { await driver.applyMoves([m], { ms: 170 }); afterMove(m); } }} />
      )}
    </div>
  );
}

// ---------------- Zeig mir / Üben ----------------

function LearnPanel({ algo, mode, driver, register, onExit, onMark, typing, setTyping, onType }: {
  algo: Algo; mode: "demo" | "practice"; driver: Driver; register: (h: ((m: string) => void) | null) => void; onExit: () => void; onMark: (s: "kann" | "ueben") => void;
  typing: boolean; setTyping: (v: boolean) => void; onType: (list: string[]) => Promise<void>;
}) {
  const alg = useMemo(() => movesOf(algo), [algo]);
  const setup = useMemo(() => setupOf(algo), [algo]);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [hint, setHint] = useState(false);
  const [done, setDone] = useState(false);
  const [text, setText] = useState("");
  const [err, setErr] = useState("");
  const idxRef = useRef(0), playRef = useRef(false), speedRef = useRef(1), aliveRef = useRef(true);
  speedRef.current = speed;

  const toCase = useCallback(() => { driver.cancel(); driver.setState(applyMoves(solvedCube(), setup)); idxRef.current = 0; setIdx(0); setDone(false); }, [driver, setup]);
  useEffect(() => {
    aliveRef.current = true;
    toCase();
    if (mode === "practice") register((_m) => { if (isSolved(driver.getState())) { setDone(true); onMark("kann"); } });
    return () => { aliveRef.current = false; playRef.current = false; register(null); driver.cancel(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const playFrom = async () => {
    playRef.current = true; setPlaying(true);
    while (playRef.current && aliveRef.current && idxRef.current < alg.length) {
      const i = idxRef.current;
      await driver.applyMoves([alg[i]], { ms: 420 / speedRef.current });
      if (!aliveRef.current) return;
      idxRef.current = i + 1; setIdx(i + 1);
      await new Promise((r) => setTimeout(r, 160 / speedRef.current));
    }
    playRef.current = false; if (aliveRef.current) setPlaying(false);
  };
  const pause = () => { playRef.current = false; setPlaying(false); };
  const stepOne = async () => {
    if (playing || idxRef.current >= alg.length || driver.busy()) return;
    const i = idxRef.current;
    await driver.applyMoves([alg[i]], { ms: 420 / speedRef.current });
    idxRef.current = i + 1; setIdx(i + 1);
  };
  const again = () => { pause(); toCase(); };

  return (
    <div className="cz-learn">
      <Bar title={mode === "demo" ? "Zeig mir" : "Üben"} onBack={onExit} label="Lernpfad" />
      <div className="cz-learn-name">{algo.name}</div>
      {mode === "demo" ? (
        <>
          <Notation moves={alg} current={idx} onTap={(m) => { if (!playing && !driver.busy()) void driver.preview(m); }} />
          <div className="cz-ctrl">
            <button className="cz-btn" onClick={() => (playing ? pause() : void playFrom())} disabled={idx >= alg.length && !playing}>{playing ? "Pause" : idx === 0 ? "Start" : "Weiter"}</button>
            <button className="cz-btn" onClick={() => void stepOne()} disabled={playing || idx >= alg.length}>Schritt</button>
            <button className="cz-btn" onClick={again} aria-label="Von vorn">Neu</button>
          </div>
          <div className="cz-speed" role="group" aria-label="Tempo">
            {[0.5, 1, 2].map((v) => <button key={v} className={`fl-chip${speed === v ? " is-on" : ""}`} aria-pressed={speed === v} onClick={() => setSpeed(v)}>{String(v).replace(".", ",")}×</button>)}
          </div>
        </>
      ) : (
        <>
          {done ? (
            <div className="cz-done">
              <b>Geschafft.</b><span>Der Fall ist gelöst und als „kann ich“ gespeichert.</span>
              <div className="cz-ctrl">
                <button className="cz-btn" onClick={() => { onMark("ueben"); again(); }}>Noch üben</button>
                <button className="cz-btn" onClick={again}>Nochmal</button>
                <button className="cz-btn" onClick={onExit}>Fertig</button>
              </div>
            </div>
          ) : (
            <>
              <p className="cz-lead">Löse den Würfel mit dem Algorithmus. Ziehe an den Schichten oder gib die Züge ein.</p>
              <button className="cz-fold" onClick={() => setHint((h) => !h)} aria-expanded={hint}>Tipp zeigen<Icon name="chevron-down" size={12} className={hint ? "is-open" : ""} /></button>
              {hint && <Notation moves={alg} onTap={(m) => { if (!driver.busy()) void driver.preview(m); }} />}
              <div className="cz-ctrl">
                <button className="cz-btn" onClick={again}>Fall neu</button>
                <button className={`cz-btn${typing ? " is-on" : ""}`} onClick={() => setTyping(!typing)} aria-pressed={typing} aria-label="Züge eingeben"><Icon name="keyboard" size={18} />Eingabe</button>
              </div>
              {typing && (
                <div className="cz-type">
                  <input value={text} placeholder="z. B. R U R' U'" autoCapitalize="characters" autoCorrect="off" spellCheck={false} aria-label="Züge in Notation"
                    onChange={(e) => { setText(e.target.value); setErr(""); }}
                    onKeyDown={(e) => { if (e.key === "Enter") { try { const l = parseMoves(text); setText(""); void onType(l); } catch (x) { setErr((x as Error).message); } } }} />
                  <button className="cz-go" disabled={!text.trim()} onClick={() => { try { const l = parseMoves(text); setText(""); void onType(l); } catch (x) { setErr((x as Error).message); } }}>Los</button>
                  {err && <div className="cz-err">{err}</div>}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

