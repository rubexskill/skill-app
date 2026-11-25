// Flaggen-Trainer: Start (großer „Üben“-Knopf), Frage-Ansicht, Ergebnis, Fortschritt, Einstellungen.
import { useEffect, useMemo, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Group, Row, Segmented, Switch, useUI } from "../../components/ui";
import { Icon } from "../../components/Icon";
import { CatBadge } from "../../screens/parts";
import type { TrainerProps } from "../shared";
import { BY_ISO, CONTINENTS, flagUrl, type Continent } from "./data";
import {
  answerRun, bandOf, currentIso, isFinished, makeQuestion, poolFor, progressOf, resolveDir, retryRun, startRun, summaryOf, universeFor,
  type Amount, type Direction, type Prefs, type Question, type Run, type Scope,
} from "./logic";
import { addPracticeTime, clearRun, loadPrefs, loadRun, loadStats, recordAnswer, resetStats, saveRun, savePrefs } from "./store";

type View = "home" | "quiz" | "result" | "progress" | "settings";

const AMOUNT_LABEL: Record<string, string> = { "10": "10 Fragen", "25": "25 Fragen", "50": "50 Fragen", all: "Alle Länder", endless: "Endlos" };
const DIR_LABEL: Record<Direction, string> = { flag: "Flagge → Land", country: "Land → Flagge", mixed: "Gemischt" };
const preload = (iso: string) => { const i = new Image(); i.decoding = "async"; i.src = flagUrl(iso); };

/** Feine Flagge im 4:3-Rahmen: abgerundet, mit dünnem Rand (weiße Flaggen bleiben sichtbar). */
export function FlagImg({ iso, className = "" }: { iso: string; className?: string }) {
  return <img className={`fl-img ${className}`} src={flagUrl(iso)} alt="" width={640} height={480} draggable={false} decoding="async" />;
}

export function FlagsTrainer({ skill }: TrainerProps) {
  const { actionSheet, toast } = useUI();
  const stats = useLiveQuery(() => loadStats(), []);
  const statsMap = useMemo(() => stats ?? new Map(), [stats]);
  const [prefs, setPrefsState] = useState<Prefs>(() => loadPrefs());
  const [view, setView] = useState<View>("home");
  const [run, setRun] = useState<Run | null>(null);
  const [saved, setSaved] = useState<Run | null>(() => loadRun());
  const [finished, setFinished] = useState<Run | null>(null);

  const setPrefs = (p: Prefs) => { setPrefsState(p); savePrefs(p); };
  const pool = poolFor(prefs, statsMap);
  const universe = universeFor(prefs);
  const sure = universe.filter((f) => (statsMap.get(f.iso)?.level ?? 0) >= 3).length;

  const begin = (p: Prefs, from?: Run | null) => {
    const r = from ?? startRun(p, statsMap, Math.random, Date.now());
    if (!r) { toast("Dafür gibt es noch keine Flaggen. Übe erst mit „Alle Länder“."); return; }
    clearRun();
    saveRun(r);
    setSaved(null);
    setRun(r);
    setView("quiz");
  };

  const pickAmount = () =>
    actionSheet({
      title: "Umfang",
      choices: (["10", "25", "50", "all", "endless"] as const).map((k) => ({ label: AMOUNT_LABEL[k], checked: String(prefs.amount) === k, onSelect: () => setPrefs({ ...prefs, amount: (k === "all" || k === "endless" ? k : Number(k)) as Amount }) })),
    });

  const count = (scope: Scope) => poolFor({ ...prefs, scope }, statsMap).length;
  const pickScope = () =>
    actionSheet({
      title: "Bereich",
      choices: [
        { label: "Alle Länder", checked: prefs.scope === "all", onSelect: () => setPrefs({ ...prefs, scope: "all" }) },
        { label: prefs.scope === "continent" ? `Nach Kontinent: ${prefs.continent}` : "Nach Kontinent …", checked: prefs.scope === "continent", onSelect: pickContinent },
        { label: `Schwierige (${count("difficult")})`, checked: prefs.scope === "difficult", onSelect: () => setPrefs({ ...prefs, scope: "difficult" }) },
        { label: `Neue (${count("new")})`, checked: prefs.scope === "new", onSelect: () => setPrefs({ ...prefs, scope: "new" }) },
        { label: `Ähnliche (${count("similar")})`, checked: prefs.scope === "similar", onSelect: () => setPrefs({ ...prefs, scope: "similar" }) },
      ],
    });
  function pickContinent() {
    actionSheet({ title: "Kontinent", choices: CONTINENTS.map((c) => ({ label: c, checked: prefs.scope === "continent" && prefs.continent === c, onSelect: () => setPrefs({ ...prefs, scope: "continent", continent: c as Continent }) })) });
  }
  const scopeLabel = prefs.scope === "all" ? "Alle Länder" : prefs.scope === "continent" ? prefs.continent : prefs.scope === "difficult" ? "Schwierige" : prefs.scope === "new" ? "Neue" : "Ähnliche";

  if (view === "quiz" && run) {
    return (
      <FlagQuiz key={run.startedAt} run0={run} skillId={skill.id} stats={statsMap}
        onExit={(r, done) => { setSaved(done ? null : r); setRun(null); if (done) { setFinished(r); setView("result"); } else setView("home"); }} />
    );
  }

  if (view === "result" && finished) {
    const s = summaryOf(finished);
    return (
      <div className="fl">
        <div className="fl-result">
          <div className="fl-score">{s.percent}<small> %</small></div>
          <div className="fl-score-sub">{s.right} von {s.total} richtig</div>
        </div>
        {s.wrong.length > 0 && (
          <>
            <h3 className="fl-sub">Das war noch nicht sicher</h3>
            <ul className="fl-miss">
              {s.wrong.map((iso) => (
                <li key={iso}><FlagImg iso={iso} className="is-s" /><span className="fl-miss-name">{BY_ISO.get(iso)!.name}<small>{BY_ISO.get(iso)!.capital}</small></span></li>
              ))}
            </ul>
          </>
        )}
        <div className="fl-actions">
          {s.wrong.length > 0 && <button className="btn btn-primary fl-big" onClick={() => begin(finished.prefs, retryRun(finished.prefs, s.wrong, Math.random, Date.now()))}>Fehler wiederholen</button>}
          <button className={`btn ${s.wrong.length ? "btn-secondary" : "btn-primary"} fl-big`} onClick={() => { setFinished(null); setView("home"); }}>Fertig</button>
        </div>
      </div>
    );
  }

  if (view === "progress") return <FlagProgress stats={statsMap} prefs={prefs} onBack={() => setView("home")} />;

  if (view === "settings") {
    return (
      <div className="fl">
        <Bar title="Einstellungen" onBack={() => setView("home")} />
        <Group header="Fragen">
          <div className="row segmented-row"><Segmented options={(["flag", "country", "mixed"] as Direction[]).map((d) => ({ value: d, label: DIR_LABEL[d] }))} value={prefs.direction} onChange={(d: Direction) => setPrefs({ ...prefs, direction: d })} /></div>
        </Group>
        <Group footer="Taiwan, Kosovo, Grönland, Hongkong und weitere. Sie zählen nicht zu den 195 anerkannten Staaten.">
          <Row title="Bekannte Gebiete dazu" trailing={<Switch checked={prefs.territories} onChange={(v) => setPrefs({ ...prefs, territories: v })} label="Bekannte Gebiete dazu" />} />
        </Group>
        <Group footer="Setzt alle Lernstufen auf neu. Backup und Abgleich bleiben unberührt, bis du sie wieder einspielst.">
          <Row title="Lernstand zurücksetzen" tone="danger" center onClick={() => actionSheet({ title: "Lernstand zurücksetzen?", choices: [{ label: "Zurücksetzen", destructive: true, onSelect: () => void resetStats().then(() => toast("Lernstand zurückgesetzt")) }] })} />
        </Group>
      </div>
    );
  }

  return (
    <div className="fl">
      <div className="fl-head">
        <div>
          <CatBadge name={skill.kategorie} />
          <h2 className="fl-title">Flaggen</h2>
          <div className="fl-sure">{sure} von {universe.length} sicher</div>
        </div>
        <div className="fl-icons">
          <button className="fl-icon" aria-label="Fortschritt" onClick={() => setView("progress")}><Icon name="apps" size={22} /></button>
          <button className="fl-icon" aria-label="Einstellungen" onClick={() => setView("settings")}><Icon name="sliders" size={22} /></button>
        </div>
      </div>
      <button className="btn btn-primary fl-go" onClick={() => begin(prefs)} disabled={!stats}>Üben</button>
      <div className="fl-pick">
        <button className="fl-chip" onClick={pickAmount}>{AMOUNT_LABEL[String(prefs.amount)]}<Icon name="chevron-down" size={12} /></button>
        <button className="fl-chip" onClick={pickScope}>{scopeLabel}{prefs.scope !== "all" && prefs.scope !== "continent" ? ` · ${pool.length}` : ""}<Icon name="chevron-down" size={12} /></button>
      </div>
      {saved && (
        <button className="fl-resume" onClick={() => begin(saved.prefs, saved)}>
          <span>Fortsetzen</span><small>{saved.endless ? `${saved.done} beantwortet` : `${saved.done} von ${saved.done + saved.queue.length}`}</small>
        </button>
      )}
    </div>
  );
}

function Bar({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="fl-bar-top">
      <button className="fl-back" onClick={onBack}><Icon name="chevron-left" size={20} />Zurück</button>
      <span className="fl-bar-title">{title}</span>
      <span className="fl-back-spacer" />
    </div>
  );
}

// ---------------- Fortschritt ----------------

function FlagProgress({ stats, prefs, onBack }: { stats: Map<string, import("./logic").Stat>; prefs: Prefs; onBack: () => void }) {
  const list = universeFor(prefs);
  const [sel, setSel] = useState<string | null>(null);
  const sure = list.filter((f) => bandOf(stats.get(f.iso)) === "sure").length;
  const learning = list.filter((f) => bandOf(stats.get(f.iso)) === "learning").length;
  const f = sel ? BY_ISO.get(sel) : null;
  return (
    <div className="fl">
      <Bar title="Fortschritt" onBack={onBack} />
      <div className="fl-sure is-big">{sure} von {list.length} sicher</div>
      <div className="fl-legend"><span className="is-sure">sicher {sure}</span><span className="is-learning">lernend {learning}</span><span className="is-new">neu {list.length - sure - learning}</span></div>
      <div className="fl-grid">
        {list.map((x) => (
          <button key={x.iso} className={`fl-cell is-${bandOf(stats.get(x.iso))}${sel === x.iso ? " is-on" : ""}`} aria-label={x.name} onClick={() => setSel(sel === x.iso ? null : x.iso)}>
            <img className="fl-img" src={flagUrl(x.iso)} alt="" width={640} height={480} loading="lazy" decoding="async" draggable={false} />
          </button>
        ))}
      </div>
      <div className="fl-info" aria-live="polite">
        {f ? <><FlagImg iso={f.iso} className="is-s" /><span className="fl-miss-name">{f.name}<small>{f.capital} · {f.continent}</small></span></> : <span className="fl-hint">Tippe eine Flagge an.</span>}
      </div>
    </div>
  );
}

// ---------------- Frage-Ansicht ----------------

function FlagQuiz({ run0, skillId, stats, onExit }: { run0: Run; skillId: string; stats: Map<string, import("./logic").Stat>; onExit: (run: Run, finished: boolean) => void }) {
  const universe = useMemo(() => universeFor(run0.prefs), [run0.prefs]);
  const makeQ = (r: Run, iso: string): Question => makeQuestion(iso, resolveDir(r.prefs.direction, Math.random), universe, Math.random);
  const [run, setRun] = useState(run0);
  const [q, setQ] = useState<Question>(() => makeQ(run0, currentIso(run0)!));
  const [picked, setPicked] = useState<string | null>(null);
  const runRef = useRef(run); runRef.current = run;
  const statsRef = useRef(stats); statsRef.current = stats;
  const shownAt = useRef(performance.now());
  const down = useRef<string | null>(null);
  const timer = useRef(0);
  const nextQ = useRef<Question | null>(null);
  const exited = useRef(false);

  const flush = (r: Run): Run => {
    const delta = r.activeMs - r.reported;
    if (delta > 0) void addPracticeTime(skillId, delta);
    return { ...r, reported: r.activeMs };
  };
  const leave = (r: Run, done: boolean) => {
    if (exited.current) return;
    exited.current = true;
    window.clearTimeout(timer.current);
    const out = flush(r);
    if (done) clearRun(); else saveRun(out);
    onExit(out, done);
  };
  // Sheet geschlossen, ohne X: Stand und Lernzeit trotzdem sichern
  useEffect(() => {
    exited.current = false; // (React-Entwicklungsmodus startet Effekte doppelt)
    return () => {
      window.clearTimeout(timer.current);
      if (exited.current) return;
      exited.current = true;
      saveRun(flush(runRef.current));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Flaggen der nächsten Frage vorladen
  useEffect(() => {
    if (q.dir === "country") q.options.forEach(preload); else preload(q.iso);
    const nextIso = run.queue[1];
    if (nextIso) {
      nextQ.current = makeQ(run, nextIso);
      if (nextQ.current.dir === "country") nextQ.current.options.forEach(preload); else preload(nextIso);
    } else nextQ.current = null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const advance = (next: Run) => {
    if (isFinished(next)) return leave(next, true);
    const iso = currentIso(next)!;
    setQ(nextQ.current && nextQ.current.iso === iso ? nextQ.current : makeQ(next, iso));
    nextQ.current = null;
    setPicked(null);
    shownAt.current = performance.now();
  };

  const choose = (iso: string) => {
    if (picked || performance.now() - shownAt.current < 300) return; // doppelte Taps und Geister-Klicks
    const correct = iso === q.iso;
    setPicked(iso);
    const elapsed = Math.min(60000, performance.now() - shownAt.current);
    void recordAnswer(q.iso, correct);
    const next = answerRun({ ...run, activeMs: run.activeMs + elapsed }, q.iso, correct, Math.random, statsRef.current);
    setRun(next);
    saveRun(next);
    if (correct) timer.current = window.setTimeout(() => advance(next), 700);
  };

  /** Nur ein echter Tap zählt: pointerdown und click auf demselben Feld. */
  const tap = (id: string, fn: () => void) => ({
    onPointerDown: () => { down.current = id; },
    onClick: (e: React.MouseEvent) => { const real = down.current === id || e.detail === 0; down.current = null; if (real) fn(); },
  });

  const country = BY_ISO.get(q.iso)!;
  const wrong = picked !== null && picked !== q.iso;
  const pct = Math.round(progressOf(run) * 100);
  const cls = (iso: string) => (picked ? (iso === q.iso ? " is-right" : iso === picked ? " is-wrong" : " is-dim") : "");

  return (
    <div className="fl fl-quiz">
      <div className="fl-top">
        <button className="fl-x" aria-label="Beenden" {...tap("x", () => leave(run, false))}><Icon name="close" size={20} /></button>
        {run.endless ? <span className="fl-endless">{run.done} beantwortet</span> : <div className="fl-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${pct}%` }} /></div>}
      </div>
      <div className="fl-stage">
        {q.dir === "flag" ? (
          <>
            <FlagImg iso={q.iso} className="is-l" />
            <div className="fl-ask">Welches Land?</div>
          </>
        ) : (
          <>
            <div className="fl-ask">Welche Flagge gehört zu</div>
            <div className="fl-name">{country.name}</div>
          </>
        )}
      </div>
      {q.dir === "flag" ? (
        <div className="fl-answers">
          {q.options.map((iso) => (
            <button key={iso} className={`fl-ans${cls(iso)}`} {...tap(iso, () => choose(iso))}>{BY_ISO.get(iso)!.name}</button>
          ))}
        </div>
      ) : (
        <div className="fl-answers is-flags">
          {q.options.map((iso) => (
            <button key={iso} className={`fl-ans fl-flagbtn${cls(iso)}`} aria-label={BY_ISO.get(iso)!.name} {...tap(iso, () => choose(iso))}><FlagImg iso={iso} /></button>
          ))}
        </div>
      )}
      <div className="fl-foot" aria-live="polite">
        {wrong && (
          <>
            <div className="fl-fact"><b>{country.name}</b><span>Hauptstadt: {country.capital}</span></div>
            <button className="btn btn-primary fl-next" {...tap("next", () => advance(run))}>Weiter</button>
          </>
        )}
      </div>
    </div>
  );
}
