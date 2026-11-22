/** Abschlusstest: Prompt für Claude und Parser für die Antwort. Keine Datenbank-Abhängigkeit. */
import type { ExamQuestion, ExamTask, Skill } from "./db";

export function examPrompt(s: Pick<Skill, "title" | "name" | "kategorie" | "profile" | "milestones">): string {
  const orig = s.title !== s.name ? ` („${s.name}“)` : "";
  const steps = s.milestones.length ? `Lernschritte: ${s.milestones.map((m) => m.text).join("; ")}.` : "";
  const about = s.profile?.about ? `Kurzbeschreibung: ${s.profile.about}` : "";
  return [
    `Erstelle einen wirklich schweren Abschlusstest auf Deutsch für den Skill „${s.title}“${orig}, Kategorie „${s.kategorie}“.`,
    about,
    steps,
    "",
    "Ziel: Wer besteht, beherrscht den Skill wirklich – Wissen und, wo sinnvoll, Praxis. Kein Anfängerniveau: Halbwissen soll durchfallen.",
    "",
    "Regeln:",
    "- 12 Multiple-Choice-Fragen mit je 4 Antworten (A–D), genau eine richtig. Falsche Antworten plausibel und an typischen Irrtümern orientiert. Die richtige Antwort gleichmäßig auf A–D verteilen. Mische Faktenwissen, Anwendungsfälle, Fehleranalyse und – wo passend – Rechen- oder Denkaufgaben.",
    "- 2 bis 3 praktische Prüfaufgaben mit je 3 bis 5 messbaren Kriterien (Zahlen, Zeiten, Wiederholungen oder klare Ja/Nein-Merkmale). Nur ungefährliche Aufgaben. Bei reinen Wissensthemen stattdessen praktische Anwendungsaufgaben.",
    "- Bestehensgrenze: 80 Prozent.",
    "",
    "Antworte genau in diesem Format, ohne Einleitung und ohne Schluss:",
    "TEST: <Titel>",
    "BESTEHEN: 80",
    "FRAGE: <Text>",
    "A) <Antwort>",
    "B) <Antwort>",
    "C) <Antwort>",
    "D) <Antwort>",
    "LÖSUNG: <Buchstabe>",
    "ERKLÄRUNG: <1–2 Sätze>",
    "(weitere FRAGE-Blöcke im gleichen Format)",
    "AUFGABE: <Beschreibung der Prüfaufgabe>",
    "KRITERIEN:",
    "- <messbares Kriterium>",
    "- <messbares Kriterium>",
    "(weitere AUFGABE-Blöcke im gleichen Format)",
  ]
    .filter((l, i, a) => !(l === "" && (a[i - 1] === "" || i === 0)) && !(l === undefined))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");
}

export interface ParsedExam {
  title: string;
  passPercent: number;
  questions: Omit<ExamQuestion, "id">[];
  tasks: Omit<ExamTask, "id">[];
}

const clean = (s: string) => s.replace(/\*\*(.+?)\*\*/g, "$1").replace(/__(.+?)__/g, "$1").replace(/^[\s#>*_`-]+/, "").replace(/[*_`]+$/, "").trim();

const R = {
  title: /^[#*_\s]*TEST\s*[:：]\s*(.*)$/i,
  pass: /^[#*_\s]*(?:BESTEHEN|BESTEHENSGRENZE|BESTANDEN)\b[^0-9]*(\d{1,3})/i,
  question: /^[#*_\s]*FRAGE\s*\d*\s*[:.)：]\s*(.*)$/i,
  option: /^[\s*_-]*\(?([A-Da-d])[).:]\s+(.*)$/,
  answer: /^[#*_\s]*(?:L[ÖO]E?SUNG|ANTWORT|RICHTIGE\s+ANTWORT|RICHTIG)\s*[:：]?\s*[*_]*\s*\(?([A-Da-d])\b/i,
  explanation: /^[#*_\s]*(?:ERKL[ÄA]E?RUNG|BEGR[ÜU]E?NDUNG)\s*[:：]\s*(.*)$/i,
  task: /^[#*_\s]*(?:AUFGABE|PRAXISAUFGABE|PR[ÜU]FAUFGABE)\s*\d*\s*[:.)：]\s*(.*)$/i,
  criteria: /^[#*_\s]*KRITERIEN\s*[:：]?\s*(.*)$/i,
  bullet: /^\s*(?:[-*•–]|\d+[.)])\s+(.*)$/,
};

/** Liest die Antwort von Claude. Verträgt Markdown, Nummerierung und kleine Abweichungen. */
export function parseExam(text: string): ParsedExam | null {
  const out: ParsedExam = { title: "", passPercent: 80, questions: [], tasks: [] };
  type Q = { text: string; options: string[]; answer: number; explanation: string };
  let q: Q | null = null;
  let t: { text: string; criteria: string[]; inCriteria: boolean } | null = null;
  let last: "question" | "explanation" | "task" | null = null;

  const closeQ = () => {
    if (q && q.options.length >= 2 && q.answer >= 0 && q.answer < q.options.length && q.text) out.questions.push({ ...q });
    q = null;
  };
  const closeT = () => {
    if (t && t.text) out.tasks.push({ text: t.text, criteria: t.criteria });
    t = null;
  };

  for (const raw of text.replace(/\r/g, "").split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    let m: RegExpExecArray | null;
    if ((m = R.title.exec(line))) { out.title = clean(m[1]); continue; }
    if ((m = R.pass.exec(line)) && !q && !t) { out.passPercent = Math.min(100, Math.max(1, Number(m[1]))); continue; }
    if ((m = R.question.exec(line))) { closeQ(); closeT(); q = { text: clean(m[1]), options: [], answer: -1, explanation: "" }; last = "question"; continue; }
    if ((m = R.task.exec(line))) { closeQ(); closeT(); t = { text: clean(m[1]), criteria: [], inCriteria: false }; last = "task"; continue; }
    if (q) {
      if ((m = R.answer.exec(line))) { q.answer = "ABCD".indexOf(m[1].toUpperCase()); continue; }
      if ((m = R.explanation.exec(line))) { q.explanation = clean(m[1]); last = "explanation"; continue; }
      if ((m = R.option.exec(line)) && last !== "explanation") {
        const idx = "ABCD".indexOf(m[1].toUpperCase());
        if (idx === q.options.length) { q.options.push(clean(m[2])); continue; }
      }
      if (last === "question" && q.options.length === 0) q.text = `${q.text} ${clean(line)}`.trim();
      else if (last === "explanation") q.explanation = `${q.explanation} ${clean(line)}`.trim();
      continue;
    }
    if (t) {
      if ((m = R.criteria.exec(line))) {
        t.inCriteria = true;
        const first = clean(m[1]);
        if (first) t.criteria.push(first);
        continue;
      }
      if ((m = R.bullet.exec(line))) { t.inCriteria = true; t.criteria.push(clean(m[1])); continue; }
      if (t.inCriteria) t.criteria.push(clean(line));
      else t.text = `${t.text} ${clean(line)}`.trim();
    }
  }
  closeQ();
  closeT();
  if (!out.questions.length && !out.tasks.length) return null;
  // Aufgaben ohne Kriterien: mindestens eine „Aufgabe erledigt“-Zeile
  for (const x of out.tasks) if (!x.criteria.length) x.criteria = ["Aufgabe vollständig erledigt"];
  return out;
}
