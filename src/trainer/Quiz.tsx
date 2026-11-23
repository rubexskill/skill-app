import { useEffect, useState, type ReactNode } from "react";
import { Group, Segmented } from "../components/ui";
import { Icon } from "../components/Icon";
import { CAPITAL_AMBIGUOUS, COUNTRIES, flagOf, MORSE_ALL, MORSE_EASY, MORSE_LETTERS, MORSE_WORDS, MORSE_WORDS_EASY, type Country } from "./data";
import { DAY_NAMES, doomsdaySteps, weekdayOf } from "./doomsday";
import { KOCH_ORDER, KOCH_PASS, MORSE, groupCredit, kochGroups, loadPrefs, morseOf, savePrefs } from "./morse";
import { playMorseText, prepareAudio, releaseAudio } from "./audio";
import { AudioCheck, de1, pick, r, round1, Round, Setup, shuffle, useAudioState, type HowTo, type RoundStat, type TrainerProps, type TrainerResult } from "./shared";

const timeRecord = (s: RoundStat): TrainerResult["record"] =>
  s.right / s.total >= 0.8 ? { value: round1(s.totalMs / 1000 / s.total), label: "Zeit pro Aufgabe", unit: "s", higher: false } : undefined;

const timeNote = (s: RoundStat) => (s.right / s.total >= 0.8 ? "Zeit pro Aufgabe wird als Rekord gespeichert." : "Ein Rekord wird ab 80 % richtig gespeichert.");

const row = (children: ReactNode) => <div className="row segmented-row">{children}</div>;

// ---------------- Kopfrechnen ----------------

interface MathTask { q: string; a: number; tip: string }

const MATH_LEVELS = [
  { value: "1", label: "Leicht" },
  { value: "2", label: "Mittel" },
  { value: "3", label: "Schwer" },
  { value: "4", label: "Sehr schwer" },
  { value: "5", label: "Tricks" },
];
const MATH_HINT: Record<string, string> = {
  "1": "Addieren und Subtrahieren bis 100",
  "2": "Zweistellig mal einstellig, Plus und Minus bis 1000",
  "3": "Zweistellig mal zweistellig",
  "4": "Dreistellig mal zweistellig",
  "5": "Aufgaben für Rechentricks: ×11, ×5, ×9, Quadrate auf 5, (c−d)(c+d)",
};

const MATH_HOW: HowTo = {
  points: [
    "Zerlegen statt auswendig: 47 × 6 = 40 × 6 + 7 × 6. Bei Plus und Minus erst die Zehner, dann die Einer.",
    "Die Stufen steigen von Zahlen bis 100 bis zu dreistellig mal zweistellig. Wechsle, wenn du 8 von 10 sicher schaffst.",
    "Stufe Tricks: ×11 (Quersumme in die Mitte), Quadrate auf 5 (n · (n+1), dann 25), (c−d)(c+d) = c² − d², ×5 = halbieren, mal 10, ×9 = mal 10 minus die Zahl.",
    "Nach einer falschen Antwort siehst du den Rechenweg.",
  ],
  sources: [
    { label: "Benjamin & Shermer: Secrets of Mental Math (2006)" },
    { label: "Trachtenberg: The Trachtenberg Speed System of Basic Mathematics (1960)" },
    { label: "Wikipedia: Mental calculation", url: "https://en.wikipedia.org/wiki/Mental_calculation" },
  ],
};

function addSub(a: number, b: number, sign: "+" | "−"): MathTask {
  const u = b % 10, B = b - u;
  const res = sign === "+" ? a + b : a - b;
  const mid = sign === "+" ? a + B : a - B;
  const tip = u === 0 ? `${a} ${sign} ${b} = ${res}` : `${a} ${sign} ${b} = ${a} ${sign} ${B} ${sign} ${u} = ${mid} ${sign} ${u} = ${res}`;
  return { q: `${a} ${sign} ${b}`, a: res, tip };
}

function mul(a: number, b: number): MathTask {
  if (b < 10) {
    const u = a % 10, t = a - u;
    return { q: `${a} × ${b}`, a: a * b, tip: `${a} × ${b} = ${t} × ${b} + ${u} × ${b} = ${t * b} + ${u * b} = ${a * b}` };
  }
  const u = b % 10, B = b - u;
  return { q: `${a} × ${b}`, a: a * b, tip: `${a} × ${b} = ${a} × ${B} + ${a} × ${u} = ${a * B} + ${a * u} = ${a * b}` };
}

function trickTask(): MathTask {
  const k = r(0, 4);
  if (k === 0) {
    const a = r(12, 98);
    const d1 = Math.floor(a / 10), d2 = a % 10, s = d1 + d2;
    return { q: `${a} × 11`, a: a * 11, tip: `Ziffern ${d1} und ${d2} nach außen, ihre Summe ${s} in die Mitte${s >= 10 ? " (der Übertrag geht zur ersten Ziffer)" : ""}: ${a * 11}` };
  }
  if (k === 1) {
    const n = r(1, 9), m = 10 * n + 5;
    return { q: `${m}²`, a: m * m, tip: `${m}² = ${n} × ${n + 1} und dahinter 25: ${n * (n + 1)}|25 = ${m * m}` };
  }
  if (k === 2) {
    const c = 10 * r(2, 9), d = r(1, 5);
    return { q: `${c - d} × ${c + d}`, a: c * c - d * d, tip: `${c - d} × ${c + d} = ${c}² − ${d}² = ${c * c} − ${d * d} = ${c * c - d * d}` };
  }
  if (k === 3) {
    const a = 2 * r(6, 49);
    return { q: `${a} × 5`, a: a * 5, tip: `${a} × 5 = ${a} ÷ 2 × 10 = ${a / 2} × 10 = ${a * 5}` };
  }
  const a = r(12, 99);
  return { q: `${a} × 9`, a: a * 9, tip: `${a} × 9 = ${a} × 10 − ${a} = ${a * 10} − ${a} = ${a * 9}` };
}

function mathTask(level: number): MathTask {
  if (level === 1) {
    if (Math.random() < 0.5) return addSub(r(10, 99), r(10, 99), "+");
    const a = r(20, 99);
    return addSub(a, r(10, a), "−");
  }
  if (level === 2) {
    const k = r(0, 2);
    if (k === 0) return mul(r(11, 99), r(2, 9));
    if (k === 1) return addSub(r(100, 999), r(100, 999), "+");
    return addSub(r(300, 999), r(100, 299), "−");
  }
  if (level === 3) return mul(r(11, 99), r(11, 99));
  if (level === 4) return mul(r(101, 999), r(11, 99));
  return trickTask();
}

export function MathTrainer({ skill, onFinish }: TrainerProps) {
  const hard = skill.title.includes("Große") || skill.title.startsWith("Trachtenberg");
  const [level, setLevel] = useState(hard ? "3" : "1");
  const [tasks, setTasks] = useState<MathTask[] | null>(null);

  if (!tasks) {
    return (
      <Setup title="Kopfrechnen" lead="10 Aufgaben, so schnell und genau du kannst." how={MATH_HOW}
        onStart={() => setTasks(Array.from({ length: 10 }, () => mathTask(Number(level))))}>
        <Group header="Schwierigkeit" footer={MATH_HINT[level]}>{row(<Segmented options={MATH_LEVELS} value={level} onChange={setLevel} />)}</Group>
      </Setup>
    );
  }
  return (
    <Round tasks={tasks} prompt={(t) => <div className="tr-q">{t.q}</div>} input={{ kind: "number" }}
      isRight={(t, a) => Number(a) === t.a} correct={(t) => String(t.a)} explain={(t) => t.tip} note={timeNote}
      onRestart={() => setTasks(null)}
      onFinish={(s) => onFinish({ elapsedMs: s.totalMs, headline: `${s.right} von ${s.total} richtig`, record: timeRecord(s) })} />
  );
}

// ---------------- Wochentag ----------------

const DAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
const WD_LEVELS = [
  { value: "1", label: "Dieses Jahr" },
  { value: "2", label: "1950–2049" },
  { value: "3", label: "1800–2199" },
];

const WEEKDAY_HOW: HowTo = {
  points: [
    "Doomsday-Methode von John Conway: In jedem Jahr fallen 4.4., 6.6., 8.8., 10.10. und 12.12. auf denselben Wochentag, ebenso 9.5./5.9. und 11.7./7.11. Dazu kommen der 14.3., der letzte Februartag (28./29.) und der 3. Januar (im Schaltjahr der 4.).",
    "Jahrhundert-Anker: 1800er Freitag, 1900er Mittwoch, 2000er Dienstag, 2100er Sonntag.",
    "Doomsday des Jahres: letzte zwei Ziffern ÷ 12 (ganzzahlig) + Rest + Rest ÷ 4 (ganzzahlig), zum Anker addieren, Wochentage mod 7.",
    "Dann vom Merktag des Monats bis zum gesuchten Tag zählen. Nach einer falschen Antwort zeigt die App den ganzen Rechenweg.",
  ],
  sources: [
    { label: "Wikipedia: Doomsday rule", url: "https://en.wikipedia.org/wiki/Doomsday_rule" },
    { label: "Scientific American: What Day Is Doomsday?", url: "https://www.scientificamerican.com/article/calendar-algorithm/" },
  ],
};

interface DateTask { q: string; a: string; y: number; m: number; d: number }

function dateTask(level: number): DateTask {
  const [y0, y1] = level === 1 ? [new Date().getFullYear(), new Date().getFullYear()] : level === 2 ? [1950, 2049] : [1800, 2199];
  const y = r(y0, y1);
  const m = r(0, 11);
  const d = r(1, new Date(Date.UTC(y, m + 1, 0)).getUTCDate());
  const wd = (weekdayOf(y, m, d) + 6) % 7;
  return { q: `${d}. ${MONTHS[m]} ${y}`, a: DAYS[wd], y, m, d };
}

export function WeekdayTrainer({ onFinish }: TrainerProps) {
  const [level, setLevel] = useState("2");
  const [tasks, setTasks] = useState<DateTask[] | null>(null);
  if (!tasks) {
    return (
      <Setup title="Wochentag berechnen" lead="Welcher Wochentag ist das? Rechne im Kopf mit der Doomsday-Methode." how={WEEKDAY_HOW}
        onStart={() => setTasks(Array.from({ length: 10 }, () => dateTask(Number(level))))}>
        <Group header="Zeitraum">{row(<Segmented options={WD_LEVELS} value={level} onChange={setLevel} />)}</Group>
      </Setup>
    );
  }
  return (
    <Round tasks={tasks} prompt={(t) => <div className="tr-q is-date">{t.q}</div>} input={{ kind: "choices", options: () => DAYS, columns: 4 }}
      isRight={(t, a) => a === t.a} correct={(t) => DAY_NAMES[(DAYS.indexOf(t.a) + 1) % 7]} note={timeNote}
      explain={(t) => <ol className="tr-steps">{doomsdaySteps(t.y, t.m, t.d).map((s) => <li key={s}>{s}</li>)}</ol>}
      onRestart={() => setTasks(null)}
      onFinish={(s) => onFinish({ elapsedMs: s.totalMs, headline: `${s.right} von ${s.total} richtig`, record: timeRecord(s) })} />
  );
}

// ---------------- Morsecode ----------------

interface MorseTask { sym: string; code: string; listen: boolean; charWpm: number; effWpm: number }

const dots = (code: string) => code.replace(/\./g, "·").replace(/-/g, "–");
const spell = (text: string) => text.split("").map((c) => `${c} ${dots(MORSE[c] ?? "")}`).join("   ");

const MORSE_HOW: HowTo = {
  points: [
    "Koch-Methode (Psychologe Ludwig Koch, 1930er): Du hörst die Zeichen von Anfang an schnell (hier 15 bis 25 Wörter pro Minute) und lernst zuerst nur zwei Zeichen. Ab 90 % richtig kommt das nächste dazu – in einer Reihenfolge, die der von LCWO nachempfunden ist (LCWO hat 40 Lektionen, hier 41 Zeichen; die Lektionsliste dort ist nur nach Anmeldung einsehbar, deshalb nicht Zeichen für Zeichen geprüft).",
    "Farnsworth-Abstände: Die Zeichen selbst klingen im vollen Tempo, die Pausen dazwischen sind länger. So erkennst du den Klang eines Zeichens, statt Punkte zu zählen. Mit wachsendem Können das Gesamttempo erhöhen.",
    "Lerne nach Klang („di-dah“), nicht nach dem Bild aus Punkten und Strichen. Gehört wird in Fünfergruppen, wie bei echten Funkprüfungen.",
    "Tempo: Ein Wort entspricht dem Wort PARIS (50 Einheiten). Ein Punkt dauert 1,2 Sekunden geteilt durch das Tempo in Wörtern pro Minute, ein Strich drei Punkte.",
    "Der Fortschritt (freigeschaltete Zeichen, Tempo) bleibt nur auf diesem Gerät gespeichert.",
  ],
  sources: [
    { label: "LCWO – Learn CW Online (Koch-Methode)", url: "https://lcwo.net/" },
    { label: "Wikipedia: Morse code (Timing, PARIS, Farnsworth)", url: "https://en.wikipedia.org/wiki/Morse_code" },
  ],
};

function MorsePrompt({ t }: { t: MorseTask }) {
  const state = useAudioState();
  const [help, setHelp] = useState(false);
  const play = () => { prepareAudio(); void playMorseText(t.sym, t.charWpm, t.effWpm); };
  useEffect(() => {
    if (t.listen) {
      const id = window.setTimeout(() => void playMorseText(t.sym, t.charWpm, t.effWpm), 250);
      return () => window.clearTimeout(id);
    }
  }, [t]);
  return t.listen ? (
    <div className="tr-morse-listen">
      <button className="tr-play" onClick={play} aria-label="Nochmal hören"><Icon name="play" size={30} /></button>
      <div className="tr-lead">Was hörst du?</div>
      {(state !== "running" || help) ? <AudioCheck always /> : <button className="tr-link" onClick={() => setHelp(true)}>Kein Ton?</button>}
    </div>
  ) : (
    <div className="tr-q is-morse">{dots(t.code)}</div>
  );
}

const WPM_CHARS = [15, 20, 25];
const WPM_EFF = [5, 8, 10, 15, 20, 25];

export function MorseTrainer({ onFinish }: TrainerProps) {
  const [prefs, setPrefs] = useState(loadPrefs);
  const [mode, setMode] = useState("koch");
  const [unit, setUnit] = useState("buchstaben");
  const [level, setLevel] = useState("1");
  const [tasks, setTasks] = useState<MorseTask[] | null>(null);
  const [passed, setPassed] = useState<string | null>(null);

  useEffect(() => () => releaseAudio(), []);

  const update = (p: Partial<typeof prefs>) => {
    const n = { ...prefs, ...p };
    if (n.effWpm > n.charWpm) n.effWpm = n.charWpm;
    setPrefs(n);
    savePrefs(n);
  };

  const listen = mode !== "sehen";
  const start = () => {
    if (listen) prepareAudio();
    setPassed(null);
    const base = { listen, charWpm: prefs.charWpm, effWpm: prefs.effWpm };
    if (mode === "koch") {
      setTasks(kochGroups(prefs.koch).map((g) => ({ ...base, sym: g, code: morseOf(g) })));
      return;
    }
    const pool = unit === "woerter"
      ? level === "1" ? MORSE_WORDS_EASY : [...MORSE_WORDS_EASY, ...MORSE_WORDS]
      : level === "1" ? MORSE_EASY : level === "2" ? MORSE_LETTERS : MORSE_ALL;
    const syms = shuffle(pool).slice(0, 10);
    while (syms.length < 10) syms.push(pick(pool));
    setTasks(syms.map((sym) => ({ ...base, sym, code: unit === "woerter" ? morseOf(sym) : MORSE[sym] })));
  };

  const newest = KOCH_ORDER[prefs.koch - 1];
  const effChoices = WPM_EFF.filter((w) => w <= prefs.charWpm);

  if (!tasks) {
    return (
      <Setup title="Morsecode" lead="Lerne Morsezeichen nach Klang – Schritt für Schritt oder frei." onStart={start} how={MORSE_HOW}>
        <Group header="Art">{row(<Segmented options={[{ value: "koch", label: "Koch-Kurs" }, { value: "hoeren", label: "Hören" }, { value: "sehen", label: "Sehen" }]} value={mode} onChange={setMode} />)}</Group>

        {mode === "koch" && (
          <Group header="Freigeschaltete Zeichen" footer="Ab 90 % richtig wird das nächste Zeichen freigeschaltet. Du kannst die Stufe auch selbst ändern.">
            <div className="row tr-koch">
              <div className="tr-chips">
                {KOCH_ORDER.slice(0, prefs.koch).map((c, i) => <span key={c} className={`tr-chip${i === prefs.koch - 1 ? " is-new" : ""}`}>{c}</span>)}
              </div>
            </div>
            <div className="row tr-koch-new">
              <div className="row-main">
                <div className="row-title">Neuestes Zeichen: {newest} <span className="tr-code">{dots(MORSE[newest])}</span></div>
                <div className="row-sub">{prefs.koch} von {KOCH_ORDER.length} Zeichen</div>
              </div>
              <button className="btn btn-secondary btn-small" onClick={() => { prepareAudio(); void playMorseText(newest, prefs.charWpm, prefs.effWpm); }}>Anhören</button>
            </div>
            <div className="row tr-stepper">
              <div className="row-main"><div className="row-title">Stufe</div></div>
              <button className="btn btn-secondary btn-small" disabled={prefs.koch <= 2} onClick={() => update({ koch: prefs.koch - 1 })} aria-label="Ein Zeichen weniger">−</button>
              <span className="tr-step-val">{prefs.koch}</span>
              <button className="btn btn-secondary btn-small" disabled={prefs.koch >= KOCH_ORDER.length} onClick={() => update({ koch: prefs.koch + 1 })} aria-label="Ein Zeichen mehr">+</button>
            </div>
          </Group>
        )}

        {mode !== "koch" && (
          <>
            <Group header="Einheit">{row(<Segmented options={[{ value: "buchstaben", label: "Buchstaben" }, { value: "woerter", label: "Wörter" }]} value={unit} onChange={setUnit} />)}</Group>
            <Group header="Schwierigkeit" footer={unit === "buchstaben" ? (level === "1" ? "Nur E, T, A, N, I, M" : level === "2" ? "Alle Buchstaben" : "Buchstaben und Ziffern") : level === "1" ? "Kurze Wörter" : "Auch längere Wörter"}>
              {row(<Segmented options={unit === "buchstaben" ? [{ value: "1", label: "Leicht" }, { value: "2", label: "Mittel" }, { value: "3", label: "Schwer" }] : [{ value: "1", label: "Leicht" }, { value: "2", label: "Schwer" }]} value={level === "3" && unit === "woerter" ? "2" : level} onChange={setLevel} />)}
            </Group>
          </>
        )}

        {listen && (
          <>
            <Group header="Zeichentempo (Wörter pro Minute)" footer="So schnell klingt jedes einzelne Zeichen.">
              {row(<Segmented options={WPM_CHARS.map((w) => ({ value: String(w), label: String(w) }))} value={String(prefs.charWpm)} onChange={(v) => update({ charWpm: Number(v) })} />)}
            </Group>
            <Group header="Gesamttempo mit Abständen" footer={prefs.effWpm >= prefs.charWpm ? "Keine Zusatzpausen." : `Zeichen in ${prefs.charWpm}, Pausen so lang, dass es insgesamt ${prefs.effWpm} Wörter pro Minute sind (Farnsworth).`}>
              {row(<Segmented options={effChoices.map((w) => ({ value: String(w), label: String(w) }))} value={String(Math.min(prefs.effWpm, prefs.charWpm))} onChange={(v) => update({ effWpm: Number(v) })} />)}
            </Group>
            <Group header="Ton prüfen"><div className="row"><AudioCheck /></div></Group>
          </>
        )}
      </Setup>
    );
  }

  const koch = mode === "koch";
  const chars = tasks.reduce((a, t) => a + t.sym.length, 0);
  return (
    <Round tasks={tasks} prompt={(t) => <MorsePrompt t={t} />}
      input={{ kind: "text", placeholder: koch ? "Gruppe eintippen" : "Buchstabe oder Wort" }}
      isRight={(t, a) => a.replace(/\s+/g, "").toUpperCase() === t.sym}
      credit={koch ? (t, a) => groupCredit(t.sym, a) : undefined}
      correct={(t) => t.sym}
      explain={listen ? (t) => <span className="tr-spell">{spell(t.sym)}</span> : undefined}
      onComplete={koch ? (s) => {
        if (s.credit / s.total >= KOCH_PASS && prefs.koch < KOCH_ORDER.length) {
          update({ koch: prefs.koch + 1 });
          setPassed(KOCH_ORDER[prefs.koch]);
        }
      } : undefined}
      note={(s) => {
        if (!koch) return s.right / s.total >= 0.8 ? "Trefferquote wird als Rekord gespeichert." : "Ein Rekord wird ab 80 % richtig gespeichert.";
        const pct = Math.round((100 * s.credit) / s.total);
        if (pct >= 90) return prefs.koch >= KOCH_ORDER.length || !passed ? `${pct} % der Zeichen richtig – du kennst alle Zeichen dieses Kurses.` : `${pct} % der Zeichen richtig. Neu freigeschaltet: ${passed} ${dots(MORSE[passed])}`;
        return `${pct} % der Zeichen richtig. Ab 90 % kommt das nächste Zeichen dazu – noch eine Runde mit denselben Zeichen.`;
      }}
      onRestart={() => setTasks(null)}
      onFinish={(s) => onFinish({
        elapsedMs: s.totalMs,
        headline: koch ? `Koch-Kurs: ${Math.round((100 * s.credit) / s.total)} % der ${chars} Zeichen richtig` : `${s.right} von ${s.total} richtig`,
        record: koch ? undefined : { value: Math.round((100 * s.right) / s.total), label: "Trefferquote", unit: "%", higher: true },
      })} />
  );
}

// ---------------- Flaggen & Geografie ----------------

interface GeoTask { kind: "flag" | "capital"; country: Country; options: string[]; answer: string }

const GEO_HOW: HowTo = {
  points: [
    "10 Zufallsfragen mit vier Antworten. Falsche Antworten stammen meist aus derselben Weltregion, damit Raten nicht reicht.",
    "Länder mit mehreren oder umstrittenen Hauptstädten (Bolivien, Südafrika, Israel, Elfenbeinküste) werden bei Hauptstadt-Fragen nicht abgefragt.",
    "Nach der Runde kannst du alle Fehler direkt noch einmal üben. Das Quiz-Ergebnis in Prozent zählt als Rekord.",
    "Auf Windows zeigen Flaggen-Emojis nur Buchstaben, auf iPhone und iPad echte Flaggen.",
  ],
  sources: [
    { label: "Vereinte Nationen: Mitgliedstaaten", url: "https://www.un.org/en/about-us/member-states" },
    { label: "Auswärtiges Amt: Länderinformationen", url: "https://www.auswaertiges-amt.de/de/aussenpolitik/laender" },
  ],
};

export function GeoTrainer({ onFinish }: TrainerProps) {
  const [art, setArt] = useState("gemischt");
  const [region, setRegion] = useState("welt");
  const [tasks, setTasks] = useState<GeoTask[] | null>(null);

  const start = () => {
    const pool = region === "europa" ? COUNTRIES.filter((c) => c.region === "Europa") : COUNTRIES;
    const chosen = shuffle(pool).slice(0, 10);
    setTasks(chosen.map((country, i) => {
      let kind: GeoTask["kind"] = art === "flaggen" ? "flag" : art === "hauptstaedte" ? "capital" : i % 2 === 0 ? "flag" : "capital";
      if (kind === "capital" && CAPITAL_AMBIGUOUS.has(country.iso)) kind = "flag";
      const near = shuffle(pool.filter((c) => c.iso !== country.iso && (c.region === country.region || Math.random() < 0.3))).slice(0, 3);
      const others = near.length < 3 ? shuffle(COUNTRIES.filter((c) => c.iso !== country.iso && !near.includes(c))).slice(0, 3 - near.length) : [];
      const all = shuffle([country, ...near, ...others]);
      return { kind, country, options: all.map((c) => (kind === "flag" ? c.name : c.capital)), answer: kind === "flag" ? country.name : country.capital };
    }));
  };

  if (!tasks) {
    return (
      <Setup title="Flaggen & Geografie" lead="10 Fragen mit vier Antworten." onStart={start} how={GEO_HOW}>
        <Group header="Fragen">{row(<Segmented options={[{ value: "flaggen", label: "Flaggen" }, { value: "hauptstaedte", label: "Hauptstädte" }, { value: "gemischt", label: "Gemischt" }]} value={art} onChange={setArt} />)}</Group>
        <Group header="Gebiet">{row(<Segmented options={[{ value: "europa", label: "Europa" }, { value: "welt", label: "Welt" }]} value={region} onChange={setRegion} />)}</Group>
      </Setup>
    );
  }
  return (
    <Round tasks={tasks}
      prompt={(t) => t.kind === "flag"
        ? <div className="tr-flag"><span aria-hidden="true">{flagOf(t.country.iso)}</span><div className="tr-lead">Welches Land?</div></div>
        : <div className="tr-q is-text"><small>Hauptstadt von</small>{t.country.name}</div>}
      input={{ kind: "choices", options: (t) => t.options, columns: 1 }}
      isRight={(t, a) => a === t.answer} correct={(t) => t.answer}
      note={(s) => `Quiz-Ergebnis: ${Math.round((100 * s.right) / s.total)} % – wird als Rekord gespeichert.`}
      onRestart={() => setTasks(null)}
      onFinish={(s) => onFinish({
        elapsedMs: s.totalMs,
        headline: `${s.right} von ${s.total} richtig (Ø ${de1(s.totalMs / 1000 / s.total)} s)`,
        record: { value: Math.round((100 * s.right) / s.total), label: "Quiz-Ergebnis", unit: "%", higher: true },
      })} />
  );
}
