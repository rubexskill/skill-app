// Wissens-Dossiers: recherchiert, mit Quellen. Schlüssel = Kurztitel des Skills.
// Keine persönlichen Daten. Jede inhaltliche Aussage hat eine Quelle (src: Nummer in `sources`) oder ist als „Einordnung“/„Vorschlag“ gekennzeichnet.

export type Evidence = "gut" | "teilweise" | "kaum";

export interface Dossier {
  /** Recherchedatum, z. B. „22. November 2026“ */
  date: string;
  /** Überarbeiteter Steckbrief */
  steckbrief: { about: string; why: string; tips: string; safety: string };
  /** Mehr erfahren: wie funktioniert es, was steckt dahinter */
  learn: string[];
  evidence: { level: Evidence; why: string };
  steps: string[];
  plan: { title: string; text: string }[];
  myths: { myth: string; fact: string }[];
  mistakes: string[];
  safety: string[];
  /** Widersprüche oder Unsicherheiten in der Literatur */
  conflicts: string[];
  /** checked = Link, Titel und Kanal über YouTube (oEmbed) bestätigt am 23.11.2026; Inhalt nur nach Titel beurteilt, Video nicht angesehen */
  videos: { title: string; id: string; channel: string; why: string; checked: boolean }[];
  /** Hinweis, wenn weniger als drei geprüfte Videos vorliegen */
  videoNote?: string;
  sources: { title: string; url: string; kind: string }[];
  /** Begründung der Trainer-Standardwerte */
  trainer?: string;
}

export const EVIDENCE_LABEL: Record<Evidence, string> = { gut: "Gut belegt", teilweise: "Teilweise belegt", kaum: "Kaum belegt" };

export const DATE = "23. November 2026";
/** Recherchedatum der ersten drei Dossiers */
const DATE_1 = "22. November 2026";

import { DOSSIERS_ATMUNG } from "./dossiers-atmung";
import { DOSSIERS_ATMUNG2 } from "./dossiers-atmung2";
import { DOSSIERS_KOERPER } from "./dossiers-koerper";
import { DOSSIERS_KOPF } from "./dossiers-kopf";
import { DOSSIERS_KREATIV } from "./dossiers-kreativ";
import { DOSSIERS_WISSEN } from "./dossiers-wissen";
import { DOSSIERS_GEWOHNHEITEN } from "./dossiers-gewohnheiten";
import { DOSSIERS_PROJEKTE } from "./dossiers-projekte";

export const DOSSIERS: Record<string, Dossier> = {
  ...DOSSIERS_ATMUNG,
  ...DOSSIERS_ATMUNG2,
  ...DOSSIERS_KOERPER,
  ...DOSSIERS_KOPF,
  ...DOSSIERS_KREATIV,
  ...DOSSIERS_WISSEN,
  ...DOSSIERS_GEWOHNHEITEN,
  ...DOSSIERS_PROJEKTE,
  "Box Breathing": {
    date: DATE_1,
    steckbrief: {
      about: "Gleichmäßiges Atmen in vier gleich langen Phasen: einatmen, halten, ausatmen, halten – üblich sind je 4 Sekunden. Kurzfristig kann es beruhigen; eine Behandlung ist es nicht.",
      why: "Eine einfache Übung für Stressmomente, die überall geht. In einer Studie mit 111 Personen sank die Angst mit Box Breathing ähnlich stark wie mit Achtsamkeitsmeditation; bei der Stimmung schnitt eine andere Atemübung (Cyclic Sighing) besser ab.",
      tips: "Durch die Nase atmen, Schultern locker, nie bis zur Atemnot. Sind 4 Sekunden zu lang, nimm 3. Das Halten darfst du verkürzen oder weglassen, wenn es unangenehm ist.",
      safety: "Bei Schwindel sofort normal weiteratmen. Nicht im Stehen, beim Autofahren oder im Wasser üben. Bei Ohnmachtsneigung, Herz-Kreislauf-Erkrankung, schlecht eingestelltem Asthma oder Schwangerschaft: Luft-Halten weglassen und ärztlich nachfragen.",
    },
    learn: [
      "Beim langsamen Atmen schwankt die Herzfrequenz stärker im Takt der Atmung (Atem-Herzschlag-Kopplung). Eine Übersichtsarbeit mit 223 Studien fand: Die vagal vermittelte Herzratenvariabilität steigt während des langsamen Atmens, kurz danach und nach mehrwöchigem Training. [3]",
      "Als Mechanismus wird diskutiert, dass Atmen bei etwa 6 Zügen pro Minute den Kreislauf im Resonanzbereich anregt und den Blutdruckreflex stärkt. Das ist eine Hypothese, kein gesichertes Ergebnis. [4]",
      "Wichtig für die Einordnung: Fast alle Studien untersuchen langsames Atmen allgemein, nicht Box Breathing mit seinen Haltephasen. Die Übertragung auf Box Breathing ist eine Annahme. [3][4]",
      "Die bekannteste direkte Studie (Balban et al. 2023): 111 Freiwillige übten einen Monat lang täglich 5 Minuten Cyclic Sighing, Box Breathing, zyklische Hyperventilation mit Halten oder Achtsamkeit. Alle Gruppen wurden ruhiger; Atemübungen insgesamt hoben die Stimmung stärker als Achtsamkeit, am meisten Cyclic Sighing. Bei der Angst verbesserten sich Box Breathing und Achtsamkeit nach einer Auswertung in ähnlichem Ausmaß; die genauen Zahlenwerte konnte ich nicht selbst im Volltext prüfen. [1][2]",
    ],
    evidence: {
      level: "teilweise",
      why: "Langsames Atmen wirkt kurzfristig messbar auf Herzfrequenz und Entspannung, doch Box Breathing selbst ist nur in einer Studie direkt untersucht worden und dort bei der Angst nicht klar besser als Achtsamkeit.",
    },
    steps: [
      "Bequem sitzen, Rücken gerade, Schultern locker. Eine Hand auf den Bauch.",
      "Ausatmen, bis die Lunge bequem leer ist.",
      "4 Sekunden durch die Nase einatmen, der Bauch hebt sich.",
      "4 Sekunden halten, ohne zu verkrampfen.",
      "4 Sekunden ruhig durch Nase oder Mund ausatmen.",
      "4 Sekunden leer bleiben. Das ist eine Runde (16 Sekunden).",
      "4 bis 8 Runden wiederholen, danach zwei Atemzüge ganz normal atmen.",
    ],
    plan: [
      { title: "Woche 1", text: "Einmal täglich 4 Runden (etwa 1 Minute), gern 3 Sekunden pro Phase. Ziel: Rhythmus ohne Anstrengung." },
      { title: "Woche 2", text: "Einmal täglich 2–3 Minuten bei 4 Sekunden." },
      { title: "Woche 3–4", text: "Täglich 5 Minuten – so lange übten die Teilnehmenden in der Studie. [1]" },
      { title: "Danach", text: "In einem echten Stressmoment einsetzen (vor einem Gespräch, vor einer Prüfung). Vorschlag, nicht aus der Studie abgeleitet." },
    ],
    myths: [
      { myth: "Box Breathing „resettet“ das Nervensystem.", fact: "Langsames Atmen erhöht kurzfristig die Herzratenvariabilität. Von einem „Reset“ sprechen nur Werbetexte; die Langzeiteffekte sind in Studien uneinheitlich. [3][5]" },
      { myth: "Box Breathing ist die beste Atemübung.", fact: "In der direkten Vergleichsstudie lag Cyclic Sighing bei Stimmung und Atemfrequenz vorn; bei der Angst waren die Gruppen ähnlich. [1][2]" },
      { myth: "Je länger das Halten, desto stärker die Wirkung.", fact: "Dafür fand ich keinen Beleg. Die Übersichtsarbeiten betreffen das verlangsamte Atmen insgesamt. [3][4]" },
      { myth: "Es ersetzt eine Behandlung bei Angststörungen.", fact: "Die Studie lief mit freiwilligen Teilnehmenden, nicht mit Patientinnen und Patienten. [1]" },
    ],
    mistakes: [
      "Phasen zu lang wählen und gegen Atemnot ankämpfen – lieber kürzer.",
      "Schultern hochziehen statt den Bauch zu bewegen.",
      "Beim Halten die Luft mit Kraft pressen.",
      "Sofortige Wirkung erwarten; bei vielen Menschen kommt die Ruhe erst nach einigen Runden.",
    ],
    safety: [
      "Gemütliche Atmung ist in der Regel unbedenklich; das Luft-Halten verlangt mehr Vorsicht. Die Hinweise zu Ohnmachtsneigung, Blutdruckproblemen, Asthma und Schwangerschaft stammen von Anbieter- und Gesundheitsseiten, nicht aus einer medizinischen Leitlinie. Im Zweifel ärztlich fragen. [6]",
      "Bei Schwindel oder Kribbeln: aufhören, normal atmen.",
    ],
    conflicts: [
      "Studien zu den Dauerwirkungen widersprechen sich: Kurzfristig sind die Effekte klarer als nach Wochen. [3][5]",
      "Eine Übersichtsarbeit stufte die Balban-Studie als qualitativ schwach ein (von mir nicht im Original geprüft); die Daten sollten nicht überbewertet werden. [1]",
      "Mit 4 Sekunden je Phase atmest du etwa 3,75-mal pro Minute – langsamer als die oft genannten 6 Atemzüge pro Minute. Ob das besser oder schlechter ist, ist offen. [4]",
    ],
    videos: [
      { title: "Stop Stress Fast (4-Minute Box Breathing)", id: "2NO7wJBQLIg", channel: "ANYMYOGA", why: "Vier Minuten zum Mitmachen im 4-4-4-4-Rhythmus.", checked: true },
      { title: "Box Breathing for Calm & Focus | 4-4-4-4 Breathing Exercise", id: "u0th_ktl1UI", channel: "Pocket Breath Coach – Luke Horton", why: "Geführte Übung für den Alltag.", checked: true },
      { title: "The 'Huberman Sequence' Breathwork – Physiological Sigh – Box Breathing – Cyclic Hyperventilation", id: "bNVfSnGhz2M", channel: "Recal Training", why: "Zeigt die drei Übungen, die in der Balban-Studie verglichen wurden.", checked: true },
    ],
    sources: [
      { title: "Balban et al. 2023, Cell Reports Medicine – Brief structured respiration practices", url: "https://pubmed.ncbi.nlm.nih.gov/36630953/", kind: "Studie" },
      { title: "Stanford Medicine: ‚Cyclic sighing‘ can help breathe away anxiety", url: "https://med.stanford.edu/news/insights/2023/02/cyclic-sighing-can-help-breathe-away-anxiety.html", kind: "Universität" },
      { title: "Effects of voluntary slow breathing on heart rate and heart rate variability: a systematic review and meta-analysis (223 Studien)", url: "https://fis.dshs-koeln.de/de/publications/effects-of-voluntary-slow-breathing-on-heart-rate-and-heart-rate-/", kind: "Übersichtsarbeit" },
      { title: "Zaccaro et al. 2018, Frontiers in Human Neuroscience – How Breath-Control Can Change Your Life", url: "https://pubmed.ncbi.nlm.nih.gov/30245619/", kind: "Übersichtsarbeit" },
      { title: "The Effect of Slow-Paced Breathing on Cardiovascular and Emotion Functions: A Meta-Analysis and Systematic Review (Mindfulness 2024; 31 Studien, n = 1.133)", url: "https://link.springer.com/article/10.1007/s12671-023-02294-2", kind: "Übersichtsarbeit" },
      { title: "Oxygen Advantage: Safety guidelines for breathwork", url: "https://oxygenadvantage.com/blogs/blog/safety-guidelines-oxygen-advantage-breathwork-training", kind: "Anbieter (Sekundärquelle)" },
    ],
    trainer: "Der Atem-Trainer startet mit 4 Sekunden je Phase (üblicher Wert) und lässt 3 bis 6 Sekunden zu. Vier Sekunden sind der gängige Einstieg; wer schneller in Atemnot kommt, nimmt 3 (dann etwa 5 Atemzüge pro Minute, nahe an den oft genannten 6). Alles lässt sich ändern. [3][4]",
  },

  "Handstand halten": {
    date: DATE_1,
    steckbrief: {
      about: "Den Handstand frei und stabil halten – erst an der Wand, dann ohne. Das Gleichgewicht kommt vor allem aus den Händen und Handgelenken; Schultern und Rumpf geben die Stabilität.",
      why: "Stärkt Schultern und Rumpf und schult das Gleichgewicht. Eine kleine Studie mit Anfängern zeigte nach drei Wochen gezieltem Handgelenks-Training bessere Haltezeiten.",
      tips: "Arme durchstrecken, Schultern zu den Ohren schieben, Blick zwischen die Hände, Rippen und Gesäß anspannen. Lieber täglich kurz üben als selten lange.",
      safety: "Handgelenke vorher aufwärmen, Abrollen und Fallen zuerst auf weichem Boden üben. Schmerz in den Handgelenken ernst nehmen – er ist bei Turnern häufig, aber kein gutes Zeichen.",
    },
    learn: [
      "Beim Handstand wird aus dem Stehen ein Stützen auf den Händen. Motorikforscher fanden, dass die Handgelenke vor allem zur Haltungskontrolle beitragen: Kippt der Körper nach vorn, drücken die Finger gegen den Boden; kippt er nach hinten, die Handballen. Eine Studie mit 25 Sportstudierenden: Wer drei Wochen lang eine solche Handgelenksstrategie bewusst übte, hielt länger und kontrollierte die Balance besser; Schulter- und Hüftwinkel änderten sich nicht bedeutsam. [1]",
      "Die üblichen Lernstufen kommen aus der Trainerpraxis: Wand hochlaufen, Kick-ups an der Wand, sich von der Wand lösen, freistehend hochkicken. [2]",
      "Der Wandhandstand ist kein Beweis für Bereitschaft: Zwischen gutem Wandhalten und freiem Handstand liegt vor allem das Gleichgewicht. [3]",
      "Die Handgelenke tragen das ganze Körpergewicht, und Schmerzen sind häufig: Bei jugendlichen Turnerinnen und Turnern liegt die zusammengefasste Häufigkeit bei etwa 53 % (Übersichtsarbeit, Datensicherheit niedrig bis sehr niedrig). In einer Online-Umfrage unter 321 erwachsenen Handstand-Übenden gaben 56,7 % chronische Handgelenksschmerzen an, jüngere häufiger. [4][5][6]",
    ],
    evidence: {
      level: "kaum",
      why: "Für die Reihenfolge der Übungen gibt es nur Trainererfahrung und eine kleine, kurze Studie (25 Anfänger, 3 Wochen); dass Handgelenksschmerzen häufig sind, zeigen Übersichtsarbeiten und eine Umfrage (allerdings mit geringer Datensicherheit).",
    },
    steps: [
      "Handgelenke aufwärmen: Kreise, Dehnen in beide Richtungen, Unterarmstütz auf Händen und Knien.",
      "Wand hochlaufen: Hände etwa 30 cm von der Wand, mit den Füßen die Wand hinauflaufen, bis der Körper gerade ist. Bauch zur Wand.",
      "Halten: Finger breit spreizen, Arme strecken, Schultern hoch zu den Ohren, Rippen einziehen, Blick zwischen die Hände.",
      "Kick-ups an der Wand: Ein Bein schwingt hoch, das zweite folgt, die Fersen berühren leicht die Wand.",
      "Von der Wand lösen: Mit Fingerdruck gegen das Vorkippen und Handballendruck gegen das Zurückkippen die Balance suchen – erst Sekundenbruchteile.",
      "Abrollen üben: Beim Kippen Arm beugen, seitlich abrollen oder zurück auf die Füße steigen.",
      "Freistehend kicken, 3–5 Versuche, dann Pause.",
    ],
    plan: [
      { title: "Woche 1–2", text: "Täglich 10 Minuten: Handgelenke aufwärmen, 3 × 20 s Bauch-zur-Wand-Handstand. Vorschlag, aus Trainerquellen abgeleitet. [2][3]" },
      { title: "Woche 3–4", text: "Wandhaltezeit auf 30 s steigern, Kick-ups an der Wand, Abrollen üben." },
      { title: "Woche 5–8", text: "Von der Wand lösen: 10–15 Versuche pro Einheit, Ziel 5 s freier Handstand." },
      { title: "Danach", text: "Mehrere kurze Einheiten statt einer langen; Ziel 15, später 30 s frei." },
    ],
    myths: [
      { myth: "Wer den Wandhandstand beherrscht, hat den freien Handstand fast.", fact: "Die Lücke ist das Gleichgewicht, nicht die Kraft. [3]" },
      { myth: "Handgelenksschmerzen gehören zum Handstand dazu.", fact: "Sie sind häufig (rund die Hälfte der Befragten), aber häufig heißt nicht harmlos; die Autoren der Umfrage vermuten eher einen Zusammenhang mit Trainingsintensität und Biomechanik als mit der reinen Trainingsmenge. [5][6]" },
      { myth: "Zwei Stunden an einem Tag sind besser als zehn Minuten täglich.", fact: "Trainer empfehlen häufig kurze, tägliche Einheiten; belegt ist das nur als Erfahrung, nicht durch eine Vergleichsstudie. [2][3]" },
    ],
    mistakes: [
      "Hohlkreuz (Banane): Rippen einziehen, Gesäß anspannen.",
      "Ellbogen gebeugt oder Schultern nicht offen.",
      "Mit den Armen statt mit den Fingern ausbalancieren.",
      "Zu lange Einheiten, bis die Handgelenke schmerzen.",
    ],
    safety: [
      "Handgelenke vor jeder Einheit aufwärmen. Eine Umfrage unter erwachsenen Handstand-Übenden fand allerdings keinen klaren Zusammenhang zwischen Aufwärmen, Bandagen und chronischem Handgelenksschmerz. [6]",
      "Abrollen auf Matte oder Rasen lernen, bevor du frei kickst. Platz zum Fallen lassen.",
      "Bei anhaltendem Handgelenks-, Schulter- oder Nackenschmerz pausieren und ärztlich abklären lassen.",
    ],
    conflicts: [
      "Trainer empfehlen Aufwärmen und Handgelenksvorbereitung; eine Umfrage unter erwachsenen Übenden fand keinen Zusammenhang mit weniger chronischem Schmerz (Selbstauskunft, keine Messung). [2][6]",
      "Die Studie zur Handgelenksstrategie ist klein und kurz; Übertragung auf alle Anfänger ist unsicher. [1]",
    ],
    videos: [
      { title: "The Complete Handstand Guide | From Absolute Beginner", id: "2-3wv5kLNnw", channel: "Tom Merrick", why: "Ausführliche Anleitung für Einsteiger, Titel laut Suchergebnis.", checked: true },
      { title: "How To Handstand [Beginner Wall Progressions]", id: "QQpokQxyiDo", channel: "Unity Gym", why: "Wandstufen für Anfänger.", checked: true },
      { title: "Handstand Kick-Up Progressions Using Wall (Levels 1–5)", id: "HlUiDt-YLVI", channel: "The UNRŪLY Method", why: "Fünf Stufen für den Kick-up an der Wand.", checked: true },
    ],
    sources: [
      { title: "Rohleder & Vogt 2019, Science of Gymnastics Journal – Efficacy of wrist strategy coaching on handstand performances in novices", url: "https://doi.org/10.52165/sgj.11.2.209-222", kind: "Studie" },
      { title: "GMB: Handstand", url: "https://gmb.io/handstand/", kind: "Trainer" },
      { title: "Breaking Muscle: Develop your handstand – the importance of progression", url: "https://breakingmuscle.com/develop-your-handstand-the-importance-of-progression/", kind: "Trainer" },
      { title: "Benjamin, Engel & Chudzik 2017 – Wrist pain in gymnasts: a review of common overuse wrist pathology", url: "https://pubmed.ncbi.nlm.nih.gov/28902754/", kind: "Übersichtsarbeit" },
      { title: "Wrist pain and injury in adolescent artistic gymnasts: systematic review (2026; 25 Studien, Datensicherheit niedrig bis sehr niedrig)", url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12804664/", kind: "Übersichtsarbeit" },
      { title: "The wrist as a weightbearing joint in adult handstand practitioners: cross-sectional survey (2025, n = 321)", url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12550924/", kind: "Studie" },
    ],
  },

  "Wochentag berechnen": {
    date: DATE_1,
    steckbrief: {
      about: "Den Wochentag zu jedem Datum im Kopf berechnen, mit der Doomsday-Methode von John Conway (1973). Sie nutzt Tage, die in jedem Jahr auf denselben Wochentag fallen.",
      why: "Ein überprüfbarer Kopfrechen-Trick: Das Verfahren ist mathematisch exakt für den gregorianischen Kalender und kommt mit kleinen Zahlen und Modulo 7 aus.",
      tips: "Erst die zehn Doomsday-Daten und die Jahrhundert-Anker auswendig, dann das Jahr, dann zum nächsten Doomsday zählen. Täglich ein, zwei Daten rechnen.",
      safety: "",
    },
    learn: [
      "Idee: In jedem Jahr fallen bestimmte leicht merkbare Tage auf denselben Wochentag, die „Doomsdays“: 4.4., 6.6., 8.8., 10.10., 12.12. sowie 5.9., 9.5., 7.11., 11.7. (Merkhilfe „Working 9 to 5 at the 7-Eleven“), dazu der 14.3. (Pi-Tag). Im Januar ist es der 3. (Schaltjahr: der 4.), im Februar der 28. (Schaltjahr: der 29.). [1][2]",
      "Jedes Jahr hat einen Doomsday-Wochentag, der vom Jahrhundert-Anker abhängt: 1800er Freitag, 1900er Mittwoch, 2000er Dienstag, 2100er Sonntag. Der Zyklus wiederholt sich alle 400 Jahre. [1][3]",
      "Den Wochentag des Jahres-Doomsdays findest du so: Anker plus Verschiebung des Jahres. Eine schnelle Variante („odd+11“, Fong und Walters): Letzte zwei Ziffern T; ist T ungerade, addiere 11; halbiere; ist das Ergebnis ungerade, addiere 11; nimm 7 minus (Rest durch 7); zähle so viele Tage ab dem Jahrhundert-Anker. Beispiel 2026: 26 → 13 → 24 → 7 − 3 = 4; vier Tage nach Dienstag = Samstag. [3]",
      "Dann zählst du vom nächsten Doomsday zum Zieldatum. Beispiel 22. November 2026: Doomsday im November ist der 7. (7.11.) = Samstag; der 22. liegt 15 Tage später, also einen Tag nach Samstag = Sonntag. [1][3]",
      "Conway selbst prüfte sich mit einem Programm, das ihm zehn Zufallsdaten gab; er schaffte sie laut Beschreibung eines Numberphile-Videos in etwa 15 Sekunden (Beschreibung nicht selbst geprüft). [4]",
    ],
    evidence: {
      level: "gut",
      why: "Die Methode ist ein mathematisch beweisbares Verfahren (Modulo 7 im gregorianischen 400-Jahre-Zyklus); wie schnell Menschen sie lernen, ist dagegen nicht untersucht.",
    },
    steps: [
      "Die Doomsdays der zwölf Monate lernen (siehe oben), erst im laufenden Jahr.",
      "Wochentage als Zahlen merken: Sonntag 0 bis Samstag 6.",
      "Den Jahrhundert-Anker lernen: 1800er Freitag, 1900er Mittwoch, 2000er Dienstag, 2100er Sonntag.",
      "Doomsday des Jahres bestimmen (odd+11 oder die klassische Methode mit Zwölfern).",
      "Vom nächsten Doomsday zum Zieldatum zählen (Modulo 7).",
      "Mit einem Kalender oder dem Trainer in der App gegenprüfen.",
    ],
    plan: [
      { title: "Tag 1–3", text: "Nur die Doomsdays der Monate, bis sie ohne Nachdenken kommen." },
      { title: "Woche 1", text: "Wochentage im laufenden Jahr: 5 Daten pro Tag, Zeit nicht beachten." },
      { title: "Woche 2", text: "Anker und Jahres-Doomsday für 20./21. Jahrhundert." },
      { title: "Woche 3–4", text: "Gemischte Daten mit dem Trainer; Ziel unter 10 s. Zum Vergleich: Conway brauchte laut Numberphile etwa 15 s. Vorschlag. [4]" },
    ],
    myths: [
      { myth: "Man muss ein Rechengenie sein.", fact: "Das Verfahren braucht nur kleine Zahlen und Rest durch 7. [1][3]" },
      { myth: "Es gilt für jedes Datum der Geschichte.", fact: "Die Regel beruht auf dem gregorianischen Kalender. Für ältere Daten, die damals noch im julianischen Kalender standen, passt das Ergebnis nicht zum damaligen Datum (Einordnung; je nach Land verschieden)." },
      { myth: "Es gibt nur einen Weg, das Jahr zu berechnen.", fact: "Es gibt mehrere Varianten, z. B. Conways ursprüngliche und die „odd+11“-Methode. Wer sie erfunden hat, ist in den Quellen nicht einheitlich. [3]" },
    ],
    mistakes: [
      "Schaltjahr im Januar und Februar vergessen (3./4. Januar, 28./29. Februar).",
      "Falsches Jahrhundert (1900er Mittwoch, 2000er Dienstag).",
      "Beim Zählen über die Woche hinaus nicht Modulo 7 rechnen.",
      "Falsche Richtung: vom Doomsday zurückzählen, wenn das Datum davor liegt.",
    ],
    safety: [],
    conflicts: [
      "Die „odd+11“-Methode wird Fong und Walters (2010) zugeschrieben; eine arXiv-Arbeit nennt sie eine verbesserte Variante der Methode von Walters (2008). [3]",
      "Die Merkregel für Januar und Februar wird unterschiedlich formuliert („jeweils der letzte Tag“ gegenüber „3./4. Januar, 28./29. Februar“). Die App folgt der zweiten Formulierung (Wikipedia). [1][2]",
    ],
    videos: [
      { title: "The Doomsday Algorithm – Numberphile", id: "z2x3SSBVGJU", channel: "Numberphile", why: "Der Klassiker: Conways Methode erklärt (Kanal laut Titel; Video selbst nicht geöffnet).", checked: true },
      { title: "John Conway's Doomsday Algorithm", id: "Uw4xneiViCo", channel: "Maths Xtra", why: "Zweite Erklärung der Methode.", checked: true },
      { title: "Quiz Yourself on John Conway's Doomsday Rule", id: "cKBHdRJfgIc", channel: "bornach", why: "Zum Üben mit Daten.", checked: true },
    ],
    sources: [
      { title: "Wikipedia: Doomsday rule", url: "https://en.wikipedia.org/wiki/Doomsday_rule", kind: "Nachschlagewerk" },
      { title: "Scientific American: What Day Is Doomsday?", url: "https://www.scientificamerican.com/article/calendar-algorithm/", kind: "Fachmagazin" },
      { title: "Fong & Walters, arXiv: Methods for mentally computing the day of the week", url: "https://arxiv.org/pdf/1010.0765", kind: "Fachartikel" },
      { title: "Numberphile: The Doomsday Algorithm (Video)", url: "https://www.youtube.com/watch?v=z2x3SSBVGJU", kind: "Video" },
      { title: "timeanddate.com: Doomsday weekday", url: "https://www.timeanddate.com/date/doomsday-weekday.html", kind: "Nachschlagewerk" },
    ],
    trainer: "Der Wochentag-Trainer prüft gegen den gregorianischen Kalender; die Ziel-Zeit unter 10 s ist ein Vorschlag, Conway selbst brauchte laut Numberphile etwa 15 s pro Datum. Zeit und Jahrbereich sind einstellbar. [4]",
  },
};
