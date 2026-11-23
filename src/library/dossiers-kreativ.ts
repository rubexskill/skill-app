import type { Dossier } from "./dossiers";

// Kategorie „Kreativ & Alltag“.
// Recherchiert am 23. November 2026. Studien über Europe PMC geprüft (Titel, Autoren, Abstract); Aussagen stehen nur, wenn sie im Abstract stehen.
const DATE = "23. November 2026";
const PM = (id: string) => `https://pubmed.ncbi.nlm.nih.gov/${id}/`;

export const DOSSIERS_KREATIV: Record<string, Dossier> = {
  "Absolutes Gehör": {
    date: DATE,
    steckbrief: {
      about: "Absolutes Gehör heißt, einen Ton ohne Vergleichston benennen zu können. Als Training üben Erwachsene am Computer, einzelne Töne zu erkennen und zu benennen.",
      why: "In einer achtwöchigen Online-Studie lernten zwölf Musikerinnen und Musiker nach durchschnittlich 21,4 Stunden im Mittel 7 Töne mit mindestens 90 % Trefferquote zu benennen. Die Spanne war groß (3 bis 12 Töne).",
      tips: "Mit wenigen Tönen beginnen (zuerst ein einzelner, z. B. C), kurz und oft üben, verschiedene Instrumente und Oktaven mischen, damit nicht nur die Tonhöhe, sondern die Tonfarbe gelernt wird.",
      safety: "Kopfhörer nicht laut stellen (Vorsichtsregel, keine Leitlinie).",
    },
    learn: [
      "Lange galt absolutes Gehör als angeboren und nur in früher Kindheit erlernbar. Eine Studie mit einem 8-wöchigen Online-Training bei Erwachsenen spricht dagegen: Die Teilnehmenden verbesserten die Trefferquote beim Benennen von Tönen um 128 % (von 0,139 auf 0,317) und verkleinerten den mittleren Fehler von 2,62 auf 1,50 Halbtöne. [1]",
      "Das Gelernte übertrug sich nur teilweise auf ein nicht trainiertes Instrument. [1] In einer weiteren Studie lernten Teilnehmende schnell, den Ton C von anderen zu unterscheiden, auch ohne Rückmeldung; die Übertragung auf eine höhere Oktave war am schwächsten, was darauf hindeutet, dass sie auch auf die Tonhöhe („hoch/tief“) und nicht nur auf die Tonklasse achteten. [2]",
      "Schon früher zeigten Ross und Kollegen, dass absolutes Gehör nicht von frühem Musikunterricht abhängen muss: Sie fanden eine Person ohne musikalische Ausbildung, die es offenbar besaß. [3]",
    ],
    evidence: { level: "teilweise", why: "Training verbessert das Benennen von Tönen messbar, aber die Studien sind klein (z. B. 12 Personen) und es ist offen, ob dabei echtes absolutes Gehör entsteht oder Hilfsstrategien." },
    steps: [
      "Eine Übungs-App oder ein Online-Programm wählen, das einzelne Töne spielt und sofort Rückmeldung gibt.",
      "Mit einem oder zwei Tönen beginnen, erst bei sicherer Erkennung weitere ergänzen.",
      "Verschiedene Klangfarben und Oktaven einsetzen. [1][2]",
      "Kurz üben, aber regelmäßig (Vorschlag).",
      "Fortschritt alle zwei Wochen mit neuen, ungeübten Tönen testen.",
    ],
    plan: [
      { title: "Woche 1–2", text: "Täglich 10 Minuten, nur zwei Töne, ein Instrument." },
      { title: "Woche 3–8", text: "Weitere Töne und zweites Instrument ergänzen. Die Studie dauerte acht Wochen mit rund 21 Stunden Übung insgesamt. [1]" },
    ],
    myths: [
      { myth: "Absolutes Gehör kann man nur als Kind erwerben.", fact: "Ein achtwöchiges Training bei Erwachsenen verbesserte die Töne-Erkennung deutlich; ob das volles absolutes Gehör ist, ist umstritten. [1]" },
      { myth: "Wer trainiert, erkennt danach alle zwölf Töne sicher.", fact: "Im Mittel wurden etwa 7 Töne mit 90 % Genauigkeit erreicht; einzelne Personen schafften nur 3. [1]" },
    ],
    mistakes: ["Nur mit einem Instrument üben, wodurch man den Klang statt der Tonhöhe lernt. [1][2]", "Ohne Rückmeldung üben.", "Zu viele Töne auf einmal."],
    safety: ["Nur moderate Lautstärke, besonders mit Kopfhörern (Vorsichtsregel, keine Leitlinie)."],
    conflicts: ["Es ist umstritten, ob Training echtes absolutes Gehör erzeugt oder Teilleistungen wie Tonhöhen- oder Relativgehör-Strategien. Das Abstract der Wong-Studie nennt diese Einwände ausdrücklich. [1][2]"],
    videos: [],
    videoNote: "Kein geprüftes Video eingebunden (Recherche in dieser Sitzung nicht abgeschlossen).",
    sources: [
      { title: "Wong et al. 2025, Psychonomic Bulletin & Review – Learning fast and accurate absolute pitch judgment in adulthood", url: PM("39937381"), kind: "Studie" },
      { title: "Bongiovanni et al. 2023, Attention, Perception & Psychophysics – Generalizing across tonal context, timbre, and octave in rapid absolute pitch training", url: PM("36690914"), kind: "Studie" },
      { title: "Ross, Olson & Gore 2003, Annals of the New York Academy of Sciences – Absolute pitch does not depend on early musical training", url: PM("14681178"), kind: "Studie" },
    ],
  },

  "Kehlkopfgesang": {
    date: DATE,
    steckbrief: {
      about: "Obertongesang (z. B. mongolisch „Khoomei“): Man singt einen tiefen, gleichbleibenden Grundton und formt dazu im Mundraum hohe, flötenartige Obertöne, sodass zwei Tonhöhen gleichzeitig zu hören sind.",
      why: "Akustische Studien erklären die Technik vollständig mit der Quelle-Filter-Theorie der Stimme: Der Oberton entsteht, weil der Mundraum Resonanzen eng zusammenschiebt. Das macht die Technik nachvollziehbar und damit prinzipiell erlernbar.",
      tips: "Mit einem gleichmäßigen, entspannten Grundton beginnen und die Zungenstellung langsam verändern, dabei auf die hohen Töne horchen. Kurze Einheiten, viel Pausen, Aufnahmen anhören (Vorschlag).",
      safety: "Stimme nicht pressen: Bei Heiserkeit, Kratzen oder Schmerz aufhören und pausieren (Vorsichtsregel, keine Leitlinie).",
    },
    learn: [
      "Beim Obertongesang entstehen zwei Töne zugleich: ein tiefer, durchgehender Grundton und eine Melodie auf stark verstärkten hohen Obertönen. Eine Fallstudie mit Messung der Stimmquelle, dynamischem MRT des Mundraums und Lippenvideo fand, dass die Verstärkung durch ein enges Beieinanderliegen der Formanten F2 und F3 entsteht. [1]",
      "Bei tiefen Obertönen war die Zungenspitze angehoben und stark zurückgezogen, bei hohen weniger zurückgezogen mit längerer Engstelle; die Zungenform wechselte also von vorn nach hinten. Die Studie schließt, dass diese Art Obertongesang vollständig durch die bekannte Quelle-Filter-Theorie erklärbar ist. [1]",
      "Eine ältere akustische Studie beschrieb eine feste, relativ lange Schließung der Stimmritze während des Obertongesangs; Zuhörende nahmen die Obertöne anders wahr als normal gesungene Vokale. [2]",
      "Es sind Beschreibungen einzelner Sängerinnen und Sänger. Belege für Gesundheitswirkungen oder für wirksame Lernmethoden habe ich in dieser Recherche nicht gefunden.",
    ],
    evidence: { level: "kaum", why: "Die Akustik ist gut beschrieben (Fallstudien), aber zu Lernmethoden, Lernerfolg oder Wirkungen auf Gesundheit fand ich keine Studien." },
    steps: [
      "Locker stehen oder sitzen, Kiefer entspannt.",
      "Einen tiefen, gleichmäßigen Grundton auf „a“ oder „o“ singen.",
      "Die Zungenspitze leicht anheben und zurückführen, bis ein hoher Nebenton hörbar wird. [1]",
      "Langsam die Zungenstellung verändern und beobachten, wie der Oberton wandert. [1]",
      "Nach 5 Minuten Pause; Stimme schonen.",
    ],
    plan: [
      { title: "Woche 1–2", text: "Täglich 5 Minuten Grundton halten und die Zungenstellung ausprobieren (Vorschlag)." },
      { title: "Danach", text: "Ein einfaches Obertonmuster von tief nach hoch wiederholen; Aufnahmen vergleichen (Vorschlag)." },
    ],
    myths: [
      { myth: "Obertongesang ist Magie oder Kehlkopf-Trick.", fact: "Die Töne entstehen durch Resonanzen im Mundraum und lassen sich mit der Quelle-Filter-Theorie erklären. [1][2]" },
    ],
    mistakes: ["Den Grundton pressen.", "Zu lange am Stück üben.", "Auf Obertöne drängen statt Zungenstellung zu erforschen."],
    safety: ["Bei Schmerz oder anhaltender Heiserkeit pausieren und ärztlich abklären lassen (Vorsichtsregel, keine Leitlinie)."],
    conflicts: ["Die Studien beschreiben verschiedene Obertonstile mit unterschiedlichen Formantmustern; die Fallstudie 2023 betrifft nur einen Sänger. [1][2]"],
    videos: [],
    videoNote: "Kein geprüftes Video eingebunden (Recherche in dieser Sitzung nicht abgeschlossen).",
    sources: [
      { title: "Sundberg, Lindblom & Hefele 2023, Logopedics Phoniatrics Vocology – Voice source, formant frequencies and vocal tract shape in overtone singing. A case study", url: PM("34860148"), kind: "Studie" },
      { title: "Bloothooft et al. 1992, Journal of the Acoustical Society of America – Acoustics and perception of overtone singing", url: PM("1401528"), kind: "Studie" },
    ],
  },
};
