import type { Dossier } from "./dossiers";

// Kategorie „Projekte & Besorgungen“ (kurze Dossiers, Teil 2).
// Recherchiert am 23. November 2026. Studie über PubMed geprüft (Titel, Autoren, Abstract); Aussagen stehen nur, wenn sie im Abstract stehen.
const DATE = "23. November 2026";
const PM = (id: string) => `https://pubmed.ncbi.nlm.nih.gov/${id}/`;

export const DOSSIERS_PROJEKTE2: Record<string, Dossier> = {
  "Graustufen am Handy": {
    date: DATE,
    steckbrief: {
      about: "Den Bildschirm des Handys auf Graustufen stellen, damit die Farben weniger zum Weiterschauen verleiten.",
      why: "In einer Feldstudie mit 112 Personen senkte der Graustufenmodus die gemessene Bildschirmzeit sofort deutlich gegenüber der Kontrollgruppe; Zeitlimits wirkten kleiner und langsamer.",
      tips: "In den Bedienungshilfen die Farbfilter aktivieren und, falls verfügbar, per Kurzbefehl umschaltbar machen (Vorschlag). Einen Monat testen und die Bildschirmzeit vergleichen.",
      safety: "Keine Risiken. Fotos, Karten und Warnhinweise sind in Graustufen schwerer zu lesen; bei Bedarf den Modus kurz abschalten (Vorsichtsregel, keine Leitlinie).",
    },
    learn: [
      "Zimmermann et al. (2023): In einer vorregistrierten Feldstudie (N = 112) über mehrere Wochen wurde ein Graustufenmodus (Design-Reibung) mit Selbstverpflichtung zu Zeitlimits und bloßem Selbstmonitoring verglichen. Graustufen führten sofort zu einer deutlichen Senkung der objektiv gemessenen Bildschirmzeit, Zeitlimits zu einer kleineren und langsameren. [1]",
      "Einen sofortigen ursächlichen Effekt der geringeren Nutzung auf Wohlbefinden und Studienleistung fand die Studie nicht. Der Nutzen ist also eine kürzere Bildschirmzeit, kein belegter Gewinn an Wohlbefinden. [1]",
    ],
    evidence: { level: "teilweise", why: "Eine vorregistrierte Feldstudie belegt die Senkung der Bildschirmzeit, nicht aber einen Gewinn an Wohlbefinden." },
    steps: [
      "In den Einstellungen unter Bedienungshilfen den Farbfilter auf Graustufen stellen.",
      "Bildschirmzeit in den Einstellungen einige Tage notieren (Vorschlag).",
      "Nach zwei bis vier Wochen Zeiten vergleichen und entscheiden, ob es bleibt.",
    ],
    plan: [
      { title: "Einrichten", text: "Graustufen aktivieren und Ausgangswerte der Bildschirmzeit festhalten (Vorschlag)." },
      { title: "Nach 4 Wochen", text: "Bildschirmzeit vergleichen und entscheiden (Vorschlag)." },
    ],
    myths: [
      { myth: "Weniger Bildschirmzeit macht sofort zufriedener.", fact: "Die Feldstudie fand keinen sofortigen Effekt der geringeren Nutzung auf Wohlbefinden und Studienleistung. [1]" },
    ],
    mistakes: ["Den Modus beim ersten Ärger abschalten und nie zurückkehren (Vorschlag).", "Nur Graustufen nutzen und sonst nichts ändern (Vorschlag)."],
    safety: ["Bei Karten, Fotos oder Warnanzeigen den Modus kurz ausschalten (Vorsichtsregel, keine Leitlinie)."],
    conflicts: ["Die Studie zeigt weniger Bildschirmzeit, aber keinen sofortigen Gewinn an Wohlbefinden. [1]"],
    videos: [],
    videoNote: "Kein geprüftes Video eingebunden.",
    sources: [
      { title: "Zimmermann et al. 2023, Cyberpsychology, Behavior and Social Networking – Digital Strategies for Screen Time Reduction: A Randomized Field Experiment", url: PM("36577008"), kind: "Randomisierte Studie" },
    ],
  },
};
