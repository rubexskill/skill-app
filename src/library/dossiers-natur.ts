import type { Dossier } from "./dossiers";

// Kategorie „Natur, Erde & Himmel“.
// Recherchiert am 23. November 2026. Studien über PubMed geprüft (Titel, Autoren, Abstract); Webseiten (DWD, swisstopo, BfR, astro4edu, Bergzeit, YACHT) per Abruf gelesen; Aussagen stehen nur, wenn sie dort stehen.
// Ausgelassen (keine seriösen Quellen gefunden): Orte erkennen.
// Sicherheitshinweise ohne Leitlinie sind als „Vorsichtsregel“ gekennzeichnet.
const DATE = "23. November 2026";
const PM = (id: string) => `https://pubmed.ncbi.nlm.nih.gov/${id}/`;

const SRC_CEPEDA = { title: "Cepeda, Pashler, Vul et al. 2006, Psychological Bulletin – Distributed practice in verbal recall tasks: A review and quantitative synthesis", url: PM("16719566"), kind: "Metaanalyse" };
const SRC_ROWLAND = { title: "Rowland 2014, Psychological Bulletin – The effect of testing versus restudy on retention: a meta-analytic review of the testing effect", url: PM("25150680"), kind: "Metaanalyse" };

export const DOSSIERS_NATUR: Record<string, Dossier> = {
  "Flaggen & Geografie": {
    date: DATE,
    steckbrief: {
      about: "Flaggen, Länder, Hauptstädte und Lage auf der Karte auswendig wissen. Das ist Faktenlernen und lässt sich gut mit Karteikarten trainieren.",
      why: "Für das Lernen von Fakten gibt es solide Befunde: Abfragen schlägt Wiederlesen, und verteiltes Üben schlägt Büffeln am Stück.",
      tips: "Karten aktiv abfragen (erst überlegen, dann umdrehen) und über Tage verteilen statt alles in einer Sitzung. Neue Flaggen in kleinen Gruppen (z. B. nach Region) lernen (Vorschlag).",
      safety: "Keine.",
    },
    learn: [
      "Eine Metaanalyse über 317 Experimente fand, dass verteiltes Üben (mehrere Lerneinheiten mit Abstand) beim Merken von Wörtern und Fakten besser wirkt als geballtes Üben. Der beste Abstand zwischen den Einheiten wächst mit der Zeit, über die man das Gelernte behalten will. [1]",
      "Eine weitere Metaanalyse zeigt: Sich selbst abzufragen bringt für das Behalten mehr als erneutes Lesen. Freie Abfrage (aus dem Gedächtnis nennen) wirkte stärker als Wiedererkennen. [2]",
      "Was für Länder und Flaggen im Besonderen gilt, ist nicht untersucht; die Befunde beziehen sich auf Gedächtnisinhalte allgemein. (Einordnung)",
    ],
    evidence: { level: "gut", why: "Zu den Lernmethoden (Abstand, Abfragen) liegen Metaanalysen vor; speziell zu Flaggen und Geografie gibt es keine Studien, die ich gelesen habe." },
    steps: [
      "Eine Region wählen (z. B. 10 Länder) und Flagge, Name, Hauptstadt als Karteikarte anlegen.",
      "Karte zeigen, aus dem Gedächtnis antworten, dann prüfen.",
      "Falsche Karten bald, richtige später wiederholen.",
      "Wenn sicher, die nächste Region dazunehmen.",
    ],
    plan: [
      { title: "Woche 1", text: "10 Länder, täglich 10 Minuten abfragen." },
      { title: "Woche 2–4", text: "Jede Woche eine neue Region; ältere Karten in größeren Abständen wiederholen. [1]" },
      { title: "Danach", text: "Alle Karten in einem Durchgang abfragen; nur Fehler häufiger üben (Vorschlag)." },
    ],
    myths: [
      { myth: "Einmal gründlich lernen genügt.", fact: "Verteiltes Wiederholen behält Gelerntes besser als eine einzelne lange Sitzung. [1]" },
      { myth: "Wiederlesen reicht zum Lernen.", fact: "Aktives Abfragen wirkt stärker als erneutes Lesen. [2]" },
    ],
    mistakes: ["Antwort vorlesen, ohne vorher zu überlegen.", "Nur Bekanntes wiederholen.", "Alles auf einmal lernen."],
    safety: ["Keine."],
    conflicts: ["Die optimalen Abstände hängen vom Lernziel ab; es gibt keine feste Regel für Flaggen. [1]"],
    videos: [],
    videoNote: "Keine Videos eingetragen: Ich habe kein Lernvideo gefunden, das ich nach Titel und Kanal als fachlich verlässlich einstufen konnte.",
    sources: [SRC_CEPEDA, SRC_ROWLAND],
    trainer: "Die Karteikarten im Trainer nutzen Abfragen und zeitliche Verteilung, wie in den Metaanalysen beschrieben. [1][2]",
  },

  "Sternenhimmel lesen": {
    date: DATE,
    steckbrief: {
      about: "Sich am Nachthimmel zurechtfinden: Sternbilder erkennen und den Polarstern als Fixpunkt für Norden nutzen.",
      why: "Der Polarstern liegt innerhalb eines Grades vom nördlichen Himmelspol; alle Sterne der Nordhalbkugel scheinen sich um ihn zu drehen.",
      tips: "Für den Anfang reicht der Große Wagen, der bei vielen Anleitungen als Wegweiser zum Polarstern dient (Videos, nach Titel). Dunkler Ort, Augen 15–20 Minuten an die Dunkelheit gewöhnen (Vorschlag).",
      safety: "Nachts draußen: Taschenlampe mit Rotlicht, warme Kleidung, nicht allein in unbekanntes Gelände (Vorsichtsregel, keine Leitlinie).",
    },
    learn: [
      "Der Polarstern ist der dem nördlichen Himmelspol nächste helle Stern (innerhalb eines Grades). Weil sich alle Sterne der nördlichen Hemisphäre scheinbar um ihn drehen, dient er als Fixpunkt für die Navigation. [1]",
      "Seine Höhe über dem Horizont gibt den ungefähren Breitengrad des Beobachtungsortes an. Die Position des Himmelspols verschiebt sich durch die Präzession der Erdachse langsam, sodass Polaris in einigen Jahrhunderten nicht mehr den Pol anzeigt. [1]",
      "Polaris ist ein Dreifachsternsystem und ein pulsationsveränderlicher Stern (Cepheide), seine Helligkeit schwankt also. [1]",
    ],
    evidence: { level: "gut", why: "Die astronomischen Grundlagen sind gesichert; zum Erlernen von Sternbildern gibt es keine Studien, die ich gelesen habe." },
    steps: [
      "Bei klarem, dunklem Himmel den Großen Wagen suchen.",
      "Den Polarstern nach der Anleitung eines Videos oder einer Sternkarte ausfindig machen.",
      "Mit dem Gesicht zum Polarstern zeigt man nach Norden.",
      "Danach einzelne Sternbilder in Bezug auf den Polarstern lernen.",
    ],
    plan: [
      { title: "Woche 1", text: "An klaren Abenden 10 Minuten: Großen Wagen und Polarstern finden." },
      { title: "Woche 2–4", text: "Ein neues Sternbild pro Woche, mit drehbarer Sternkarte oder App abgleichen (Vorschlag)." },
    ],
    myths: [
      { myth: "Der Polarstern ist der hellste Stern.", fact: "Laut dem Glossar ist er der dem Himmelspol nächste helle Stern, nicht der hellste. [1]" },
      { myth: "Der Polarstern zeigt für alle Zeiten Norden.", fact: "Die Präzession verschiebt den Pol, in einigen Jahrhunderten ist Polaris nicht mehr der Polarstern. [1]" },
    ],
    mistakes: ["Südhimmel und Nordhimmel verwechseln (der Polarstern ist auf der Südhalbkugel nicht sichtbar, Einordnung).", "Planeten mit Sternen verwechseln.", "Augen nicht an Dunkelheit gewöhnen."],
    safety: ["Nachts im Gelände Vorsichtsregeln beachten (Vorsichtsregel, keine Leitlinie)."],
    conflicts: ["Ich habe nur eine fachliche Quelle (astro4edu); Anleitungen zum Auffinden stammen aus Videos, die ich nach Titel beurteilt habe."],
    videos: [
      { title: "Den Polarstern finden - mit dem großen Wagen", id: "Pghq9gflsO0", channel: "Kurz & Kosmos", why: "Polarstern über den Großen Wagen finden.", checked: true },
      { title: "Orientierung mit dem großen Wagen", id: "6hh4vuOeSo4", channel: "Astronomieschule Oliver Debus", why: "Orientierung am Nachthimmel durch einen Astronomen.", checked: true },
      { title: "Polarstern finden - Anleitung / Wie findet man den Nordstern Polstern? Orientierung am Nachthimmel", id: "Nok61gxcE6k", channel: "Mac Paverick", why: "Zweite Anleitung.", checked: true },
    ],
    sources: [
      { title: "astro4edu – Glossar: Polarstern (Polaris, Nordstern)", url: "https://astro4edu.org/de/resources/glossary/term/261", kind: "Fachseite" },
    ],
  },

  "Astronavigation": {
    date: DATE,
    steckbrief: {
      about: "Den eigenen Standort mit Sextant, genauer Uhrzeit und Tafeln aus Himmelskörpern bestimmen (z. B. mit der Sonne).",
      why: "Eine Methode, die ohne Elektronik funktioniert. Laut einem Segelmagazin wurde sie 2015 von der US-Marine wieder in den Lehrplan angehender Offiziere aufgenommen, und weltweit werden jährlich mehrere Tausend Sextanten verkauft.",
      tips: "Mit der HO249-Methode anfangen, da sie ohne Logarithmentafeln auskommt. Ohne ständige Übung geht vieles nach wenigen Monaten verloren.",
      safety: "Kein Blick in die Sonne ohne Filter: Beim Sextanten werden Sonnenfilter benötigt (Vorsichtsregel, keine Leitlinie).",
    },
    learn: [
      "Laut einem Fachartikel von Leon Schulz (RYA Yachtmaster Ocean Instructor) ist Astronavigation nicht ganz einfach, kann aber mit der seit über 50 Jahren etablierten HO249-Methode durch eine feste Abfolge von fünf Schritten gelernt werden. [1]",
      "Ein Schritt ist, einen Rechenort in der Nähe zu bestimmen, für den dann Daten aus der Tafel entnommen werden. Die Wahl des Rechenortes liegt für Einsteiger nicht auf der Hand. [1]",
      "Ohne konstante Übung ist nach ein paar Monaten oft vieles vergessen; Sonne, Mond, Planeten und Sterne müssen unterschiedlich behandelt werden. [1]",
      "Die Handhabung des Sextanten, geografische und mathematische Grundlagen und die Anwendung astronomischer Tafeln gelten als aufwendig, aber nicht als sehr schwer. [2]",
    ],
    evidence: { level: "teilweise", why: "Die Methode ist etabliert, aber meine Quellen sind Fachartikel aus einem Segelmagazin; Studien zum Lernerfolg gibt es nicht." },
    steps: [
      "Sextant, Uhr (genaue Zeit), Nautisches Jahrbuch und HO249-Tafeln besorgen.",
      "Sonnenhöhe messen und Zeit notieren.",
      "Rechenort bestimmen, Daten aus Tafel entnehmen.",
      "Standlinie in die Karte einzeichnen.",
    ],
    plan: [
      { title: "Monat 1", text: "Theorie und Sextant-Handhabung an Land üben." },
      { title: "Danach", text: "Regelmäßig üben, da ohne Übung vieles vergessen wird. [1]" },
    ],
    myths: [
      { myth: "Astronavigation ist unerreichbar schwer.", fact: "Laut YACHT ist sie nicht sonderlich schwer zu erlernen, braucht aber Mühe. [2]" },
    ],
    mistakes: ["Ohne genaue Uhrzeit rechnen.", "Methoden mischen.", "Nach Monaten ohne Übung auf Wissen vertrauen."],
    safety: ["Nicht ungefiltert in die Sonne blicken. (Vorsichtsregel, keine Leitlinie)"],
    conflicts: ["Genauigkeitsangaben variieren zwischen Quellen; ich habe keine verlässliche Zahl gelesen."],
    videos: [
      { title: "Leon explains: The principles of celestial navigation in under 3 minutes", id: "KK-gxWY9mBo", channel: "Leon Schulz, Reginasailing", why: "Kurzer Überblick des gleichen Fachautors.", checked: true },
      { title: "Part 2(2): The Quick Course to Celestial Navigation", id: "IRjSnKNlE0c", channel: "Leon Schulz, Reginasailing", why: "Kurskapitel.", checked: true },
      { title: "How To Fix your Position at Noon from the Sun (Meridian Passage)", id: "Jt6l90UOTdI", channel: "Alistair Baillie", why: "Mittagsbreite.", checked: true },
    ],
    sources: [
      { title: "YACHT – Astro-Navigation: Leichterer Umgang mit dem Sextanten (Leon Schulz, 2023)", url: "https://www.yacht.de/segelwissen/navigation/astro-navigation-leichterer-umgang-mit-dem-sextanten/", kind: "Fachartikel" },
      { title: "YACHT – Astronavigation für Jedermann (2016)", url: "https://www.yacht.de/segelwissen/navigation/navigation-astronavigation-fuer-jedermann/", kind: "Fachartikel" },
    ],
  },

  "Orientierung ohne Kompass": {
    date: DATE,
    steckbrief: {
      about: "Himmelsrichtungen und Standort ohne Kompass bestimmen: mit Karte, Gelände und Himmelskörpern.",
      why: "Naturzeichen sind unsicher; verlässlicher ist, den eigenen Standort mit Karte und Gelände immer zu kennen.",
      tips: "Sich den Ausgangspunkt auf der Karte einprägen und dem Weg mit dem Blick folgen. Naturzeichen nur als Hinweis nehmen, nie als einzigen Beweis.",
      safety: "Nicht allein auf Handy oder GPS verlassen; bei Orientierungsverlust bleibt als Notlösung ein Notbiwak. Bei längeren Touren Notfallkommunikation bedenken (laut Bergzeit).",
    },
    learn: [
      "Laut dem Outdoor-Händler Bergzeit solltest du dich abseits gut ausgeschilderter Wege oder auf Mehrtagestouren nicht nur auf Smartphone, Uhr oder GPS verlassen. Karte, Höhenmesser und Kompass seien eine bewährte Rangfolge der Hilfsmittel. [1]",
      "Kenne deinen Standort: den Ausgangspunkt auf der Karte einprägen, den Weg verfolgen und Gelände mit der Karte vergleichen. [1]",
      "Zum Mythos „Moos wächst immer auf der Nordseite“ heißt es: damit sehr vorsichtig umgehen; in anderen Breitengraden und Klimazonen stimmen solche Hinweise nicht, und viele dieser Tipps gelten nur für Mitteleuropa. [1]",
      "Der Polarstern liegt innerhalb eines Grades vom Himmelspol und dient als Fixpunkt für die Navigation; seine Höhe gibt den Breitengrad ungefähr an. [2]",
    ],
    evidence: { level: "teilweise", why: "Die Grundregeln stehen in Fachartikeln und Ausbildungsmaterial, belastbare Studien zur Genauigkeit der Naturzeichen habe ich nicht gefunden." },
    steps: [
      "Vor dem Losgehen: Ausgangspunkt, Richtung und Ziel auf der Karte festlegen.",
      "Unterwegs Geländemerkmale (Höhen, Täler, Wege, Gewässer) mit der Karte abgleichen.",
      "Nachts oder bei Sonne zusätzliche Himmelszeichen nutzen (Polarstern, Sonnenstand), aber nur als Hinweis.",
      "Bei Unsicherheit anhalten, den letzten sicheren Punkt suchen.",
    ],
    plan: [
      { title: "Woche 1", text: "Eine bekannte Wanderung auf der Karte nachverfolgen." },
      { title: "Woche 2–4", text: "Neue Strecke mit Karte, Standort laufend bestimmen (Vorschlag)." },
      { title: "Danach", text: "Kurs bei einem Alpenverein besuchen (laut Bergzeit empfohlen). [1]" },
    ],
    myths: [
      { myth: "Moos wächst immer auf der Nordseite.", fact: "Laut Bergzeit sehr vorsichtig verwenden; gilt nicht überall. [1]" },
      { myth: "Das Smartphone reicht.", fact: "Nach Bergzeit sollte man sich abseits von Wegen nicht nur auf Smartphone oder GPS verlassen. [1]" },
    ],
    mistakes: ["Auf einen einzelnen Naturhinweis vertrauen.", "Standort nicht laufend mitführen.", "Zu spät anhalten."],
    safety: ["Bei Orientierungsverlust: stehen bleiben, Notbiwak, Notruf. [1]"],
    conflicts: ["Ich habe keine unabhängige Studie zur Genauigkeit der Sonne-Uhr-Methode gelesen; die Videos dazu habe ich nur nach Titel beurteilt."],
    videos: [
      { title: "ORIENTIERUNG mit KARTE & KOMPASS - Basics⎥Outdoor Navigation, Marschrichtung bestimmen, Karten lesen", id: "hQ5_KMuxwJM", channel: "Dom Wild", why: "Karte und Kompass als Grundlage.", checked: true },
      { title: "Mit einer Uhr und der Sonne die Himmelsrichtung bestimmen", id: "JkCq-XeXxnE", channel: "ratgeberTVision", why: "Sonne-Uhr-Methode.", checked: true },
      { title: "How to Find Direction w/o a COMPASS! Stick and Shadow & Watch Method.", id: "DUFt4MPOit0", channel: "Survival School House", why: "Schattenstab und Uhr.", checked: true },
    ],
    sources: [
      { title: "Bergzeit Magazin – Irrtümer bei der Orientierung im Gelände", url: "https://www.bergzeit.de/magazin/irrtuemer-orientierung-gelaende/", kind: "Fachartikel" },
      { title: "astro4edu – Glossar: Polarstern", url: "https://astro4edu.org/de/resources/glossary/term/261", kind: "Fachseite" },
    ],
  },

  "Topografische Karten": {
    date: DATE,
    steckbrief: {
      about: "Gelände aus der Karte lesen: Maßstab, Höhenlinien, Zeichen. Maßstab zeigt, wie viel Natur in einen Zentimeter passt.",
      why: "Höhenlinien zeigen Hänge, Täler und Gipfel; mit etwas Übung sieht man das Gelände schon auf der Karte.",
      tips: "Erst Zeichenerklärung und Maßstab lesen. Höhenlinien: dicht = steil, weit auseinander = flach.",
      safety: "Vor Bergtouren Wetter und Route prüfen; die Karte ersetzt keine Tourenplanung.",
    },
    learn: [
      "Laut swisstopo sind Karten verkleinerte, vereinfachte Abbildungen der Erdoberfläche; der Detailgrad hängt vom Maßstab ab. Zeichen gliedern sich in Punkt-, Linien-, Flächensymbole und Beschriftungen. [1]",
      "Maßstäbe: 1 : 10 000 entspricht 1 km = 10 cm, 1 : 25 000 entspricht 1 km = 4 cm, 1 : 50 000 entspricht 1 km = 2 cm. [1]",
      "Höhenlinien verbinden Punkte gleicher Höhe. Der Höhenunterschied zwischen zwei Linien heißt Äquidistanz. In Schweizer Landeskarten gilt: 1 : 10 000 = 10 m, 1 : 25 000 = 10 m (Mittelland, Jura) bzw. 20 m (Alpen), 1 : 50 000 = 20 m. [1]",
      "Je weiter die Höhenlinien auseinanderliegen, desto flacher ist das Gelände; je enger, desto steiler. Rücken, Täler und Mulden lassen sich am Verlauf der Linien erkennen. [1]",
    ],
    evidence: { level: "gut", why: "Die Grundregeln stammen von einem staatlichen Kartenamt; der Lernerfolg ist nicht eigens untersucht." },
    steps: [
      "Zeichenerklärung und Maßstab ansehen.",
      "Eine bekannte Gegend suchen und ihre Höhenlinien betrachten.",
      "Steile und flache Stellen bestimmen.",
      "Eine geplante Route auf Höhenprofil prüfen.",
    ],
    plan: [
      { title: "Woche 1", text: "Zeichenerklärung lernen, Maßstab umrechnen." },
      { title: "Woche 2–3", text: "Höhenlinien an bekannten Orten deuten." },
      { title: "Woche 4", text: "Eine kurze Wanderung vorab auf der Karte planen (Vorschlag)." },
    ],
    myths: [
      { myth: "Alle Karten haben dieselbe Linienhöhe.", fact: "Die Äquidistanz hängt vom Maßstab und Gebiet ab, z. B. 10 m oder 20 m. [1]" },
    ],
    mistakes: ["Maßstab ignorieren.", "Höhenlinien nur als Linien statt als Höhenabstand lesen.", "Karte nicht mit dem Gelände vergleichen."],
    safety: ["Auf Bergtouren Wetter und Route vorab prüfen."],
    conflicts: ["Die Zahlen gelten für Schweizer Landeskarten; andere Länder können andere Äquidistanzen verwenden. [1]"],
    videos: [
      { title: "Höhenlinien Erklärvideo // Karte und Kompass für den Heimat- und Sachunterricht.", id: "WNvLvWK4u5g", channel: "Lernen leicht gemacht", why: "Kurze Erklärung der Höhenlinien (für Grundschüler gemacht).", checked: true },
      { title: "ORIENTIERUNG mit KARTE & KOMPASS - Basics⎥Outdoor Navigation, Marschrichtung bestimmen, Karten lesen", id: "hQ5_KMuxwJM", channel: "Dom Wild", why: "Wanderkarte lesen und Kompass.", checked: true },
    ],
    videoNote: "Nur zwei Videos eingetragen, beide nur nach Titel beurteilt.",
    sources: [
      { title: "swisstopo – Kartenlesen (Broschüre, Englisch)", url: "https://www.swisstopo.admin.ch/dam/en/sd-web/hsksjP-ltSHM/Kartenlesen-EN.pdf", kind: "Behörde" },
    ],
  },

  "Wolken & Wetter": {
    date: DATE,
    steckbrief: {
      about: "Wolkenformen erkennen und daraus auf kommende Wetteränderungen schließen. Der Deutsche Wetterdienst beschreibt Wolken als Hinweis auf den aktuellen Wetterzustand.",
      why: "Wer in den Bergen oder draußen unterwegs ist, erkennt an Wolken früher, wenn das Wetter umschlägt.",
      tips: "Himmel regelmäßig beobachten, auch vor der Tour den Wetterbericht für Gipfelhöhe lesen.",
      safety: "Bei Gewitter schnell Schutz suchen (Details im Text). Wetterberichte nicht überhören: Schauer und Gewitter in den Bergen ernst nehmen.",
    },
    learn: [
      "Wolken sind sichtbare Ansammlungen von Wassertropfen oder Eiskristallen und entstehen meist, wenn feuchte Luft unter ihre Taupunkttemperatur abkühlt, etwa beim Aufsteigen an Fronten, an Bergen oder durch Konvektion. [1]",
      "Man unterscheidet Schichtwolken (Stratus; entstehen u. a. beim Aufgleiten warmer Luft auf kalte Luft an Warmfronten) und Quellwolken (Cumulus; entstehen durch Konvektion). Die internationale Klassifikation ordnet Wolken nach ihrer Form. [1]",
      "In den Bergen verstärkt das Gelände das Aufsteigen der Luft; Schauer und Gewitter sind dort häufiger als im Flachland. [2]",
      "Faustregel des DWD: Die Temperatur nimmt etwa um 1 Grad pro 100 Höhenmeter ab. Von 1 500 m auf 2 500 m sind das rund 10 Grad. [2]",
      "Bei Gewitter weder unter Buche noch unter Eiche Schutz suchen; am sichersten ist eine feste Hütte, möglichst mit Blitzableiter. Ohne Gebäude: eine Senke aufsuchen und sich mit geschlossenen Füßen hinhocken (Empfehlung des DWD-Meteorologen). [2]",
    ],
    evidence: { level: "teilweise", why: "Wolkenentstehung ist physikalisch gut erklärt; wie zuverlässig man Wetter allein aus Wolken vorhersagt, habe ich in keiner gelesenen Quelle belegt gefunden." },
    steps: [
      "Himmel morgens und nachmittags ansehen und Wolkenform notieren.",
      "Mit dem Wetterbericht abgleichen.",
      "Auf Tour: schnell wachsende Quellwolken und Wetterumschwünge im Blick behalten.",
      "Bei aufziehendem Gewitter früh absteigen und Schutz suchen.",
    ],
    plan: [
      { title: "Woche 1", text: "Zehn Wolkenarten lernen." },
      { title: "Woche 2–4", text: "Täglich eine Minute Himmel notieren und mit dem Wetterbericht vergleichen (Vorschlag)." },
    ],
    myths: [
      { myth: "Unter Bäumen ist man bei Gewitter sicher.", fact: "Laut DWD bietet weder eine Buche noch eine Eiche Schutz. [2]" },
      { myth: "Der Wetterbericht fürs Tal gilt auch auf dem Gipfel.", fact: "Die Temperatur nimmt mit der Höhe deutlich ab, im Gebirge können Schauer, Gewitter und Wintereinbruch kommen. [2]" },
    ],
    mistakes: ["Gewitterwarnungen im Wetterbericht überhören.", "Zu wenig warme Kleidung mitnehmen.", "Zu spät absteigen."],
    safety: ["Bei Gewitter rasch Schutz suchen; Verhalten laut DWD: feste Hütte, sonst Senke und Hocke. [2]", "Wetterumschwünge im Gebirge können schnell kommen; Kleidung für alle Eventualitäten. [2]"],
    conflicts: ["Die Hocke in der Senke ist die Empfehlung eines DWD-Meteorologen in einem Beitrag von 2018, keine Leitlinie; andere Quellen können abweichen."],
    videos: [
      { title: "Das Wetter anhand der Wolken vorhersagen! (Mod.: Adrienne Jeske)", id: "9dnjVVjE3NU", channel: "wetternet", why: "Wetter aus Wolken, von Meteorologen.", checked: true },
      { title: "Wolken beobachten - Wettervorhersagen für Anfänger", id: "NM4p67IgOc8", channel: "Claus Weibrecht", why: "Einführung für Anfänger.", checked: true },
    ],
    videoNote: "Nur zwei Videos eingetragen, beide nur nach Titel beurteilt.",
    sources: [
      { title: "Deutscher Wetterdienst (Thema des Tages, 28.04.2017) – Wolken und ihre Klassifikation", url: "https://www.wetterdienst.de/Deutschlandwetter/Thema_des_Tages/2669/wolken-und-ihre-klassifikation", kind: "Behörde" },
      { title: "Deutscher Wetterdienst (Thema des Tages, 07.09.2018) – Tipps, um beim Bergwandern keine Überraschung zu erleben", url: "https://www.wetterdienst.de/Deutschlandwetter/Thema_des_Tages/3328/tipps-um-beim-bergwandern-keine-ueberraschung-zu-erleben", kind: "Behörde" },
    ],
  },

  "Bäume bestimmen": {
    date: DATE,
    steckbrief: {
      about: "Bäume an Blättern, Rinde, Früchten und Wuchs erkennen. Mehrere Merkmale zusammen geben Sicherheit, ein einzelnes täuscht leicht.",
      why: "Ein Bestimmungsbuch oder eine App kann helfen; die Tests zeigen aber, dass Apps nicht immer richtig liegen.",
      tips: "Mehrere Merkmale kombinieren (Blatt, Rinde, Knospe, Frucht). Einen Baum zu allen Jahreszeiten ansehen.",
      safety: "Nie Pflanzen, Früchte oder Pilze allein nach App, Buch oder Foto essen. Ohne sichere Bestimmung durch Fachleute nicht verzehren. Giftige Pflanzen sind häufig, Verwechslungen können gefährlich sein.",
    },
    learn: [
      "Plant-ID-Apps sind bei der Bestimmung giftiger Pflanzen unterschiedlich zuverlässig: In einem Vergleich von drei Apps an 17 Pflanzenarten erkannte die beste (PictureThis) 10 von 17 Arten zu 100 % richtig (59 %), Pl@ntNet 8 von 17 (47 %), PlantSnap nur 1 von 17. [1]",
      "In einer Studie zu Hummelarten lag die Erkennungsgenauigkeit freiwilliger Melderinnen und Melder unter 50 %, trotz Bestimmungsmaterial; sie verbesserte sich aber mit der Zeit, und auffällige Arten wurden besser erkannt. Die Autoren betonen, wie wichtig die Prüfung durch Fachleute ist. [2]",
      "Für Pilze warnt das Bundesinstitut für Risikobewertung (BfR): In Deutschland gibt es sehr giftige Pilze, die essbaren zum Verwechseln ähnlich sehen, auch für Erfahrene gefährlich. [3]",
    ],
    evidence: { level: "teilweise", why: "Zur Genauigkeit von Apps und Laien gibt es Studien; zu Lernmethoden für Baumarten habe ich nichts gelesen." },
    steps: [
      "Ein Merkmal nach dem anderen ansehen: Blattform und -stellung, Rinde, Knospen, Früchte.",
      "Mit Bestimmungsbuch oder Schlüssel vergleichen.",
      "Eine App nur als Hinweis nutzen und mit einem zweiten Merkmal prüfen.",
      "Bei Unsicherheit eine Fachperson oder einen Verein fragen.",
    ],
    plan: [
      { title: "Woche 1–2", text: "5 häufige Baumarten der Umgebung lernen." },
      { title: "Woche 3–4", text: "Je Art drei Merkmale (Blatt, Rinde, Frucht) üben; Karteikarten mit Abfragen nutzen (Vorschlag; Lernmethode siehe Flaggen & Geografie)." },
    ],
    myths: [
      { myth: "Eine Bestimmungs-App ist verlässlich.", fact: "Im Test erkannte die beste App nur 10 von 17 giftigen Pflanzen sicher, eine andere 1 von 17. [1]" },
      { myth: "Wer erfahren ist, kann Pilze und Pflanzen sicher verwechslungsfrei sammeln.", fact: "Das BfR betont, dass Verwechslungen auch für Erfahrene gefährlich werden können. [3]" },
    ],
    mistakes: ["Nur ein Merkmal prüfen.", "Der App ohne Gegenprobe vertrauen.", "Etwas essen, weil die App „essbar“ sagt."],
    safety: ["Nie allein nach App oder Buch essen; bei Pilzen und Wildpflanzen immer durch Fachleute prüfen lassen. [3]", "Bei Beschwerden nach dem Verzehr sofort ärztlichen Rat oder das Giftinformationszentrum kontaktieren. (Empfehlung des BfR zu Pilzen, übertragbar als Vorsichtsregel)"],
    conflicts: ["Die App-Studie umfasst nur drei Apps und giftige Pflanzen; für Bäume im Wald sind die Zahlen nicht übertragbar. [1]"],
    videos: [
      { title: "Bäume bestimmen leicht gemacht", id: "UF2fjX86UvI", channel: "Betzold | Arnulf Betzold GmbH", why: "Merkmale zur Baumbestimmung.", checked: true },
      { title: "Nadelbäume bestimmen anhand der Nadeln (Outdoor / Bushcraft / Survival)", id: "Xx1jJDGGoW4", channel: "Survival Kompass", why: "Kiefer, Fichte, Tanne, Douglasie.", checked: true },
    ],
    videoNote: "Nur zwei Videos eingetragen, beide nur nach Titel beurteilt.",
    sources: [
      { title: "Otter et al. 2021, Journal of Medical Toxicology – Swipe Right: a Comparison of Accuracy of Plant Identification Apps for Toxic Plants", url: PM("32794048"), kind: "Studie" },
      { title: "Falk et al. 2019, PLoS ONE – Evaluating the ability of citizen scientists to identify bumblebee (Bombus) species", url: PM("31233521"), kind: "Studie" },
      { title: "BfR 2026 – Pilze: Verwechslungen können tödlich enden", url: "https://www.bfr.bund.de/presseinformation/pilze-verwechslungen-koennen-toedlich-enden-2026/", kind: "Behörde" },
    ],
  },

  "Tiere bestimmen": {
    date: DATE,
    steckbrief: {
      about: "Tierarten in der Natur erkennen, zunächst die großen Gruppen (Familien), dann einzelne Arten. Äußere Merkmale, Verhalten und Lebensraum zusammen nutzen.",
      why: "Eine Studie mit Freiwilligen zeigt: Auffällige Arten werden besser erkannt, ähnliche Arten sind schwer; Erkennen verbessert sich mit Übung.",
      tips: "Mit wenigen häufigen Gruppen anfangen und sie sicher unterscheiden, bevor man Arten dazunimmt (Vorschlag). Fotos mit mehreren Merkmalen machen.",
      safety: "Wildtiere nicht anfassen oder füttern; Abstand halten. Bei Giftschlangen, Insekten und Zecken Hinweise der örtlichen Behörden beachten (Vorsichtsregel, keine Leitlinie).",
    },
    learn: [
      "In zwei britischen Citizen-Science-Projekten lag die Erkennungsgenauigkeit der Freiwilligen für Hummelarten unter 50 %, trotz Bestimmungsmaterial. Auffällig aussehende Arten wurden besser erkannt. [1]",
      "Mit der Zeit verbesserten sich die Melderinnen und Melder; Teilnehmende mit speziellem Interesse waren besser als die aus dem allgemeinen Gartenbereich. Die Autoren betonen die Rolle der Prüfung durch Fachleute. [1]",
      "Zum Lernen selbst: Abfragen aus dem Gedächtnis und verteiltes Wiederholen verbessern das Behalten von Fakten, laut Metaanalysen (auf Tierarten übertragen: Annahme). [2][3]",
    ],
    evidence: { level: "teilweise", why: "Zur Erkennungsleistung von Laien liegt eine Studie vor; zum Lernen von Unterfamilien habe ich keine Studie gelesen." },
    steps: [
      "Eine Tiergruppe der Umgebung wählen (z. B. Vögel am Futterhaus).",
      "Merkmale notieren (Größe, Farbe, Schnabel/Form, Verhalten).",
      "Mit Bestimmungsbuch oder einer Verbandsliste vergleichen.",
      "Wenn unsicher, ein Foto machen und Fachleute fragen.",
    ],
    plan: [
      { title: "Woche 1–2", text: "Fünf häufige Arten einer Gruppe lernen." },
      { title: "Woche 3–4", text: "Je Art zwei Merkmale abfragen (Karteikarten) [2][3] (Vorschlag)." },
    ],
    myths: [
      { myth: "Mit Bestimmungsmaterial erkennt man Arten sicher.", fact: "Im Hummeltest lag die Genauigkeit trotz Material unter 50 %. [1]" },
    ],
    mistakes: ["Nur ein Merkmal prüfen.", "Ähnliche Arten nicht gegeneinander prüfen.", "Fotos ohne Maßstab oder Lebensraumangabe."],
    safety: ["Wildtiere nicht anfassen. (Vorsichtsregel, keine Leitlinie)"],
    conflicts: ["Die Studie bezieht sich auf Hummeln, Übertragbarkeit auf andere Tiergruppen ist offen. [1]"],
    videos: [],
    videoNote: "Keine Videos eingetragen: Der Skill ist zu breit; ich habe kein einzelnes Video gefunden, das ich als verlässlich einstufen konnte.",
    sources: [
      { title: "Falk et al. 2019, PLoS ONE – Evaluating the ability of citizen scientists to identify bumblebee (Bombus) species", url: PM("31233521"), kind: "Studie" },
      SRC_CEPEDA,
      SRC_ROWLAND,
    ],
  },
};
