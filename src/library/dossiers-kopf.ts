import type { Dossier } from "./dossiers";

// Kategorie „Kopf: Rechnen, Gedächtnis & Denken“ (Wochentag berechnen steht in dossiers.ts).
// Recherchiert am 23. November 2026. Studien über PubMed geprüft (Titel, Autoren, Abstract); Aussagen stehen nur, wenn sie im Abstract oder auf der verlinkten Seite stehen.
// Nicht bearbeitet (keine ausreichend geprüften Quellen in dieser Sitzung): Kopfrechnen, Große Zahlen multiplizieren, Trachtenberg-System, Morsecode, Fotografisches Gedächtnis, Karten zählen,
// Telefonnummer merken, Stundenplan merken, Elixier zählen, Schweres einfach erklären, Eigene Meinung prüfen, Metakognition, Natürliches Denken, Logisches Denken, Flow Maps, Recherchieren mit KI, Strategiespiele.
const DATE = "23. November 2026";
const PM = (id: string) => `https://pubmed.ncbi.nlm.nih.gov/${id}/`;

export const DOSSIERS_KOPF: Record<string, Dossier> = {
  "Lernmethoden": {
    date: DATE,
    steckbrief: {
      about: "Welche Lerntechniken wirklich helfen. Gut belegt sind Selbsttesten (Abrufen aus dem Gedächtnis) und zeitlich verteiltes Lernen; Wiederlesen fühlt sich wirksam an, ist es auf Dauer aber weniger.",
      why: "In einer Studie behielten Studierende nach 2 Tagen und 1 Woche mehr, wenn sie sich testeten, statt den Text nochmals zu lesen, obwohl Wiederlesen ihr Selbstvertrauen stärker erhöhte.",
      tips: "Nach dem Lesen aus dem Kopf aufschreiben, was man behalten hat, und die Wiederholungen auf mehrere Tage verteilen.",
      safety: "Keine Risiken. Wer Prüfungsangst hat, übt zuerst ohne Notendruck. (Vorsichtsregel, keine Leitlinie)",
    },
    learn: [
      "Roediger und Karpicke (2006): Studierende lasen Texte und machten entweder ein oder drei freie Abruftests ohne Rückmeldung oder lasen den Text erneut. Bei einem Abschlusstest nach 5 Minuten schnitt das Wiederlesen besser ab. Nach 2 Tagen und nach 1 Woche brachte das vorherige Testen deutlich mehr Behalten, obwohl wiederholtes Lernen das Vertrauen in das eigene Behalten stärker erhöhte. [1]",
      "Cepeda et al. (2006) werteten 839 Vergleiche aus 317 Experimenten in 184 Artikeln aus. Der Abstand zwischen Lerneinheiten, der das Behalten maximiert, wuchs mit der Zeit bis zum Abschlusstest. [2]",
      "Dunlosky et al. (2013) bewerteten zehn Lerntechniken: Elaboration, Selbsterklärung, Zusammenfassen, Markieren, Merkwort-Mnemotechnik, bildhaftes Lernen, Wiederlesen, Selbsttest, verteiltes Üben und Mischen. Die Abstract-Zusammenfassung nennt keine Rangfolge; die Bewertungen im Volltext habe ich nicht gelesen. [3]",
    ],
    evidence: {
      level: "gut",
      why: "Testing-Effekt und Verteilungseffekt sind durch viele Experimente belegt; die Übertragung auf jedes Fach und jeden Lerntyp ist nicht gesichert.",
    },
    steps: [
      "Stoff lesen oder hören.",
      "Buch zu, aufschreiben, was man erinnert (freier Abruf). [1]",
      "Fehlendes nachschlagen und markieren, was fehlte. (Vorschlag)",
      "Dieselbe Übung nach einem Tag, dann nach einigen Tagen wiederholen. [2] (genaue Abstände: Vorschlag)",
    ],
    plan: [
      { title: "Woche 1", text: "Nach jeder Lerneinheit 5 Minuten freier Abruf. [1]" },
      { title: "Woche 2–4", text: "Abstände zwischen den Wiederholungen allmählich vergrößern; je länger das Ziel entfernt ist, desto größer der Abstand. [2]" },
    ],
    myths: [
      { myth: "Wiederlesen ist die beste Methode.", fact: "Nach 5 Minuten half Wiederlesen mehr; nach 2 Tagen und 1 Woche war Testen deutlich besser. [1]" },
      { myth: "Wenn es sich sicher anfühlt, ist es gelernt.", fact: "Wiederholtes Lernen erhöhte das Vertrauen, ohne dass es nach einer Woche mehr Behalten brachte. [1]" },
    ],
    mistakes: ["Nur wiederlesen.", "Alles am Abend vor der Prüfung lernen. (Einordnung zum Verteilungseffekt [2])"],
    safety: [],
    conflicts: ["Die optimale Verteilung hängt davon ab, wann man später abgefragt wird; es gibt keinen festen besten Abstand. [2]"],
    videos: [
      { title: "Using Quizzes to Combine Retrieval and Spaced Practice", id: "VpUgW76M6pU", channel: "Elon TLT", why: "Erklärung von Abruf und Verteilung aus einem Lehrzentrum.", checked: true },
    ],
    videoNote: "Nur ein Video; Inhalt nur nach Titel beurteilt.",
    sources: [
      { title: "Roediger & Karpicke 2006, Psychol Sci – Test-enhanced learning: taking memory tests improves long-term retention", url: PM("16507066"), kind: "Studie" },
      { title: "Cepeda et al. 2006, Psychol Bull – Distributed practice in verbal recall tasks: a review and quantitative synthesis", url: PM("16719566"), kind: "Metaanalyse" },
      { title: "Dunlosky et al. 2013, Psychol Sci Public Interest – Improving Students' Learning With Effective Learning Techniques", url: PM("26173288"), kind: "Übersichtsarbeit" },
    ],
  },

  "Schnell lernen": {
    date: DATE,
    steckbrief: {
      about: "Schneller lernen heißt vor allem: wirksamer lernen. Gut belegt sind Selbsttesten und verteiltes Üben.",
      why: "Mit Abruftests behielten Studierende mehr als mit Wiederlesen, sobald der Abstand zum Test Tage betrug.",
      tips: "Aktiv abrufen statt nochmals lesen; Lerneinheiten über Tage verteilen.",
      safety: "Keine Risiken. Bei Dauerstress und Schlafmangel lernt man schlechter (Einordnung, siehe Schlaf & Ernährung).",
    },
    learn: [
      "Beim Testen statt Wiederlesen war das Behalten nach 2 Tagen und 1 Woche deutlich besser (Roediger & Karpicke 2006). [1]",
      "Das Verteilen von Lerneinheiten über die Zeit verbessert das Behalten; der beste Abstand wächst mit der Zeit bis zum Test (Cepeda et al. 2006). [2]",
      "Eine Abkürzung ohne Aufwand fand ich nicht: Was länger hängen bleibt, kostet beim Üben mehr Anstrengung. (Einordnung)",
    ],
    evidence: { level: "gut", why: "Zwei große, wiederholte Befunde der Lernpsychologie." },
    steps: ["Stoff in kleine Teile gliedern. (Vorschlag)", "Jeden Teil selbst abfragen. [1]", "Die Abfrage an späteren Tagen wiederholen. [2]"],
    plan: [{ title: "Woche 1–4", text: "Täglich 20 Minuten: erst abfragen, dann nachschlagen; Abstände vergrößern. [1][2] (Dauer: Vorschlag)" }],
    myths: [{ myth: "Es gibt einen Trick, der alles in Minuten lernen lässt.", fact: "Belegt sind Abruf und Verteilung, nicht Abkürzungen ohne Übung. [1][2]" }],
    mistakes: ["Nur wiederlesen.", "Alles in eine lange Sitzung packen."],
    safety: [],
    conflicts: ["Der beste Abstand hängt vom späteren Testzeitpunkt ab. [2]"],
    videos: [],
    videoNote: "Siehe Lernmethoden für ein Video.",
    sources: [
      { title: "Roediger & Karpicke 2006, Psychol Sci – Test-enhanced learning", url: PM("16507066"), kind: "Studie" },
      { title: "Cepeda et al. 2006, Psychol Bull – Distributed practice in verbal recall tasks", url: PM("16719566"), kind: "Metaanalyse" },
    ],
  },

  "Gedächtnispalast": {
    date: DATE,
    steckbrief: {
      about: "Mnemotechnik (Loci-Methode): Dinge in Gedanken an Stationen eines bekannten Wegs legen und diesen später ablaufen.",
      why: "In einer Studie veränderte sich nach 6 Wochen Mnemotechnik-Training die Vernetzung des Gehirns bei Kontrollpersonen so, dass sie der von Gedächtnis-Athleten ähnelte; die Ähnlichkeit sagte Verbesserungen bis 4 Monate später voraus.",
      tips: "Einen sehr vertrauten Weg wählen, Bilder auffällig und lebendig machen, Reihenfolge wiederholen. (Vorschlag)",
      safety: "Keine Risiken. Dass es für Alltagswissen besser als Lernen mit Selbsttest ist, ist nicht belegt.",
    },
    learn: [
      "Dresler et al. (2017) untersuchten 23 der weltbesten Gedächtnis-Athleten und Kontrollpersonen per fMRT. Bei Kontrollen, die 6 Wochen Mnemotechnik trainierten, entsprachen die Veränderungen der Netzwerkorganisation dem, was Athleten von Kontrollen unterscheidet; die Ähnlichkeit sagte Verbesserungen bis 4 Monate nach dem Training voraus. [1]",
      "Die Autoren schließen, Training verändere verteilte statt regionale Netzwerke im Gehirn. [1]",
      "Zur Methode selbst, wie sie Athleten benutzen, stand im gelesenen Abstract nichts; die Anleitung unten ist ein Vorschlag, kein Studienergebnis.",
    ],
    evidence: { level: "teilweise", why: "Eine Studie zeigt Trainingseffekte und Hirnveränderungen; Nutzen für Alltag und Schule ist daraus nicht abgeleitet." },
    steps: ["Einen bekannten Weg (Wohnung) wählen und 10 Stationen festlegen. (Vorschlag)", "Jede Information als auffälliges Bild an eine Station legen. (Vorschlag)", "Den Weg in Gedanken ablaufen und abrufen. (Vorschlag)"],
    plan: [{ title: "Woche 1–6", text: "Die Studie trainierte 6 Wochen; wie oft und wie lange täglich, steht im Abstract nicht. [1] Täglich 15 Minuten ist ein Vorschlag." }],
    myths: [{ myth: "Gedächtnis-Athleten haben besondere Gehirne.", fact: "Die Studie fand bei Kontrollen nach 6 Wochen Training ähnliche Netzwerkmuster wie bei den Athleten. [1]" }],
    mistakes: ["Zu viele Informationen pro Station.", "Unbekannte Wege nutzen."],
    safety: [],
    conflicts: ["Die Hirnbefunde belegen nicht, dass Training im Alltag besser behalten lässt. [1]"],
    videos: [
      { title: "Mind Palaces: The Science and Skill of the Method of Loci", id: "Xf4hlXxUZ2U", channel: "Intellectually Curious Podcast", why: "Erklärung der Methode.", checked: true },
      { title: "Constructing a Memory Palace - Epic Science #27", id: "6JnDBYf9odc", channel: "Stuff to Blow Your Mind", why: "Aufbau eines Palastes.", checked: true },
    ],
    videoNote: "Beide Videos nur nach Titel beurteilt.",
    sources: [
      { title: "Dresler et al. 2017, Neuron – Mnemonic Training Reshapes Brain Networks to Support Superior Memory", url: PM("28279356"), kind: "Studie" },
    ],
  },

  "Kartendeck merken": {
    date: DATE,
    steckbrief: {
      about: "Ein Kartenspiel in Reihenfolge einprägen, meist mit Gedächtnispalast-Techniken.",
      why: "Mnemotechnik-Training veränderte in einer Studie die Hirnvernetzung; zu Kartendecks im Speziellen habe ich keine Studie gelesen.",
      tips: "Siehe Gedächtnispalast: Karten in Bilder verwandeln und an Stationen ablegen. (Vorschlag)",
      safety: "Keine Risiken.",
    },
    learn: [
      "Die Studie von Dresler et al. (2017) untersuchte Mnemotechnik-Training und Gedächtnis-Athleten. Zu Karten steht im gelesenen Abstract nichts. [1]",
      "Alles Weitere ist Anleitung nach der Methode, kein Studienergebnis.",
    ],
    evidence: { level: "kaum", why: "Keine gelesene Studie zu Kartendecks; nur allgemeine Befunde zum Mnemotechnik-Training." },
    steps: ["Jede der 52 Karten fest mit einem Bild verbinden. (Vorschlag)", "Jeweils zwei bis drei Karten pro Station. (Vorschlag)", "Den Weg ablaufen, Karte für Karte abrufen. (Vorschlag)"],
    plan: [{ title: "Hinweis", text: "Ein belegter Übungsplan liegt nicht vor." }],
    myths: [],
    mistakes: ["Zu schnell zu viele Karten."],
    safety: [],
    conflicts: [],
    videos: [],
    videoNote: "Kein geprüftes Video.",
    sources: [
      { title: "Dresler et al. 2017, Neuron – Mnemonic Training Reshapes Brain Networks to Support Superior Memory", url: PM("28279356"), kind: "Studie" },
    ],
  },

  "Schneller lesen": {
    date: DATE,
    steckbrief: {
      about: "Schnelllesen verspricht höheres Lesetempo ohne Verständnisverlust. Die Übersichtsarbeit zeigt: Es gibt einen Kompromiss zwischen Tempo und Genauigkeit.",
      why: "Man kann überfliegen und bekommt dann nur mäßiges Verständnis; was beim Lesen wirklich schneller macht, ist Übung im Lesen und ein größerer Wortschatz.",
      tips: "Viel lesen, Wortschatz erweitern; Überfliegen bewusst nur einsetzen, wenn mäßiges Verständnis reicht.",
      safety: "Keine Risiken.",
    },
    learn: [
      "Rayner und Schotter (2016) werteten aus, was die Forschung über das Lesen weiß, und prüften Schnelllese-Programme und -Apps. Es gibt einen Zielkonflikt zwischen Geschwindigkeit und Genauigkeit. [1]",
      "Es ist unwahrscheinlich, dass Lesende ihr Tempo verdoppeln oder verdreifachen können, ohne dass das Verständnis leidet. [1]",
      "Wenn gründliches Verständnis nicht das Ziel ist, erlaubt Überfliegen schnelleres Durchkommen bei mäßigem Verständnis. [1]",
      "Um Verständnis zu halten und schneller zu werden, hilft Übung im Lesen und höhere Sprachkompetenz (z. B. Wortschatz). [1]",
    ],
    evidence: { level: "gut", why: "Eine umfassende Übersichtsarbeit der Leseforschung kommt zu diesem Ergebnis." },
    steps: ["Täglich Texte auf angenehmem Niveau lesen. (Vorschlag)", "Neue Wörter notieren und wiederholen. [1]", "Überfliegen nur für Texte, die man grob verstehen will. [1]"],
    plan: [{ title: "Woche 1–4", text: "Täglich 20 Minuten Lesen, dazu Wortschatz. [1] (Dauer: Vorschlag)" }],
    myths: [
      { myth: "Man kann seine Lesegeschwindigkeit verdreifachen und alles verstehen.", fact: "Die Übersichtsarbeit hält das für unwahrscheinlich. [1]" },
      { myth: "Schnelllese-Apps lösen das Problem.", fact: "Die Autoren prüften auch Apps; den Gewinn für Verständnis belegen sie nicht. [1]" },
    ],
    mistakes: ["Tempo über Verständnis stellen."],
    safety: [],
    conflicts: ["Je nach Ziel (Überfliegen oder Verstehen) ist schnelles Lesen sinnvoll oder nicht. [1]"],
    videos: [
      { title: "What Speed Readers Won't Tell You", id: "D2aZ3THL8BQ", channel: "Benjamin Keep, PhD, JD", why: "Kritische Einordnung von Schnelllesen.", checked: true },
    ],
    videoNote: "Nur ein Video; Inhalt nur nach Titel beurteilt.",
    sources: [
      { title: "Rayner & Schotter 2016, Psychol Sci Public Interest – So Much to Read, So Little Time: How Do We Read, and Can Speed Reading Help?", url: PM("26769745"), kind: "Übersichtsarbeit" },
    ],
  },
};
