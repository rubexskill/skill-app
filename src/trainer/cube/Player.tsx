// Wiedergabeleiste unter dem Würfel: Lösung oder Algorithmus Zug für Zug ansehen (Weiter, Zurück, Abspielen, Tempo, Springen).
import { useEffect, useRef, useState, type MutableRefObject } from "react";
import { Icon } from "../../components/Icon";
import { invertMove, isSolved, sameCube, type Cube } from "./engine";
import { arrowOf, isPhaseBoundary, phaseIndexAt, solutionSession, type Session } from "./session";

export interface PlayerDriver {
  getState(): Cube;
  setState(c: Cube): void;
  applyMoves(list: string[], opts?: { ms?: number; onMove?: (i: number) => void; highlight?: boolean }): Promise<boolean>;
}

const SPEEDS = [0.5, 1, 2, 4];
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Drehrichtung als kleiner Pfeil (im Uhrzeigersinn oder dagegen) */
export function TurnArrow({ dir }: { dir: 1 | -1 }) {
  return (
    <svg className="cz-turn" width="30" height="30" viewBox="0 0 30 30" aria-hidden="true" style={dir === 1 ? { transform: "scaleX(-1)" } : undefined}>
      <path d="M7 15a8 8 0 1 1 3 6.2" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M5.6 9.6L6.8 16l5.6-3" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Player({ session, driver, onExit, onReplace, registerUser, reason }: {
  session: Session;
  driver: PlayerDriver;
  /** Beenden; restore = Würfel vor dem Start wiederherstellen (nur bei Algorithmen) */
  onExit: (message?: string) => void;
  onReplace: (s: Session) => void;
  registerUser: MutableRefObject<((move: string) => void) | null>;
  reason?: string;
}) {
  const n = session.moves.length;
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [open, setOpen] = useState(false);
  const idxRef = useRef(0), targetRef = useRef(0), genRef = useRef(0), playRef = useRef(false), speedRef = useRef(1), aliveRef = useRef(true);
  const drainRef = useRef<Promise<void> | null>(null);
  speedRef.current = speed;

  const publish = (i: number) => { idxRef.current = i; setIdx(i); };

  /** Bringt den Würfel Zug für Zug nach targetRef. Mehrfaches Tippen erhöht nur das Ziel; es läuft immer nur ein Zug. */
  const drain = (): Promise<void> => {
    if (drainRef.current) return drainRef.current;
    const gen = genRef.current;
    const p = (async () => {
      while (aliveRef.current && gen === genRef.current && idxRef.current !== targetRef.current) {
        const i = idxRef.current;
        const forward = targetRef.current > i;
        const move = forward ? session.moves[i] : invertMove(session.moves[i - 1]);
        const rush = Math.abs(targetRef.current - i) > 1;
        const ok = await driver.applyMoves([move], { ms: (rush ? 150 : 360) / speedRef.current, highlight: true });
        if (!ok || !aliveRef.current || gen !== genRef.current) break;
        publish(forward ? i + 1 : i - 1);
      }
    })().finally(() => {
      drainRef.current = null;
      if (aliveRef.current && idxRef.current !== targetRef.current && gen !== genRef.current) void drain();
    });
    drainRef.current = p;
    return p;
  };

  const pause = () => { playRef.current = false; setPlaying(false); };
  const go = (delta: number) => {
    pause();
    targetRef.current = Math.max(0, Math.min(n, targetRef.current + delta));
    void drain();
  };
  const jump = (k: number) => {
    pause();
    genRef.current++;
    const to = Math.max(0, Math.min(n, k));
    targetRef.current = to;
    publish(to);
    driver.setState(session.states[to]);
  };
  const play = async () => {
    if (playRef.current) return;
    if (idxRef.current >= n) jump(0);
    playRef.current = true; setPlaying(true);
    while (playRef.current && aliveRef.current && idxRef.current < n) {
      targetRef.current = idxRef.current + 1;
      await drain();
      if (!playRef.current || !aliveRef.current) break;
      await sleep((isPhaseBoundary(session, idxRef.current) ? 900 : 140) / speedRef.current);
    }
    if (aliveRef.current && playRef.current) { playRef.current = false; setPlaying(false); }
  };

  useEffect(() => {
    aliveRef.current = true;
    driver.setState(session.states[0]);
    // eigener Zug während der Wiedergabe
    registerUser.current = (move: string) => {
      pause();
      const cur = driver.getState();
      if (isSolved(cur)) { onExit("Gelöst."); return; }
      const i = idxRef.current;
      if (i < n && i === targetRef.current && session.moves[i] === move && sameCube(cur, session.states[i + 1])) { publish(i + 1); targetRef.current = i + 1; return; }
      if (session.kind === "algo") { onExit(); return; }
      const r = solutionSession(cur);
      if (!r.ok) { onExit(r.reason); return; }
      onReplace(r.session);
    };
    return () => { aliveRef.current = false; playRef.current = false; genRef.current++; registerUser.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const k = session.phases.length ? phaseIndexAt(session, idx) : -1;
  const phase = k >= 0 ? session.phases[k] : null;
  const next = idx < n ? arrowOf(session.moves[idx]) : null;
  const finished = idx >= n;

  return (
    <div className="cz-player" role="group" aria-label="Wiedergabe">
      <div className="cz-pl-head">
        <div className="cz-pl-phase">{finished ? "Gelöst" : phase ? `Schritt ${phase.no} · ${phase.title}` : session.title}</div>
        <button className="cz-pl-x" aria-label="Wiedergabe beenden" onClick={() => onExit()}><Icon name="close" size={20} /></button>
      </div>
      {reason && <div className="cz-pl-reason">{reason}</div>}
      <div className="cz-pl-count">{n === 0 ? "Der Würfel ist schon gelöst." : finished ? `${n} von ${n} Zügen` : `Zug ${idx + 1} von ${n}`}</div>
      <div className="cz-pl-now" aria-live="polite">
        {next ? (
          <>
            <span className="cz-pl-move" data-move={session.moves[idx]}>{session.moves[idx]}</span>
            <TurnArrow dir={next.dir} />
            <span className="cz-pl-next">{session.moves.slice(idx + 1, idx + 4).join(" ")}</span>
          </>
        ) : <Icon name="check" size={30} />}
      </div>
      <div className="cz-pl-bar">
        <button className="cz-pl-b" aria-label="Zum Anfang" onClick={() => jump(0)} disabled={idx === 0 && targetRef.current === 0}><Icon name="skip-start" size={22} /></button>
        <button className="cz-pl-b" aria-label="Ein Zug zurück" onClick={() => go(-1)} disabled={targetRef.current <= 0}><Icon name="step-back" size={22} /></button>
        <button className="cz-pl-b" aria-label="Ein Zug weiter" onClick={() => go(1)} disabled={targetRef.current >= n}><Icon name="step-forward" size={22} /></button>
        <button className={`cz-pl-b is-main${playing ? " is-on" : ""}`} aria-label={playing ? "Pause" : "Abspielen"} onClick={() => (playing ? pause() : void play())} disabled={n === 0}><Icon name={playing ? "pause" : "play"} size={22} /></button>
        <button className="cz-pl-b" aria-label="Zum Ende" onClick={() => jump(n)} disabled={targetRef.current >= n && idx >= n}><Icon name="skip-end" size={22} /></button>
        <button className="cz-pl-speed" aria-label={`Tempo ${speed}-fach`} onClick={() => setSpeed(SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length])}>{String(speed).replace(".", ",")}×</button>
      </div>
      {session.phases.length > 0 && (
        <>
          <button className="cz-fold" onClick={() => setOpen((o) => !o)} aria-expanded={open}>Phasen<Icon name="chevron-down" size={12} className={open ? "is-open" : ""} /></button>
          {open && (
            <div className="cz-pl-phases">
              {session.phases.map((p, i) => (
                <button key={p.id} className={`cz-pl-ph${i === k && !finished ? " is-now" : ""}`} onClick={() => jump(p.from)}>
                  <span>{p.no}</span>{p.title}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
