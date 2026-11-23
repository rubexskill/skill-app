import type { Dossier } from "./dossiers";

// Kategorie „Gewohnheiten“ (kurze Dossiers).
// Recherchiert am 23. November 2026. Studien über PubMed geprüft (Titel, Autoren, Abstract); Aussagen stehen nur, wenn sie im Abstract stehen.
const DATE = "23. November 2026";
const PM = (id: string) => `https://pubmed.ncbi.nlm.nih.gov/${id}/`;

export const DOSSIERS_GEWOHNHEITEN: Record<string, Dossier> = {
  "Tagebuch": {
    date: DATE,
    steckbrief: {
      about: "Regelmäßig schriftlich festhalten, was war und was beschäftigt. Studien untersuchen meist das „expressive Schreiben“: ein paar Tage lang über belastende Erlebnisse schreiben.",
      why: "Ein Tagebuch ist leicht anzufangen und kostet fast nichts. Eine Auswertung randomisierter Studien fand bei gesunden Menschen einen kleinen Effekt auf Arztbesuche; bei Menschen mit Erkrankungen oder starker Belastung nicht.",
      tips: "Feste Zeit wählen (z. B. abends, 10 Minuten), Papier oder Notiz-App, ohne Anspruch auf gute Texte. Bei sehr belastenden Erlebnissen nicht allein damit arbeiten (Vorsichtsregel, keine Leitlinie).",
      safety: "Wenn Schreiben über Belastendes Gefühle verstärkt statt entlastet, aufhören und mit einer vertrauten Person oder Fachleuten sprechen (Vorsichtsregel, keine Leitlinie).",
    },
    learn: [
      "Eine Meta-Analyse von 30 randomisierten Studien (2.294 Teilnehmende) prüfte, ob Schreiben über belastende Erlebnisse die Inanspruchnahme von Gesundheitsleistungen senkt. Bei gesunden Gruppen gab es einen kleinen Effekt (Hedges’ g 0,16), bei Gruppen mit Erkrankung oder psychischer Vorbelastung keinen klaren; die Bedeutung für die Gesundheit sei unbekannt. [1]",
      "Bei Krebspatientinnen und -patienten fand eine Meta-Analyse von 16 Studien keine statistisch signifikanten Effekte auf psychische, körperliche oder Lebensqualitätswerte. [2]",
      "Beide Arbeiten betreffen das expressive Schreiben, nicht das freie Tagebuchschreiben. Zu Letzterem habe ich keine eigene Studie gelesen; Nutzen ist also nicht belegt.",
    ],
    evidence: { level: "kaum", why: "Für expressives Schreiben zeigen Meta-Analysen nur kleine oder fehlende Effekte; freies Tagebuchschreiben wurde hier nicht untersucht." },
    steps: [
      "Heft oder App bereitlegen, feste Zeit am Tag wählen (Vorschlag).",
      "10 Minuten schreiben: was heute passiert ist, was beschäftigt.",
      "Nicht korrigieren oder bewerten.",
    ],
    plan: [
      { title: "Woche 1–2", text: "Täglich 5 bis 10 Minuten, immer zur selben Zeit (Vorschlag)." },
      { title: "Danach", text: "Einmal pro Woche nachlesen und eine Sache markieren, die wichtig war (Vorschlag)." },
    ],
    myths: [
      { myth: "Tagebuchschreiben verbessert nachweislich die Gesundheit.", fact: "Die Effekte in den Meta-Analysen zum expressiven Schreiben sind klein oder nicht vorhanden, besonders bei Kranken. [1][2]" },
    ],
    mistakes: ["Den Anspruch haben, schön zu schreiben.", "Nur über Belastendes grübeln, ohne Abschluss."],
    safety: ["Bei starker Belastung nicht allein bleiben; ärztliche oder psychologische Hilfe suchen (Vorsichtsregel, keine Leitlinie)."],
    conflicts: ["Die Studien variieren in Dauer, Anleitung und Zielgruppen; die Meta-Analysen sind deshalb nur eingeschränkt vergleichbar. [1][2]"],
    videos: [],
    videoNote: "Kein geprüftes Video eingebunden.",
    sources: [
      { title: "Harris 2006, Journal of Consulting and Clinical Psychology – Does expressive writing reduce health care utilization? A meta-analysis of randomized trials", url: PM("16649869"), kind: "Meta-Analyse" },
      { title: "Zachariae & O’Toole 2015, Psycho-Oncology – The effect of expressive writing intervention on psychological and physical health outcomes in cancer patients", url: PM("25871981"), kind: "Meta-Analyse" },
    ],
  },

  "Langer Spaziergang": {
    date: DATE,
    steckbrief: {
      about: "Regelmäßig lange gehen, möglichst draußen und in ruhigem Tempo.",
      why: "Eine Meta-Analyse von 75 randomisierten Studien (8.636 Teilnehmende) fand, dass Gehen depressive und Angstsymptome verringert; die Wirkung war vergleichbar mit anderen aktiven Vergleichsgruppen.",
      tips: "Feste Zeit einplanen, bequeme Schuhe, Handy ruhig lassen. Auch Gehen in der Gruppe oder drinnen half in den Studien. Dauer und Häufigkeit eher regelmäßig als extrem.",
      safety: "Bei Herz- oder Kreislaufbeschwerden, Schmerzen oder Schwindel ärztlich fragen (Vorsichtsregel, keine Leitlinie). Auf Verkehr und Wetter achten.",
    },
    learn: [
      "Die Meta-Analyse (Xu et al. 2024) umfasste 75 randomisierte Studien mit 8.636 Personen. Gehen verringerte depressive und Angstsymptome in den meisten Untergruppen, unabhängig von Häufigkeit, Dauer, Ort (drinnen oder draußen) und Form (Gruppe oder allein). [1]",
      "Teilnehmende mit Depression profitierten stärker als Teilnehmende ohne. Gegenüber anderen aktiven Vergleichsgruppen zeigte Gehen keinen signifikanten Unterschied: Es ist also eine wirksame Form von Bewegung, nicht unbedingt eine bessere. [1]",
      "Die Autoren betonen, dass mehr Belege zu sehr leichtem Gehen nötig sind. Die Studien sind sehr unterschiedlich (hohe Heterogenität). [1]",
    ],
    evidence: { level: "gut", why: "Eine große Meta-Analyse randomisierter Studien zeigt Wirkung auf Stimmung und Angst, bei hoher Heterogenität." },
    steps: ["Zeit und Strecke planen (30 bis 60 Minuten, Vorschlag).", "Im bequemen Tempo losgehen, Gespräch möglich halten (Vorschlag).", "Handy auf lautlos.", "Regelmäßig wiederholen, am besten gleiche Zeit."],
    plan: [
      { title: "Woche 1–2", text: "Dreimal pro Woche 30 Minuten (Vorschlag)." },
      { title: "Woche 3–4", text: "Einmal pro Woche eine lange Runde von 60 bis 90 Minuten (Vorschlag)." },
    ],
    myths: [
      { myth: "Nur schnelles Gehen oder Joggen wirkt.", fact: "Gehen zeigte in den Studien in verschiedenen Formen Wirkung; zu sehr langsamem Gehen fehlen noch Daten. [1]" },
    ],
    mistakes: ["Zu schnell zu viel planen und dann ausfallen lassen.", "Unpassende Schuhe tragen."],
    safety: ["Bei Schmerzen, Atemnot oder Schwindel stoppen und ärztlich abklären (Vorsichtsregel, keine Leitlinie)."],
    conflicts: ["Die Wirkung gegenüber aktiven Kontrollen ist nicht größer; die Studien sind sehr heterogen. [1]"],
    videos: [],
    videoNote: "Kein geprüftes Video eingebunden.",
    sources: [
      { title: "Xu et al. 2024, JMIR Public Health and Surveillance – The Effect of Walking on Depressive and Anxiety Symptoms: Systematic Review and Meta-Analysis", url: PM("39045858"), kind: "Meta-Analyse" },
    ],
  },
};
