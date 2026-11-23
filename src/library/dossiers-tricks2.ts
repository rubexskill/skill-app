import type { Dossier } from "./dossiers";

// Kategorie „Tricks, Geschick & Mentalismus“, Teil 2. Recherchiert am 23. November 2026.
// Quellen: PubMed (Abstract gelesen) und WHO-Faktenblatt (Seite gelesen).
// Ausgelassen (keine seriösen Quellen gefunden): Münzrolle, Stift drehen, Ball auf dem Finger, Schloss knacken
// (zur rechtlichen Lage in Deutschland habe ich keine belegte Quelle gelesen).
const DATE = "23. November 2026";
const PM = (id: string) => `https://pubmed.ncbi.nlm.nih.gov/${id}/`;

export const DOSSIERS_TRICKS2: Record<string, Dossier> = {
  "Bierpong": {
    date: DATE,
    steckbrief: {
      about: "Ein Trinkspiel, bei dem Bälle in Becher geworfen werden. Das Zielen lässt sich ohne Alkohol üben; als Trinkspiel ist es mit Risiken verbunden.",
      why: "Eine systematische Übersicht (34 Studien, 34 197 Teilnehmende) verband Trinkspiele bei Studierenden mit höherem Alkoholkonsum und negativen Folgen. Die WHO hält fest, dass Alkohol schon in kleinen Mengen Gesundheitsrisiken birgt.",
      tips: "Zum Üben Wasser statt Bier verwenden und bei Wettbewerben auf Wasser oder alkoholfreie Getränke ausweichen. (Vorschlag)",
      safety: "Nicht als Trinkspiel mit Alkohol spielen, wenn jemand unter 18 ist, Auto fährt, Medikamente nimmt oder schwanger ist (Vorsichtsregel, keine Leitlinie). Niemand darf zum Trinken gedrängt werden.",
    },
    learn: [
      "Die Übersichtsarbeit (PRISMA, 34 Studien, 34 197 Teilnehmende) zu Trinkspielen an Hochschulen: Trinkspiele sind soziales Trinken mit dem Ziel starken Konsums und mit riskantem Verhalten verbunden. Teilnehmende kannten die Risiken, sahen negative Folgen aber oft als Auszeichnung. Motive waren Geselligkeit und Zugehörigkeit; Risikofreude und die Identifikation mit der Trinkkultur spielten eine Rolle. Als Grenzen nennen die Autoren unterschiedliche Messungen und mögliche Selektion starker Trinker. [1]",
      "Die WHO (Faktenblatt, Juni 2024): Alkohol enthält Ethanol, eine psychoaktive und giftige Substanz, die abhängig machen kann. Alkoholkonsum kann schon bei niedrigen Mengen Risiken bringen, die meisten Schäden entstehen aber durch starken Episodenkonsum oder dauerhaft starken Konsum. Weltweit waren 2019 etwa 2,6 Millionen Todesfälle auf Alkohol zurückzuführen. [2]",
      "Zur Wurftechnik (Wurfwinkel, Bogenwurf) habe ich keine Studie gelesen.",
    ],
    evidence: { level: "kaum", why: "Für die Geschicklichkeit selbst keine gelesene Studie; zum Risiko des Trinkspiels gibt es eine Übersichtsarbeit und die WHO." },
    steps: [
      "Zum Zielen mit Wasser oder Leerbechern üben. (Vorschlag)",
      "Wurf aus gleicher Haltung wiederholen und Treffer zählen. (Vorschlag)",
      "Spiel auf Wasser oder alkoholfreie Getränke umstellen. (Vorsichtsregel, keine Leitlinie)",
    ],
    plan: [
      { title: "Woche 1–2", text: "Täglich 10 Würfe mit festem Bogen, Treffer notieren. (Vorschlag)" },
      { title: "Woche 3–4", text: "Wurf-Entfernung und Becherzahl steigern. (Vorschlag)" },
    ],
    myths: [
      { myth: "Beim Trinkspiel weiß jeder, was er verträgt.", fact: "Teilnehmende kannten Risiken, nahmen negative Folgen aber oft als Auszeichnung wahr. [1]" },
    ],
    mistakes: ["Mit Alkohol anfangen. (Vorsichtsregel)", "Mitspielende zum Trinken drängen."],
    safety: [
      "Alkoholfreie Variante wählen; keinen Alkohol vor Autofahren, beim Sport im Wasser oder mit Medikamenten. (Vorsichtsregel, keine Leitlinie)",
      "Bei starker Benommenheit, Erbrechen oder Bewusstlosigkeit eines Mitspielers den Notruf 112 wählen. (Vorsichtsregel, keine Leitlinie)",
    ],
    conflicts: ["Die Übersicht umfasst überwiegend Befragungen unter Studierenden; Ursache und Wirkung sind daraus nicht abzuleiten (mögliche Selektion starker Trinker). [1]"],
    videos: [],
    videoNote: "Keine Videos eingetragen: Ich habe kein Video gefunden, das ich als verlässlich einstufen konnte.",
    sources: [
      { title: "Farias de Santana et al. 2023, International Review of Psychiatry – Risky business: an examination of drinking games in college settings and their impact: a systematic review", url: PM("38299653"), kind: "Systematische Übersicht" },
      { title: "WHO 2024 – Alcohol (Faktenblatt)", url: "https://www.who.int/news-room/fact-sheets/detail/alcohol", kind: "Behörde" },
    ],
  },
};
