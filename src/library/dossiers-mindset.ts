import type { Dossier } from "./dossiers";

// Kategorie „Mindset & Fokus“.
// Recherchiert am 23. November 2026. Studien über PubMed/Crossref geprüft (Titel, Autoren, Abstract); Aussagen stehen nur, wenn sie im Abstract stehen.
// Ausgelassen: BeFreed-App (eine App, keine seriösen Quellen zu ihrer Wirkung gefunden).
// Hinweis: „Echter Fokus (Henry Hildebrand)“ bezieht sich auf eine Person, zu der ich keine geprüfte Quelle fand; das Dossier behandelt Fokus allgemein.
const DATE = "23. November 2026";
const PM = (id: string) => `https://pubmed.ncbi.nlm.nih.gov/${id}/`;

const SRC_MRAZEK = { title: "Mrazek, Franklin, Phillips et al. 2013, Psychological Science – Mindfulness training improves working memory capacity and GRE performance while reducing mind wandering", url: PM("23538911"), kind: "Studie" };
const SRC_KILLINGS = { title: "Killingsworth & Gilbert 2010, Science – A wandering mind is an unhappy mind", url: PM("21071660"), kind: "Studie" };
const SRC_OPHIR = { title: "Ophir, Nass & Wagner 2009, PNAS – Cognitive control in media multitaskers", url: PM("19706386"), kind: "Studie" };
const SRC_WEBB = { title: "Webb, Miles & Sheeran 2012, Psychological Bulletin – Dealing with feeling: a meta-analysis of the effectiveness of strategies derived from the process model of emotion regulation", url: PM("22582737"), kind: "Metaanalyse" };

export const DOSSIERS_MINDSET: Record<string, Dossier> = {
  "Aufmerksamkeitsspanne": {
    date: DATE,
    steckbrief: {
      about: "Die Fähigkeit, länger bei einer Sache zu bleiben, ohne abzuschweifen oder sich ablenken zu lassen. Sie lässt sich nicht an einer einzigen Zahl messen.",
      why: "Abschweifende Gedanken sind alltäglich, und sie machen laut einer Studie typischerweise unglücklich. Ein zweiwöchiger Achtsamkeitskurs verringerte in einer Studie das Abschweifen und verbesserte Arbeitsgedächtnis und Leseverständnis.",
      tips: "Ablenkungen ausschalten, bevor man beginnt (Handy außer Sicht). Wer viel parallel zu Medien arbeitet, stolpert eher über Störreize. Kurze, regelmäßige Übungseinheiten sind besser als seltene lange (Vorschlag).",
      safety: "Bei anhaltenden, starken Konzentrationsproblemen ärztlich abklären lassen (Vorsichtsregel, keine Leitlinie).",
    },
    learn: [
      "Per Smartphone-Befragung zeigte sich: Menschen denken fast so oft an Dinge, die gerade nicht passieren, wie an das, was passiert; das macht typischerweise unglücklich. [1]",
      "In einer randomisierten Untersuchung verringerte ein zweiwöchiger Achtsamkeitskurs das Abschweifen und verbesserte Leseverständnis (GRE) und Arbeitsgedächtnis. Die Verbesserung wurde bei ablenkungsanfälligen Personen durch weniger Abschweifen vermittelt. [2]",
      "Häufige Medien-Multitasker sind laut einer Studie anfälliger für Störreize und schnitten bei einem Aufgabenwechsel schlechter ab. Das ist ein Zusammenhang, kein Beweis, dass Multitasking die Konzentration verschlechtert. [3]",
    ],
    evidence: { level: "teilweise", why: "Einzelne randomisierte Studien zeigen Wirkungen von Achtsamkeitstraining auf Abschweifen; über langfristige Wirkung und über eine allgemein „schrumpfende“ Aufmerksamkeitsspanne habe ich nichts Belastbares gelesen." },
    steps: [
      "Eine Aufgabe festlegen, Ablenkungen entfernen (Benachrichtigungen aus).",
      "Zehn Minuten nur diese Aufgabe, danach kurze Pause.",
      "Wenn die Gedanken abschweifen, bemerken und zur Aufgabe zurückkehren.",
      "Die Dauer schrittweise erhöhen.",
    ],
    plan: [
      { title: "Woche 1–2", text: "Täglich 10 Minuten eine Aufgabe ohne Ablenkung; Achtsamkeitskurs-Dauer in der Studie: 2 Wochen. [2]" },
      { title: "Woche 3–4", text: "15 bis 20 Minuten, eine feste Tageszeit (Vorschlag)." },
    ],
    myths: [
      { myth: "Multitasking spart Zeit.", fact: "Heavy-Multitasker schnitten bei Störreizen und Aufgabenwechsel schlechter ab. [3]" },
      { myth: "Abschweifen ist harmlos.", fact: "Laut Studie macht es typischerweise unglücklich. [1]" },
    ],
    mistakes: ["Handy in Reichweite lassen.", "Zu große Ziele am Anfang.", "Das Abschweifen mit Selbstvorwürfen bestrafen (Vorschlag)."],
    safety: ["Bei starken, anhaltenden Konzentrationsstörungen ärztliche Abklärung. (Vorsichtsregel, keine Leitlinie)"],
    conflicts: ["Die im Netz kursierende Aussage, die Aufmerksamkeitsspanne sei auf wenige Sekunden gesunken, habe ich nicht in einer geprüften Quelle gefunden.", "Die Multitasking-Studie zeigt Zusammenhänge; die Richtung der Ursache ist offen. [3]"],
    videos: [
      { title: "The New Science of Finding Focus & Fighting Distraction | Gloria Mark | Talks at Google", id: "jqqTInqdGCE", channel: "Talks at Google", why: "Vortrag einer Aufmerksamkeitsforscherin.", checked: true },
    ],
    videoNote: "Nur ein Video eingetragen, nach Titel beurteilt.",
    sources: [SRC_KILLINGS, SRC_MRAZEK, SRC_OPHIR],
  },

  "Echter Fokus": {
    date: DATE,
    steckbrief: {
      about: "Konzentriert an einer Sache bleiben, statt ständig zu wechseln. Der Name verweist auf eine Person, deren Methode ich nicht geprüft habe; hier steht, was die Forschung zu Fokus allgemein sagt.",
      why: "Ablenkung und Abschweifen sind die häufigsten Gegner von Fokus; beides lässt sich beeinflussen.",
      tips: "Eine Sache zur Zeit, Störquellen weg, feste Zeit. Kurze Achtsamkeitsübung vor der Arbeit (Vorschlag, gestützt durch [2]).",
      safety: "Bei starken Konzentrationsproblemen ärztlich abklären lassen (Vorsichtsregel).",
    },
    learn: [
      "Menschen denken fast so oft an Nicht-Gegenwärtiges wie an das Gegenwärtige; das macht typischerweise unglücklich. [1]",
      "Ein zweiwöchiger Achtsamkeitskurs verringerte das Abschweifen und verbesserte Leseverständnis und Arbeitsgedächtnis in einer randomisierten Studie. [2]",
      "Häufiges Medien-Multitasking hängt mit größerer Anfälligkeit für Störreize zusammen. [3]",
    ],
    evidence: { level: "teilweise", why: "Einzelne Studien stützen Achtsamkeit und weniger Multitasking; eine bestimmte Fokus-Methode habe ich nicht geprüft." },
    steps: [
      "Einen Zeitblock festlegen und eine Aufgabe wählen.",
      "Störquellen entfernen.",
      "Abschweifen bemerken und zurückkehren.",
      "Nach dem Block kurz pausieren.",
    ],
    plan: [
      { title: "Woche 1–2", text: "Täglich ein 20-Minuten-Block." },
      { title: "Woche 3–4", text: "Block erweitern, zwei Blöcke pro Tag (Vorschlag)." },
    ],
    myths: [
      { myth: "Fokus ist Willenskraft allein.", fact: "In einer Studie reichte schon ein zweiwöchiger Kurs, um Abschweifen zu verringern; die Umgebung (Störreize) spielt laut Multitasking-Befund mit. [2][3]" },
    ],
    mistakes: ["Viele Ziele gleichzeitig.", "Ständig Nachrichten prüfen.", "Keine Pausen."],
    safety: ["Bei anhaltenden Problemen ärztlich abklären. (Vorsichtsregel)"],
    conflicts: ["Die Methode „Henry Hildebrand“ konnte ich nicht in einer seriösen Quelle finden; daher bleibt sie ungeprüft."],
    videos: [],
    videoNote: "Kein Video eingetragen: Zum Namen im Titel habe ich keine geprüfte Quelle gefunden.",
    sources: [SRC_KILLINGS, SRC_MRAZEK, SRC_OPHIR],
  },

  "Mentale Stärke": {
    date: DATE,
    steckbrief: {
      about: "Die Fähigkeit, bei Druck und Rückschlägen dranzubleiben. In der Forschung vor allem im Sport untersucht und meist per Fragebogen gemessen.",
      why: "Eine Übersichtsarbeit fand, dass Trainingsprogramme mentale Stärke bei Sportlern steigern können, aber mit hohem Verzerrungsrisiko.",
      tips: "Kleine, wiederholte Herausforderungen und Rückschau auf eigene Fortschritte (Vorschlag). Nicht gleichsetzen mit Schmerzen ignorieren.",
      safety: "Mentale Stärke heißt nicht, Warnsignale des Körpers zu übergehen. Bei Schmerzen, Schwindel oder Brustschmerz abbrechen (Vorsichtsregel).",
    },
    learn: [
      "Eine systematische Übersichtsarbeit mit 12 Studien (2005 bis 2019) untersuchte Maßnahmen zum Training mentaler Stärke im Sport. Die Interventionen waren überwiegend psychologisch; 75 % der Studien maßen mentale Stärke per Selbstauskunft. [1]",
      "Die Metaanalyse über 10 Studien zeigte einen großen Effekt (d = 0,80; 95-%-Konfidenzintervall 0,30 bis 1,28). Das Verzerrungsrisiko war aber in den meisten (75 %) Studien hoch. Die Autoren raten, Programme mit Blick auf die Gültigkeit der Forschung zu wählen. [1]",
      "Eine Metaanalyse zu Wachstumsdenken (Growth Mindset) fand bei Teilgruppen mit hoher Umsetzungstreue kleine Effekte, etwa d = 0,14 bei Schulleistung und d = 0,32 bei psychischer Gesundheit, mit großer Streuung. [2]",
    ],
    evidence: { level: "teilweise", why: "Es gibt Metaanalysen mit großem Effekt, aber kleine, qualitativ schwache Einzelstudien und Selbstauskünfte." },
    steps: [
      "Ein überschaubares Ziel setzen.",
      "Rückschläge als Information notieren, nicht als Urteil (Vorschlag).",
      "Wiederholt in etwas unbequemen, aber sicheren Situationen üben.",
      "Fortschritte regelmäßig festhalten.",
    ],
    plan: [
      { title: "Woche 1–4", text: "Wöchentlich eine bewusste, kleine Herausforderung; nach jeder kurz auswerten (Vorschlag)." },
    ],
    myths: [
      { myth: "Mentale Stärke ist angeboren.", fact: "Die Übersicht fand Wirkung von Trainingsprogrammen, wenn auch mit hohem Verzerrungsrisiko. [1]" },
      { myth: "Wachstumsdenken wirkt bei allen stark.", fact: "Die Effekte sind klein und streuen deutlich. [2]" },
    ],
    mistakes: ["Warnsignale ignorieren.", "Nur auf Willen setzen.", "Zu große Schritte."],
    safety: ["Körperliche Warnsignale ernst nehmen. (Vorsichtsregel)"],
    conflicts: ["Die großen Effekte beruhen auf Studien mit hohem Verzerrungsrisiko und Selbstauskünften. [1]"],
    videos: [],
    videoNote: "Keine Videos eingetragen: Ich habe kein Video gefunden, das ich nach Titel und Kanal als fachlich verlässlich einstufen konnte.",
    sources: [
      { title: "Stamatis et al. 2020, BMJ Open Sport & Exercise Medicine – Developing and training mental toughness in sport: a systematic review and meta-analysis", url: PM("32577300"), kind: "Metaanalyse" },
      { title: "Burnette et al. 2023, Psychological Bulletin – A systematic review and meta-analysis of growth mindset interventions", url: PM("36227318"), kind: "Metaanalyse" },
    ],
  },

  "40-%-Regel": {
    date: DATE,
    steckbrief: {
      about: "Die Behauptung von David Goggins: Wenn der Kopf sagt, dass man nicht mehr kann, sei man erst bei etwa 40 % seiner Leistungsfähigkeit. Es ist eine Motivationsregel, keine gemessene Größe.",
      why: "Anstrengung und Ermüdung entstehen nicht nur im Muskel, sondern auch im Gehirn. Das macht den Gedanken plausibel, dass das Gefühl „Schluss“ nicht die absolute Grenze ist; die Zahl 40 % ist aber nicht belegt.",
      tips: "Als Gedankenstütze nutzen: Bei Müdigkeit eine kleine, sichere Zugabe versuchen. Nie bei Schmerz, Schwindel oder Brustenge.",
      safety: "Bei Brustschmerz, Atemnot, Schwindel oder starken Schmerzen sofort aufhören. Wer krank, verletzt oder untrainiert ist, soll vorher ärztlich nachfragen. (Vorsichtsregel, keine Leitlinie)",
    },
    learn: [
      "In einer randomisierten Crossover-Studie mit 16 Personen verkürzte geistige Ermüdung (90 Minuten anspruchsvolle Aufgabe) die Zeit bis zur Erschöpfung beim Radfahren (640 s statt 754 s). Die Teilnehmenden empfanden dieselbe Belastung als anstrengender; körperliche Messwerte änderten sich kaum. [1]",
      "Ein Fachartikel beschreibt Ermüdung als vom Gehirn erzeugtes Gefühl, das Belastung steuert, um den Körper vor Schaden zu schützen. [2]",
      "Daraus lässt sich nicht ableiten, dass man bei „40 %“ aufhört. Die Zahl 40 % habe ich in keiner wissenschaftlichen Quelle gefunden. (Einordnung)",
    ],
    evidence: { level: "kaum", why: "Dass Anstrengungsempfinden von Kopf und Ermüdung abhängt, ist belegt; die konkrete 40-%-Regel ist nicht untersucht." },
    steps: [
      "Eine sichere, kontrollierte Belastung wählen (z. B. Gehen, Laufen).",
      "Wenn der Kopf „Schluss“ sagt, kurz prüfen: Schmerz, Schwindel, Atemnot? Dann aufhören.",
      "Sonst eine kleine Zugabe (z. B. fünf Minuten) versuchen.",
      "Danach ausruhen und aufschreiben, wie es ging.",
    ],
    plan: [
      { title: "Woche 1–4", text: "Wöchentlich ein bis zwei Einheiten mit kleiner Zugabe; nie am Stück eskalieren (Vorschlag)." },
    ],
    myths: [
      { myth: "Man nutzt nur 40 % seiner Kraft, wenn der Kopf aufgibt.", fact: "Die Zahl ist nicht belegt; Studien zeigen nur, dass mentale Ermüdung das Anstrengungsempfinden erhöht. [1][2]" },
      { myth: "Der Körper ist nie am Limit.", fact: "Die Regelung der Ermüdung dient laut Fachartikel dem Schutz des Körpers. [2]" },
    ],
    mistakes: ["Warnzeichen ignorieren.", "Zu schnell steigern.", "Mit zu wenig Pause."],
    safety: ["Aufhören bei Brustschmerz, Atemnot, Schwindel, starken Schmerzen. (Vorsichtsregel, keine Leitlinie)"],
    conflicts: ["Die Idee wird in Videos verbreitet, aber ich habe keine Studie dazu gefunden. [1][2]"],
    videos: [
      { title: "\"I Quit Being Soft — The 40% Rule Explained (Goggins Mentality Documentary)\"", id: "U3Eax16FDUE", channel: "KineTox", why: "Erklärung der Regel aus der Sicht von Goggins' Anhängern; kein wissenschaftlicher Beleg.", checked: true },
    ],
    videoNote: "Nur ein Motivationsvideo eingetragen, nach Titel beurteilt. Ein wissenschaftliches Video zur Regel habe ich nicht gefunden.",
    sources: [
      { title: "Marcora, Staiano & Manning 2009, Journal of Applied Physiology – Mental fatigue impairs physical performance in humans", url: PM("19131473"), kind: "Studie" },
      { title: "Noakes 2012, Frontiers in Physiology – Fatigue is a Brain-Derived Emotion that Regulates the Exercise Behavior to Ensure the Protection of Whole Body Homeostasis", url: PM("22514538"), kind: "Übersichtsarbeit" },
    ],
  },

  "Gefühle regulieren": {
    date: DATE,
    steckbrief: {
      about: "Gefühle beeinflussen, indem man die Situation neu bewertet, sich ablenkt oder den Ausdruck zügelt. Nicht alle Strategien wirken gleich gut.",
      why: "Eine Metaanalyse aus 306 Vergleichen zeigt, dass Umdeuten (kognitive Veränderung) mittlere Wirkung hat und Ablenken ebenfalls hilft; das Unterdrücken des Erlebens hilft nicht.",
      tips: "Umdenken, indem man die Situation aus anderer Sicht betrachtet; kurze Ablenkung ist ebenfalls hilfreich. Gefühle nicht einfach wegdrücken.",
      safety: "Bei anhaltender Niedergeschlagenheit, Angst oder Gedanken an Selbstschädigung Hilfe suchen (Hausarzt, Telefonseelsorge). (Vorsichtsregel)",
    },
    learn: [
      "Eine Metaanalyse (306 Vergleiche) fand unterschiedliche Wirkung je nach Strategie: Aufmerksamkeitslenkung insgesamt keine (d = 0,00), Reaktionssteuerung klein (d = 0,16), kognitive Veränderung klein bis mittel (d = 0,36). [1]",
      "Innerhalb der Gruppen gab es Unterschiede: Ablenkung half (d = 0,27), Konzentration auf das Gefühl nicht (d = −0,26). Den Ausdruck des Gefühls zu unterdrücken half (d = 0,32), das Erleben oder die Gedanken zu unterdrücken nicht (d = −0,04 bzw. −0,12). [1]",
      "Umdeuten des Reizes wirkte (d = 0,36), Perspektivwechsel am stärksten (d = 0,45); das Umdeuten der eigenen Reaktion weniger (d = 0,23). [1]",
      "Gross beschreibt Umdeuten (reappraisal) als frühe Strategie, die Erleben und Ausdruck verringert, und Unterdrücken als späte, die das Erleben nicht senkt. [2]",
    ],
    evidence: { level: "gut", why: "Metaanalyse mit 306 Vergleichen; die Befunde stammen überwiegend aus Laborstudien." },
    steps: [
      "Das Gefühl benennen („Ärger“, „Angst“).",
      "Überlegen: Wie sähe jemand anderes die Situation? (Perspektivwechsel)",
      "Bei Bedarf kurz ablenken (Spaziergang, Aufgabe).",
      "Später in Ruhe darüber nachdenken oder sprechen.",
    ],
    plan: [
      { title: "Woche 1–2", text: "Einmal täglich eine Situation neu deuten; Notiz mit zwei Sätzen (Vorschlag)." },
      { title: "Woche 3–4", text: "Perspektivwechsel in einer echten Ärger-Situation ausprobieren (Vorschlag, gestützt durch [1])." },
    ],
    myths: [
      { myth: "Gefühle wegdrücken ist gesund.", fact: "Das Unterdrücken von Erleben und Gedanken hatte in der Metaanalyse keine Wirkung. [1][2]" },
      { myth: "Sich auf das Gefühl zu konzentrieren hilft immer.", fact: "Konzentration auf das Gefühl hatte einen negativen Effekt (d = −0,26). [1]" },
    ],
    mistakes: ["Das Gefühl verdrängen.", "Nur grübeln.", "Eine Strategie für jede Lage verwenden."],
    safety: ["Hilfe suchen bei anhaltender Belastung. (Vorsichtsregel)"],
    conflicts: ["Die Wirkung hängt von Gefühl, Häufigkeit und Studienbedingungen ab. [1]"],
    videos: [
      { title: "Emotion Regulation with James J. Gross, PhD", id: "Yd6hR1qCfSM", channel: "American Psychological Association", why: "Vortrag des Forschers zum Prozessmodell.", checked: true },
      { title: "Struggling with Negative Thoughts? Try Dr. James Gross' Reframing Technique! | Dealing With Feelings | Marc Brackett", id: "-NAVwJy6ugc", channel: "Marc Brackett", why: "Kurzer Ausschnitt zum Umdeuten.", checked: true },
    ],
    videoNote: "Nur zwei Videos eingetragen, beide nur nach Titel beurteilt.",
    sources: [
      SRC_WEBB,
      { title: "Gross 2002, Psychophysiology – Emotion regulation: affective, cognitive, and social consequences", url: PM("12212647"), kind: "Übersichtsarbeit" },
    ],
  },

  "Mit Ablehnung umgehen": {
    date: DATE,
    steckbrief: {
      about: "Mit Zurückweisung umgehen, ohne sich davon bestimmen zu lassen. Ablehnung schmerzt tatsächlich; Umdeuten und Perspektivwechsel können helfen.",
      why: "Eine Bildgebungsstudie zeigte, dass soziale Ausgrenzung im Gehirn ähnlich wie körperlicher Schmerz verarbeitet wird. Wer sie neu bewertet, kann ihre Wirkung abschwächen.",
      tips: "Den Schmerz zulassen, die Situation von außen betrachten (Perspektivwechsel) und die Ablehnung nicht als Urteil über die ganze Person nehmen (Vorschlag).",
      safety: "Bei anhaltender Niedergeschlagenheit, sozialem Rückzug oder Gedanken an Selbstschädigung Hilfe suchen. (Vorsichtsregel)",
    },
    learn: [
      "Eine Bildgebungsstudie zu sozialer Ausgrenzung (virtuelles Ballspiel): Beim Ausgeschlossenwerden war der anteriore cinguläre Kortex stärker aktiv, parallel zu Befunden bei körperlichem Schmerz; die Aktivität hing mit dem Leiden zusammen. Der rechte ventrale präfrontale Kortex hing negativ mit dem Leiden zusammen, die Autoren sehen darin eine Regulation. [1]",
      "Zum Umgang mit Emotionen allgemein: Umdeuten des Reizes und Perspektivwechsel hatten kleine bis mittlere Wirkung (d = 0,36 bzw. d = 0,45); Konzentration auf das Gefühl nicht. [2]",
      "Ob Übungen, sich bewusst Ablehnung auszusetzen, helfen (bekannt aus Videos), habe ich nicht in einer Studie gefunden. (Einordnung)",
    ],
    evidence: { level: "teilweise", why: "Dass Ablehnung schmerzt, ist neurowissenschaftlich beschrieben, und Umdeuten wirkt allgemein; zu Training gegen Ablehnungsangst habe ich keine Studie gelesen." },
    steps: [
      "Den Schmerz benennen, nicht verdrängen.",
      "Fragen: Wie würde ich einer Freundin oder einem Freund die Situation erklären?",
      "Eine mögliche Lehre aufschreiben (Vorschlag).",
      "Danach etwas tun, das stärkt (Gespräch, Bewegung).",
    ],
    plan: [
      { title: "Woche 1–2", text: "Nach jeder Zurückweisung zwei Sätze Notiz (Was passierte? Wie sehe ich es von außen?) (Vorschlag)." },
      { title: "Woche 3–4", text: "Kleine, sichere Anfragen stellen, bei denen ein „Nein“ möglich ist (Vorschlag)." },
    ],
    myths: [
      { myth: "Ablehnung sollte einem nichts ausmachen.", fact: "Die Studie zeigt, dass Ausgrenzung im Gehirn ähnlich wie Schmerz verarbeitet wird. [1]" },
    ],
    mistakes: ["Das Gefühl verdrängen.", "Die Ablehnung auf die ganze Person beziehen.", "Sich zurückziehen."],
    safety: ["Hilfe suchen bei anhaltender Belastung. (Vorsichtsregel)"],
    conflicts: ["Die Studie war ein kleines Laborexperiment; die Übertragung auf den Alltag ist offen. [1]"],
    videos: [
      { title: "What I Learned from 100 Days of Rejection | Jia Jiang | TED", id: "-vZXgApsPCQ", channel: "TED", why: "Persönlicher Erfahrungsbericht, kein wissenschaftlicher Beleg.", checked: true },
    ],
    videoNote: "Nur ein Erfahrungsvideo eingetragen, nach Titel beurteilt.",
    sources: [
      { title: "Eisenberger, Lieberman & Williams 2003, Science – Does rejection hurt? An fMRI study of social exclusion", url: PM("14551436"), kind: "Studie" },
      SRC_WEBB,
    ],
  },

  "Gern allein sein": {
    date: DATE,
    steckbrief: {
      about: "Zeit allein gut aushalten und sinnvoll nutzen. In einem Tagebuch-Experiment war es entscheidend, ob die Zeit allein selbst gewählt war.",
      why: "Allein zu sein kann einsam machen, aber auch weniger gestresst. Die Studie fand keine feste ideale Menge, aber einen Unterschied zwischen gewählter und aufgezwungener Zeit.",
      tips: "Allein-Zeit bewusst wählen und nicht aus Vermeidung. Wenn man sich einsam fühlt, Kontakt suchen.",
      safety: "Bei anhaltender Einsamkeit, Niedergeschlagenheit oder Gedanken an Selbstschädigung Hilfe suchen. (Vorsichtsregel)",
    },
    learn: [
      "In einer 21-tägigen Tagebuchstudie (178 Personen) gab es keine allgemein „richtige“ Balance zwischen Alleinsein und Geselligkeit. An Tagen mit mehr Alleinsein waren die Personen einsamer und weniger zufrieden; dies war abgeschwächt oder aufgehoben, wenn das Alleinsein selbstbestimmt war. [1]",
      "An Tagen mit mehr Alleinsein fühlten sich die Personen außerdem weniger gestresst und selbstbestimmter; die Autoren folgern, dass Alleinsein Vor- und Nachteile hat. [1]",
      "Bei älteren Paaren hing gewünschte Allein-Zeit mit mehr positivem Gefühl zusammen, belastende Allein-Zeit mit mehr negativem. [2]",
    ],
    evidence: { level: "teilweise", why: "Es gibt einzelne Tagebuchstudien mit gemischten Ergebnissen; Wirkung von Übungen zum Gernalleinsein ist nicht untersucht." },
    steps: [
      "Allein-Zeit bewusst einplanen (z. B. 30 Minuten) statt sie nur zu erleiden.",
      "Etwas wählen, das man gern allein tut (Spaziergang, Lesen, Hobby).",
      "Danach kurz notieren, wie es sich anfühlte.",
      "Wenn es sich einsam anfühlt, Kontakt aufnehmen.",
    ],
    plan: [
      { title: "Woche 1–4", text: "Zweimal pro Woche 30 Minuten selbst gewählte Zeit allein; Notiz zur Stimmung (Vorschlag, gestützt durch [1])." },
    ],
    myths: [
      { myth: "Allein sein ist immer schlecht.", fact: "Laut Studie hängt es davon ab, ob es gewählt ist; es gab auch weniger Stress. [1]" },
      { myth: "Allein sein ist immer gut.", fact: "An Tagen mit mehr Alleinsein waren Personen einsamer und weniger zufrieden. [1]" },
    ],
    mistakes: ["Alleinsein als Rückzug nutzen, obwohl man Kontakt braucht.", "Nur passiv sein.", "Zu lange am Stück."],
    safety: ["Bei anhaltender Einsamkeit Hilfe suchen. (Vorsichtsregel)"],
    conflicts: ["Die Studien liefern gemischte Ergebnisse; es gibt keine feste Idealmenge. [1]"],
    videos: [],
    videoNote: "Keine Videos eingetragen: Ich habe kein Video gefunden, das ich als fachlich verlässlich einstufen konnte.",
    sources: [
      { title: "Weinstein, Vuorre, Adams et al. 2023, Scientific Reports – Balance between solitude and socializing: everyday solitude time both benefits and harms well-being", url: PM("38052821"), kind: "Studie" },
      { title: "Zambrano Garza et al. 2024, Applied Psychology: Health and Well-Being – Daily solitude and well-being associations in older dyads", url: PM("37740540"), kind: "Studie" },
    ],
  },

  "Gewohnheiten aufbauen": {
    date: DATE,
    steckbrief: {
      about: "Ein Verhalten so oft in gleicher Situation wiederholen, bis es automatisch läuft. Es dauert länger als die populären 21 Tage.",
      why: "In einer Studie mit 96 Personen brauchte es von 18 bis 254 Tage, bis ein Verhalten sein Automatik-Maximum erreichte; ein verpasster Tag schadete nicht wesentlich.",
      tips: "Ein Verhalten an eine feste Situation koppeln („nach dem Frühstück“) und täglich tun. Wenn ein Tag ausfällt, einfach weitermachen.",
      safety: "Keine.",
    },
    learn: [
      "96 Freiwillige wählten ein Ess-, Trink- oder Bewegungsverhalten und führten es 12 Wochen täglich im gleichen Kontext aus (z. B. nach dem Frühstück). Die Automatik stieg wie eine Kurve, die sich einem Maximum nähert. [1]",
      "Bis 95 % des Maximums dauerte es zwischen 18 und 254 Tagen. Ein einmal verpasstes Mal beeinflusste die Gewohnheitsbildung nicht wesentlich. [1]",
      "Eine Metaanalyse zu Handlungsplänen („Wenn X, dann Y“) für körperliche Aktivität fand bei Erwachsenen einen kleinen Effekt (0,25; 95-%-Konfidenzintervall 0,05 bis 0,45) zugunsten der Gruppe mit verstärkten Handlungsplänen. [2]",
    ],
    evidence: { level: "teilweise", why: "Eine Beobachtungsstudie mit 82 auswertbaren Personen und eine Metaanalyse mit kleinem Effekt; die Spanne ist groß." },
    steps: [
      "Ein kleines Verhalten wählen (z. B. ein Glas Wasser).",
      "Eine feste Situation dafür bestimmen („nach dem Zähneputzen“).",
      "Einen Handlungsplan formulieren: „Wenn ich X tue, mache ich Y.“",
      "Täglich tun; ein verpasster Tag ist kein Neustart.",
    ],
    plan: [
      { title: "Woche 1–4", text: "Täglich dasselbe kleine Verhalten im gleichen Kontext. [1]" },
      { title: "Woche 5–12", text: "Beibehalten; die Studie lief 12 Wochen. [1]" },
      { title: "Danach", text: "Einordnen, ob es automatisch läuft; je nach Verhalten kann es länger dauern. [1]" },
    ],
    myths: [
      { myth: "Eine Gewohnheit entsteht in 21 Tagen.", fact: "In der Studie dauerte es zwischen 18 und 254 Tagen. [1]" },
      { myth: "Ein verpasster Tag ruiniert alles.", fact: "Ein einmal verpasstes Mal hatte keinen wesentlichen Einfluss. [1]" },
    ],
    mistakes: ["Zu großes Verhalten wählen.", "Keine feste Situation festlegen.", "Nach einem verpassten Tag aufgeben."],
    safety: ["Keine."],
    conflicts: ["Die Spanne (18 bis 254 Tage) ist groß, und für komplexe Verhaltensweisen gibt die Studie keine feste Dauer an. [1]"],
    videos: [
      { title: "The Science of Making & Breaking Habits", id: "Wcs2PFz5q6g", channel: "Andrew Huberman", why: "Langer Überblick eines Neurowissenschaftlers.", checked: true },
    ],
    videoNote: "Nur ein Video eingetragen, nach Titel beurteilt.",
    sources: [
      { title: "Lally, van Jaarsveld, Potts & Wardle 2010, European Journal of Social Psychology – How are habits formed: Modelling habit formation in the real world", url: "https://doi.org/10.1002/ejsp.674", kind: "Studie" },
      { title: "Silva et al. 2018, PLoS ONE – Impact of implementation intentions on physical activity practice in adults: a systematic review and meta-analysis of randomized clinical trials", url: PM("30427874"), kind: "Metaanalyse" },
    ],
  },
};
