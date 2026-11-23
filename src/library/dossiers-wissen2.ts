import type { Dossier } from "./dossiers";

// Kategorie „Wissen & Verstehen“, Teil 2. Recherchiert am 23. November 2026.
// Studien über PubMed bzw. Crossref geprüft (Titel, Autoren, Abstract); Webseiten und PDFs im Volltext gelesen. Aussagen stehen nur, wenn sie dort stehen.
// Nicht bearbeitet (keine seriöse Quelle gelesen oder nur Kuriosa): Sprichwörter, OSINT, Formel-1-Technik, Autobegriffe, Filmklassiker, MacGyver, Ein Kunstwerk verstehen, Mathe & Wirtschaft.
// Finanzthemen: ausdrücklich keine Anlageberatung.
const DATE = "23. November 2026";
const PM = (id: string) => `https://pubmed.ncbi.nlm.nih.gov/${id}/`;

export const DOSSIERS_WISSEN2: Record<string, Dossier> = {
  "Mathe auffrischen": {
    date: DATE,
    steckbrief: {
      about: "Schulmathematik wieder abrufbar machen. Nach der Forschung zum Lernen hilft dabei vor allem, Aufgaben selbst zu lösen und Gelerntes aus dem Gedächtnis abzurufen, statt Lösungen nur nachzulesen.",
      why: "Eine Auswertung von 222 Studien mit 48.478 Schülerinnen und Schülern fand, dass Abfragen (Quizze) die Schulleistung mittelstark steigern (g = 0,499). Üben mit Abständen gehört in einer großen Übersicht ebenfalls zu den Techniken mit hohem Nutzen.",
      tips: "Erst eine Aufgabe ohne Hilfe versuchen, dann die Lösung prüfen. Dieselbe Aufgabenart nach einigen Tagen noch einmal rechnen (Vorschlag, abgeleitet aus [2][3]).",
      safety: "Keine besonderen Risiken.",
    },
    learn: [
      "Das „Testing-Effekt“ genannte Phänomen: Wer Stoff abruft, behält ihn langfristig besser als jemand, der ihn nur erneut liest. In einem klassischen Experiment war Wiederlesen nach 5 Minuten besser, in den Tests nach 2 Tagen und 1 Woche war vorheriges Abfragen deutlich überlegen, obwohl Wiederlesen die Zuversicht der Teilnehmenden stärker erhöhte. [1]",
      "Im Unterricht außerhalb des Labors: Die Meta-Analyse (222 Studien, 48.478 Lernende) fand einen mittleren Effekt (g = 0,499). Er hing unter anderem von Rückmeldung mit Korrektur, Anzahl der Wiederholungen und Passung zwischen Übungs- und Prüfungsform ab. [2]",
      "Die Übersichtsarbeit von Dunlosky et al. (2013) bewertete zehn Lerntechniken. Abfragen (practice testing) und verteiltes Üben erhielten hohe Nützlichkeit, weil sie bei verschiedenen Altersgruppen, Aufgaben und in Bildungskontexten halfen; Markieren und Wiederlesen gehörten zu den geprüften Techniken. Zu den untersuchten Materialien zählen ausdrücklich mathematische Aufgaben. [3]",
      "Einschränkung: Die Studien messen Schul- und Laboraufgaben. Ein Studienvergleich speziell für Erwachsene, die Schulmathematik auffrischen, wurde hier nicht gelesen.",
    ],
    evidence: { level: "gut", why: "Abfragen und verteiltes Üben sind in Meta-Analysen und großen Übersichten gut belegt; speziell für Erwachsene beim Auffrischen von Mathe wurde keine Studie gelesen." },
    steps: [
      "Ein Themengebiet wählen, z. B. Bruchrechnen, Prozent oder Gleichungen (Vorschlag).",
      "Zehn Aufgaben ohne Nachschlagen rechnen; erst danach Lösungen vergleichen. [2]",
      "Fehler mit Korrektur und kurzer Begründung auf einer Karte notieren. [2]",
      "Nach einigen Tagen neue Aufgaben derselben Art rechnen, nicht nur dieselben nachlesen. [3]",
      "Schwierigere Themen nach und nach hinzunehmen (Vorschlag).",
    ],
    plan: [
      { title: "Woche 1", text: "Drei Einheiten à 20 Minuten, je ein Thema, erst Aufgaben, dann Lösungen (Vorschlag)." },
      { title: "Woche 2–4", text: "Altes Thema kurz wiederholen, dann ein neues beginnen; Zeitabstände wachsen lassen. [3]" },
    ],
    myths: [
      { myth: "Wiederlesen des Stoffs reicht zum Behalten.", fact: "Nach 2 Tagen und 1 Woche schnitt Abfragen deutlich besser ab als Wiederlesen, auch wenn sich Wiederlesen sicherer anfühlte. [1]" },
    ],
    mistakes: ["Lösungen nachlesen, ohne selbst zu rechnen.", "Alle Aufgaben direkt hintereinander, ohne spätere Wiederholung."],
    safety: [],
    conflicts: ["Im Labor kann Wiederlesen kurzfristig besser abschneiden; der Vorteil des Abfragens zeigt sich bei verzögerten Tests. [1]"],
    videos: [
      { title: "Retrieval Practice: A video for Students", id: "jfREWvtd_DM", channel: "The Learning Scientists", why: "Erklärt Abrufübung für Lernende; von Forschenden betrieben. Inhalt nur nach Titel beurteilt.", checked: true },
      { title: "Study Strategies: Retrieval Practice", id: "Pjrqc6UMDKM", channel: "The Learning Scientists", why: "Gespräch zweier Lernforscherinnen zur Abrufübung. Inhalt nur nach Titel beurteilt.", checked: true },
    ],
    videoNote: "Zwei geprüfte Videos (englisch); Inhalte nicht angesehen.",
    sources: [
      { title: "Roediger & Karpicke 2006, Psychol Sci – Test-enhanced learning: taking memory tests improves long-term retention", url: PM("16507066"), kind: "Studie" },
      { title: "Yang et al. 2021, Psychol Bull – Testing (quizzing) boosts classroom learning: a systematic and meta-analytic review", url: PM("33683913"), kind: "Meta-Analyse" },
      { title: "Dunlosky et al. 2013, Psychol Sci Public Interest – Improving students' learning with effective learning techniques", url: PM("26173288"), kind: "Übersichtsarbeit" },
    ],
  },

  "Englischer Wortschatz": {
    date: DATE,
    steckbrief: {
      about: "Englische Wörter systematisch lernen. „Alle Wörter“ ist nicht erreichbar; Forschung nennt aber Größenordnungen, die für Lesen und Hören nötig sind.",
      why: "Für das Verstehen von Texten ohne Hilfe wurden nach einer Korpusstudie 8.000 bis 9.000 Wortfamilien (geschrieben) und 6.000 bis 7.000 (gesprochen) berechnet, wenn 98 % der Wörter bekannt sein sollen.",
      tips: "Häufige Wörter zuerst, regelmäßig mit Abständen wiederholen und Wörter aus dem Gedächtnis abrufen (Vorschlag, abgeleitet aus [3][4]).",
      safety: "Keine besonderen Risiken.",
    },
    learn: [
      "Wie viele Wörter muss man kennen? Nation (2006) prüfte 14 Listen zu je 1.000 Wortfamilien aus dem British National Corpus. Sollen 98 % eines Textes bekannt sein, braucht man laut Ergebnis 8.000 bis 9.000 Wortfamilien für geschriebene und 6.000 bis 7.000 für gesprochene Texte. [1]",
      "Zum Vergleich: Brysbaert et al. (2016) schätzen, dass ein durchschnittlicher 20-jähriger Muttersprachler des amerikanischen Englisch 42.000 Lemmata kennt (11.100 Wortfamilien); zwischen 20 und 60 kommen im Mittel etwa 6.000 Lemmata dazu. [2]",
      "Für das Behalten: Eine Meta-Analyse (839 Prüfungen aus 317 Experimenten) zum verteilten Üben bei Wortabruf-Aufgaben fand, dass der beste Abstand zwischen den Lerneinheiten mit der geplanten Behaltensdauer wächst. [3]",
      "Dunlosky et al. (2013) stuften Abfragen und verteiltes Üben als Techniken mit hoher Nützlichkeit ein. [4] Eine Studie speziell zu Wortschatz-Lern-Apps wurde hier nicht gelesen.",
    ],
    evidence: { level: "teilweise", why: "Wortschatzgrößen und Lernprinzipien sind belegt; Studien zu einzelnen Methoden des Vokabellernens wurden nicht gelesen." },
    steps: [
      "Aktuellen Stand grob bestimmen, z. B. mit einem Wortschatztest (Vorschlag).",
      "Mit den häufigsten Wörtern beginnen, nicht alphabetisch (Vorschlag, nach [1]).",
      "Täglich 10–15 Minuten, Wörter erst aus dem Gedächtnis nennen, dann prüfen. [4]",
      "Wiederholungsabstände langsam vergrößern. [3]",
      "Neue Wörter in Lesetexten oder Hörtexten wiedertreffen (Vorschlag).",
    ],
    plan: [
      { title: "Täglich", text: "10–15 Minuten Karteikarten im Wiederholungsplan der App (Vorschlag)." },
      { title: "Langfristig", text: "Große Ziele wie 8.000 Wortfamilien brauchen Jahre; Zwischenziele pro Monat setzen (Vorschlag)." },
    ],
    myths: [
      { myth: "Man kann „alle englischen Wörter“ lernen.", fact: "Selbst Muttersprachler kennen im Mittel rund 42.000 Lemmata; die Zahl hängt von der Wortdefinition ab. [2]" },
    ],
    mistakes: ["Nur Listen lesen, ohne abzurufen.", "Alles an einem Tag lernen statt verteilt."],
    safety: [],
    conflicts: ["Wortschatzzahlen hängen stark davon ab, was als „Wort“ gilt (Lemma, Wortfamilie, Wortform). [2]", "Die Meta-Analyse zum Spacing betrifft Wortabruf-Aufgaben im Labor, nicht den freien Spracherwerb. [3]"],
    videos: [],
    videoNote: "Kein geprüftes Video eingebunden.",
    sources: [
      { title: "Nation 2006, Canadian Modern Language Review – How large a vocabulary is needed for reading and listening?", url: "https://doi.org/10.26686/wgtn.12552221", kind: "Korpusstudie" },
      { title: "Brysbaert et al. 2016, Front Psychol – How many words do we know?", url: PM("27524974"), kind: "Studie" },
      { title: "Cepeda et al. 2006, Psychol Bull – Distributed practice in verbal recall tasks", url: PM("16719566"), kind: "Meta-Analyse" },
      { title: "Dunlosky et al. 2013, Psychol Sci Public Interest – Improving students' learning with effective learning techniques", url: PM("26173288"), kind: "Übersichtsarbeit" },
    ],
  },

  "Investieren": {
    date: DATE,
    steckbrief: {
      about: "Geld langfristig in Wertpapiere anlegen. Dieses Dossier gibt keine Anlageberatung; es fasst Forschung zu Kosten und Verhaltensfehlern zusammen.",
      why: "Studien aus den USA zeigen: Hohe Handelsaktivität kostete Privatanleger Rendite, und aktiv verwaltete Fonds geben ihre Kosten an die Anleger weiter.",
      tips: "Kosten, Zeithorizont und das eigene Verhalten (Überschätzung, zu häufiges Handeln) bewusst prüfen. Die Quellen sind US-Daten aus der Vergangenheit; sie sagen nichts über künftige Renditen.",
      safety: "Wertpapiere können im Wert fallen, Verluste bis zum Totalverlust sind möglich. Keine Anlageberatung; bei konkreten Entscheidungen unabhängige Beratung einholen.",
    },
    learn: [
      "Kosten: French (2008) verglich, was die US-Gesellschaft für Gebühren und Handelskosten beim Aktieninvestieren ausgibt, mit einem rein passiven Markt. Für 1980–2006 fand er Ausgaben von 0,67 % des Marktwerts pro Jahr für die Suche nach Überrenditen; ein typischer Anleger hätte mit einem passiven Marktportfolio durchschnittlich 67 Basispunkte mehr pro Jahr erzielt. [1]",
      "Aktive Fonds: Fama & French (2010) fanden, dass das Gesamtportfolio aktiv verwalteter US-Aktienfonds nahe am Marktportfolio liegt und die hohen Kosten als geringere Renditen bei den Anlegern ankommen. Nur wenige Fonds erzielten nach Simulationen Überrenditen, die ihre Kosten decken; in den Extremen gibt es Hinweise auf schlechtere und bessere Fonds. [2]",
      "Verhalten: Barber & Odean (2000) werteten 66.465 Haushalte bei einem Discountbroker (1991–1996) aus. Die Haushalte mit dem meisten Handel erzielten 11,4 % pro Jahr, der Markt 17,9 %; der Durchschnittshaushalt 16,4 % bei 75 % Umschlag. Als Erklärung nennen die Autoren Überschätzung der eigenen Fähigkeiten. [3]",
      "Einordnung: Alle drei Quellen betreffen US-Märkte und vergangene Zeiträume. Ob sich das auf deine Situation übertragen lässt, ist eine Annahme.",
    ],
    evidence: { level: "teilweise", why: "Kosten- und Verhaltenseffekte sind in Studien belegt, aber auf US-Daten vergangener Jahrzehnte; Ergebnisse für die Zukunft sind nicht ableitbar." },
    steps: [
      "Eigene Ziele und Zeithorizont schriftlich festhalten (Vorschlag).",
      "Notgroschen und laufende Kosten klären, bevor Geld angelegt wird (Vorschlag).",
      "Gesamtkosten (Fondsgebühren, Handelskosten) vergleichen. [1][2]",
      "Handelshäufigkeit begrenzen; Entscheidungen vorher festlegen. [3]",
      "Für konkrete Anlageentscheidungen unabhängige, qualifizierte Beratung nutzen (Hinweis).",
    ],
    plan: [
      { title: "Lernen", text: "Pro Woche eine Quelle lesen und die Kernaussage notieren (Vorschlag)." },
      { title: "Handeln", text: "Erst nach Klärung von Kosten und Risiko, nicht aus Renditeversprechen (Vorschlag)." },
    ],
    myths: [
      { myth: "Wer oft handelt, erzielt mehr Rendite.", fact: "In der Stichprobe von 66.465 US-Haushalten erzielten die aktivsten Händler 11,4 % gegenüber 17,9 % des Marktes. [3]" },
    ],
    mistakes: ["Zu hohe Handelsaktivität.", "Kosten ignorieren.", "Verlustrisiko unterschätzen."],
    safety: ["Keine Anlageberatung. Wertpapiere können im Wert sinken; Verlust des eingesetzten Geldes ist möglich.", "Nur Geld einsetzen, das längere Zeit nicht gebraucht wird (Vorsichtsregel, keine Leitlinie)."],
    conflicts: ["Fama & French sehen in den Extremen der Fondsverteilung sowohl schlechte als auch gute Fonds; es gibt nach Kosten also nicht „nur Verlierer“. [2]", "Die Studien decken unterschiedliche Zeiträume ab und sagen nichts über die Zukunft. [1][2][3]"],
    videos: [],
    videoNote: "Kein geprüftes Video eingebunden.",
    sources: [
      { title: "French 2008, The Journal of Finance – Presidential Address: The Cost of Active Investing", url: "https://doi.org/10.1111/j.1540-6261.2008.01368.x", kind: "Studie" },
      { title: "Fama & French 2010, The Journal of Finance – Luck versus Skill in the Cross-Section of Mutual Fund Returns", url: "https://doi.org/10.1111/j.1540-6261.2010.01598.x", kind: "Studie" },
      { title: "Barber & Odean 2000, The Journal of Finance – Trading Is Hazardous to Your Wealth", url: "https://doi.org/10.1111/0022-1082.00226", kind: "Studie" },
    ],
  },

  "Trading": {
    date: DATE,
    steckbrief: {
      about: "Aktives Kaufen und Verkaufen von Finanzinstrumenten in kurzer Zeit, bis hin zum Daytrading. Keine Anlageberatung. Die Daten zeigen: Die große Mehrheit der Privatleute verliert Geld.",
      why: "In Brasilien verloren 97 % der Daytrader, die länger als 300 Tage durchhielten; EU-Aufseher nennen für CFD-Konten Verlustquoten von 74 bis 89 %.",
      tips: "Wer Trading lernen will, sollte es als riskanten Zeitvertreib mit erwartbarem Verlust behandeln, nicht als Einkommensquelle. Nur Beträge einsetzen, deren Verlust verkraftbar ist (Vorsichtsregel, keine Leitlinie).",
      safety: "Hohes Verlustrisiko, bei gehebelten Produkten (CFDs) bis über den Einsatz hinaus. Keine Anlageberatung.",
    },
    learn: [
      "Brasilien: Chague, De-Losso und Giovannetti beobachteten alle Personen, die 2013–2015 im brasilianischen Aktienindex-Futuremarkt mit Daytrading begannen und mindestens 300 Tage durchhielten. 97 % verloren Geld, nur 0,4 % verdienten mehr als ein Bankangestellter (54 US-Dollar pro Tag), der beste Einzelne 310 US-Dollar pro Tag bei hohem Risiko. Einen Lerneffekt durch Daytrading fanden die Autoren nicht. [1]",
      "EU: Nach der ESMA-Mitteilung von 2018 zeigen Analysen nationaler Aufsichtsbehörden, dass 74–89 % der Privatkunden-Konten mit CFDs Geld verlieren; der Durchschnittsverlust je Kunde lag zwischen 1.600 und 29.000 Euro. ESMA beschränkte daraufhin den Vertrieb von CFDs an Privatanleger (u. a. Hebelgrenzen) und verbot binäre Optionen. [2]",
      "Allgemein: Auch in einer Auswertung von 66.465 US-Haushalten schnitten die aktivsten Händler deutlich schlechter ab als der Markt (11,4 % gegenüber 17,9 % pro Jahr). [3]",
      "Einordnung: Die 97 % gelten nur für die, die über 300 Tage weitermachten, nicht für alle Anfänger, und für einen bestimmten Markt. Die ESMA-Zahl stammt von 2018. [1][2]",
    ],
    evidence: { level: "teilweise", why: "Mehrere Quellen aus verschiedenen Märkten zeigen hohe Verlustquoten, jedoch mit unterschiedlichen Stichproben, Zeiträumen und Produkten." },
    steps: [
      "Zuerst die Verlustzahlen lesen (Quellen [1][2]), bevor Geld eingesetzt wird.",
      "Handelsplan schriftlich festlegen, inklusive maximalem Verlust (Vorschlag).",
      "Zunächst nur mit Demokonto oder sehr kleinen Beträgen üben (Vorschlag).",
      "Ergebnisse inklusive aller Kosten protokollieren (Vorschlag).",
      "Gehebelte Produkte meiden, solange Verlustmechanik nicht verstanden ist (Vorsichtsregel, keine Leitlinie).",
    ],
    plan: [
      { title: "Lernphase", text: "Begriffe, Kosten und Risiken lesen; kein echtes Geld, bis Regeln stehen (Vorschlag)." },
      { title: "Prüfen", text: "Nach drei Monaten Protokoll auswerten: Ergebnis nach Kosten, nicht nur Gewinntrades (Vorschlag)." },
    ],
    myths: [
      { myth: "Daytrading ist ein realistischer Beruf für Einsteiger.", fact: "Von den Ausdauernden verloren 97 %; die Autoren nennen es „praktisch unmöglich“, vom Daytrading zu leben. [1]" },
    ],
    mistakes: ["Verluste ausgleichen wollen durch größere Einsätze.", "Gebühren und Spreads nicht mitrechnen.", "Hebelprodukte ohne Verständnis nutzen."],
    safety: ["Keine Anlageberatung. Verluste bis zum Totalverlust sind möglich.", "ESMA nennt für CFDs unter anderem Hebelgrenzen und einen Schutz vor negativem Kontostand; für andere Produkte und Anbieter außerhalb der EU gilt das nicht automatisch (Hinweis, Bedingungen vorab prüfen). [2]"],
    conflicts: ["Die Brasilien-Studie betrachtet nur Ausdauernde und einen Futuremarkt; die ESMA-Spanne betrifft CFD-Konten. Beides ist nicht direkt auf Aktien-Daytrading in Deutschland übertragbar. [1][2]"],
    videos: [],
    videoNote: "Kein geprüftes Video eingebunden.",
    sources: [
      { title: "Chague, De-Losso & Giovannetti 2020, FGV EESP Textos para discussão 525 – Day trading for a living?", url: "https://ideas.repec.org/p/fgv/eesptd/525.html", kind: "Arbeitspapier" },
      { title: "ESMA 2018 – ESMA agrees to prohibit binary options and restrict CFDs to protect retail investors", url: "https://www.esma.europa.eu/press-news/esma-news/esma-agrees-prohibit-binary-options-and-restrict-cfds-protect-retail-investors", kind: "Behörde" },
      { title: "Barber & Odean 2000, The Journal of Finance – Trading Is Hazardous to Your Wealth", url: "https://doi.org/10.1111/0022-1082.00226", kind: "Studie" },
    ],
  },

  "Was ist Geld?": {
    date: DATE,
    steckbrief: {
      about: "Geld verstehen: wozu es dient, warum es funktioniert und was Vertrauen damit zu tun hat. Grundlage ist die Lehrbuchdarstellung der Deutschen Bundesbank.",
      why: "Geld ist weniger ein Stoff als eine allgemein anerkannte Vereinbarung; ohne Geld wäre Wirtschaft nur mit direktem Tausch möglich.",
      tips: "Die drei Funktionen (Tausch-/Zahlungsmittel, Recheneinheit, Wertaufbewahrung) als Raster nutzen und jede Frage dazu einordnen (Vorschlag).",
      safety: "Keine besonderen Risiken.",
    },
    learn: [
      "Ohne Geld gäbe es nach der Bundesbank eine Tauschwirtschaft: Man müsste jemanden finden, der genau das anbietet, was man sucht, und braucht, was man tauscht. Geld ersetzt den direkten Tausch durch „Ware gegen Geld“ und „Geld gegen Ware“. [1]",
      "Die Bundesbank nennt drei Funktionen: Tausch- und Zahlungsmittel, Recheneinheit und Wertaufbewahrungsmittel. Als Recheneinheit macht Geld Werte vergleichbar: Bei 100 Waren gibt es 4.950 Tauschverhältnisse, mit Geld nur 100 Preise. [1]",
      "Heute hat Geld keinen eigenen Materialwert mehr; es kommt darauf an, den Nominalwert zu erhalten, was Aufgabe der Zentralbanken ist. [1]",
      "Die Bundesbank betont außerdem, dass Geld seine Funktionen nur erfüllt, wenn Menschen ihm vertrauen. [2]",
    ],
    evidence: { level: "gut", why: "Grundbegriffe stammen aus der Lehrbuchdarstellung der Zentralbank; zu Streitfragen der Geldtheorie wurde nichts gelesen." },
    steps: [
      "Die drei Funktionen mit eigenen Beispielen aufschreiben. [1]",
      "Das Beispiel „100 Waren, 4.950 Tauschverhältnisse“ nachrechnen: n(n−1)/2. [1]",
      "Die Formen des Geldes im Lehrbuchkapitel nachlesen. [1]",
      "Den Text zu Vertrauen und Geld lesen. [2]",
    ],
    plan: [{ title: "Eine Woche", text: "Kapitel 1 des Bundesbank-Schülerbuchs lesen, danach den Vertrauens-Text (Vorschlag)." }],
    myths: [],
    mistakes: ["Geld nur als Münzen und Scheine verstehen; das Lehrbuch nennt weitere Formen. [1]"],
    safety: [],
    conflicts: ["Die gelesenen Quellen sind eine Zentralbank-Perspektive; abweichende Theorien wurden nicht gelesen."],
    videos: [],
    videoNote: "Kein geprüftes Video eingebunden.",
    sources: [
      { title: "Deutsche Bundesbank – Geld und Geldpolitik (Schülerbuch), Kapitel 1: Funktionen und Formen des Geldes", url: "https://publikationen.bundesbank.de/content/921582", kind: "Zentralbank" },
      { title: "Deutsche Bundesbank – Vertrauen – Kern des Geldes", url: "https://www.bundesbank.de/de/aufgaben/themen/vertrauen-kern-des-geldes-663226", kind: "Zentralbank" },
    ],
  },

  "Philosophie": {
    date: DATE,
    steckbrief: {
      about: "Antike Philosophie lesen und anwenden, besonders die Stoiker (Seneca, Epiktet, Marc Aurel). Als Therapie ist Stoizismus nur in kleinen Studien untersucht.",
      why: "Von den Stoikern sind vollständige Werke nur aus der römischen Kaiserzeit erhalten; Seneca, Epiktet und Marc Aurel behandeln vor allem die Ethik.",
      tips: "Mit einem kurzen Originaltext beginnen und eine Aussage pro Woche im Alltag prüfen (Vorschlag).",
      safety: "Kein Ersatz für Behandlung bei psychischen Erkrankungen.",
    },
    learn: [
      "Nach der Stanford Encyclopedia of Philosophy war die Stoa eine der bestimmenden Schulen der hellenistischen Zeit. Vollständig erhalten sind nur Schriften aus der Kaiserzeit, nämlich von Seneca, Epiktet und Marc Aurel, dazu weniger bekannte Autoren; Seneca war Berater Neros. [1]",
      "Zwei umstrittene Lehren der stoischen Ethik: Glück liegt vollständig in unserer Macht, und Tugend ist das einzige Gut. [1]",
      "Wirkung auf Wohlbefinden: Eine randomisierte Studie mit 50 Dialysepatienten (je 25 pro Gruppe) fand nach 8 Wochen Stoizismus-Training weniger psychische Belastung (β = 4,75; p = 0,02); die Autoren fordern längere Programme. [2]",
      "Ein Fachartikel (2023) zu Stottern hält fest, dass Stoizismus Techniken enthält, die moderne Psychotherapien (z. B. kognitive Verhaltenstherapie) geprägt haben, und empfiehlt wissenschaftliche Prüfung. [3]",
      "Einordnung: Es wurden nur eine kleine Studie und ein Diskussionsartikel gelesen; ob Stoizismus im Alltag gesunder Menschen wirkt, ist damit nicht belegt.",
    ],
    evidence: { level: "kaum", why: "Nur eine kleine randomisierte Studie bei Dialysepatienten und ein Diskussionsartikel wurden gelesen; belastbare Evidenz für den Alltag fehlt." },
    steps: [
      "Einen kurzen Text von Seneca, Epiktet oder Marc Aurel wählen (Vorschlag).",
      "Eine Aussage in eigenen Worten festhalten und im Alltag auf ein Beispiel anwenden (Vorschlag).",
      "Am Abend notieren, was in der eigenen Macht lag und was nicht. [1]",
      "Nach einem Monat Notizen ansehen und prüfen, was geholfen hat (Vorschlag).",
    ],
    plan: [{ title: "Wöchentlich", text: "Ein Abschnitt, ein Gedanke, eine Anwendung (Vorschlag)." }],
    myths: [],
    mistakes: ["Nur Zitate sammeln, ohne zu prüfen, ob sie helfen."],
    safety: ["Bei anhaltender Belastung, Depression oder Angst professionelle Hilfe suchen."],
    conflicts: ["Wirkung auf Distress in einer kleinen Studie; weitere Forschung wird gefordert. [2][3]"],
    videos: [],
    videoNote: "Kein geprüftes Video eingebunden.",
    sources: [
      { title: "Stanford Encyclopedia of Philosophy – Stoicism", url: "https://plato.stanford.edu/entries/stoicism/", kind: "Nachschlagewerk" },
      { title: "Boostani et al. 2026, Health Sci Rep – The Effectiveness of a Stoicism-Based Educational Package on Psychological Distress and Self-Efficacy in Patients Under Hemodialysis", url: PM("42835372"), kind: "Randomisierte Studie" },
      { title: "Connery & Cavanna 2023, Int J Lang Commun Disord – Can Stoicism inspire stuttering intervention?", url: PM("36541230"), kind: "Fachartikel" },
    ],
  },

  "Ethical Hacking": {
    date: DATE,
    steckbrief: {
      about: "Computersysteme mit Erlaubnis auf Schwachstellen prüfen. Rechtlich entscheidend sind Auftrag und Befugnis; ohne sie droht Strafbarkeit. Dies ist keine Rechtsberatung.",
      why: "Das BSI rät, nie ohne schriftlichen Auftrag zu testen; Orientierung bieten außerdem Behörden (BSI) und Gemeinschaftsstandards wie die OWASP Top 10.",
      tips: "Nur in eigenen Laboren oder mit schriftlicher Erlaubnis üben. Webthemen mit den OWASP Top 10 beginnen. [3]",
      safety: "Unbefugter Zugriff auf fremde Systeme kann strafbar sein. Nie ohne ausdrückliche Erlaubnis testen.",
    },
    learn: [
      "Das BSI rät im Praxis-Leitfaden für Penetrationstests, nie ohne schriftlichen Auftrag zu testen und immer einen Vertrag zwischen Prüfern und getesteter Institution zu schließen; liegen Dienste bei einem Hoster, ist auch dieser einzubeziehen. [1]",
      "Strafrecht: § 202a StGB (Ausspähen von Daten) bestraft, wer unbefugt Zugang zu besonders gesicherten Daten verschafft, mit Freiheitsstrafe bis zu drei Jahren oder Geldstrafe. § 202c StGB (Vorbereiten) betrifft das Herstellen oder Verbreiten von Passwörtern und Computerprogrammen, deren Zweck eine solche Tat ist. Der gelesene Gesetzestext (Fassung von 2015) nennt dort Freiheitsstrafe bis zu zwei Jahren; die aktuelle Fassung bitte im amtlichen Gesetzestext prüfen. [2]",
      "Die OWASP Top 10 gelten als Referenzstandard für die kritischsten Risiken von Webanwendungen; die aktuelle Fassung ist die OWASP Top 10 2025. [3]",
      "Zertifizierungen und Lernplattformen wurden nicht geprüft; hier bewusst keine Empfehlung.",
    ],
    evidence: { level: "kaum", why: "Es gibt keine Lernstudien zum Weg; belegt sind Rechtsrahmen und Standardwerke, nicht die Wirksamkeit von Lernmethoden." },
    steps: [
      "Rechtsrahmen lesen: §§ 202a, 202c StGB und BSI-Leitfaden. [1][2]",
      "Eine eigene Laborumgebung aufbauen, z. B. virtuelle Maschinen im eigenen Netz (Vorschlag).",
      "Die OWASP Top 10 durcharbeiten. [3]",
      "Nur mit schriftlicher Erlaubnis außerhalb des eigenen Labors testen. [1]",
    ],
    plan: [{ title: "Erste Monate", text: "Erst Recht und Grundlagen, dann Laborübungen zu je einer OWASP-Kategorie (Vorschlag)." }],
    myths: [],
    mistakes: ["Fremde Systeme „nur zum Testen“ prüfen.", "Werkzeuge ohne Verständnis der Rechtslage einsetzen."],
    safety: ["Unbefugtes Eindringen in fremde Systeme ist strafbar (§ 202a StGB). [2]", "Eigene Geräte und Netze isoliert üben (Vorsichtsregel, keine Leitlinie)."],
    conflicts: ["Die Rechtslage kann sich ändern und ist nicht abschließend dargestellt; Rechtsrat einholen. [2]"],
    videos: [],
    videoNote: "Kein geprüftes Video eingebunden.",
    sources: [
      { title: "BSI – Ein Praxis-Leitfaden für IS-Penetrationstests", url: "https://www.bsi.bund.de/SharedDocs/Downloads/DE/BSI/Sicherheitsberatung/Pentest_Webcheck/Leitfaden_Penetrationstest.pdf?__blob=publicationFile&v=10", kind: "Behörde" },
      { title: "Strafgesetzbuch § 202a und § 202c (Lexetius, Textfassungen)", url: "https://lexetius.com/StGB/202c", kind: "Gesetzestext" },
      { title: "OWASP – Top 10 Web Application Security Risks", url: "https://owasp.org/www-project-top-ten/", kind: "Standard" },
    ],
  },

  "Politik verstehen": {
    date: DATE,
    steckbrief: {
      about: "Politische Zusammenhänge verstehen, etwa Gewaltenteilung und politische Bildung. Grundlage sind Angebote der Bundeszentrale für politische Bildung (bpb).",
      why: "Politische Bildung folgt in Deutschland dem Beutelsbacher Konsens: keine Indoktrination, Kontroverses kontrovers darstellen, eigene Interessen analysieren.",
      tips: "Zu strittigen Themen mehrere Positionen lesen, bevor du dir eine Meinung bildest. [1]",
      safety: "Keine besonderen Risiken.",
    },
    learn: [
      "Der Beutelsbacher Konsens (1976, Beutelsbach, Baden-Württemberg) fasst drei Elemente zusammen: Überwältigungsverbot (keine Indoktrination), Beachtung kontroverser Positionen in Wissenschaft und Politik, Befähigung zur Analyse eigener Interessen in politischen Situationen. [1]",
      "Gewaltenteilung: Nach dem bpb-Politiklexikon soll die Teilung in gesetzgebende, ausführende und rechtsprechende Gewalt die Konzentration und den Missbrauch politischer Macht verhindern. Die Lehre entwickelten Locke (1690) und Montesquieu (1748); in Deutschland steht sie in Art. 20 Abs. 2 GG. [2]",
      "Gewaltenteilung heißt in der Praxis auch Verschränkung: Die Exekutive braucht gesetzliche Grundlagen, die Legislative ist auf Umsetzung durch Regierung und Verwaltung angewiesen. [2]",
      "Einordnung: Es gibt keine Studien zum „besten Lernweg“; die bpb ist eine anerkannte Quelle, bildet aber nur einen Teil der Perspektiven ab.",
    ],
    evidence: { level: "kaum", why: "Zum Lernweg gibt es keine Studien; belegt sind die Inhalte durch bpb-Quellen." },
    steps: [
      "Den Beutelsbacher Konsens lesen. [1]",
      "Das Prinzip der Gewaltenteilung am Grundgesetz nachvollziehen. [2]",
      "Zu einem aktuellen Thema zwei gegensätzliche Positionen aus verschiedenen Quellen lesen. [1]",
      "Begriffe im bpb-Politiklexikon nachschlagen (Vorschlag).",
    ],
    plan: [{ title: "Wöchentlich", text: "Ein Lexikonbegriff und ein Thema mit Pro und Contra (Vorschlag)." }],
    myths: [],
    mistakes: ["Nur eine Informationsquelle nutzen."],
    safety: [],
    conflicts: ["Politische Themen sind kontrovers; der Beutelsbacher Konsens verlangt gerade, dies sichtbar zu machen. [1]"],
    videos: [],
    videoNote: "Kein geprüftes Video eingebunden.",
    sources: [
      { title: "bpb – Beutelsbacher Konsens", url: "https://www.bpb.de/die-bpb/ueber-uns/auftrag/51310/beutelsbacher-konsens/", kind: "Behörde" },
      { title: "bpb – Politiklexikon: Gewaltenteilung/Gewaltenverschränkung", url: "https://www.bpb.de/kurz-knapp/lexika/politiklexikon/17567/gewaltenteilung-gewaltenverschraenkung/", kind: "Lexikon" },
    ],
  },

  "Geopolitik": {
    date: DATE,
    steckbrief: {
      about: "Geopolitik verbindet Geografie und Politik. Der Begriff ist belastet und ungenau; wer ihn nutzt, sollte wissen, was gemeint ist.",
      why: "Der Begriff taucht in der Politik ständig auf; die bpb warnt, dass er oft eine Worthülse mit wechselndem Inhalt ist.",
      tips: "Bei geopolitischen Aussagen fragen: Welche Raumfaktoren werden genannt, und wer profitiert von der Erklärung? [2]",
      safety: "Keine besonderen Risiken.",
    },
    learn: [
      "Das bpb-Politiklexikon beschreibt Geopolitik als wissenschaftliches Bemühen, Aspekte von Geografie, Geschichte, Bevölkerungs- und Staatswissenschaft zur Erklärung des Verhältnisses von Raum und Politik zu nutzen. Politisch ist sie belastet, weil Theorien vom „deutschen Lebensraum“ von rechtsradikaler und nazistischer Propaganda verbreitet wurden; heute sei sie einer praktisch orientierten politischen Geografie gewichen. [1]",
      "Ein bpb-Beitrag (APuZ) schreibt: Geopolitische Argumentationen spielen weiterhin eine wichtige Rolle. Der Begriff bleibe aber oft vage, und es sei ein Missverständnis, dass es eine stringente Schule oder ein feststehendes Theoriekonzept gebe. Neben klassischen Konzepten setze sich ein alternatives Verständnis durch, das räumliche Abgrenzung selbst als machtpolitisches Mittel versteht. [2]",
      "Einordnung: Es gibt keine Studien zum Lernweg; als Einstieg dienen bpb-Lexikon und -Beiträge. Aussagen über aktuelle Konflikte sind hier nicht enthalten.",
    ],
    evidence: { level: "kaum", why: "Zum Lernen von Geopolitik gibt es keine Studien; belegt ist nur die begriffliche Einordnung durch bpb-Quellen." },
    steps: [
      "Das bpb-Lexikon zu Geopolitik lesen. [1]",
      "Den APuZ-Beitrag lesen und die Kritik am klassischen Verständnis notieren. [2]",
      "Eine aktuelle geopolitische Aussage in Nachrichten suchen und prüfen, welche Raumfaktoren sie nennt (Vorschlag).",
    ],
    plan: [{ title: "Zwei Wochen", text: "Woche 1 Begriff und Geschichte, Woche 2 Anwendung auf ein Beispiel (Vorschlag)." }],
    myths: [
      { myth: "Geopolitik ist ein festes Theoriegebäude.", fact: "Der bpb-Beitrag nennt das ein Missverständnis. [2]" },
    ],
    mistakes: ["Geografie als Schicksal verstehen; die bpb beschreibt das als Fehlerquelle der klassischen Geopolitik (Kritik der Determinismus-Annahme). [2]"],
    safety: [],
    conflicts: ["Klassische und kritische Geopolitik widersprechen sich: räumliche Faktoren als Ursache gegenüber Raum als gemachtes Machtinstrument. [2]"],
    videos: [],
    videoNote: "Kein geprüftes Video eingebunden.",
    sources: [
      { title: "bpb – Politiklexikon: Geopolitik", url: "https://www.bpb.de/kurz-knapp/lexika/politiklexikon/17546/geopolitik/", kind: "Lexikon" },
      { title: "bpb, APuZ – Geopolitik: Annäherung an ein schwieriges Konzept", url: "https://www.bpb.de/shop/zeitschriften/apuz/30477/geopolitik-annaeherung-an-ein-schwieriges-konzept/", kind: "Fachbeitrag" },
    ],
  },

  "Weltraumteleskope": {
    date: DATE,
    steckbrief: {
      about: "Verstehen, wie Weltraumteleskope wie James Webb und Hubble arbeiten. Grundlage sind Angaben der NASA.",
      why: "Webb beobachtet vor allem Infrarotstrahlung und steht weit entfernt von der Erde; Hubble umkreist die Erde in 560 Kilometern Höhe.",
      tips: "Webb und Hubble nebeneinander vergleichen: Ort, Wellenlängen, Startjahr. [1][2]",
      safety: "Keine besonderen Risiken.",
    },
    learn: [
      "Nach NASA startete Webb am 25. Dezember 2021. Es umkreist nicht die Erde wie Hubble, sondern die Sonne, 1,5 Millionen Kilometer von der Erde entfernt am zweiten Lagrange-Punkt (L2); Hubble umkreist die Erde in 560 Kilometern Höhe. [1]",
      "Webb ist ein Infrarot-Teleskop mit einem fünflagigen Sonnenschutz, der es vor der Infrarotstrahlung von Sonne, Erde und Mond schützt. Sein Spiegel ist groß, segmentiert und goldbeschichtet; das Teleskop musste zum Start gefaltet werden und entfaltete sich im All. [1]",
      "Webb kann nach NASA über 13,5 Milliarden Jahre zurückblicken, bis zu den ersten Galaxien nach dem Urknall. [1]",
      "Hubble startete am 24. April 1990 und hat nach NASA das Verständnis des Universums verändert, von Exoplaneten bis zur Dunklen Energie. [2]",
    ],
    evidence: { level: "gut", why: "Faktenlage stammt direkt von der NASA; Lernstudien gibt es nicht." },
    steps: [
      "Die NASA-Seiten zu Webb und Hubble lesen. [1][2]",
      "Eine Tabelle mit Startdatum, Standort und Wellenlängenbereich anlegen (Vorschlag).",
      "Ein Webb-Bild wählen und die dazugehörige NASA-Beschreibung lesen (Vorschlag).",
    ],
    plan: [{ title: "Ein Abend", text: "Beide NASA-Seiten lesen und ein Video ansehen (Vorschlag)." }],
    myths: [],
    mistakes: ["Webb und Hubble gleichsetzen; sie haben verschiedene Orte und Schwerpunkte. [1][2]"],
    safety: [],
    conflicts: [],
    videos: [
      { title: "An Introduction to the James Webb Space Telescope Mission", id: "6VqG3Jazrfs", channel: "NASA Goddard", why: "Einführung in Mission und Technik von der NASA. Inhalt nur nach Titel beurteilt.", checked: true },
    ],
    videoNote: "Nur ein geprüftes Video (englisch); Inhalt nicht angesehen.",
    sources: [
      { title: "NASA Science – James Webb Space Telescope", url: "https://science.nasa.gov/mission/webb/", kind: "Behörde" },
      { title: "NASA Science – Hubble Space Telescope", url: "https://science.nasa.gov/mission/hubble/", kind: "Behörde" },
    ],
  },

  "Das Universum": {
    date: DATE,
    steckbrief: {
      about: "Das Universum kennenlernen, von Sternen und Galaxien bis zu Dunkler Energie. Verlässliche Einstiege sind NASA und Universitäten; Studien zum Lernweg gibt es nicht.",
      why: "Teleskope wie Hubble und Webb haben das Bild vom Universum verändert, etwa durch die Entdeckung der Dunklen Energie und den Blick zu den ersten Galaxien.",
      tips: "Mit der Themenübersicht der NASA beginnen und je Thema (Sterne, Galaxien, Urknall) eine Seite lesen. [1]",
      safety: "Keine besonderen Risiken.",
    },
    learn: [
      "Die NASA-Seite „Universe“ gliedert das Wissensgebiet in Themen wie Exoplaneten, Sterne, Galaxien, Schwarze Löcher, Urknall, Dunkle Materie und Dunkle Energie. [1]",
      "Nach NASA hat Hubble das Verständnis des Universums verändert, von der Zusammensetzung der Planeten um andere Sterne bis zur Entdeckung der Dunklen Energie. [2]",
      "Webb kann über 13,5 Milliarden Jahre zurückblicken zu den ersten Galaxien nach dem Urknall. [3]",
      "Ehrlich: Es gibt keine Studien zum besten Lernweg; hier ist „Evidenz“ die Qualität der Wissensquellen (NASA als Forschungsbehörde).",
    ],
    evidence: { level: "kaum", why: "Keine Studien zum Lernen; die Inhaltsquellen sind gut, der Lernweg ist ein Vorschlag." },
    steps: [
      "Eine Themenübersicht der NASA ansehen. [1]",
      "Pro Woche ein Thema wählen, z. B. Galaxien (Vorschlag).",
      "Zu jedem Thema eine Frage notieren und in einer NASA-Seite beantworten (Vorschlag).",
    ],
    plan: [{ title: "Wöchentlich", text: "Ein Thema, 20 Minuten, drei Sätze Notizen (Vorschlag)." }],
    myths: [],
    mistakes: ["Populäre Videos ohne Quellenprüfung als Fakt übernehmen."],
    safety: [],
    conflicts: ["Dunkle Materie und Dunkle Energie sind offene Forschungsfragen; die NASA nennt sie als Themen, ohne sie hier abschließend zu klären. [1]"],
    videos: [],
    videoNote: "Kein geprüftes Video eingebunden.",
    sources: [
      { title: "NASA Science – The Universe", url: "https://science.nasa.gov/universe/", kind: "Behörde" },
      { title: "NASA Science – Hubble Space Telescope", url: "https://science.nasa.gov/mission/hubble/", kind: "Behörde" },
      { title: "NASA Science – James Webb Space Telescope", url: "https://science.nasa.gov/mission/webb/", kind: "Behörde" },
    ],
  },

  "Kerncurriculum BW": {
    date: DATE,
    steckbrief: {
      about: "Der Bildungsplan Baden-Württemberg legt fest, was in welchem Fach und welcher Klassenstufe gelernt wird. Die offizielle Quelle ist die Plattform bildungsplaene-bw.de.",
      why: "Die Fachpläne werden aktuell überarbeitet; wer sich orientieren will, sollte die gültige Version (V3.0) prüfen.",
      tips: "Eigene Schulart und Fächer auf der Plattform auswählen und Kompetenzen in eine Checkliste übertragen. [1]",
      safety: "Keine besonderen Risiken.",
    },
    learn: [
      "Nach der Startseite von bildungsplaene-bw.de sind zum 1. August 2026 zahlreiche Fachpläne des allgemeinbildenden Gymnasiums und der Sekundarstufe I in Kraft getreten (Versionsnummer V3.0). [1]",
      "Zu den neuen Bildungsplänen gibt es Beispielcurricula als Umsetzungshilfen sowie Implementierungstabellen, die zeigen, in welchem Schuljahr welche Fassung gilt. [1]",
      "Aktuell in Anhörung sind Fachpläne unter anderem für Informatik und Medienbildung, Gemeinschaftskunde, NIT und Wirtschaft/Berufs- und Studienorientierung. [1]",
      "Welche Inhalte genau in Prüfungen vorkommen, wurde hier nicht geprüft; dafür sind die jeweiligen Prüfungsvorgaben der Schulart maßgeblich.",
    ],
    evidence: { level: "gut", why: "Offizielle Plattform des Landes; Aussagen stammen direkt von der Startseite, Fachplaninhalte wurden nicht gelesen." },
    steps: [
      "Die Startseite bildungsplaene-bw.de öffnen. [1]",
      "Schulart, Fach und Klassenstufe wählen (Vorschlag).",
      "Die Kompetenzen des eigenen Fachs in eine Checkliste übertragen und Lücken markieren (Vorschlag).",
      "In der Implementierungstabelle prüfen, welche Fassung für das eigene Schuljahr gilt. [1]",
    ],
    plan: [{ title: "Einmalig", text: "Fächer durchsehen, danach pro Halbjahr die Checkliste prüfen (Vorschlag)." }],
    myths: [],
    mistakes: ["Eine veraltete Fassung des Bildungsplans nutzen."],
    safety: [],
    conflicts: ["Einzelne Fachpläne befinden sich in Anhörung und können sich ändern. [1]"],
    videos: [],
    videoNote: "Kein geprüftes Video eingebunden.",
    sources: [
      { title: "Bildungsplan Baden-Württemberg – Startseite", url: "https://www.bildungsplaene-bw.de/,Lde/Startseite", kind: "Behörde" },
    ],
  },

  "Probleme mit KI-Agenten lösen": {
    date: DATE,
    steckbrief: {
      about: "Aufgaben mit KI-Agenten lösen, also Sprachmodellen, die Werkzeuge in einer Schleife nutzen. Die Quelle ist eine Praxisdarstellung des Herstellers Anthropic, keine unabhängige Studie.",
      why: "Nach dieser Darstellung gelingt es meist mit einfachen, zusammensetzbaren Mustern; Komplexität sollte nur hinzukommen, wenn sie das Ergebnis nachweislich verbessert.",
      tips: "Mit einem einfachen Prompt beginnen, messen und erst bei Bedarf Agenten einsetzen. [1]",
      safety: "Agenten können Fehler häufen und Kosten verursachen; in abgesicherter Umgebung testen. [1]",
    },
    learn: [
      "Anthropic unterscheidet Workflows (Sprachmodelle und Werkzeuge über vorgegebene Codepfade) von Agenten (Modelle steuern Ablauf und Werkzeugnutzung dynamisch). Agenten sind typischerweise Sprachmodelle, die auf Rückmeldungen aus der Umgebung gestützt Werkzeuge in einer Schleife nutzen. [1]",
      "Empfehlung: Mit einfachen Prompts beginnen, mit Auswertungen optimieren und Agenten nur dann einsetzen, wenn einfachere Lösungen nicht reichen. Autonomie bedeutet höhere Kosten und mögliche Fehlerverkettung; empfohlen werden ausführliche Tests in Sandbox-Umgebungen mit Schutzmechanismen. [1]",
      "Drei Prinzipien: Einfachheit im Design, Transparenz durch Anzeige der Planungsschritte und sorgfältige Gestaltung der Schnittstelle zwischen Agent und Werkzeugen durch gute Dokumentation und Tests. [1]",
      "Hinweis der Quelle selbst: Vieles in der Werkzeuglandschaft habe sich seit Dezember 2024 verändert. [1]",
    ],
    evidence: { level: "kaum", why: "Nur eine Herstellerdarstellung gelesen; unabhängige Studien zu Vorgehensweisen wurden nicht geprüft." },
    steps: [
      "Aufgabe ohne Agent mit einem einfachen Prompt probieren. [1]",
      "Ergebnisse mit einer kleinen Testmenge messen. [1]",
      "Nur bei Bedarf Werkzeuge ergänzen und deren Beschreibung sorgfältig schreiben. [1]",
      "Schutzgrenzen setzen, z. B. maximale Durchläufe, und in einer Sandbox testen. [1]",
    ],
    plan: [{ title: "Pro Aufgabe", text: "Erst einfach, dann messen, dann erweitern (nach [1])." }],
    myths: [],
    mistakes: ["Gleich mit komplexen Frameworks starten; sie können Prompts und Antworten verdecken. [1]"],
    safety: ["Automatisierte Aktionen nur in abgesicherten Umgebungen ausführen. [1]"],
    conflicts: ["Die Quelle stammt vom Hersteller eines Modells; Ratschläge können dessen Perspektive widerspiegeln. Die Quelle weist selbst darauf hin, dass sich seit Dezember 2024 vieles geändert hat."],
    videos: [],
    videoNote: "Kein geprüftes Video eingebunden.",
    sources: [
      { title: "Anthropic – Building effective agents", url: "https://www.anthropic.com/engineering/building-effective-agents", kind: "Herstellerdokument" },
    ],
  },
};
