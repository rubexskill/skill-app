import type { Dossier } from "./dossiers";

// Kategorie „Gewohnheiten“ (kurze Dossiers, Teil 2).
// Recherchiert am 23. November 2026. Studien über PubMed bzw. Crossref geprüft (Titel, Autoren, Abstract); Aussagen stehen nur, wenn sie im Abstract stehen.
const DATE = "23. November 2026";
const PM = (id: string) => `https://pubmed.ncbi.nlm.nih.gov/${id}/`;

const LALLY = { title: "Lally et al. 2010, European Journal of Social Psychology – How are habits formed: Modelling habit formation in the real world", url: "https://doi.org/10.1002/ejsp.674", kind: "Beobachtungsstudie" };
const WHO = { title: "Bull et al. 2020, British Journal of Sports Medicine – World Health Organization 2020 guidelines on physical activity and sedentary behaviour", url: PM("33239350"), kind: "Leitlinie" };

export const DOSSIERS_GEWOHNHEITEN2: Record<string, Dossier> = {
  "30 Tage Schlaf": {
    date: DATE,
    steckbrief: {
      about: "Einen Monat lang Schlafdauer und Einschlafzeit bewusst festlegen und aufschreiben, mit dem Ziel, regelmäßiger und länger zu schlafen.",
      why: "In einer Studie mit 80 Erwachsenen mit Übergewicht, die gewöhnlich unter 6,5 Stunden schliefen, verlängerte eine Beratung zu Schlafhygiene den Schlaf um etwa 1,2 Stunden pro Nacht; die Energieaufnahme sank um 270 kcal pro Tag. Eine Meta-Analyse von 65 Studien fand, dass bessere Schlafqualität die psychische Gesundheit verbessert.",
      tips: "Feste Bettzeit und Aufstehzeit wählen, Schlaf kurz notieren (Vorschlag). Ein Monat ist kein Zauberwert: Gewohnheiten brauchten in einer Studie 18 bis 254 Tage, bis sie automatisch liefen.",
      safety: "Bei anhaltenden Ein- oder Durchschlafproblemen, starker Tagesmüdigkeit oder Atemaussetzern im Schlaf ärztlich abklären lassen (Vorsichtsregel, keine Leitlinie).",
    },
    learn: [
      "Die Studie von Tasali et al. (2022): 80 Erwachsene (21–40 Jahre, Übergewicht, Schlaf gewöhnlich unter 6,5 Stunden) bekamen entweder eine individuelle Schlafhygiene-Beratung mit dem Ziel 8,5 Stunden im Bett oder schliefen weiter wie gewohnt. Die Beratungsgruppe schlief etwa 1,2 Stunden pro Nacht länger und nahm laut Messung (doppelt markiertes Wasser) 270 kcal pro Tag weniger Energie auf; Gewicht sank im Vergleich zur Kontrollgruppe. [1]",
      "Eine Meta-Analyse von 65 randomisierten Studien (8.608 Teilnehmende) fand: Wer den Schlaf verbessert, verbessert auch die psychische Gesundheit (mittlere Effekte, z. B. Depression g+ = −0,63). Größere Schlafverbesserungen gingen mit größerer Besserung einher. [2]",
      "In einer Meta-Analyse von Kohortenstudien lag das geringste Sterberisiko bei etwa 7 Stunden Schlaf pro Tag; weniger und mehr Schlaf waren mit höherem Risiko verbunden. Das sind Zusammenhänge, kein Nachweis, dass Schlafzeit die Ursache ist. [3]",
      "Zur Frage „Reicht ein Monat?“: In der Studie von Lally et al. wählten 96 Freiwillige ein tägliches Verhalten und wurden 12 Wochen begleitet. Bis zu 95 % ihrer erreichbaren Automatik brauchten sie 18 bis 254 Tage; einmal auszulassen schadete dem Prozess nicht wesentlich. [4]",
    ],
    evidence: { level: "teilweise", why: "Eine randomisierte Studie und eine Meta-Analyse stützen den Nutzen besserer Schlafqualität und -dauer; die Mortalitätsdaten sind nur Beobachtung." },
    steps: [
      "Ziel-Schlafzeit und feste Aufstehzeit festlegen (Vorschlag).",
      "Jeden Morgen kurz notieren: ins Bett, aufgestanden, geschätzte Schlafdauer (Vorschlag).",
      "Bildschirme und helles Licht vor dem Schlafen reduzieren (Vorschlag).",
      "Nach 30 Tagen Notizen ansehen und die Zeiten anpassen.",
    ],
    plan: [
      { title: "Woche 1–2", text: "Nur die Aufstehzeit festhalten und die Schlafdauer notieren (Vorschlag)." },
      { title: "Woche 3–4", text: "Bettzeit schrittweise um 15 Minuten vorverlegen, bis die Zielzeit erreicht ist (Vorschlag)." },
    ],
    myths: [
      { myth: "Nach 30 Tagen ist eine Gewohnheit sicher fest.", fact: "In der Studie von Lally et al. lag die Zeit bis zur Automatik zwischen 18 und 254 Tagen. [4]" },
    ],
    mistakes: ["Am Wochenende stark von der Wochenzeit abweichen (Vorschlag).", "Die Schlafdauer zwanghaft messen und darüber das Einschlafen erschweren (Vorsichtsregel, keine Leitlinie)."],
    safety: ["Bei Schlafproblemen länger als einige Wochen ärztlich Rat holen (Vorsichtsregel, keine Leitlinie)."],
    conflicts: ["Der Zusammenhang von Schlafdauer und Sterberisiko ist beobachtend; auch langer Schlaf geht mit erhöhtem Risiko einher, was nicht heißt, dass mehr Schlaf schadet. [3]", "Die Studie von Tasali et al. untersuchte nur Erwachsene mit Übergewicht und kurzem Schlaf; für andere Gruppen ist die Übertragung offen. [1]"],
    videos: [],
    videoNote: "Kein geprüftes Video eingebunden. Siehe auch das Dossier „Besser schlafen“.",
    sources: [
      { title: "Tasali et al. 2022, JAMA Internal Medicine – Effect of Sleep Extension on Objectively Assessed Energy Intake Among Adults With Overweight in Real-life Settings", url: PM("35129580"), kind: "Randomisierte Studie" },
      { title: "Scott et al. 2021, Sleep Medicine Reviews – Improving sleep quality leads to better mental health: A meta-analysis of randomised controlled trials", url: PM("34607184"), kind: "Meta-Analyse" },
      { title: "Yin et al. 2017, Journal of the American Heart Association – Relationship of Sleep Duration With All-Cause Mortality and Cardiovascular Events", url: PM("28889101"), kind: "Meta-Analyse" },
      LALLY,
    ],
  },

  "30 Tage Sport": {
    date: DATE,
    steckbrief: {
      about: "Einen Monat lang jede Sporteinheit festhalten (Art, Dauer, Gefühl), um Regelmäßigkeit aufzubauen.",
      why: "Die WHO empfiehlt Erwachsenen 150–300 Minuten moderate Bewegung pro Woche; eine Auswertung von 12 Studien fand, dass Aktivitätstracker die Bewegung kurzfristig leicht steigern können.",
      tips: "Ein Zielwert pro Woche statt täglicher Pflicht: einmal auszulassen schadete in einer Studie dem Gewohnheitsaufbau nicht wesentlich. Notiere auch kurze Einheiten.",
      safety: "Bei Beschwerden in Brust, Herz oder Gelenken oder nach langer Pause vorher ärztlich fragen (Vorsichtsregel, keine Leitlinie). Langsam steigern.",
    },
    learn: [
      "Die WHO-Leitlinien 2020 empfehlen allen Erwachsenen 150–300 Minuten moderate oder 75–150 Minuten intensive Ausdaueraktivität pro Woche (oder eine Kombination) sowie regelmäßiges Muskeltraining. Etwas Bewegung sei besser als keine. [1]",
      "Zum Tracken: Eine Meta-Analyse von 12 randomisierten Studien (1.693 gesunde Erwachsene) fand, dass tragbare Tracker mit einer mäßigen kurzfristigen Steigerung der Aktivität verbunden waren (SMD 0,449); in Teilanalysen zeigte sich kein klarer Nutzen für Aktivität oder Gewichtsabnahme. [2]",
      "Zum Dranbleiben: In der Studie von Lally et al. dauerte es 18 bis 254 Tage, bis ein tägliches Verhalten automatisch lief; ein ausgelassener Tag fiel nicht wesentlich ins Gewicht. [3]",
    ],
    evidence: { level: "gut", why: "Für den Nutzen von Bewegung gibt es eine WHO-Leitlinie; für das Tracken nur kleine, kurzfristige Effekte." },
    steps: [
      "Wochenziel in Minuten festlegen, z. B. in Richtung der WHO-Spanne (Vorschlag).",
      "Nach jeder Einheit Art, Dauer und Anstrengung notieren.",
      "Wöchentlich die Summe bilden.",
      "Nach 30 Tagen entscheiden, welche Aktivität bleibt.",
    ],
    plan: [
      { title: "Woche 1–2", text: "Mit dem anfangen, was schon möglich ist, und die Minuten zählen (Vorschlag)." },
      { title: "Woche 3–4", text: "Wochenminuten um etwa 10 bis 20 Prozent erhöhen und an zwei Tagen Muskeltraining einplanen (Vorschlag)." },
    ],
    myths: [
      { myth: "Nur lange, harte Einheiten zählen.", fact: "Die WHO betont, dass etwas Bewegung besser ist als keine. [1]" },
    ],
    mistakes: ["Gleich zu viel planen und nach dem ersten Ausfall aufgeben.", "Nur Ausdauer, kein Muskeltraining (die WHO empfiehlt beides). [1]"],
    safety: ["Bei Schmerzen, Schwindel oder Atemnot abbrechen und ärztlich abklären (Vorsichtsregel, keine Leitlinie)."],
    conflicts: ["Tracker-Studien zeigen in Gesamtauswertung einen Effekt, in Teilanalysen keinen klaren; die Studien sind kurz. [2]"],
    videos: [],
    videoNote: "Kein geprüftes Video eingebunden.",
    sources: [
      WHO,
      { title: "Tang et al. 2020, JMIR mHealth and uHealth – Effectiveness of Wearable Trackers on Physical Activity in Healthy Adults", url: PM("32706685"), kind: "Meta-Analyse" },
      LALLY,
    ],
  },

  "Täglich ins Gym": {
    date: DATE,
    steckbrief: {
      about: "Jeden Tag trainieren gehen, als feste Routine.",
      why: "Die WHO empfiehlt regelmäßiges Muskeltraining und 150–300 Minuten moderate Aktivität pro Woche. Eine Empfehlung für tägliches Training oder gegen Ruhetage steht im gelesenen Abstract nicht.",
      tips: "Eher feste Wochenstruktur mit leichten Tagen und Ruhetagen als täglich volle Belastung (Vorschlag).",
      safety: "Bei anhaltenden Schmerzen, Schwindel oder Brustbeschwerden Training stoppen und ärztlich abklären (Vorsichtsregel, keine Leitlinie).",
    },
    learn: [
      "Die WHO-Leitlinien 2020 empfehlen Erwachsenen 150–300 Minuten moderate oder 75–150 Minuten intensive Ausdaueraktivität pro Woche und regelmäßiges Muskeltraining; die Mengen sind Wochenwerte, keine Tagespflicht. [1]",
      "Für den Aufbau einer Routine: In der Studie von Lally et al. fiel ein einzelner ausgelassener Tag nicht wesentlich ins Gewicht; die Zeit bis zur Automatik reichte von 18 bis 254 Tagen. Eine strikte „nie auslassen“-Regel ist dafür also nicht nötig. [2]",
      "Aussagen zu Erholung und Überlastung bei täglichem Krafttraining habe ich in dieser Recherche nicht belegt; hier gilt nur die Vorsichtsregel, Belastung zu variieren.",
    ],
    evidence: { level: "teilweise", why: "Bewegung insgesamt ist durch die WHO-Leitlinie gestützt; für „täglich“ speziell fehlt in den gelesenen Quellen ein Beleg." },
    steps: [
      "Wochenplan mit Trainingsschwerpunkten aufstellen (Vorschlag).",
      "Mindestens einen Tag leicht oder frei lassen (Vorsichtsregel, keine Leitlinie).",
      "Jede Einheit kurz notieren.",
    ],
    plan: [
      { title: "Woche 1–2", text: "Vier Tage Gym, dazwischen Spaziergang oder frei (Vorschlag)." },
      { title: "Danach", text: "Auf fünf Tage erhöhen, wenn Schlaf und Gefühl passen (Vorschlag)." },
    ],
    myths: [
      { myth: "Wer nicht täglich geht, verliert die Routine.", fact: "Ein ausgelassener Tag wirkte sich in der Studie von Lally et al. nicht wesentlich aus. [2]" },
    ],
    mistakes: ["Jeden Tag mit voller Last trainieren (Vorsichtsregel, keine Leitlinie).", "Training nur nach Gefühl für „heute war ich da“ zählen."],
    safety: ["Bei Schmerzen nicht durchtrainieren, medizinischen Rat holen (Vorsichtsregel, keine Leitlinie)."],
    conflicts: ["Die Leitlinie nennt Wochenmengen; ob tägliches Training Vorteile bringt, wird in den gelesenen Quellen nicht beantwortet. [1]"],
    videos: [],
    videoNote: "Kein geprüftes Video eingebunden. Siehe auch das Dossier „Gym-Plan“.",
    sources: [WHO, LALLY],
  },

  "Öfter rausgehen": {
    date: DATE,
    steckbrief: {
      about: "Mehr Zeit draußen verbringen, am besten in Grünflächen und mit etwas Bewegung.",
      why: "Eine Meta-Analyse von 15 randomisierten Studien (980 Erwachsene) fand einen mäßigen positiven Effekt von Bewegung im städtischen Grün auf die psychische Gesundheit (SMD −0,40).",
      tips: "Kurze, regelmäßige Runden, mindestens dreimal pro Woche, bis etwa 20 Minuten, in lockerem Tempo. Das waren die Muster mit den stärksten Effekten in der Auswertung.",
      safety: "Wetter, Verkehr und Dunkelheit beachten; bei Herz- oder Kreislaufbeschwerden vorher ärztlich fragen (Vorsichtsregel, keine Leitlinie).",
    },
    learn: [
      "Die Meta-Analyse (Hu et al. 2025) umfasste 15 randomisierte Studien mit 980 Erwachsenen. Bewegung in städtischen Grünflächen verbesserte die psychische Gesundheit mäßig (SMD −0,40; 95-%-KI −0,56 bis −0,25), bei geringer Heterogenität. [1]",
      "Besonders ausgeprägt waren die Effekte bei kurzer Interventionsdauer (unter 12 Wochen), mindestens dreimal pro Woche, Einheiten von höchstens 20 Minuten und niedriger bis mittlerer Intensität. [1]",
      "Die Studien kombinieren Natur und Bewegung; ob der Effekt aus der Natur, der Bewegung oder beidem stammt, lässt sich daraus nicht trennen (Einordnung).",
    ],
    evidence: { level: "teilweise", why: "Eine Meta-Analyse randomisierter Studien zeigt einen mäßigen Effekt; die Grundstudien sind klein und kombinieren Natur mit Bewegung." },
    steps: [
      "Eine feste Zeit am Tag für „raus“ wählen (Vorschlag).",
      "Zielort mit Grün (Park, Wald, Fluss) einplanen.",
      "Handy in der Tasche lassen (Vorschlag).",
    ],
    plan: [
      { title: "Woche 1–2", text: "Dreimal pro Woche 20 Minuten Grünfläche (nach dem Muster der Studie; Vorschlag)." },
      { title: "Danach", text: "Einmal pro Woche eine längere Runde ergänzen (Vorschlag)." },
    ],
    myths: [
      { myth: "Man braucht lange Wanderungen, damit es wirkt.", fact: "Die stärksten Effekte zeigten Einheiten von höchstens 20 Minuten. [1]" },
    ],
    mistakes: ["Nur am Wochenende draußen sein (Vorschlag).", "Zu hohe Intensität: Die besten Effekte lagen bei niedriger bis mittlerer. [1]"],
    safety: ["Bei Erkrankungen ärztlich abklären, welche Belastung passt (Vorsichtsregel, keine Leitlinie)."],
    conflicts: ["Die Auswertung untersucht grüne Bewegung in Städten; sie sagt nichts über reines Draußensein ohne Bewegung. [1]"],
    videos: [],
    videoNote: "Kein geprüftes Video eingebunden. Siehe auch das Dossier „Langer Spaziergang“.",
    sources: [
      { title: "Hu et al. 2025, Frontiers in Public Health – Effects of urban green exercise on mental health: a systematic review and meta-analysis", url: PM("41080844"), kind: "Meta-Analyse" },
    ],
  },

  "Morgens ohne Handy": {
    date: DATE,
    steckbrief: {
      about: "Die ersten 30 Minuten nach dem Aufstehen das Handy nicht benutzen.",
      why: "Diese konkrete Regel wurde in den gelesenen Studien nicht untersucht. Eine Feldstudie mit 112 Personen fand, dass weniger Bildschirmzeit nicht sofort das Wohlbefinden verbesserte.",
      tips: "Handy außerhalb des Schlafzimmers laden und einen Wecker nutzen (Vorschlag). Die ersten 30 Minuten für Anziehen, Frühstück, Wasser oder ein paar Minuten Bewegung nutzen.",
      safety: "Keine Gesundheitsrisiken bekannt. Wer das Handy als Wecker oder für medizinische Warnungen braucht, soll diese Funktionen behalten (Vorsichtsregel, keine Leitlinie).",
    },
    learn: [
      "Direkt zu den ersten Minuten am Morgen habe ich keine Studie gelesen. Die Regel ist eine Gewohnheitsidee, deren Nutzen nicht belegt ist.",
      "Eine vorregistrierte Feldstudie (Zimmermann et al. 2023, N = 112) verglich Graustufenmodus, Selbstverpflichtung zu Zeitlimits und bloßes Messen. Graustufen senkten die gemessene Bildschirmzeit sofort deutlich, Zeitlimits weniger und langsamer. Einen sofortigen kausalen Effekt der geringeren Nutzung auf Wohlbefinden und Studienleistung gab es nicht. [1]",
      "Zum Gewohnheitsaufbau: In der Studie von Lally et al. brauchten Freiwillige zwischen 18 und 254 Tagen, bis ein tägliches Verhalten automatisch lief, am besten in gleichbleibendem Kontext (z. B. „nach dem Aufstehen“). [2]",
    ],
    evidence: { level: "kaum", why: "Für die konkrete Regel liegt keine Studie vor; die verwandten Studien zeigen nur, dass sich Bildschirmzeit senken lässt." },
    steps: [
      "Handy abends außer Reichweite des Betts laden (Vorschlag).",
      "Analogen Wecker oder Handy-Wecker im Flugmodus verwenden (Vorschlag).",
      "Eine feste Morgenroutine ohne Handy festlegen, z. B. Wasser, Frühstück, Fenster öffnen (Vorschlag).",
      "Wöchentlich notieren, an wie vielen Tagen es geklappt hat.",
    ],
    plan: [
      { title: "Woche 1–2", text: "Erst 10 Minuten ohne Handy, dann 20 (Vorschlag)." },
      { title: "Woche 3–4", text: "Ziel 30 Minuten, auch am Wochenende (Vorschlag)." },
    ],
    myths: [
      { myth: "Weniger Handyzeit macht sofort glücklicher.", fact: "In der Feldstudie von Zimmermann et al. verbesserte weniger Nutzung das Wohlbefinden nicht sofort. [1]" },
    ],
    mistakes: ["Das Handy im Schlafzimmer lassen und nur Willenskraft einsetzen (Vorschlag).", "Nach einem Ausrutscher aufgeben: ein Ausfall schadete dem Gewohnheitsaufbau nicht wesentlich. [2]"],
    safety: ["Notrufbereitschaft und medizinische Geräte-Apps nicht abschalten (Vorsichtsregel, keine Leitlinie)."],
    conflicts: ["Ob eine handyfreie Morgenzeit einen Nutzen hat, ist unbelegt; die Studie von Zimmermann et al. betraf mehrwöchige Gesamtreduktion, nicht den Morgen. [1]"],
    videos: [],
    videoNote: "Kein geprüftes Video eingebunden.",
    sources: [
      { title: "Zimmermann et al. 2023, Cyberpsychology, Behavior and Social Networking – Digital Strategies for Screen Time Reduction: A Randomized Field Experiment", url: PM("36577008"), kind: "Randomisierte Studie" },
      LALLY,
    ],
  },

  "Handy weg beim Lernen": {
    date: DATE,
    steckbrief: {
      about: "Beim Lernen das Handy in einen anderen Raum legen.",
      why: "Eine Meta-Analyse von 45 Studien fand einen kleinen negativen Zusammenhang zwischen Smartphone-Nutzung und Studienleistung (r = −0,12); Multitasking im Unterricht zeigte den stärksten negativen Effekt. Dass schon die bloße Anwesenheit des Handys die Leistung senkt, bestätigte eine Nachfolgestudie nicht.",
      tips: "Handy in einen anderen Raum legen, damit die Versuchung gar nicht erst entsteht (Vorschlag). Lernzeiten mit klaren Pausen festlegen.",
      safety: "Keine Risiken. Erreichbarkeit für Notfälle bei Bedarf über eine feste Pause oder einen Anruffilter sichern (Vorsichtsregel, keine Leitlinie).",
    },
    learn: [
      "Eine Meta-Analyse (Hsieh 2025) mit 45 Studien fand einen kleinen, signifikant negativen Effekt der Smartphone-Nutzungshäufigkeit auf die Studienleistung (r = −0,12). Smartphone-Sucht und problematische Nutzung wirkten stärker negativ als allgemeine Nutzung; Multitasking im Unterricht war das ungünstigste Verhalten. Es sind Zusammenhänge, keine Ursachennachweise. [1]",
      "Eine weitere Meta-Analyse (29 Studien, 48.490 Personen) fand für problematische Smartphone-Nutzung ebenfalls einen kleinen negativen Zusammenhang mit Schulleistungen (r = −0,110). [2]",
      "Ob schon die Anwesenheit des Handys auf dem Tisch Gedächtnis kostet, ist umstritten: Hartmann et al. fanden keinen Gesamteffekt auf Kurzzeit- und prospektives Gedächtnis; nur bei Personen mit geringer Smartphone-Abhängigkeit war die Leistung ohne Handy besser. [3]",
    ],
    evidence: { level: "teilweise", why: "Nutzung hängt leicht mit schlechterer Leistung zusammen; für das bloße Weglegen fehlt ein klarer Beleg." },
    steps: [
      "Vor dem Lernen Handy in einen anderen Raum legen.",
      "Lernblock von 25 bis 50 Minuten festlegen, danach Pause mit Handy (Vorschlag).",
      "Benachrichtigungen für die Lernzeit ausschalten (Vorschlag).",
    ],
    plan: [
      { title: "Woche 1–2", text: "Handy bei jeder Lerneinheit in einem anderen Raum (Vorschlag)." },
      { title: "Danach", text: "Ablenkungen notieren und prüfen, ob die Konzentration besser ist (Vorschlag)." },
    ],
    myths: [
      { myth: "Schon ein Handy auf dem Tisch senkt sicher das Denkvermögen.", fact: "Die Nachfolgestudie von Hartmann et al. fand keinen Gesamteffekt auf Kurzzeit- und prospektives Gedächtnis. [3]" },
    ],
    mistakes: ["Handy neben dem Buch liegen lassen und sich nur auf Disziplin verlassen (Vorschlag).", "Multitasking im Unterricht: Es war in der Meta-Analyse das ungünstigste Verhalten. [1]"],
    safety: ["Erreichbarkeit für Notfälle bewusst regeln (Vorsichtsregel, keine Leitlinie)."],
    conflicts: ["Studien zur reinen Anwesenheit des Handys widersprechen sich. [3]", "Die Meta-Analysen beruhen auf Zusammenhängen, oft mit Selbstauskunft. [1][2]"],
    videos: [],
    videoNote: "Kein geprüftes Video eingebunden.",
    sources: [
      { title: "Hsieh 2025, Acta Psychologica – The impact of smartphone usage frequency on university students' academic performance: A meta-analysis of moderating factors", url: PM("40795445"), kind: "Meta-Analyse" },
      { title: "Paterna et al. 2024, Journal of Behavioral Addictions – Problematic smartphone use and academic achievement: A systematic review and meta-analysis", url: PM("38669081"), kind: "Meta-Analyse" },
      { title: "Hartmann et al. 2020, Consciousness and Cognition – Does a smartphone on the desk drain our brain? No evidence of cognitive costs due to smartphone presence in a short-term and prospective memory task", url: PM("33137560"), kind: "Experiment" },
    ],
  },

  "Social Media löschen": {
    date: DATE,
    steckbrief: {
      about: "Social-Media-Apps löschen oder eine Pause einlegen.",
      why: "In einer randomisierten Studie mit 154 Personen verbesserte eine einwöchige Pause von Facebook, Instagram, Twitter und TikTok Wohlbefinden, Depression und Angst gegenüber der Kontrollgruppe. Eine andere Studie fand nach einer Woche Pause bei jungen Frauen höhere Körperzufriedenheit und höheres Selbstwertgefühl.",
      tips: "Apps löschen statt nur Benachrichtigungen abstellen (Vorschlag). Eine Woche als Test ist ein sinnvoller erster Schritt, wie in den Studien.",
      safety: "Wenn Social Media der einzige Kontakt zu Unterstützung ist, andere Kontaktwege vorher sichern (Vorsichtsregel, keine Leitlinie). Bei starker Belastung Hilfe suchen.",
    },
    learn: [
      "Lambert et al. (2022): 154 Personen (Durchschnittsalter 29,6) wurden zufällig zugeteilt, 1 Woche lang Facebook, Twitter, Instagram und TikTok nicht zu nutzen oder wie gewohnt weiterzumachen. Nach einer Woche hatte die Pausengruppe bessere Werte bei Wohlbefinden (MD 4,9), Depression (MD −2,2) und Angst (MD −1,7). Die Effekte liefen teilweise über weniger Nutzungszeit. Langzeitwirkung und klinische Gruppen sind nicht untersucht. [1]",
      "Smith et al. (2024): 66 Studentinnen nahmen 1 Woche Pause oder nutzten weiter. Die Pausengruppe hatte höhere Körperzufriedenheit und höheren Selbstwert, besonders bei hoher Verinnerlichung des Schlankheitsideals. [2]",
      "Gegenbild: In der Feldstudie von Zimmermann et al. (N = 112) ließ geringere Smartphone-Nutzung das Wohlbefinden nicht sofort steigen. Es ging um Bildschirmzeit insgesamt, nicht um Social Media allein. [3]",
    ],
    evidence: { level: "teilweise", why: "Zwei kurze randomisierte Studien zeigen Vorteile nach einer Woche; Langzeitwirkung ist unbekannt, und eine verwandte Studie zeigte keinen Effekt." },
    steps: [
      "Entscheiden, welche Apps weg sollen, und sie löschen.",
      "Wichtige Kontakte über andere Wege (Telefon, Messenger) sichern (Vorschlag).",
      "Eine Woche testen, jeden Tag kurz Stimmung notieren (Vorschlag).",
      "Danach entscheiden: dauerhaft löschen oder mit Zeitlimit zurückkehren.",
    ],
    plan: [
      { title: "Woche 1", text: "Alle gewählten Apps löschen, Stimmung täglich notieren (Vorschlag)." },
      { title: "Woche 2–4", text: "Pause fortsetzen und auswerten, ob sich etwas verändert (Vorschlag)." },
    ],
    myths: [
      { myth: "Weniger Handynutzung macht automatisch zufriedener.", fact: "In der Feldstudie von Zimmermann et al. blieb das Wohlbefinden bei geringerer Nutzung zunächst unverändert. [3]" },
    ],
    mistakes: ["Den Account behalten und die App sofort wieder installieren (Vorschlag).", "Die Ersatzzeit nicht planen und stattdessen andere Apps nutzen (Vorschlag)."],
    safety: ["Kontakt zu Menschen anderweitig sichern; bei Niedergeschlagenheit ärztliche oder psychologische Hilfe suchen (Vorsichtsregel, keine Leitlinie)."],
    conflicts: ["Die Studien beobachten nur eine Woche; ob die Vorteile bleiben, ist offen. [1][2]", "Die Feldstudie zur Bildschirmzeit fand keinen sofortigen Wohlbefindenseffekt. [3]"],
    videos: [],
    videoNote: "Kein geprüftes Video eingebunden.",
    sources: [
      { title: "Lambert et al. 2022, Cyberpsychology, Behavior and Social Networking – Taking a One-Week Break from Social Media Improves Well-Being, Depression, and Anxiety: A Randomized Controlled Trial", url: PM("35512731"), kind: "Randomisierte Studie" },
      { title: "Smith et al. 2024, Body Image – Out of the loop: Taking a one-week break from social media leads to better self-esteem and body image among young women", url: PM("38692094"), kind: "Randomisierte Studie" },
      { title: "Zimmermann et al. 2023, Cyberpsychology, Behavior and Social Networking – Digital Strategies for Screen Time Reduction: A Randomized Field Experiment", url: PM("36577008"), kind: "Randomisierte Studie" },
    ],
  },

  "Sachbücher lesen": {
    date: DATE,
    steckbrief: {
      about: "Regelmäßig Sachbücher lesen, um Wissen aufzubauen.",
      why: "In einer Kohortenstudie mit 3.635 Personen hatten Buchleser über 12 Jahre ein um 20 Prozent geringeres Sterberisiko als Nichtleser. Das Ergebnis gilt für Bücher allgemein, nicht gezielt für Sachbücher, und ist nur ein Zusammenhang.",
      tips: "Kleine feste Lesezeit, Notizen oder eine Zusammenfassung pro Kapitel (Vorschlag). Ein Buch zu Ende zu lesen ist nicht Pflicht.",
      safety: "Keine bekannten Risiken. Beim Lesen auf Pausen und Licht achten (Vorschlag).",
    },
    learn: [
      "In der Studie von Bavishi et al. (Health and Retirement Study, 3.635 Personen, Beobachtung bis zu 12 Jahre) war Bücherlesen mit längerem Überleben verbunden: dosisabhängig und stärker als Zeitungs- oder Zeitschriftenlesen. Nach Anpassung für viele Merkmale lag die Hazard Ratio bei 0,80; Kognition erklärte einen Teil. Das ist eine Beobachtungsstudie, kein Beweis für Ursache und Wirkung. [1]",
      "Die Studie unterscheidet im gelesenen Abstract nicht zwischen Sach- und Romanbüchern; Aussagen zu Sachbüchern gehen daraus nicht hervor.",
      "Zu Fiktion gibt es Meta-Analysen: Wimmer et al. fanden kleine kognitive Vorteile des Lesens von Romanen (g = 0,14), vor allem bei Empathie und Mentalisieren. Für Sachbücher ist der Zusammenhang schwächer als für Fiktion. [2]",
    ],
    evidence: { level: "kaum", why: "Nur Beobachtungsdaten zu Büchern allgemein; spezifisch für Sachbücher liegen in den gelesenen Quellen keine Belege vor." },
    steps: [
      "Ein Buch auswählen, das wirklich interessiert (Vorschlag).",
      "Feste Lesezeit, z. B. 20 Minuten am Tag (Vorschlag).",
      "Nach jedem Kapitel zwei bis drei Sätze notieren (Vorschlag).",
    ],
    plan: [
      { title: "Woche 1–2", text: "Täglich 15 bis 20 Minuten lesen (Vorschlag)." },
      { title: "Woche 3–4", text: "Notizen zum Gelesenen nach jedem Kapitel (Vorschlag)." },
    ],
    myths: [
      { myth: "Lesen verlängert nachweislich das Leben.", fact: "Die Kohortenstudie zeigt einen Zusammenhang, der unter Kontrolle vieler Merkmale blieb, aber keinen Beweis der Ursache. [1]" },
    ],
    mistakes: ["Zu viele Bücher gleichzeitig anfangen (Vorschlag).", "Lesen, ohne das Gelesene zu wiederholen oder aufzuschreiben (Vorschlag)."],
    safety: ["Keine besonderen Hinweise."],
    conflicts: ["Die Studie unterscheidet nicht nach Sach- und Romanbüchern; für Fiktion gibt es Meta-Analysen, für Sachbücher in dieser Recherche nicht. [1][2]"],
    videos: [],
    videoNote: "Kein geprüftes Video eingebunden. Siehe auch das Dossier „Schneller lesen“.",
    sources: [
      { title: "Bavishi et al. 2016, Social Science & Medicine – A chapter a day: Association of book reading with longevity", url: PM("27471129"), kind: "Kohortenstudie" },
      { title: "Wimmer et al. 2024, Journal of Experimental Psychology: General – Cognitive effects and correlates of reading fiction: Two preregistered multilevel meta-analyses", url: PM("38602788"), kind: "Meta-Analyse" },
    ],
  },

  "Klassiker lesen": {
    date: DATE,
    steckbrief: {
      about: "Klassische Werke der Literatur lesen, auch mehrfach.",
      why: "Zwei Meta-Analysen (70 Experimente bzw. 114 Korrelationsstudien) fanden kleine Vorteile des Lesens von Romanen, vor allem bei Empathie und Mentalisieren. Zu Klassikern oder zum Wiederlesen speziell habe ich nichts gelesen.",
      tips: "Eine gute Übersetzung oder Ausgabe mit Anmerkungen wählen, kleine Leseziele setzen, Stellen markieren (Vorschlag).",
      safety: "Keine Risiken bekannt.",
    },
    learn: [
      "Die Meta-Analyse von Wimmer et al. (2024): Im Experiment-Teil (70 Experimente) führte Romanlesen zu kleinen kognitiven Vorteilen (g = 0,14), signifikant nur bei Empathie und Mentalisieren. Im Korrelations-Teil (114 Studien) war lebenslanges Romanlesen mit kleinen Vorteilen verbunden (r = 0,16), am stärksten bei verbalen Fähigkeiten. [1]",
      "Eine weitere Meta-Analyse (21 Studien, davon 12 mit nutzbaren Zahlen) fand für literarische oder prosoziale Texte einen kleinen, aber verlässlichen Vorteil bei sozialer Kognition (g = 0,23). [2]",
      "Ob Klassiker besser wirken als andere Romane oder ob Wiederlesen etwas bringt, wurde in den gelesenen Abstracts nicht untersucht.",
    ],
    evidence: { level: "teilweise", why: "Kleine, aber konsistente Vorteile für Romanlesen in Meta-Analysen; für Klassiker oder Wiederlesen speziell fehlt ein Beleg." },
    steps: [
      "Einen Titel wählen, der reizt (Vorschlag).",
      "Seiten pro Tag festlegen, z. B. 10 bis 20 (Vorschlag).",
      "Nach dem Lesen zwei Sätze notieren: Was hat mich überrascht? (Vorschlag).",
    ],
    plan: [
      { title: "Woche 1–2", text: "Täglich 10 Seiten (Vorschlag)." },
      { title: "Danach", text: "Nach dem Ende einen Satz zum Buch schreiben und das nächste wählen (Vorschlag)." },
    ],
    myths: [
      { myth: "Klassiker lesen macht nachweislich klüger.", fact: "Die Effekte des Romanlesens in den Meta-Analysen sind klein; zu Klassikern gibt es keine eigenen Belege. [1][2]" },
    ],
    mistakes: ["Ein Buch aus Pflichtgefühl durchziehen und das Lesen dadurch verleiden (Vorschlag).", "Zu große Tagesziele setzen (Vorschlag)."],
    safety: ["Keine besonderen Hinweise."],
    conflicts: ["Die Effekte hängen von der Vergleichsgruppe ab; gegenüber Sachbüchern waren sie kleiner. [1]", "Die zweite Meta-Analyse umfasst nur wenige Studien. [2]"],
    videos: [],
    videoNote: "Kein geprüftes Video eingebunden.",
    sources: [
      { title: "Wimmer et al. 2024, Journal of Experimental Psychology: General – Cognitive effects and correlates of reading fiction: Two preregistered multilevel meta-analyses", url: PM("38602788"), kind: "Meta-Analyse" },
      { title: "Chang 2026, Frontiers in Psychology – Empathy and perspective-taking in literary fiction: a systematic review and meta-analysis", url: PM("42856748"), kind: "Meta-Analyse" },
    ],
  },

  "2 Bücher im Jahr": {
    date: DATE,
    steckbrief: {
      about: "Im Jahr zwei Bücher lesen, mit etwa 7 Seiten pro Tag.",
      why: "In einer Kohortenstudie mit 3.635 Personen war mehr Bücherlesen mit längerem Überleben verbunden (dosisabhängig). Das Ziel „2 Bücher“ ist klein und sicher erreichbar.",
      tips: "7 Seiten an einen festen Moment koppeln (z. B. vor dem Schlafen). Kleine Ziele helfen, dranzubleiben: Ein ausgelassener Tag schadete dem Gewohnheitsaufbau nicht wesentlich.",
      safety: "Keine Risiken bekannt.",
    },
    learn: [
      "In der Studie von Bavishi et al. war Bücherlesen dosisabhängig mit längerem Überleben verbunden (Hazard Ratio 0,83 und 0,77 für mittlere und höchste Lesezeit gegenüber Nichtlesern); nach vollständiger Anpassung lag die HR bei 0,80. Ob zwei Bücher im Jahr dafür reichen, geht aus der Studie nicht hervor. Es ist eine Beobachtungsstudie. [1]",
      "Zum Dranbleiben: In der Studie von Lally et al. musste ein tägliches Verhalten 18 bis 254 Tage wiederholt werden, bis es automatisch lief; einmal auszulassen störte nicht wesentlich. Kleine Ziele an einen festen Auslöser zu koppeln, ist Vorschlag. [2]",
    ],
    evidence: { level: "kaum", why: "Nur Beobachtungsdaten zu Büchern allgemein; für „2 Bücher im Jahr“ gibt es keinen Beleg." },
    steps: [
      "Ein Buch mit überschaubarem Umfang wählen (Vorschlag).",
      "7 Seiten an einen festen Auslöser koppeln (Vorschlag).",
      "Fortschritt markieren, z. B. mit einem Lesezeichen oder Strich im Kalender.",
    ],
    plan: [
      { title: "Woche 1–4", text: "Täglich 7 Seiten, einmal Auslassen ist erlaubt (Vorschlag)." },
      { title: "Danach", text: "Nach dem ersten Buch das zweite wählen, bevor eine Pause entsteht (Vorschlag)." },
    ],
    myths: [
      { myth: "Man muss jeden Tag lesen, sonst bricht die Routine ab.", fact: "In der Studie von Lally et al. fiel einmaliges Auslassen nicht wesentlich ins Gewicht. [2]" },
    ],
    mistakes: ["Das Buch zu schwer wählen (Vorschlag).", "Zu spät am Abend lesen und einschlafen (Vorschlag)."],
    safety: ["Keine besonderen Hinweise."],
    conflicts: ["Die Studie zeigt keinen Beweis für Ursache und Wirkung und nennt keine Mindestmenge in Büchern pro Jahr. [1]"],
    videos: [],
    videoNote: "Kein geprüftes Video eingebunden.",
    sources: [
      { title: "Bavishi et al. 2016, Social Science & Medicine – A chapter a day: Association of book reading with longevity", url: PM("27471129"), kind: "Kohortenstudie" },
      LALLY,
    ],
  },

  "Tägliches Knobeln": {
    date: DATE,
    steckbrief: {
      about: "Jeden Tag Rätsel, Logikaufgaben, Programmieren oder Mathe lösen.",
      why: "Eine Übersicht über 20 Interventionsstudien bei Älteren fand, dass anregende Freizeitaktivitäten (z. B. Brettspiele, Lesen, Neues lernen) die Kognition oft verbesserten. Eine Meta-Analyse zum Arbeitsgedächtnis-Training fand dagegen keine überzeugende Übertragung auf andere Fähigkeiten.",
      tips: "Aufgaben wählen, die Neues bringen und Spaß machen, nicht nur dieselbe Übung wiederholen (Vorschlag). Gut ist, was sich wie Lernen anfühlt.",
      safety: "Keine Risiken. Bei Augenbelastung Pausen einlegen (Vorschlag).",
    },
    learn: [
      "Iizuka et al. (2019) sichteten 20 Interventionsstudien bei Älteren zu kognitiven Freizeitaktivitäten (Kunst, Schreiben, Brettspiele, Lesen, Handarbeit, Kreuzworträtsel, Computerkurs). In 13 Studien verbesserte sich ein Teil der Kognition. Als besonders wirksam galten Aktivitäten, die Neues lehren, stark anregen und Austausch mit anderen enthalten; die Zahl der Studien ist klein. [1]",
      "Melby-Lervåg et al. (2016) prüften Arbeitsgedächtnis-Training in 87 Publikationen: kurzfristige Verbesserungen bei ähnlichen Aufgaben, aber kein überzeugender Beleg für Verbesserungen bei „Far Transfer“ (z. B. Intelligenz, Rechnen, Leseverständnis). [2]",
      "Die erste Übersicht betrifft Ältere und Kognition, die zweite computergestütztes Training; ob tägliches Knobeln bei Jüngeren etwas bringt, geht aus den gelesenen Quellen nicht hervor.",
    ],
    evidence: { level: "kaum", why: "Anregende Aktivitäten zeigen bei Älteren teils Wirkung, doch gezielte Trainingsaufgaben übertragen sich laut Meta-Analyse kaum auf andere Fähigkeiten." },
    steps: [
      "Aufgabenart wählen, die Neues bringt: Logik, Programmieren, Mathe (Vorschlag).",
      "Feste Zeit am Tag, z. B. 15 Minuten (Vorschlag).",
      "Ab und zu die Art der Aufgaben wechseln (Vorschlag).",
    ],
    plan: [
      { title: "Woche 1–2", text: "Täglich 15 Minuten, Aufgabentyp frei wählen (Vorschlag)." },
      { title: "Danach", text: "Einmal pro Woche eine neue Aufgabenart ausprobieren (Vorschlag)." },
    ],
    myths: [
      { myth: "Wer täglich Denkspiele löst, wird allgemein klüger.", fact: "Bei Arbeitsgedächtnis-Training fand die Meta-Analyse keine überzeugenden Verbesserungen bei „Far Transfer“. [2]" },
    ],
    mistakes: ["Dieselbe Aufgabe wiederholen, bis nur diese besser wird (Vorschlag).", "Erwartungen an allgemeine Intelligenzsteigerung stellen. [2]"],
    safety: ["Keine besonderen Hinweise."],
    conflicts: ["Die Übersicht zu Freizeitaktivitäten sieht Hinweise auf Nutzen, die Meta-Analyse zum Training keinen für Far Transfer; die Studienfragen sind unterschiedlich. [1][2]"],
    videos: [],
    videoNote: "Kein geprüftes Video eingebunden.",
    sources: [
      { title: "Iizuka et al. 2019, Geriatrics & Gerontology International – Can cognitive leisure activity prevent cognitive decline in older adults? A systematic review of intervention studies", url: PM("31020777"), kind: "Systematische Übersicht" },
      { title: "Melby-Lervåg et al. 2016, Perspectives on Psychological Science – Working Memory Training Does Not Improve Performance on Measures of Intelligence or Other Measures of “Far Transfer”", url: PM("27474138"), kind: "Meta-Analyse" },
    ],
  },

  "NYT Mini Crossword": {
    date: DATE,
    steckbrief: {
      about: "Jeden Morgen das kurze Kreuzworträtsel lösen.",
      why: "Kreuzworträtsel dienten in Studien meist als Vergleichsaufgabe. Bei Menschen mit leichter kognitiver Störung zeigte sich in einer Studie weniger kognitiver Rückgang in der Kreuzworträtsel-Gruppe. Ein Nutzen für Gesunde ist nicht belegt.",
      tips: "Als kleine Routine mit Spaßfaktor nutzen, nicht als Gehirntraining im Sinne eines Heilmittels (Vorschlag). Feste Zeit, z. B. nach dem Frühstück.",
      safety: "Keine Risiken. Bei Handy-Nutzung am Morgen siehe das Dossier „Morgens ohne Handy“.",
    },
    learn: [
      "Petrella et al. (2023): 107 Personen mit leichter kognitiver Störung übten über 18 Monate entweder ein Computerspiel-Training oder Online-Kreuzworträtsel. Das Hauptergebnis (Konnektivität im Default-Mode-Netzwerk) unterschied sich nicht; die Kreuzworträtsel-Gruppe zeigte weniger kognitiven Rückgang, besonders bei stärker Betroffenen. [1]",
      "Bei Herzinsuffizienz verbesserte sich in einer Studie mit 256 Personen das Gedächtnis weder mit Computertraining noch mit Kreuzworträtseln stärker als bei üblicher Versorgung. [2]",
      "Für gesunde Erwachsene mit Mini-Rätseln gibt es in diesen Quellen keine Aussage.",
    ],
    evidence: { level: "kaum", why: "Kreuzworträtsel dienten in den gelesenen Studien als Vergleichsbedingung; für Gesunde und für den „Mini“-Umfang liegt kein Nachweis vor." },
    steps: [
      "Rätsel zu fester Zeit lösen (Vorschlag).",
      "Zeit mitstoppen, wenn Motivation hilft (Vorschlag).",
      "Gelegentlich auch längere Rätsel oder andere Denkaufgaben ausprobieren (Vorschlag).",
    ],
    plan: [
      { title: "Woche 1–4", text: "Täglich ein Mini-Rätsel, danach nur noch die Serie zählen (Vorschlag)." },
    ],
    myths: [
      { myth: "Kreuzworträtsel schützen sicher vor Demenz.", fact: "In den gelesenen Studien wurden sie als Vergleichsaufgabe eingesetzt; ein sicherer Schutz folgt daraus nicht. [1][2]" },
    ],
    mistakes: ["Zu viel Erwartung an die Wirkung auf die Kognition (Vorschlag).", "Rätsel als Ausrede, nichts anderes für Kopf und Körper zu tun (Vorschlag)."],
    safety: ["Keine besonderen Hinweise."],
    conflicts: ["Eine Studie fand weniger kognitiven Rückgang mit Kreuzworträtseln bei leichter kognitiver Störung, eine andere keinen Vorteil bei Herzinsuffizienz. [1][2]"],
    videos: [],
    videoNote: "Kein geprüftes Video eingebunden.",
    sources: [
      { title: "Petrella et al. 2023, Journal of Alzheimer's Disease – Impact of Computerized Cognitive Training on Default Mode Network Connectivity in Subjects at Risk for Alzheimer's Disease", url: PM("36442202"), kind: "Randomisierte Studie" },
      { title: "Pressler et al. 2022, Journal of Cardiac Failure – Randomized Controlled Trial of a Cognitive Intervention to Improve Memory in Heart Failure", url: PM("34763080"), kind: "Randomisierte Studie" },
    ],
  },
};
