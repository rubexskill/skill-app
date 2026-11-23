import type { Dossier } from "./dossiers";

// Kategorie „Wissen & Verstehen“.
// Recherchiert am 23. November 2026. Studien über PubMed geprüft (Titel, Autoren, Abstract); Aussagen stehen nur, wenn sie im Abstract stehen.
const DATE = "23. November 2026";
const PM = (id: string) => `https://pubmed.ncbi.nlm.nih.gov/${id}/`;

export const DOSSIERS_WISSEN: Record<string, Dossier> = {
  "Denkfehler": {
    date: DATE,
    steckbrief: {
      about: "Kognitive Verzerrungen (z. B. Bestätigungsfehler, Überschätzung der eigenen Treffsicherheit) kennen und erkennen. Das Wissen darum ist Lernstoff; ob man sie dadurch auch im Alltag vermeidet, ist eine andere Frage.",
      why: "Eine Auswertung von 54 randomisierten Studien (10.941 Personen) fand: Schulungen verringern Denkfehler bei den trainierten Aufgaben nur leicht (g = 0,26). Manche Verzerrungen lassen sich schwer abtrainieren.",
      tips: "Einzelne Denkfehler mit eigenen Beispielen üben, nicht nur Listen lesen. Vor Entscheidungen bewusst das Gegenteil der eigenen Annahme prüfen (Vorschlag).",
      safety: "Keine besonderen Risiken.",
    },
    learn: [
      "Die Übersichtsarbeit in Nature Human Behaviour (2025) fasste Schulungen zum Abbau kognitiver Verzerrungen in Bildungsumgebungen zusammen: 54 randomisierte Studien, 383 Effektgrößen, 10.941 Teilnehmende. Der Effekt war klein, aber signifikant (g = 0,26; 95 %-Konfidenzintervall 0,14 bis 0,39). [1]",
      "Die meisten Studien zielten auf Bestätigungsfehler und nutzten kognitive Strategien. Manche Verzerrungen, etwa die Repräsentativitätsheuristik, erwiesen sich als schwer zu überwinden. Offen bleibt, wie tief das Gelernte geht und ob es außerhalb des Klassenzimmers wirkt. [1]",
      "Alle Studien hatten ein unklares oder hohes Verzerrungsrisiko; ein Publikationsbias ist möglich. [1]",
    ],
    evidence: { level: "teilweise", why: "Training wirkt nach einer Meta-Analyse leicht auf trainierte Aufgaben; Übertragung auf den Alltag ist nicht gezeigt, und die Studienqualität ist niedrig." },
    steps: [
      "Einen Denkfehler pro Woche wählen, z. B. Bestätigungsfehler (Vorschlag).",
      "Die Definition und ein Beispiel in eigenen Worten aufschreiben.",
      "Eine eigene Entscheidung der letzten Wochen daraufhin prüfen.",
      "Eine Strategie festlegen, z. B. gezielt nach Gegenargumenten suchen. [1]",
    ],
    plan: [
      { title: "Woche 1–4", text: "Pro Woche ein Denkfehler, 15 Minuten, mit eigenem Beispiel (Vorschlag)." },
      { title: "Danach", text: "Alle zwei Wochen eine reale Entscheidung mit der Liste prüfen (Vorschlag)." },
    ],
    myths: [
      { myth: "Wer Denkfehler kennt, ist dagegen immun.", fact: "Schulungen verringerten Fehler nur leicht, und Übertragung auf andere Situationen ist offen. [1]" },
    ],
    mistakes: ["Denkfehler vor allem bei anderen suchen.", "Listen auswendig lernen, ohne anzuwenden."],
    safety: [],
    conflicts: ["Die Meta-Analyse nennt Fragen zur Tiefe und Übertragbarkeit des Lernens; zudem unklare bis hohe Verzerrungsrisiken der Einzelstudien. [1]"],
    videos: [],
    videoNote: "Kein geprüftes Video eingebunden.",
    sources: [
      { title: "Swaryandini et al. 2025, Nature Human Behaviour – Systematic review and meta-analysis of educational approaches to reduce cognitive biases among students", url: PM("40858766"), kind: "Meta-Analyse" },
    ],
  },
};
