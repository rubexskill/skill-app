import type { Dossier } from "./dossiers";

// Kategorie „Körper & Sport“ (Handstand halten steht in dossiers.ts).
// Recherchiert am 23. November 2026. Studien über PubMed geprüft (Titel, Autoren, Abstract); Aussagen stehen nur, wenn sie im Abstract oder auf der verlinkten Seite stehen.
// Nicht bearbeitet (keine ausreichend belegten Quellen gefunden): Moonwalk, Akka 3000, Beidhändigkeit, Mewing, 3 Hockey-Skills, Koordination, Dunken & Werfen.
const DATE = "23. November 2026";
const PM = (id: string) => `https://pubmed.ncbi.nlm.nih.gov/${id}/`;

export const DOSSIERS_KOERPER: Record<string, Dossier> = {
  "Rückwärtssalto": {
    date: DATE,
    steckbrief: {
      about: "Ein Salto rückwärts, hier auf dem Trampolin gelernt. Der Salto ist eine Turnfigur mit Absprung, Drehung in der Luft und Landung; Fehler bei der Landung sind die Hauptgefahr.",
      why: "Das Trampolin bietet Höhe und Zeit zum Üben. Gleichzeitig zeigen Verletzungsauswertungen, dass bei Trampolin, Tumbling und Akrobatik vor allem die unteren Gliedmaßen und Bänder betroffen sind.",
      tips: "Nur mit ausgebildeter Aufsicht, mit Sicherheitsnetz und Matten, immer nur eine Person auf dem Trampolin. Erst Grundübungen (Rückenlage-Sprünge, Überroller) sicher beherrschen. [3]",
      safety: "Schwere Verletzungen sind möglich. Nicht ohne Trainer, nicht auf dem Boden, nicht ohne Sicherung lernen. Dies ist eine Vorsichtsregel, keine Leitlinie.",
    },
    learn: [
      "Eine französische Auswertung (Grapton et al. 2013) sammelte über 5 Jahre 357 Verletzungsereignisse bei jungen Akrobaten (Trampolin, Tumbling, Akrobatik). Verletzt waren meist Athleten auf nationalem und internationalem Niveau; betroffen waren vorwiegend die unteren Gliedmaßen, besonders Bänder. Die Autoren sehen Landefehler, unvollständige oder falsche Figuren und den Landeuntergrund als mögliche Ursachen; Verhaltensfaktoren waren die wichtigste Verletzungsursache. [1]",
      "Eine Übersichtsarbeit zu Trampolinverletzungen (Esposito 2003) hält fest, dass mit der Verbreitung auch die Zahl der Notaufnahmebesuche stieg; ob das Risiko pro Übungsstunde zugenommen hat, ist unbekannt. [2]",
      "Zur Technik des Lernens selbst fand ich keine Studie. Die Lernreihenfolge stammt aus einem Trainervideo (ACON): Rückenlage-Sprünge, Sprünge gehockt auf dem Rücken, Überroller, dann der Salto; dazu Sicherheitsnetz, nur eine Person, kundige Aufsicht. Das ist Trainerwissen, keine Studie. [3]",
    ],
    evidence: {
      level: "kaum",
      why: "Es gibt Verletzungsauswertungen, aber keine Studie, die eine Lernmethode für den Salto vergleicht; die Lernschritte beruhen auf Trainererfahrung.",
    },
    steps: [
      "Einen Kurs oder Verein mit ausgebildetem Trainer suchen; ohne Aufsicht nicht üben. [3]",
      "Sprünge auf dem Rücken und gehockt auf dem Rücken, dann Überroller: erst sicher, dann weiter. [3]",
      "Salto nur mit Sicherung (Netz, Gurt oder Hilfestellung) des Trainers versuchen. (Vorschlag)",
    ],
    plan: [
      { title: "Hinweis", text: "Einen Übungsplan ohne Trainer gebe ich bewusst nicht. Die Reihenfolge der Vorübungen steht oben; das Tempo bestimmt der Trainer." },
    ],
    myths: [
      { myth: "Auf dem Trampolin kann nichts passieren.", fact: "Die Auswertungen zeigen Verletzungen vor allem an Bändern der unteren Gliedmaßen, besonders durch Landefehler. [1][2]" },
      { myth: "Nur Anfänger verletzen sich.", fact: "In der französischen Auswertung waren meist Athleten auf nationalem und internationalem Niveau betroffen. [1]" },
    ],
    mistakes: ["Salto ohne Vorübungen versuchen.", "Mehrere Personen gleichzeitig auf dem Trampolin. [3]", "Mitten in der Drehung zögern. (Einordnung aus Trainerhinweis, nicht belegt)"],
    safety: ["Sicherheitsnetz, Aufsicht und nur eine Person auf dem Trampolin. [3]", "Landefehler und die Unterlage sind Ursachen von Verletzungen. [1]", "Bei Schmerz nach Landung abklären lassen (Vorsichtsregel, keine Leitlinie)."],
    conflicts: ["Ob Trampolin riskanter ist als andere Freizeitsportarten, ist nach Esposito nicht geklärt, weil die Übungsstunden fehlen. [2]"],
    videos: [
      { title: "How to do a Backflip - Step by Step Trampoline Tutorial by ACON", id: "6CEURTWghwM", channel: "aconofficial", why: "Schrittweise Lernreihenfolge von einem Trampolinanbieter.", checked: true },
      { title: "ACON Trampoline trick safety tutorial 06 BACKFLIP", id: "HvH8fmbSrL8", channel: "aconofficial", why: "Sicherheitshinweise zum Backflip, laut Suchbeschreibung mit Netz.", checked: true },
    ],
    videoNote: "Beide Videos stammen von einem Trampolinhersteller (nicht neutral). Inhalt nur nach Titel und Suchbeschreibung beurteilt.",
    sources: [
      { title: "Grapton et al. 2013, Knee Surg Sports Traumatol Arthrosc – Specific injuries induced by the practice of trampoline, tumbling and acrobatic gymnastics", url: PM("22476523"), kind: "Studie" },
      { title: "Esposito 2003, Clin Orthop Relat Res – Trampoline injuries", url: PM("12671484"), kind: "Übersichtsarbeit" },
      { title: "ACON – How to do a Backflip, Step by Step Trampoline Tutorial", url: "https://www.youtube.com/watch?v=6CEURTWghwM", kind: "Trainer" },
    ],
  },

  "Sprints": {
    date: DATE,
    steckbrief: {
      about: "Kurze, maximal schnelle Läufe. Die größte Gefahr ist die Muskelzerrung in der Oberschenkelrückseite.",
      why: "Sprinten ist ein hartes Training für Schnelligkeit. Es belastet die Muskeln stark; Zerrungen der Oberschenkelrückseite gehören zu den häufigen Verletzungen bei Sprintsportarten.",
      tips: "Gut aufwärmen, vor dem vollen Tempo steigern, ausgeruht sprinten, bei Zwicken im Oberschenkel sofort aufhören. Exzentrisches Training der Oberschenkelrückseite senkte in Studien die Verletzungsrate. [2]",
      safety: "Nie kalt und ermüdet auf Maximaltempo. Bei Schmerz hinten im Oberschenkel stoppen. Vorsichtsregel, keine Leitlinie.",
    },
    learn: [
      "Zerrungen der Oberschenkelrückseite sind laut einem Übersichtsartikel häufig bei Sprint, Schuss und schnellen Bewegungen mit gestrecktem Knie und gebeugter Hüfte; knapp ein Drittel kehrt im ersten Jahr nach Rückkehr in den Sport wieder. [1]",
      "Eine Metaanalyse randomisierter Studien (108 Arbeiten, Rudisill 2023) fand: Exzentrisches Training senkte die Verletzungshäufigkeit um 56,8 bis 70,0 %. [2]",
      "Zur Frage „Sprinten bis zum Versagen“ (Titel des Skills) fand ich keine Studie. Maximale Sprints bis zur Erschöpfung zu wiederholen ist nicht belegt und erhöht vermutlich das Zerrungsrisiko (Einordnung, keine Quelle).",
    ],
    evidence: {
      level: "teilweise",
      why: "Prävention von Oberschenkelzerrungen ist durch eine Metaanalyse gestützt; zur optimalen Sprintdosis für Freizeitsportler fand ich nichts.",
    },
    steps: [
      "Locker 5–10 Minuten aufwärmen, dann Steigerungsläufe. (Vorschlag)",
      "3–5 Sprints mit 70–90 % Tempo, volle Pause dazwischen. (Vorschlag)",
      "Bei Zwicken im Oberschenkel aufhören.",
    ],
    plan: [
      { title: "Woche 1–2", text: "Einmal pro Woche 3 Steigerungsläufe à 40 m mit langer Pause. (Vorschlag)" },
      { title: "Woche 3–4", text: "Bis zu 5 Läufe, dazu ein Oberschenkel-Programm mit exzentrischen Übungen. [2] (Vorschlag)" },
    ],
    myths: [
      { myth: "Dehnen vor dem Sprint verhindert Zerrungen.", fact: "Die Metaanalyse fand für Dehnen vor allem Flexibilitätsgewinne; die Verletzungsrate senkte exzentrisches Training. [2]" },
    ],
    mistakes: ["Kalt starten.", "Bis zur Erschöpfung wiederholen.", "Mit Schmerz weitersprinten."],
    safety: ["Zerrungen kehren oft wieder, daher nicht zu früh zurückkehren. [1]", "Schmerz sofort ernst nehmen (Vorsichtsregel, keine Leitlinie)."],
    conflicts: ["Die Rehabilitationsliteratur ist auf Leistungssportler ausgerichtet; Aussagen für Freizeitsportler sind Übertragungen. [1]"],
    videos: [],
    videoNote: "Kein geprüftes Video gesucht oder gefunden.",
    sources: [
      { title: "Erickson & Sherry 2017, J Sport Health Sci – Rehabilitation and return to sport after hamstring strain injury", url: PM("30356646"), kind: "Übersichtsarbeit" },
      { title: "Rudisill et al. 2023, Am J Sports Med – Evidence-Based Hamstring Injury Prevention and Risk Factor Management: Systematic Review and Meta-analysis of RCTs", url: PM("35384731"), kind: "Metaanalyse" },
    ],
  },

  "Barfußtraining": {
    date: DATE,
    steckbrief: {
      about: "Gehen und Laufen ohne oder mit sehr flachen Schuhen, um Füße und Lauftechnik zu trainieren.",
      why: "Barfuß gewöhnt sich der Fuß an andere Belastung. Ein Nutzen für die Gesundheit ist nicht gesichert: Die Studienlage ist dünn.",
      tips: "Langsam steigern, auf sicherem, sauberem Untergrund. Nicht plötzlich den Laufstil ändern.",
      safety: "Schnittverletzungen, Scherben und Kälte vermeiden. Bei Fußschmerz Pause machen und abklären. Vorsichtsregel, keine Leitlinie.",
    },
    learn: [
      "Eine systematische Übersichtsarbeit (Hollander 2017, 15 Studien, 8399 Teilnehmende) verglich Menschen, die gewohnheitsmäßig barfuß leben, mit beschuhten. Barfuß Lebende hatten breitere, aber nicht kürzere Füße, einen geringeren Hallux-Winkel und weniger Beugung im Sprunggelenk beim Aufsetzen. [1]",
      "Es fanden sich keine Unterschiede in den relativen Verletzungsraten. Es gab begrenzte Evidenz für mehr Fußerkrankungen und weniger Fußdeformitäten bei barfuß Laufenden. Insgesamt sei die Evidenz zu Langzeiteffekten begrenzt oder sehr begrenzt. [1]",
      "Die Studie betrifft gewohnheitsmäßiges Barfußgehen, nicht den Übergang von Schuhen zu Barfuß. Zum Übergang gibt es hier keine geprüfte Quelle.",
    ],
    evidence: { level: "kaum", why: "Nur begrenzte oder sehr begrenzte Evidenz für Langzeiteffekte; keine Unterschiede bei der Verletzungsrate." },
    steps: ["Zuerst barfuß im Haus und auf weichem Grund gehen.", "Dann kurze Strecken draußen auf sauberem Boden.", "Laufen nur sehr kurz und langsam steigern. (Vorschlag)"],
    plan: [
      { title: "Woche 1–2", text: "Täglich 10 Minuten barfuß gehen. (Vorschlag)" },
      { title: "Woche 3–4", text: "Kurze Läufe von wenigen Minuten, Pause bei Fußschmerz. (Vorschlag)" },
    ],
    myths: [
      { myth: "Barfußlaufen verhindert Verletzungen.", fact: "Die Übersichtsarbeit fand keine Unterschiede in den relativen Verletzungsraten. [1]" },
      { myth: "Barfuß macht die Füße gesünder.", fact: "Die Belege für Langzeiteffekte sind begrenzt oder sehr begrenzt; mehr Fußerkrankungen waren bei barfuß Laufenden begrenzt belegt. [1]" },
    ],
    mistakes: ["Zu schnell zu viel.", "Auf unbekanntem Grund mit Scherben laufen."],
    safety: ["Verletzungsgefahr durch Untergrund (Vorsichtsregel, keine Leitlinie).", "Bei Diabetes oder Gefühlsstörungen an den Füßen vorher ärztlich fragen (Vorsichtsregel, keine Leitlinie)."],
    conflicts: ["Ob Barfußlaufen günstig oder schädlich für den Fuß ist, bleibt offen: Fußform wirkt günstig, Fußerkrankungen eher häufiger. [1]"],
    videos: [
      { title: "How to transition to barefoot running: Short Version", id: "HGWz38IKnlE", channel: "VIVOBAREFOOT", why: "Übergang zum Barfußlaufen; der Kanal gehört einem Barfußschuh-Hersteller.", checked: true },
      { title: "A Running Program for Transitioning to Barefoot Shoes (Minimalist/Zero Drop)", id: "RbO-SbRNa2Y", channel: "VBT Coach - Velocity Based Training Made Practical", why: "Laufprogramm für den Wechsel.", checked: true },
    ],
    videoNote: "Der eine Kanal gehört einem Hersteller; nur Titel geprüft.",
    sources: [
      { title: "Hollander et al. 2017, Med Sci Sports Exerc – Long-Term Effects of Habitual Barefoot Running and Walking: A Systematic Review", url: PM("27801744"), kind: "Übersichtsarbeit" },
    ],
  },

  "Dehnen": {
    date: DATE,
    steckbrief: {
      about: "Gezieltes Dehnen, um die Beweglichkeit zu verbessern. Statisches Dehnen (Position halten) vergrößert nachweislich den Bewegungsumfang.",
      why: "Eine große Metaanalyse mit 189 Studien fand bessere Beweglichkeit nach Dehnen. Für Verletzungsschutz ist Dehnen weniger belegt als Kräftigung.",
      tips: "Langsam und gleichmäßig dehnen, ohne Wippen; bei Schmerz nachlassen. Mehrere Wochen regelmäßig üben.",
      safety: "Dehnen bis zur Überforderung der Muskeln kann schaden. Bei Verletzungen vorher abklären lassen. Vorsichtsregel, keine Leitlinie.",
    },
    learn: [
      "Eine Metaanalyse (Ingram 2025: 189 Studien, 6654 Erwachsene) fand einen mittleren positiven Effekt einer einzelnen Dehnung (Hedges g = 0,63) und einen großen Effekt wiederholten Dehnens auf die Beweglichkeit (g = 0,96). [1]",
      "Weder Intensität noch Alter, Geschlecht, Trainingszustand, wöchentliche Häufigkeit oder Dauer veränderten den Effekt; größere Verbesserungen gab es bei schlechter Ausgangsbeweglichkeit. [1]",
      "In einer Metaanalyse zu Vorbeugung von Oberschenkelverletzungen erzeugte statisches Dehnen größere Beweglichkeitsgewinne als PNF und dynamisches Dehnen (Differenz 10,89°), allerdings eher kurzfristig. Verletzungen senkte dort exzentrisches Training. [2]",
    ],
    evidence: { level: "gut", why: "Dass Dehnen die Beweglichkeit verbessert, ist durch eine große Metaanalyse gut belegt; Verletzungsschutz durch Dehnen ist es nicht." },
    steps: ["Aufwärmen, dann eine Dehnposition einnehmen.", "Position halten, ohne zu wippen. Stärke: spürbar, nicht schmerzhaft. (Vorschlag)", "Mehrere Wochen regelmäßig wiederholen. [1]"],
    plan: [
      { title: "Woche 1–4", text: "Mehrfach pro Woche wenige Dehnungen für die Zielmuskeln. Die Metaanalyse fand keinen klaren Vorteil bestimmter Häufigkeit oder Dauer. [1] (konkrete Zeiten: Vorschlag)" },
    ],
    myths: [
      { myth: "Dehnen beugt Verletzungen zuverlässig vor.", fact: "In der Metaanalyse zu Oberschenkelverletzungen senkte exzentrisches Training die Rate, bei Dehnen sind Flexibilitätsgewinne belegt. [2]" },
      { myth: "Mehr Intensität bringt mehr Beweglichkeit.", fact: "Intensität veränderte den Effekt nicht signifikant. [1]" },
    ],
    mistakes: ["Wippend dehnen.", "Bis zum Schmerz gehen."],
    safety: ["Bei akuter Verletzung nicht dehnen, sondern abklären (Vorsichtsregel, keine Leitlinie)."],
    conflicts: ["Zur optimalen Dosis gibt es keinen Konsens; die Metaanalyse fand keine Moderation durch Intensität oder Häufigkeit. [1]"],
    videos: [
      { title: "Physio Guided Lower Back Stretches for Beginners (15 Minute Routine)", id: "RArMVYuWqw8", channel: "Michelle Kenway", why: "Geführte Dehnroutine einer Physiotherapeutin.", checked: true },
    ],
    videoNote: "Nur ein Video; Inhalt nur nach Titel beurteilt.",
    sources: [
      { title: "Ingram et al. 2025, Sports Med – Optimising the Dose of Static Stretching to Improve Flexibility", url: PM("39614059"), kind: "Metaanalyse" },
      { title: "Rudisill et al. 2023, Am J Sports Med – Evidence-Based Hamstring Injury Prevention and Risk Factor Management", url: PM("35384731"), kind: "Metaanalyse" },
    ],
  },

  "Faszien lösen": {
    date: DATE,
    steckbrief: {
      about: "Selbstmassage mit einer Faszienrolle. Gemessen wird in Studien meist die Beweglichkeit eines Gelenks.",
      why: "Faszienrollen vergrößern kurzfristig den Bewegungsumfang. Dass dabei „Faszien gelöst“ werden, ist damit nicht belegt.",
      tips: "Langsam über den Muskel rollen, nicht über Gelenke. Mehr als 4 Wochen üben, wenn es um Beweglichkeit geht. [2]",
      safety: "Nicht über Verletzungen oder Entzündungen rollen. Bei starkem Schmerz stoppen. Vorsichtsregel, keine Leitlinie.",
    },
    learn: [
      "Eine systematische Übersichtsarbeit (Cheatham 2015, 14 Studien) fand, dass Selbstmassage mit Faszienrolle oder Roller kurzfristig die Gelenkbeweglichkeit erhöht. [1]",
      "Eine Metaanalyse zu Trainingswirkungen (Konrad 2022: 11 Studien, 290 Teilnehmende) fand einen mittleren Effekt auf die Beweglichkeit (ES 0,823); Programme über 4 Wochen wirkten besser. An Oberschenkelvorder- und -rückseite nützte es, an der Wade nicht. [2]",
      "Warum es wirkt (Mechanismus), klären diese Abstracts nicht.",
    ],
    evidence: { level: "teilweise", why: "Kurzfristige Beweglichkeitsgewinne sind belegt; Mechanismus und Nutzen für Verletzungsschutz nicht." },
    steps: ["Rolle unter den Muskel legen, mit dem Körpergewicht langsam rollen.", "30–60 Sekunden pro Muskel. (Vorschlag)", "Auf druckempfindlichen Stellen kurz verweilen, nicht überfordern. (Vorschlag)"],
    plan: [
      { title: "Woche 1–4", text: "Mehrere Wochen regelmäßig Hüftbeuger, Oberschenkel rollen; Wade bringt laut Studie keinen Gewinn. [2] (Dauer: Vorschlag)" },
    ],
    myths: [
      { myth: "Rollen löst Verklebungen im Gewebe.", fact: "Die Abstracts belegen Beweglichkeitsgewinne, nicht eine Veränderung der Faszien. [1][2]" },
    ],
    mistakes: ["Zu fest rollen.", "Nur eine Woche erwarten."],
    safety: ["Nicht über Verletzungen rollen (Vorsichtsregel, keine Leitlinie)."],
    conflicts: ["Die Effekte unterscheiden sich nach Muskel und Studiendauer; die Heterogenität ist hoch (I² = 72,76 %). [2]"],
    videos: [],
    videoNote: "Kein geprüftes Video gesucht.",
    sources: [
      { title: "Cheatham et al. 2015, Int J Sports Phys Ther – Effects of self-myofascial release using a foam roll or roller massager", url: PM("26618062"), kind: "Übersichtsarbeit" },
      { title: "Konrad et al. 2022, Sports Med – Foam Rolling Training Effects on Range of Motion", url: PM("35616852"), kind: "Metaanalyse" },
    ],
  },

  "Sprungkraft": {
    date: DATE,
    steckbrief: {
      about: "Höher springen durch plyometrisches Training (Sprungübungen) mit kurzer Bodenkontaktzeit.",
      why: "Eine Metaanalyse mit 26 Studien fand, dass Plyometrie die Sprunghöhe deutlich verbessert, je nach Test um 4,7 bis 8,7 %.",
      tips: "Langsam beginnen, weich landen, ausgeruht trainieren.",
      safety: "Hohe Belastung für Gelenke und Sehnen. Bei Knie- oder Fersenschmerz Pause. Vorsichtsregel, keine Leitlinie.",
    },
    learn: [
      "Markovic (2007) fasste 26 Studien zusammen: Die Sprunghöhe stieg nach plyometrischem Training im Mittel um 4,7 % (Squat Jump), 8,7 % (Countermovement Jump), 7,5 % (mit Armeinsatz) und 4,7 % (Drop Jump). [1]",
      "Die Autoren folgern, plyometrisches Training sei für gesunde Personen sinnvoll, um die Sprunghöhe zu verbessern. [1]",
      "Eine Metaanalyse bei Basketballern (2022) fasst Wirkungen auf Leistungsmerkmale zusammen; ich habe sie nur über den Abstract zur Fragestellung gesehen. [2]",
    ],
    evidence: { level: "gut", why: "Eine Metaanalyse mit 26 Studien zeigt einen praktisch relevanten Effekt auf die Sprunghöhe." },
    steps: ["Aufwärmen.", "Einfache Sprünge: Counter-Movement-Sprünge, Hocksprünge. (Vorschlag)", "Weich landen, Knie nicht nach innen. (Vorschlag)", "Kurze Serien, volle Pausen. (Vorschlag)"],
    plan: [
      { title: "Woche 1–4", text: "Zweimal pro Woche 3 Serien à 5 Sprünge mit langer Pause. (Vorschlag)" },
    ],
    myths: [
      { myth: "Sprungtraining bringt nur etwas für Profis.", fact: "Die Metaanalyse bezieht sich auf gesunde Personen. [1]" },
    ],
    mistakes: ["Zu viele Sprünge ermüdet.", "Hart landen."],
    safety: ["Gelenkbelastung beachten (Vorsichtsregel, keine Leitlinie)."],
    conflicts: ["Wirkungen variieren je nach Sprungtest (4,7 bis 8,7 %). [1]"],
    videos: [],
    videoNote: "Kein geprüftes Video gefunden.",
    sources: [
      { title: "Markovic 2007, Br J Sports Med – Does plyometric training improve vertical jump height? A meta-analytical review", url: PM("17347316"), kind: "Metaanalyse" },
      { title: "Ramirez-Campillo et al. 2022, J Sport Health Sci – The effects of plyometric jump training on physical fitness attributes in basketball players: A meta-analysis", url: PM("33359798"), kind: "Metaanalyse" },
    ],
  },

  "Gym-Plan": {
    date: DATE,
    steckbrief: {
      about: "Krafttraining im Studio: Muskelaufbau braucht ausreichend Trainingsvolumen. Die WHO empfiehlt regelmäßiges Muskelkräftigen.",
      why: "Mehr Wochenvolumen brachte in einer Metaanalyse mehr Muskelzuwachs. Kraft hängt außerdem mit geringerem Sterberisiko zusammen.",
      tips: "Technik vor Gewicht, Fortschritt langsam, regelmäßig.",
      safety: "Bei Beschwerden ärztlich abklären. Aufwärmen, Technik lernen. Vorsichtsregel, keine Leitlinie.",
    },
    learn: [
      "Die WHO (2020) empfiehlt allen Altersgruppen regelmäßige Muskelkräftigung und für Erwachsene 150–300 Minuten mäßig intensive Bewegung pro Woche. [1]",
      "Eine Metaanalyse (Schoenfeld 2017, 15 Studien) fand eine abgestufte Dosis-Wirkung: Mehr wöchentliche Sätze pro Muskel brachten mehr Muskelzuwachs; jeder zusätzliche Satz entsprach etwa 0,37 % mehr Zuwachs. [2]",
      "Eine Metaanalyse (García-Hermoso 2018, 38 Studien, 1,9 Mio. Teilnehmende) fand: Höhere Griffkraft war mit geringerem Sterberisiko verbunden (HR 0,69). Das ist ein Zusammenhang, kein Beleg, dass Training die Lebenszeit verlängert. [3]",
    ],
    evidence: { level: "gut", why: "WHO-Leitlinie, Metaanalyse zur Dosis und Kohortenmetaanalyse zur Kraft stützen die Aussagen." },
    steps: ["2–3 Einheiten pro Woche. [1] (Anzahl: Vorschlag)", "Je Muskelgruppe mehrere Sätze pro Woche. [2]", "Gewicht langsam steigern. (Vorschlag)"],
    plan: [{ title: "Woche 1–4", text: "Ganzkörperplan, 2–3 Einheiten, Technik lernen. (Vorschlag)" }],
    myths: [{ myth: "Mehr Sätze bringen immer mehr.", fact: "Die Dosis-Wirkung ist abgestuft; der Trend bei der 3-Stufen-Auswertung war nicht signifikant (p = 0,074). [2]" }],
    mistakes: ["Technik vernachlässigen.", "Zu schnell steigern."],
    safety: ["Bei Schmerzen abklären (Vorsichtsregel, keine Leitlinie)."],
    conflicts: ["Die 3-Stufen-Auswertung zeigte nur einen Trend, die stetige Auswertung eine Wirkung. [2]"],
    videos: [],
    videoNote: "Kein geprüftes Video gesucht.",
    sources: [
      { title: "Bull et al. 2020, Br J Sports Med – World Health Organization 2020 guidelines on physical activity and sedentary behaviour", url: PM("33239350"), kind: "Leitlinie" },
      { title: "Schoenfeld et al. 2017, J Sports Sci – Dose-response relationship between weekly resistance training volume and increases in muscle mass", url: PM("27433992"), kind: "Metaanalyse" },
      { title: "García-Hermoso et al. 2018, Arch Phys Med Rehabil – Muscular Strength as a Predictor of All-Cause Mortality", url: PM("29425700"), kind: "Metaanalyse" },
    ],
  },

  "Calisthenics": {
    date: DATE,
    steckbrief: {
      about: "Krafttraining mit dem eigenen Körpergewicht: Liegestütze, Klimmzüge, Dips.",
      why: "Zu Calisthenics speziell fand ich keine Studie. Allgemein gilt: Regelmäßiges Muskelkräftigen ist von der WHO empfohlen, mehr Wochenvolumen brachte mehr Muskelzuwachs.",
      tips: "Mit leichten Varianten beginnen, Fortschritt in kleinen Schritten.",
      safety: "Schultern und Ellbogen langsam an Belastung gewöhnen. Vorsichtsregel, keine Leitlinie.",
    },
    learn: [
      "Die WHO empfiehlt regelmäßiges Muskelkräftigen für alle Altersgruppen; welche Art, sagt die Leitlinie im Abstract nicht. [1]",
      "Mehr wöchentliche Sätze pro Muskel führten in einer Metaanalyse zu mehr Muskelzuwachs. [2]",
      "Die Studien dort betreffen Krafttraining allgemein; Calisthenics wird nicht gesondert untersucht (Einordnung).",
    ],
    evidence: { level: "teilweise", why: "Die Grundlagen (Muskelkräftigen, Volumen) sind belegt, Calisthenics selbst nicht gesondert." },
    steps: ["Beginne mit leichten Varianten (z. B. Liegestütz an Wand oder erhöht). (Vorschlag)", "Steigere Wiederholungen, dann Schwierigkeit. (Vorschlag)", "2–3 Einheiten pro Woche. [1] (Anzahl: Vorschlag)"],
    plan: [{ title: "Woche 1–4", text: "Ganzkörper: Drücken, Ziehen, Beine; ruhig steigern. (Vorschlag)" }],
    myths: [{ myth: "Nur mit Gewichten wächst Muskel.", fact: "Die Metaanalyse betrifft das Volumen, nicht das Gerät. [2]" }],
    mistakes: ["Zu schnelle Progression bei Klimmzug und Dips."],
    safety: ["Bei Schulterschmerz Pause (Vorsichtsregel, keine Leitlinie)."],
    conflicts: ["Keine Studie vergleicht Calisthenics mit Geräten in den gelesenen Abstracts."],
    videos: [
      { title: "Weekly Hybrid Calisthenics Routine | MASS & ENDURANCE (plus nutrition)", id: "2btJQrOGk4g", channel: "Danny Street Workout", why: "Wochenplan für Calisthenics.", checked: true },
      { title: "Beginner routine for calisthenics", id: "5ZIEvM7Qdbo", channel: "Akeem Supreme", why: "Einsteiger-Routine.", checked: true },
    ],
    videoNote: "Beide Videos stammen von Trainern ohne wissenschaftliche Belege; nur Titel geprüft.",
    sources: [
      { title: "Bull et al. 2020, Br J Sports Med – WHO 2020 guidelines on physical activity and sedentary behaviour", url: PM("33239350"), kind: "Leitlinie" },
      { title: "Schoenfeld et al. 2017, J Sports Sci – Dose-response relationship between weekly resistance training volume and increases in muscle mass", url: PM("27433992"), kind: "Metaanalyse" },
    ],
  },

  "Griffkraft": {
    date: DATE,
    steckbrief: {
      about: "Kraft der Hände und Unterarme, gemessen oft als Handkraft. Trainiert wird sie mit Hängen, Tragen und Drücken.",
      why: "Hohe Griffkraft war in einer Metaanalyse mit geringerem Sterberisiko verbunden. Das belegt keinen Nutzen des Trainings.",
      tips: "Langsam steigern, auf Sehnen und Ellbogen achten.",
      safety: "Bei Ellbogen- oder Fingerschmerz pausieren. Vorsichtsregel, keine Leitlinie.",
    },
    learn: [
      "Eine Metaanalyse (García-Hermoso 2018; 38 Studien, 1 907 580 Teilnehmende, 63 087 Todesfälle) fand: Höhere Griffkraft war mit geringerem Sterberisiko verbunden (HR 0,69; 95 %-KI 0,64–0,74), bei Frauen etwas stärker (HR 0,60) als bei Männern (HR 0,69). [1]",
      "Das ist ein Zusammenhang aus Beobachtungsstudien; ob Griffkrafttraining das Risiko senkt, zeigt die Arbeit nicht. [1]",
      "Zu Dead Hang, Farmer’s Walk oder Griffübungen fand ich keine Studie.",
    ],
    evidence: { level: "kaum", why: "Der Zusammenhang mit Sterberisiko ist beobachtet, ein Trainingseffekt ist nicht gezeigt." },
    steps: ["An der Stange hängen, kurze Zeit. (Vorschlag)", "Schwere Taschen tragen. (Vorschlag)", "Griffgerät drücken. (Vorschlag)"],
    plan: [{ title: "Woche 1–4", text: "Zwei- bis dreimal pro Woche kurze Hang-Serien. (Vorschlag)" }],
    myths: [{ myth: "Starke Griffkraft verlängert das Leben.", fact: "Es ist ein Zusammenhang; Ursache nicht belegt. [1]" }],
    mistakes: ["Zu lange hängen, Schultern überlasten."],
    safety: ["Bei Schmerz in Ellbogen oder Fingern Pause (Vorsichtsregel, keine Leitlinie)."],
    conflicts: ["Kohorten zeigen Zusammenhang, nicht Ursache. [1]"],
    videos: [],
    videoNote: "Kein Video gesucht.",
    sources: [
      { title: "García-Hermoso et al. 2018, Arch Phys Med Rehabil – Muscular Strength as a Predictor of All-Cause Mortality", url: PM("29425700"), kind: "Metaanalyse" },
    ],
  },

  "Ausdauer": {
    date: DATE,
    steckbrief: {
      about: "Ausdauer ist die Fähigkeit, über längere Zeit körperlich zu arbeiten. Die WHO nennt Mindestmengen für Erwachsene.",
      why: "Die WHO-Leitlinie 2020 empfiehlt 150–300 Minuten mäßige oder 75–150 Minuten intensive Bewegung pro Woche.",
      tips: "Erst Dauer, dann Tempo; lieber öfter und kürzer als selten und hart. (Vorschlag)",
      safety: "Bei Herz-Kreislauf-Erkrankung vorher ärztlich fragen. Vorsichtsregel, keine Leitlinie.",
    },
    learn: [
      "Die WHO (2020) empfiehlt Erwachsenen 150–300 Minuten mäßig intensive oder 75–150 Minuten intensive Aerobic-Aktivität pro Woche oder eine Kombination. [1]",
      "Sie betont: Etwas Bewegung ist besser als keine, mehr bringt mehr. [1]",
      "Zu Trainingsmethoden für die Ausdauer (z. B. Zone 2) fand ich keine geprüfte Studie.",
    ],
    evidence: { level: "gut", why: "Die WHO-Leitlinie stützt sich auf systematische Auswertungen." },
    steps: ["Gehen, Radfahren oder Laufen in einem Tempo, bei dem Sprechen möglich ist. (Vorschlag)", "Pro Woche auf mindestens 150 Minuten kommen. [1]"],
    plan: [{ title: "Woche 1–4", text: "Von 60 Minuten pro Woche auf 150 steigern. [1] (Schritte: Vorschlag)" }],
    myths: [{ myth: "Nur hartes Training zählt.", fact: "Mäßig intensive Bewegung zählt gleichberechtigt in den Empfehlungen. [1]" }],
    mistakes: ["Zu schnell steigern."],
    safety: ["Bei Brustschmerz oder Atemnot Training beenden und ärztlich abklären (Vorsichtsregel, keine Leitlinie)."],
    conflicts: ["Die WHO konnte für sitzendes Verhalten keinen genauen Schwellenwert nennen. [1]"],
    videos: [
      { title: "The Science Behind Zone 2: Why It Works (And When It Doesn't)", id: "Kts99g1g69Q", channel: "Andy Brodziak", why: "Erklärung zu Zone-2-Training.", checked: true },
      { title: "Zone 2 Training - Is It The Best Way To Get Fit?", id: "JHZBpgJr584", channel: "Talking With Docs", why: "Ärzte erklären Zone 2.", checked: true },
    ],
    videoNote: "Nur Titel geprüft; Zone-2-Aussagen habe ich nicht gegen Studien geprüft.",
    sources: [
      { title: "Bull et al. 2020, Br J Sports Med – World Health Organization 2020 guidelines on physical activity and sedentary behaviour", url: PM("33239350"), kind: "Leitlinie" },
    ],
  },
};
