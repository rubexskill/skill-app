import type { Dossier } from "./dossiers";

// Kategorie „Kopf: Rechnen, Gedächtnis & Denken“, Teil 3. Recherchiert am 23. November 2026.
// Studien über PubMed/Crossref geprüft (Titel, Autoren, Abstract); Aussagen stehen nur, wenn sie im Abstract standen.
// Ausgelassen (keine tragfähigen Quellen gefunden): Große Zahlen multiplizieren, Trachtenberg-System, Karten zählen, Stundenplan merken,
// Elixier zählen, Natürliches Denken.
const DATE = "23. November 2026";
const PM = (id: string) => `https://pubmed.ncbi.nlm.nih.gov/${id}/`;

export const DOSSIERS_KOPF3: Record<string, Dossier> = {
  "Telefonnummer merken": {
    date: DATE,
    steckbrief: {
      about: "Eine Ziffernfolge im Kopf behalten, indem man sie in sinnvolle Gruppen (Chunks) zerlegt. Das Kurzzeitgedächtnis fasst nur wenige Einheiten, aber eine Einheit darf mehrere Ziffern enthalten.",
      why: "Nach einer Übersichtsarbeit liegt die Grenze bei durchschnittlich etwa vier Einheiten. In einer Studie mit Telefonnummern erreichten junge wie alte Erwachsene gute Ergebnisse, wenn die Nummer in Gruppen dargeboten wurde.",
      tips: "Die Nummer in Gruppen von zwei bis vier Ziffern zerlegen und jede Gruppe mit etwas Bekanntem verknüpfen (Jahreszahl, Alter, Hausnummer). (Vorschlag)",
      safety: "Keine Risiken. Sensible Nummern (PIN, Passwörter) nicht laut wiederholen oder aufschreiben, wo andere es sehen. (Vorsichtsregel, keine Leitlinie)",
    },
    learn: [
      "Miller (1956) fasste zusammen, dass Menschen etwa sieben Chunks im Kurzzeitgedächtnis behalten können; das war laut Cowan als grobe Schätzung gemeint, nicht als genaue Grenze. Cowan (2001) trug Daten zusammen, nach denen eine zentrale Kapazitätsgrenze von im Mittel etwa vier Chunks gilt, wenn Zusammenfassen und Wiederholen nicht möglich sind. [1]",
      "Ein Chunk ist eine Einheit, die schon im Langzeitgedächtnis verankert ist. Wer 1-9-8-9 als Jahreszahl erkennt, braucht dafür einen Platz statt vier. Diese Deutung folgt aus der Chunk-Definition in [1]; für Telefonnummern habe ich dazu keine eigene Messung gelesen.",
      "Eine Studie mit Telefonnummern (Erwachsene von 18 bis 85 Jahren): Bei 10-stelligen Nummern nahm das sofortige Erinnern mit dem Alter ab, bei 3-stelligen nicht; bei 7-stelligen schnitt die jüngste Gruppe besser ab als die älteste (70 bis 85). Wurden lokale Nummern in Gruppen dargeboten, erreichten Alt und Jung hohe Werte beim Erinnern in Reihenfolge. [2]",
    ],
    evidence: { level: "teilweise", why: "Die Kapazitätsgrenze und der Nutzen gruppierter Darbietung sind belegt; zum langfristigen Merken (Tage, Wochen) enthalten die gelesenen Abstracts nichts." },
    steps: [
      "Nummer in Gruppen zu zwei bis vier Ziffern teilen. (Vorschlag; Gruppierung nach [2])",
      "Jede Gruppe mit einer bekannten Zahl verbinden. (Vorschlag, abgeleitet aus [1])",
      "Nach einer Minute Pause aus dem Gedächtnis aufsagen; nach einer Stunde und am nächsten Tag erneut. (Vorschlag)",
    ],
    plan: [
      { title: "Woche 1", text: "Jeden Tag eine Nummer aus dem Alltag zerlegen und abends abrufen. (Vorschlag)" },
      { title: "Woche 2", text: "Längere Folgen (10 bis 12 Ziffern) mit denselben Gruppen üben. (Vorschlag)" },
    ],
    myths: [
      { myth: "Das Kurzzeitgedächtnis fasst genau sieben Dinge.", fact: "Miller meinte sieben als grobe Schätzung; Cowan fand im Mittel etwa vier Chunks. [1]" },
    ],
    mistakes: ["Ziffern einzeln aufsagen statt in Gruppen.", "Nur direkt nach dem Hören prüfen und nicht nach einer Pause. (Einordnung)"],
    safety: [],
    conflicts: ["Ob die Grenze bei vier oder sieben Einheiten liegt, hängt davon ab, was als Einheit gezählt wird; die Fachliteratur ist sich nicht einig. [1]"],
    videos: [
      { title: "Chunking: Learning Technique for Better Memory", id: "hydCdGLAh00", channel: "Sprouts", why: "Kurze Erklärung des Chunkings.", checked: true },
      { title: "Short Term Memory vs Working Memory | Learn Psychology in 5 Minutes", id: "9re3Fmd9OzY", channel: "Five Minute Learnings", why: "Einordnung von Kurzzeit- und Arbeitsgedächtnis.", checked: true },
    ],
    videoNote: "Zwei Videos; Inhalt nur nach Titel und Suchbeschreibung beurteilt, nicht angesehen.",
    sources: [
      { title: "Cowan 2001, Behavioral and Brain Sciences – The magical number 4 in short-term memory: a reconsideration of mental storage capacity", url: PM("11515286"), kind: "Übersichtsarbeit" },
      { title: "West & Crook 1990, Psychology and Aging – Age differences in everyday memory: laboratory analogues of telephone number recall", url: PM("2278675"), kind: "Studie" },
    ],
  },

  "Schweres einfach erklären": {
    date: DATE,
    steckbrief: {
      about: "Etwas Schwieriges lernen und es dann in einfachen Worten erklären (Feynman-Technik). Wo die Erklärung stockt, liegt die Lücke. Die Technik selbst ist kaum untersucht; verwandte Methoden wie Selbsterklärung schneiden mittelmäßig bis gut ab.",
      why: "In einer großen Übersichtsarbeit bekam Selbsterklärung eine mittlere Nützlichkeit: Die Wirkung gilt für einige Bedingungen, ist aber in Schulkontexten noch nicht ausreichend geprüft.",
      tips: "Laut aufschreiben oder aussprechen, ohne Fachwörter, wie für jemanden ohne Vorwissen. Jede Stelle, an der man ins Stocken gerät, im Material nachschlagen. (Vorschlag)",
      safety: "Keine Risiken. (Vorsichtsregel, keine Leitlinie)",
    },
    learn: [
      "Die Feynman-Technik ist eine populäre Lernmethode: lernen, erklären, Lücken finden, vereinfachen. Eine eigene Studie zur Technik unter diesem Namen habe ich nicht gefunden; die folgenden Befunde betreffen verwandte Methoden.",
      "Dunlosky et al. (2013) bewerteten zehn Lerntechniken. Üben durch Abfragen und verteiltes Üben erhielten eine hohe Nützlichkeit. Elaboratives Nachfragen, Selbsterklärung und gemischtes Üben erhielten eine mittlere: Die Vorteile übertragen sich auf einige Bedingungen, aber die Belege reichen nicht für die Bestnote, unter anderem weil Selbsterklärung in Bildungskontexten nicht ausreichend untersucht ist. [1]",
      "Zum Lehren selbst: In einer Studie mit 137 Personen (2026) sollten zwei Gruppen anderen Maßnahmen gegen digitalen Stress beibringen (Protégé-Ansatz). Ihr eigener Stress sank nicht stärker als in den Kontrollgruppen. Die Studie prüfte Verhaltensänderung, nicht Lernerfolg; sie widerlegt den Protégé-Effekt für das Lernen also nicht, zeigt aber, dass er sich nicht automatisch auf Verhalten überträgt. [2]",
    ],
    evidence: { level: "teilweise", why: "Für Selbsterklärung gibt es eine mittlere Bewertung in einer Übersichtsarbeit; die Feynman-Technik als Ganzes und der Protégé-Effekt für Lernleistung stehen nicht in den gelesenen Abstracts." },
    steps: [
      "Thema wählen und zuerst aus guten Quellen lernen. (Vorschlag)",
      "Das Thema in einfachen Worten erklären, ohne ins Material zu schauen. (Vorschlag)",
      "Stockende Stellen markieren und gezielt nachlesen. (Vorschlag)",
      "Erneut kürzer und einfacher erklären; zum Schluss sich selbst abfragen, was Dunlosky et al. als stark einstufen. (Vorschlag, gestützt durch [1])",
    ],
    plan: [
      { title: "Woche 1–2", text: "Pro Woche ein kleines Thema (eine Seite) erklären und Lücken notieren. (Vorschlag)" },
      { title: "Woche 3–4", text: "Dieselben Themen nach einigen Tagen aus dem Gedächtnis wiederholen, verteilt statt am Stück. (Vorschlag, nach [1])" },
    ],
    myths: [
      { myth: "Erklären allein reicht als Lernmethode.", fact: "Selbsterklärung gilt nur als mittel nützlich; Abfragen und verteiltes Üben schnitten besser ab. [1]" },
    ],
    mistakes: ["Fachwörter benutzen, ohne sie zu verstehen.", "Nach dem Erklären nicht mehr prüfen, ob die Lücken geschlossen sind. (Einordnung)"],
    safety: [],
    conflicts: ["Ob Lehren den eigenen Lernerfolg messbar steigert, ist in den gelesenen Quellen nicht abschließend belegt; die Studie zum Protégé-Ansatz fand für Verhalten keinen Effekt. [2]"],
    videos: [
      { title: "How to Learn Faster with the Feynman Technique (Example Included)", id: "_f-qkGJBPts", channel: "Thomas Frank", why: "Ablauf der Technik mit Beispiel.", checked: true },
      { title: "The Feynman Technique EXPLAINED: how to learn anything in 4 simple steps", id: "eYfn4bZpnik", channel: "Arata Academy ENGLISH", why: "Die vier Schritte kurz erklärt.", checked: true },
    ],
    videoNote: "Zwei Videos von Lernratgeber-Kanälen, keine wissenschaftlichen Quellen; Inhalt nur nach Titel und Suchbeschreibung beurteilt.",
    sources: [
      { title: "Dunlosky et al. 2013, Psychological Science in the Public Interest – Improving Students' Learning With Effective Learning Techniques", url: PM("26173288"), kind: "Übersichtsarbeit" },
      { title: "AlShakhsi et al. 2026, Annals of the New York Academy of Sciences – Protégé Effect for Behavior Change: Does Teaching Digital Stress Solutions to Others Reduce One's Own?", url: PM("42599363"), kind: "Studie" },
    ],
  },

  "Eigene Meinung prüfen": {
    date: DATE,
    steckbrief: {
      about: "Die eigene Überzeugung aufschreiben und dann bewusst nach Gründen suchen, die dagegen sprechen. Die Forschung nennt das Gegenteil-Betrachten (consider the opposite). Debiasing wirkt oft, aber nicht immer.",
      why: "Eine Übersichtsarbeit zu 87 Studien fand, dass die Mehrzahl der Debiasing-Maßnahmen zumindest teilweise erfolgreich war. In einer Studie mit nationalen Risikoanalysten senkte eine einmalige Schulung die Bestätigungsneigung.",
      tips: "Eine Aussage formulieren, dann drei stärkste Gegenargumente suchen und beurteilen, was sich ändern würde, wenn sie stimmen. (Vorschlag)",
      safety: "Keine Risiken. Keine Verpflichtung, die Meinung zu ändern. (Vorsichtsregel, keine Leitlinie)",
    },
    learn: [
      "Eine systematische Übersicht (68 Artikel, 87 Studien) zu Debiasing bei gesundheitsbezogenen Urteilen: Die meisten Maßnahmen (60) waren zumindest teilweise erfolgreich. Getestet wurden vor allem kognitive Strategien wie „Gegenteil betrachten“ (36) und technische Hilfen wie Grafiken (33). Die Studienqualität schwankte zwischen 26,2 und 92,9 %. [1]",
      "In einem Experiment mit nationalen Risikoanalysten und Masterstudierenden senkte eine einmalige Debiasing-Schulung die Bestätigungsneigung (confirmation bias) in beiden Gruppen; die Analysten zeigten schon vorher weniger davon als die Studierenden. [2]",
      "Nicht jede Variante wirkt: Bei Anästhesie-Assistenzärzten änderte „Gegenteil betrachten“ die Genauigkeit der Selbsteinschätzung bei technischen Fähigkeiten nicht; bei Kommunikation/Führung verbesserte sie sich um 5,63 %, erreichte aber die vorab festgelegte Schwelle für Bedeutsamkeit nicht. [3]",
    ],
    evidence: { level: "teilweise", why: "Mehrere Studien zeigen Wirkung, die Übersichtsarbeit nennt die Methodenqualität als schwankend; Messungen in Alltagsentscheidungen fehlen." },
    steps: [
      "Meinung und Begründung in einem Satz aufschreiben. (Vorschlag)",
      "Drei Gründe suchen, die dagegen sprechen, am besten aus Quellen der Gegenseite. (Vorschlag; Gegenteil-Betrachten nach [1])",
      "Aufschreiben, wie sicher man sich jetzt ist, und später mit dem Ausgangswert vergleichen. (Vorschlag)",
    ],
    plan: [
      { title: "Woche 1–2", text: "Pro Woche eine Alltagsmeinung prüfen (z. B. Kauf, Ernährung). (Vorschlag)" },
      { title: "Woche 3–4", text: "Eine wichtige Überzeugung mit der stärksten Gegenposition prüfen und das Ergebnis notieren. (Vorschlag)" },
    ],
    myths: [
      { myth: "Man kann sich Denkfehler nicht abtrainieren.", fact: "Die meisten untersuchten Debiasing-Maßnahmen waren zumindest teilweise erfolgreich; Wirkung und Qualität schwanken aber. [1]" },
    ],
    mistakes: ["Nur Gegenargumente suchen, die leicht zu widerlegen sind. (Einordnung)", "Erwarten, dass eine einmalige Übung dauerhaft wirkt; die Studien messen kurzfristig. [2][3]"],
    safety: [],
    conflicts: ["Die Ergebnisse sind uneinheitlich: Die Schulung bei Risikoanalysten wirkte [2], das Gegenteil-Betrachten bei Assistenzärzten erreichte keine bedeutsame Verbesserung [3]."],
    videos: [
      { title: "Confirmation Bias", id: "XNmq0rBQtoQ", channel: "Matt McCormick, Professor in Philosophy, CSUS", why: "Vorlesung eines Philosophieprofessors zur Bestätigungsneigung.", checked: true },
    ],
    videoNote: "Nur ein Video gefunden; Inhalt nur nach Titel und Suchbeschreibung beurteilt.",
    sources: [
      { title: "Ludolph & Schulz 2018, Medical Decision Making – Debiasing Health-Related Judgments and Decision Making: A Systematic Review", url: PM("28649904"), kind: "Systematische Übersicht" },
      { title: "Heerma van Voss et al. 2025, Scientific Reports – Debiasing training reduces confirmation bias in national risk analysts", url: PM("41286330"), kind: "Studie" },
      { title: "Matern et al. 2025, A&A Practice – Consider-the-Opposite Debiasing to Improve Self-Assessment Accuracy in Anesthesiology Trainees", url: PM("39791597"), kind: "Studie" },
    ],
  },

  "Flow Maps": {
    date: DATE,
    steckbrief: {
      about: "Gedanken als Knoten und Verbindungen auf Papier ordnen (Concept Map, Mind Map). Studien zeigen im Mittel bessere Behaltensleistung als beim Vergleichslernen, aber stark schwankend.",
      why: "Eine Metaanalyse aus 55 Studien mit 5 818 Teilnehmenden verband Concept Maps mit besserem Behalten; die Effekte reichten von klein bis groß, je nachdem, wie die Karten genutzt wurden.",
      tips: "Begriffe als Knoten, Beziehungen als beschriftete Linien: „führt zu“, „besteht aus“. Selbst zeichnen statt nur anschauen. (Vorschlag)",
      safety: "Keine Risiken. (Vorsichtsregel, keine Leitlinie)",
    },
    learn: [
      "Eine Metaanalyse (67 Effektstärken aus 55 Studien, 5 818 Teilnehmende, ab Klasse 4 bis Hochschule) untersuchte Lernen durch Erstellen, Verändern oder Betrachten von Knoten-Kanten-Diagrammen. Die Verwendung von Concept Maps ging mit besserem Behalten einher; die mittlere Effektstärke reichte je nach Nutzung und Vergleichsbedingung von klein bis groß, und die Heterogenität war meist erheblich. [1]",
      "Eine Metaanalyse von 52 randomisierten Studien (3 312 Teilnehmende) aus der ärztlichen Weiterbildung in China fand höhere Prüfungswerte mit Mind Mapping als mit Vorlesung (z. B. Theoriewissen SMD = 1,45). Die Qualität der Belege wurde aber nach GRADE als sehr niedrig bewertet; 98 % der Studien hatten weder verdeckte Zuteilung noch Verblindung. [2]",
    ],
    evidence: { level: "teilweise", why: "Concept Maps zeigen in einer Metaanalyse Vorteile, aber mit hoher Heterogenität; die neuere Metaanalyse zu Mind Mapping stuft die Evidenz selbst als sehr niedrig ein." },
    steps: [
      "Zentrales Thema in die Mitte oder oben schreiben. (Vorschlag)",
      "Hauptbegriffe sammeln und als Knoten anordnen. (Vorschlag)",
      "Beziehungen mit beschrifteten Linien einzeichnen. (Vorschlag)",
      "Nach einem Tag die Karte aus dem Gedächtnis neu zeichnen. (Vorschlag)",
    ],
    plan: [
      { title: "Woche 1–2", text: "Pro Woche ein Kapitel oder Thema als Karte darstellen. (Vorschlag)" },
      { title: "Woche 3–4", text: "Karten aus dem Gedächtnis nachzeichnen und mit dem Original vergleichen. (Vorschlag)" },
    ],
    myths: [
      { myth: "Mind Maps sind die beste Lernmethode.", fact: "Die Metaanalyse zu Concept Maps zeigt Vorteile, aber die Effekte hängen davon ab, wie sie genutzt werden und womit verglichen wird. [1]" },
    ],
    mistakes: ["Karten nur abzeichnen, statt selbst Beziehungen zu überlegen. (Einordnung)", "Beziehungen nicht beschriften."],
    safety: [],
    conflicts: ["Die Metaanalysen unterscheiden Concept Maps und Mind Maps nicht sauber; die Studie zu Mind Mapping hat sehr niedrige Beweissicherheit und hohe Heterogenität. [1][2]"],
    videos: [
      { title: "How to Create a Concept Map", id: "sZJj6DwCqSU", channel: "U of G Library", why: "Anleitung einer Universitätsbibliothek.", checked: true },
      { title: "Creating a concept map", id: "AsqDWWBji5Q", channel: "QUT Library", why: "Beispiel mit zentralem Thema und Unterbegriffen.", checked: true },
      { title: "Concept Maps - A Visual Study Tool", id: "vuBLI6ijHHg", channel: "nool - Ontario Tech University", why: "Lernzentrum-Video zur Nutzung beim Lernen.", checked: true },
    ],
    videoNote: "Inhalt nur nach Titel und Suchbeschreibung beurteilt, nicht angesehen.",
    sources: [
      { title: "Nesbit & Adesope 2006, Review of Educational Research – Learning With Concept and Knowledge Maps: A Meta-Analysis", url: "https://doi.org/10.3102/00346543076003413", kind: "Metaanalyse" },
      { title: "Dai et al. 2026, Frontiers in Medicine – The effectiveness of mind mapping versus lecture-based learning in medical education of China's standardized residency training", url: PM("42164152"), kind: "Metaanalyse" },
    ],
  },

  "Strategiespiele": {
    date: DATE,
    steckbrief: {
      about: "Brettspiele wie Schach, Go oder Dame, bei denen man vorausdenkt und Pläne vergleicht. Sie machen Spaß und trainieren das Spiel selbst; dass sie allgemein klüger machen, ist laut Metaanalysen kaum belegt.",
      why: "Eine Auswertung dreier Metaanalysen fand kleine bis mittlere Effekte von Schach-Training, die umso kleiner wurden, je besser das Studiendesign war (z. B. mit aktiver Kontrollgruppe).",
      tips: "Spielen, weil es Freude macht. Wer Ergebnisse im Kopf erwartet, sollte wissen, dass sich Fähigkeiten selten auf andere Gebiete übertragen. (Einordnung nach [1])",
      safety: "Keine Risiken; bei Glücksspiel um Geld gelten andere Regeln. (Vorsichtsregel, keine Leitlinie)",
    },
    learn: [
      "Schachmeister und Musiker sind im Mittel intelligenter als die Allgemeinbevölkerung; daraus wurde abgeleitet, dass Schach Kindern kognitiv helfe. Sala & Gobet fassten Metaanalysen zu Schach, Musik und Arbeitsgedächtnistraining zusammen: kleine bis mittlere Effekte, aber umgekehrt proportional zur Qualität des Studiendesigns. Die Autoren sehen die Wirksamkeit damit infrage gestellt und folgern, dass Fernübertragung selten auftritt. [1]",
      "Zwei Experimente mit aktiver und passiver Kontrollgruppe (N = 233 und N = 52; 25 Stunden Schachunterricht in der ersten): Es gab keine statistisch bedeutsamen Unterschiede bei mathematischem Problemlösen oder Metakognition. Die Autoren schließen, dass Effekte von Schach-Unterricht, wenn überhaupt, bei strenger Prüfung gering sind und der Mathematikunterricht dadurch nicht ersetzt werden sollte. [2]",
      "Offen bleibt der Nutzen für Erwachsene, für andere Strategiespiele und für Dinge außerhalb von Mathematik und Lesen; dazu habe ich keine kontrollierten Studien gelesen.",
    ],
    evidence: { level: "kaum", why: "Für allgemeinen kognitiven Nutzen sprechen vor allem Studien mit schwachem Design; in Studien mit aktiver Kontrollgruppe zeigte sich kein bedeutsamer Vorteil." },
    steps: [
      "Spiel wählen, das Spaß macht, und regelmäßig gegen jemanden spielen. (Vorschlag)",
      "Nach einer Partie ein oder zwei Fehler suchen, statt nur das Ergebnis zu sehen. (Vorschlag)",
      "Taktikaufgaben ergänzen, wenn man in dem Spiel besser werden will. (Vorschlag)",
    ],
    plan: [
      { title: "Woche 1–2", text: "Dreimal pro Woche eine Partie, danach kurze Fehleranalyse. (Vorschlag)" },
      { title: "Woche 3–4", text: "Eine Eröffnung oder Strategie gezielt üben. (Vorschlag)" },
    ],
    myths: [
      { myth: "Schach macht Kinder klüger und besser in Mathe.", fact: "Studien mit schwachem Design zeigten Vorteile; in Experimenten mit aktiver Kontrollgruppe gab es keinen bedeutsamen Unterschied. [1][2]" },
    ],
    mistakes: ["Auf allgemeine Denkgewinne hoffen und deshalb den Spaß verlieren. (Einordnung)", "Nur spielen, ohne eigene Partien zu analysieren. (Einordnung)"],
    safety: [],
    conflicts: ["Eine ältere Metaanalyse fand einen Vorteil von Schachunterricht für Mathematik; die Autoren selbst wiesen darauf hin, dass die meisten Studien keine aktive Kontrollgruppe hatten. [2]"],
    videos: [
      { title: "ChessCenter: Does Chess Make You Smarter?", id: "1cXIJMIFnJ8", channel: "Chess.com", why: "Videoformat zur Frage, ob Schach klüger macht.", checked: true },
    ],
    videoNote: "Nur ein Video; Inhalt nur nach Titel beurteilt, nicht angesehen.",
    sources: [
      { title: "Sala & Gobet 2017, Current Directions in Psychological Science – Does Far Transfer Exist? Negative Evidence From Chess, Music, and Working Memory Training", url: PM("29276344"), kind: "Metaanalysen" },
      { title: "Sala & Gobet 2017, Learning & Behavior – Does chess instruction improve mathematical problem-solving ability? Two experimental studies with an active control group", url: PM("28646322"), kind: "Studie" },
    ],
  },
};
