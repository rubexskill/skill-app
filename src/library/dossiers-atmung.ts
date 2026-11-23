import type { Dossier } from "./dossiers";

// Kategorie „Atmung, Sinne & Körperkontrolle“ (Box Breathing steht in dossiers.ts).
// Recherchiert am 23. November 2026. Studien über PubMed/Europe PMC geprüft (Titel, Autoren, Abstract); Aussagen stehen nur, wenn sie im Abstract oder auf der verlinkten Seite stehen.
const DATE = "23. November 2026";
const PM = (id: string) => `https://pubmed.ncbi.nlm.nih.gov/${id}/`;

export const DOSSIERS_ATMUNG: Record<string, Dossier> = {
  "Physiologischer Seufzer": {
    date: DATE,
    steckbrief: {
      about: "Zwei kurze Atemzüge durch die Nase hintereinander, dann lang ausatmen. In der Studie hieß die Wiederholung über Minuten „Cyclic Sighing“.",
      why: "Eine kurze Übung für Stressmomente. In einer Studie mit 111 Freiwilligen hob tägliches Cyclic Sighing (5 Minuten, ein Monat) die Stimmung stärker als Achtsamkeitsmeditation und senkte die Atemfrequenz.",
      tips: "Zweimal kurz durch die Nase einatmen (zweiter Zug oben „nachfüllen“), dann langsam durch den Mund ausatmen, länger als eingeatmet wurde. Fünf Minuten genügen, ruhig sitzen.",
      safety: "Bei Schwindel aufhören und normal atmen. Nicht im Wasser oder beim Fahren üben.",
    },
    learn: [
      "Natürliche Seufzer entstehen im Atemzentrum des Hirnstamms (preBötzinger-Komplex). Sie halten die Lungenbläschen offen: Eine Übersichtsarbeit beschreibt, dass Seufzer verhindern, dass Alveolen kollabieren. [2]",
      "Die Studie von Balban et al. (2023) verglich über einen Monat täglich 5 Minuten Cyclic Sighing, Box Breathing, zyklische Hyperventilation mit Halten und Achtsamkeit. Atemübungen insgesamt verbesserten die Stimmung und senkten die Atemfrequenz stärker als Achtsamkeit; Cyclic Sighing schnitt am besten ab. [1][3]",
      "Wichtig: Die „Seufzer“-Übung der Studie ist eine bewusst nachgeahmte Version mit betonter Ausatmung. Ob sie physiologisch dasselbe tut wie ein spontaner Seufzer, ist nicht belegt. [1][2]",
    ],
    evidence: { level: "teilweise", why: "Eine randomisierte Studie (111 Personen, remote durchgeführt) zeigt bessere Stimmung als bei Achtsamkeit; unabhängige Wiederholungen und die Wirkung auf Angst sind schwächer belegt." },
    steps: ["Bequem sitzen, Schultern locker.", "Durch die Nase einatmen.", "Ohne auszuatmen noch einmal kurz durch die Nase nachatmen.", "Langsam und vollständig durch den Mund ausatmen.", "Fünf Minuten wiederholen, danach ruhig normal atmen."],
    plan: [
      { title: "Woche 1", text: "Einmal täglich 1 Minute, Technik üben." },
      { title: "Woche 2–4", text: "Täglich 5 Minuten – die Dauer der Studie. [1]" },
      { title: "Danach", text: "Bei Anspannung 3 bis 5 Seufzer zwischendurch (Vorschlag)." },
    ],
    myths: [
      { myth: "Ein einziger Seufzer beruhigt sofort messbar.", fact: "Die Studie untersuchte fünf Minuten täglich über vier Wochen; zu einzelnen Seufzern liefert sie keine Aussage. [1]" },
      { myth: "Es ist bewiesen, dass es besser wirkt als jede andere Atemübung.", fact: "Cyclic Sighing lag bei Stimmung und Atemfrequenz vorn; bei der Angst war der Unterschied nicht klar. Die Studie war einzeln und remote. [1][3]" },
    ],
    mistakes: ["Zu viel Luft auf einmal einatmen und dadurch schwindlig werden.", "Die Ausatmung nicht länger machen als die Einatmung.", "Verkrampft atmen statt locker."],
    safety: ["Gesunde Menschen vertragen die Übung in der Regel. Bei Schwindel oder Kribbeln pausieren. Bei Herz-, Lungen- oder Kreislauferkrankungen vorher ärztlich nachfragen (Vorsichtsregel, keine Leitlinie)."],
    conflicts: ["Die Studienzahlen zur Angst sind für Cyclic Sighing und Achtsamkeit ähnlich; der Vorteil zeigt sich in der Stimmung. [1]"],
    videos: [
      { title: "Cyclic Sighing: 5-Minute Guided Session (The Technique Stanford Found Most Effective)", id: "PTFkAMGFqfc", channel: "The Breathwork Channel", why: "Fünf Minuten zum Mitmachen, wie in der Studie.", checked: true },
      { title: "Guided 5-Minute Cyclic Sighing | Breathing Exercise to Follow Along", id: "hxr3-ZKwLhs", channel: "Emely Marie", why: "Zweite geführte Übung.", checked: true },
      { title: "Physiological Sighs – The fastest way to calm ourselves down!", id: "1anjNJpptwg", channel: "Dan Harley", why: "Kurze Erklärung der Technik.", checked: true },
    ],
    sources: [
      { title: "Balban et al. 2023, Cell Reports Medicine – Brief structured respiration practices enhance mood and reduce physiological arousal", url: PM("36630953"), kind: "Studie" },
      { title: "Severs, Vlemincx & Ramirez 2022, Biological Psychology – The psychophysiology of the sigh: I. The sigh from the physiological perspective", url: PM("35288214"), kind: "Übersichtsarbeit" },
      { title: "Stanford Medicine: ‚Cyclic sighing‘ can help breathe away anxiety", url: "https://med.stanford.edu/news/insights/2023/02/cyclic-sighing-can-help-breathe-away-anxiety.html", kind: "Universität" },
    ],
    videoNote: "Die Videos stammen von Atemtrainern, nicht von den Studienautoren. Titel mit „Stanford“ sind Selbstbeschreibungen der Kanäle.",
  },

  "Wim-Hof-Atmung": {
    date: DATE,
    steckbrief: {
      about: "Atemübung der Wim-Hof-Methode: mehrere Runden tiefes, schnelles Atmen, danach Luft anhalten. Sie ist eine von drei Säulen, zusammen mit Kälte und Konzentration.",
      why: "Eine kleine Studie fand nach zehn Tagen Training eine schwächere Entzündungsreaktion auf einen Test mit Bakteriengift. Spätere Studien zeigen gemischte Ergebnisse; ein belegter Gesundheitsnutzen im Alltag steht aus.",
      tips: "Nur im Sitzen oder Liegen, an Land. Nie im Wasser, im Stehen oder beim Fahren. Anfangs nur wenige Runden und ohne Gewalt.",
      safety: "Nie im oder am Wasser. Bei Herz-Kreislauf-Problemen, Epilepsie oder Schwangerschaft nur nach ärztlicher Rücksprache.",
    },
    learn: [
      "Das Training aus der bekanntesten Studie (Kox et al. 2014) bestand aus Meditation, Atemtechniken (u. a. zyklische Hyperventilation mit anschließendem Luft-Anhalten) und Kältekontakt. Es führte zu zeitweiser Alkalose und Sauerstoffmangel mit stark erhöhtem Adrenalin; nach einem Test mit Bakteriengift stieg das entzündungshemmende IL-10 schneller, Entzündungsstoffe wie TNF-α waren niedriger, die grippeähnlichen Beschwerden geringer. Untersucht wurden 12 Trainierte und 12 Kontrollpersonen. [1]",
      "Eine systematische Übersichtsarbeit (9 Arbeiten, 8 Studien) sieht ermutigende Hinweise auf entzündungsdämpfende Wirkung, aber gemischte Ergebnisse bei Leistung und Atemwerten. [2]",
      "Eine randomisierte Studie mit 42 Personen und 15 Tagen Wim-Hof-Methode fand keine Verbesserung bei Blutdruck, Herzfrequenzvariabilität, Gefäßsteifigkeit, Stress oder Stimmung. [3]",
      "Das Atmen mit Hyperventilation senkt den Atemreiz, nicht den Sauerstoffmangel: Wer danach die Luft anhält, kann ohne Vorwarnung bewusstlos werden. Im Wasser kann das tödlich enden. [4]",
    ],
    evidence: { level: "kaum", why: "Wenige, kleine Studien: Entzündungseffekte im Labor sind plausibel, ein Nutzen für Gesundheit oder Wohlbefinden im Alltag ist nicht gezeigt, eine 15-Tage-Studie fand keinen." },
    steps: ["Nur an Land, sitzend oder liegend.", "30 bis 40 tiefe, entspannte Atemzüge: voll ein, ohne Anstrengung aus.", "Nach dem letzten Ausatmen die Luft anhalten, solange es angenehm ist.", "Tief einatmen, 10–15 Sekunden halten, dann normal atmen.", "Maximal 3 Runden; bei Schwindel oder Kribbeln sofort normal atmen."],
    plan: [
      { title: "Woche 1–2", text: "Täglich eine Runde, Halten kurz lassen. Ziel: Technik ohne Druck." },
      { title: "Woche 3–4", text: "Bis zu drei Runden. Kälte erst später und nur nach den Hinweisen unter Kälteexposition (Vorschlag)." },
    ],
    myths: [
      { myth: "Die Methode ist wissenschaftlich bewiesen.", fact: "Es gibt Studien, aber nur wenige und kleine; Ergebnisse sind gemischt. [1][2][3]" },
      { myth: "Hyperventilieren und Luft-Anhalten im Wasser ist ein Training.", fact: "Es kann zur Bewusstlosigkeit ohne Warnung führen („Hypoxic blackout“). [4]" },
    ],
    mistakes: ["Im Stehen, im Auto oder im Wasser üben.", "Zu schnell zu viele Runden.", "Das Halten erzwingen.", "Das Verfahren als Ersatz für medizinische Behandlung sehen."],
    safety: ["Nie im oder am Wasser, nie allein im Wasser, nie nach schnellem Hyperventilieren Luft anhalten. [4]", "Bei Herz-Kreislauf-Erkrankung, Epilepsie, Schwangerschaft: ärztlich fragen (Vorsichtsregel, keine Leitlinie)."],
    conflicts: ["Kox 2014 fand eine Wirkung auf die Entzündungsreaktion; die 15-Tage-Studie fand keine Wirkung auf Kreislauf und Psyche. Die Studien messen Verschiedenes und sind klein. [1][3]", "Die Übersichtsarbeit nennt das „vielversprechend“, die Datenlage bleibt dünn. [2]"],
    videos: [
      { title: "The science behind the Wim Hof method. Breath and cold training.", id: "aALiuGA7aAo", channel: "ModernDaySparta", why: "Erklärung der Technik und der Studienlage aus Sicht eines Trainers; mit Vorsicht ansehen.", checked: true },
    ],
    videoNote: "Ich habe kein unabhängiges, wissenschaftlich fundiertes Video gefunden. Die Methode wird online meist beworben.",
    sources: [
      { title: "Kox et al. 2014, PNAS – Voluntary activation of the sympathetic nervous system and attenuation of the innate immune response in humans", url: PM("24799686"), kind: "Studie" },
      { title: "Almahayni & Hammond 2024, PLOS ONE – Does the Wim Hof Method have a beneficial impact on physiological and psychological outcomes? A systematic review", url: PM("38478473"), kind: "Übersichtsarbeit" },
      { title: "Ketelhut et al. 2023, Scientific Reports – The effectiveness of the Wim Hof method on cardiac autonomic function, blood pressure, arterial compliance …", url: PM("37845341"), kind: "Studie" },
      { title: "Bart, Murray & Lau – Shallow Water Blackout (StatPearls)", url: "https://www.ncbi.nlm.nih.gov/books/NBK554620/", kind: "Fachbuch" },
    ],
  },

  "Tummo-Meditation": {
    date: DATE,
    steckbrief: {
      about: "Tibetische Meditations- und Atemtechnik („g-Tummo“, innere Wärme). Sie verbindet Vorstellungsbilder mit einer kräftigen „Vasenatmung“.",
      why: "Eine Studie mit tibetischen Meditierenden maß Temperaturanstiege bis 38,3 °C unter der Achsel bei der kräftigen Atmung. Ob man damit die Körpertemperatur im Alltag steuern kann, ist offen.",
      tips: "Nicht ohne Anleitung eines erfahrenen Lehrers versuchen. Immer sitzen, nie im Wasser, in warmer Umgebung beginnen.",
      safety: "Die kräftige Atmung ähnelt dem Hyperventilieren: Schwindel und Bewusstseinsverlust sind möglich. Nie im Wasser, nie im Stehen oder beim Fahren.",
    },
    learn: [
      "Kozhevnikov et al. (2013) maßen bei erfahrenen Meditierenden in Klöstern in Osttibet Temperatur und EEG. Zuverlässige Anstiege auf Fieberbereich (bis 38,3 °C, Achseltemperatur) zeigten sich nur bei der „Forceful Breath“-Variante, begleitet von mehr Alpha-, Beta- und Gamma-Aktivität. [1]",
      "Westliche Teilnehmende ohne Vorerfahrung, die nur die Atemtechnik nutzten, konnten sie nur begrenzt lange durchhalten und kamen höchstens auf Werte im normalen Bereich. [1]",
      "Die Autoren schließen auf zwei Faktoren: die körperliche Atemkomponente, die Wärme erzeugt, und die geistige Komponente (Visualisierung), die den Anstieg länger hält. [1]",
    ],
    evidence: { level: "kaum", why: "Es gibt eine zentrale Feldstudie mit wenigen Meditierenden; Wiederholungen und ein Nutzen für Laien sind nicht belegt." },
    steps: ["Warm und sicher sitzen, keine Gefahr durch Bewusstlosigkeit.", "Lehrer oder fundierten Kurs suchen.", "Erst Atemrhythmus ohne Kraft üben.", "Visualisierung ergänzen, wie im Kurs gelehrt.", "Nach der Übung normal atmen und ruhen."],
    plan: [{ title: "Hinweis", text: "Ein Übungsplan für Anfänger lässt sich aus den Quellen nicht ableiten. Die einzige belegte Aussage: Die Technik braucht Übung und Anleitung. [1]" }],
    myths: [
      { myth: "Tummo-Meister trocknen nasse Tücher mit Körperwärme.", fact: "Dampfende Tücher beweisen keine erhöhte Körpertemperatur; sie dampfen schon durch den Temperaturunterschied. [1]" },
      { myth: "Jeder kann so Kälte wegatmen.", fact: "Westliche Laien erreichten nur begrenzte Anstiege im normalen Bereich. [1]" },
    ],
    mistakes: ["Ohne Anleitung kräftig hyperventilieren.", "Die Übung im Stehen oder in der Kälte ausprobieren.", "Wunder erwarten."],
    safety: ["Kräftige Atmung kann Schwindel und Ohnmacht auslösen; nur sitzend, nie im Wasser.", "Bei Herz-, Lungen- oder Krampfleiden ärztlich fragen (Vorsichtsregel, keine Leitlinie)."],
    conflicts: ["Die Studie findet echte Wärme-Anstiege bei Meditierenden, kann aber nicht klären, wie viel davon Atmung und wie viel Vorstellung ist. [1]"],
    videos: [],
    videoNote: "Ich habe kein geprüftes, seriöses Video gefunden. Die gefundenen Videos sind Vorführungen von Praktizierenden.",
    sources: [
      { title: "Kozhevnikov et al. 2013, PLOS ONE – Neurocognitive and somatic components of temperature increases during g-tummo meditation: legend and reality", url: PM("23555572"), kind: "Studie" },
    ],
  },

  "Kälteexposition": {
    date: DATE,
    steckbrief: {
      about: "Bewusst Kälte aushalten: kalte Duschen, Eisbad oder Tauchbad. Kurz, kontrolliert und mit Sicherheitsabstand zum Wasser.",
      why: "Kalte Duschen verringerten in einer großen Studie die selbst berichteten Krankheitstage nicht, aber die Fehltage bei der Arbeit um 29 %. Kälteexposition kann Schlafqualität und Stressempfinden verbessern – kurzzeitig.",
      tips: "Klein anfangen: eine heiße Dusche, am Ende 30 Sekunden kalt. Langsam ausatmen, ruhig bleiben. Nach dem Duschen aufwärmen.",
      safety: "Kaltwasser löst eine Kälteschock-Reaktion mit Atemschnappen und schnellem Atmen aus: im offenen Wasser lebensgefährlich. Nie allein, nie nach Hyperventilieren, bei Herz-Kreislauf-Erkrankungen ärztlich fragen.",
    },
    learn: [
      "Eine Übersichtsarbeit (11 Studien, 3.177 Teilnehmende, Wasser 7–15 °C) fand zeitabhängige Effekte auf Entzündung, Stress, Immunität, Schlafqualität und Lebensqualität; keinen Effekt auf die Stimmung. Die Datenlage ist begrenzt: wenige randomisierte Studien, kleine Gruppen, wenig Vielfalt. [1]",
      "Die große Duschstudie (3.018 Personen, 30 Tage, 30/60/90 Sekunden kalt am Ende der Dusche) zeigte 29 % weniger Fehltage bei der Arbeit wegen Krankheit, aber keinen Unterschied bei den Krankheitstagen; über schwere Nebenwirkungen wurde nicht berichtet. [2]",
      "Plötzliches Eintauchen in kaltes Wasser löst die Kälteschock-Reaktion aus: schneller Herzschlag, Gefäßverengung, hoher Blutdruck, Atemschnappen und Hyperventilation, mit höherem Risiko, Wasser einzuatmen. [3]",
    ],
    evidence: { level: "teilweise", why: "Einige Effekte (Schlaf, kurzfristiger Stress, Fehltage) sind in randomisierten Studien gefunden worden; die Studienlage ist insgesamt dünn und die Ergebnisse sind teils selbst berichtet." },
    steps: ["Dusche wie gewohnt warm beginnen.", "Am Ende auf kalt stellen, mit den Beinen anfangen.", "Ruhig und langsam ausatmen, Schultern locker.", "30 Sekunden, dann ausstellen.", "Sofort abtrocknen und aufwärmen."],
    plan: [
      { title: "Woche 1", text: "Täglich 30 Sekunden kalt am Ende (wie in der Duschstudie). [2]" },
      { title: "Woche 2–4", text: "Auf 60 bis 90 Sekunden steigern; die Studie prüfte alle drei Dauern. [2]" },
      { title: "Danach", text: "Eisbad oder Kaltwasserbad nur nach ärztlichem Rat und nicht allein (Vorsichtsregel)." },
    ],
    myths: [
      { myth: "Kälte macht immun.", fact: "Die Meta-Analyse fand keinen Effekt auf die Immunfunktion; die Studie zeigte weniger Fehltage, nicht weniger Krankheitstage. [1][2]" },
      { myth: "Kaltes Wasser ist bei jedem harmlos.", fact: "Die Kälteschock-Reaktion kann beim Eintauchen gefährlich sein. [3]" },
    ],
    mistakes: ["Zu kaltes Wasser zu lange und ohne Aufwärmen.", "Allein im offenen Wasser.", "Nach Hyperventilieren ins Wasser."],
    safety: ["Kälteschock beim Eintauchen kann zu Atemnot und Herzrhythmusstörungen führen; im offenen Wasser nie allein. [3]", "Bei Herz-Kreislauf-Erkrankung, Bluthochdruck oder Schwangerschaft ärztlich fragen (Vorsichtsregel, keine Leitlinie)."],
    conflicts: ["Die Meta-Analyse fand kurzfristig mehr Entzündung nach dem Kaltbad und keine Wirkung auf die Immunfunktion, die Duschstudie weniger Fehltage. Fehltage sind selbst berichtet. [1][2]"],
    videos: [
      { title: "Cold Water Immersion Benefits and Risks — Professor Mike Tipton, MBE | Reason & Wellbeing", id: "xuDacCtjGb8", channel: "Greg Potter", why: "Gespräch mit einem Forscher zu Kälteschock-Reaktion, Nutzen und Risiken.", checked: true },
      { title: "Cold plunges and the real science behind them", id: "fcFb1FfQ_W0", channel: "Science Based Fitness", why: "Einordnung der Studien zu Kaltbädern.", checked: true },
    ],
    videoNote: "Zwei Videos gefunden, die ich nach Titel und Kanal für passend halte; ein drittes war nicht überzeugend.",
    sources: [
      { title: "Cain et al. 2025, PLOS ONE – Effects of cold-water immersion on health and wellbeing: a systematic review and meta-analysis", url: PM("39879231"), kind: "Übersichtsarbeit" },
      { title: "Buijze et al. 2016, PLOS ONE – The effect of cold showering on health and work: a randomized controlled trial", url: PM("27631616"), kind: "Studie" },
      { title: "Barwood et al. 2018, Frontiers in Psychology – Acute anxiety predicts components of the cold shock response on cold water immersion", url: PM("29695988"), kind: "Studie" },
    ],
  },

  "Vagusnerv": {
    date: DATE,
    steckbrief: {
      about: "Der Vagusnerv verbindet Hirnstamm, Herz, Lunge und Darm. „Vagusnerv trainieren“ meint meist langsames Atmen und Herzratenvariabilität.",
      why: "Gerätegestützte Vagusnerv-Stimulation ist für Epilepsie und Depression zugelassen. Für Atemübungen zeigt die Forschung kurzfristige Effekte auf die Herzratenvariabilität, ein Training des Nervs selbst ist damit nicht belegt.",
      tips: "Langsam atmen (etwa 6 Atemzüge pro Minute), Ausatmen etwas länger als Einatmen, einige Minuten täglich. Das ist plausibel, nicht bewiesen.",
      safety: "Geräte zur Stimulation nur nach ärztlicher Beratung. Bei Ohnmachtsneigung oder Herzproblemen ärztlich fragen.",
    },
    learn: [
      "Vagusnerv-Stimulation per Implantat ist von der US-Arzneimittelbehörde für Erwachsene und Jugendliche ab 12 Jahren mit schwer behandelbarer Epilepsie und Depression zugelassen; für Entzündungskrankheiten und Schmerzen laufen Studien. [1]",
      "Die Stimulation über die Haut (am Ohr, am Hals) ist als Behandlung noch nicht ausgereift: Übersichtsarbeiten nennen Herausforderungen für den Weg in die Klinik. [2]",
      "Langsames, kontrolliertes Atmen erhöht kurzfristig die vagal vermittelte Herzratenvariabilität (siehe Box Breathing). Damit wird der Nerv indirekt gemessen; die Messung ist nicht dasselbe wie die Aktivität des Nervs. [3]",
    ],
    evidence: { level: "teilweise", why: "Implantierte Stimulation ist für zwei Krankheiten zugelassen; ob Atemübungen oder Heimgeräte den Nerv gesund machen, ist nicht belegt." },
    steps: ["Bequem sitzen.", "Etwa 5 Sekunden einatmen, 5 bis 6 Sekunden ausatmen.", "Durch die Nase, Bauch bewegt sich.", "Fünf bis zehn Minuten.", "Danach normal atmen."],
    plan: [{ title: "Woche 1–4", text: "Täglich 5 Minuten langsam atmen (Vorschlag, aus den Studien zum langsamen Atmen abgeleitet). [3]" }],
    myths: [
      { myth: "Man kann den Vagusnerv „resetten“ oder „trainieren“ und so Krankheiten heilen.", fact: "Zugelassen ist nur die Behandlung per Implantat bei zwei Krankheiten; für Atem-Hacks fehlen Belege. [1][3]" },
      { myth: "Heimgeräte stimulieren den Nerv sicher und wirksam.", fact: "Übersichtsarbeiten sehen für die Hautstimulation noch offene Fragen. [2]" },
    ],
    mistakes: ["Atemübungen als Behandlung bei Krankheit sehen.", "Zu langsam atmen und Atemnot erzeugen.", "Heimgeräte ohne ärztlichen Rat nutzen."],
    safety: ["Geräte zur Nervenstimulation nur nach ärztlicher Beratung. [2]", "Langsames Atmen nie bis zur Atemnot."],
    conflicts: ["Die Herzratenvariabilität misst den Vagus nur indirekt; sie ist nicht dasselbe wie seine Aktivität. [3]"],
    videos: [],
    videoNote: "Ich habe kein geprüftes, seriöses Video gefunden.",
    sources: [
      { title: "Johnson & Wilson 2018, Journal of Inflammation Research – A review of vagus nerve stimulation as a therapeutic intervention", url: PM("29844694"), kind: "Übersichtsarbeit" },
      { title: "Yap et al. 2020, Frontiers in Neuroscience – Critical review of transcutaneous vagus nerve stimulation: challenges for translation to clinical practice", url: PM("32410932"), kind: "Übersichtsarbeit" },
      { title: "Effects of voluntary slow breathing on heart rate and heart rate variability: a systematic review and meta-analysis (223 Studien)", url: "https://fis.dshs-koeln.de/de/publications/effects-of-voluntary-slow-breathing-on-heart-rate-and-heart-rate-/", kind: "Übersichtsarbeit" },
    ],
  },

  "Besser schlafen": {
    date: DATE,
    steckbrief: {
      about: "Schlaf verbessern ohne Medikamente: feste Zeiten, Schlafumgebung, Licht, Koffein, und bei anhaltenden Problemen eine kognitive Verhaltenstherapie bei Schlafstörungen (CBT-I).",
      why: "Bei chronischer Schlafstörung ist CBT-I die empfohlene Erstbehandlung. Schlafhygiene allein ist nicht belegt.",
      tips: "Feste Aufsteh- und Zubettgehzeit, morgens Tageslicht, abends Koffein und Bildschirme zurückfahren, Bett nur zum Schlafen. Wer länger als etwa 15 Minuten wach liegt, steht kurz auf.",
      safety: "Anhaltende Schlafstörung (länger als drei Monate, mit Tagesmüdigkeit) gehört zur Hausärztin oder zum Hausarzt, um etwa Schlafapnoe auszuschließen.",
    },
    learn: [
      "Die Leitlinie des American College of Physicians (2016) empfiehlt für alle Erwachsenen mit chronischer Schlafstörung CBT-I als Erstbehandlung (starke Empfehlung, Evidenz mittlerer Qualität). Medikamente sollen nur kurz und nach gemeinsamer Entscheidung erwogen werden. [1]",
      "CBT-I kombiniert Gedanken zum Schlaf mit Verhaltenstechniken wie Schlafrestriktion und Reizkontrolle sowie Aufklärung wie Schlafhygiene. [1][2]",
      "Der NHS beschreibt Schlafhygiene als praktische Gewohnheiten wie regelmäßige Zeiten; die Evidenz für einzelne Schlafhygiene-Regeln allein ist in der Übersichtsarbeit zur Leitlinie „unzureichend“ (Einordnung, nicht im Wortlaut geprüft). [1][3]",
    ],
    evidence: { level: "teilweise", why: "CBT-I als Gesamtprogramm ist gut belegt (Leitlinie, mittlere Evidenz); einzelne Schlafhygiene-Regeln allein sind kaum belegt." },
    steps: ["Eine feste Aufstehzeit wählen, auch am Wochenende.", "Bett nur für Schlaf, nicht für Handy oder Arbeit.", "Wer nicht schlafen kann: nach etwa 15 Minuten kurz aufstehen und etwas Ruhiges tun.", "Koffein in der zweiten Tageshälfte meiden, abends wenig Licht und Bildschirm.", "Zwei Wochen Schlaftagebuch führen und Muster erkennen."],
    plan: [
      { title: "Woche 1–2", text: "Feste Aufstehzeit, Schlaftagebuch. Noch nichts ändern außer der Zeit." },
      { title: "Woche 3–4", text: "Reizkontrolle (Bett nur zum Schlafen) und Abendroutine ergänzen." },
      { title: "Bei Problemen", text: "Ärztlich abklären lassen; CBT-I mit Anleitung ist die empfohlene Erstbehandlung. [1]" },
    ],
    myths: [
      { myth: "Wer Schlafhygiene-Regeln befolgt, schläft gut.", fact: "Für einzelne Regeln allein ist die Evidenz unzureichend; wirksam ist das CBT-I-Gesamtpaket. [1][2]" },
      { myth: "Schlafmittel sind die beste Lösung.", fact: "Die Leitlinie empfiehlt CBT-I als Erstbehandlung, Medikamente nur kurzzeitig. [1]" },
    ],
    mistakes: ["Länger im Bett liegen, um „aufzuholen“.", "Wach im Bett bleiben und grübeln.", "Unregelmäßige Aufstehzeiten."],
    safety: ["Anhaltende Schlafprobleme oder Atemaussetzer ärztlich abklären. Selbstbehandlung ersetzt keine Diagnose."],
    conflicts: ["Schlafhygiene wird überall empfohlen, die Evidenz für die einzelnen Regeln ist aber schwach; als Teil von CBT-I hat sie ihren Platz. [1][3]"],
    videos: [
      { title: "CBT-I and Behavioral Sleep Medicine Approaches for Insomnia", id: "BM-A_nf5WmQ", channel: "AHAScience", why: "Fachvortrag zu CBT-I.", checked: true },
      { title: "CBT for Insomnia", id: "oYnudJrod8Y", channel: "Psych Hub", why: "Einführung in CBT-I.", checked: true },
    ],
    videoNote: "Zwei Videos gefunden; ein drittes passendes habe ich nicht gefunden.",
    sources: [
      { title: "Qaseem et al. 2016, Annals of Internal Medicine – Management of chronic insomnia disorder in adults: a clinical practice guideline from the American College of Physicians", url: PM("27136449"), kind: "Leitlinie" },
      { title: "American College of Physicians: ACP recommends cognitive behavioral therapy as initial treatment for chronic insomnia", url: "https://www.acponline.org/acp-newsroom/acp-recommends-cognitive-behavioral-therapy-as-initial-treatment-for-chronic-insomnia", kind: "Fachverband" },
      { title: "NHS Every Mind Matters: How to fall asleep faster and sleep better", url: "https://www.nhs.uk/every-mind-matters/mental-wellbeing-tips/how-to-fall-asleep-faster-and-sleep-better/", kind: "Behörde" },
    ],
  },

  "Schlafrhythmus": {
    date: DATE,
    steckbrief: {
      about: "Die innere Uhr verschieben: durch Lichtzeiten, feste Zeiten und – bei klaren Störungen – zeitlich abgestimmtes Melatonin.",
      why: "Helles Licht nach der Körpertemperatur-Talsohle (früh morgens) verschiebt die innere Uhr nach vorn, Licht am Abend nach hinten.",
      tips: "Morgens hell, abends dunkel. Schlafenszeit schrittweise um etwa eine Stunde pro Tag verschieben, nicht auf einmal.",
      safety: "Melatonin ist ein Arzneimittel-Thema; bei Dauerproblemen oder Schichtarbeit ärztlich beraten lassen.",
    },
    learn: [
      "Eine Übersichtsarbeit beschreibt die Phasen-Antwort-Kurve beim Menschen: Helles Licht am frühen Morgen, nach dem Minimum der Körpertemperatur, verschiebt die Uhr nach vorn; Licht am Abend verschiebt sie nach hinten. Melatonin am Abend verschiebt nach vorn, am Morgen nach hinten. [1]",
      "Die AASM-Leitlinien (2007) stufen zeitlich gesteuertes Melatonin für Jetlag, Schichtarbeit, verzögertes Schlafphasen-Syndrom als Standard bzw. Leitlinie ein; für Jetlag nennen sie morgendliches helles Licht und das schrittweise Vorverlegen des Schlafs vor Ostreisen. [1][2]",
      "Die AASM-Leitlinie 2025 zur Schichtarbeit schlägt Melatonin und eine Kombination aus Licht in der Nacht, festen Schlafzeiten am Tag und lichtreduzierenden Brillen am Morgen vor – bei sehr niedriger Evidenzsicherheit. [3]",
    ],
    evidence: { level: "teilweise", why: "Licht und Melatonin verschieben die innere Uhr in Studien nachweisbar; die klinischen Empfehlungen beruhen teils auf Evidenz sehr niedriger Sicherheit." },
    steps: ["Aufstehzeit festlegen, die du halten kannst.", "Nach dem Aufstehen 30 Minuten Tageslicht.", "Abends Licht dimmen, Bildschirme reduzieren.", "Zubettgehzeit pro Tag um bis zu eine Stunde vorverlegen.", "Wochenenden nicht stark abweichen."],
    plan: [{ title: "Woche 1–2", text: "Täglich 1 Stunde früher aufstehen (Vorschlag, aus den Jetlag-Empfehlungen abgeleitet). [2]" }],
    myths: [
      { myth: "Man kann seine innere Uhr beliebig verschieben.", fact: "Die Verschiebung ist begrenzt; Licht und Zeiten wirken schrittweise. [1]" },
      { myth: "Melatonin ist ein Schlafmittel für jeden.", fact: "Die Leitlinien empfehlen es zeitlich gesteuert bei bestimmten Störungen. [2][3]" },
    ],
    mistakes: ["Abends helles Licht, morgens dunkel.", "Zu große Zeitsprünge.", "Melatonin zur falschen Tageszeit."],
    safety: ["Dauerhafte Schlafprobleme ärztlich abklären. Melatonin nur nach Beratung."],
    conflicts: ["Die neue Schichtarbeits-Leitlinie arbeitet mit sehr niedriger Evidenzsicherheit; die Phasen-Antwort-Kurve selbst ist gut gesichert. [1][3]"],
    videos: [],
    videoNote: "Ich habe kein geprüftes Video gefunden.",
    sources: [
      { title: "Sack et al. 2007, Sleep – Circadian rhythm sleep disorders: part I, basic principles, shift work and jet lag disorders (AASM-Review)", url: PM("18041480"), kind: "Übersichtsarbeit" },
      { title: "Morgenthaler et al. 2007, Sleep – Practice parameters for the clinical evaluation and treatment of circadian rhythm sleep disorders (AASM)", url: PM("18041479"), kind: "Leitlinie" },
      { title: "AASM: Leitlinie zu extrinsischen zirkadianen Schlaf-Wach-Störungen (Schichtarbeit), 2025", url: "https://aasm.org/wp-content/uploads/2025/08/Extrinsic-CRSWD-CPG_SWD_May2025.pdf", kind: "Fachverband" },
    ],
  },

  "Polyphasischer Schlaf": {
    date: DATE,
    steckbrief: {
      about: "Schlaf auf mehrere kurze Phasen pro Tag verteilen (z. B. Uberman, Everyman), meist mit sehr wenig Gesamtschlaf.",
      why: "Befürworter versprechen mit ein bis zwei Stunden Schlaf auszukommen. Eine Konsensus-Auswertung fand keinen Nutzen.",
      tips: "Von Experimenten mit stark verkürztem Schlaf ist abzuraten. Wer müde ist, plant besser einen 20-Minuten-Mittagsschlaf.",
      safety: "Verkürzter, zersplitterter Schlaf ist mit gesundheitlichen und Leistungsnachteilen verbunden; nie vor Autofahrten oder gefährlichen Tätigkeiten.",
    },
    learn: [
      "Das Gremium der National Sleep Foundation prüfte 40.672 Veröffentlichungen, von denen 22 relevant waren. Ergebnis: kein Beleg für Vorteile polyphasischer Schlafpläne. Diese und der darin liegende Schlafmangel gehen mit Nachteilen bei körperlicher und psychischer Gesundheit und Leistung einher. [1]",
      "Die Empfehlung des Gremiums: Pläne, die den Gesamtschlaf deutlich verkürzen oder in viele Episoden zerteilen, werden nicht empfohlen. [1]",
    ],
    evidence: { level: "kaum", why: "Für einen Nutzen gibt es keinen Beleg; belegt ist dagegen Schlafmangel mit Nachteilen." },
    steps: ["Statt polyphasisch: ein Hauptschlaf von 7 bis 9 Stunden.", "Bei Müdigkeit ein Nickerchen von etwa 20 Minuten (Vorschlag).", "Schlafbedarf in einer Urlaubswoche ohne Wecker beobachten."],
    plan: [{ title: "Hinweis", text: "Ein Übungsplan für polyphasischen Schlaf wäre nicht verantwortbar: Die Quelle rät von verkürzten Plänen ab. [1]" }],
    myths: [
      { myth: "Mit zwei Stunden Schlaf kommt man gut aus.", fact: "Es gibt keinen Beleg für einen Nutzen; Schlafmangel ist mit Nachteilen verbunden. [1]" },
      { myth: "Wer sich anpasst, merkt nichts.", fact: "Die Auswertung fand Nachteile bei Gesundheit und Leistung. [1]" },
    ],
    mistakes: ["Den Plan über Wochen ohne Kontrolle durchziehen.", "Mit Müdigkeit Auto fahren."],
    safety: ["Dauerhaft verkürzter Schlaf ist mit Gesundheitsrisiken verbunden. [1]"],
    conflicts: ["Die Befürworter berichten Einzelerfahrungen; kontrollierte Studien dazu fehlen. [1]"],
    videos: [],
    videoNote: "Ich habe kein geprüftes Video gefunden; die gefundenen Videos beschreiben die Pläne, ohne sie zu belegen.",
    sources: [
      { title: "Weaver et al. 2021, Sleep Health – Adverse impact of polyphasic sleep patterns in humans: report of the National Sleep Foundation sleep timing and variability consensus panel", url: PM("33795195"), kind: "Konsensus-Bericht" },
    ],
  },

  "Klarträumen": {
    date: DATE,
    steckbrief: {
      about: "Im Traum erkennen, dass man träumt. Gelernt wird mit Traumtagebuch, Realitätschecks und der MILD-Technik (Vorsatz kurz vor dem Einschlafen).",
      why: "Systematische Übersichten sehen MILD als wirksamste geprüfte Technik. Erfolgsaussichten steigen mit gutem Traumerinnern.",
      tips: "Traumtagebuch, Realitätschecks tagsüber, MILD kurz vor dem Einschlafen und schnell einschlafen.",
      safety: "Bei Schlafproblemen oder psychischer Belastung nicht forcieren; es gibt keinen Beleg für Schaden, aber auch wenig Langzeitdaten.",
    },
    learn: [
      "Eine systematische Übersicht (19 Studien, 14 Techniken) kam zu dem Ergebnis: Die Mnemotechnik MILD war die wirksamste; die Methode der Sinneswahrnehmung (SSILD) und Galantamin sind Kandidaten, brauchen aber Wiederholungen. Die Studienqualität war überwiegend mittel. [1]",
      "In der International Lucid Dream Induction Study (355 Teilnehmende) waren MILD und SSILD ähnlich wirksam; eine Kombination brachte keinen Vorteil. Erfolg hing vom Traumerinnern und vom Einschlafen innerhalb von 10 Minuten ab, ohne Nachteil für die Schlafqualität. [2]",
    ],
    evidence: { level: "teilweise", why: "Mehrere kontrollierte und beobachtende Studien zeigen Wirkung; die Qualität ist überwiegend mittel und die Erfolgsquoten schwanken." },
    steps: ["Traumtagebuch gleich nach dem Aufwachen führen.", "Tagsüber Realitätschecks (Hände ansehen, Text zweimal lesen).", "Beim Einschlafen den Vorsatz sagen: „Wenn ich träume, erkenne ich, dass ich träume.“", "Kurz vor dem Einschlafen Traum visualisieren.", "Schnell einschlafen, nicht lange wach bleiben."],
    plan: [
      { title: "Woche 1–2", text: "Nur Traumtagebuch (bessere Erinnerung). [2]" },
      { title: "Woche 3–4", text: "MILD vor dem Einschlafen, jeden Abend, Realitätschecks tagsüber." },
    ],
    myths: [
      { myth: "Klarträumen gelingt sofort.", fact: "Die Erfolgsquoten schwanken; Traumerinnern und schnelles Einschlafen sind Voraussetzungen. [2]" },
      { myth: "Es schadet dem Schlaf.", fact: "In der Studie gab es keinen Nachteil für die Schlafqualität; Langzeitdaten fehlen. [2]" },
    ],
    mistakes: ["Das Traumtagebuch weglassen.", "Zu lange wach bleiben nach dem Vorsatz.", "Zu viel Druck."],
    safety: ["Bei Schlafstörungen oder psychischen Beschwerden nicht forcieren und ärztlich abklären lassen (Vorsichtsregel)."],
    conflicts: ["Die Übersicht sieht MILD vorn; die Studie fand MILD und SSILD gleichwertig. [1][2]"],
    videos: [
      { title: "Lucid Dreaming: The MILD Technique", id: "M8EHMr_AB_Y", channel: "Lucid Power Mind", why: "Erklärung der MILD-Technik.", checked: true },
      { title: "How To Lucid Dream In 3 Minutes (46% Success Rate) MILD Technique For Beginners", id: "IYus3vMplcY", channel: "Explore Lucid Dreaming", why: "Kurze Anleitung; die Erfolgsquote im Titel habe ich nicht geprüft.", checked: true },
    ],
    videoNote: "Zwei Videos von Lern-Kanälen; ein drittes überzeugendes habe ich nicht gefunden.",
    sources: [
      { title: "Tan & Fan 2023, Journal of Sleep Research – A systematic review of new empirical data on lucid dream induction techniques", url: PM("36408823"), kind: "Übersichtsarbeit" },
      { title: "Findings from the International Lucid Dream Induction Study (2020, Frontiers in Psychology)", url: PM("32765385"), kind: "Studie" },
    ],
  },

  "Neurofeedback": {
    date: DATE,
    steckbrief: {
      about: "Du siehst oder hörst deine Hirnaktivität (meist EEG) in Echtzeit und lernst, sie zu steuern.",
      why: "Bei ADHS zeigen die besten kontrollierten Studien keinen klaren Nutzen. Für Gesunde fehlen gute Belege.",
      tips: "Vor einem teuren Heimgerät lieber geprüfte Behandlungen nutzen.",
      safety: "Bei ADHS, Epilepsie oder anderen Erkrankungen keine Behandlung ohne ärztliche Absprache ersetzen.",
    },
    learn: [
      "Die Meta-Analyse von 2025 (JAMA Psychiatry, Randomisierte Studien) stellte fest: Bei Beurteilung durch Personen, die nicht wussten, wer behandelt wurde, zeigte Neurofeedback keine bedeutsame Verbesserung der ADHS-Kernsymptome. [1]",
      "Ältere Auswertung (2016, 13 Studien, 520 Teilnehmende): Es gab Effekte bei den am wenigsten verblindeten Bewertungen, aber nicht bei den wahrscheinlich verblindeten oder in Studien mit Schein-Training. [2]",
    ],
    evidence: { level: "kaum", why: "Die besten Studien mit verblindeter Bewertung finden bei ADHS keinen klaren Nutzen; frühe Effekte stammen aus weniger kontrollierten Studien." },
    steps: ["Zuerst klären, wofür (z. B. ADHS) und ärztlich beraten lassen.", "Anbieter prüfen: Ausbildung, Studiennachweise.", "Erwartungen niedrig halten; Fortschritt mit Tests statt Eindruck messen."],
    plan: [{ title: "Hinweis", text: "Ein Trainingsplan für Anfänger lässt sich aus den Quellen nicht ableiten; belegt ist kein Nutzen bei ADHS. [1]" }],
    myths: [
      { myth: "Neurofeedback behandelt ADHS wirksam.", fact: "Bei verblindeter Bewertung kein bedeutsamer Effekt. [1][2]" },
      { myth: "Mehr Sitzungen helfen sicher.", fact: "Die Meta-Analysen finden keinen überzeugenden Nutzen. [1]" },
    ],
    mistakes: ["Auf Eigenbericht und Erwartung verlassen.", "Bewährte Behandlungen weglassen."],
    safety: ["Bei medizinischen Erkrankungen nur in Absprache mit der Ärztin oder dem Arzt. [1]"],
    conflicts: ["Frühere Studien fanden Effekte bei nicht verblindeten Bewertungen; die verblindete Auswertung nicht. [1][2]"],
    videos: [],
    videoNote: "Ich habe kein geprüftes, kritisches Video gefunden.",
    sources: [
      { title: "Westwood et al. 2025, JAMA Psychiatry – Neurofeedback for ADHD: a systematic review and meta-analysis", url: PM("39661381"), kind: "Übersichtsarbeit" },
      { title: "Cortese et al. 2016, JAACAP – Neurofeedback for ADHD: meta-analysis of clinical and neuropsychological outcomes from randomized controlled trials", url: PM("27238063"), kind: "Übersichtsarbeit" },
    ],
  },

  "Geruchssinn trainieren": {
    date: DATE,
    steckbrief: {
      about: "Riechtraining: täglich bewusst an vier verschiedenen Düften riechen (z. B. Rose, Eukalyptus, Zitrone, Gewürznelke), über Wochen bis Monate.",
      why: "Bei Riechverlust verbessert Riechtraining die Riechleistung. Für Gesunde, die ihren Geruchssinn schärfen wollen, sind die Studien dünn.",
      tips: "Morgens und abends je etwa 20 Sekunden pro Duft, bewusst und mit Aufmerksamkeit, drei Monate lang.",
      safety: "Nur geeignete, nicht reizende Düfte, nichts Giftiges. Bei plötzlichem Riechverlust ärztlich abklären.",
    },
    learn: [
      "Die Übersichtsarbeit von Pekala et al. (2016, 10 Studien, 639 Patientinnen und Patienten) fand nach Riechtraining eine bessere Riechleistung (TDI-Score +3,77), vor allem bei Unterscheiden und Erkennen, nicht bei der Schwelle. [1]",
      "Die Meta-Analyse von 2024 (36 Artikel) fand einen mittleren bis großen, uneinheitlichen Effekt auf die Riechfunktion; Dauer, Alter und Anosmie-Diagnose beeinflussten das Ergebnis. [2]",
    ],
    evidence: { level: "teilweise", why: "Für Riechverlust gut untersucht, mit einheitlichem Effekt; für gesunde Menschen fehlen Belege." },
    steps: ["Vier Düfte aus verschiedenen Duftfamilien wählen (z. B. Rose, Eukalyptus, Zitrone, Nelke).", "Jeweils etwa 20 Sekunden bewusst riechen.", "Dabei den Duft vorstellen und benennen.", "Morgens und abends wiederholen.", "Nach etwa drei Monaten Duftset wechseln (Studienprotokoll aus der Recherche)."],
    plan: [{ title: "12 Wochen", text: "Täglich zweimal: vier Düfte à 20 Sekunden, Kurzprotokoll in einem Heft. Vorschlag, aus üblichen Studienprotokollen." }],
    myths: [
      { myth: "Riechtraining schärft jeden Geruchssinn.", fact: "Belegt ist es bei Riechverlust; Effekte bei Gesunden sind nicht gezeigt. [1][2]" },
      { myth: "Nach ein paar Tagen merkt man Fortschritt.", fact: "Studien laufen über Monate. [1][2]" },
    ],
    mistakes: ["Zu kurz üben.", "Nur an einem Duft riechen.", "Ohne Aufmerksamkeit riechen."],
    safety: ["Plötzlicher Riechverlust ist ärztlich abzuklären."],
    conflicts: ["Die Effektgröße ist je nach Studie und Gruppe sehr unterschiedlich. [2]"],
    videos: [],
    videoNote: "Ich habe kein geprüftes Video gefunden; Anleitungen stammen aus Studienprotokollen.",
    sources: [
      { title: "Pekala et al. 2016, International Forum of Allergy & Rhinology – Efficacy of olfactory training in patients with olfactory loss: a systematic review and meta-analysis", url: PM("26624966"), kind: "Übersichtsarbeit" },
      { title: "Delgado-Lima et al. 2024, European Archives of Oto-Rhino-Laryngology – The efficacy of olfactory training in improving olfactory function: a meta-analysis", url: PM("38802578"), kind: "Übersichtsarbeit" },
    ],
  },

  "Echoortung": {
    date: DATE,
    steckbrief: {
      about: "Mit Zungenklicks und dem Hören der Echos Räume und Gegenstände wahrnehmen – eine Fähigkeit mancher blinder Menschen.",
      why: "Studien zeigen, dass geübte blinde Menschen mit Klicks Objekte orten und dabei Teile der Sehrinde nutzen.",
      tips: "In ruhigen Räumen üben, mit Klicken und Zuhören auf Veränderungen: Wände, Türen, Gegenstände.",
      safety: "Im Alltag kein Ersatz für Blindenstock oder Orientierungstraining. Im Straßenverkehr nicht verlassen.",
    },
    learn: [
      "Thaler et al. (2011) untersuchten zwei erfahrene blinde Echoortungs-Experten (einer von früh, einer von spät erblindet) mit Hirnscans: Beim Hören der eigenen Klicks mit Echos war die Sehrinde (Calcarine-Cortex) aktiv, die Hörrinde nicht stärker. Beim frühblinden Experten war die Sehrinde auf die Seite des Echos abgestimmt. [1]",
      "Die Studie zeigt, dass Echoortung eine erlernbare Fähigkeit sein kann; zum Lernen durch Sehende habe ich in meiner Recherche keine geprüfte Studie gefunden (nicht belegt).",
    ],
    evidence: { level: "teilweise", why: "Die Fähigkeit bei geübten blinden Menschen ist belegt; wie gut Sehende sie lernen, habe ich nicht belegen können." },
    steps: ["In einem ruhigen Raum mit einem kurzen, scharfen Zungenklick beginnen.", "Auf das Echo hören, besonders bei Wänden und Türen.", "Gegenstände in verschiedenen Entfernungen aufstellen und mit geschlossenen Augen erkunden.", "Immer mit sicherem Raum und einer Begleitperson üben."],
    plan: [{ title: "Woche 1–4", text: "Täglich 10 Minuten in sicherer Umgebung üben (Vorschlag; es gibt keinen belegten Plan für Sehende)." }],
    myths: [
      { myth: "Echoortung ist ein Supersinn.", fact: "Es ist eine erlernbare Fähigkeit, die mit Übung und Erfahrung wächst. [1]" },
      { myth: "Jeder kann sie schnell lernen.", fact: "Für Sehende habe ich keine geprüfte Lernstudie gefunden." },
    ],
    mistakes: ["Zu leise oder unklare Klicks.", "Auf unsicherem Terrain üben.", "Echoortung als Ersatz für sichere Hilfsmittel sehen."],
    safety: ["Nie im Straßenverkehr oder mit geschlossenen Augen auf unsicherem Boden üben."],
    conflicts: ["Popularisierende Berichte klingen übertrieben; die Studie beschreibt nur Hirnaktivität bei zwei Experten. [1]"],
    videos: [
      { title: "Daniel Kish: How I use sonar to navigate the world", id: "uH0aihGWB8U", channel: "TED", why: "Vortrag eines Praktikers und Lehrers der Echoortung.", checked: true },
      { title: "A Blind Teacher Using Echolocation to Navigate the World | Echo | The New Yorker Documentary", id: "60jYofFXDxw", channel: "The New Yorker", why: "Kurzdokumentation über Daniel Kish.", checked: true },
      { title: "Teaching the blind to navigate the world using tongue clicks: Daniel Kish at TEDxGateway 2012", id: "ob-P2a6Mrjs", channel: "TEDx Talks", why: "Zweiter Vortrag mit Beispielen.", checked: true },
    ],
    sources: [
      { title: "Thaler, Arnott & Goodale 2011, PLOS ONE – Neural correlates of natural human echolocation in early and late blind echolocation experts", url: PM("21633496"), kind: "Studie" },
    ],
  },
};

// „Kälte aushalten“ behandelt dasselbe Thema (Kälte gezielt aushalten) und nutzt dasselbe Dossier.
DOSSIERS_ATMUNG["Kälte aushalten"] = DOSSIERS_ATMUNG["Kälteexposition"];
