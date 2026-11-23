import type { Dossier } from "./dossiers";

// Kategorie „Tricks, Geschick & Mentalismus“.
// Recherchiert am 23. November 2026. Studien über PubMed/Crossref geprüft (Titel, Autoren, Abstract); Aussagen stehen nur, wenn sie im Abstract oder auf der verlinkten Seite stehen.
// Ausgelassen (keine seriösen Quellen gefunden): Münzrolle, Stift drehen, Ball auf dem Finger, Schloss knacken, Bierpong.
const DATE = "23. November 2026";
const PM = (id: string) => `https://pubmed.ncbi.nlm.nih.gov/${id}/`;

export const DOSSIERS_TRICKS: Record<string, Dossier> = {
  "Jonglieren": {
    date: DATE,
    steckbrief: {
      about: "Drei Bälle in der Kaskade: abwechselnd rechts und links werfen, sodass immer zwei in der Luft sind. Die Grundform lernen viele Erwachsene in einigen Wochen regelmäßigen Übens (eigene Einordnung, keine Studienzahl).",
      why: "Jonglieren ist eine gut untersuchte Lernaufgabe. In Bildgebungsstudien veränderte sich bei Erwachsenen, die es neu lernten, die graue Substanz im Bereich der Bewegungswahrnehmung; schon nach sieben Übungstagen zeigte sich eine Veränderung. Was das für Alltag oder Gedächtnis bedeutet, ist offen.",
      tips: "Erst mit einem Ball üben (Wurfhöhe auf Augenhöhe), dann zwei, dann drei. Kurze, häufige Einheiten und etwas Neues dazulernen sind besser als stures Wiederholen des Bekannten (Vorschlag, gestützt durch [1]).",
      safety: "Harmlos. Weiche Bälle verwenden, Platz schaffen, auf Stolperfallen achten.",
    },
    learn: [
      "Eine Studie mit 20 gesunden Erwachsenen zeigte: Das Erlernen der Drei-Ball-Kaskade kann die graue Substanz im occipito-temporalen Kortex (Bereich hMT/V5, bewegungsempfindlich) schon nach 7 Tagen Training verändern. Weder Leistung noch Übungsmenge allein erklärten die Veränderung. [1]",
      "Die Autoren vermuten, dass das Lernen einer neuen Aufgabe wichtiger ist als das Weiterüben einer bereits gelernten. Das ist eine Deutung, kein gesicherter Mechanismus. [1]",
      "Ein systematischer Überblick fand 11 Studien mit 400 Teilnehmenden; alle zeigten strukturelle Veränderungen im Gehirn. Die Autoren selbst weisen auf die kleine Zahl guter Studien und ein hohes Verzerrungsrisiko hin. [2]",
      "Ein weiterer Überblick über 36 Trainingsstudien (u. a. Jonglieren) fand uneinheitliche Muster: Zunahme, Abnahme oder keine Veränderung der grauen Substanz. [3]",
    ],
    evidence: { level: "teilweise", why: "Dass Jonglieren Hirnstruktur messbar verändert, ist mehrfach gezeigt, aber mit kleinen Stichproben und hohem Verzerrungsrisiko; ein Nutzen für Alltag oder Denken ist daraus nicht belegt." },
    steps: [
      "Mit einem Ball: im Bogen von Hand zu Hand werfen, Gipfel etwa auf Augenhöhe.",
      "Mit zwei Bällen: werfen und, wenn der erste oben ist, den zweiten werfen; jeder wird in der anderen Hand gefangen.",
      "Mit drei Bällen: zwei in einer Hand, einen in der anderen; beginnen, jeweils wenn der vorige oben ist, den nächsten werfen.",
      "Zuerst nur drei Würfe üben, dann fünf, dann zehn.",
    ],
    plan: [
      { title: "Woche 1", text: "Täglich 10 Minuten: ein Ball, dann zwei Bälle. In der Studie zeigte sich bereits nach 7 Tagen Veränderung. [1]" },
      { title: "Woche 2–4", text: "Drei Bälle, Ziel: 10 Würfe am Stück." },
      { title: "Danach", text: "Etwas Neues dazu (Rückwärtskaskade, Trick), statt nur die Kaskade zu wiederholen. [1] (Vorschlag)" },
    ],
    myths: [
      { myth: "Jonglieren macht klüger.", fact: "Die Studien messen Veränderungen der Hirnstruktur, keinen Gewinn an Intelligenz oder Gedächtnis. [2][3]" },
      { myth: "Das Gehirn wächst dauerhaft.", fact: "In der Studie zur Zeitentwicklung war die Veränderung transient bzw. hing vom Lernen ab; ein dauerhafter Effekt ist nicht belegt. [1]" },
    ],
    mistakes: ["Bälle nach vorn statt nach oben werfen.", "Auf die Hände statt auf den Gipfel der Flugbahn schauen.", "Zu schnell werfen, bevor der Rhythmus sitzt."],
    safety: ["Keine besonderen Risiken; über Kopf werfende Tricks mit weichen Bällen üben."],
    conflicts: ["Die Richtung der Hirnveränderungen ist in der Literatur nicht einheitlich (Zunahme, Abnahme, keine Änderung). [3]", "Kleine Stichproben und hohes Verzerrungsrisiko schwächen die Aussage. [2]"],
    videos: [
      { title: "Learn to juggle 3 balls! (Beginners tutorial)", id: "dRRLJdOJxpQ", channel: "Circus Made Simple", why: "Schritt für Schritt von einem Ball bis zur Kaskade.", checked: true },
      { title: "Learn to JUGGLE 3 BALLS - Beginner Tutorial", id: "dCYDZDlcO6g", channel: "Taylor Tries", why: "Zweite Anleitung mit Fehlerhinweisen.", checked: true },
      { title: "How to Juggle 3 Balls for Beginners - 3-Ball Cascade Juggling Tutorial", id: "SHYDbOLrU1w", channel: "Ultimate101", why: "Kaskade im Detail.", checked: true },
    ],
    sources: [
      { title: "Driemeyer, Boyke, Gaser et al. 2008, PLoS ONE – Changes in gray matter induced by learning – revisited", url: PM("18648501"), kind: "Studie" },
      { title: "Malik, Stemplewski & Maciaszek 2022, IJERPH – The Effect of Juggling as Dual-Task Activity on Human Neuroplasticity: A Systematic Review", url: PM("35742356"), kind: "Übersichtsarbeit" },
      { title: "Valkanova, Eguia Rodriguez & Ebmeier 2014, International Psychogeriatrics – Mind over matter: what do we know about neuroplasticity in adults?", url: PM("24382194"), kind: "Übersichtsarbeit" },
    ],
  },

  "Karten mischen": {
    date: DATE,
    steckbrief: {
      about: "Das Riffle-Shuffle: den Stapel teilen, die Hälften mit den Daumen ineinander rieseln lassen, biegen und zusammenschieben. Dazu gehört, den Stapel sauber zu halten und zu quadrieren.",
      why: "Eine mathematische Analyse des Riffle-Shuffles zeigt, wie oft man mischen muss, damit ein Stapel gut durchmischt ist. Die Anzahl wächst nur langsam mit der Kartenzahl; die oft genannte Faustregel „sieben Mal“ ist im gelesenen Abstract nicht belegt (siehe Text).",
      tips: "Karten leicht biegen, beim Rieseln die Daumen gleichmäßig lösen, dann erst zusammenschieben. Die Zahl der Mischvorgänge zählt mehr als die Eleganz.",
      safety: "Harmlos. Beim Biegen nicht überdehnen, sonst knicken Karten.",
    },
    learn: [
      "Bayer und Diaconis (1992) analysierten das gebräuchlichste Mischverfahren und gaben die Wahrscheinlichkeit jeder Anordnung nach beliebig vielen Mischvorgängen an. [1]",
      "Ihr Ergebnis: Bei n Karten sind etwa 3/2 · log2(n) + θ Mischvorgänge notwendig und ausreichend, um den Stapel gut zu durchmischen. [1]",
      "Für n = 52 ergibt 1,5 · log2(52) etwa 8,5; der Zusatzterm θ beeinflusst das genaue Ergebnis. Die bekannte Faustregel „sieben Mal“ stammt aus dieser Arbeit, ich habe die Zahl 7 aber nicht im gelesenen Abstract gefunden; sie bleibt eine Einordnung. [1]",
    ],
    evidence: { level: "gut", why: "Die mathematische Aussage ist ein Beweis; ob die Technik von Hand sauber genug ist, hängt von der Übung ab." },
    steps: [
      "Stapel in beiden Händen halten, mit den Daumen in die Mitte teilen.",
      "Die Hälften mit den Ecken zueinander legen und leicht biegen.",
      "Daumen gleichmäßig lösen, sodass die Karten abwechselnd fallen.",
      "Die Hälften zusammenschieben, quadrieren.",
    ],
    plan: [
      { title: "Woche 1", text: "Täglich 10 Minuten nur das Teilen und Biegen üben." },
      { title: "Woche 2", text: "Das Rieseln üben, auf gleichmäßiges Fallen achten." },
      { title: "Danach", text: "Immer mehrmals hintereinander mischen, nicht nur einmal. [1]" },
    ],
    myths: [
      { myth: "Zweimal Mischen reicht.", fact: "Die Analyse zeigt, dass es für 52 Karten deutlich mehr Mischvorgänge braucht. [1]" },
    ],
    mistakes: ["Zu wenig oft mischen.", "Karten ungleichmäßig lösen, sodass große Pakete übrig bleiben.", "Zu viel Druck und geknickte Karten."],
    safety: ["Keine."],
    conflicts: ["Die genaue Anzahl hängt vom gewählten Maß für „durchmischt“ ab; die Formel liefert eine Größenordnung. [1]"],
    videos: [
      { title: "Cardistry for Beginners: Shuffles - Riffle Shuffle Tutorial", id: "f6ZD1lDbW3M", channel: "School Of Cardistry", why: "Technik des Riffle-Shuffles.", checked: true },
      { title: "Learn the Riffle Shuffle – Beginner Card Magic Tutorial", id: "aemn4Ih-S24", channel: "Card Magic Journey", why: "Teilen, Greifen, Rieseln, Quadrieren.", checked: true },
      { title: "How to Shuffle a Deck of Cards For Beginners (Thorough and Easy Tutorial!) Riffle Shuffle", id: "SasjPVRdZA0", channel: "Ston Brothers", why: "Ausführliche Anfängeranleitung.", checked: true },
    ],
    sources: [
      { title: "Bayer & Diaconis 1992, Annals of Applied Probability – Trailing the Dovetail Shuffle to its Lair", url: "https://doi.org/10.1214/aoap/1177005705", kind: "Studie" },
    ],
  },

  "Münzzauberei": {
    date: DATE,
    steckbrief: {
      about: "Kleine Münztricks wie Verschwinden lassen (z. B. French Drop) und Palmieren: die Münze unauffällig in der Hand halten.",
      why: "Die Tricks beruhen weniger auf schneller Hand als auf Lenkung der Aufmerksamkeit. Forschung beschreibt Misdirection als Fähigkeit, Aufmerksamkeit, Gedanken und Gedächtnis zu lenken.",
      tips: "Zuerst die Bewegung langsam und entspannt üben, dann vor dem Spiegel; der Blick des Vorführenden gehört zum Trick.",
      safety: "Harmlos. Münzen nicht verschlucken lassen (Kinder).",
    },
    learn: [
      "Misdirection bezeichnet die Fähigkeit des Magiers, Aufmerksamkeit, Gedanken und Gedächtnis des Publikums zu lenken. Ein Überblick fasst die Konzepte der Magier und die wissenschaftlichen Paradigmen zusammen. [1]",
      "Ein theoretischer Ansatz beschreibt den „Wow“-Effekt als Überraschung durch einen Vorhersagefehler; die Lenkung von Aufmerksamkeit und Überzeugungen verstärkt ihn. [2]",
      "Manche Tricks beruhen laut einer Arbeit weniger auf manueller Geschicklichkeit als auf automatischen Wahrnehmungsprozessen und funktionieren fast von selbst. [3]",
    ],
    evidence: { level: "teilweise", why: "Die Psychologie von Magie ist wissenschaftlich beschrieben, aber über den Lernerfolg bestimmter Münztricks gibt es keine Studien." },
    steps: [
      "Die Münze in der Hand locker halten.",
      "Die Bewegung des „Nehmens“ langsam üben; die andere Hand soll ruhig bleiben.",
      "Mit dem Blick der Bewegung folgen, als sei die Münze wirklich dort.",
      "Dann vor dem Spiegel und vor Freunden üben.",
    ],
    plan: [
      { title: "Woche 1–2", text: "Täglich 10 Minuten eine einzige Bewegung (Palmieren oder Verschwinden)." },
      { title: "Woche 3+", text: "Einen kurzen Ablauf mit Einleitung und Schluss einüben (Vorschlag)." },
    ],
    myths: [
      { myth: "Man muss unglaublich schnell sein.", fact: "Die Forschung beschreibt Lenkung der Aufmerksamkeit als Kern, nicht Tempo. [1][2]" },
    ],
    mistakes: ["Auf die Hand mit der Münze schauen.", "Zu schnell werden.", "Trick wiederholen, sodass das Publikum ihn durchschaut."],
    safety: ["Keine."],
    conflicts: ["Der Anteil von Geschick und Wahrnehmungstäuschung wird unterschiedlich gewichtet. [2][3]"],
    videos: [
      { title: "Coin VANISH that ANYONE Can Do (EASY) – French Drop Magic TUTORIAL", id: "G7QaSQzHYY0", channel: "Bao Magic", why: "French Drop für Anfänger.", checked: true },
      { title: "Coin Magic Masterclass: Palms, Vanishes & Productions with a Single Coin *for Beginners", id: "ntp1OVj79IE", channel: "Doug Conn", why: "Längere Anleitung für Einsteiger.", checked: true },
      { title: "Coin Magic Tutorial: How To Vanish A Coin part 1", id: "ggyU729JA7Q", channel: "Rick Holcombe", why: "Verschiedene Vanishes.", checked: true },
    ],
    sources: [
      { title: "Kuhn & Martinez 2011, Frontiers in Human Neuroscience – Misdirection – past, present, and the future", url: PM("22232587"), kind: "Übersichtsarbeit" },
      { title: "Grassi & Bartels 2021, Neuroscience & Biobehavioral Reviews – Magic, Bayes and wows: A Bayesian account of magic tricks", url: PM("33838209"), kind: "Übersichtsarbeit" },
      { title: "Ekroll, Sayim & Wagemans 2017, Perspectives on Psychological Science – The Other Side of Magic", url: PM("28073329"), kind: "Übersichtsarbeit" },
    ],
  },

  "Zauberwürfel": {
    date: DATE,
    steckbrief: {
      about: "Den 3×3-Würfel lösen: mit der Anfängermethode ebenenweise (Kreuz, erste Ebene, zweite Ebene, letzte Ebene) und einigen Zugfolgen (Algorithmen).",
      why: "Jede Stellung des Würfels lässt sich in höchstens 20 Zügen lösen (bewiesen); Menschen brauchen mit Merkmethoden deutlich mehr, aber das Lösen ist erlernbar.",
      tips: "Eine Methode wählen und bei ihr bleiben. Zugfolgen langsam und fehlerfrei üben, bevor man schneller wird (Vorschlag).",
      safety: "Harmlos.",
    },
    learn: [
      "Es ist bewiesen: „God's Number“ ist 20, also braucht keine Stellung des Würfels mehr als 20 Züge (Halbdrehung zählt als ein Zug). Der Beweis nutzte rund 35 CPU-Jahre ungenutzter Rechenzeit, gespendet von Google. [1]",
      "Algorithmen, die ein Mensch sich merken kann, benötigen laut derselben Seite typischerweise mehr als 40 Züge. Das erklärt, warum Anfänger-Lösungen deutlich länger sind als das theoretische Minimum. [1]",
      "Für die Lernmethode (Ebenen-Methode) fand ich keine Studie; die Anleitungen stammen aus Videos von Kanälen mit Tutorials, die ich nur nach Titel beurteilt habe. (Einordnung, ungeprüft)",
    ],
    evidence: { level: "teilweise", why: "Die mathematische Aussage ist bewiesen; zum Lernen oder zu Lernzeiten gibt es keine Studie, die ich gelesen habe." },
    steps: [
      "Eine Anfängermethode wählen (Ebenen-Methode).",
      "Das Kreuz auf einer Seite lösen.",
      "Erste Ebene fertigstellen, dann die mittlere Ebene.",
      "Letzte Ebene mit den Zugfolgen der Methode lösen.",
    ],
    plan: [
      { title: "Woche 1–2", text: "Täglich 15 Minuten: Kreuz und erste Ebene sicher lösen." },
      { title: "Woche 3–4", text: "Mittlere Ebene und letzte Ebene lernen." },
      { title: "Danach", text: "Wiederholen, bis die Zugfolgen ohne Nachschlagen laufen (Vorschlag)." },
    ],
    myths: [
      { myth: "Man braucht Mathematik-Talent.", fact: "Die Anfängermethode besteht aus Merkfolgen; ein mathematischer Beweis wie bei God's Number ist dafür nicht nötig. [1]" },
      { myth: "Man braucht viele Züge pro Lösung.", fact: "Das Minimum liegt bei höchstens 20, die Menschen-Methoden bei deutlich mehr als 40. [1]" },
    ],
    mistakes: ["Mehrere Methoden mischen.", "Zugfolgen zu schnell machen und sich verdrehen.", "Ohne Gesamtbild nur Seiten lösen."],
    safety: ["Keine."],
    conflicts: ["Welche Methode für Anfänger „die beste“ ist, wird in den Anleitungen unterschiedlich dargestellt; Studien dazu habe ich nicht."],
    videos: [
      { title: "How to Solve the Rubik's Cube: Beginner's Method (EASY)", id: "hdc7CYO9P1c", channel: "ParadoxCubing", why: "Anfängermethode Schritt für Schritt.", checked: true },
      { title: "Easiest Rubik's Cube Tutorial You'll EVER Need!", id: "0Ti5CKsQLts", channel: "Leila Gharani", why: "Zweite Anleitung.", checked: true },
      { title: "How to Solve the Rubik's Cube(Beginner's Method)", id: "vlp0-_OPRwA", channel: "Incredicuber", why: "Dritte Anleitung.", checked: true },
    ],
    sources: [
      { title: "cube20.org – God's Number is 20", url: "https://www.cube20.org/", kind: "Fachseite" },
    ],
  },

  "Damen-Kartentrick": {
    date: DATE,
    steckbrief: {
      about: "Ein einfacher Kartentrick, der mit einer Dame arbeitet. Der Ablauf wird hier nicht erklärt, die Seite beschreibt die Hintergründe.",
      why: "Einfache Kartentricks funktionieren oft über Lenkung der Aufmerksamkeit und das Erzeugen falscher Annahmen beim Publikum.",
      tips: "Ablauf einüben, die Geschichte um den Trick formulieren, nie zweimal hintereinander denselben Trick vor derselben Person zeigen (Vorsichtsregel aus der Praxis, nicht aus einer Studie).",
      safety: "Harmlos.",
    },
    learn: [
      "Misdirection ist die Fähigkeit, Aufmerksamkeit, Gedanken und Gedächtnis des Publikums zu lenken. [1]",
      "Magie lässt sich als Überraschung durch einen Vorhersagefehler beschreiben: Der Magier erzeugt falsche Erwartungen. [2]",
      "Einige Tricks beruhen auf automatischen Wahrnehmungsprozessen und sind deshalb schwer zu durchschauen. [3]",
    ],
    evidence: { level: "kaum", why: "Es gibt Forschung zur Psychologie von Magie allgemein, aber nicht zu diesem Trick." },
    steps: [
      "Den Ablauf der Methode lernen (Anleitung aus einem Zauberbuch oder einer geprüften Quelle).",
      "Mehrfach üben, bis der Ablauf ohne Nachdenken läuft.",
      "Die Vorführung mit einer kurzen Geschichte einrahmen.",
    ],
    plan: [
      { title: "Woche 1", text: "Ablauf einüben, an einem Tag 10 Minuten." },
      { title: "Danach", text: "Vor Freunden zeigen und Rückmeldung einholen (Vorschlag)." },
    ],
    myths: [
      { myth: "Der Trick hängt am Fingerspitzengefühl.", fact: "Bei vielen Tricks tragen Aufmerksamkeitslenkung und Wahrnehmung mehr als Geschwindigkeit. [1][3]" },
    ],
    mistakes: ["Zu schnell zeigen.", "Die Methode verraten, indem man hinsieht.", "Wiederholungen vor demselben Publikum."],
    safety: ["Keine."],
    conflicts: ["Die Forschung zu Magie ist theoretisch und selten auf einzelne Tricks bezogen. [2]"],
    videos: [],
    videoNote: "Keine geprüften Videos: Der Trick ist nicht eindeutig benannt; ohne den genauen Namen wollte ich kein Video eintragen.",
    sources: [
      { title: "Kuhn & Martinez 2011, Frontiers in Human Neuroscience – Misdirection – past, present, and the future", url: PM("22232587"), kind: "Übersichtsarbeit" },
      { title: "Grassi & Bartels 2021, Neuroscience & Biobehavioral Reviews – Magic, Bayes and wows: A Bayesian account of magic tricks", url: PM("33838209"), kind: "Übersichtsarbeit" },
      { title: "Ekroll, Sayim & Wagemans 2017, Perspectives on Psychological Science – The Other Side of Magic", url: PM("28073329"), kind: "Übersichtsarbeit" },
    ],
  },

  "Hypnose & Mentalismus": {
    date: DATE,
    steckbrief: {
      about: "Zwei verwandte, aber verschiedene Felder: klinische Hypnose (Suggestion in einem Behandlungsrahmen) und Mentalismus, eine Bühnenkunst, die Gedankenlesen vortäuscht.",
      why: "Klinische Hypnose ist als Zusatzbehandlung bei Angst untersucht. Mentalismus beruht laut Magieforschung auf Aufmerksamkeitslenkung und Wahrnehmung, nicht auf übersinnlichen Fähigkeiten.",
      tips: "Beides getrennt betrachten. Bühnenshows liefern keinen Beleg für klinische Wirkung.",
      safety: "Hypnose als Behandlung nur bei ausgebildeten Fachleuten. Bei psychischen Erkrankungen nicht als Ersatz für Therapie. Bühnenhypnose an anderen Personen nur nach Einwilligung und ohne Druck (Vorsichtsregel, keine Leitlinie).",
    },
    learn: [
      "Eine Metaanalyse (15 Studien, 17 Versuche) fand: Hypnose senkte Angst mit einer mittleren gewichteten Effektstärke von 0,79 gegenüber Kontrollbedingungen; beim längsten Nachbeobachtungszeitpunkt waren es 0,99. Hypnose wirkte besser, wenn sie mit anderen psychologischen Verfahren kombiniert wurde, als allein. [1]",
      "Hypnotisierbarkeit gilt als stabiles Merkmal: Menschen verändern ihre Wahrnehmung, ihr Gedächtnis und Verhalten durch Suggestion unterschiedlich leicht. [2]",
      "Mentalismus ist Magie: Die Forschung beschreibt, dass Magier Aufmerksamkeit, Gedanken und Gedächtnis lenken. [3]",
      "Aussagen aus Bühnenshows (z. B. „Gedanken lesen“) sind damit nicht als Fähigkeit belegt; die Trickmethoden lassen sich durch Misdirection und Wahrnehmung erklären. [3][4]",
    ],
    evidence: { level: "teilweise", why: "Klinische Hypnose gegen Angst ist in einer Metaanalyse belegt, die Befundlage und Qualität der Einzelstudien variiert; zu Bühnenhypnose und Mentalismus als Lernfähigkeit gibt es keine Studien." },
    steps: [
      "Lesen: eine Einführung in die Psychologie von Magie und Suggestion (Quellen unten).",
      "Mentalismus: mit einfachen, selbstarbeitenden Tricks anfangen und Misdirection üben.",
      "Hypnose: ernsthafte Ausbildung nur bei zertifizierten Fachverbänden; ohne Ausbildung nicht an anderen anwenden.",
    ],
    plan: [
      { title: "Monat 1", text: "Lesen und Videos ansehen; ein bis zwei Tricks einüben." },
      { title: "Danach", text: "Für klinische Hypnose: Ausbildung bei Fachverband klären (Vorschlag)." },
    ],
    myths: [
      { myth: "Hypnose bringt Menschen dazu, gegen ihren Willen zu handeln.", fact: "Ich habe dafür keine geprüfte Quelle; die gelesene Literatur beschreibt Hypnotisierbarkeit als individuelles Merkmal. [2]" },
      { myth: "Mentalisten lesen Gedanken.", fact: "Die Forschung beschreibt Magie als Lenkung von Aufmerksamkeit und Erwartung. [3][4]" },
    ],
    mistakes: ["Bühnenhypnose mit klinischer Hypnose gleichsetzen.", "Hypnose als Ersatz für Therapie anbieten.", "Unbekannte Methoden an Freunden ausprobieren, ohne Einwilligung."],
    safety: ["Hypnose bei psychischen Erkrankungen nur durch ausgebildete Fachleute. (Vorsichtsregel, keine Leitlinie)"],
    conflicts: ["Die Metaanalyse schließt Studien unterschiedlicher Qualität ein; Effektstärken sind mit Vorsicht zu lesen. [1]"],
    videos: [
      { title: "Mentalism, mind reading and the art of getting inside your head | Derren Brown | TED", id: "2IFa0tqHrwE", channel: "TED", why: "Vortrag eines Mentalisten über Suggestion und Wahrnehmung.", checked: true },
      { title: "Master Mentalist Derren Brown on Magic, Mind Reading, and More", id: "I7AJA3o0jkY", channel: "Tim Ferriss", why: "Langes Gespräch mit einem Mentalisten.", checked: true },
    ],
    videoNote: "Nur zwei Videos eingetragen, beide nur nach Titel beurteilt. Anleitungen zu Hypnose habe ich bewusst weggelassen.",
    sources: [
      { title: "Valentine, Milling, Clark & Moriarty 2019, Int J Clin Exp Hypn – The Efficacy of Hypnosis as a Treatment for Anxiety: A Meta-Analysis", url: PM("31251710"), kind: "Metaanalyse" },
      { title: "Cruz-Sanabria et al. 2024, Neuroscience Letters – Hypnotizability-related risky experience and behavior", url: PM("38185203"), kind: "Studie" },
      { title: "Kuhn & Martinez 2011, Frontiers in Human Neuroscience – Misdirection – past, present, and the future", url: PM("22232587"), kind: "Übersichtsarbeit" },
      { title: "Ekroll, Sayim & Wagemans 2017, Perspectives on Psychological Science – The Other Side of Magic", url: PM("28073329"), kind: "Übersichtsarbeit" },
    ],
  },
};

// Fingerfertigkeit (Münzen verschwinden lassen usw.) nutzt dasselbe Dossier wie Münzzauberei.
DOSSIERS_TRICKS["Fingerfertigkeit"] = DOSSIERS_TRICKS["Münzzauberei"];
