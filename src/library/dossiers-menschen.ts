import type { Dossier } from "./dossiers";

// Kategorie „Menschen, Sprache & Kommunikation“.
// Recherchiert am 23. November 2026. Studien über PubMed/Crossref geprüft (Titel, Autoren, Abstract); Aussagen stehen nur, wenn sie im Abstract stehen.
// Ausgelassen (keine tragfähigen Quellen gefunden): Geschichten erzählen, Klarer sprechen, Worte finden, Verbales Aikido, Trichterfragen,
// Benjamin-Franklin-Effekt, Lexical Priming, Erickson-Hypnose, Lippenlesen, Akzent nachahmen, Forensische Linguistik.
const DATE = "23. November 2026";
const PM = (id: string) => `https://pubmed.ncbi.nlm.nih.gov/${id}/`;

const SRC_BOND = { title: "Bond & DePaulo 2006, Personality and Social Psychology Review – Accuracy of deception judgments", url: PM("16859438"), kind: "Metaanalyse" };
const SRC_PORTER = { title: "Porter & ten Brinke 2008, Psychological Science – Reading between the lies: identifying concealed and falsified emotions in universal facial expressions", url: PM("18466413"), kind: "Studie" };
const SRC_BRENNEN = { title: "Brennen & Magnussen 2022, Frontiers in Psychology – The Science of Lie Detection by Verbal Cues: What Are the Prospects for Its Practical Applicability?", url: PM("35478762"), kind: "Übersichtsarbeit" };
const SRC_DUTTON = { title: "Dutton 1988, Experientia – The cold reading technique", url: PM("3360083"), kind: "Übersichtsarbeit" };
const SRC_ROOZ = { title: "Roozenbeek, van der Linden, Goldberg et al. 2022, Science Advances – Psychological inoculation improves resilience against misinformation on social media", url: PM("36001675"), kind: "Studie" };
const SRC_ITZ = { title: "Itzchakov, Weinstein & Leary 2024, Journal of Personality and Social Psychology – Listening to understand: The role of high-quality listening on speakers' attitude depolarization during disagreements", url: PM("37917499"), kind: "Studie" };

export const DOSSIERS_MENSCHEN: Record<string, Dossier> = {
  "Menschen lesen": {
    date: DATE,
    steckbrief: {
      about: "Aus Verhalten, Sprache und Mimik auf Gedanken oder Absichten anderer schließen. Das gelingt viel schlechter, als populäre Ratgeber versprechen.",
      why: "Eine Metaanalyse aus 206 Dokumenten fand, dass Menschen Lügen und Wahrheiten ohne Hilfsmittel nur mit etwa 54 % Trefferquote unterscheiden. Hilfreicher als Körpersprache zu deuten ist, Aussagen mit Fakten zu vergleichen.",
      tips: "Eine einzelne Geste ist kein Beweis. Auf Widersprüche zu früheren Aussagen oder zu bekannten Tatsachen achten und offen nachfragen.",
      safety: "Nicht auf Basis von Mimik oder Körpersprache jemanden einer Lüge bezichtigen (Vorsichtsregel, abgeleitet aus [1])."
    },
    learn: [
      "Eine Metaanalyse (206 Dokumente, 24 483 Beurteilende) fand: Ohne Hilfsmittel erreichen Menschen im Mittel 54 % richtige Lüge-Wahrheit-Urteile. 47 % der Lügen wurden als Lüge erkannt, 61 % der Wahrheiten als wahr. [1]",
      "In einer Studie mit 697 gespielten Ausdrücken lag die Erkennung von Täuschung bei ungeschulten Beobachtern nur wenig über dem Zufall. Verdeckte Gefühle gingen mit mehr widersprüchlichen Ausdrücken und erhöhter Blinzelrate einher. [2]",
      "Eine Übersichtsarbeit kommt zu dem Schluss, dass für Menschen keine einfachen sprachlichen Hinweise auf Täuschung belegt sind. Der beste allgemeine Rat: Widersprüche zu früheren Aussagen oder bekannten Informationen aufdecken, etwa durch einen freien Bericht und späte, schrittweise Einführung unabhängiger Informationen. [3]",
    ],
    evidence: { level: "teilweise", why: "Die geringe Trefferquote ist gut belegt; eine verlässliche Methode, Menschen „zu lesen“, ist es nicht." },
    steps: [
      "Eine Gesprächsgrundlinie beobachten: Wie verhält sich die Person normalerweise? (Vorschlag)",
      "Nicht auf eine Geste schließen, sondern Abweichungen im Zusammenhang prüfen.",
      "Offene Fragen stellen und der Person erzählen lassen.",
      "Aussagen später mit Fakten oder früheren Aussagen abgleichen. [3]",
    ],
    plan: [
      { title: "Woche 1–2", text: "In Gesprächen nur beobachten und notieren, ohne zu urteilen (Vorschlag)." },
      { title: "Woche 3–4", text: "Eigene Einschätzungen später prüfen: Wie oft lag ich richtig? (Vorschlag, gestützt durch [1])" },
    ],
    myths: [
      { myth: "Wer lügt, verrät sich durch Körpersprache.", fact: "Menschen erreichen im Mittel nur 54 % Trefferquote. [1]" },
      { myth: "Man erkennt Lügen an einem bestimmten Zeichen.", fact: "Laut Übersichtsarbeit sind keine einfachen sprachlichen Hinweise belegt. [3]" },
    ],
    mistakes: ["Auf einzelne Gesten schließen.", "Eigener Menschenkenntnis zu sehr trauen.", "Nicht nachfragen."],
    safety: ["Nicht auf Grundlage von Körpersprache beschuldigen. (Vorsichtsregel)"],
    conflicts: ["Die Fachliteratur ist sich über die Brauchbarkeit nonverbaler Hinweise nicht einig; Laborstudien mit gespielten Lügen sind schwer auf den Alltag zu übertragen. [2][3]"],
    videos: [],
    videoNote: "Keine Videos eingetragen: Ich habe kein Video gefunden, das ich als wissenschaftlich verlässlich einstufen konnte.",
    sources: [SRC_BOND, SRC_PORTER, SRC_BRENNEN],
  },

  "Mikroexpressionen": {
    date: DATE,
    steckbrief: {
      about: "Sehr kurze (etwa 1/25 bis 1/5 Sekunde) Gesichtsausdrücke, die eigentlich verdeckte Gefühle verraten sollen. Sie sind seltener, als oft behauptet wird.",
      why: "Eine Studie mit 697 gespielten Ausdrücken fand: Mikroexpressionen traten bei 21,95 % der Teilnehmenden in 2 % der Ausdrücke auf, und ungeschulte Beobachter erkannten Täuschung nur wenig besser als der Zufall.",
      tips: "Mikroexpressionen als Hinweis auf ein verdecktes Gefühl sehen, nicht als Beweis für eine Lüge. Wer ein Gefühl zeigt, lügt nicht zwingend.",
      safety: "Keine. Nicht für Beschuldigungen verwenden (Vorsichtsregel)."
    },
    learn: [
      "In der Studie von Porter und ten Brinke wurden 104 550 Einzelbilder aus 697 Ausdrücken analysiert. Verdeckte Gefühle gingen mit mehr widersprüchlichen Ausdrücken und erhöhter Blinzelrate einher; negative Gefühle waren schwerer zu verfälschen als Freude. [1]",
      "Mikroexpressionen zeigten 21,95 % der Teilnehmenden in 2 % aller Ausdrücke, und nur im oberen oder unteren Gesicht. Das spricht für ein seltenes Signal; widersprüchliche Ausdrücke kamen dagegen bei allen mindestens einmal vor und dauerten länger als die gängige Definition. [1]",
      "Ungeschulte Beobachter lagen bei der Erkennung von Täuschung nur wenig über dem Zufall. [1]",
      "Insgesamt erreichen Menschen bei Lügenurteilen im Mittel 54 %. [2]",
    ],
    evidence: { level: "kaum", why: "Mikroexpressionen existieren, sind aber selten, und ich habe keine Studie gelesen, die zeigt, dass man sie im Alltag zuverlässig erkennen und deuten kann." },
    steps: [
      "Gesichter in Alltagssituationen beobachten, ohne zu urteilen.",
      "Auf Widersprüche zwischen Wort und Gesichtsausdruck achten.",
      "Das gesehene Gefühl vorsichtig ansprechen („Du wirkst nachdenklich“) statt zu unterstellen.",
    ],
    plan: [
      { title: "Woche 1–4", text: "Täglich zwei Minuten bewusst Gesichter beobachten (Vorschlag); keine Aussage zur Wirksamkeit." },
    ],
    myths: [
      { myth: "Mikroexpressionen verraten jede Lüge.", fact: "Sie traten nur bei 21,95 % der Teilnehmenden in 2 % der Ausdrücke auf. [1]" },
      { myth: "Man lernt leicht, Lügen zu erkennen.", fact: "Menschen erreichen im Mittel nur 54 % Trefferquote. [2]" },
    ],
    mistakes: ["Ein Gefühl mit einer Lüge gleichsetzen.", "Nur auf das Gesicht achten.", "Aus einem Zucken ein Urteil ableiten."],
    safety: ["Keine Beschuldigungen aus Mimik ableiten. (Vorsichtsregel)"],
    conflicts: ["Die Definition von Mikroexpressionen (1/25 bis 1/5 Sekunde) wird durch die Studie in Frage gestellt: Widersprüchliche Ausdrücke dauerten länger. [1]"],
    videos: [],
    videoNote: "Keine Videos eingetragen: Ich habe kein Video gefunden, das ich als wissenschaftlich verlässlich einstufen konnte.",
    sources: [SRC_PORTER, SRC_BOND],
  },

  "Cold Reading": {
    date: DATE,
    steckbrief: {
      about: "Eine Technik, bei der jemand mit gezielten Vermutungen und den Reaktionen der Person so tut, als wüsste er viel über sie. Sie wird von Wahrsagern, Medien und Mentalisten genutzt.",
      why: "Cold Reading beruht anfangs auf dem Barnum-Effekt: Menschen halten allgemeine Beschreibungen für passend auf sich selbst.",
      tips: "Zum Verstehen: Beobachte, wie allgemeine Aussagen („Du bist manchmal unsicher“) als persönlich empfunden werden. Vorführen nur als Unterhaltung kenntlich machen.",
      safety: "Nicht als echte Fähigkeit ausgeben und nicht gegenüber Hilfesuchenden einsetzen, etwa bei Trauer oder Krankheit (Vorsichtsregel)."
    },
    learn: [
      "Ein Übersichtsartikel beschreibt Cold Reading als Prozess, in dem eine Person kalkulierte Vermutungen über Hintergrund und Probleme anstellt und, je nach Reaktion, ein Reading ausbaut, das so passend wirkt, dass es nach übernatürlicher Herkunft aussieht. [1]",
      "Der Prozess stützt sich zunächst auf den Barnum-Effekt, also die Neigung, allgemeine Persönlichkeitsbeschreibungen als einzigartig zutreffend zu übernehmen. Der Artikel prüft auch die psychologische Forschung dazu und beschreibt Anwendungen durch einen Berufsmagier und die Analyse der Auftritte eines Mediums. [1]",
      "Der Autor regt an zu untersuchen, ob Cold Reader sich teilweise selbst davon überzeugt haben, übernatürliche Fähigkeiten zu besitzen. [1]",
    ],
    evidence: { level: "teilweise", why: "Der Mechanismus (Barnum-Effekt) ist beschrieben; zu Lernerfolg und Trainierbarkeit habe ich keine Studie." },
    steps: [
      "Allgemeine, aber gefühlt persönliche Aussagen formulieren.",
      "Auf die Reaktion achten und die Aussage bei Zustimmung weiter ausbauen.",
      "Bei Widerspruch schnell umlenken.",
      "Immer als Demonstration der Technik kennzeichnen.",
    ],
    plan: [
      { title: "Woche 1–2", text: "Den Barnum-Effekt kennenlernen und bei Horoskopen beobachten (Vorschlag)." },
      { title: "Woche 3+", text: "Als Demonstration vor Freunden zeigen und danach auflösen (Vorschlag)." },
    ],
    myths: [
      { myth: "Cold Reader können wirklich Gedanken lesen.", fact: "Laut Artikel beruht die Wirkung auf Vermutungen, Reaktionen und dem Barnum-Effekt. [1]" },
    ],
    mistakes: ["Zu spezifisch werden, ohne Reaktion zu prüfen.", "Es als echte Gabe ausgeben.", "Vor Trauernden oder Kranken einsetzen."],
    safety: ["Nicht ohne Einwilligung bei verletzlichen Personen einsetzen. (Vorsichtsregel)"],
    conflicts: ["Der Artikel ist von 1988; neuere experimentelle Studien zum Cold Reading habe ich nicht gelesen. [1]"],
    videos: [
      { title: "Derren Brown on Barnum statements part of cold reading toolkit", id: "ffB6Kymbhz4", channel: "Mentalism Mentalist", why: "Ein Mentalist erklärt Barnum-Aussagen; vermutlich ein hochgeladener Ausschnitt.", checked: true },
    ],
    videoNote: "Nur ein Video eingetragen, nach Titel beurteilt; Kanal ist kein Originalkanal.",
    sources: [SRC_DUTTON],
  },

  "Handlesen": {
    date: DATE,
    steckbrief: {
      about: "Aus den Linien der Hand Charakter oder Zukunft deuten. Eine wissenschaftliche Grundlage dafür habe ich nicht gefunden.",
      why: "Sinnvoll als Gesprächs- und Unterhaltungsform und zum Verstehen von Cold Reading.",
      tips: "Wenn man es vorführt, als Unterhaltung kennzeichnen und keine ernsten Vorhersagen machen.",
      safety: "Keine Aussagen zu Gesundheit, Tod oder Entscheidungen im Leben machen (Vorsichtsregel)."
    },
    learn: [
      "Beim Handlesen kommt Cold Reading zum Einsatz: Der Leser macht Vermutungen über den Klienten und baut sie aus, je nach Reaktion. [1]",
      "Ein Arzt beschreibt Handlesen und Tarot als Formen „archaischer Psychotherapie“, die mit unterstützendem Zuspruch und Placebo Hoffnung wecken sollen. Das ist die Einschätzung eines Autors, kein Studienergebnis. [2]",
      "Eine Studie, die zeigt, dass Handlinien Charakter oder Zukunft vorhersagen, habe ich nicht gefunden. (Einordnung)",
    ],
    evidence: { level: "kaum", why: "Ich habe keine Studie gelesen, die eine Vorhersagekraft der Handlinien belegt; die Wirkung lässt sich mit Cold Reading und Zuspruch erklären." },
    steps: [
      "Cold Reading und Barnum-Effekt kennenlernen.",
      "Eine Vorführung als Unterhaltung planen.",
      "Keine ernsten Vorhersagen machen.",
    ],
    plan: [
      { title: "Woche 1–2", text: "Quellen zum Cold Reading lesen (Vorschlag)." },
    ],
    myths: [
      { myth: "Die Handlinien sagen die Zukunft voraus.", fact: "Ich habe keinen Beleg gefunden; die Wirkung wird mit Cold Reading und Zuspruch erklärt. [1][2]" },
    ],
    mistakes: ["Ernste Prognosen machen.", "Hilfesuchende beraten.", "Die Technik als Fähigkeit ausgeben."],
    safety: ["Keine Aussagen zu Gesundheit oder Lebensentscheidungen. (Vorsichtsregel)"],
    conflicts: ["Die Quellenlage ist dünn: ein Übersichtsartikel von 1988 und ein Erfahrungsbericht von 2008. [1][2]"],
    videos: [],
    videoNote: "Keine Videos eingetragen: Ich habe kein Video gefunden, das ich als fachlich verlässlich einstufen konnte.",
    sources: [SRC_DUTTON, { title: "Pejic 2008, Journal of the Louisiana State Medical Society – Palmistry, tarot cards, and psychotherapy", url: PM("18681355"), kind: "Erfahrungsbericht" }],
  },

  "Manipulation erkennen": {
    date: DATE,
    steckbrief: {
      about: "Manipulative Überzeugungstechniken erkennen, etwa emotionale Sprache, Scheinalternativen, Sündenböcke oder Angriffe auf die Person statt auf die Sache.",
      why: "In sieben vorregistrierten Studien verbesserten kurze Erklärvideos das Erkennen solcher Techniken und die Unterscheidung vertrauenswürdiger von nicht vertrauenswürdigen Inhalten.",
      tips: "Auf Wiederholungen achten: Wird mit starken Gefühlen, nur zwei Optionen oder Angriffen auf Personen gearbeitet? Kurz innehalten, bevor man teilt oder zusagt.",
      safety: "Keine."
    },
    learn: [
      "Forschende entwickelten fünf kurze Videos, die vor Manipulationstechniken warnen: emotional manipulative Sprache, Widersprüchlichkeit, falsche Dichotomien, Sündenbock-Strategien und Ad-hominem-Angriffe. [1]",
      "In sechs randomisierten Studien (n = 6 464) und einer Feldstudie auf YouTube (n = 22 632) verbesserten die Videos das Erkennen der Techniken, das Vertrauen beim Erkennen, die Unterscheidung vertrauenswürdiger Inhalte und die Qualität von Weiterleitungsentscheidungen. Die Wirkung war über das politische Spektrum robust. [1]",
      "Die Studie betrifft Online-Falschinformationen; ob die Wirkung auf persönliche Manipulation (Verkauf, Beziehungen) übertragbar ist, wurde dort nicht untersucht. (Einordnung)",
    ],
    evidence: { level: "gut", why: "Mehrere vorregistrierte Studien mit großen Stichproben zeigen die Wirkung von Aufklärung über Techniken; für zwischenmenschliche Manipulation gilt das nicht automatisch." },
    steps: [
      "Die fünf Techniken lernen (emotionale Sprache, Widerspruch, falsche Alternativen, Sündenböcke, Angriffe auf die Person).",
      "Bei Gesprächen und Beiträgen prüfen, ob eine davon vorkommt.",
      "Kurz innehalten, bevor man zustimmt oder teilt.",
    ],
    plan: [
      { title: "Woche 1", text: "Die fünf Techniken auswendig lernen." },
      { title: "Woche 2–4", text: "Täglich einen Beitrag oder eine Werbung prüfen und die Technik benennen (Vorschlag, gestützt durch [1])." },
    ],
    myths: [
      { myth: "Nur andere fallen auf Manipulation herein.", fact: "In den Studien half Aufklärung quer durch das politische Spektrum. [1]" },
    ],
    mistakes: ["Zu spät innehalten.", "Nur Inhalte prüfen, nicht die Technik.", "Jede Überzeugung als Manipulation sehen."],
    safety: ["Keine."],
    conflicts: ["Die Effekte bezogen sich auf Online-Inhalte, nicht auf Gespräche unter vier Augen. [1]"],
    videos: [],
    videoNote: "Keine Videos eingetragen: Die Videos der Studie konnte ich nicht über eine geprüfte ID bestätigen.",
    sources: [SRC_ROOZ],
  },

  "Fehlschlüsse": {
    date: DATE,
    steckbrief: {
      about: "Typische Denkfehler in Argumenten erkennen, etwa Scheinalternativen und Angriffe auf die Person. Wer sie kennt, durchschaut Argumente schneller.",
      why: "In einer Studie verbesserte kurzes Training im Erkennen solcher Techniken die Fähigkeit, vertrauenswürdige Inhalte zu erkennen.",
      tips: "Erst die Fehlschlüsse erkennen und benennen. Sie zu benutzen, um andere zu täuschen, wäre unlauter und wird hier nicht empfohlen.",
      safety: "Keine."
    },
    learn: [
      "Die Studie von Roozenbeek et al. nannte unter den Manipulationstechniken falsche Dichotomien (Scheinalternativen), Ad-hominem-Angriffe, Sündenbock-Strategien, emotional manipulative Sprache und Widersprüchlichkeit. [1]",
      "Kurze Videos, die diese Techniken erklärten, verbesserten das Erkennen der Techniken und die Unterscheidung vertrauenswürdiger von nicht vertrauenswürdigen Inhalten (n = 6 464 in sechs randomisierten Studien, n = 22 632 im Feldversuch). [1]",
      "Für das aktive Einsetzen von Fehlschlüssen habe ich keine seriöse Quelle gefunden; das ist auch nicht der Zweck dieses Dossiers. (Einordnung)",
    ],
    evidence: { level: "teilweise", why: "Für das Erkennen einzelner Techniken liegt gute Evidenz vor; ein vollständiger Katalog von Fehlschlüssen ist damit nicht belegt." },
    steps: [
      "Einen Fehlschluss pro Tag lernen (Scheinalternative, Angriff auf die Person, Sündenbock).",
      "In Nachrichten oder Diskussionen ein Beispiel suchen.",
      "Das Argument in eigenen Worten neu formulieren und prüfen, ob es ohne den Fehlschluss trägt.",
    ],
    plan: [
      { title: "Woche 1", text: "Drei Fehlschlüsse lernen und je ein Beispiel suchen." },
      { title: "Woche 2–4", text: "Jede Woche einen weiteren Fehlschluss; Notiz (Vorschlag)." },
    ],
    myths: [
      { myth: "Wer Fehlschlüsse kennt, wird nie getäuscht.", fact: "Die Studie zeigt Verbesserungen, aber keine vollständige Immunität. [1]" },
    ],
    mistakes: ["Einen Fehlschluss unterstellen, nur weil man dem Ergebnis widerspricht.", "Den Fehlschluss benennen statt auf den Inhalt einzugehen.", "Fehlschlüsse zum Täuschen verwenden."],
    safety: ["Keine."],
    conflicts: ["Die Studie betrifft Online-Falschinformationen und nur fünf Techniken, nicht die ganze Liste klassischer Fehlschlüsse. [1]"],
    videos: [],
    videoNote: "Keine Videos eingetragen: Ich habe kein Video gefunden, das ich als fachlich verlässlich einstufen konnte.",
    sources: [SRC_ROOZ],
  },

  "Verhandeln": {
    date: DATE,
    steckbrief: {
      about: "Eine Einigung aushandeln, bei der man selbst gut abschneidet. Ein Thema ist das Ankern: Das erste Angebot beeinflusst die Antwort.",
      why: "Eine Studie mit 1 320 Personen zeigte, dass sehr genaue Eröffnungspreise bei Laien stärker ankern, bei Fachleuten aber nach hinten losgehen können, wenn sie unkompetent wirken.",
      tips: "Als Eröffnung eine begründete Zahl nennen. Bei Fachleuten nicht übermäßig genaue Zahlen verwenden, außer man belegt die eigene Kompetenz (nach [1]).",
      safety: "Keine."
    },
    learn: [
      "Frühere Forschung nahm an: je genauer der Eröffnungspreis, desto stärker verankert er die Gegenangebote. Fünf Experimente (1 320 Experten und Laien; Immobilien, Schmuck, Autos, Personalfragen) zeigten einen „Zu-viel-Präzision-Effekt“. [1]",
      "Bei Laien wuchs der Ankereffekt linear mit der Präzision; bei Experten verlief er umgekehrt U-förmig. Zu viel Präzision schadete, weil Experten sie als mangelnde Kompetenz deuteten; das galt nicht, wenn die erste Partei eine Begründung nannte. [1]",
      "Zu anderen Verhandlungsthemen (Interessen statt Positionen, Alternative zur Einigung) habe ich keine geprüfte Quelle gelesen. (Einordnung)",
    ],
    evidence: { level: "teilweise", why: "Zu Ankern und Präzision liegen Experimente vor; der Rest populärer Verhandlungsregeln ist hier nicht belegt." },
    steps: [
      "Das eigene Ziel und eine Untergrenze festlegen.",
      "Eine begründete Eröffnung nennen.",
      "Bei Fachleuten die Eröffnung nicht auf übertriebene Genauigkeit stützen. [1]",
      "Nachfragen, Interessen klären, dann erst nachgeben.",
    ],
    plan: [
      { title: "Woche 1–4", text: "Kleine Verhandlungen im Alltag üben (Preis erfragen, Termin aushandeln), danach auswerten (Vorschlag)." },
    ],
    myths: [
      { myth: "Je genauer die erste Zahl, desto besser.", fact: "Bei Fachleuten verlief der Effekt umgekehrt U-förmig; zu große Genauigkeit schadete. [1]" },
    ],
    mistakes: ["Ohne Begründung eine genaue Zahl nennen.", "Zu schnell nachgeben.", "Nicht vorbereitet sein."],
    safety: ["Keine."],
    conflicts: ["Die Experimente stammen aus Laborsituationen mit Rollenspielen; reale Verhandlungen sind komplexer. [1]"],
    videos: [],
    videoNote: "Keine Videos eingetragen: Die gefundenen Verhandlungsvideos stammen nicht von verlässlichen Fachkanälen.",
    sources: [{ title: "Loschelder, Friese, Schaerer et al. 2016, Psychological Science – The Too-Much-Precision Effect", url: PM("27789792"), kind: "Studie" }],
  },

  "Überzeugen & Argumentieren": {
    date: DATE,
    steckbrief: {
      about: "Andere mit Gründen, Rahmung und gutem Zuhören gewinnen. Zuhören entwaffnet oft stärker als Gegenargumente.",
      why: "Studien zeigen, dass Gewinn-Rahmung Vorsorgeverhalten fördern kann und dass gutes Zuhören Standpunkte entschärft.",
      tips: "Bei Meinungsverschiedenheiten zuerst zuhören, dann argumentieren. Bei Vorsorge Nutzen betonen statt Verluste.",
      safety: "Keine."
    },
    learn: [
      "Eine Metaanalyse (94 Studien, 189 Effektgrößen) fand: Gewinn-gerahmte Botschaften förderten Vorsorgeverhalten etwas stärker als verlust-gerahmte (r = 0,083). Auf Einstellungen und Absichten und bei Früherkennung gab es keinen Effekt. [1]",
      "In vier Experimenten verringerte gutes Zuhören (Aufmerksamkeit, Verständnis, positive Absicht) Abwehr und Polarisierung bei Meinungsverschiedenheiten. Die Sprechenden fühlten sich wohler und verbundener und dachten weniger abwehrend nach. [2]",
      "Die Wirkung von Rahmung ist klein; gutes Zuhören wirkte in den Experimenten auf die Einstellungsextreme. [1][2]",
    ],
    evidence: { level: "teilweise", why: "Die Rahmungseffekte sind klein, und die Zuhör-Experimente sind einzeln; eine vollständige Lehre des Überzeugens ist damit nicht belegt." },
    steps: [
      "Zuerst zuhören und das Gehörte in eigenen Worten zurückgeben.",
      "Positive Folgen betonen, wenn es um Vorsorge geht (Gewinn-Rahmung). [1]",
      "Erst dann das eigene Argument einbringen.",
    ],
    plan: [
      { title: "Woche 1–2", text: "In Gesprächen das Gehörte zusammenfassen, bevor ich antworte (Vorschlag)." },
      { title: "Woche 3–4", text: "Bei einer Meinungsverschiedenheit bewusst zuerst fragen und zuhören. [2]" },
    ],
    myths: [
      { myth: "Wer gut argumentiert, überzeugt automatisch.", fact: "Wenn Gegenargumente Abwehr auslösen, kann die Polarisierung zunehmen; gutes Zuhören senkte sie in den Experimenten. [2]" },
      { myth: "Drohende Verluste motivieren stärker als Nutzen.", fact: "Bei Vorsorge war Gewinn-Rahmung etwas wirksamer. [1]" },
    ],
    mistakes: ["Während des Zuhörens schon Gegenargumente bilden.", "Zu früh widersprechen.", "Alles auf eine Rahmung setzen."],
    safety: ["Keine."],
    conflicts: ["Frühere Metaanalysen fanden nur begrenzte Wirkung von Rahmung; die Wirkung hängt vom Ergebnismaß ab. [1]"],
    videos: [],
    videoNote: "Keine Videos eingetragen: Ich habe kein Video gefunden, das ich als fachlich verlässlich einstufen konnte.",
    sources: [
      { title: "Gallagher & Updegraff 2012, Annals of Behavioral Medicine – Health message framing effects on attitudes, intentions, and behavior: a meta-analytic review", url: PM("21993844"), kind: "Metaanalyse" },
      SRC_ITZ,
    ],
  },

  "Gesprächspsychologie": {
    date: DATE,
    steckbrief: {
      about: "Wie Gespräche wirken: zuhören, verstehen, Abwehr vermeiden. In der Forschung wird besonders „hochwertiges Zuhören“ untersucht.",
      why: "In Experimenten verringerte hochwertiges Zuhören Abwehr und Polarisierung bei Meinungsverschiedenheiten.",
      tips: "Aufmerksam sein, Verständnis zeigen, wohlwollende Absicht zeigen. Nicht schon beim Zuhören Gegenargumente planen.",
      safety: "Keine."
    },
    learn: [
      "Wenn jemand spricht, denken Zuhörende oft schon über Gegenargumente nach; das polarisiert Einstellungen oft eher, als es sie annähert. [1]",
      "In vier Experimenten (Videovignette und Live-Gespräche) wirkte hochwertiges Zuhören (Aufmerksamkeit, Verständnis, positive Absicht) so, dass Sprechende sich sozial wohler und verbundener fühlten und weniger abwehrend über ihre Haltung nachdachten. [1]",
      "Das verringerte wahrgenommene und tatsächliche Polarisierung (weniger extreme Einstellung). Die Effekte galten weitgehend über Einstellungsstärke, Gewissheit und Moral hinweg. [1]",
    ],
    evidence: { level: "teilweise", why: "Vier Experimente mit konsistenten Ergebnissen aus einer Forschungsgruppe; unabhängige Wiederholungen habe ich nicht gelesen." },
    steps: [
      "Aufmerksam zuhören, ohne zu unterbrechen.",
      "Das Verstandene in eigenen Worten zurückgeben.",
      "Wohlwollend nachfragen.",
      "Erst danach den eigenen Standpunkt nennen.",
    ],
    plan: [
      { title: "Woche 1–4", text: "In einem Gespräch pro Tag bewusst hochwertig zuhören (Vorschlag, gestützt durch [1])." },
    ],
    myths: [
      { myth: "Zuhören ist passiv.", fact: "In den Experimenten verringerte aktives, wohlwollendes Zuhören die Polarisierung. [1]" },
    ],
    mistakes: ["Gegenargumente vorbereiten statt zuzuhören.", "Unterbrechen.", "Nur so tun, als würde man zuhören."],
    safety: ["Keine."],
    conflicts: ["Die Experimente stammen aus einer Forschungsgruppe und aus Laborsituationen. [1]"],
    videos: [
      { title: "Celeste Headlee: 10 ways to have a better conversation", id: "R1vskiVDwl4", channel: "TED", why: "Praktische Tipps zum Zuhören und Gespräch; Erfahrungsvortrag, kein Studienbeleg.", checked: true },
    ],
    videoNote: "Nur ein Video eingetragen, nach Titel beurteilt.",
    sources: [SRC_ITZ],
  },

  "Frei reden": {
    date: DATE,
    steckbrief: {
      about: "Vor Menschen sprechen, ohne abzulesen. Redeangst ist häufig und behandelbar.",
      why: "Eine Übersichtsarbeit stellt fest, dass Redeangst sehr verbreitet ist und dass Behandlungen mit virtueller Konfrontation und internetbasierter Selbsthilfe wirksam sind.",
      tips: "In kleinen Schritten üben: vor Freunden, dann vor einer kleinen Gruppe. Stichworte statt Text.",
      safety: "Bei starker Angst, die den Alltag einschränkt, Hilfe suchen (Hausarzt, Psychotherapie)."
    },
    learn: [
      "Eine Übersichtsarbeit (2012) beschreibt Redeangst als Furcht, vor anderen zu sprechen. Sie ist sehr verbreitet, geht mit starker psychischer und körperlicher Reaktion einher und könnte ein eigener Untertyp der sozialen Angststörung sein. [1]",
      "Behandlungsprogramme mit Konfrontation in virtueller Realität und internetbasierte kognitiv-verhaltenstherapeutische Selbsthilfe waren laut dieser Arbeit wirksam. [1]",
      "Zu Rhetorik-Techniken (Stimme, Gliederung) habe ich keine geprüfte Studie gelesen; die Empfehlungen unten sind Vorschläge. (Einordnung)",
    ],
    evidence: { level: "teilweise", why: "Für die Behandlung von Redeangst liegt eine Übersicht vor; Studien zu Rede-Technik habe ich nicht gelesen." },
    steps: [
      "Die Rede in drei Kernpunkte gliedern (Vorschlag).",
      "Laut üben, mehrmals, am besten vor einer Person.",
      "Mit Stichwörtern statt Volltext sprechen.",
      "Nach der Rede kurz notieren, was gut lief.",
    ],
    plan: [
      { title: "Woche 1–2", text: "Täglich 5 Minuten laut vor dem Spiegel oder einem Freund sprechen (Vorschlag)." },
      { title: "Woche 3–4", text: "Vor einer kleinen Gruppe sprechen; schrittweise steigern (Konfrontation in kleinen Schritten; Vorschlag, gestützt durch [1])." },
    ],
    myths: [
      { myth: "Redeangst vergeht von allein.", fact: "Sie ist verbreitet, und Behandlungen mit schrittweiser Konfrontation sind wirksam. [1]" },
    ],
    mistakes: ["Alles auswendig lernen.", "Zu schnell sprechen.", "Nur im Kopf üben statt laut."],
    safety: ["Bei starker Angst Hilfe suchen. (Vorsichtsregel)"],
    conflicts: ["Die Übersicht fasst Studien bis 2011 zusammen; neuere Ergebnisse können abweichen. [1]"],
    videos: [
      { title: "How to Speak So That People Want to Listen | Julian Treasure | TED", id: "eIho2S0ZahI", channel: "TED", why: "Vortrag über Stimme und Sprechen; Erfahrungsbericht, kein Studienbeleg.", checked: true },
    ],
    videoNote: "Nur ein Video eingetragen, nach Titel beurteilt.",
    sources: [{ title: "Pull 2012, Current Opinion in Psychiatry – Current status of knowledge on public-speaking anxiety", url: PM("22156935"), kind: "Übersichtsarbeit" }],
  },

  "IKEA-Effekt": {
    date: DATE,
    steckbrief: {
      about: "Wir bewerten selbst gebaute Dinge höher als gleichwertige fremde. Das Prinzip gilt für Möbel, aber auch für Ideen und Projekte.",
      why: "Man kann den Effekt gezielt nutzen, damit sich Menschen beteiligt fühlen, und sich selbst vor Überbewertung der eigenen Arbeit schützen.",
      tips: "Eigene Entwürfe bewusst mit einer externen Sicht vergleichen. Menschen einbinden, damit sie Verantwortung spüren.",
      safety: "Keine."
    },
    learn: [
      "In vier Studien (IKEA-Kartons zusammenbauen, Origami falten, Lego bauen) stieg die Bewertung selbst gemachter Produkte (IKEA-Effekt). Teilnehmende sahen ihre laienhaften Werke als ähnlich wertvoll wie die von Experten und erwarteten, dass andere das auch so sehen. [1]",
      "Der Effekt trat nur auf, wenn die Arbeit erfolgreich abgeschlossen wurde; wurden Werke zerstört oder nicht vollendet, verschwand er. Er galt für Heimwerker und Neulinge. [1]",
      "Eine Studie mit Kindern zeigte, dass die Verzerrung ab etwa 5 Jahren auftritt und nicht von der Anstrengung abhing; die Autoren vermuten einen Zusammenhang mit dem Selbstbild. [2]",
    ],
    evidence: { level: "gut", why: "Mehrere Experimente zeigen den Effekt und seine Grenzen; die Gründe sind noch umstritten." },
    steps: [
      "Eigene Arbeit bewusst mit einer gleichwertigen fremden vergleichen.",
      "Andere um ehrliche Einschätzung bitten.",
      "Wenn man andere einbinden will: sie ein Stück selbst gestalten lassen (Vorschlag).",
    ],
    plan: [
      { title: "Woche 1", text: "Ein eigenes Werk mit einer fremden Alternative vergleichen und nach Feedback fragen (Vorschlag)." },
    ],
    myths: [
      { myth: "Mehr Anstrengung erhöht automatisch den Wert.", fact: "Bei Kindern hing der Effekt nicht von der Anstrengung ab; bei Erwachsenen fehlte er, wenn die Aufgabe nicht gelang. [1][2]" },
    ],
    mistakes: ["Eigene Arbeit überschätzen.", "Nicht fremde Meinung einholen.", "Unvollendetes Werk verteidigen."],
    safety: ["Keine."],
    conflicts: ["Über die Ursachen gibt es verschiedene Erklärungen (Eigentum, Selbstbild, Anstrengung); die Kinderstudie widerspricht bestehenden Theorien. [2]"],
    videos: [],
    videoNote: "Keine Videos eingetragen: Ich habe kein Video gefunden, das ich als fachlich verlässlich einstufen konnte.",
    sources: [
      { title: "Norton, Mochon & Ariely 2012, Journal of Consumer Psychology – The IKEA effect: When labor leads to love", url: "https://doi.org/10.1016/j.jcps.2011.08.002", kind: "Studie" },
      { title: "Marsh, Kanngiesser & Hood 2018, Cognition – When and how does labour lead to love? The ontogeny and mechanisms of the IKEA effect", url: PM("29080469"), kind: "Studie" },
    ],
  },

  "Gebärdensprache": {
    date: DATE,
    steckbrief: {
      about: "Eine Gebärdensprache lernen, etwa Deutsche (DGS) oder Amerikanische (ASL).",
      why: "Eine Studie zeigt, dass hörende Erwachsene Gebärden besser behalten, wenn sie sie selbst ausführen, als wenn sie nur zusehen.",
      tips: "Gebärden selbst nachmachen und spüren, nicht nur ansehen. Einen Kurs besuchen (Vorschlag).",
      safety: "Keine."
    },
    learn: [
      "In einer Studie mit hörenden Erwachsenen lernten Teilnehmende ASL-Gebärden durch eigene Ausführung (mit geschlossenen Augen) oder nur durch Beobachtung. Selbst ausgeführte Gebärden wurden genauer erinnert. [1]",
      "Der Effekt war bei Gebärden mit geringer Ähnlichkeit zur Bedeutung (geringe Ikonizität) besonders groß. Die Autoren sehen körperliches Spüren (somatosensorisches Feedback) als Mechanismus. [1]",
      "Zur Lernzeit für eine ganze Gebärdensprache habe ich keine Studie gefunden; die Zeitschätzung in der App ist eine eigene Schätzung.",
    ],
    evidence: { level: "teilweise", why: "Eine Studie zur Wirkung eigenen Ausführens beim Gebärdenlernen; zu Kursen und Lernzeiten keine." },
    steps: [
      "Eine Gebärdensprache wählen (DGS im deutschsprachigen Raum).",
      "Gebärden immer selbst mitmachen.",
      "Mit einfachen Vokabeln und Grüßen beginnen.",
      "Mit Gehörlosen üben, wenn möglich.",
    ],
    plan: [
      { title: "Woche 1–4", text: "Täglich 10 Minuten: 5 neue Gebärden selbst ausführen und wiederholen (Vorschlag, gestützt durch [1])." },
    ],
    myths: [
      { myth: "Nur Zuschauen genügt.", fact: "Selbst ausgeführte Gebärden wurden besser erinnert. [1]" },
    ],
    mistakes: ["Nur Videos ansehen.", "Mimik und Körper weglassen."],
    safety: ["Keine."],
    conflicts: ["Die Studie nutzt ASL und Laboraufgaben; DGS wurde nicht untersucht. [1]"],
    videos: [
      { title: "Your First ASL Conversation Step-By-Step | American Sign Language Basics", id: "g6X4lRA_MFo", channel: "Learn How to Sign", why: "Anfängerlektion in ASL; für DGS habe ich kein geprüftes Video gefunden.", checked: true },
    ],
    videoNote: "Nur ein ASL-Video eingetragen, nach Titel beurteilt; für DGS keines gefunden.",
    sources: [{ title: "Morett et al. 2024, Studies in Second Language Acquisition – Feeling signs: motor encoding enhances sign language learning in hearing adults", url: PM("39524403"), kind: "Studie" }],
  },

  "Phonetische Mimikry": {
    date: DATE,
    steckbrief: {
      about: "Die Sprechweise des Gegenübers unbewusst oder bewusst angleichen (Phonetic Convergence). Das ist ein natürlicher Vorgang und lässt sich üben, die Befunde sind aber noch dünn.",
      why: "Eine kleine Studie fand, dass das Nachsprechen eines Sprechers dessen Sprache für den Nachgesprochenen verständlicher machte.",
      tips: "Nur sanft angleichen, nicht nachäffen. Als Übung: kurze Sätze nachsprechen (Shadowing).",
      safety: "Nachahmen kann als Spott gewertet werden; vorsichtig vorgehen (Vorsichtsregel, keine Studie)."
    },
    learn: [
      "Phonetic Convergence beschreibt, wenn die Sprechweise einer zuhörenden Person der des gehörten Sprechers ähnlicher wird. [1]",
      "In einer Studie mit nur 9 Teilnehmenden wurden Wörter im Rauschen besser erkannt, wenn sie von Personen gesprochen wurden, die zuvor die eigene Sprache nachgesprochen hatten (Shadowing). Die Genauigkeit stieg mit der bewerteten Ähnlichkeit. [1]",
      "Die Stichprobe ist sehr klein; die Autoren sehen die Ergebnisse als Unterstützung der Annahme, dass Angleichung Verstehen erleichtern kann. [1]",
    ],
    evidence: { level: "kaum", why: "Eine einzelne Studie mit 9 Teilnehmenden; zur Trainierbarkeit und Wirkung im Alltag habe ich nichts gelesen." },
    steps: [
      "Kurze Sätze einer Sprecherin oder eines Sprechers laut nachsprechen.",
      "Rhythmus, Tonhöhe und Aussprache angleichen.",
      "Im Gespräch nur leicht angleichen.",
    ],
    plan: [
      { title: "Woche 1–4", text: "Täglich 5 Minuten Shadowing einer Aufnahme (Vorschlag, die Studie nutzte Shadowing als Methode [1])." },
    ],
    myths: [
      { myth: "Angleichen macht Gespräche immer besser.", fact: "Die kleine Studie zeigt nur eine bessere Verständlichkeit im Hörtest. [1]" },
    ],
    mistakes: ["Übertreiben und als Spott wirken.", "Den Gesprächsinhalt vernachlässigen.", "Auf eine Studie bauen."],
    safety: ["Nicht zur Täuschung oder zum Spott einsetzen. (Vorsichtsregel)"],
    conflicts: ["Die Studie hat nur 9 Teilnehmende; eine Verallgemeinerung ist nicht belegt. [1]"],
    videos: [],
    videoNote: "Keine Videos eingetragen: Ich habe kein Video gefunden, das ich als fachlich verlässlich einstufen konnte.",
    sources: [{ title: "Dorsi, Dias, Zadoorian et al. 2025, Attention, Perception & Psychophysics – Phonetic convergence enhances speech intelligibility", url: PM("40069480"), kind: "Studie" }],
  },
};
