// Würfel-Trainer: 3D-Würfel, Mischen/Zurück/Neu, Zeitnahme wie bei Speedcubern, Verlauf, Lernpfad für Anfänger.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Group, Row, useUI } from "../../components/ui";
import { Icon } from "../../components/Icon";
import { dayLabel, timeLabel } from "../../logic";
import type { TrainerProps } from "../shared";
import Cube3D from "./Cube3D";
import Player from "./Player";
import { hintFor, makeSession, solutionSession, type Session } from "./session";
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
  applyMoves(list: string[], opts?: { ms?: number; onMove?: (i: number) => void; highlight?: boolean }): Promise<boolean>;
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
  const [learn, setLearn] = useState<{ algo: Algo } | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [sessionKey, setSessionKey] = useState(0);
  const [sessionReason, setSessionReason] = useState<string | undefined>();
  const userRef = useRef<((move: string) => void) | null>(null);
  const sessionRef = useRef<Session | null>(null);
  sessionRef.current = session;
  // Testzugang (nur Test-Builds): laufende Wiedergabe
  useEffect(() => {
    if (!(import.meta.env.DEV || import.meta.env.VITE_EXPOSE === "1")) return;
    (window as unknown as Record<string, unknown>).__cubeSession = session ? { kind: session.kind, moves: session.moves, phases: session.phases, start: Array.from(session.start).join("") } : null;
  }, [session]);
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
    if (userRef.current) { userRef.current(move); return; }
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

  // ---------- Lösung zeigen, Lernpfad ----------
  const snapshot = useRef<{ cube: Cube; scr: string[]; moves: string[]; phase: Phase } | null>(null);
  const takeSnapshot = () => {
    if (snapshot.current) return;
    snapshot.current = { cube: driver.getState(), scr: scrRef.current, moves: movesRef.current, phase: phaseRef.current === "running" ? "free" : phaseRef.current };
  };
  const restoreSnapshot = () => {
    const sn = snapshot.current;
    snapshot.current = null;
    if (sn) { driver.setState(sn.cube); scrRef.current = sn.scr; setScr(sn.scr); setMoves(sn.moves); setPhase(sn.phase === "scrambling" ? "free" : sn.phase); showTime(0); }
  };
  const stopForSession = () => {
    stopTick();
    if (phaseRef.current === "running") { setPhase("free"); setNote("Lösung angesehen"); }
  };
  const startSolution = () => {
    if (working || driver.busy()) return;
    markActive();
    const r = solutionSession(driver.getState());
    if (!r.ok) { toast(r.reason); return; }
    if (!r.session.moves.length) { toast("Der Würfel ist schon gelöst."); return; }
    if (import.meta.env.DEV || import.meta.env.VITE_EXPOSE === "1") (window as unknown as Record<string, unknown>).__cubeSolve = { ms: r.ms, moves: r.session.moves.length };
    stopForSession();
    setSessionReason(undefined);
    setSession(r.session); setSessionKey((k) => k + 1);
  };
  const showHint = () => {
    if (working || driver.busy()) return;
    markActive();
    const m = hintFor(driver.getState());
    if (!m) { toast("Der Würfel ist schon gelöst."); return; }
    toast(`Nächster Zug: ${m}`);
    void driver.preview(m);
  };
  const startAlgo = (a: Algo) => {
    if (driver.busy()) return;
    markActive();
    takeSnapshot();
    stopForSession();
    const caseState = applyMoves(solvedCube(), setupOf(a));
    setSessionReason(undefined);
    setSession(makeSession("algo", a.name, caseState, movesOf(a))); setSessionKey((k) => k + 1);
  };
  const endSession = (message?: string) => {
    userRef.current = null;
    if (sessionRef.current?.kind === "algo") restoreSnapshot();
    setSession(null);
    if (message) toast(message);
  };
  const replaceSession = (next: Session) => { setSessionReason("Neu berechnet nach deinem Zug."); setSession(next); setSessionKey((k) => k + 1); };

  const openLearn = (algo: Algo) => {
    markActive();
    if (session) { userRef.current = null; setSession(null); }
    takeSnapshot();
    stopTick();
    setLearn({ algo });
    setPanel("learn");
  };
  const closeLearn = () => {
    driver.cancel();
    learnHandler.current = null;
    setLearn(null);
    setPanel("step");
    restoreSnapshot();
  };
  const leaveTo = (p: Panel) => { if (session) endSession(); setPanel(p); };

  const stats = useMemo(() => statsOf((times ?? []).map((t) => t.ms)), [times]);
  const stage = panel !== "history";

  const mainControls = panel === "main" && !session;
  return (
    <div className={`cz is-${panel}${session ? " has-session" : ""}`}>
      {(
        <div className="cz-stage" hidden={!stage}>
          {gl === "none" ? (
            <div className="cz-nogl">
              <Net cube={netState.current} />
              <p>Auf diesem Gerät ist WebGL nicht verfügbar, deshalb gibt es keinen 3D-Würfel. Züge lassen sich über das Tastatur-Symbol eingeben.</p>
            </div>
          ) : (
            <Cube3D onReady={(v) => { viewRef.current = v; setGl("ok"); }} onUserMove={(m) => afterMove(m)} onTouch={(a) => { if (a) markActive(); }} onUnavailable={() => setGl("none")} />
          )}
          {panel === "main" && !session && (
            <div className={`cz-timer is-${phase}`} aria-live="off">
              <div className="cz-time" ref={timerEl}>0,00</div>
              <div className="cz-note">{phase === "ready" ? "Bereit" : phase === "scrambling" ? "Mischen …" : note}</div>
            </div>
          )}
          {gl !== "none" && <button className="cz-viewreset" aria-label="Ansicht zurücksetzen" onClick={() => viewRef.current?.resetView()}><Icon name="repeat" size={18} /></button>}
        </div>
      )}

      {session && (
        <Player key={sessionKey} session={session} driver={driver} onExit={endSession} onReplace={replaceSession} registerUser={userRef} reason={sessionReason} />
      )}

      {mainControls && (
        <>
          <div className="cz-top">
            <div className="cz-solve">
              <button className="cz-pill" onClick={startSolution} disabled={working}>Lösung zeigen</button>
              <button className="cz-pill is-quiet" onClick={showHint} disabled={working}>Tipp</button>
            </div>
            <div className="cz-icons">
              <button className="fl-icon" aria-label="Zeiten" onClick={() => setPanel("history")}><Icon name="clock" size={22} /></button>
              <button className="fl-icon" aria-label="Anleitung" onClick={() => setPanel("path")}><Icon name="book" size={22} /></button>
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
          <Bar title="Anleitung" onBack={() => leaveTo("main")} label="Würfel" />
          <p className="cz-lead">Die 7 Schritte der Anfängermethode</p>
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
          <Bar title={step.title} onBack={() => leaveTo("path")} label="Anleitung" />
          <p className="cz-lead">{step.text}</p>
          {step.algos.map((a) => {
            const st = progress?.get(a.id)?.state;
            return (
              <div key={a.id} className="cz-algo">
                <div className="cz-algo-head"><b>{a.name}</b>{st && <span className={`cz-chip is-${st}`}>{st === "kann" ? "kann ich" : "noch üben"}</span>}</div>
                <div className="cz-algo-not">{a.notation}</div>
                <div className="cz-algo-hint">{a.hint}</div>
                <div className="cz-algo-actions">
                  <button className="cz-btn is-flat" onClick={() => startAlgo(a)}>Zeig mir</button>
                  <button className="cz-btn is-flat" onClick={() => openLearn(a)}>Üben</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {panel === "learn" && learn && (
        <LearnPanel key={learn.algo.id} algo={learn.algo} driver={driver} register={(h) => { learnHandler.current = h; }} onExit={closeLearn}
          onMark={(state) => { void setAlgoState(learn.algo.id, state); if (state === "kann") toast("Gespeichert: kann ich"); }} typing={typing} setTyping={setTyping} onType={async (list) => { for (const m of list) { await driver.applyMoves([m], { ms: 170 }); afterMove(m); } }} />
      )}
    </div>
  );
}

// ---------------- Zeig mir / Üben ----------------

function LearnPanel({ algo, driver, register, onExit, onMark, typing, setTyping, onType }: {
  algo: Algo; driver: Driver; register: (h: ((m: string) => void) | null) => void; onExit: () => void; onMark: (s: "kann" | "ueben") => void;
  typing: boolean; setTyping: (v: boolean) => void; onType: (list: string[]) => Promise<void>;
}) {
  const alg = useMemo(() => movesOf(algo), [algo]);
  const setup = useMemo(() => setupOf(algo), [algo]);
  const [hint, setHint] = useState(false);
  const [done, setDone] = useState(false);
  const [text, setText] = useState("");
  const [err, setErr] = useState("");

  const toCase = useCallback(() => { driver.cancel(); driver.setState(applyMoves(solvedCube(), setup)); setDone(false); }, [driver, setup]);
  useEffect(() => {
    toCase();
    register((_m) => { if (isSolved(driver.getState())) { setDone(true); onMark("kann"); } });
    return () => { register(null); driver.cancel(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const submit = () => { try { const l = parseMoves(text); setText(""); void onType(l); } catch (x) { setErr((x as Error).message); } };

  return (
    <div className="cz-learn">
      <Bar title="Üben" onBack={onExit} label="Anleitung" />
      <div className="cz-learn-name">{algo.name}</div>
      {done ? (
        <div className="cz-done">
          <b>Geschafft.</b><span>Der Fall ist gelöst und als „kann ich“ gespeichert.</span>
          <div className="cz-ctrl">
            <button className="cz-btn" onClick={() => { onMark("ueben"); toCase(); }}>Noch üben</button>
            <button className="cz-btn" onClick={toCase}>Nochmal</button>
            <button className="cz-btn" onClick={onExit}>Fertig</button>
          </div>
        </div>
      ) : (
        <>
          <p className="cz-lead">Löse den Würfel mit dem Algorithmus. Ziehe an den Schichten oder gib die Züge ein.</p>
          <button className="cz-fold" onClick={() => setHint((h) => !h)} aria-expanded={hint}>Tipp zeigen<Icon name="chevron-down" size={12} className={hint ? "is-open" : ""} /></button>
          {hint && <Notation moves={alg} onTap={(m) => { if (!driver.busy()) void driver.preview(m); }} />}
          <div className="cz-ctrl">
            <button className="cz-btn" onClick={toCase}>Fall neu</button>
            <button className={`cz-btn${typing ? " is-on" : ""}`} onClick={() => setTyping(!typing)} aria-pressed={typing} aria-label="Züge eingeben"><Icon name="keyboard" size={18} />Eingabe</button>
          </div>
          {typing && (
            <div className="cz-type">
              <input value={text} placeholder="z. B. R U R' U'" autoCapitalize="characters" autoCorrect="off" spellCheck={false} aria-label="Züge in Notation"
                onChange={(e) => { setText(e.target.value); setErr(""); }} onKeyDown={(e) => { if (e.key === "Enter") submit(); }} />
              <button className="cz-go" disabled={!text.trim()} onClick={submit}>Los</button>
              {err && <div className="cz-err">{err}</div>}
            </div>
          )}
        </>
      )}
    </div>
  );
}
