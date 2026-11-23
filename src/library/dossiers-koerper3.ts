import type { Dossier } from "./dossiers";

const DATE = "23. November 2026";
const PM = (id: string) => `https://pubmed.ncbi.nlm.nih.gov/${id}/`;

export const DOSSIERS_KOERPER3: Record<string, Dossier> = {
  Mewing: {
    date: DATE,
    steckbrief: {
      about: "Die Zunge dauerhaft an den Gaumen legen, um Kiefer und Gesicht zu formen. Der Begriff kommt aus Social Media („Mewing“, Looksmaxxing).",
      why: "Versprochen werden ein markanterer Kiefer und gerade Zähne. Dafür gibt es nach Auskunft von Fachgesellschaft und Klinik keine belastbaren Belege.",
      tips: "Wer eine Zahn- oder Kieferfehlstellung ändern will, lässt sich kieferorthopädisch beraten. Die Zunge locker am Gaumen ruhen zu lassen, ist harmlos, aber kein Ersatz.",
      safety: "Kein Kraftaufwand: dauerhaftes Anpressen der Zunge oder Zähne kann Verspannungen auslösen (Vorsichtsregel, keine Leitlinie). Bei Kieferschmerzen ärztlich oder zahnärztlich abklären.",
    },
    learn: [
      "Die American Association of Orthodontists schreibt auf ihrer Verbraucherseite, viele Versprechen über Kieferformung oder Biss durch „Hacks“ seien nicht durch wissenschaftliche Belege gestützt; die Belege für die kieferformende Wirkung von Mewing seien dünn. Gesichtsform entstehe aus Genetik, Knochenwachstum und Muskelentwicklung. [1]",
      "Die Cleveland Clinic kommt zum Schluss, Mewing könne weder Zähne begradigen noch den Kiefer schärfen. [2]",
      "Zur verwandten Frage, ob Zungenübungen bei Kindern helfen, gibt es eine systematische Übersicht (Koletsi et al. 2018) zu orthodontischer und myofunktioneller Behandlung im Wechselgebiss. Sie betrifft betreute Programme bei Kindern, nicht das Zungenhalten Erwachsener; auf Mewing bei Erwachsenen lässt sich das Ergebnis nicht übertragen. [3]",
    ],
    evidence: { level: "kaum", why: "Für die behauptete Kieferformung bei Erwachsenen liegt keine kontrollierte Studie vor; Fachgesellschaft und Klinik halten die Belege für dünn." },
    steps: ["Eine kieferorthopädische Beratung ist der belegte Weg bei Zahn- oder Kieferfehlstellung.", "Zungenruhelage bewusst locker beobachten (Vorschlag), ohne Anpressen.", "Auf Spannungen im Kiefer achten und lösen."],
    plan: [{ title: "Hinweis", text: "Ein Übungsplan für Mewing ist aus den Quellen nicht ableitbar; wirksam belegt ist er nicht. [1][2]" }],
    myths: [
      { myth: "Mewing formt den Kiefer und richtet Zähne.", fact: "Die Fachgesellschaft sieht dafür keine belastbaren wissenschaftlichen Belege. [1][2]" },
      { myth: "Zungenhaltung allein ersetzt eine Zahnspange.", fact: "Die American Association of Orthodontists schreibt, allein die Zungenposition könne Fehlstellungen nicht korrigieren und Behandlung nicht ersetzen. [1]" },
    ],
    mistakes: ["Dauerhaft kräftig anpressen.", "Auf Social-Media-Versprechen statt auf fachliche Beratung vertrauen.", "Eine nötige kieferorthopädische Behandlung hinauszögern."],
    safety: ["Zähne und Zunge nicht dauerhaft pressen; bei Kiefer- oder Kopfschmerzen zahnärztlich abklären (Vorsichtsregel, keine Leitlinie)."],
    conflicts: ["Zungenhaltung spielt nach Fachsicht bei der Gesichtsentwicklung eine Rolle; das belegt aber nicht, dass Erwachsene ihren Kiefer so formen können. [1][3]"],
    videos: [],
    videoNote: "Ich habe kein seriöses Video geprüft; die gefundenen sind Social-Media-Anleitungen.",
    sources: [
      { title: "American Association of Orthodontists: Is Mewing Bad for You?", url: "https://aaoinfo.org/whats-trending/is-mewing-bad-for-you/", kind: "Fachverband" },
      { title: "Cleveland Clinic: Does Mewing Work to Reshape Your Jaw?", url: "https://health.clevelandclinic.org/what-is-mewing", kind: "Klinik" },
      { title: "Koletsi, Makou & Pandis 2018, Orthodontics & Craniofacial Research – Effect of orthodontic management and orofacial muscle training protocols on the correction of myofunctional and myoskeletal problems in developing dentition: a systematic review and meta-analysis", url: PM("30152171"), kind: "Übersichtsarbeit" },
    ],
  },
};
