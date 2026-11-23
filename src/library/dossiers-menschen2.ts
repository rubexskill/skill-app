import type { Dossier } from "./dossiers";

// Kategorie „Menschen, Sprache & Kommunikation“, Teil 2. Recherchiert am 23. November 2026.
// Studien über PubMed geprüft (Titel, Autoren, Abstract); Aussagen stehen nur, wenn sie im Abstract standen.
// Ausgelassen (keine tragfähigen Quellen gelesen): Klarer sprechen, Verbales Aikido, Lexical Priming (Hoey; zur Priming-Replikationskrise
// wurde nur Verhaltens-Priming gefunden, nicht Lexical Priming), Benjamin-Franklin-Effekt (Jecker & Landy 1969 ist nur bezahlpflichtig,
// Abstract nicht lesbar).
const DATE = "23. November 2026";
const PM = (id: string) => `https://pubmed.ncbi.nlm.nih.gov/${id}/`;

export const DOSSIERS_MENSCHEN2: Record<string, Dossier> = {
  "Geschichten erzählen": {
    date: DATE,
    steckbrief: {
      about: "Eine Botschaft als Erzählung mit Figur, Ablauf und Ergebnis vermitteln. Erzählungen überzeugen nicht grundsätzlich besser als Zahlen, aber in bestimmten Fällen und bei bestimmten Erzählformen schon.",
      why: "Eine Metaanalyse aus 50 Studien (13 113 Teilnehmende) fand keinen Gesamtunterschied zwischen Erzählung und statistischen Belegen. Bei Gesundheitsbotschaften zur Vorbeugung war die Erzählung im Vorteil.",
      tips: "Eine Figur, die dem Publikum ähnlich ist, in der Ich-Form und in der Vergangenheitsform erzählen: Das wirkte in Gesundheitsstudien am stärksten. Zahlen und Geschichte können sich ergänzen. (Vorschlag, gestützt durch [2])",
      safety: "Keine Risiken. Erfundene Geschichten nicht als wahre Fälle ausgeben, besonders bei Gesundheits- und Finanzthemen. (Vorsichtsregel, keine Leitlinie)",
    },
    learn: [
      "Eine Metaanalyse verglich in 50 Studien (65 Vergleichspaare, 13 113 Teilnehmende) direkt Erzählung mit statistischer Evidenz. Gesamteffekt r = 0,016 (95 %-KI −0,014 bis 0,045), also kein signifikanter Unterschied, weder in Gesundheits- noch in anderen Themen. Bei Gesundheitsbotschaften zur Vorbeugung hatte die Erzählung einen signifikanten Vorteil. [1]",
      "Die Autorin zieht den Schluss, dass die relative Wirkung „komplex und differenziert“ sei. [1]",
      "Eine zweite Metaanalyse (16 Experimente zu Gesundheitsbotschaften) verglich Erzählungen aus der Ich- und der Er/Sie-Perspektive. Ich-Erzählungen erhöhten die wahrgenommene Anfälligkeit (d = 0,10) und das Einfühlen in die Figur (d = 0,10). Die Wirkung war stärker bei Geschichten in der Vergangenheitsform und mit Hauptfiguren, die dem Publikum ähnlich waren. Es gab keine Hinweise auf Publikationsverzerrung. Die Effekte sind klein. [2]",
    ],
    evidence: { level: "teilweise", why: "Zwei Metaanalysen zu Gesundheitsbotschaften; Gesamteffekt gegenüber Zahlen null, kleine Vorteile bei Vorbeugung und Ich-Perspektive. Für andere Gebiete (Beruf, Vortrag) enthalten die gelesenen Abstracts nichts." },
    steps: [
      "Ziel der Geschichte in einem Satz festlegen: Was soll das Publikum danach wissen oder tun? (Vorschlag)",
      "Eine Figur wählen, der das Publikum ähnelt. [2]",
      "Aus der Ich-Perspektive in der Vergangenheit erzählen. [2]",
      "Eine wichtige Zahl oder Tatsache ergänzen, wo sie gebraucht wird. (Vorschlag; Gesamtbefund [1])",
    ],
    plan: [
      { title: "Woche 1–2", text: "Täglich eine kurze Alltagsgeschichte (eine Minute) laut erzählen: Anfang, Wendepunkt, Schluss. (Vorschlag)" },
      { title: "Woche 3–4", text: "Dieselbe Geschichte vor einer Person erzählen und fragen, was hängen blieb. (Vorschlag)" },
    ],
    myths: [
      { myth: "Geschichten überzeugen immer besser als Fakten.", fact: "Gesamteffekt in der Metaanalyse: kein Unterschied (r = 0,016). [1]" },
    ],
    mistakes: ["Eine Geschichte erzählen, die zur Botschaft nicht passt. (Einordnung)", "Zu viele Nebenfiguren. (Einordnung)"],
    safety: [],
    conflicts: ["Die Wirkung hängt von Thema, Stichprobe und Erzählform ab; gegenüber Stichproben aus Studierenden war die Erzählung bei Gesundheitsthemen in Stichproben ohne Studierende im Vorteil. [1]"],
    videos: [],
    videoNote: "Keine Videos eingetragen: Die Suche lieferte keine Vorträge von Forschenden, die ich prüfen konnte.",
    sources: [
      { title: "Xu 2023, Health Communication – A Meta-Analysis Comparing the Effectiveness of Narrative vs. Statistical Evidence: Health vs. Non-Health Contexts", url: PM("36278821"), kind: "Metaanalyse" },
      { title: "Chen & Bell 2022, Psychology & Health – A meta-analysis of the impact of point of view on narrative processing and persuasion in health messaging", url: PM("33678078"), kind: "Metaanalyse" },
    ],
  },

  "Erickson-Hypnose": {
    date: DATE,
    steckbrief: {
      about: "Hypnose nach Milton Erickson arbeitet mit indirekten Suggestionen, Geschichten und Metaphern statt mit direkten Befehlen. Klinische Hypnose ist bei Angst und Schmerz untersucht; für den Erickson-Ansatz im Besonderen fehlt laut einer Übersicht der empirische Beleg.",
      why: "Eine Übersichtsarbeit fand weder für die Wirksamkeit der Erickson-Ansätze noch für ihre Grundannahmen empirische Belege. Für Hypnose allgemein zeigt eine Metaanalyse eine Wirkung bei Angst.",
      tips: "Als Fertigkeit nur in Ausbildung bei anerkannten Fachverbänden lernen und nicht zur Behandlung anderer einsetzen. (Vorsichtsregel, keine Leitlinie)",
      safety: "Hypnose als Behandlung gehört in ausgebildete Hände. Nicht anstelle von Therapie oder ärztlicher Abklärung, bei psychischen Erkrankungen, Traumata oder Psychose-Risiko nicht ohne Fachleute. Nie Druck ausüben und Einwilligung einholen. (Vorsichtsregel, keine Leitlinie)",
    },
    learn: [
      "Eine Übersichtsarbeit (Matthews 2000) prüfte die empirische Forschung zu Erickson-Ansätzen und ihren Grundannahmen: veränderter Bewusstseinszustand mit Markern, Überlegenheit indirekter Suggestionen und Hypnotisierbarkeit als Funktion der Fertigkeit der hypnotisierenden Person. Die Literatur lieferte keine empirische Stütze für die Wirksamkeit oder für diese Annahmen. [1] Die Arbeit ist von 2000, spätere Studien kennt dieses Dossier nicht.",
      "Eine Metaanalyse zu Hypnose bei Angst (15 Studien, 17 Versuche): mittlere gewichtete Effektstärke 0,79 am Ende der Behandlung, 0,99 bei der längsten Nachbeobachtung. Hypnose wirkte besser in Kombination mit anderen psychologischen Verfahren als allein. Das betrifft Hypnose allgemein, nicht den Erickson-Stil. [2]",
      "Bei Schmerz: Eine Metaanalyse zu chronischen muskuloskelettalen und neuropathischen Schmerzen (9 Studien, 530 Personen) fand eine mittlere Abnahme der Schmerzstärke (Hedges g −0,42); bei mindestens 8 Sitzungen war die Wirkung stärker (g −0,555) als bei weniger (g −0,299, nicht signifikant). [3]",
      "Eine weitere Metaanalyse (70 Studien, 6 078 Personen) zu Hypnose zusätzlich zur üblichen Behandlung fand kleine zusätzliche Effekte auf Schmerz, stufte die Sicherheit der Evidenz aber insgesamt als sehr niedrig ein. [4]",
    ],
    evidence: { level: "kaum", why: "Für den Erickson-Stil im Besonderen fand die gelesene Übersicht keine Belege; für Hypnose allgemein gibt es Metaanalysen mit unterschiedlicher Qualität (bei Zusatzschmerzbehandlung sehr niedrige Sicherheit)." },
    steps: [
      "Interesse klären: Selbsterfahrung, Therapieausbildung oder Bühnenkunst? (Vorschlag)",
      "Für klinische Anwendung nur Ausbildungen anerkannter Fachverbände wählen. (Vorsichtsregel, keine Leitlinie)",
      "Selbsthypnose oder Entspannung zuerst bei sich selbst ausprobieren, ohne Anspruch auf Behandlung. (Vorschlag)",
    ],
    plan: [
      { title: "Woche 1–2", text: "Über Hypnose lesen und die Quellen dieses Dossiers durchgehen. (Vorschlag)" },
      { title: "Woche 3–4", text: "Wenn gewünscht, Kontakt zu einem anerkannten Verband oder einer Ausbildung aufnehmen. (Vorschlag)" },
    ],
    myths: [
      { myth: "Indirekte Suggestionen wirken besser als direkte.", fact: "Die gelesene Übersicht fand dafür keinen empirischen Beleg. [1]" },
      { myth: "Hypnose wirkt nicht.", fact: "Bei Angst und chronischem Schmerz zeigen Metaanalysen Effekte, bei Schmerz teils mit sehr niedriger Sicherheit der Evidenz. [2][3][4]" },
    ],
    mistakes: ["Auf Bühnen- oder Online-Videos als Ausbildung vertrauen.", "Hypnose bei ernsten Beschwerden anstelle einer Behandlung einsetzen. (Vorsichtsregel)"],
    safety: ["Nicht bei anderen anwenden ohne Ausbildung und Einwilligung.", "Bei anhaltenden Beschwerden ärztlich abklären lassen. (Vorsichtsregel, keine Leitlinie)"],
    conflicts: [
      "Die Übersicht von 2000 [1] sieht keine Belege für den Erickson-Ansatz; neuere Metaanalysen zu Hypnose allgemein [2][3][4] sind positiver, untersuchen aber nicht ausdrücklich den Erickson-Stil.",
      "Die Metaanalyse zu Zusatz-Hypnose bei Schmerz hat sehr niedrige Sicherheit der Evidenz. [4]",
    ],
    videos: [
      { title: "Replacing opioids with hypnosis for pain treatment | David Spiegel", id: "QbGlghuLkYY", channel: "World Economic Forum", why: "Stanford-Psychiater zu klinischer Hypnose bei Schmerz (nicht Erickson-spezifisch).", checked: true },
      { title: "The Surprising Neuroscience of Hypnosis: Myths, Truths & Use Cases w/ Dr. David Spiegel MD", id: "O8fPExRLX2s", channel: "Rich Roll", why: "Gespräch mit einem Hypnoseforscher über Mythen und Anwendungen.", checked: true },
    ],
    videoNote: "Zwei Videos zu klinischer Hypnose allgemein, keines zum Erickson-Stil; Inhalt nur nach Titel beurteilt.",
    sources: [
      { title: "Matthews 2000, Int J Clin Exp Hypn – Ericksonian approaches to hypnosis and therapy: where are we now?", url: PM("11011501"), kind: "Übersichtsarbeit" },
      { title: "Valentine et al. 2019, Int J Clin Exp Hypn – The efficacy of hypnosis as a treatment for anxiety: a meta-analysis", url: PM("31251710"), kind: "Metaanalyse" },
      { title: "Langlois et al. 2022, Neurosci Biobehav Rev – Hypnosis to manage musculoskeletal and neuropathic chronic pain: a systematic review and meta-analysis", url: PM("35192910"), kind: "Metaanalyse" },
      { title: "Jones et al. 2024, Pain Reports – Adjunctive use of hypnosis for clinical pain: a systematic review and meta-analysis", url: PM("39263007"), kind: "Metaanalyse" },
    ],
  },

  "Lippenlesen": {
    date: DATE,
    steckbrief: {
      about: "Gesprochene Wörter aus den sichtbaren Mundbewegungen erkennen. Normal hörende Erwachsene lesen meist schlecht von den Lippen; Training hilft schwer, kann aber unter bestimmten Bedingungen wirken.",
      why: "Eine Übersichtsarbeit hält fest, dass die Lippenlesefähigkeit bei Erwachsenen mit lebenslang normalem Hören typischerweise schlecht ist und Training schwer zu verbessern ist, unter bestimmten Feedback-Bedingungen aber gelingen kann.",
      tips: "Üben mit Rückmeldung (Untertitel danach prüfen) und mit Satzmaterial, nicht nur mit Einzelwörtern. (Vorschlag, gestützt durch [1])",
      safety: "Keine Risiken. Wer Hörprobleme bemerkt, sollte sie ärztlich abklären lassen; Lippenlesen ersetzt keine Hörhilfe. (Vorsichtsregel, keine Leitlinie)",
    },
    learn: [
      "Die Übersichtsarbeit von Bernstein & Jordan (2022) beschreibt: Die meisten Erwachsenen profitieren davon, den Sprecher zu sehen, wenn Sprache gestört ist; die Größe des Effekts hängt von der Lippenlesefähigkeit ab. Lippenlesen wird oft auf Visem-Wahrnehmung begrenzt, aber es gibt Belege für Wahrnehmung unterhalb der Visem-Ebene, und das Erkennen von Wörtern nutzt lexikalische Einschränkungen wie beim Hören. Training wurde mit wenig Erfolg verfolgt, kann aber bei bestimmter Rückmeldung und Aufgabe gelingen und sich auf nicht trainiertes Material übertragen. [1]",
      "Eine Studie mit 341 jungen Erwachsenen zum Satz-Lippenlesen: Weibliche Teilnehmende waren im Mittel genauer, und Männer und Frauen brauchten strukturell unterschiedliche Modelle zur Vorhersage der Genauigkeit. [2]",
      "In einer Studie lasen Personen von den Lippen sich selbst genauer als andere (Selbst-Vorteil); dieser Vorteil zeigte sich auch beim Verstehen von Sprache im Lärm mit Bild. [3]",
    ],
    evidence: { level: "teilweise", why: "Gute Übersichtsarbeit zur geringen Ausgangsfähigkeit und zu schwierigem Training; konkrete Prozentzahlen für Alltagsgespräche stehen in den gelesenen Abstracts nicht." },
    steps: [
      "Gesicht gut beleuchtet und auf Augenhöhe betrachten. (Vorschlag)",
      "Mit kurzen Sätzen ohne Ton üben und danach mit Untertitel prüfen (Rückmeldung). (Vorschlag, nach [1])",
      "Auf Kontext achten: Thema, Gesten, Ort. (Vorschlag; Rolle lexikalischer Einschränkungen nach [1])",
    ],
    plan: [
      { title: "Woche 1–2", text: "Täglich 5 Minuten Sätze ohne Ton ansehen, danach mit Untertitel vergleichen. (Vorschlag)" },
      { title: "Woche 3–4", text: "Mit Hintergrundlärm und Ton üben, da das Bild dort am meisten hilft. (Vorschlag, nach [1])" },
    ],
    myths: [
      { myth: "Manche Menschen lesen jedes Wort von den Lippen.", fact: "Bei Erwachsenen mit normalem Hören ist die Fähigkeit typischerweise schlecht; Training ist schwer. [1]" },
    ],
    mistakes: ["Nur Einzelwörter üben. (Einordnung)", "Ohne Rückmeldung üben. [1]"],
    safety: [],
    conflicts: ["Die Übersicht nennt Trainingserfolge nur unter engen Bedingungen; wie gut sie im Alltag tragen, geht aus den gelesenen Abstracts nicht hervor. [1]"],
    videos: [],
    videoNote: "Keine Videos eingetragen: Die Suche lieferte keine geprüften Lehrvideos zum Lippenlesen.",
    sources: [
      { title: "Bernstein & Jordan 2022, American Journal of Audiology – Lipreading: A Review of Its Continuing Importance for Speech Recognition With an Acquired Hearing Loss and Possibilities for Effective Training", url: PM("35316072"), kind: "Übersichtsarbeit" },
      { title: "Bernstein 2018, Language Learning – Response Errors in Females' and Males' Sentence Lipreading Necessitate Structurally Different Models for Predicting Lipreading Accuracy", url: PM("31485084"), kind: "Studie" },
      { title: "Tye-Murray et al. 2015, Psychonomic Bulletin & Review – The self-advantage in visual speech processing enhances audiovisual speech recognition in noise", url: PM("25421408"), kind: "Studie" },
    ],
  },

  "Akzent nachahmen": {
    date: DATE,
    steckbrief: {
      about: "Fremde Aussprache und Sprachmelodie nachahmen. Wer singt, ahmt Akzente besser nach; Training der Stimme scheint zu helfen. Studien zu Lernmethoden fehlen in den gelesenen Quellen.",
      why: "In einer Studie mit 96 Personen ahmten Sänger fremde Sprache und Akzente besser nach als Instrumentalisten, und diese besser als Menschen ohne Musik- oder Gesangstraining.",
      tips: "Kurze Sätze eines Muttersprachlers hören, nachsprechen, aufnehmen und vergleichen; Gesang und Summen der Melodie können helfen. (Vorschlag, gestützt durch [1])",
      safety: "Nicht zur Täuschung oder zum Verspotten von Menschen einsetzen. (Vorsichtsregel, keine Leitlinie)",
    },
    learn: [
      "Christiner & Reiterer (2015) testeten 96 Personen (27 Instrumentalisten, 33 Sänger, 36 ohne Musik) beim Nachahmen einer unbekannten Sprache (Hindi) und einer Zweitsprache (Englisch) sowie in der musikalischen Begabung. Instrumentalisten und Sänger waren besser als die Vergleichsgruppe, Sänger besser als Instrumentalisten. Die Autoren deuten das als Hinweis, dass Lernen nicht nur über das Hören, sondern auch über stimmmotorische Prozesse läuft, und dass Gesangstraining den Spracherwerb beschleunigen könnte. [1]",
      "Die Studie ist ein Gruppenvergleich, kein Trainingsexperiment: Ob Gesangstraining den Akzent verbessert, zeigt sie nicht. (Einordnung)",
    ],
    evidence: { level: "kaum", why: "Eine Vergleichsstudie ohne Training; zum Üben der Nachahmung selbst fehlen in den gelesenen Quellen kontrollierte Daten." },
    steps: [
      "Eine Aufnahme eines Sprechers wählen und Satz für Satz nachsprechen. (Vorschlag)",
      "Eigene Aufnahme anhören und mit dem Original vergleichen. (Vorschlag)",
      "Melodie und Rhythmus zuerst, Einzellaute danach. (Vorschlag)",
    ],
    plan: [
      { title: "Woche 1–2", text: "Täglich 5 Minuten einen Satz imitieren und aufnehmen. (Vorschlag)" },
      { title: "Woche 3–4", text: "Kleine Dialoge nachspielen. (Vorschlag)" },
    ],
    myths: [
      { myth: "Wer ein Instrument spielt, hat automatisch das beste Ohr für Akzente.", fact: "In der Studie waren Sänger besser als Instrumentalisten. [1]" },
    ],
    mistakes: ["Nur Einzellaute üben, nicht Melodie und Rhythmus. (Einordnung)"],
    safety: [],
    conflicts: ["Die Studie ist ein Gruppenvergleich und beweist keine Ursache; Selbstselektion (wer singt, übt vielleicht auch mehr nach) ist nicht ausgeschlossen. (Einordnung)"],
    videos: [],
    videoNote: "Keine Videos eingetragen: Ich habe kein Video gefunden, das ich als verlässlich einstufen konnte.",
    sources: [
      { title: "Christiner & Reiterer 2015, Frontiers in Human Neuroscience – A Mozart is not a Pavarotti: singers outperform instrumentalists on foreign accent imitation", url: PM("26379537"), kind: "Studie" },
    ],
  },

  "Forensische Linguistik": {
    date: DATE,
    steckbrief: {
      about: "Sprachanalyse für Rechtsfragen, etwa die Frage, wer einen Text geschrieben hat (Stilometrie). Die Methoden sind weit entwickelt, aber vor Gericht noch nicht ausreichend statistisch abgesichert.",
      why: "Eine Literaturübersicht 2024 hält fest, dass für die Stilometrie ein schlüssiges Verfahren fehlt, den Beweiswert von Ergebnissen wahrscheinlichkeitstheoretisch zu bewerten.",
      tips: "Als Einstieg zuerst Fachübersichten lesen und eigene Auswertungen nur als Hinweis, nie als Beweis behandeln. (Vorschlag, gestützt durch [1])",
      safety: "Keine Personen auf Grundlage einer Textanalyse beschuldigen. (Vorsichtsregel, keine Leitlinie)",
    },
    learn: [
      "Cammarota & Bozza (2024) geben einen Überblick über die Literatur zur Stilometrie und ihrer Anwendung in der Forensik: Geschichte, wissenschaftliche Grundlage und Stand der Technik. Sie stellen fest, dass wichtige Fragen offen sind, damit die Stilometrie als forensische Disziplin akzeptiert wird: Insbesondere fehlt ein schlüssiges wahrscheinlichkeitstheoretisches Verfahren zur Bewertung des Beweiswerts. Die Autoren verweisen auf Kriterien internationaler Organisationen wie des Europäischen Netzwerks forensischer Institute (ENFSI). [1]",
      "Zu Einzelfällen, Genauigkeit oder konkreten Verfahren (z. B. Wortschatzmaße) enthält die gelesene Quelle keine Zahlen; hier habe ich nichts weiter geprüft.",
    ],
    evidence: { level: "kaum", why: "Eine Übersichtsarbeit nennt die statistische Absicherung als offen; zu Genauigkeit gibt es in den gelesenen Quellen keine Angaben." },
    steps: [
      "Zuerst die Übersichtsarbeit [1] lesen. (Vorschlag)",
      "Mit Texten bekannter Autoren üben, nicht mit realen Streitfällen. (Vorschlag)",
      "Ergebnisse als Hinweis dokumentieren und die Grenzen benennen. (Vorschlag, gestützt durch [1])",
    ],
    plan: [
      { title: "Woche 1–2", text: "Grundbegriffe (Idiolekt, Stilmerkmale) in Fachübersichten nachlesen. (Vorschlag)" },
      { title: "Woche 3–4", text: "Zwei bekannte Autoren anhand häufiger Wörter vergleichen. (Vorschlag)" },
    ],
    myths: [
      { myth: "Ein Computer kann sicher sagen, wer einen Text geschrieben hat.", fact: "Für die Stilometrie fehlt laut Übersicht ein schlüssiges Verfahren zur Bewertung des Beweiswerts. [1]" },
    ],
    mistakes: ["Ergebnisse als Beweis darstellen.", "Zu kurze Texte vergleichen. (Einordnung)"],
    safety: [],
    conflicts: ["Die Fachwelt diskutiert, wie die Stilometrie statistisch abzusichern ist; die Übersicht benennt dies als offene Frage. [1]"],
    videos: [],
    videoNote: "Keine Videos eingetragen: Die Suche lieferte keine geprüften Erklärvideos.",
    sources: [
      { title: "Cammarota & Bozza 2024, Forensic Science International: Synergy – Stylometry and forensic science: A literature review", url: PM("39781110"), kind: "Übersichtsarbeit" },
    ],
  },

  "Trichterfragen": {
    date: DATE,
    steckbrief: {
      about: "Mit offenen Fragen beginnen und schrittweise zu engeren Fragen kommen. Zum Trichter selbst fand ich keine Studie; für offene gegenüber geschlossenen Fragen gibt es eine Metaanalyse aus Befragungen von Kindern.",
      why: "Eine Metaanalyse (23 Studien) fand für offene Fragen im Vergleich zu geschlossenen einen mittleren Effekt auf die Beschreibungen sensibler Ereignisse durch Kinder (d = 0,52).",
      tips: "Mit einer offenen Frage beginnen („Erzähl mir davon.“), erst danach nachfragen. Ob das Erwachsene ebenso betrifft, zeigt die Quelle nicht. (Vorschlag, gestützt durch [1])",
      safety: "Nicht drängen. In heiklen Gesprächen (Gewalt, Krankheit) gehört das Fragen in Fachhände. (Vorsichtsregel, keine Leitlinie)",
    },
    learn: [
      "Eine Metaanalyse (35 Studien) zu forensischen Befragungen von Kindern untersuchte Rapport-Techniken und Fragetypen. Rapport-Techniken hatten einen mittleren Gesamteffekt auf Offenlegungen (d = 0,55). Offene gegenüber geschlossenen Fragen hatten einen mittleren Gesamteffekt auf die Beschreibungen sensibler Ereignisse (d = 0,52), unabhängig von Alter und Befragungsprotokoll. Die Autoren sehen damit Rapport und offene Fragen bei der Befragung kindlicher Zeugen bestätigt. [1]",
      "Die Quelle prüft keine Trichter-Reihenfolge und bezieht sich auf Kinder in forensischen Befragungen; die Übertragung auf Alltagsgespräche ist eine Annahme. (Einordnung)",
    ],
    evidence: { level: "teilweise", why: "Gute Metaanalyse zu offenen Fragen, aber nur für Kinderbefragungen; die Trichtertechnik selbst ist nicht untersucht." },
    steps: [
      "Mit einer offenen Frage beginnen, die nicht mit Ja oder Nein beantwortet werden kann. [1]",
      "Zuhören, dann nachfragen: Wer, was, wann? (Vorschlag)",
      "Erst am Ende mit einer geschlossenen Frage prüfen. (Vorschlag)",
    ],
    plan: [
      { title: "Woche 1–2", text: "In jedem Gespräch eine offene Frage stellen und die Antwort ausreden lassen. (Vorschlag)" },
      { title: "Woche 3–4", text: "Eine Befragung in drei Stufen üben: offen, nachfragen, bestätigen. (Vorschlag)" },
    ],
    myths: [
      { myth: "Geschlossene Fragen führen schneller zur Wahrheit.", fact: "In der Metaanalyse brachten offene Fragen mehr Beschreibung. [1]" },
    ],
    mistakes: ["Suggestive Fragen. (Einordnung)", "Nicht ausreden lassen."],
    safety: [],
    conflicts: ["Die Metaanalyse betrifft Kinder in forensischen Befragungen; für Erwachsene und Alltagsgespräche habe ich keine Studie gelesen. [1]"],
    videos: [],
    videoNote: "Keine Videos eingetragen: Ich habe kein Video gefunden, das ich als verlässlich einstufen konnte.",
    sources: [
      { title: "Lavoie et al. 2021, Child Abuse & Neglect – Meta-analysis of the effects of two interviewing practices on children's disclosures of sensitive information: Rapport practices and question type", url: PM("33454643"), kind: "Metaanalyse" },
    ],
  },

  "Worte finden": {
    date: DATE,
    steckbrief: {
      about: "Im Gespräch das passende Wort rechtzeitig finden. Zeitweilige Wortfindungsstörungen (Zungenspitzen-Phänomen) sind normal; zu Trainingsmethoden fand ich keine belastbare Studie.",
      why: "Ein Review beschreibt das Zungenspitzen-Phänomen als vorübergehendes Scheitern beim Abrufen eines bekannten Wortes bei erhaltenem Bedeutungswissen.",
      tips: "Bei Wortnot ein Ersatzwort oder eine Umschreibung nutzen und weitersprechen. (Vorschlag)",
      safety: "Häufige, zunehmende Wortfindungsprobleme ärztlich abklären lassen. (Vorsichtsregel, keine Leitlinie)",
    },
    learn: [
      "Ein Review (Xie & Wang 2026) beschreibt das Zungenspitzen-Phänomen als vorübergehenden Zustand, in dem Sprechende ein bekanntes Wort kurz nicht abrufen können, obwohl das Bedeutungswissen erhalten ist und das Gefühl besteht, es gleich zu haben. Es verbindet kognitive Modelle und Bildgebung: Beteiligt sind ein linkslateralisiertes fronto-temporales Netzwerk; häufigere Zungenspitzen-Zustände gingen mit geringerer Integrität bestimmter Faserbahnen einher. [1]",
      "Die Quelle ist ein Überblick über Mechanismen; Übungen zum besseren Wörterfinden sind in dem gelesenen Abstract nicht geprüft.",
    ],
    evidence: { level: "kaum", why: "Mechanismen sind beschrieben, ein wirksames Training steht in der gelesenen Quelle nicht." },
    steps: [
      "Bei Wortnot kurz pausieren und das Gemeinte mit anderen Worten beschreiben. (Vorschlag)",
      "Später das Wort nachschlagen und im Satz benutzen. (Vorschlag)",
    ],
    plan: [
      { title: "Woche 1–2", text: "Täglich drei Wörter beschreiben, ohne sie zu nennen, und danach prüfen. (Vorschlag)" },
      { title: "Woche 3–4", text: "In einem Gespräch bewusst Umschreibungen einsetzen. (Vorschlag)" },
    ],
    myths: [],
    mistakes: ["Das Wort erzwingen wollen. (Einordnung)"],
    safety: [],
    conflicts: ["Zur Wirksamkeit von Übungen enthält die gelesene Quelle nichts. [1]"],
    videos: [],
    videoNote: "Keine Videos eingetragen: Ich habe kein Video gefunden, das ich als verlässlich einstufen konnte.",
    sources: [
      { title: "Xie & Wang 2026, Biomedicines – The Tip-of-the-Tongue Phenomenon: Cognitive, Neural, and Neurochemical Perspectives", url: PM("41751168"), kind: "Übersichtsarbeit" },
    ],
  },
};
