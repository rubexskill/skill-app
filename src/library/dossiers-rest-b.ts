import type { Dossier } from "./dossiers";

// Rest, Teil B (Kopf, Menschen, Gewohnheiten). Recherchiert am 23. November 2026.
// Rechenbeispiele wurden nachgerechnet. Anleitungs-Skills ohne Studienlage tragen evidence.level „anleitung“.
const DATE = "23. November 2026";
const PM = (id: string) => `https://pubmed.ncbi.nlm.nih.gov/${id}/`;
const LALLY = { title: "Lally et al. 2010, European Journal of Social Psychology – How are habits formed: Modelling habit formation in the real world", url: "https://doi.org/10.1002/ejsp.674", kind: "Beobachtungsstudie" };

export const DOSSIERS_REST_B: Record<string, Dossier> = {
  "Trachtenberg-System": {
    date: DATE,
    steckbrief: {
      about: "Ein Satz einfacher Rechenregeln für schnelles Kopf- und Schriftrechnen, entwickelt von Jakow Trachtenberg. Das Ergebnis wird Ziffer für Ziffer von rechts nach links gebildet; Einmaleins-Tabellen sind dafür kaum nötig.",
      why: "Mit den Regeln für Multiplikatoren von 2 bis 12 lernst du ein klares Verfahren, das im Kern nur Verdoppeln, Halbieren und Addieren verlangt. Zur Wirksamkeit gibt es in den gelesenen Quellen keine Studie.",
      tips: "Zuerst eine Regel (z. B. mal 11) sicher können, dann die nächste. Auf Papier üben, bis das Halbieren der Nachbarziffer („sieben, drei“) ohne Nachdenken geht. (Vorschlag)",
      safety: "Keine Risiken. Wichtige Rechnungen (Geld, Technik) mit Taschenrechner gegenprüfen. (Vorsichtsregel, keine Leitlinie)",
    },
    learn: [
      "Trachtenberg entwickelte das System laut Lexikon, um seinen Geist als Gefangener in einem deutschen Konzentrationslager zu beschäftigen; es erschien 1960 als „The Trachtenberg Speed System of Basic Mathematics“ (Doubleday). Der englische Wikipedia-Artikel gibt an, dass die meisten seiner Angaben aus dem Originalbuch stammen. Das Buch selbst habe ich nicht gelesen. [1]",
      "Gemeinsame Begriffe: Die „Nachbarziffer“ ist die Ziffer rechts neben der aktuellen; rechts von der letzten Ziffer steht eine Null, links vor der ersten ebenfalls. „Halbieren“ heißt hier: die Hälfte abgerundet; ist die aktuelle Ziffer ungerade, kommt 5 dazu. [1]",
      "Regel für 11: Jede Ziffer wird zu ihrer Nachbarziffer addiert. Beispiel 3425 × 11: (0+3)(3+4)(4+2)(2+5)(5+0) ergibt 37675. Das stimmt, denn 11 = 10 + 1, also 34250 + 3425. [1]",
      "Regel für 12: Von rechts beginnend jede Ziffer verdoppeln und die Nachbarziffer addieren, Übertrag mitnehmen. Beispiel 316 × 12 = 3792. [1]",
      "Regel für 5: Die Hälfte der Nachbarziffer nehmen, bei ungerader aktueller Ziffer 5 addieren. Beispiel 93 × 5 = 465. Regel für 6: zu jeder Ziffer die Hälfte der Nachbarziffer addieren, bei ungerader Ziffer plus 5. Beispiel 357 × 6 = 2142. [1]",
      "Regel für 7: Jede Ziffer verdoppeln, die Hälfte der Nachbarziffer addieren, bei ungerader Ziffer plus 5, Übertrag dazu. Beispiel 693 × 7 = 4851. [1]",
      "Regeln für 3, 4, 8, 9: Die letzte Ziffer von 10 abziehen, alle übrigen von 9; danach je nach Faktor verdoppeln (3 und 8) bzw. Nachbarziffer addieren (8, 9). Beispiel 456 × 8 = 3648 und 2130 × 9 = 19170. [1]",
      "Für allgemeine Multiplikation (z. B. 123456 × 789) beschreibt der Artikel die „direkte Methode“: Jede Ergebnisziffer wird aus Ziffernpaaren gebildet, von denen nur Einer- und Zehnerstelle des Produkts zählen. Erste Stelle im Beispiel: Einer von 9 × 6 = 54, also 4. Zweite Stelle: 5 + 5 + 8 = 18, also 8 Übertrag 1. [1]",
      "Zur Rechenrichtung: Der deutsche Wikipedia-Artikel „Kopfrechnen“ nennt das Rechnen von links nach rechts und von rechts nach links als umstrittene Frage; Trachtenbergs Verfahren arbeitet von rechts und eignet sich daher eher für Papier als für das Aussprechen eines Ergebnisses im Kopf. [2]",
    ],
    evidence: { level: "anleitung", why: "Die Regeln stammen aus Trachtenbergs Lehrbuch und sind über einen Lexikonartikel belegt; Studien zur Lernwirkung habe ich nicht gefunden." },
    steps: [
      "Zahl mit einer führenden Null vorn aufschreiben und rechts als Nachbarziffer der letzten Ziffer eine Null denken (z. B. 0316). [1]",
      "Mit Regel für 11 beginnen: Ziffer plus rechte Nachbarziffer, von rechts nach links. Übung: 3425 × 11 = 37675. [1]",
      "Regel für 12 ergänzen: verdoppeln plus Nachbarziffer, Übertrag mitnehmen. Übung: 316 × 12 = 3792. [1]",
      "Regel für 5 und 6: halbieren (abgerundet) und bei ungerader Ziffer 5 dazu. Übung: 93 × 5 = 465, 357 × 6 = 2142. [1]",
      "Regel für 7: verdoppeln, halbe Nachbarziffer, bei ungerader Ziffer 5, Übertrag. Übung: 693 × 7 = 4851. [1]",
      "Regeln für 3, 4, 8, 9: erste Ziffer von 10, übrige von 9 abziehen, dann je Regel verdoppeln bzw. Nachbarziffer addieren; führende Null mit der Sonderregel abschließen. Übung: 456 × 8 = 3648. [1]",
      "Jede Rechnung mit einer zweiten Methode gegenprüfen (z. B. Überschlag). (Vorschlag)",
      "Danach die direkte Methode für zwei- und mehrstellige Multiplikatoren üben, zuerst nur mit Stift. [1]",
    ],
    plan: [
      { title: "Woche 1", text: "Regeln für 11 und 12, je 10 Aufgaben täglich auf Papier. (Vorschlag)" },
      { title: "Woche 2", text: "Regeln für 5, 6, 7 dazunehmen; gemischte Aufgaben, jeweils mit Taschenrechner kontrollieren. (Vorschlag)" },
      { title: "Woche 3", text: "Regeln für 3, 4, 8, 9, danach Zufallsmultiplikator von 2 bis 12. (Vorschlag)" },
      { title: "Woche 4", text: "Direkte Methode mit zweistelligem Multiplikator, später im Kopf nur Ergebnisziffern aufschreiben. (Vorschlag)" },
    ],
    myths: [
      { myth: "Das System macht jeden zum Kopfrechenkünstler.", fact: "Wirksamkeitsstudien habe ich nicht gefunden; die Regeln sind Rechenhilfen, die geübt werden müssen. [1]" },
    ],
    mistakes: [
      "Die führende Null und die Nachbarziffer rechts vergessen. [1]",
      "Bei ungerader Ziffer die 5 nicht addieren. [1]",
      "Zu früh im Kopf rechnen, statt die Regeln mit Papier zu festigen. (Vorschlag)",
    ],
    safety: [],
    conflicts: [
      "Der englische Artikel trägt Hinweise, dass er zu wenige Belege enthält; die Regeln habe ich deshalb alle selbst nachgerechnet (9 Beispiele stimmen). [1]",
      "Ob Rechnen von rechts nach links im Kopf sinnvoll ist, ist umstritten; manche Autoren bevorzugen links nach rechts. [2]",
    ],
    videos: [
      { title: "Trachtenberg System - Multiply by 11 Method (Be Faster than a Calculator!)", id: "XAcwPJq6dPM", channel: "Trachtenberg System", why: "Regel für 11 Schritt für Schritt.", checked: true },
      { title: "Trachtenberg System - Multiply by 12 Method (Be Faster than a Calculator!)", id: "pJ9MpONJkLM", channel: "Trachtenberg System", why: "Regel für 12.", checked: true },
      { title: "Trachtenberg Speed Math - Direct Multiplication - 2 Digit Multipliers", id: "fwbFXMMp9_k", channel: "Anthony Branson", why: "Direkte Methode für zweistellige Multiplikatoren.", checked: true },
    ],
    videoNote: "Inhalt der Videos nur nach Titel und Kanal beurteilt, nicht angesehen.",
    sources: [
      { title: "Wikipedia – Trachtenberg system (nennt das Originalbuch von 1960 als Hauptquelle)", url: "https://en.wikipedia.org/wiki/Trachtenberg_system", kind: "Lexikon" },
      { title: "Wikipedia – Kopfrechnen (Rechenrichtung, Methoden)", url: "https://de.wikipedia.org/wiki/Kopfrechnen", kind: "Lexikon" },
    ],
  },

  "Große Zahlen multiplizieren": {
    date: DATE,
    steckbrief: {
      about: "Mehrstellige Zahlen im Kopf multiplizieren, indem du sie in leichte Teile zerlegst, von links nach rechts rechnest und Zwischenergebnisse knapp hältst.",
      why: "Kopfrechnen ist eine erlernbare Fertigkeit, keine Gabe. Die Methoden (Zerlegen, Kreuzmultiplikation, Quadrieren über 50) sind Standardwissen der Rechenlehre.",
      tips: "Mit zweistelligen Zahlen anfangen und die Zerlegung laut sprechen. Zwischenergebnisse auf eine Zahl verdichten. (Vorschlag)",
      safety: "Keine Risiken. Bei Geld- oder Technikrechnungen mit Taschenrechner kontrollieren. (Vorsichtsregel, keine Leitlinie)",
    },
    learn: [
      "Der deutsche Lexikonartikel „Kopfrechnen“ nennt als Ziele der Methoden: schwierige Aufgaben in einfache Schritte zerlegen, das Gedächtnis wenig belasten und früh eine Näherung erhalten. Die meisten Menschen könnten sich kaum mehr als etwa 7 Ziffern auf Anhieb merken. [1]",
      "Rechenrichtung: Benjamin und Shermer empfehlen von links nach rechts; Mittring hält das für fehleranfälliger. Die Frage gilt als umstritten. [1]",
      "Additionsmethode: einen Faktor in Zehner und Einer spalten. Beispiel 18 × 32: 18 × 30 = 540, plus 18 × 2 = 36, ergibt 576. Subtraktionsmethode bei Endziffern 8 oder 9: 18 × 39 = 18 × 40 − 18 = 702. [1]",
      "Kreuzmultiplikation (Ferrol): Zehner mal Zehner, plus Kreuzterm, plus Einer mal Einer. Beispiel 18 × 32: Kreuzterm (1×2 + 8×3) × 10 = 260, plus 1×3 × 100 = 300, plus 8×2 = 16, insgesamt 576. [1]",
      "Sonderfälle: Gleiche Einer und Zehner, die sich zu 10 ergänzen: 32 × 72 = 21 × 100 + 200 + 4 = 2304. Gleiche Zehner und Einer, die sich zu 10 ergänzen: 43 × 47 = 16 × 100 + 400 + 21 = 2021. [1]",
      "Quadrieren zwischen 30 und 70: a² = (25 + a₀) × 100 + a₀², wobei a₀ der Abstand zu 50 ist. 58² = 33 × 100 + 64 = 3364; 37² = (25 − 13) × 100 + 169 = 1369. [1]",
      "Dreistellig: nach dem gleichen Prinzip in Teile zerlegen. Eigenes Rechenbeispiel (Vorschlag): 347 × 26 = 300 × 26 + 40 × 26 + 7 × 26 = 7800 + 1040 + 182 = 9022.",
    ],
    evidence: { level: "anleitung", why: "Die Methoden sind Standardwissen aus der Rechenlehre (Lexikon, Fachbücher); Studien zur Lernwirkung wurden nicht gelesen." },
    steps: [
      "Das kleine Einmaleins sicher beherrschen; Zahlen bis 20 und 25 × 4 sollten sofort kommen. [1]",
      "Einen Faktor in Zehner und Einer zerlegen (Additionsmethode): 18 × 32 = 18 × 30 + 18 × 2. [1]",
      "Von links nach rechts rechnen und die Zwischensumme laut mitsprechen: 540, dann 576. [1]",
      "Bei Endziffern 8 oder 9 auf die runde Zahl hinrechnen und abziehen: 18 × 39 = 18 × 40 − 18. [1]",
      "Kreuzmultiplikation lernen: Zehner × Zehner, Kreuzterm, Einer × Einer. [1]",
      "Sonderfälle erkennen: gleiche Zehner mit Einern 10, gleiche Einer mit Zehnern 10. [1]",
      "Quadrate von 30 bis 70 über 50 ± a₀ berechnen. [1]",
      "Dreistellige Zahlen in drei Teile zerlegen und die Teilprodukte schrittweise aufsummieren. (Vorschlag)",
    ],
    plan: [
      { title: "Woche 1", text: "10 Aufgaben täglich: zweistellig × einstellig, laut zerlegen. (Vorschlag)" },
      { title: "Woche 2", text: "Zweistellig × zweistellig mit Additionsmethode; Ergebnis mit Taschenrechner prüfen. (Vorschlag)" },
      { title: "Woche 3", text: "Kreuzmultiplikation und Quadrieren. (Vorschlag)" },
      { title: "Woche 4", text: "Dreistellig × zweistellig; Zeit stoppen. (Vorschlag)" },
    ],
    myths: [
      { myth: "Wer im Kopf multipliziert, hat ein besonderes Talent.", fact: "Der Lexikonartikel beschreibt Kopfrechnen als trainierbare Fähigkeit, die auf Methoden beruht; besonders schnelle Rechner sind selten. [1]" },
    ],
    mistakes: [
      "Zwischenergebnisse zu lange im Kopf halten, statt sie sofort zu summieren. [1]",
      "Mit den schweren Ziffern 7, 8, 9 rechnen, wo ein Weg über 10 oder 50 möglich wäre. [1]",
    ],
    safety: [],
    conflicts: ["Ob von links oder von rechts gerechnet werden sollte, wird von den Autoren unterschiedlich beurteilt. [1]"],
    videos: [
      { title: "Quick: What's 78,269 x 78,269? | World Science Festival", id: "P_hiwmFzefo", channel: "World Science Festival", why: "Quadrieren im Kopf durch Arthur Benjamin.", checked: true },
      { title: "Mental Math | World Science Festival", id: "CP2i5btnUpY", channel: "World Science Festival", why: "Rechnen von links nach rechts, laut Beschreibung.", checked: true },
      { title: "Magical Squaring | Mathematical Association of America", id: "_FoONg5Meyc", channel: "Mathematical Association of America", why: "Quadrieren im Kopf.", checked: true },
    ],
    videoNote: "Inhalt der Videos nur nach Titel und Kanal beurteilt, nicht angesehen.",
    sources: [
      { title: "Wikipedia – Kopfrechnen (Additions-, Kreuz-, Quadriermethode mit Beispielen)", url: "https://de.wikipedia.org/wiki/Kopfrechnen", kind: "Lexikon" },
    ],
  },

  "Klarer sprechen": {
    date: DATE,
    steckbrief: {
      about: "Deutlicher, in sinnvollen Einheiten und mit weniger Füllwörtern sprechen: bewusst artikulieren, das Tempo anpassen, Pausen setzen und sich selbst aufnehmen.",
      why: "In Studien zur „klaren Sprechweise“ sprachen Personen langsamer, mit größerem Tonhöhenumfang und deutlicheren Vokalen, und diese Sprechweise war besser verständlich als normales Gesprächstempo. Die Übungen stammen aus Hochschul- und Verbandsratgebern.",
      tips: "Eine Minute aufnehmen, anhören, eine Gewohnheit herausgreifen (Tempo, Füllwörter, Nuscheln) und nur diese üben. (Vorschlag, nach [1] und [2])",
      safety: "Bei anhaltender Heiserkeit, Stottern oder deutlichen Artikulationsproblemen eine logopädische Abklärung suchen. (Vorsichtsregel, keine Leitlinie)",
    },
    learn: [
      "Das Biologie-Ingenieurwesen-Kommunikationslabor am MIT nennt als Kriterien: Die Wörter sind klar und verständlich, und Stimmelemente wie Tonfall, Betonung, Tempo und Pausen halten die Zuhörer bei der Sache. Artikulation und Tempo hängen zusammen: Schwierige Wörter lassen sich langsam leichter sagen. [1]",
      "Das Tempo lässt sich schlecht selbst beurteilen; der Leitfaden rät, mit anderen zu üben oder sich aufzunehmen, und zum Anhören der Aufnahme ohne Bild, um störende Gewohnheiten zu erkennen. [1]",
      "Toastmasters beschreibt Füllwörter („ähm“) als natürliche Disfluenz: Als vorsichtige Schätzung gelten sechs Wörter auf 100. Empfohlen wird, verbale Pausen durch Stille zu ersetzen, täglich mindestens fünf Minuten Aufnahme zu prüfen (14 Tage lang), mehr zu gestikulieren und kürzere Sätze zu bilden. [2]",
      "Forschung zur „Clear Speech“: Smiljanić und Bradlow fanden bei Englisch und Kroatisch, dass absichtlich klare Sprache langsamer ist, einen größeren Tonhöhenumfang hat und die Vokale deutlicher trennt; sie ist besser verständlich als Alltagssprechweise. Das beschreibt Wirkung beim Hörer, keinen Trainingsplan. [3][4]",
    ],
    evidence: { level: "anleitung", why: "Die Übungen stammen aus Ratgebern einer Hochschule und eines Rednerverbands; Studien belegen die Wirkung der klaren Sprechweise auf die Verständlichkeit, nicht den Nutzen eines bestimmten Trainings." },
    steps: [
      "Eine Minute freies Sprechen aufnehmen und ohne Bild anhören; Gewohnheiten notieren (Tempo, Füllwörter, Nuscheln). [1]",
      "Tempo senken: einen Text bewusst langsamer als gewohnt laut lesen. [1]",
      "Schwierige Wörter einzeln üben; einen schwierigen Satz mehrfach sagen und dabei jedes Mal ein anderes Wort betonen. [1]",
      "Füllwörter durch eine kurze Stille ersetzen. [2]",
      "Sätze kürzer bauen, mehr schreiben fürs Hören als fürs Lesen. [2]",
      "Beim Sprechen die Hände mitbewegen, auch am Telefon. [2]",
      "Mit einer Person üben, die Rückmeldung zu Lautstärke und Tempo gibt. [1]",
      "Täglich mindestens fünf Minuten Aufnahme prüfen, 14 Tage lang. [2]",
    ],
    plan: [
      { title: "Woche 1", text: "Täglich 1 Minute aufnehmen und anhören, nur beobachten. [2]" },
      { title: "Woche 2", text: "Täglich Tempo-Übung mit lautem Lesen, Zielwert nach Gefühl. (Vorschlag)" },
      { title: "Woche 3", text: "Füllwörter durch Pausen ersetzen, in Gesprächen mit Freunden. (Vorschlag)" },
      { title: "Woche 4", text: "Kurzer Vortrag (2 Minuten) mit Aufnahme und Selbstfeedback. (Vorschlag)" },
    ],
    myths: [
      { myth: "Gute Redner sprechen ohne jedes „ähm“.", fact: "Toastmasters beschreibt gelegentliche Disfluenzen als normal; Ziel ist eine Verringerung, nicht die vollständige Beseitigung. [2]" },
    ],
    mistakes: [
      "Zu schnell sprechen, wenn man nervös ist. [2]",
      "Nur an der Aussprache üben und das Tempo ignorieren. [1]",
      "Zu lange, verschachtelte Sätze planen. [2]",
    ],
    safety: ["Anhaltende Heiserkeit oder Schmerzen beim Sprechen ärztlich abklären lassen. (Vorsichtsregel, keine Leitlinie)"],
    conflicts: [
      "Eine Ratgeberquelle empfiehlt, Füllwörter zu vermeiden; Toastmasters nennt Forschung, nach der gelegentliche Disfluenzen Aufmerksamkeit und Erinnerung sogar verbessern können. [2]",
    ],
    videos: [
      { title: "3 Pacing Exercises for Clearer Speech", id: "7QKeWojjcME", channel: "Speech Secrets", why: "Tempo-Übungen.", checked: true },
      { title: "Speak More Clearly: Syllable Workout for Articulation", id: "LdGw_Pgw5eI", channel: "Speech Secrets", why: "Artikulationsübung.", checked: true },
      { title: "Clear Speech Strategies", id: "Pxt6m1Sjz_c", channel: "Adult Speech Therapy", why: "Strategien der klaren Sprechweise aus der Sprachtherapie.", checked: true },
    ],
    videoNote: "Inhalt der Videos nur nach Titel und Kanal beurteilt, nicht angesehen; englischsprachig.",
    sources: [
      { title: "MIT Biological Engineering Communication Lab – Public Speaking: Verbal", url: "https://mitcommlab.mit.edu/be/commkit/public-speaking-verbal", kind: "Hochschul-Leitfaden" },
      { title: "Marshall 2017, Toastmasters Magazine – Um, How Do I Stop, Ya Know, Using Um and Ah?", url: "https://toastmasters.org/magazine/magazine-issues/2017/september-2017/umah", kind: "Verbandsartikel" },
      { title: "Smiljanić & Bradlow 2009, Language and Linguistics Compass – Speaking and Hearing Clearly: Talker and Listener Factors in Speaking Style Changes", url: PM("20046964"), kind: "Übersichtsarbeit" },
      { title: "Smiljanić & Bradlow 2005, Journal of the Acoustical Society of America – Production and perception of clear speech in Croatian and English", url: PM("16240826"), kind: "Studie" },
    ],
  },

  "Verbales Aikido": {
    date: DATE,
    steckbrief: {
      about: "Auf einen verbalen Angriff nicht mit Gegenangriff, Flucht oder Erstarren reagieren, sondern ruhig bleiben, auf das Gegenüber eingehen und das Gespräch in Richtung Gemeinsames lenken.",
      why: "Die Methode ist ein Ansatz aus der Praxis (nach dem Kampfsport Aikido), kein geprüftes Trainingsprogramm. Für die verwandte Deeskalation in Kliniken liegen Studien vor, die ich hier nicht ausgewertet habe.",
      tips: "Erst atmen, dann nachfragen („Erzähl mir mehr“), statt zu verteidigen. Im Rollenspiel mit Freunden üben. [1]",
      safety: "Bei Drohung, Gewalt oder Stalking Abstand nehmen und Hilfe holen. Die Methode ersetzt keinen Schutz. (Vorsichtsregel, keine Leitlinie)",
    },
    learn: [
      "Verbale Selbstverteidigung bzw. verbales Aikido beschreibt der englische Lexikonartikel als die Kunst, mit Worten einen Angriff zu verhindern, zu entschärfen oder zu beenden. Er ist zu Belegen mit Vorbehalt markiert; die Fachleute definieren das Feld unterschiedlich. [2]",
      "Verbales Aikido ist laut Artikel an die Philosophie des Aikido angelehnt: Das Gegenüber wird als Partner, nicht als Gegner behandelt. Eine verbreitete Lehre (Luke Archer) fasst es in drei Schritten: den Angriff mit „innerem Lächeln“ aufnehmen, den Angreifer begleiten, bis er aus dem Gleichgewicht kommt, und dann einen Ausgleich vorschlagen. [2]",
      "Ein Beitrag im Magazin des Personalverbands SHRM beschreibt Aikido als „Harmonisieren von Energie“ im Gegensatz zu Kampfsportarten, die Angriffe blocken. Verbales Aikido sei weniger eine Technik als eine Haltung: ruhig und zentriert bleiben und Gemeinsamkeiten suchen. [1]",
      "Beispiele aus dem Beitrag: Auf „HR ist das Letzte!“ antwortet man mit „Ach ja? Erzähl mir mehr.“ Auf „Das ist die dümmste Idee, die ich je gehört habe!“ mit „Oh, wirklich? Und was ist die zweitdümmste?“. Das zweite Beispiel setzt Humor voraus und passt nicht in jede Lage. [1]",
      "Zum Üben empfiehlt der Beitrag: Material über Aikido lesen, ein paar Aikido-Stunden nehmen, um ein Körpergefühl zu bekommen, und Rollenspiele mit Kollegen, bei denen man abwechselnd den wütenden Angreifer spielt. [1]",
    ],
    evidence: { level: "anleitung", why: "Die Methode beruht auf Erfahrungsberichten und Praxisbüchern; ein Wirksamkeitsnachweis für verbales Aikido selbst wurde nicht gelesen." },
    steps: [
      "Atmen und bewusst nicht sofort antworten. [1]",
      "Den Angriff aufnehmen, ohne ihn persönlich zu nehmen („inneres Lächeln“). [2]",
      "Eine offene Rückfrage stellen: „Erzähl mir mehr.“ [1]",
      "Zuhören, wiederholen, was du gehört hast, dann nach dem Anliegen hinter dem Vorwurf fragen. (Vorschlag)",
      "Gemeinsamkeit benennen und einen Ausgleich vorschlagen. [2]",
      "Zum Abschluss ein konkretes nächstes Vorgehen vereinbaren. (Vorschlag)",
      "Im Rollenspiel mit einer Person üben, die abwechselnd den Angreifer spielt. [1]",
    ],
    plan: [
      { title: "Woche 1", text: "Nur den ersten Schritt üben: bei Provokation einmal atmen und eine Rückfrage stellen. (Vorschlag)" },
      { title: "Woche 2", text: "Rollenspiel mit einer vertrauten Person, 10 Minuten. [1]" },
      { title: "Woche 3–4", text: "In kleinen echten Situationen anwenden und danach kurz notieren, was funktionierte. (Vorschlag)" },
    ],
    myths: [
      { myth: "Verbales Aikido heißt, dem Angreifer nachzugeben.", fact: "Beschrieben wird ein ruhiges Mitgehen mit dem Ziel eines Ausgleichs; das Gegenüber soll sein Gesicht wahren können. [2]" },
    ],
    mistakes: [
      "Humorvolle Konter in ernsten oder gefährlichen Lagen benutzen. (Einordnung)",
      "Techniken auswendig anwenden, ohne ruhig zu bleiben; der Beitrag nennt es eine Haltung, keine Technikliste. [1]",
    ],
    safety: ["Bei körperlicher Bedrohung zählt Abstand, nicht Gespräch. (Vorsichtsregel, keine Leitlinie)"],
    conflicts: [
      "Experten sind uneins, ob verbale Selbstverteidigung Überzeugen einschließen soll oder nur dem eigenen Schutz dient. [2]",
      "Es gibt mehrere Lehrsysteme (z. B. Elgin „The Gentle Art of Verbal Self-Defense“, Archer „Verbal Aikido“); ich habe nur die Beschreibung bei Archer über [2] gelesen.",
    ],
    videos: [
      { title: "Verbal Aikido for Youth – Manage Verbal Attacks Peacefully and Effectively", id: "dSGZj8Cwv_w", channel: "Texas Conflict Coach", why: "Einführung in verbale Angriffe und den Umgang damit.", checked: true },
      { title: "Verbal Aikido : L’art de transformer les tensions en relations", id: "9xgWewfITsw", channel: "Verbal Aikido", why: "Vorstellung der Methode (Französisch).", checked: true },
    ],
    videoNote: "Zwei Videos; Inhalt nur nach Titel und Kanal beurteilt, nicht angesehen.",
    sources: [
      { title: "SHRM 2020 – Verbal Aikido Takes the Fight Out of Confrontations", url: "https://www.shrm.org/topics-tools/news/employee-relations/verbal-aikido-takes-fight-confrontations", kind: "Verbandsartikel" },
      { title: "Wikipedia – Verbal self-defense", url: "https://en.wikipedia.org/wiki/Verbal_self-defense", kind: "Lexikon" },
    ],
  },

  "Benjamin-Franklin-Effekt": {
    date: DATE,
    steckbrief: {
      about: "Wer jemandem einen Gefallen tut, mag diese Person danach eher mehr. Benannt nach einer Anekdote aus Franklins Autobiografie; erklärt wird es mit kognitiver Dissonanz.",
      why: "Ein klassischer Laborversuch (Jecker & Landy 1969) und ein neuerer (Niiya 2016) fanden Zunahme der Sympathie nach einer Gefälligkeit bzw. einer Bitte. Die Gefälligkeit muss direkt erbeten werden.",
      tips: "Bitte um kleine, leicht erfüllbare Hilfen (Buch leihen, Rat fragen) statt Gefälligkeiten anzubieten. Nicht als Trick benutzen. (Vorschlag)",
      safety: "Keine Risiken. Bitten nicht erzwingen und nicht ausnutzen; das Ziel ist Beziehung, nicht Manipulation. (Vorsichtsregel, keine Leitlinie)",
    },
    learn: [
      "Laut Lexikon schildert Franklin in seiner Autobiografie, wie ein Rivale im Parlament ihn freundlich behandelte, nachdem Franklin ihn um die Ausleihe eines seltenen Buchs gebeten hatte. [1]",
      "Jecker & Landy (1969, Human Relations, „Liking a Person as a Function of Doing Him a Favour“): Im Lexikonartikel beschrieben als Versuch, in dem Studierende nach einem Wettbewerb gebeten wurden, ihr Preisgeld zurückzugeben. Wer vom Versuchsleiter direkt gebeten wurde, mochte ihn am meisten; wer über eine Sekretärin gebeten wurde, am wenigsten. Das Original (Abstract) war nicht lesbar; die Beschreibung stammt aus [1]. [2]",
      "Niiya (2016, Journal of Social Psychology): In einem Experiment mit japanischen und US-amerikanischen Teilnehmenden stieg die Sympathie für eine eingeweihte Mitarbeiterin des Versuchs („Confederate“), die um Hilfe gebeten hatte, gegenüber der Ausgangslage; auch Eindruck und gefühlte Nähe nahmen zu. Wer ohne direkte Bitte half, mochte sie nicht mehr. [3]",
      "Erklärungen: kognitive Dissonanz (man rechtfertigt die Hilfe, indem man sich sagt, man müsse die Person mögen) nach [1]; Niiya deutet die Bitte als Beziehungsangebot (Amae), das die Gegenseite erwidere. [1][3]",
    ],
    evidence: { level: "teilweise", why: "Zwei Laborexperimente (1969, 2016) stützen den Effekt, aber nur der zweite konnte hier im Abstract gelesen werden; eine breite Replikationslage habe ich nicht gefunden." },
    steps: [
      "Eine kleine, konkrete Bitte formulieren, die leicht zu erfüllen ist (Buch leihen, kurzen Rat fragen). [1]",
      "Die Bitte direkt selbst stellen, nicht über Dritte. [2][3]",
      "Nach der Hilfe ausdrücklich und ehrlich danken. [1]",
      "Die Hilfe später erwidern, damit es kein Einbahnstraßenverhältnis wird. (Vorschlag)",
      "Nicht zu oft und nicht zu große Bitten stellen. (Vorschlag)",
    ],
    plan: [
      { title: "Woche 1", text: "Einmal eine kleine Bitte an eine wohlgesinnte Person richten und das Ergebnis notieren. (Vorschlag)" },
      { title: "Woche 2–4", text: "Bei einer lockeren Bekanntschaft eine Bitte stellen und den Kontakt danach beobachten. (Vorschlag)" },
    ],
    myths: [
      { myth: "Jede Gefälligkeit macht Menschen sympathischer.", fact: "In Niiyas Experiment stieg die Sympathie nicht, wenn die Person ohne direkte Bitte half; bei Jecker & Landy sank sie, wenn die Bitte über eine Mittelsperson kam. [2][3]" },
    ],
    mistakes: [
      "Die Bitte als Trick einsetzen und dabei zu viel verlangen. (Vorschlag)",
      "Über Dritte bitten lassen. [2]",
    ],
    safety: [],
    conflicts: [
      "Niiya erklärt den Effekt anders (Bitte als Beziehungsangebot) als die Dissonanztheorie. [1][3]",
      "Die Replikationslage ist offen: Ich fand nur einen kleineren neueren Versuch, der Ergebnisse stützt. [3]",
    ],
    videos: [
      { title: "Ben Franklin Effect: Can You Do Me A Favor? -- Cognitive Biases Series", id: "-vwJepq92eU", channel: "Academy 4 Social Civics", why: "Erklärung des Effekts.", checked: true },
      { title: "The Franklin Effect", id: "Kazvj9yo9io", channel: "Samo Burja", why: "Kurze Darstellung.", checked: true },
    ],
    videoNote: "Zwei Videos; Inhalt nur nach Titel und Kanal beurteilt, nicht angesehen.",
    sources: [
      { title: "Wikipedia – Benjamin Franklin effect", url: "https://en.wikipedia.org/wiki/Ben_Franklin_effect", kind: "Lexikon" },
      { title: "Jecker & Landy 1969, Human Relations – Liking a Person as a Function of Doing Him a Favour (Abstract nicht gelesen; Inhalt nach [1])", url: "https://doi.org/10.1177/001872676902200407", kind: "Studie" },
      { title: "Niiya 2016, Journal of Social Psychology – Does a Favor Request Increase Liking Toward the Requester?", url: PM("26392141"), kind: "Studie" },
    ],
  },

  "Lexical Priming": {
    date: DATE,
    steckbrief: {
      about: "Eine Sprachtheorie von Michael Hoey: Wörter werden durch Erfahrung „geprimt“, also zusammen mit typischen Nachbarwörtern, grammatischen Umgebungen und Textstellen gespeichert. Daraus folgt: Wörter lernt man am besten im Gebrauch, nicht einzeln.",
      why: "Die Theorie erklärt, warum Muttersprachler „natürlich“ klingen (typische Kombinationen). Sie stützt sich auf Korpusdaten; wie stark sie psychologisch belegt ist, bleibt umstritten.",
      tips: "Neue Wörter immer mit typischen Nachbarwörtern und einem echten Beispielsatz notieren (Kollokationen). (Vorschlag, nach [1][2])",
      safety: "Keine Risiken.",
    },
    learn: [
      "Hoey (Routledge 2005, „Lexical Priming: A New Theory of Words and Language“) argumentiert, dass Wörter nicht auf Wörterbuchdefinitionen beschränkt sind, sondern in üblichen Mustern mit anderen Wörtern auftreten; alles, was man über ein Wort weiß, sei Ergebnis der Begegnungen mit ihm. Belegt wird das mit statistischen Daten aus einem Zeitungskorpus. [1]",
      "Nach einer Rezension umfasst Priming Kollokationen (erwartete Wortverbindungen), Kolligationen (grammatische Umgebungen) und Positionen im Text. Beispiel: „in winter“ geht eher mit Präsens, „in the winter“ mit Vergangenheit. [2]",
      "Die Rezension nennt als Folgerung für das Lernen: möglichst oft authentische Sprache hören und lesen, um eine „mentale Konkordanz“ aufzubauen. Hoey selbst nennt die Frage der Korpuswahl schwierig. [2]",
      "Kritik: Intuition spielt bei der Deutung von Priming eine große Rolle, und die Zuordnung hängt von Erfahrung und Situation ab; die psychologische Plausibilität ist damit fraglich. [2]",
      "Eine Studie von 2022 nutzt die Theorie, um englische und chinesische Wortverbindungen zu vergleichen, und hält sie für geeignet, Gemeinsamkeiten und Unterschiede zu beschreiben. [3]",
    ],
    evidence: { level: "kaum", why: "Eine Korpustheorie mit mehreren Anwendungsstudien; Lernstudien, die belegen, dass das Üben nach Priming-Prinzipien besser wirkt, habe ich nicht gefunden." },
    steps: [
      "Neues Wort nie allein lernen, sondern mit drei typischen Nachbarwörtern notieren. [2]",
      "Einen authentischen Beispielsatz aus einem echten Text oder Korpus dazuschreiben. [2]",
      "Die grammatische Umgebung notieren (Präposition, Zeitform, Satzstelle). [2]",
      "Synonyme getrennt lernen: Sie unterscheiden sich in ihren Verbindungen. [2]",
      "Viel authentische Sprache lesen und hören. [2]",
      "Eine Sammlung typischer Verbindungen (Kollokationen) wöchentlich wiederholen. (Vorschlag)",
    ],
    plan: [
      { title: "Woche 1", text: "10 neue Wörter pro Woche mit Nachbarwörtern und Satz notieren. (Vorschlag)" },
      { title: "Woche 2–4", text: "Je ein Text pro Tag lesen und typische Wortverbindungen markieren. (Vorschlag)" },
    ],
    myths: [
      { myth: "Wörter lernt man am besten als Einzelvokabeln.", fact: "Nach Hoey sind Wörter durch ihre üblichen Kontexte geprägt; die Rezension rät zu Lernen im Gebrauch. [1][2]" },
    ],
    mistakes: [
      "Synonyme für austauschbar halten. [2]",
      "Aus einem Korpus Regeln ableiten, ohne dessen Auswahl zu prüfen. [2]",
    ],
    safety: [],
    conflicts: [
      "Die psychologische Plausibilität der Theorie ist umstritten; Rezensenten sehen den Einfluss der Intuition bei der Deutung kritisch. [2]",
      "Rezensionen sind überwiegend positiv, aber die Theorie bleibt nach Hoey selbst in vielen Bereichen (z. B. Spracherwerb von Kindern) offen. [2]",
    ],
    videos: [
      { title: "Prof. Michael Hoey - IATEFL 2014 Harrogate", id: "Wlp5TPjc0xM", channel: "Sebastian Lesniewski", why: "Vortrag von Hoey (Wiederveröffentlichung).", checked: true },
      { title: "Michael Hoey & Matthew O'Donnell @ IATEFL 2008, part 1", id: "hvygeRXpNnA", channel: "Macmillan Education ELT", why: "Gespräch zur Korpuslinguistik im Unterricht.", checked: true },
    ],
    videoNote: "Zwei Videos; Inhalt nur nach Titel und Kanal beurteilt, nicht angesehen.",
    sources: [
      { title: "Routledge – Lexical Priming: A New Theory of Words and Language (Hoey 2005)", url: "https://www.routledge.com/Lexical-Priming-A-New-Theory-of-Words-and-Language/Hoey/p/book/9780415328630", kind: "Verlagsseite" },
      { title: "Khamkhien 2015, Electronic Journal of Foreign Language Teaching – Review of „Lexical Priming“", url: "https://e-flt.nus.edu.sg/wp-content/uploads/2020/09/v12n12015/rev_khamkhien.pdf", kind: "Rezension" },
      { title: "Wang 2022, Frontiers in Psychology – Contrasting the primings between English and Chinese", url: "https://doi.org/10.3389/fpsyg.2022.893120", kind: "Fachartikel" },
    ],
  },

  "Karten zählen": {
    date: DATE,
    steckbrief: {
      about: "Beim Blackjack mit einer einfachen Punktwertung (z. B. Hi-Lo) mitzählen, ob noch viele hohe oder niedrige Karten im Stapel sind. Das ist eine Gedächtnis- und Rechenübung, keine Gewinngarantie.",
      why: "Hi-Lo gilt als einfaches System der Stufe 1: Karten von 2 bis 6 zählen +1, 7 bis 9 zählen 0, Zehner, Bilder und Asse zählen −1. Das Training schult Aufmerksamkeit und Kopfrechnen; zum Spielen in Spielbanken siehe die Hinweise zu Recht und Glücksspielrisiko.",
      tips: "Erst mit einem einzelnen Stapel zu Hause üben; ein vollständiger Stapel muss bei Hi-Lo wieder bei 0 enden. Dann Zweierpäckchen zählen (zwei Karten gemeinsam). (Vorschlag)",
      safety: "Glücksspiel kann süchtig machen und Geld kosten. Üben mit Spielkarten ohne Einsatz. Hilfe bei Glücksspielproblemen: „Check dein Spiel“ des Bundesinstituts für Öffentliche Gesundheit (früher BZgA).",
    },
    learn: [
      "Kartenzählen weist jeder Karte einen Punktwert zu und führt eine laufende Summe („Running Count“). Niedrige Karten erhöhen den Count, weil dann mehr hohe Karten im Stapel verbleiben; hohe Karten senken ihn. [1]",
      "Hi-Lo: 2 bis 6 = +1, 7 bis 9 = 0, 10, Bube, Dame, König, Ass = −1. Es ist ein ausgeglichenes System der Stufe 1: Die Summe ändert sich pro Karte höchstens um 1. [1]",
      "Nachgerechnet: Ein Stapel mit 52 Karten hat 20 Karten mit +1 (2 bis 6, je 4), 20 mit −1 (10 bis Ass, je 4) und 12 mit 0; die Summe ist 0. Beispiel: 5, K, 3, 9, 2 ergibt +1 −1 +1 +0 +1 = +2. [1]",
      "Bei mehreren Stapeln rechnet man den Running Count in einen „True Count“ um, indem man ihn durch die Zahl der noch nicht ausgeteilten Stapel teilt (oder näherungsweise abschätzt). Beispiel: Running Count 6 bei zwei verbleibenden Stapeln ergibt True Count 3. [1]",
      "Höhere Systeme erfordern mehr Aufmerksamkeit und können Tempo und Genauigkeit verschlechtern; manche Zähler verdienen mehr mit einem einfachen System, das sie schnell spielen. [1]",
      "Recht: Laut Lexikon ist Kartenzählen nach britischem Recht nicht illegal, ebenso nicht nach US-Bundes-, Landes- oder Kommunalrecht, solange kein externes Hilfsmittel oder keine Hilfsperson zählt. Casinos lehnen es trotzdem ab und können Spieler sperren. Für Deutschland habe ich keine Rechtsquelle gelesen; Vorsichtsregel: Das Hausrecht der Spielbank erlaubt es, Spieler zu verweisen. Wer in einer Spielbank zählen will, sollte sich vorab rechtlich informieren. [1][2]",
      "Zum Glücksspiel: Das Bundesinstitut für Öffentliche Gesundheit (BIÖG, früher BZgA) bietet unter „Check dein Spiel“ wissenschaftlich fundierte Informationen, Selbsttests und eine kostenlose, anonyme Online-Beratung für Betroffene und Angehörige. [3]",
    ],
    evidence: { level: "anleitung", why: "Das Verfahren stammt aus der Fachliteratur zum Blackjack (hier über einen Lexikonartikel); Studien zum Trainingseffekt auf Gedächtnis oder Rechnen habe ich nicht gelesen." },
    steps: [
      "Basisregeln von Blackjack und die Grundstrategie kennen; ohne sie bringt Zählen nichts. [1]",
      "Hi-Lo-Werte auswendig lernen: 2 bis 6 = +1, 7 bis 9 = 0, 10 bis Ass = −1. [1]",
      "Einen ganzen Stapel einzeln aufdecken und mitzählen; am Ende muss die Summe 0 sein. [1]",
      "Karten paarweise aufdecken und die Summe der Paare mitzählen (zum Beispiel +1 und −1 gleich 0). (Vorschlag)",
      "Zeit stoppen und die Zeit pro Stapel senken, ohne Fehler. (Vorschlag)",
      "Mit mehreren Stapeln üben und den True Count berechnen: Running Count geteilt durch Anzahl restlicher Stapel. [1]",
      "Ablenkung simulieren (Gespräch, Musik) und weiter zählen. (Vorschlag)",
      "Erst dann entscheiden, ob und wo man spielt, und die rechtliche Lage sowie das Suchtrisiko beachten. [2][3]",
    ],
    plan: [
      { title: "Woche 1", text: "Werte lernen, täglich ein Stapel Karte für Karte; Ziel: Summe 0. (Vorschlag)" },
      { title: "Woche 2", text: "Paarweise zählen, Zeit stoppen. (Vorschlag)" },
      { title: "Woche 3", text: "Mehrere Stapel, True Count berechnen. (Vorschlag)" },
      { title: "Woche 4", text: "Mit Ablenkung; danach nur noch Auffrischung. (Vorschlag)" },
    ],
    myths: [
      { myth: "Kartenzähler merken sich jede Karte.", fact: "Das ist ein Filmmythos (etwa „Rain Man“); gezählt wird eine laufende Summe, nicht jede Karte. [1]" },
      { myth: "Kartenzählen ist strafbar.", fact: "Für Großbritannien und die USA nennt das Lexikon: nicht illegal, solange kein externes Hilfsmittel eingesetzt wird; Casinos können aber sperren. Für Deutschland keine gelesene Rechtsquelle. [1]" },
    ],
    mistakes: [
      "Ein System lernen, ohne die Grundstrategie zu beherrschen. [1]",
      "Zu komplexe Systeme wählen; Tempo und Genauigkeit leiden. [1]",
      "Den Running Count bei mehreren Stapeln nicht in einen True Count umrechnen. [1]",
      "Mit Geld spielen, bevor das Zählen sicher sitzt. (Vorsichtsregel, keine Leitlinie)",
    ],
    safety: [
      "Glücksspiel kann zu Sucht führen; bei Anzeichen Hilfe suchen, zum Beispiel über „Check dein Spiel“. [3]",
      "Casinos können Zähler sperren; Hilfsgeräte sind nach dem Lexikon in den USA problematisch. [1]",
    ],
    conflicts: [
      "Die Rechtslage in Deutschland konnte ich nicht über eine Primärquelle prüfen; deutsche Rechtsfragen sind daher als offen zu behandeln.",
    ],
    videos: [
      { title: "Blackjack Hi-Lo Card Counting System Tutorial - How To Win At The Casino", id: "KAyA_XTHi-g", channel: "BibboMedia", why: "Hi-Lo Schritt für Schritt (englisch).", checked: true },
      { title: "The Hi-Lo card counting system explained (S6L3 - The Blackjack Academy)", id: "9Z-YLba32K8", channel: "Casino US", why: "Erklärung des Hi-Lo-Systems.", checked: true },
      { title: "How to count cards in blackjack", id: "V0urqRF3O0Y", channel: "Blackjack Consultants", why: "Einführung ins Zählen.", checked: true },
    ],
    videoNote: "Inhalt der Videos nur nach Titel und Kanal beurteilt, nicht angesehen; englischsprachig.",
    sources: [
      { title: "Wikipedia – Card counting (Hi-Lo, True Count, Legal status)", url: "https://en.wikipedia.org/wiki/Card_counting", kind: "Lexikon" },
      { title: "LTO – LG München I zu Black-Jack-Gewinnen: Deutsches Strafrecht nicht bei Online-Glücksspiel anwendbar (betrifft Online-Glücksspiel ohne deutsche Erlaubnis, nicht das Zählen)", url: "https://www.lto.de/recht/nachrichten/n/lg-muenchen-i-deutsches-strafrecht-nicht-anwendbar-gluecksspiel-online-internet", kind: "Rechtsnachricht" },
      { title: "Bundesinstitut für Öffentliche Gesundheit – Check dein Spiel", url: "https://www.check-dein-spiel.de/", kind: "Behörde" },
    ],
  },

  "Elixier zählen": {
    date: DATE,
    steckbrief: {
      about: "In Clash Royale mitrechnen, wie viel Elixier das Gegenüber ausgegeben hat und welche Karten gerade im Kartenzyklus sind. So erkennst du Zeitfenster für einen Angriff.",
      why: "Elixier wächst von selbst bis maximal 10; Karten haben feste Kosten. Aus Ausgaben und Zeit lässt sich der Vorrat des Gegners schätzen. Fachleute raten, den relativen Vorteil zu verfolgen, nicht jede Zahl genau.",
      tips: "Erst eigenes Elixier nicht verschwenden, dann den Zyklus des Gegners verfolgen, dann sein Elixier. (Vorschlag)",
      safety: "Kein gesundheitliches Risiko; bei langem Spielen Pausen machen. (Vorsichtsregel, keine Leitlinie)",
    },
    learn: [
      "Laut Wikipedia gibt es 8 Karten im Deck, 4 davon in der Hand; Elixier wird passiv erzeugt, maximal bis 10; in der letzten Minute der Kampfzeit verdoppelt sich die Erzeugung, in der letzten Minute der Verlängerung verdreifacht sie sich. [1]",
      "Ein Schachspieler-Leitfaden bei Chess.com beschreibt: Nach dem Ausspielen einer Karte müssen vier weitere Karten gespielt werden, bevor sie zurückkehrt. So kannst du verfolgen, was der Gegner in der Hand hat; sinnvoll ist, seine Gegenkarten zu deiner Gewinnkarte zu merken. [2]",
      "Der Leitfaden nennt als Zählen von Elixier: Da die Leiste bei 10 endet, weißt du, wann der Gegner sein Elixier aufgebraucht hat; wenn du dann viel hast, bist du im Vorteil. Zudem solle man „Elixier verlieren“ (bei 10 stehen) vermeiden. [2]",
      "Ein Lernleitfaden (Royale Meta) empfiehlt vier Schritte: beide beginnen mit gleichem Elixier, die Kosten der gespielten Karten verfolgen, natürliche Regeneration berücksichtigen, Elixiersammler einrechnen; wichtiger als genaue Zahlen sei der relative Vorteil. Zur Übung: Replays mit halber Geschwindigkeit ansehen und das Gegner-Elixier schätzen, dann mit dem Tatsächlichen vergleichen. Die Seite ist ein Fan-Leitfaden, keine Herstellerquelle. [3]",
      "Herstellerquelle (Supercell-Support) und Fan-Wiki waren nicht abrufbar; konkrete Regenerationswerte habe ich deshalb nicht übernommen, weil sich die gelesenen Quellen darin widersprachen oder unklar waren.",
    ],
    evidence: { level: "anleitung", why: "Das Verfahren stammt aus Lernleitfäden und einem Lexikonartikel zum Spiel; es gibt keine Studienlage." },
    steps: [
      "Elixierkosten deiner Karten und die des gegnerischen Decks auswendig lernen. [3]",
      "Beide starten mit gleichem Elixier; notiere im Kopf eine einzige Zahl für „Gegner-Elixier“. [3]",
      "Nach jeder gegnerischen Karte die Kosten abziehen. [3]",
      "Erzeugung über die Zeit grob dazurechnen, nach Bauchgefühl, wenn die genaue Rate nicht auswendig sitzt. (Vorschlag, nach [3])",
      "Zyklus verfolgen: Nach vier gespielten Karten kehrt die erste zurück. [2]",
      "Fenster erkennen: Hat der Gegner viel ausgegeben, du aber viel Vorrat, lohnt ein Angriff. [2][3]",
      "Eigenes Elixier nicht bei 10 stehen lassen. [2]",
      "Replays bei halber Geschwindigkeit anschauen und Schätzung prüfen. [3]",
    ],
    plan: [
      { title: "Woche 1", text: "Nur den Kartenzyklus des Gegners verfolgen. (Vorschlag)" },
      { title: "Woche 2", text: "Elixier grob in Stufen (niedrig, mittel, hoch) einschätzen. (Vorschlag)" },
      { title: "Woche 3", text: "Replays bei halber Geschwindigkeit, genaue Zahlen schätzen. [3]" },
      { title: "Woche 4", text: "In echten Spielen den Angriff an Zeitfenstern ausrichten. (Vorschlag)" },
    ],
    myths: [
      { myth: "Profis kennen das Elixier des Gegners auf die Nachkommastelle.", fact: "Der Leitfaden rät, auf relativen Vorteil statt genaue Zahlen zu achten. [3]" },
    ],
    mistakes: [
      "Bei 10 Elixier stehen bleiben (Verlust von Erzeugung). [2]",
      "Nur Elixier zählen und den Zyklus ignorieren. [2]",
    ],
    safety: [],
    conflicts: [
      "Die Quellen nennen unterschiedliche oder unklare Regenerationsraten; für genaue Zahlen sollte die Herstellerseite herangezogen werden, die ich nicht lesen konnte. [3]",
    ],
    videos: [
      { title: "HOW TO COUNT CYCLE AND ELIXIR LIKE A PRO PLAYER!", id: "u2nsXzhB5Ww", channel: "Jax CR", why: "Zyklus und Elixier zählen.", checked: true },
      { title: "How to ACTUALLY Count Elixir like a Pro in Clash Royale", id: "odpPuPdBYbs", channel: "Snax", why: "Elixierzählen im Spiel.", checked: true },
      { title: "How to Count Elixir and Build Elixir Advantages // Elixir Management Tips and Tricks in Clash Royale", id: "a3Nwy3xChD4", channel: "Bailey OP - Clash Royale Strategy", why: "Elixier zählen und Vorteile aufbauen.", checked: true },
    ],
    videoNote: "Inhalt der Videos nur nach Titel und Kanal beurteilt, nicht angesehen.",
    sources: [
      { title: "Wikipedia – Clash Royale (Regeln, Elixier)", url: "https://en.wikipedia.org/wiki/Clash_Royale", kind: "Lexikon" },
      { title: "Chess.com – A Chess Player's Guide to Clash Royale", url: "https://www.chess.com/article/view/chess-players-guide-to-clash-royale", kind: "Lernleitfaden" },
      { title: "Royale Meta – Mastering Elixir Management", url: "https://royalemeta.pages.dev/academy/mastering-elixir-management", kind: "Fan-Leitfaden" },
    ],
  },

  "Stundenplan merken": {
    date: DATE,
    steckbrief: {
      about: "Einen Wochenplan so im Kopf behalten, dass du ihn ohne Blick auf den Zettel aufsagen kannst: Fächer oder Termine werden mit Bildern oder Orten verknüpft und regelmäßig abgerufen.",
      why: "Mnemotechniken helfen laut Uni Frankfurt besonders bei Reihenfolgen und unzusammenhängenden Fakten. Verteiltes Wiederholen bringt laut Meta-Analyse mehr Behalten als gebündeltes.",
      tips: "Pro Tag ein Merkweg oder eine kurze Geschichte; abends ohne Zettel aufsagen, am nächsten Morgen kurz prüfen. (Vorschlag)",
      safety: "Keine Risiken.",
    },
    learn: [
      "Das Arbeitsblatt der Uni Frankfurt (CC BY-SA) beschreibt Mnemotechniken als Methoden, um Informationen besser einzuprägen; sie ersetzen nicht das Verstehen, helfen aber bei Zahlen, Reihenfolgen und Vokabeln. Selbst erdachte Merkhilfen fördern zusätzlich die Beschäftigung mit dem Stoff. [1]",
      "Loci-Methode: einen bekannten Weg mit auffälligen Ortspunkten wählen, jeden Ort mit einer Information verknüpfen (ein Ort, eine Information) und in Gedanken abgehen. Praktisch: die Anzahl der Stationen merken, um Lücken zu erkennen. [1]",
      "Körperliste: Statt eines Wegs dienen Körperteile als Stationen, etwa von den Füßen bis zum Kopf. Merkgeschichte: Informationen werden zu einer ungewöhnlichen, bildhaften Geschichte verknüpft. [1]",
      "Zeitliche Verteilung: Eine Meta-Analyse von 317 Experimenten zum verteilten Üben fand, dass der beste Abstand zwischen den Lerneinheiten mit der Zeit bis zum Test wächst. [3]",
      "Dunlosky et al. (2013) bewerteten zehn Lerntechniken, darunter Abfragen, verteiltes Üben, Schlüsselwortmethode und Bildvorstellung; die Wertungen der einzelnen Techniken standen nicht im Abstract, das ich gelesen habe. [2]",
    ],
    evidence: { level: "anleitung", why: "Die Merkverfahren stammen aus einem Hochschul-Arbeitsblatt; zu Wirksamkeit von Mnemotechniken und verteiltem Üben gibt es allgemeine Übersichten, aber keine Studie zu Stundenplänen." },
    steps: [
      "Den Wochenplan auf Papier schreiben: pro Tag die Fächer in Reihenfolge. [1]",
      "Für jeden Tag einen Merkweg wählen, etwa durch die Wohnung, mit so vielen Stationen wie Stunden. [1]",
      "Jedes Fach mit einem auffälligen Bild verknüpfen und an eine Station legen. [1]",
      "Alternativ eine kurze, witzige Merkgeschichte pro Tag bilden. [1]",
      "Die Zahl der Stationen merken und prüfen, ob keine fehlt. [1]",
      "Abends ohne Zettel aufsagen, morgens prüfen. (Vorschlag)",
      "Nach 1, 3 und 7 Tagen erneut aufsagen. (Vorschlag, nach [3])",
    ],
    plan: [
      { title: "Tag 1", text: "Montag und Dienstag als Merkweg anlegen und aufsagen. (Vorschlag)" },
      { title: "Tag 2", text: "Mittwoch bis Freitag anlegen, Montag und Dienstag wiederholen. (Vorschlag)" },
      { title: "Tag 3 bis 7", text: "Täglich die ganze Woche aus dem Kopf aufsagen, Lücken markieren. (Vorschlag)" },
    ],
    myths: [
      { myth: "Merktechniken ersetzen das Verstehen.", fact: "Das Arbeitsblatt sagt ausdrücklich, dass Mnemotechniken das Verstehen nicht ersetzen. [1]" },
    ],
    mistakes: [
      "Den Plan nur wieder lesen statt aus dem Gedächtnis aufzusagen. [2]",
      "Alle Wiederholungen an einem Tag bündeln. [3]",
    ],
    safety: [],
    conflicts: ["Zu Stundenplänen speziell habe ich keine Studie gefunden; die Übertragung ist eine Annahme."],
    videos: [],
    videoNote: "Kein geprüftes Video eingebunden.",
    sources: [
      { title: "Goethe-Universität Frankfurt – Mnemotechniken (Arbeitsblatt, CC BY-SA)", url: "https://www.uni-frankfurt.de/140757061/Mnemotechniken.pdf", kind: "Hochschul-Arbeitsblatt" },
      { title: "Dunlosky et al. 2013, Psychological Science in the Public Interest – Improving Students' Learning With Effective Learning Techniques", url: PM("26173288"), kind: "Übersichtsarbeit" },
      { title: "Cepeda et al. 2006, Psychological Bulletin – Distributed practice in verbal recall tasks: A review and quantitative synthesis", url: PM("16719566"), kind: "Meta-Analyse" },
    ],
  },

  "Wöchentlich kochen": {
    date: DATE,
    steckbrief: {
      about: "Jede Woche ein Gericht aus einem Kochbuch zubereiten und so Technik und Rezeptwissen schrittweise erweitern.",
      why: "In einer US-Erhebung mit 9.569 Erwachsenen ging häufiges Kochen zu Hause mit einer gesünderen Ernährung einher; das ist ein Zusammenhang, kein Beleg für Ursache und Wirkung.",
      tips: "Ein Rezept wählen, dessen Zutaten du kennst, und es einmal ganz nach Anleitung kochen, bevor du abwandelst. (Vorschlag)",
      safety: "Messer, heiße Flächen und Lebensmittelhygiene beachten (Vorsichtsregel, keine Leitlinie).",
    },
    learn: [
      "Wolfson und Bleich (2015) werteten Daten der US-Gesundheitserhebung NHANES 2007–2010 aus (9.569 Erwachsene). Wer 6 bis 7 Mal pro Woche zu Hause Abendessen kochte, aß im Mittel weniger Energie (9.054 gegenüber 9.627 kJ), Fett (81 gegenüber 86 g) und Zucker (119 gegenüber 135 g) als Personen, die 0 bis 1 Mal kochten. Der Zusammenhang galt unabhängig von der Absicht abzunehmen. [1]",
      "Die Studie betrifft die Häufigkeit des Kochens (bis zu täglich), nicht ein Gericht pro Woche; ob ein wöchentliches Gericht etwas bewirkt, geht daraus nicht hervor. [1]",
      "Zum Dranbleiben: Gewohnheiten brauchten in einer Studie 18 bis 254 Tage, bis sie weitgehend automatisch liefen; einmal auszulassen schadete nicht wesentlich. [2]",
    ],
    evidence: { level: "kaum", why: "Nur eine Querschnittsstudie zum Zusammenhang häufigen Kochens mit der Ernährung; zu einem Gericht pro Woche und zum Lernen aus einem Kochbuch habe ich nichts gelesen." },
    steps: [
      "Ein festes Kochbuch und einen festen Wochentag wählen (Vorschlag).",
      "Das Rezept vorab lesen und Zutaten besorgen (Vorschlag).",
      "Zutaten vorbereiten, bevor du zu kochen beginnst (Vorschlag).",
      "Nach dem Essen kurz notieren, was gelungen ist (Vorschlag).",
    ],
    plan: [
      { title: "Woche 1–4", text: "Ein einfaches Gericht pro Woche; ab Woche 3 ein Rezept mit neuer Technik. (Vorschlag)" },
    ],
    myths: [
      { myth: "Wer zu Hause kocht, isst automatisch gesünder.", fact: "Die Studie zeigt nur einen Zusammenhang zwischen Kochhäufigkeit und Ernährung, keinen Beleg für Ursache und Wirkung. [1]" },
    ],
    mistakes: ["Zu aufwendige Rezepte für den Einstieg wählen (Vorschlag).", "Ohne Plan einkaufen und dann verschieben (Vorschlag)."],
    safety: ["Auf Hygiene und Verletzungsschutz achten (Vorsichtsregel, keine Leitlinie)."],
    conflicts: ["Die Studie ist eine Querschnittserhebung; Menschen, die oft kochen, unterscheiden sich vermutlich auch in anderen Merkmalen. [1]"],
    videos: [],
    videoNote: "Kein geprüftes Video eingebunden.",
    sources: [
      { title: "Wolfson & Bleich 2015, Public Health Nutrition – Is cooking at home associated with better diet quality or weight-loss intention?", url: PM("25399031"), kind: "Querschnittsstudie" },
      LALLY,
    ],
  },

  "Thema der Woche": {
    date: DATE,
    steckbrief: {
      about: "Jede Woche ein Thema wählen und dich damit vertieft beschäftigen: lesen, Videos, Notizen, am Ende eine Zusammenfassung.",
      why: "In einer Studie mit Magnetresonanztomographie merkten sich Teilnehmende Informationen besser, wenn sie neugierig darauf waren; das galt auch für nebenbei Gelerntes.",
      tips: "Ein Thema wählen, das dich wirklich interessiert, und vorab 3 Fragen aufschreiben. (Vorschlag)",
      safety: "Keine Risiken.",
    },
    learn: [
      "Gruber, Gelman und Ranganath (2014): Teilnehmende zeigten in Gedächtnistests, sofort und einen Tag später, ein besseres Gedächtnis für Informationen, auf die sie neugierig waren, und für nebenbei Gelerntes in Zuständen hoher Neugier. Bildgebung zeigte stärkere Aktivität in Mittelhirn und Nucleus accumbens. Das ist eine Laborstudie mit Quizfragen. [1]",
      "Zum Dranbleiben: Gewohnheiten brauchten 18 bis 254 Tage, bis sie weitgehend automatisch liefen; ein ausgelassener Tag fiel nicht wesentlich ins Gewicht. [2]",
    ],
    evidence: { level: "kaum", why: "Die Neugier-Studie ist ein Laborexperiment mit Quizfragen; ob Wochenthemen das Behalten oder Verstehen verbessern, habe ich nicht belegt gefunden." },
    steps: [
      "Montags Thema und drei Fragen festlegen (Vorschlag).",
      "Eine Hauptquelle und eine zweite Quelle lesen (Vorschlag).",
      "Am Ende der Woche eine Seite Zusammenfassung schreiben (Vorschlag).",
      "Offene Fragen als nächstes Thema vormerken (Vorschlag).",
    ],
    plan: [
      { title: "Woche 1–4", text: "Je Woche ein Thema, 20 bis 30 Minuten täglich. (Vorschlag)" },
    ],
    myths: [
      { myth: "Man muss jedes Thema gleich gründlich lernen.", fact: "Die Studie zeigt, dass Neugier das Behalten fördert; ein Zwang dazu ist darin nicht untersucht. [1]" },
    ],
    mistakes: ["Zu breite Themen wählen (Vorschlag).", "Nur lesen und nichts aufschreiben (Vorschlag)."],
    safety: [],
    conflicts: ["Die Studie untersuchte Neugier auf einzelne Quizfragen, nicht auf ganze Themengebiete. [1]"],
    videos: [],
    videoNote: "Kein geprüftes Video eingebunden.",
    sources: [
      { title: "Gruber, Gelman & Ranganath 2014, Neuron – States of curiosity modulate hippocampus-dependent learning via the dopaminergic circuit", url: PM("25284006"), kind: "Studie" },
      LALLY,
    ],
  },

  "Vorlesungen schauen": {
    date: DATE,
    steckbrief: {
      about: "Vorlesungen ansehen und dabei Fragen notieren, die tiefer gehen: Warum gilt das? Woran würde man es erkennen?",
      why: "Eine Meta-Analyse von 225 Studien fand in MINT-Fächern, dass aktives Lernen die Prüfungsleistung gegenüber reinem Zuhören um 0,47 Standardabweichungen erhöhte.",
      tips: "Anhalten und die Antwort selbst versuchen, bevor die Vorlesung sie nennt; Fragen notieren. (Vorschlag)",
      safety: "Keine Risiken. Bei langen Bildschirmzeiten Pausen einlegen. (Vorsichtsregel, keine Leitlinie)",
    },
    learn: [
      "Freeman et al. (2014) werteten 225 Studien aus, die in Hochschulkursen der MINT-Fächer reine Vorlesung mit aktivem Lernen verglichen. Prüfungsleistung und Konzepttests stiegen durchschnittlich um 0,47 Standardabweichungen (158 Studien); das Risiko durchzufallen war bei reiner Vorlesung höher (Odds Ratio 1,95; 67 Studien). [1]",
      "Die Studie betrifft Präsenzkurse mit aktiver Beteiligung der Studierenden. Dass das Pausieren und Fragenstellen beim Ansehen von Videovorlesungen dasselbe bewirkt, ist eine Übertragung, die ich nicht belegt gefunden habe.",
    ],
    evidence: { level: "teilweise", why: "Für aktives Lernen in Kursen gibt es eine große Meta-Analyse; die Übertragung auf selbst angesehene Vorlesungsvideos ist nicht belegt." },
    steps: [
      "Eine Vorlesung auswählen, die zu deinem Thema passt (Vorschlag).",
      "Beim Ansehen pausieren und die nächste Aussage vorhersagen (Vorschlag).",
      "Zwei tiefere Fragen notieren: Warum? Was folgt daraus? (Vorschlag)",
      "Nach der Vorlesung aus dem Gedächtnis zusammenfassen (Vorschlag).",
    ],
    plan: [
      { title: "Woche 1–4", text: "Eine Vorlesung pro Woche mit Notizen und Fragen. (Vorschlag)" },
    ],
    myths: [
      { myth: "Vorlesungen ansehen reicht zum Lernen.", fact: "In der Meta-Analyse war aktives Lernen dem reinen Vorlesungsformat überlegen. [1]" },
    ],
    mistakes: ["Nur passiv zusehen (Vorschlag).", "Gleich mehrere Vorlesungen nacheinander ansehen, ohne Pausen (Vorschlag)."],
    safety: [],
    conflicts: ["Die Meta-Analyse betrifft Präsenzlehre in MINT-Fächern; für andere Fächer und Videos ist die Übertragung offen. [1]"],
    videos: [],
    videoNote: "Kein geprüftes Video eingebunden.",
    sources: [
      { title: "Freeman et al. 2014, PNAS – Active learning increases student performance in science, engineering, and mathematics", url: PM("24821756"), kind: "Meta-Analyse" },
    ],
  },

  "30 Tage Ernährung": {
    date: DATE,
    steckbrief: {
      about: "Einen Monat lang aufschreiben, was du isst, um dein Essverhalten bewusster wahrzunehmen.",
      why: "Eine systematische Übersicht über 22 Studien fand durchgängig einen Zusammenhang zwischen Selbstbeobachtung (vor allem Ernährungstagebuch) und Gewichtsverlust; die Belege waren wegen methodischer Schwächen schwach.",
      tips: "Direkt nach dem Essen notieren, nicht abends rekonstruieren; Papier reicht. (Vorschlag)",
      safety: "Bei Essstörung oder Neigung dazu ist genaues Protokollieren ungeeignet; ärztlichen oder psychologischen Rat suchen. (Vorsichtsregel, keine Leitlinie)",
    },
    learn: [
      "Burke, Wang und Sevick (2011) sichteten 22 Studien zu Selbstbeobachtung bei verhaltensbasierter Gewichtsabnahme (15 zu Ernährung, eine zu Bewegung, sechs zum Wiegen). Das Papiertagebuch wurde am häufigsten benutzt. Ein Zusammenhang zwischen Selbstbeobachtung und Gewichtsverlust fand sich durchgängig, die Belege waren aber wegen methodischer Mängel schwach; die Stichproben waren meist weiß und weiblich, und es stützte sich auf Selbstauskünfte. [1]",
      "Zum Dranbleiben: In einer Studie dauerte es 18 bis 254 Tage, bis ein tägliches Verhalten weitgehend automatisch lief; ein ausgelassener Tag war nicht entscheidend. [2]",
    ],
    evidence: { level: "kaum", why: "Die Übersicht fand einen durchgängigen Zusammenhang, stuft ihre Belege aber selbst als schwach ein; sie betrifft Gewichtsverlust, nicht Ernährungsqualität allgemein." },
    steps: [
      "Ein einfaches Format wählen (Notizbuch oder Notizen-App) (Vorschlag).",
      "Jede Mahlzeit und jeden Snack direkt festhalten (Vorschlag).",
      "Wöchentlich einen Blick auf Muster werfen, ohne zu urteilen (Vorschlag).",
      "Nach 30 Tagen entscheiden, was du beibehältst (Vorschlag).",
    ],
    plan: [
      { title: "Woche 1–2", text: "Nur festhalten, nichts ändern. (Vorschlag)" },
      { title: "Woche 3–4", text: "Eine kleine Änderung ausprobieren, z. B. Gemüse zu einer Mahlzeit. (Vorschlag)" },
    ],
    myths: [
      { myth: "Ein Ernährungstagebuch führt sicher zu Gewichtsverlust.", fact: "Die Übersicht fand einen Zusammenhang, schätzt die Belege aber als schwach ein. [1]" },
    ],
    mistakes: ["Erst abends aus dem Gedächtnis aufschreiben (Vorschlag).", "Das Tagebuch als Bewertung der eigenen Person lesen (Vorschlag)."],
    safety: ["Bei Neigung zu Essstörungen kein genaues Protokollieren; fachlichen Rat suchen. (Vorsichtsregel, keine Leitlinie)"],
    conflicts: ["Die Übersicht betrifft Programme zur Gewichtsabnahme, nicht ein Tagebuch ohne Begleitung. [1]"],
    videos: [],
    videoNote: "Kein geprüftes Video eingebunden.",
    sources: [
      { title: "Burke, Wang & Sevick 2011, Journal of the American Dietetic Association – Self-monitoring in weight loss: a systematic review of the literature", url: PM("21185970"), kind: "Systematische Übersicht" },
      LALLY,
    ],
  },

  "30 Tage Gua Sha": {
    date: DATE,
    steckbrief: {
      about: "Einen Monat lang regelmäßig Gua Sha anwenden: mit einem glatten Werkzeug (Stein) die Haut mit Öl streichen. Es ist eine traditionelle ostasiatische Technik und kein Heilmittel.",
      why: "Es gibt kleine Studien zu Gua Sha bei Nackenschmerzen (kurzfristig weniger Schmerz) und bei Wechseljahresbeschwerden (Studien von geringer Qualität). Zur Anwendung im Gesicht für Aussehen oder Wohlbefinden habe ich keine Studie gelesen.",
      tips: "Mit wenig Druck beginnen und Öl benutzen. Rötung oder Hautveränderungen sind kein Ziel; bei Schmerzen aufhören. (Vorsichtsregel, keine Leitlinie)",
      safety: "Nicht auf verletzter, entzündeter oder sonnenverbrannter Haut und nicht bei Blutgerinnungsproblemen oder Blutverdünnern anwenden; im Zweifel ärztlich fragen. (Vorsichtsregel, keine Leitlinie)",
    },
    learn: [
      "Gua Sha ist eine traditionelle ostasiatische Technik, bei der die Körperoberfläche mit einem glatten Instrument gestrichen wird, um bewusst Petechien (kleine Blutaustritte) zu erzeugen. [1]",
      "Braun et al. (2011): In einer offenen randomisierten Studie in Deutschland mit 48 Personen mit chronischen Nackenschmerzen besserte sich der Schmerz nach einer Anwendung nach 1 Woche stärker als mit einem Wärmekissen (Unterschied −29,9 mm auf einer 100-mm-Skala). Die Behandlung war sicher und gut verträglich; Langzeitwirkung unklar. [1]",
      "Ren et al. (2018): Eine Übersichtsarbeit zu Gua Sha bei Wechseljahresbeschwerden fand 6 Studien von meist niedriger methodischer Qualität; in Kombination mit westlicher Medizin zeigte sich eine Verbesserung von Beschwerde-Index und Hormonwerten, die Autoren sprechen von vorläufiger Evidenz. [2]",
      "Beide Quellen betreffen Anwendung am Körper durch Fachpersonal mit Schmerz bzw. Wechseljahren, nicht kosmetisches Gua Sha mit Stein im Gesicht. Dafür habe ich keine Studie gelesen. Eine Wirkung auf Haut oder Gesundheit durch tägliches Gua Sha ist nicht belegt.",
    ],
    evidence: { level: "kaum", why: "Kleine Studien zu Schmerzen und Wechseljahren, überwiegend von niedriger Qualität; für kosmetische Anwendung und tägliche Selbstanwendung keine Belege gelesen." },
    steps: [
      "Haut reinigen und Öl auftragen (Vorschlag).",
      "Mit leichtem Druck in gleichmäßigen Strichen arbeiten (Vorschlag).",
      "Nach 3 bis 5 Minuten beenden, Haut beobachten (Vorschlag).",
      "Bei Rötungen, Schmerz oder Reizung pausieren (Vorsichtsregel, keine Leitlinie).",
      "Einmal pro Woche notieren, wie sich Haut oder Anspannung anfühlen (Vorschlag).",
    ],
    plan: [
      { title: "Woche 1–4", text: "3-mal pro Woche 3 bis 5 Minuten, danach auswerten, ob es dir angenehm ist. (Vorschlag)" },
    ],
    myths: [
      { myth: "Gua Sha entgiftet oder heilt.", fact: "Die gelesenen Studien zeigen kurzfristig weniger Nackenschmerz bzw. vorläufige Hinweise bei Wechseljahresbeschwerden; Heilversprechen sind nicht belegt. [1][2]" },
    ],
    mistakes: ["Zu viel Druck und starke Rötung als Erfolg werten (Vorsichtsregel, keine Leitlinie).", "Bei Hauterkrankungen ohne Rat anwenden (Vorsichtsregel, keine Leitlinie)."],
    safety: ["Bei Hautveränderungen, Blutergüssen oder Schmerz aufhören und ärztlich Rat suchen. (Vorsichtsregel, keine Leitlinie)"],
    conflicts: [
      "Die Braun-Studie war offen (ohne Verblindung) und prüfte eine einzelne Anwendung gegen ein Wärmekissen. [1]",
      "Die Übersicht zu Wechseljahren fasst Studien niedriger Qualität zusammen, die Gua Sha mit Medikamenten kombinierten. [2]",
    ],
    videos: [],
    videoNote: "Kein geprüftes Video eingebunden.",
    sources: [
      { title: "Braun et al. 2011, Pain Medicine – Effectiveness of traditional Chinese „gua sha“ therapy in patients with chronic neck pain: a randomized controlled trial", url: PM("21276190"), kind: "Randomisierte Studie" },
      { title: "Ren et al. 2018, Complementary Therapies in Clinical Practice – Effects of Gua Sha therapy on perimenopausal syndrome: a systematic review and meta-analysis of randomized controlled trials", url: PM("29705467"), kind: "Meta-Analyse" },
    ],
  },
};
