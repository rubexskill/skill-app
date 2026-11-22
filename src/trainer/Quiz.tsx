import { useEffect, useState } from "react";
import { Group, Segmented } from "../components/ui";
import { Icon } from "../components/Icon";
import { COUNTRIES, flagOf, MORSE, MORSE_ALL, MORSE_EASY, MORSE_LETTERS, MORSE_WORDS, MORSE_WORDS_EASY, morseOf, type Country } from "./data";
import { de1, pick, playMorse, prepareAudio, r, round1, Round, Setup, shuffle, type RoundStat, type TrainerProps, type TrainerResult } from "./shared";

const timeRecord = (s: RoundStat): TrainerResult["record"] =>
  s.right / s.total >= 0.8 ? { value: round1(s.totalMs / 1000 / s.total), label: "Zeit pro Aufgabe", unit: "s", higher: false } : undefined;

const timeNote = (s: RoundStat) => (s.right / s.total >= 0.8 ? "Zeit pro Aufgabe wird als Rekord gespeichert." : "Ein Rekord wird ab 80 % richtig gespeichert.");

const row = (children: React.ReactNode) => <div className="row segmented-row">{children}</div>;

// ---------------- Kopfrechnen ----------------

interface MathTask { q: string; a: number }

const MATH_LEVELS = [
  { value: "1", label: "Leicht" },
  { value: "2", label: "Mittel" },
  { value: "3", label: "Schwer" },
  { value: "4", label: "Sehr schwer" },
];
const MATH_HINT: Record<string, string> = {
  "1": "Addieren und Subtrahieren bis 100",
  "2": "Zweistellig mal einstellig, Plus und Minus bis 1000",
  "3": "Zweistellig mal zweistellig",
  "4": "Dreistellig mal zweistellig",
};

function mathTask(level: number): MathTask {
  if (level === 1) {
    if (Math.random() < 0.5) { const a = r(10, 99), b = r(10, 99); return { q: `${a} + ${b}`, a: a + b }; }
    const a = r(20, 99), b = r(10, a); return { q: `${a} − ${b}`, a: a - b };
  }
  if (level === 2) {
    const k = r(0, 2);
    if (k === 0) { const a = r(11, 99), b = r(2, 9); return { q: `${a} × ${b}`, a: a * b }; }
    if (k === 1) { const a = r(100, 999), b = r(100, 999); return { q: `${a} + ${b}`, a: a + b }; }
    const a = r(300, 999), b = r(100, 299); return { q: `${a} − ${b}`, a: a - b };
  }
  if (level === 3) { const a = r(11, 99), b = r(11, 99); return { q: `${a} × ${b}`, a: a * b }; }
  const a = r(101, 999), b = r(11, 99);
  return { q: `${a} × ${b}`, a: a * b };
}

export function MathTrainer({ skill, onFinish }: TrainerProps) {
  const hard = skill.title.includes("Große") || skill.title.startsWith("Trachtenberg");
  const [level, setLevel] = useState(hard ? "3" : "1");
  const [tasks, setTasks] = useState<MathTask[] | null>(null);

  if (!tasks) {
    return (
      <Setup title="Kopfrechnen" lead="10 Aufgaben, so schnell und genau du kannst." onStart={() => setTasks(Array.from({ length: 10 }, () => mathTask(Number(level))))}>
        <Group header="Schwierigkeit" footer={MATH_HINT[level]}>{row(<Segmented options={MATH_LEVELS} value={level} onChange={setLevel} />)}</Group>
      </Setup>
    );
  }
  return (
    <Round tasks={tasks} prompt={(t) => <div className="tr-q">{t.q}</div>} input={{ kind: "number" }}
      isRight={(t, a) => Number(a) === t.a} correct={(t) => String(t.a)} note={timeNote}
      onRestart={() => setTasks(null)}
      onFinish={(s) => onFinish({ elapsedMs: s.totalMs, headline: `${s.right} von ${s.total} richtig`, record: timeRecord(s) })} />
  );
}

// ---------------- Wochentag ----------------

const DAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const DAYS_FULL: Record<string, string> = { Mo: "Montag", Di: "Dienstag", Mi: "Mittwoch", Do: "Donnerstag", Fr: "Freitag", Sa: "Samstag", So: "Sonntag" };
const MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
const WD_LEVELS = [
  { value: "1", label: "Dieses Jahr" },
  { value: "2", label: "1950–2049" },
  { value: "3", label: "1800–2199" },
];

interface DateTask { q: string; a: string }

function dateTask(level: number): DateTask {
  const [y0, y1] = level === 1 ? [new Date().getFullYear(), new Date().getFullYear()] : level === 2 ? [1950, 2049] : [1800, 2199];
  const y = r(y0, y1);
  const m = r(0, 11);
  const d = r(1, new Date(Date.UTC(y, m + 1, 0)).getUTCDate());
  const wd = (new Date(Date.UTC(y, m, d)).getUTCDay() + 6) % 7;
  return { q: `${d}. ${MONTHS[m]} ${y}`, a: DAYS[wd] };
}

export function WeekdayTrainer({ onFinish }: TrainerProps) {
  const [level, setLevel] = useState("2");
  const [tasks, setTasks] = useState<DateTask[] | null>(null);
  if (!tasks) {
    return (
      <Setup title="Wochentag berechnen" lead="Welcher Wochentag ist das? Rechne im Kopf, zum Beispiel mit der Doomsday-Methode." onStart={() => setTasks(Array.from({ length: 10 }, () => dateTask(Number(level))))}>
        <Group header="Zeitraum">{row(<Segmented options={WD_LEVELS} value={level} onChange={setLevel} />)}</Group>
      </Setup>
    );
  }
  return (
    <Round tasks={tasks} prompt={(t) => <div className="tr-q is-date">{t.q}</div>} input={{ kind: "choices", options: () => DAYS, columns: 4 }}
      isRight={(t, a) => a === t.a} correct={(t) => DAYS_FULL[t.a]} note={timeNote}
      onRestart={() => setTasks(null)}
      onFinish={(s) => onFinish({ elapsedMs: s.totalMs, headline: `${s.right} von ${s.total} richtig`, record: timeRecord(s) })} />
  );
}

// ---------------- Morsecode ----------------

interface MorseTask { sym: string; code: string; listen: boolean }

const dots = (code: string) => code.replace(/\./g, "·").replace(/-/g, "–");

function MorsePrompt({ t }: { t: MorseTask }) {
  useEffect(() => {
    if (t.listen) {
      const id = window.setTimeout(() => playMorse(t.code), 250);
      return () => window.clearTimeout(id);
    }
  }, [t]);
  return t.listen ? (
    <div className="tr-morse-listen">
      <button className="tr-play" onClick={() => playMorse(t.code)} aria-label="Nochmal hören"><Icon name="play" size={30} /></button>
      <div className="tr-lead">Was hörst du?</div>
    </div>
  ) : (
    <div className="tr-q is-morse">{dots(t.code)}</div>
  );
}

export function MorseTrainer({ onFinish }: TrainerProps) {
  const [mode, setMode] = useState("sehen");
  const [unit, setUnit] = useState("buchstaben");
  const [level, setLevel] = useState("1");
  const [tasks, setTasks] = useState<MorseTask[] | null>(null);

  const start = () => {
    prepareAudio();
    const pool = unit === "woerter"
      ? level === "1" ? MORSE_WORDS_EASY : [...MORSE_WORDS_EASY, ...MORSE_WORDS]
      : level === "1" ? MORSE_EASY : level === "2" ? MORSE_LETTERS : MORSE_ALL;
    const syms = shuffle(pool).slice(0, 10);
    while (syms.length < 10) syms.push(pick(pool));
    setTasks(syms.map((sym) => ({ sym, code: unit === "woerter" ? morseOf(sym) : MORSE[sym], listen: mode === "hoeren" })));
  };

  if (!tasks) {
    return (
      <Setup title="Morsecode" lead="Übersetze Zeichen und Wörter – lesend oder hörend." onStart={start}>
        <Group header="Art">{row(<Segmented options={[{ value: "sehen", label: "Sehen" }, { value: "hoeren", label: "Hören" }]} value={mode} onChange={setMode} />)}</Group>
        <Group header="Einheit">{row(<Segmented options={[{ value: "buchstaben", label: "Buchstaben" }, { value: "woerter", label: "Wörter" }]} value={unit} onChange={setUnit} />)}</Group>
        <Group header="Schwierigkeit" footer={unit === "buchstaben" ? (level === "1" ? "Nur E, T, A, N, I, M" : level === "2" ? "Alle Buchstaben" : "Buchstaben und Ziffern") : level === "1" ? "Kurze Wörter" : "Auch längere Wörter"}>
          {row(<Segmented options={unit === "buchstaben" ? [{ value: "1", label: "Leicht" }, { value: "2", label: "Mittel" }, { value: "3", label: "Schwer" }] : [{ value: "1", label: "Leicht" }, { value: "2", label: "Schwer" }]} value={level === "3" && unit === "woerter" ? "2" : level} onChange={setLevel} />)}
        </Group>
      </Setup>
    );
  }
  return (
    <Round tasks={tasks} prompt={(t) => <MorsePrompt t={t} />} input={{ kind: "text", placeholder: "Buchstabe oder Wort" }}
      isRight={(t, a) => a.trim().toUpperCase() === t.sym} correct={(t) => t.sym}
      note={(s) => (s.right / s.total >= 0.8 ? "Trefferquote wird als Rekord gespeichert." : "Ein Rekord wird ab 80 % richtig gespeichert.")}
      onRestart={() => setTasks(null)}
      onFinish={(s) => onFinish({
        elapsedMs: s.totalMs,
        headline: `${s.right} von ${s.total} richtig`,
        record: { value: Math.round((100 * s.right) / s.total), label: "Trefferquote", unit: "%", higher: true },
      })} />
  );
}

// ---------------- Flaggen & Geografie ----------------

interface GeoTask { kind: "flag" | "capital"; country: Country; options: string[]; answer: string }

export function GeoTrainer({ onFinish }: TrainerProps) {
  const [art, setArt] = useState("gemischt");
  const [region, setRegion] = useState("welt");
  const [tasks, setTasks] = useState<GeoTask[] | null>(null);

  const start = () => {
    const pool = region === "europa" ? COUNTRIES.filter((c) => c.region === "Europa") : COUNTRIES;
    const chosen = shuffle(pool).slice(0, 10);
    setTasks(chosen.map((country, i) => {
      const kind: GeoTask["kind"] = art === "flaggen" ? "flag" : art === "hauptstaedte" ? "capital" : i % 2 === 0 ? "flag" : "capital";
      const near = shuffle(pool.filter((c) => c.iso !== country.iso && (c.region === country.region || Math.random() < 0.3))).slice(0, 3);
      const others = near.length < 3 ? shuffle(COUNTRIES.filter((c) => c.iso !== country.iso && !near.includes(c))).slice(0, 3 - near.length) : [];
      const all = shuffle([country, ...near, ...others]);
      return { kind, country, options: all.map((c) => (kind === "flag" ? c.name : c.capital)), answer: kind === "flag" ? country.name : country.capital };
    }));
  };

  if (!tasks) {
    return (
      <Setup title="Flaggen & Geografie" lead="10 Fragen mit vier Antworten." onStart={start}>
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
