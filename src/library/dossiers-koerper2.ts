import type { Dossier } from "./dossiers";

// Kategorie „Körper & Sport“, Teil 2. Recherchiert am 23. November 2026. Studien über PubMed geprüft (Titel, Autoren, Abstract).
// Zu Moonwalk, Akka 3000, Dunken & Werfen und Hockey gibt es keine Studien zum Trick selbst; die Dossiers stützen sich auf allgemeine Forschung zum motorischen Lernen.
// Nicht bearbeitet: Mewing (keine Quelle mit Inhalt gelesen; Lee & Graves 2019 hat in PubMed keinen Abstract, die Webseiten waren nicht erreichbar).
const DATE = "23. November 2026";
const PM = (id: string) => `https://pubmed.ncbi.nlm.nih.gov/${id}/`;

/** Gemeinsame Quellen zum motorischen Lernen: [1]–[5] in jedem Dossier mit `motor()` */
const MOTOR_SOURCES: Dossier["sources"] = [
  { title: "Wulf & Shea 2010, Med Educ – Motor skill learning and performance: a review of influential factors", url: PM("20078758"), kind: "Übersichtsarbeit" },
  { title: "Chua et al. 2021, Psychol Bull – Superiority of external attentional focus for motor performance and learning: Systematic reviews and meta-analyses", url: PM("34843301"), kind: "Metaanalyse" },
  { title: "McKay et al. 2024, Psychol Bull – Reporting bias, not external focus: A robust Bayesian meta-analysis and systematic review of the external focus of attention literature", url: PM("39480294"), kind: "Metaanalyse" },
  { title: "Guadagnoli & Lee 2004, J Mot Behav – Challenge point: a framework for conceptualizing the effects of various practice conditions in motor learning", url: PM("15130871"), kind: "Modellarbeit" },
  { title: "Hall & Magill 1995, J Mot Behav – Variability of Practice and Contextual Interference in Motor Skill Learning", url: PM("12529226"), kind: "Studie" },
];

const MOTOR_LEARN = [
  "Zum Trick oder Spiel selbst gibt es keine Studien. Was sich belegen lässt, ist allgemeines motorisches Lernen. [1]",
  "Eine Übersichtsarbeit nennt vier Faktoren, die das Lernen von Bewegungen fördern: Beobachten (besonders kombiniert mit Üben), Aufmerksamkeitsfokus, Rückmeldung und selbstbestimmtes Üben. Rückmeldung nach gelungenen Versuchen und Vergleiche mit dem Durchschnitt wirkten günstig; selbstkontrolliertes Üben war wirksamer als fremdbestimmtes. Die Autoren nehmen an, dass die Prinzipien breit gelten; untersucht wurde u. a. im Kontext medizinischer Ausbildung. [1]",
  "Ein Fokus auf die Wirkung der Bewegung („Ball“) statt auf Körperteile war in einer Metaanalyse im Vorteil (Hedges g 0,26 Leistung, 0,58 Behalten, 0,58 Transfer). [2] Eine Neuauswertung derselben Daten mit Korrektur für Publikationsverzerrung fand kaum noch Effekte (g 0,01 bis 0,15) und viel Streuung. Das ist ein offener Widerspruch. [3]",
  "Zur Aufgabenschwierigkeit: Nach dem Challenge-Point-Modell lernt man am meisten, wenn die Schwierigkeit zum Können passt. Das ist ein theoretisches Modell mit prüfbaren Hypothesen. [4]",
  "Zum Wechsel zwischen Varianten: In einem Experiment mit 48 Rechtshändern schnitten Gruppen mit zufällig gemischtem Üben beim Üben schlechter, bei Behaltens- und Transfertests aber besser ab als Gruppen mit geblocktem Üben. Die Aufgabe war ein Tippen auf Metallplatten, nicht eine Sportart. [5]",
];

interface MotorOpts {
  about: string; why: string; tips: string; safety: string;
  steps: string[]; plan: { title: string; text: string }[]; mistakes: string[]; safetyList: string[];
}

function motor(o: MotorOpts): Dossier {
  return {
    date: DATE,
    steckbrief: { about: o.about, why: o.why, tips: o.tips, safety: o.safety },
    learn: MOTOR_LEARN,
    evidence: { level: "kaum", why: "Keine Studien zum Skill selbst; nur allgemeine Befunde zum motorischen Lernen, die teils umstritten sind." },
    steps: o.steps,
    plan: o.plan,
    myths: [
      { myth: "Man muss nur genug wiederholen.", fact: "Wechsel zwischen Varianten verschlechtert das Üben kurzfristig, half aber beim Behalten und Übertragen (in einer Laborstudie). [5]" },
      { myth: "Auf die Körperhaltung achten ist immer die beste Strategie.", fact: "Ein Fokus auf Bewegungswirkung galt als vorteilhaft [2], wird aber nach Korrektur für Publikationsverzerrung bezweifelt [3]." },
    ],
    mistakes: o.mistakes,
    safety: o.safetyList,
    conflicts: [
      "Die Überlegenheit des externen Fokus ist umstritten. [2][3]",
      "Alle Studien betreffen Laboraufgaben oder Ausbildung, nicht diesen Skill; die Übertragung ist eine Annahme. [1][5]",
    ],
    videos: [],
    videoNote: "Keine Videos geprüft.",
    sources: MOTOR_SOURCES,
  };
}

export const DOSSIERS_KOERPER2: Record<string, Dossier> = {
  "Moonwalk": motor({
    about: "Rückwärtsgleiten bei gleichzeitigem Vorwärtsschritt-Anschein. Es gibt keine Studien zum Moonwalk; Lernen folgt allgemeinen Prinzipien des motorischen Lernens.",
    why: "Eine Bewegung, die man Schritt für Schritt aufbauen und beobachten kann; Fortschritt ist gut sichtbar.",
    tips: "Langsam beginnen, glatten Boden und Socken oder glatte Sohlen wählen, nur kurze Einheiten. (Vorschlag)",
    safety: "Auf rutschigem Boden Sturzgefahr: freie Fläche, Wand zum Abstützen in der Nähe. (Vorsichtsregel, keine Leitlinie)",
    steps: [
      "Bewegung in Teilen üben und im Video ansehen. [1]",
      "Langsam Bewegung erlernen, dann Tempo steigern. (Vorschlag)",
      "Nach jeder Einheit kurz festhalten, was gut lief (Rückmeldung nach gelungenen Versuchen). [1]",
    ],
    plan: [{ title: "Woche 1–2", text: "Täglich 10 Minuten, Teilbewegungen langsam üben. (Vorschlag)" }, { title: "Woche 3–6", text: "Verbinden, Tempo steigern, ab und zu filmen. (Vorschlag)" }],
    mistakes: ["Zu schnell, bevor die Teilbewegung sitzt. (Vorschlag)", "Auf glattem Boden ohne Platz üben. (Vorsichtsregel)"],
    safetyList: ["Freie Fläche, Schuhe oder Socken mit sicherem Gleiten, Wand in der Nähe. (Vorsichtsregel, keine Leitlinie)"],
  }),

  "Akka 3000": motor({
    about: "Ein Fußballtrick mit schneller Ballführung. Zum Trick gibt es keine Studien; Üben folgt den allgemeinen Prinzipien des motorischen Lernens.",
    why: "Ein klar abgegrenztes Ziel, bei dem sich Üben mit Rückmeldung gut messen lässt.",
    tips: "Erst langsam und ohne Gegner, dann Tempo. Auf ebenem Boden üben. (Vorschlag)",
    safety: "Auf unebenem Gelände Umknickgefahr; vorher aufwärmen. (Vorsichtsregel, keine Leitlinie)",
    steps: [
      "Den Trick in Teile zerlegen und langsam üben. (Vorschlag)",
      "Dann zufällig mit anderen Übungen mischen, statt nur denselben Trick zu wiederholen. [5]",
      "Nach den Einheiten nachsehen, was gelang. [1]",
    ],
    plan: [{ title: "Woche 1–2", text: "Täglich 15 Minuten langsam üben. (Vorschlag)" }, { title: "Woche 3+", text: "Mit anderen Ballübungen abwechseln, Tempo steigern. [5] (Tempo: Vorschlag)" }],
    mistakes: ["Gleich im Wettkampftempo üben. (Vorschlag)"],
    safetyList: ["Aufwärmen, ebener Boden, passende Schuhe. (Vorsichtsregel, keine Leitlinie)"],
  }),

  "Dunken & Werfen": motor({
    about: "Basketball: Korbleger, Dunk und Wurf. Zu Dunking und Werfen habe ich keine Studie gelesen; der Lernteil folgt allgemeinen Befunden zum motorischen Lernen.",
    why: "Wer Würfe und Sprünge getrennt aufbaut, kann Rückmeldung und Variation gezielt nutzen.",
    tips: "Zuerst Wurf und Sprung getrennt üben; Würfe aus wechselnden Positionen mischen. (Vorschlag, [5] als Hinweis)",
    safety: "Verletzungsgefahr bei Sprung und Landung, besonders bei Dunk am Ring; zuerst ohne Ring, aufwärmen, weiche Landung. (Vorsichtsregel, keine Leitlinie)",
    steps: [
      "Wurfbewegung in Teilen lernen. [1]",
      "Aus wechselnden Positionen werfen, statt nur von einer. [5]",
      "Passende Schwierigkeit wählen: nicht zu leicht, nicht zu schwer. [4]",
    ],
    plan: [{ title: "Woche 1–4", text: "3 × pro Woche 30 Minuten Wurf, Variation von Positionen. (Vorschlag)" }, { title: "Danach", text: "Sprungübungen separat und vorsichtig aufbauen. (Vorsichtsregel)" }],
    mistakes: ["Dunk versuchen, bevor Sprung und Landung sicher sind. (Vorsichtsregel)"],
    safetyList: ["Aufwärmen, weiche Landung, Dunk nur mit verstellbarem Ring oder Aufsicht. (Vorsichtsregel, keine Leitlinie)"],
  }),

  "Koordination": motor({
    about: "Bewegungen im Zusammenspiel von Auge, Hand und Körper, z. B. Schläger und Ball. Es gibt keine Studie zu diesem konkreten Training; allgemeine Befunde zum motorischen Lernen gelten als Orientierung.",
    why: "Koordination entsteht durch viele verschiedene Bewegungen. In einem Laborexperiment half Variation beim späteren Behalten. [5]",
    tips: "Übungen abwechseln statt nur eine zu wiederholen; Schwierigkeit anpassen. (Vorschlag, [4][5])",
    safety: "Auf freier Fläche üben, nicht übermüden. (Vorsichtsregel, keine Leitlinie)",
    steps: [
      "Verschiedene Bewegungsaufgaben im Wechsel üben. [5]",
      "Schwierigkeit an das Können anpassen. [4]",
      "Nach den Einheiten Rückmeldung holen. [1]",
    ],
    plan: [{ title: "Woche 1–4", text: "3 × pro Woche 15 Minuten, jede Einheit mit 3 Aufgaben im Wechsel. (Vorschlag)" }],
    mistakes: ["Nur eine Übung monatelang wiederholen. (Einordnung zu [5])"],
    safetyList: ["Freie Fläche, passende Schuhe. (Vorsichtsregel, keine Leitlinie)"],
  }),

  "3 Hockey-Skills": motor({
    about: "Drei nützliche Hockey-Fertigkeiten. Für Hockey habe ich keine Studie gelesen; die Fertigkeiten folgen allgemeinen Prinzipien des motorischen Lernens.",
    why: "Wenige Skills gezielt üben, mit Rückmeldung und wechselnder Aufgabe.",
    tips: "Pro Einheit einen Skill üben und mit den beiden anderen mischen. (Vorschlag, [5])",
    safety: "Schläger nur mit Abstand zu anderen schwingen; Schutzausrüstung nach Vereinsvorgabe. (Vorsichtsregel, keine Leitlinie)",
    steps: [
      "Drei Skills wählen. (Vorschlag)",
      "In jeder Einheit zwischen den Skills wechseln, statt einen lange zu wiederholen. [5]",
      "Nach den Einheiten Rückmeldung (Video, Trainer). [1]",
    ],
    plan: [{ title: "Woche 1–4", text: "3 × pro Woche 30 Minuten, drei Skills im Wechsel. (Vorschlag)" }],
    mistakes: ["Nur eine Fertigkeit wiederholen. (Einordnung zu [5])"],
    safetyList: ["Platz zu anderen, Schutzausrüstung nach Vereinsvorgabe. (Vorsichtsregel, keine Leitlinie)"],
  }),

  "Beidhändigkeit": {
    date: DATE,
    steckbrief: {
      about: "Mit der schwächeren Hand schreiben und arbeiten lernen. Training verbessert die Leistung der Hand; die Fertigkeit der geübten Hand erreicht aber nicht automatisch das Niveau der Schreibhand.",
      why: "In einer Studie lernten umgeschulte Linkshänder in zwei Jahren, mit der linken Hand zu schreiben; bei komplexen Schreibaufgaben blieb sie nach 24 Monaten langsamer und weniger automatisch als bei geborenen Linkshändern.",
      tips: "Kurz und regelmäßig üben, mit einfachen Linien und Kreisen beginnen. (Vorschlag)",
      safety: "Keine Risiken. Bei Schmerzen in der Hand pausieren. (Vorsichtsregel, keine Leitlinie)",
    },
    learn: [
      "Elf umgeschulte Linkshänder trainierten zwei Jahre die linke Hand. Bei einfachen Aufgaben stieg die Häufigkeit rasch an, nach 24 Monaten übertrafen sie sogar die Kontrollgruppe. Bei komplexen Aufgaben (Sätze, Abschreiben) stiegen Frequenz und Dauer, aber das Schreiben blieb langsamer, weniger automatisiert und länger als bei geborenen Linkshändern. [1]",
      "In einer Studie mit 20 Rechtshändern verbesserten sich Genauigkeit und Zeit bei einer Tastenaufgabe nach 2 Wochen Training (5 Tage pro Woche) der Gruppe mit Training stärker als in der Kontrollgruppe; es ging um Transfer zwischen den Händen. [2]",
      "Auch die untrainierte Hand verbesserte sich in einer Studie mit 27 Rechtshändern bei einer Zeigeaufgabe. Die Hirnaktivität unterschied sich, je nachdem, ob die dominante oder nicht dominante Hand trainiert wurde. [3]",
      "Alle drei Arbeiten sind klein und betreffen jeweils Schreiben oder eine Laboraufgabe; ob jemand „beidhändig“ im Alltag wird, zeigen sie nicht.",
    ],
    evidence: { level: "teilweise", why: "Training bessert die schwächere Hand nachweislich, aber die Studien sind klein, laborbezogen und zeigen Grenzen der Automatisierung." },
    steps: [
      "Mit einfachen Aufgaben (Linien, Kreise) beginnen. [1]",
      "Täglich kurz üben, über Wochen. (Vorschlag)",
      "Erst später komplexere Aufgaben (Schreiben von Sätzen). [1]",
    ],
    plan: [
      { title: "Woche 1–4", text: "Täglich 10 Minuten Linien und Kreise mit der schwächeren Hand. (Vorschlag)" },
      { title: "Monate 2–12", text: "Wörter und Sätze schreiben; Fortschritt braucht Zeit, die Studie lief 2 Jahre. [1]" },
    ],
    myths: [
      { myth: "Mit Übung wird die schwächere Hand genauso gut wie die andere.", fact: "Nach zwei Jahren war das Schreiben bei komplexen Aufgaben noch weniger automatisch als bei Linkshändern von Geburt. [1]" },
      { myth: "Training der einen Hand bringt der anderen nichts.", fact: "Die untrainierte Hand verbesserte sich ebenfalls. [3]" },
    ],
    mistakes: ["Zu früh komplexe Aufgaben. (Vorschlag)", "Zu große Erwartung in kurzer Zeit. (Einordnung zu [1])"],
    safety: [],
    conflicts: ["Die Studien sind klein (11, 20, 27 Personen) und untersuchen verschiedene Aufgaben; Verallgemeinerung ist unsicher. [1][2][3]"],
    videos: [],
    videoNote: "Keine Videos geprüft.",
    sources: [
      { title: "Stetter et al. 2023, Sci Rep – Handwriting kinematics during learning to write with the dominant left hand in converted left-handers", url: PM("36750597"), kind: "Studie" },
      { title: "Jung et al. 2019, NeuroRehabilitation – Neuroplastic and motor behavioral changes after intermanual transfer training of non-dominant hand", url: PM("30741701"), kind: "Studie" },
      { title: "Kirby et al. 2019, Exp Brain Res – Brain functional differences in visuo-motor task adaptation between dominant and non-dominant hand training", url: PM("31542802"), kind: "Studie" },
    ],
  },
};
