import type { Dossier } from "./dossiers";

// Kategorie „Kopf“, Teil 2. Recherchiert am 23. November 2026. Studien über PubMed geprüft (Titel, Autoren, Abstract);
// Aussagen stehen nur, wenn sie im Abstract oder auf der verlinkten Seite standen.
// Nicht bearbeitet (keine ausreichend geprüften Quellen): Große Zahlen multiplizieren, Trachtenberg-System, Karten zählen, Telefonnummer merken,
// Stundenplan merken, Elixier zählen, Schweres einfach erklären, Eigene Meinung prüfen, Natürliches Denken, Flow Maps, Strategiespiele.
const DATE = "23. November 2026";
const PM = (id: string) => `https://pubmed.ncbi.nlm.nih.gov/${id}/`;

export const DOSSIERS_KOPF2: Record<string, Dossier> = {
  "Kopfrechnen": {
    date: DATE,
    steckbrief: {
      about: "Rechnen ohne Hilfsmittel. Schnelle Rechner nutzen je nach Aufgabe abgerufene Fakten oder Rechenschritte; langes, intensives Training mit dem Kopf-Abakus verbesserte bei Kindern das Rechnen deutlich.",
      why: "In einer Studie mit 144 Kindern rechneten die Kinder nach fünf Schuljahren Abakus-Training (2 Stunden pro Woche) besser als die Kontrollgruppe und hatten ein besseres räumliches Arbeitsgedächtnis, ohne Vorteil im Intelligenztest.",
      tips: "Kurz und regelmäßig üben, erst Einmaleins und Zerlegen in runde Zahlen, dann größere Aufgaben. (Vorschlag)",
      safety: "Keine Risiken. Bei Frust Aufgaben leichter machen. (Vorsichtsregel, keine Leitlinie)",
    },
    learn: [
      "Beim Kopfrechnen werden zwei Wege unterschieden: Aufgaben, die meist über abgerufene Fakten gelöst werden (Retrieval), und Aufgaben, die meist über Rechenschritte gelöst werden (Prozedur). Eine Metaanalyse von 31 Bildgebungsstudien wertete beide getrennt aus. [3]",
      "Ein Rechenkünstler in einer PET-Studie nutzte nicht einfach „mehr“ der üblichen Prozesse, sondern andere Hirnareale als die Vergleichspersonen; er konnte zwischen kurzzeitigem Speichern und effizienter Einspeicherung ins episodische Gedächtnis wechseln. Das ist ein Einzelfall. [2]",
      "Die längste kontrollierte Studie: 144 Kinder wurden bei Schuleintritt einer Abakus-Gruppe (5 Jahre, 2 Stunden pro Woche) oder einer Kontrollgruppe zugeteilt. Die Abakus-Gruppe war bei zwei Rechentests und einer Arbeitsgedächtnisaufgabe besser, nicht im Raven-Intelligenztest. Die Autoren halten den Übertragungseffekt angesichts der Trainingsdauer für eher begrenzt. [1]",
      "Offen bleibt, wie viel davon auf Erwachsene übertragbar ist und welche Methode (Abakus, Zerlegen, Trachtenberg) am besten abschneidet; dazu habe ich keine Vergleichsstudie gelesen.",
    ],
    evidence: { level: "teilweise", why: "Training verbessert das Rechnen nachweislich (Kinderstudie), aber Vergleiche zwischen Methoden und Daten für Erwachsene fehlen in den gelesenen Quellen." },
    steps: [
      "Einmaleins sicher abrufen können. (Vorschlag)",
      "Aufgaben in runde Zahlen zerlegen, z. B. 47 + 38 = 47 + 40 − 2. (Vorschlag, Beispiel aus einem Erklärvideo [Video 2])",
      "Zeit stoppen und jede Woche leicht steigern. (Vorschlag)",
    ],
    plan: [
      { title: "Woche 1–2", text: "Täglich 10 Minuten Addition und Subtraktion mit Zerlegen. (Vorschlag)" },
      { title: "Woche 3–4", text: "Multiplikation zweistelliger mit einstelligen Zahlen, danach Quadrieren. (Vorschlag)" },
    ],
    myths: [
      { myth: "Rechenkünstler haben einfach ein Spezialgehirn.", fact: "Der untersuchte Rechenkünstler nutzte andere Hirnareale, mit Strategien, die auf Gedächtniskodierung beruhten; das spricht für Strategie und Training, ist aber ein Einzelfall. [2]" },
      { myth: "Abakus-Training macht allgemein klüger.", fact: "Die Kinder waren besser im Rechnen und Arbeitsgedächtnis, nicht im Raven-Test. [1]" },
    ],
    mistakes: ["Zu schwierige Aufgaben gleich zu Beginn.", "Nur Tricks lernen, ohne das Einmaleins sicher zu können. (Einordnung)"],
    safety: [],
    conflicts: ["Ob sich die Kinderergebnisse auf Erwachsene übertragen lassen, ist in den gelesenen Quellen nicht geprüft."],
    videos: [
      { title: "How to Calculate Faster than a Calculator - Mental Maths #1", id: "X_ZJc9_n7TY", channel: "mathOgenius", why: "Rechentricks im Überblick.", checked: true },
      { title: "How to Calculate Faster than a Calculator - Mental Maths #2| Addition and Subtraction", id: "Hs0wjbxvCt0", channel: "mathOgenius", why: "Zerlegen und Runden bei Addition und Subtraktion.", checked: true },
    ],
    videoNote: "Zwei Videos; Inhalt nur nach Titel und Suchbeschreibung beurteilt.",
    sources: [
      { title: "Wang et al. 2019, J Neurosci – Training on Abacus-Based Mental Calculation Enhances Visuospatial Working Memory in Children", url: PM("31209171"), kind: "Studie" },
      { title: "Pesenti et al. 2001, Nat Neurosci – Mental calculation in a prodigy is sustained by right prefrontal and medial temporal areas", url: PM("11135652"), kind: "Studie (Einzelfall)" },
      { title: "Sokolowski et al. 2023, Hum Brain Mapp – The neural correlates of retrieval and procedural strategies in mental arithmetic", url: PM("36121072"), kind: "Metaanalyse" },
    ],
  },

  "Metakognition": {
    date: DATE,
    steckbrief: {
      about: "Über das eigene Denken und Lernen nachdenken: einschätzen, was man weiß, und das Vorgehen anpassen. Metakognition hängt mit besseren Leistungen zusammen; ob mehr davon Leistung verursacht, zeigt diese Quelle nicht.",
      why: "Eine Auswertung von 147 Studien (698.096 Personen) fand einen Zusammenhang von r = 0,32 mit Mathematikleistungen.",
      tips: "Vor dem Lernen kurz einschätzen, was sitzt, danach prüfen, ob die Einschätzung stimmte. (Vorschlag)",
      safety: "Keine Risiken. (Vorsichtsregel, keine Leitlinie)",
    },
    learn: [
      "Eine Metaanalyse (147 Studien von 1986 bis 2024, 338 Stichproben, n = 698.096) fand einen positiven Zusammenhang zwischen Metakognition und Mathematikleistung, r = 0,32 (95 %-KI 0,30 bis 0,34). Alter, Fachgebiet und Kultur beeinflussten die Stärke: Der Zusammenhang stieg von der Vorschule bis zur Oberschule und war im College niedriger. Fachspezifische Metakognition hing enger mit der Leistung zusammen als allgemeine. [1]",
      "Wichtig: Das ist ein Zusammenhang, kein Beleg, dass Training von Metakognition die Leistung steigert. Das lässt sich aus dem Abstract nicht ableiten. [1]",
      "Zur Selbsteinschätzung: Nach dem Selbstkonsistenzmodell beruht das Vertrauen in eine Antwort darauf, wie einheitlich Antworten über mehrere abgerufene Repräsentationen hinweg gestützt werden. Das Modell wurde für Zwei-Alternativen-Fragen entwickelt. [2]",
    ],
    evidence: { level: "teilweise", why: "Sehr große Datenbasis, aber korrelativ und für Mathematik; ein Wirksamkeitsbeleg für Übungsprogramme steht nicht im gelesenen Material." },
    steps: [
      "Vor dem Lernen: Was weiß ich schon, was will ich können? (Vorschlag)",
      "Beim Lernen: Merke ich, wo ich hängen bleibe? Strategie wechseln. (Vorschlag)",
      "Danach: Einschätzung mit einem echten Test vergleichen. (Vorschlag)",
    ],
    plan: [{ title: "Täglich", text: "Nach jeder Lerneinheit zwei Sätze notieren: Was lief gut, was ändere ich? (Vorschlag)" }],
    myths: [{ myth: "Wer sich sicher fühlt, weiß es auch.", fact: "Vertrauen entsteht aus der Konsistenz abgerufener Repräsentationen, nicht aus einem direkten Blick auf die Richtigkeit. [2]" }],
    mistakes: ["Gefühl mit Wissen verwechseln. (Einordnung zu [2])", "Nur nachdenken, ohne mit einem Test zu vergleichen. (Vorschlag)"],
    safety: [],
    conflicts: ["Der Zusammenhang war im College schwächer als bei Schülern; Gründe nennt das Abstract nicht. [1]"],
    videos: [
      { title: "The Science of Metacognition (How to Learn Better)", id: "hw7B5s2cSfM", channel: "Challenge Innovate Grow: Teacher & Learner Centre", why: "Einführung in Metakognition und Lernen.", checked: true },
    ],
    videoNote: "Nur ein Video; Inhalt nur nach Titel beurteilt.",
    sources: [
      { title: "Xie & Zeng 2024, Acta Psychol – A meta-analysis of the relationship between metacognition and academic achievement in mathematics", url: PM("39244849"), kind: "Metaanalyse" },
      { title: "Koriat 2012, Psychol Rev – The self-consistency model of subjective confidence", url: PM("22022833"), kind: "Modellarbeit" },
    ],
  },

  "Morsecode": {
    date: DATE,
    steckbrief: {
      about: "Buchstaben als kurze und lange Signale. Wer das Alphabet ernsthaft übt, kann es laut einer großen Beobachtungsstudie in rund einer Stunde Übungszeit erkennen lernen.",
      why: "Unter den Nutzerinnen und Nutzern eines Online-Trainers, die deutlich vorankamen, lag die mittlere Lernzeit bis zum ganzen Alphabet bei 55,6 Minuten; über die Hälfte kam aber nicht voran.",
      tips: "Auf den Klang achten statt Punkte zu zählen; neue Zeichen nach und nach dazunehmen. (Vorschlag; Koch-Methode siehe unten)",
      safety: "Keine Risiken. Lautstärke moderat halten. (Vorsichtsregel, keine Leitlinie)",
    },
    learn: [
      "Eine Beobachtungsstudie wertete 699.562 Datensätze von 34.641 anonymen Nutzern eines Trainers aus. 51,6 % zeigten keinen Fortschritt (Gelegenheitsbesuche). Wer deutlich vorankam, erreichte das ganze Alphabet in median 55,6 Minuten. Die Autoren betonen, das gelte nur für die Minderheit mit Fortschritt. [1]",
      "Visuelle Hinweise erhöhten die Genauigkeit (90,3 % gegenüber 82,2 %) vor allem am Anfang; Klanghinweise wurden später wichtiger. [1]",
      "In einer Lernstudie mit 50 Personen veränderte Lernen mit zusätzlichem Tastreiz oder mit Eigenproduktion die Hirnaktivität beim späteren Hören von Morsezeichen. Verhaltensdaten nennt der Abstract nicht. [2]",
      "In einer kleinen EEG-Studie (9 Personen) stieg beim Lernen die Hirnreaktion auf Frequenzabweichungen der Töne. [3]",
      "Zur Koch-Methode (nur wenige Zeichen in hoher Geschwindigkeit beginnen und schrittweise erweitern) habe ich keine Studie gefunden; Video-Anleitungen beschreiben sie, belegen sie aber nicht.",
    ],
    evidence: { level: "teilweise", why: "Lernbarkeit ist in einer großen Beobachtungsstudie gezeigt; kontrollierte Vergleiche von Lernmethoden, auch der Koch-Methode, fehlen in den gelesenen Quellen." },
    steps: [
      "Zeichen nach Klang lernen, nicht als Punkte und Striche zählen. (Vorschlag)",
      "Mit wenigen Zeichen beginnen und nach und nach neue ergänzen (Koch-Prinzip, laut Video-Anleitungen). (Vorschlag)",
      "Früh mit Hinweisen üben, später mehr nur nach Gehör. [1]",
    ],
    plan: [
      { title: "Tag 1–3", text: "Je 10 Minuten, erste Zeichen sicher erkennen. (Vorschlag)" },
      { title: "Woche 2", text: "Alphabet vervollständigen; die Studie nennt etwa eine Stunde reine Übungszeit bei Fortschreitenden. [1]" },
    ],
    myths: [{ myth: "Morsen lernt jeder in 10 Minuten.", fact: "Die Mediane von rund einer Stunde gelten nur für die aktive Minderheit; über die Hälfte kam nicht voran. [1]" }],
    mistakes: ["Punkte und Striche mitzählen statt den Klang zu lernen. (Vorschlag)"],
    safety: [],
    conflicts: ["Die Daten stammen aus einer offenen Beobachtung ohne Zufallszuteilung, die Lernzeit ist nur für Fortschreitende geschätzt. [1]"],
    videos: [
      { title: "LEARN CW ONLINE WITH THE KOCH METHOD / Best Way To Learn CW", id: "tnHsnQX_C0o", channel: "Ham Shack Reviews", why: "Praktische Anleitung zur Koch-Methode.", checked: true },
      { title: "Quick Start: Learn To Copy Morse Code", id: "uvA8d1YqQPs", channel: "Ham Radio Crash Course", why: "Einstieg ins Hören von Morsecode.", checked: true },
    ],
    videoNote: "Zwei Videos; Inhalt nur nach Titel beurteilt.",
    sources: [
      { title: "Wade & Hamid 2026, Disabil Rehabil Assist Technol – Morse code learning for assistive technology access: engagement, learning time, and cue associations in a large observational study", url: PM("42574304"), kind: "Beobachtungsstudie" },
      { title: "Junker et al. 2021, Brain Res – Impact of multisensory learning on perceptual and lexical processing of unisensory Morse code", url: PM("33422535"), kind: "Studie" },
      { title: "Uther et al. 2006, Brain Res – Training in Morse code enhances involuntary attentional switching to acoustic frequency", url: PM("16460704"), kind: "Studie" },
    ],
  },

  "Fotografisches Gedächtnis": {
    date: DATE,
    steckbrief: {
      about: "Ein „Foto im Kopf“. Die gelesene Übersicht beschreibt eidetische Bilder und gewöhnliche Erinnerungsbilder als zwei Formen konstruktiver Vorstellung, die sich nach Lebendigkeit unterscheiden, nicht als echte Fotokopie.",
      why: "Wer sich viel merken will, braucht Methoden wie Gedächtnispalast und Wiederholen, kein „Foto“. (Einordnung, siehe Dossier „Gedächtnispalast“)",
      tips: "Statt auf ein Foto zu hoffen, Material mit Bildern, Orten und Abruf üben. (Vorschlag)",
      safety: "Keine Risiken.",
    },
    learn: [
      "Eine Übersichtsarbeit aus zehn historischen Studien (1860 bis 2023) kommt zum Schluss: Erinnerungsbilder und eidetische Bilder sind zwei Formen konstruktiver Vorstellung, die sich entlang eines Kontinuums der Lebendigkeit unterscheiden. Lebendigkeit setzt sich aus Klarheit, Farbigkeit und Lebhaftigkeit zusammen. [1]",
      "Konstruktiv heißt hier: Das Bild wird aufgebaut und ist keine unveränderte Aufnahme. Das ist meine Lesart des Abstracts. [1]",
      "Zur Trainierbarkeit eines „fotografischen“ Gedächtnisses habe ich keine Studie gelesen; dazu keine Aussage.",
    ],
    evidence: { level: "kaum", why: "Beschrieben sind Vorstellungsbilder; ein trainierbares „fotografisches Gedächtnis“ ist in den gelesenen Quellen nicht belegt." },
    steps: ["Siehe Dossiers „Gedächtnispalast“ und „Kartendeck merken“ für belegbare Merktechniken. (Verweis)"],
    plan: [],
    myths: [{ myth: "Es gibt ein Gedächtnis, das Bilder wie ein Foto abspeichert.", fact: "Nach der Übersicht sind auch eidetische Bilder konstruktive Vorstellungen auf einem Kontinuum der Lebendigkeit. [1]" }],
    mistakes: ["Auf ein „Foto“ zu setzen statt auf Wiederholung und Abruf. (Einordnung)"],
    safety: [],
    conflicts: ["Die Übersicht fasst Selbstberichte und frühe Studien zusammen; objektive Genauigkeitsprüfungen nennt der Abstract nicht. [1]"],
    videos: [
      { title: "The Truth About Photographic Memory: Science vs Myth", id: "GQYBwNqEbOQ", channel: "Knowle", why: "Einordnung des Mythos.", checked: true },
    ],
    videoNote: "Nur ein Video; Inhalt nur nach Titel beurteilt, Kanal nicht bekannt.",
    sources: [
      { title: "Marks 2023, Vision – Phenomenological Studies of Visual Mental Imagery: A Review and Synthesis of Historical Datasets", url: PM("37873895"), kind: "Übersichtsarbeit" },
    ],
  },

  "Recherchieren mit KI": {
    date: DATE,
    steckbrief: {
      about: "KI-Chatbots liefern flüssige Antworten, aber ihre Quellenangaben sind oft falsch oder erfunden. Jede Quelle muss einzeln geprüft werden.",
      why: "In einer Prüfung von 86 Literaturangaben waren 15,12 % erfunden und 9,30 % fehlerhaft; in einer größeren Studie war die beste Version nur zu 51 % genau.",
      tips: "Quellen in PubMed, Google Scholar oder beim Verlag suchen und prüfen, ob der Inhalt zur Behauptung passt. (Vorsichtsregel, keine Leitlinie)",
      safety: "Nichts Wichtiges (Gesundheit, Recht, Geld) allein auf KI-Aussagen stützen. (Vorsichtsregel, keine Leitlinie)",
    },
    learn: [
      "Eine Studie zu Stammzellforschung prüfte 86 von ChatGPT erzeugte Quellen: 15,12 % waren erfunden, 9,30 % fehlerhaft. Die Autoren nennen fehlenden Echtzeit-Zugang und Training auf älteren Daten als Gründe und empfehlen, Quellen zu prüfen. [1]",
      "Eine Studie mit je drei Versionen von ChatGPT und Gemini (1.947 Quellen zu 25 HNO-Leitlinienthemen) prüfte die Angaben in PubMed, Web of Science und Google Scholar. Häufige Fehler waren falsche Autorennamen und DOIs. Beste Version: ChatGPT-4.1 mit Websuche, 51 %; Gemini 2.5 Pro 41 %. Die zwei Versionen mit Websuche schnitten besser ab. Bei häufig zitierten Themen waren die Fehler seltener. [2]",
      "Ein Beitrag zum ethischen Einsatz in der Wissenschaft nennt Plagiate, Halluzinationen und erfundene Quellen als bekannte Probleme. [3]",
      "Einschränkung: Die Studien betreffen medizinische Fachgebiete und bestimmte Modellversionen; Modelle ändern sich schnell.",
    ],
    evidence: { level: "teilweise", why: "Mehrere Studien zeigen hohe Fehlerraten bei KI-Quellenangaben, aber nur in einzelnen Fachgebieten und für Modellstände von 2023 bis 2025." },
    steps: [
      "Frage klar stellen und die KI um Quellen mit Titel und Link bitten. (Vorschlag)",
      "Jede Quelle selbst nachschlagen: Gibt es den Artikel, stimmen Autoren und DOI? [2]",
      "Prüfen, ob der Inhalt wirklich zur Aussage passt. (Vorschlag)",
      "Wichtige Aussagen mit einer zweiten, unabhängigen Quelle gegenprüfen. (Vorschlag)",
    ],
    plan: [{ title: "Gewohnheit", text: "Keine Aussage übernehmen, deren Quelle ich nicht selbst geöffnet habe. (Vorschlag)" }],
    myths: [
      { myth: "Wenn eine Quelle echt aussieht, existiert sie auch.", fact: "Häufig waren Autorennamen oder DOIs falsch; ein Teil der Angaben war erfunden. [1][2]" },
      { myth: "Mit Websuche stimmen die Quellen.", fact: "Mit Websuche war es besser, aber auch die beste Version erreichte nur 51 %. [2]" },
    ],
    mistakes: ["Quellen nicht öffnen.", "Nur auf Titel und Autor achten, nicht auf den Inhalt. (Einordnung)"],
    safety: ["Bei medizinischen, rechtlichen oder finanziellen Fragen Fachquellen oder Fachleute nutzen. (Vorsichtsregel, keine Leitlinie)"],
    conflicts: ["Die Fehlerquoten unterscheiden sich stark zwischen Studien (15 % erfunden gegenüber 51 % genau bei Fachthemen) und hängen von Modell, Thema und Prüfmethode ab. [1][2]"],
    videos: [
      { title: "AI Hallucinations: Fact-Check AI Before You Hit Submit — AI Literacy for College Students", id: "4S5rnN3meFw", channel: "Micah Bustos", why: "Praktische Hinweise zum Gegenprüfen.", checked: true },
    ],
    videoNote: "Nur ein Video; Inhalt nur nach Titel beurteilt.",
    sources: [
      { title: "Sharun et al. 2023, Ann Med Surg – ChatGPT and artificial hallucinations in stem cell research: assessing the accuracy of generated references", url: PM("37811040"), kind: "Studie" },
      { title: "Pastucha et al. 2026, Med Sci Monit – Reference Accuracy in Large Language Model Chatbots", url: PM("41546380"), kind: "Studie" },
      { title: "Cheng et al. 2025, Adv Simul – Artificial intelligence-assisted academic writing: recommendations for ethical use", url: PM("40251634"), kind: "Übersichtsarbeit" },
    ],
  },

  "Logisches Denken": {
    date: DATE,
    steckbrief: {
      about: "Schlüsse sauber ziehen und typische Denkfehler vermeiden. Eine kleine Studie zeigt: Wiederholte Aufgaben mit Rückmeldung verringerten einen bekannten Fehler (Konjunktionsfehler), ohne dass es auf andere Aufgaben übertragen wurde.",
      why: "Üben mit Rückmeldung hilft beim trainierten Fehlertyp; ein allgemeines Training logischen Denkens ist damit nicht belegt.",
      tips: "Denkaufgaben lösen und nach jeder Aufgabe die richtige Antwort prüfen. (Vorschlag)",
      safety: "Keine Risiken.",
    },
    learn: [
      "Beim Konjunktionsfehler wird eine Kombination von Ereignissen für wahrscheinlicher gehalten als eines davon. In einer Studie mit 56 Personen übte die Trainingsgruppe solche Aufgaben mit minimaler Ergebnis-Rückmeldung. Sie verbesserte sich bei trainierten und ungeübten Aufgaben, auch bei Alltags- und klinischen Szenarien, die Kontrollgruppe nicht. Auf unverwandte Basisraten-Aufgaben übertrug sich der Effekt nicht. Die Verbesserung kam allmählich. [1]",
      "Bei der Wason-Aufgabe zeigt eine Studie, dass sogenanntes exekutives Lernen die Heuristik hemmen kann, ohne unbedingt Logik zu fördern (nur nach dem Titel beurteilt, Abstract nicht vollständig gelesen). [2]",
    ],
    evidence: { level: "kaum", why: "Eine kleine Studie (N = 56) mit spezifischem Fehler und ohne Übertragung; allgemeines Training logischen Denkens ist nicht belegt." },
    steps: [
      "Typische Fehler kennen (z. B. Konjunktionsfehler). [1]",
      "Aufgaben mit Rückmeldung wiederholen. [1]",
      "Eigene Antwort begründen, bevor man die Lösung ansieht. (Vorschlag)",
    ],
    plan: [{ title: "Täglich", text: "5 bis 10 Denkaufgaben mit Auflösung. (Vorschlag)" }],
    myths: [{ myth: "Logik-Training macht allgemein klüger.", fact: "In der Studie übertrug sich der Effekt nicht auf unverwandte Aufgaben. [1]" }],
    mistakes: ["Nur Lösungen lesen statt selbst entscheiden. (Vorschlag)"],
    safety: [],
    conflicts: ["Die Studie hatte 56 Teilnehmende; eine Wiederholung ist nicht bekannt. [1]"],
    videos: [],
    videoNote: "Keine Videos geprüft.",
    sources: [
      { title: "Wadenholt et al. 2026, Acta Psychol – Advising the ill-advised: Debiasing the conjunction fallacy through gamified training with outcome feedback", url: PM("41763039"), kind: "Studie" },
      { title: "Rossi & Cassotti 2015, PLoS One – Helping reasoners succeed in the Wason selection task: when executive learning discourages heuristic response but does not necessarily encourage logic", url: PM("25849555"), kind: "Studie" },
    ],
  },
};
