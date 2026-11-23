import type { Dossier } from "./dossiers";

// Kategorie „Atmung, Sinne & Körperkontrolle“, Teil 2: Gleichgewichtssinn, Apnoe, Schlaf & Ernährung.
// Recherchiert am 23. November 2026. Studien über PubMed geprüft (Titel, Autoren, Abstract); Aussagen stehen nur, wenn sie im Abstract oder auf der verlinkten Seite stehen.
const DATE = "23. November 2026";
const PM = (id: string) => `https://pubmed.ncbi.nlm.nih.gov/${id}/`;

export const DOSSIERS_ATMUNG2: Record<string, Dossier> = {
  "Apnoe": {
    date: DATE,
    steckbrief: {
      about: "Apnoe heißt hier: freiwillig die Luft anhalten, auch unter Wasser (Freitauchen). Dieses Dossier gibt bewusst keine Anleitung, sondern erklärt die Gefahr und ordnet die Evidenz ein.",
      why: "Atemanhalten wird als Trainingsform und Sport betrieben. Das Risiko liegt nicht im Anhalten selbst, sondern im Bewusstseinsverlust ohne Vorwarnung, der im Wasser zum Ertrinken führt.",
      tips: "Keine Anleitung. Wer das Thema ernsthaft verfolgen will, braucht einen Kurs mit ausgebildeten Lehrenden und eine feste Partnerin oder einen festen Partner, die oder der jederzeit daneben bleibt (Vorsichtsregel, keine Leitlinie).",
      safety: "Nie allein im oder am Wasser. Nie vorher hyperventilieren. Ein „Hypoxic Blackout“ kann in jedem Gewässer und in jeder Tiefe passieren. [1][2]",
    },
    learn: [
      "„Shallow Water Blackout“ ist ein irreführender Begriff. Die Fachwelt (laut StatPearls Amerikanisches Rotes Kreuz, YMCA und USA Swimming) spricht von „Hypoxic Blackout“: Bewusstseinsverlust bei Schwimmenden oder Tauchenden während des Luftanhaltens unter Wasser, dem Hyperventilieren vorausging, wenn andere Ursachen ausgeschlossen sind. Er kann in jedem Gewässer und in jeder Tiefe auftreten. [1]",
      "Der Bewusstseinsverlust trat nach StatPearls typischerweise in weniger als 5 m Tiefe auf, oft durch langes Luftanhalten oder Ausrüstungsgrenzen; Ertrinken kann aber auch in größerer Tiefe passieren. Überleben hängt von schneller, wirksamer Rettung ab. [1]",
      "Eine Fallauswertung aus dem US-Bundesstaat New York (1988 bis 2011) fand 16 Fälle mit „gefährlichen Atemanhalte-Verhaltensweisen unter Wasser“. Zwei gesunde junge Männer waren 2011 in einem Schwimmbad nach absichtlichem Hyperventilieren vor dem Tauchen bewusstlos geworden und ertrunken. Wer mehr als eine solche Verhaltensweise übte, hatte ein höheres Sterberisiko; die Stichprobe ist klein. [2]",
      "Auch bei trainierten Wettkampf-Freitauchern ist Blackout kein seltenes Ereignis. Eine Studie mit 14 Wettkampftauchern maß Sauerstoffsättigung und Herzfrequenz bei Tiefen- und flachen Tauchgängen im Meer und untersuchte, wie viele Faktoren das Blackout-Risiko beeinflussen. Eine Fallstudie zu Blackout bei statischer Apnoe fragte, ob Herzrhythmusstörungen mitspielen. [3][4]",
    ],
    evidence: {
      level: "teilweise",
      why: "Dass Hyperventilieren vor dem Luftanhalten gefährlich ist, ist durch Fallserien und Fachwissen gestützt; kontrollierte Studien zu Trainingsnutzen für Laien gibt es hier nicht, und Mechanismen des Blackouts werden noch erforscht.",
    },
    steps: ["Keine Anleitung: Luftanhalten unter Wasser ohne Ausbildung und ohne geschulte Aufsicht ist riskant. Wer es lernen will, sucht einen anerkannten Freitauchkurs. [1][2]"],
    plan: [{ title: "Hinweis", text: "Aus Sicherheitsgründen folgt hier kein Übungsplan. Atemübungen ohne Wasser finden sich bei Box Breathing und Physiologischer Seufzer." }],
    myths: [
      { myth: "Vorher kräftig durchatmen verlängert das sichere Luftanhalten.", fact: "Hyperventilieren vor dem Tauchen gilt als typischer Auslöser des Hypoxic Blackouts; die Definition der Fachverbände nennt es ausdrücklich. [1][2]" },
      { myth: "Wer gut trainiert ist, braucht keine Aufsicht.", fact: "Blackout kommt auch bei Wettkampf-Freitauchern vor. [3][4]" },
      { myth: "Im Pool oder in flachem Wasser passiert nichts.", fact: "Hypoxic Blackout kann in jedem Gewässer und in jeder Tiefe auftreten; die beiden jungen Männer in New York verloren das Bewusstsein in einem Schwimmbad. [1][2]" },
    ],
    mistakes: ["Allein üben, auch im Pool.", "Vorher hyperventilieren.", "Mehrere riskante Atemanhalte-Spiele kombinieren oder Wettkämpfe untereinander veranstalten. [2]"],
    safety: [
      "Nie allein im Wasser, auch nicht flach oder im Pool. [1]",
      "Nie vor dem Luftanhalten hyperventilieren. [1][2]",
      "Nach einem Blackout oder Beinahe-Ertrinken ärztlich abklären lassen (Vorsichtsregel, keine Leitlinie).",
    ],
    conflicts: ["Die klassische Erklärung nennt Sauerstoffmangel als Ursache; eine Fallstudie prüfte zusätzlich, ob Herzrhythmusstörungen mitspielen. Die Frage bleibt offen. [4]", "Der Begriff „Shallow Water Blackout“ wird verschieden benutzt: oft als Synonym für Ertrinken, in der Fachdefinition nur für den Hypoxic Blackout mit vorausgehendem Hyperventilieren. [1]"],
    videos: [
      { title: "Every Freediver MUST Know This Rescue Technique | Freediving Safety", id: "UlPJLcM-v3g", channel: "KAIZEN FREEDIVING", why: "Zeigt, was die Aufsichtsperson nach einem Blackout tun muss; keine Atemübung.", checked: true },
    ],
    videoNote: "Nur ein Sicherheitsvideo, bewusst kein Übungsvideo. Inhalt nur nach Titel beurteilt.",
    sources: [
      { title: "Bart, Murray & Lau – Shallow Water Blackout (StatPearls)", url: PM("32119507"), kind: "Fachbuch" },
      { title: "Boyd et al. 2015, MMWR – Fatal and nonfatal drowning outcomes related to dangerous underwater breath-holding behaviors, New York State, 1988–2011", url: PM("25996093"), kind: "Behörde" },
      { title: "Mulder et al. 2023, Eur J Appl Physiol – Unlocking the depths: multiple factors contribute to risk for hypoxic blackout during deep freediving", url: PM("37300699"), kind: "Studie" },
      { title: "Mulder et al. 2023, J Appl Physiol – Case Studies in Physiology: Is blackout in breath-hold diving related to cardiac arrhythmias?", url: PM("36825646"), kind: "Studie" },
    ],
  },

  "Gleichgewichtssinn": {
    date: DATE,
    steckbrief: {
      about: "Das Gleichgewicht entsteht aus Innenohr (Vestibularorgan), Augen und Körperwahrnehmung. Es lässt sich mit Übungen für Blick, Kopf und Stand trainieren.",
      why: "Bei Gleichgewichtsstörungen durch Innenohr-Funktionsverlust ist Training gut belegt; bei älteren Menschen verringern Übungen für Gleichgewicht, Gang und Kraft Stürze. Für gesunde junge Menschen gibt es kaum Daten.",
      tips: "Neben einer Wand oder einem Türrahmen üben, die Schwierigkeit langsam steigern. Bei anhaltendem Schwindel ärztlich abklären lassen, bevor man selbst übt.",
      safety: "Sturzgefahr: nur mit Halt in der Nähe üben. Plötzlicher oder starker Schwindel gehört zur ärztlichen Abklärung (Vorsichtsregel, keine Leitlinie).",
    },
    learn: [
      "Die Leitlinie der Academy of Neurologic Physical Therapy (2022, Hall et al.) wertete 67 Arbeiten aus. Aufgrund starker Evidenz sollen Fachleute Erwachsenen mit ein- oder beidseitiger Funktionsschwäche des Gleichgewichtsorgans eine vestibuläre Rehabilitation anbieten. [1]",
      "Dieselbe Leitlinie rät ab, Augenfolgebewegungen oder Sakkaden allein (ohne Kopfbewegung) zur Blickstabilisierung zu üben; sie sehen mehr Schaden als Nutzen. [1]",
      "Bei älteren, selbstständig lebenden Menschen fasst ein Cochrane-Review (108 Studien, 23 407 Teilnehmende) die Evidenz zu Übungen gegen Stürze zusammen. Es nennt Übungen für Gleichgewicht, Gang und Kraft als wirksam gegen Stürze, bei überwiegend unsicherer Studienqualität. [2]",
      "Diese Quellen gelten für Menschen mit Störung oder höherem Sturzrisiko. Ob „vestibuläres Training“ bei Gesunden mehr als Spaß oder Geschick bringt, belegen sie nicht.",
    ],
    evidence: {
      level: "teilweise",
      why: "Für Rehabilitation bei Innenohr-Schwäche und für Sturzprävention im Alter ist die Evidenz stark bis gut; für Training bei Gesunden fehlen Belege.",
    },
    steps: [
      "Stand mit geschlossenen Füßen neben einer Wand üben, bei Bedarf Fingerspitzen an die Wand. (Vorschlag)",
      "Dann auf einem Bein, erst mit Blick auf einen festen Punkt, dann mit Kopfbewegungen. (Vorschlag, in Anlehnung an die Leitlinie: Übungen mit Kopfbewegung [1])",
      "Später Schwierigkeit erhöhen: weiche Unterlage, Augen zu, Gehen mit Kopfdrehungen. (Vorschlag)",
    ],
    plan: [
      { title: "Woche 1–2", text: "Täglich 5 Minuten leichte Übungen mit Halt in der Nähe. (Vorschlag)" },
      { title: "Danach", text: "Steigern, ohne dass Schwindel anhält. Bei Beschwerden ärztliche oder physiotherapeutische Anleitung holen. [1]" },
    ],
    myths: [
      { myth: "Augenübungen allein trainieren den Gleichgewichtssinn.", fact: "Die Leitlinie rät ab, Augenbewegungen ohne Kopfbewegung allein zur Blickstabilisierung zu üben. [1]" },
      { myth: "Gleichgewichtstraining ist nur etwas für Ältere.", fact: "Die belegte Wirkung betrifft vor allem Ältere und Menschen mit Störung; für Gesunde ist sie nicht gezeigt. [1][2]" },
    ],
    mistakes: ["Ohne Halt üben und stürzen.", "Anhaltenden Schwindel ignorieren.", "Zu schnell zu schwierige Übungen wählen."],
    safety: ["Immer eine Wand oder Haltemöglichkeit in Reichweite.", "Plötzlicher starker Schwindel, Hörverlust oder neurologische Ausfälle gehören sofort ärztlich abgeklärt (Vorsichtsregel, keine Leitlinie)."],
    conflicts: ["Die Cochrane-Autoren weisen darauf hin, dass die meisten Studien ein unklares oder hohes Verzerrungsrisiko hatten. [2]"],
    videos: [
      { title: "Vestibular Physio – Curezone Physiotherapy", id: "0mmrQUzjFZY", channel: "Curezone Physiotherapy", why: "Kurzes Physiotherapie-Video zu vestibulären Übungen.", checked: true },
    ],
    videoNote: "Nur ein Video gefunden, kurz (Shorts-Format); Inhalt nur nach Titel beurteilt.",
    sources: [
      { title: "Hall et al. 2022, JNPT – Vestibular Rehabilitation for Peripheral Vestibular Hypofunction: An Updated Clinical Practice Guideline", url: PM("34864777"), kind: "Leitlinie" },
      { title: "Sherrington et al. 2019, Cochrane – Exercise for preventing falls in older people living in the community", url: PM("30703272"), kind: "Übersichtsarbeit" },
    ],
  },

  "Schlaf & Ernährung": {
    date: DATE,
    steckbrief: {
      about: "Wie viel Schlaf und welche Ernährung die geistige Leistung stützen. Belegt sind vor allem Schlafmangel-Effekte im Labor und ein Zusammenhang der mediterranen Ernährung mit besserer Kognition bei Älteren.",
      why: "Wenig Schlaf verschlechtert die Leistung in Tests, auch wenn man es nicht merkt. Eine Ernährung nach mediterraner Art zeigte in einer Studie mit Älteren bessere Testwerte als eine fettarme.",
      tips: "Feste Schlafenszeiten, 7 bis 9 Stunden für Erwachsene als Richtwert. Bei der Ernährung zählt das Gesamtmuster mehr als einzelne Lebensmittel (Einordnung).",
      safety: "Bei anhaltender Schlafstörung oder Tagesmüdigkeit ärztlich abklären lassen. Ernährungsumstellungen bei Erkrankungen mit der Ärztin oder dem Arzt besprechen (Vorsichtsregel, keine Leitlinie).",
    },
    learn: [
      "Die National Sleep Foundation (2015, Expertenpanel mit 18 Mitgliedern) hält für gesunde Erwachsene 7 bis 9 Stunden Schlaf für angemessen, für ältere Erwachsene 7 bis 8 Stunden; Bedarf variiert von Person zu Person. [1]",
      "Die Gemeinschaftserklärung der AASM und der Sleep Research Society (2015) legte per Expertenabstimmung eine Empfehlung für gesunde Erwachsene fest. Den genauen Wortlaut (Stundenzahl) enthält die kurze Zusammenfassung, die ich las, nicht; ich zitiere hier nur die NSF-Zahlen. [2]",
      "Ein Laborexperiment mit 48 gesunden Erwachsenen (Van Dongen et al. 2003): 14 Tage 4 oder 6 Stunden Bettzeit führten zu kumulativen, dosisabhängigen Leistungseinbußen in allen kognitiven Aufgaben. Die subjektive Müdigkeit stieg dagegen nur wenig weiter und unterschied 6 und 4 Stunden nicht signifikant: Man unterschätzt also den eigenen Leistungsabfall. [3]",
      "Zur Ernährung: In der PREDIMED-NAVARRA-Studie (522 Teilnehmende mit hohem Gefäßrisiko, im Schnitt 74,6 Jahre, 6,5 Jahre Intervention) erreichten Teilnehmende in der mediterranen Gruppe mit Olivenöl höhere MMSE- und Uhrentest-Werte als die fettarme Kontrollgruppe (MMSE +0,62; 95 %-KI +0,18 bis +1,05). Das gilt für ältere Menschen mit hohem Gefäßrisiko, nicht automatisch für junge Gesunde. [4]",
    ],
    evidence: {
      level: "teilweise",
      why: "Schlafmangel und Leistungsabfall sind in kontrollierten Laborstudien gut belegt; für die Ernährung gibt es eine randomisierte Studie bei Älteren mit hohem Gefäßrisiko, nicht bei jungen Gesunden.",
    },
    steps: [
      "Eine Schlafdauer im Bereich 7 bis 9 Stunden anpeilen. [1]",
      "Feste Zeiten fürs Zubettgehen und Aufstehen wählen. (Vorschlag)",
      "Ernährung Richtung mediterran: Olivenöl, Nüsse, Gemüse. (Vorschlag in Anlehnung an die Studie [4])",
    ],
    plan: [
      { title: "Woche 1–2", text: "Schlafdauer in einem Heft notieren und den eigenen Durchschnitt erkennen. (Vorschlag)" },
      { title: "Woche 3–4", text: "Bettzeit schrittweise verschieben, bis die Dauer im Zielbereich liegt. (Vorschlag)" },
    ],
    myths: [
      { myth: "Man gewöhnt sich an 6 Stunden Schlaf.", fact: "Im Labor sanken die Leistungen bei 6 Stunden über 14 Tage weiter ab, während das Müdigkeitsgefühl kaum weiter zunahm. [3]" },
      { myth: "Eine bestimmte Ernährung macht schlau.", fact: "Die Studie fand bei Älteren mit hohem Gefäßrisiko bessere Werte, kein Beleg für Wirkung auf junge Gesunde. [4]" },
    ],
    mistakes: ["Schlaf am Wochenende als Ausgleich für ständigen Mangel sehen. (Einordnung: Eine Studie prüfte eine Erholungsnacht; hier nicht ausgewertet.)", "Nur auf das Gefühl achten, nicht auf die Dauer. [3]"],
    safety: ["Anhaltende Tagesmüdigkeit oder Schlafprobleme ärztlich abklären (Vorsichtsregel, keine Leitlinie)."],
    conflicts: ["Studien zur Ernährung und Kognition sind uneinheitlich; Beobachtungsstudien und randomisierte Studien kommen nicht immer zum selben Ergebnis. [4]", "Vorträge und Bücher zum Thema Schlaf stellen teils stärkere Behauptungen auf als die Studien hergeben; ich habe sie nicht einzeln geprüft."],
    videos: [
      { title: "Sleep Is Your Superpower | Matt Walker | TED", id: "5MuIMqhT8DM", channel: "TED", why: "Bekannter Vortrag eines Schlafforschers; Aussagen nicht einzeln geprüft.", checked: true },
    ],
    videoNote: "Ein Video; seine Behauptungen habe ich nicht gegen die Studien geprüft.",
    sources: [
      { title: "Hirshkowitz et al. 2015, Sleep Health – National Sleep Foundation's sleep time duration recommendations: methodology and results summary", url: PM("29073412"), kind: "Konsensus" },
      { title: "Watson et al. 2015, J Clin Sleep Med – Recommended Amount of Sleep for a Healthy Adult: A Joint Consensus Statement of the AASM and SRS", url: PM("25979105"), kind: "Konsensus" },
      { title: "Van Dongen et al. 2003, Sleep – The cumulative cost of additional wakefulness: dose-response effects of chronic sleep restriction", url: PM("12683469"), kind: "Studie" },
      { title: "Martínez-Lapiscina et al. 2013, JNNP – Mediterranean diet improves cognition: the PREDIMED-NAVARRA randomised trial", url: PM("23670794"), kind: "Studie" },
    ],
  },
};
