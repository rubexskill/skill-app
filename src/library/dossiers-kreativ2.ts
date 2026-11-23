import type { Dossier } from "./dossiers";

// Kategorie „Kreativ & Alltag“, Teil 2. Recherchiert am 23. November 2026.
// Studien über PubMed geprüft (Titel, Autoren, Abstract); Webseiten und PDFs im Volltext gelesen. Aussagen stehen nur, wenn sie dort stehen.
// Nicht bearbeitet (keine seriöse Quelle gelesen oder nur Handwerkliches ohne Forschung): Laut pfeifen, Ein Bild malen, Hyperrealismus, Krawatte binden, Bier öffnen.
const DATE = "23. November 2026";
const PM = (id: string) => `https://pubmed.ncbi.nlm.nih.gov/${id}/`;

const BFR_URL = "https://www.bfr.bund.de/cm/350/verbrauchertipps_schutz_vor_lebensmittelinfektionen_im_privathaushalt.pdf";
const BFR_TITLE = "Bundesinstitut für Risikobewertung (BfR) – Verbrauchertipps: Schutz vor Lebensmittelinfektionen im Privathaushalt";

export const DOSSIERS_KREATIV2: Record<string, Dossier> = {
  "Zehnfingersystem": {
    date: DATE,
    steckbrief: {
      about: "Tippen mit allen zehn Fingern, ohne auf die Tastatur zu schauen. Studien zeigen: Auch selbst Gelernte tippen oft schnell; das Zehnfingersystem ist nicht der einzige Weg zu hoher Geschwindigkeit.",
      why: "In einer Studie an der Aalto-Universität erreichten Selbstlerner Leistungen, die mit Zehnfinger-Schreibenden vergleichbar waren, auch mit weniger Fingern.",
      tips: "Ziel ist ein gleichmäßiger Ablauf: jeder Buchstabe immer vom selben Finger, die nächsten Tasten schon vorbereiten, die Hände ruhig halten. [1]",
      safety: "Auf entspannte Haltung achten; bei Schmerzen in Händen oder Armen pausieren und ärztlichen Rat suchen (Vorsichtsregel, keine Leitlinie).",
    },
    learn: [
      "Feit, Weir und Oulasvirta (2016) verglichen Selbstlerner mit Personen, die einen Zehnfinger-Kurs besucht hatten. Überraschend: Selbstlerner erreichten vergleichbare Leistungen, selbst mit weniger Fingern. Drei Prädiktoren hoher Leistung: eindeutige Zuordnung (ein Buchstabe immer vom selben Finger), aktive Vorbereitung der folgenden Anschläge und möglichst wenig Gesamtbewegung der Hand. [1]",
      "Dhakal et al. (2018) analysierten Tippdaten von 168.000 Freiwilligen. Tasten, die mit verschiedenen Händen oder Fingern gedrückt werden, sagten die Geschwindigkeit besser voraus als Buchstabenwiederholungen; überlappendes Tippen (nächste Taste, bevor die vorige losgelassen wird) war häufig. [2]",
      "Pinet et al. (2022) erfassten 1.301 Studierende und folgern, dass die scharfe Trennung zwischen Anfängern und Experten die Leistung heutiger junger Tippender möglicherweise nicht gut beschreibt; häufiger Gebrauch kann zu hoher Expertise führen. [3]",
      "Einordnung: Alle Studien sind Beobachtungs- bzw. Vergleichsstudien; eine Interventionsstudie zum Lernen des Zehnfingersystems wurde nicht gelesen.",
    ],
    evidence: { level: "teilweise", why: "Gute Beobachtungsdaten zu Tippstrategien, aber keine gelesene Studie, die einen Lernweg zum Zehnfingersystem testet." },
    steps: [
      "Grundstellung der Finger festlegen und jeder Taste einen festen Finger zuordnen. [1]",
      "Langsam üben, ohne auf die Tasten zu schauen; Genauigkeit vor Tempo (Vorschlag).",
      "Beim Tippen schon die nächsten Tasten vorbereiten. [1]",
      "Hand möglichst ruhig halten. [1]",
      "Tägliche kurze Einheiten (Vorschlag).",
    ],
    plan: [{ title: "Täglich", text: "10–15 Minuten gezieltes Üben, dazu viel Alltagstippen (Vorschlag, gestützt auf [3])." }],
    myths: [
      { myth: "Nur wer einen Zehnfinger-Kurs gemacht hat, tippt schnell.", fact: "Selbstlerner erreichten vergleichbare Leistungen, auch mit weniger Fingern. [1]" },
    ],
    mistakes: ["Auf die Tastatur schauen, statt Tasten blind anzusteuern (Vorschlag).", "Tempo ohne Genauigkeit."],
    safety: ["Bei Schmerzen pausieren (Vorsichtsregel, keine Leitlinie)."],
    conflicts: ["Die Studien zeigen, dass mehrere Strategien zu hoher Leistung führen; das Zehnfingersystem ist kein Muss. [1][3]"],
    videos: [],
    videoNote: "Kein geprüftes Video eingebunden.",
    sources: [
      { title: "Feit, Weir & Oulasvirta 2016, CHI – How We Type: Movement Strategies and Performance in Everyday Typing (Aalto-Universität)", url: "https://userinterfaces.aalto.fi/how-we-type/", kind: "Studie" },
      { title: "Dhakal et al. 2018, CHI – Observations on Typing from 136 Million Keystrokes (Aalto-Universität)", url: "https://userinterfaces.aalto.fi/136Mkeystrokes/", kind: "Studie" },
      { title: "Pinet et al. 2022, Cogn Res Princ Implic – Typing expertise in a large student population", url: PM("35930064"), kind: "Studie" },
    ],
  },

  "Lauter rufen": {
    date: DATE,
    steckbrief: {
      about: "Kräftig rufen, ohne die Stimme zu schädigen. Zu Rufen speziell gibt es kaum Studien; belegt ist vor allem, dass hohe Stimmbelastung bei Berufen mit viel Sprechen häufig Probleme macht.",
      why: "Bei Lehrkräften sind Stimmstörungen weit verbreitet; hohe Stimmbelastung ist ein Risiko.",
      tips: "Ruf-Einheiten kurz halten, Pausen einlegen und bei Heiserkeit aufhören (Vorsichtsregel, keine Leitlinie).",
      safety: "Heiserkeit oder Schmerzen beim Rufen sind Warnzeichen; bei anhaltender Heiserkeit ärztlich abklären lassen (Vorsichtsregel).",
    },
    learn: [
      "Eine Meta-Analyse von 62 Studien mit 100.684 Lehrkräften fand eine gepoolte Punktprävalenz von Stimmstörungen von 37,7 %, über die Lebenszeit 63,1 %; sie variiert unter anderem mit Klassengröße und Berufserfahrung. [1]",
      "Musiklehrkräfte entwickeln etwa viermal häufiger Stimmprobleme als Klassenlehrkräfte; in einer Messung mit zwölf Personen nutzten sie ihre Stimme mit höherer Intensität und Dauer. [2]",
      "Stimmgesundheitsprogramme: Eine Meta-Analyse von 26 Studien (12 in der Auswertung) fand keinen Wirksamkeitsnachweis für direktes oder indirektes Stimmtraining zur Vorbeugung von Stimmstörungen bei Lehrkräften; keine Studie hatte ein niedriges Verzerrungsrisiko. [3]",
      "Einordnung: Studien zu Rufen oder Schreien als Technik wurden nicht gelesen; die Aussagen betreffen Berufssprecher, nicht Rufübungen.",
    ],
    evidence: { level: "kaum", why: "Belegt ist die Stimmbelastung bei Berufen mit viel Sprechen; Techniken zum lauteren Rufen sind nicht untersucht, und Stimmtraining zeigte in der Meta-Analyse keinen Wirksamkeitsnachweis." },
    steps: [
      "Aufrecht stehen, Schultern locker (Vorschlag).",
      "Kurze Rufe, dazwischen Pausen (Vorschlag).",
      "Bei Heiserkeit oder Kratzen sofort aufhören (Vorsichtsregel).",
      "Zwischen Einheiten ausreichend trinken (Vorschlag).",
    ],
    plan: [{ title: "Pro Einheit", text: "Wenige Rufe, danach Pause; Lautstärke langsam steigern, nicht in einem Tag (Vorschlag)." }],
    myths: [],
    mistakes: ["Zu lange am Stück rufen.", "Weitermachen trotz Heiserkeit."],
    safety: ["Stimmbelastung ist ein dokumentiertes Risiko für Stimmstörungen. [1][2]", "Bei anhaltender Heiserkeit ärztlich abklären lassen."],
    conflicts: ["Programme zur Stimmgesundheit zeigten in einer Meta-Analyse keinen Wirksamkeitsnachweis; die Studienqualität war niedrig. [3]"],
    videos: [],
    videoNote: "Kein geprüftes Video eingebunden.",
    sources: [
      { title: "Baghban et al. 2025, J Voice – The Worldwide Prevalence of Voice Disorders Among Schoolteachers: A Systematic Review and Meta-Analysis", url: PM("40360302"), kind: "Meta-Analyse" },
      { title: "Morrow & Connor 2011, J Voice – Comparison of voice-use profiles between elementary classroom and music teachers", url: PM("20359861"), kind: "Studie" },
      { title: "Ramos et al. 2025, J Voice – The Effectiveness of Vocal Health Programs in the Prevention of Voice Disorders in Teachers: A Systematic Review and Meta-Analysis", url: PM("36494244"), kind: "Meta-Analyse" },
    ],
  },

  "Schnell kochen": {
    date: DATE,
    steckbrief: {
      about: "Einfache Gerichte zügig zubereiten. Zu Tempo und Technik gibt es keine Studien; gut belegt ist die Lebensmittelhygiene, die auch beim schnellen Kochen gilt (BfR).",
      why: "Jährlich werden in Deutschland etwa 100.000 Erkrankungen gemeldet, die durch Mikroorganismen in Lebensmitteln verursacht worden sein können; die Dunkelziffer dürfte höher liegen.",
      tips: "Rohes Fleisch auf eigenem Brett, Hände nach rohem Fleisch sofort waschen, Fleisch im Kern mindestens 70 °C für mindestens zwei Minuten erhitzen. [1]",
      safety: "Rohe tierische Lebensmittel nicht mit Gegartem in Kontakt bringen. Für kleine Kinder, Schwangere und Menschen mit geschwächtem Immunsystem gelten zusätzliche Einschränkungen (z. B. kein rohes Hackfleisch). [1]",
    },
    learn: [
      "Das BfR nennt als Wege für Keime in die Küche: rohe Lebensmittel (Fleisch, Geflügel, Fisch, Eier, Obst, Gemüse, Kräuter), Menschen und Haustiere sowie Schädlinge. Zu vermeiden sei die Kreuzkontamination, also die Übertragung von Keimen von rohen auf andere Lebensmittel direkt oder über Hände, Geräte, Flächen und Messer. [1]",
      "Maßnahmen laut BfR: beim Umgang mit rohen und gegarten Lebensmitteln nie dieselben Küchenutensilien nutzen; für Fleisch und Geflügel ein Schneidbrett, für Obst und Gemüse ein anderes; Hände nach Kontakt mit rohen Lebensmitteln sofort gründlich waschen. [1]",
      "Erhitzen: Mit einem Fleischthermometer lässt sich prüfen, ob die notwendige Temperatur (mindestens 70 °C) für wenigstens zwei Minuten an allen Stellen der Speise erreicht wurde. [1]",
      "Kühlung: Kühlschranktemperatur maximal 7 °C (besser unter 5 °C); Fleisch, Geflügel und Fisch im untersten Fach; Reste gegarter Speisen im Kühlschrank aufbewahren und innerhalb von zwei bis drei Tagen verbrauchen. [1]",
      "Einordnung: Ob eine bestimmte Technik schneller oder besser ist, wurde nicht untersucht; hier steht nur der Hygienerahmen.",
    ],
    evidence: { level: "teilweise", why: "Hygiene ist durch die Behörde BfR belegt; zu Schnellkochtechniken gibt es keine Studien." },
    steps: [
      "Vor dem Kochen Hände waschen; Arbeitsfläche sauber halten (Vorschlag, nach [1]).",
      "Zutaten bereitlegen und alles Rohe getrennt vom Fertigen halten. [1]",
      "Für Fleisch und Geflügel ein eigenes Schneidbrett nutzen. [1]",
      "Fleisch durchgaren: im Kern mindestens 70 °C für mindestens zwei Minuten. [1]",
      "Reste kühl lagern und innerhalb von zwei bis drei Tagen essen. [1]",
    ],
    plan: [{ title: "Üben", text: "Ein Gericht mehrmals wiederholen und dabei Arbeitsschritte vorbereiten (Vorschlag)." }],
    myths: [],
    mistakes: ["Dasselbe Brett für rohes Fleisch und Gemüse.", "Fleisch nicht im Kern durcherhitzen.", "Kühlschrank zu warm."],
    safety: ["Hygieneregeln des BfR beachten. [1]", "Für empfindliche Gruppen (kleine Kinder, Schwangere, Immungeschwächte) gelten zusätzliche Einschränkungen, z. B. kein rohes Hackfleisch. [1]"],
    conflicts: [],
    videos: [],
    videoNote: "Kein geprüftes Video eingebunden.",
    sources: [
      { title: BFR_TITLE, url: BFR_URL, kind: "Behörde" },
    ],
  },

  "3 Restaurant-Gerichte": {
    date: DATE,
    steckbrief: {
      about: "Drei Gerichte auf hohem Niveau zubereiten. Zu „Restaurant-Niveau“ gibt es keine Studien; sicher zu kochen ist aber belegt: Die Hygieneregeln des BfR gelten auch hier.",
      why: "Anspruchsvolle Gerichte beinhalten oft rohe oder halbgare Zutaten; dafür nennt das BfR besondere Vorsicht bei empfindlichen Personen.",
      tips: "Pro Gericht Rezept und Ablauf vorab festlegen; Fleisch im Kern mindestens 70 °C für mindestens zwei Minuten, mit Thermometer prüfen. [1]",
      safety: "Speisen mit rohem Ei, rohes Hackfleisch, Räucherlachs und roher Fisch sind für kleine Kinder, Schwangere und Menschen mit geschwächtem Immunsystem nicht empfehlenswert, wenn sie nicht vollständig durchgegart sind. [1]",
    },
    learn: [
      "Das BfR nennt rohe vom Tier stammende Lebensmittel als besonders häufig mit Krankheitserregern belastet. Für kleine Kinder, Schwangere und Menschen mit geschwächtem Immunsystem sind unter anderem rohes Hackfleisch und rohe Fleischzuschnitte wie Carpaccio, Speisen mit rohem Ei, rohe Milch und roher Fisch nicht empfehlenswert, es sei denn, sie werden vollständig durchgegart. [1]",
      "Erhitzen: mindestens 70 °C für wenigstens zwei Minuten an allen Stellen; das Thermometer hilft bei der Kontrolle. [1]",
      "Rohe Eier können im Inneren oder auf der Schale Krankheitserreger enthalten; deshalb besondere Sorgfalt, Lagerung bei maximal 7 °C. [1]",
      "Einordnung: Die Qualität von Rezepten oder Techniken ist nicht Gegenstand von Studien; hier steht nur der Sicherheitsrahmen.",
    ],
    evidence: { level: "kaum", why: "Zu Rezepten und Technik gibt es keine Studien; belegt sind nur Hygiene- und Sicherheitsregeln der Behörde." },
    steps: [
      "Drei Gerichte wählen und Rezepte vorab durchlesen (Vorschlag).",
      "Zutaten und Garzeiten planen, rohe und fertige Teile getrennt halten. [1]",
      "Bei Fleisch die Kerntemperatur prüfen. [1]",
      "Jedes Gericht mehrfach kochen und notieren, was besser werden soll (Vorschlag).",
    ],
    plan: [{ title: "Pro Gericht", text: "Drei Durchgänge mit Notizen, dann das nächste Gericht (Vorschlag)." }],
    myths: [],
    mistakes: ["Rohe Zutaten ohne Rücksicht auf empfindliche Gäste servieren. [1]"],
    safety: ["BfR-Regeln zu rohen Zutaten und Erhitzen beachten. [1]"],
    conflicts: [],
    videos: [],
    videoNote: "Kein geprüftes Video eingebunden.",
    sources: [
      { title: BFR_TITLE, url: BFR_URL, kind: "Behörde" },
    ],
  },

  "Ei einhändig aufschlagen": {
    date: DATE,
    steckbrief: {
      about: "Ein Ei mit einer Hand aufschlagen. Zur Technik gibt es keine Studien („kaum belegt“); belegt sind Hygieneregeln für den Umgang mit rohen Eiern.",
      why: "Rohe Eier können Krankheitserreger enthalten; wer sie aufschlägt, sollte danach die Hände waschen.",
      tips: "Erst mit Eiern üben, die du ohnehin verbrauchst. Nach dem Aufschlagen Hände gründlich waschen. [1]",
      safety: "Eier mit stark verschmutzten oder defekten Schalen möglichst nicht für die Zubereitung verwenden. [1]",
    },
    learn: [
      "Nach dem BfR können rohe Eier im Inneren oder auf der Schale Krankheitserreger enthalten; deshalb ist beim Umgang mit rohen Eiern besondere hygienische Sorgfalt nötig. [1]",
      "Hinweise: Eier bei maximal 7 °C im Kühlschrank aufbewahren, um die Vermehrung von Salmonellen zu reduzieren; Angaben zur Mindesthaltbarkeit beachten; Hände nach Kontakt mit rohen Lebensmitteln sofort gründlich waschen. [1]",
      "Zur Technik des einhändigen Aufschlagens wurde keine Quelle gelesen.",
    ],
    evidence: { level: "kaum", why: "Keine Studien zur Technik; nur Hygieneregeln der Behörde." },
    steps: [
      "Hände waschen; Ei und Schüssel bereitstellen (Vorschlag).",
      "Mehrmals mit kleinen Mengen üben, bis der Ablauf sicher ist (Vorschlag).",
      "Schalenstücke aus der Schüssel entfernen (Vorschlag).",
      "Danach Hände gründlich waschen. [1]",
    ],
    plan: [{ title: "Üben", text: "Fünf Eier pro Einheit; Fortschritt am Anteil sauberer Versuche messen (Vorschlag)." }],
    myths: [],
    mistakes: ["Hände nach dem Aufschlagen nicht waschen. [1]"],
    safety: ["Hygieneregeln des BfR für rohe Eier. [1]"],
    conflicts: [],
    videos: [],
    videoNote: "Kein geprüftes Video eingebunden.",
    sources: [
      { title: BFR_TITLE, url: BFR_URL, kind: "Behörde" },
    ],
  },

  "Klavierstück": {
    date: DATE,
    steckbrief: {
      about: "Ein Klavierstück einstudieren. Zum Stückelernen am Klavier wurde keine passende Studie gelesen; allgemeine Lernforschung empfiehlt Üben mit Abständen und Abruf.",
      why: "Nach einer großen Übersicht gehören Abfragen und verteiltes Üben zu den Lerntechniken mit hoher Nützlichkeit.",
      tips: "Kurze Einheiten über mehrere Tage statt eines langen Blocks; Abschnitte aus dem Gedächtnis spielen (Vorschlag, abgeleitet aus [1][2]).",
      safety: "Bei Schmerzen in Händen, Armen oder Schultern pausieren und Technik prüfen lassen (Vorsichtsregel, keine Leitlinie).",
    },
    learn: [
      "Dunlosky et al. (2013) bewerteten Abfragen (practice testing) und verteiltes Üben als hoch nützlich, weil sie bei verschiedenen Altersgruppen und Aufgaben halfen; die Studien betreffen allerdings überwiegend Lernstoff, nicht Instrumentalspiel. [1]",
      "Eine Meta-Analyse zum verteilten Üben bei Wortabruf-Aufgaben fand, dass der beste Abstand mit der gewünschten Behaltensdauer wächst; die Übertragung auf Klavier ist eine Annahme. [2]",
      "Eine EEG-Studie mit zwei Anfängergruppen zeigte, dass bereits 20 Minuten Klavierlernen Anfängern Kopplungen zwischen Hören und Bewegen in der Hirnaktivität erzeugten, verstärkt nach fünf Wochen. [3]",
      "Einordnung: Zu Methoden des Stückelernens (z. B. langsames Üben) wurde keine Studie gelesen.",
    ],
    evidence: { level: "kaum", why: "Keine gelesene Studie zum Einüben von Klavierstücken; nur allgemeine Lernprinzipien und eine EEG-Studie." },
    steps: [
      "Stück in kleine Abschnitte teilen (Vorschlag).",
      "Jeden Abschnitt langsam üben und erst dann schneller werden (Vorschlag).",
      "An verschiedenen Tagen üben statt alles an einem. [1][2]",
      "Abschnitte ohne Noten testen, was schon sitzt. [1]",
    ],
    plan: [{ title: "Woche", text: "Vier bis fünf kurze Einheiten à 15–20 Minuten, nicht eine lange (Vorschlag)." }],
    myths: [],
    mistakes: ["Nur das ganze Stück von vorn bis hinten spielen (Vorschlag).", "Schwierige Stellen auslassen (Vorschlag)."],
    safety: ["Bei Schmerzen pausieren (Vorsichtsregel, keine Leitlinie)."],
    conflicts: ["Die Lernforschung stammt aus Gedächtnisaufgaben; Klavierspiel ist eine motorische Fertigkeit. [1][2]"],
    videos: [],
    videoNote: "Kein geprüftes Video eingebunden.",
    sources: [
      { title: "Dunlosky et al. 2013, Psychol Sci Public Interest – Improving students' learning with effective learning techniques", url: PM("26173288"), kind: "Übersichtsarbeit" },
      { title: "Cepeda et al. 2006, Psychol Bull – Distributed practice in verbal recall tasks", url: PM("16719566"), kind: "Meta-Analyse" },
      { title: "Bangert & Altenmüller 2003, BMC Neurosci – Mapping perception to action in piano practice: a longitudinal DC-EEG study", url: PM("14575529"), kind: "Studie" },
    ],
  },
};
