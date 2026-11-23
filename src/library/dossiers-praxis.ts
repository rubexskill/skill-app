import type { Dossier } from "./dossiers";

// Kategorien „Tricks“, „Kreativ & Alltag“, „Körper & Sport“: Anleitungs-Dossiers für praktische Fertigkeiten (Einstufung „Anleitung / Fachwissen“).
// Recherchiert am 23. November 2026. Schritte stammen aus gelesenen Seiten (Tanzschule, Verband, Hersteller, Ratgeber) oder sind als „(Vorschlag)“ bzw. „(Vorsichtsregel)“ gekennzeichnet.
// Videos: Titel und Kanal über YouTube-oEmbed bestätigt; Inhalt nicht angesehen.
const DATE = "23. November 2026";
const PM = (id: string) => `https://pubmed.ncbi.nlm.nih.gov/${id}/`;

export const DOSSIERS_PRAXIS: Record<string, Dossier> = {
  "Moonwalk": {
    date: DATE,
    steckbrief: {
      about: "Der Moonwalk (auch Backslide) ist ein Popping-Tanzschritt: Du gleitest rückwärts, während die Bewegung nach vorn zu gehen scheint. Es gibt keine Studien dazu; die Anleitung beruht auf einer Tanzschule und einem Lexikon.",
      why: "Ein klar zerlegbarer Schritt: erst Fußarbeit am Platz, dann das Gleiten. Fortschritt ist im Spiegel gut sichtbar.",
      tips: "Erst die Fußarbeit am Platz im Takt üben („Sacking“), dann das Gleiten rückwärts. Langsam anfangen, Musik mit klarem Beat nutzen. [1]",
      safety: "Glatter, ebener Boden und rutschfeste Schuhe oder glatte Socken je nach Boden; aufwärmen. (Vorsichtsregel, keine Quelle)",
    },
    learn: [
      "Der Moonwalk, auch Backslide, ist ein Popping-Schritt, bei dem die Person rückwärts gleitet, während ihre Körperbewegungen Vorwärtsgehen andeuten. Berühmt wurde er 1983 durch Michael Jackson; den Schritt gab es aber schon Jahrzehnte vorher unter anderen Namen („the buzz“, „backslide“, „skate“, „walking against the wind“). [2]",
      "Die Tanzschule STEEZY beschreibt den Aufbau in drei Stufen: erstens Hüpfen im Takt, bei jedem Hüpfer ein Knie „poppen“ und dabei die Ferse ganz anheben; zweitens „Sacking“ (Schritt vor, Fuß flach zurückgleiten, beim Zusammentreffen der Füße den anderen Fuß poppen), was die Illusion des Gehens erzeugt; drittens das Gleiten über die Ausgangsposition hinaus, damit der Körper tatsächlich rückwärts wandert. [1]",
      "Ein Zeitzeugenzitat im Lexikon beschreibt das Prinzip: Die Person bewegt sich scheinbar vorwärts, ohne die Füße zu bewegen, indem sie Zehen und Fersen schnell einsetzt. [2]",
      "Zum Moonwalk gibt es keine Studienlage. Die Anleitung hier folgt einer Tanzschule; andere Lehrer ordnen Schritte und Gewichtsverlagerung teils anders. [1]",
    ],
    evidence: { level: "anleitung", why: "Praktische Tanzfertigkeit ohne Studienlage; die Schritte stammen aus der Anleitung einer Tanzschule (STEEZY), die Einordnung aus einem Lexikon." },
    steps: [
      "Musik mit klarem Beat anmachen. Im Takt auf und ab federn und bei jedem Federn ein Knie „poppen“: links, rechts, links, rechts. Die Ferse jeweils ganz vom Boden heben. [1]",
      "„Sacking“: Füße zusammen, mit dem rechten Fuß einen Schritt nach vorn machen. [1]",
      "Den rechten Fuß flach auf dem Boden in die Ausgangsposition zurückgleiten lassen; wenn die Füße sich treffen, den linken Fuß und das linke Knie poppen. [1]",
      "Dasselbe auf der anderen Seite: links vor, zurückgleiten, rechten Fuß poppen. Beide Seiten im Takt wiederholen – so entsteht die Illusion des Gehens. [1]",
      "Rückwärtsbewegung: Mit dem rechten Fuß beginnen und nach hinten gleiten. Das linke Knie poppen, bevor der rechte Fuß mit dem Gleiten fertig ist. [1]",
      "Den gleitenden Fuß bewusst weiter nach hinten setzen als seine Ausgangsposition; dadurch wandert der Körper nach hinten. [1]",
      "Da die Füße sich nicht mehr treffen, entfällt der Vorwärtsschritt: gleiten, poppen, gleiten, poppen. [1]",
      "Zum Üben vor einem Spiegel oder mit Handyvideo aufnehmen und das Gleiten mit dem Poppen abgleichen. (Vorschlag)",
    ],
    plan: [
      { title: "Woche 1", text: "3 × 10 Minuten: Federn und Knie-Poppen im Takt, dann Sacking links und rechts. (Vorschlag, Inhalte nach [1])" },
      { title: "Woche 2", text: "3 × 10 Minuten: Sacking sauber im Takt, dann erste Gleitschritte langsam, mit Pausen zwischen den Schritten. (Vorschlag)" },
      { title: "Woche 3–4", text: "Gleiten mit Poppen verbinden, Tempo erst steigern, wenn der Rhythmus stimmt; kurze Videoaufnahmen zur Kontrolle. (Vorschlag)" },
    ],
    myths: [
      { myth: "Michael Jackson hat den Moonwalk erfunden.", fact: "Ähnliche Schritte sind schon in den 1930er-Jahren belegt (u. a. Cab Calloway, Charlie Chaplin); Jackson machte ihn 1983 weltberühmt und gab ihm den Namen. [2]" },
      { myth: "Man gleitet einfach über den Boden.", fact: "Die Illusion entsteht durch Wechsel von Fußspitze und Ferse, Kniebewegung und Gewicht. Die Anleitung dazu besteht aus Poppen und Gleiten im Wechsel. [1][2]" },
    ],
    mistakes: [
      "Die Ferse nicht ganz anheben beim Poppen. [1]",
      "Beim Gleiten warten, bis die Füße sich treffen, bevor das Knie poppt – beim Moonwalk muss das Knie vorher poppen. [1]",
      "Den gleitenden Fuß nur zurück zur Ausgangsposition führen; er muss weiter zurück, sonst kommst du nicht vom Fleck. [1]",
      "Zu schnell anfangen, bevor der Rhythmus sitzt. (Vorschlag)",
    ],
    safety: [
      "Auf Teppich bleibt man hängen, das belastet Knie und Sprunggelenk; glatter Boden ist leichter. (Vorsichtsregel, keine Quelle)",
      "Vor dem Üben aufwärmen, Waden und Sprunggelenke lockern. (Vorsichtsregel, keine Quelle)",
    ],
    conflicts: [
      "Ich habe nur eine Anleitung im Volltext gelesen (STEEZY). Andere Seiten (wikiHow, Instructables) waren nicht lesbar, die Detailangaben anderer Lehrer zu Ausgangsstellung und Gewichtsverlagerung kann ich daher nicht gegenüberstellen. [1]",
      "Der Schritt hat viele Namen (Moonwalk, Backslide, buzz, skate); die Quelle nennt ihn Backslide. [1][2]",
    ],
    videos: [
      { title: "MOONWALK Tutorial: How To GLIDE - Hip Hop Dance for Beginners » Matt Steffanina", id: "nEpyRzyceKU", channel: "DNCR", why: "Bekannter Choreograf, Einsteigertutorial zum Gleiten.", checked: true },
      { title: "LEARN HOW TO THE MOONWALK (aka The Backslide) | Step by Step Tutorial", id: "91L7NRyyNTE", channel: "The Confident Dancers", why: "Schritt-für-Schritt-Tutorial laut Titel.", checked: true },
      { title: "How to Moonwalk (Backslide) for Beginners (Step-by-Step Tutorial)", id: "9EQz2c2UZHk", channel: "MyRealNameIsCLARENCE", why: "Einsteiger-Tutorial laut Titel.", checked: true },
    ],
    sources: [
      { title: "STEEZY Blog – How To Do The Moonwalk (Backslide), Charise Roberts, 2024", url: "https://www.steezy.co/posts/how-to-do-the-moonwalk-backslide", kind: "Lehrkanal (Tanzschule)" },
      { title: "Wikipedia – Moonwalk (dance)", url: "https://en.wikipedia.org/wiki/Moonwalk_(dance)", kind: "Lexikon" },
    ],
  },

  "Krawatte binden": {
    date: DATE,
    steckbrief: {
      about: "Der Four-in-Hand ist der einfachste Krawattenknoten und der Einstieg. Es gibt keine Studienlage; die Anleitung beruht auf den Seiten eines Modehauses und eines Herstellers.",
      why: "Ein Handgriff, den man in Minuten lernt und bei Bewerbungen, Hochzeiten und Anlässen braucht.",
      tips: "Beim ersten Mal den obersten Hemdknopf geschlossen lassen; das breite Ende sollte etwa 30 Zentimeter länger als das schmale sein. Den Knoten locker lassen, bis er sitzt, dann festziehen. [2]",
      safety: "Nicht zu fest ziehen, nicht in der Nähe von Maschinen mit rotierenden Teilen tragen. (Vorsichtsregel, keine Quelle)",
    },
    learn: [
      "Ein Modehaus stellt sechs Knoten vor, von einfach bis anspruchsvoll: Four-in-Hand, Windsor und Doppelter Windsor, Kent, Pratt und Prince Albert. Als Einstieg empfiehlt es den Four-in-Hand; Windsor und Doppelter Windsor werden für Hochzeiten und festliche Anlässe genannt, Kent und Pratt für den Business-Alltag. [1]",
      "Der Four-in-Hand ist laut Breuninger lang, schmal und leicht asymmetrisch; er passe zu fast jeder Krawatte und Kragenform, außer sehr breiten Kragen. Der Pratt-Knoten wird mit Schwierigkeit 1 (für Anfänger geeignet) eingestuft, der Prince Albert mit 3. [1]",
      "Ein Hersteller nennt den Four-in-Hand den klassischsten Knoten: etwas kleiner als Windsor, für formelle Anlässe nicht unbedingt geeignet, aber der verbreitetste Knoten der westlichen Welt. Der Knoten sollte leicht asymmetrisch und länger als breit sein; die Spitze der Krawatte berührt die Gürtelschnalle, etwas kürzer ist in Ordnung. [2]",
      "Studien zum Krawattenbinden habe ich nicht gesucht und nicht gelesen. Dies ist ein Handwerk mit Konventionen, keine Frage der Studienlage.",
    ],
    evidence: { level: "anleitung", why: "Praktische Alltagsfertigkeit ohne Studienlage; die Schritte stammen aus der Anleitung eines Modehauses und eines Herstellers." },
    steps: [
      "Hemdkragen aufstellen und die Krawatte um den Hals legen: das breite Ende rechts und etwa 30 Zentimeter länger als das schmale. Beim ersten Mal den obersten Hemdknopf geschlossen lassen. [1][2]",
      "Das breite Ende über das schmale Ende nach links führen. [1]",
      "Das breite Ende hinter dem schmalen Ende nach rechts ziehen. [1]",
      "Das breite Ende noch einmal vorn über die Mitte legen. [1]",
      "Das breite Ende von unten nach oben durch die Halsschlaufe führen. [1]",
      "Das breite Ende von oben durch die vordere Schlaufe nach unten ziehen. [1]",
      "Den Knoten locker halten, dann festziehen: das schmale Ende festhalten und den Knoten nach oben schieben. Mit dem Zeigefinger in den Knoten drücken, um eine Delle zu formen. [1][2]",
      "Den Knoten gerade ausrichten, Kragen herunterklappen; die Spitze sollte die Gürtelschnalle erreichen, etwas kürzer ist in Ordnung. [1][2]",
    ],
    plan: [
      { title: "Tag 1–3", text: "Jeden Tag 5 Minuten den Four-in-Hand vor dem Spiegel, langsam, Schritt für Schritt. (Vorschlag)" },
      { title: "Woche 1", text: "Täglich einmal binden, bis die Abfolge ohne Hinsehen klappt; Länge so einstellen, dass die Spitze an der Gürtelschnalle endet. [2] (Vorschlag)" },
      { title: "Woche 2–3", text: "Pratt-Knoten ausprobieren (laut Quelle für Anfänger geeignet, Schwierigkeit 1). [1] Danach bei Bedarf Windsor für festliche Anlässe. [1] (Vorschlag)" },
    ],
    myths: [
      { myth: "Es gibt den einen richtigen Knoten.", fact: "Die Quellen ordnen die Knoten je nach Anlass und Kragenform; der Four-in-Hand gilt als Standard, wird aber unterschiedlich für formelle Anlässe eingestuft. [1][2]" },
      { myth: "Der Knoten muss möglichst fest sitzen.", fact: "Beide Anleitungen lassen den Knoten erst locker und ziehen ihn dann vorsichtig fest. [1][2]" },
    ],
    mistakes: [
      "Breites Ende zu kurz gewählt: Die Spitze reicht dann nicht bis zur Gürtelschnalle. [2]",
      "Knoten sofort hart festziehen statt erst locker zu halten und dann nach oben zu schieben. [1][2]",
      "Falsche Seite für das breite Ende: Je nach Quelle rechts oder links, abhängig von der Händigkeit. [2]",
    ],
    safety: [
      "Nicht zu fest ziehen, damit der Hals nicht eingeengt wird. (Vorsichtsregel, keine Quelle)",
      "Bei Arbeiten an Maschinen mit rotierenden Teilen Krawatte ablegen oder einstecken. (Vorsichtsregel, keine Quelle)",
    ],
    conflicts: [
      "Ausgangsseite: Der geschriebene Teil von Breuninger legt das breite Ende rechts, das Video-Transkript derselben Seite links. Charles Tyrwhitt nennt rechts für Rechtshänder und links für Linkshänder. [1][2]",
      "Einordnung des Four-in-Hand: Charles Tyrwhitt hält ihn für formelle Anlässe nicht unbedingt geeignet, Breuninger beschreibt ihn im Video als passend zu jedem Anlass und im Text als Abrundung lässig-sportlicher Outfits. [1][2]",
    ],
    videos: [
      { title: "Bernhard Roetzel zeigt, wie man den Four-in-Hand-Knoten bindet.", id: "yEj-dEIJxvk", channel: "Bernhard Roetzel", why: "Autor des Buchs „Der Gentleman“; Anleitung zum Four-in-Hand laut Titel.", checked: true },
      { title: "Krawattenknoten binden: Der Four-in-Hand-Knoten", id: "O8_wboDgOOs", channel: "Hirmer München", why: "Herrenausstatter; Four-in-Hand laut Titel.", checked: true },
      { title: "Einfacher Krawattenknoten (Four in Hand) - Schritt-für-Schritt Anleitung", id: "RIu1yTtM4d8", channel: "SonjaKampyCollection", why: "Schritt-für-Schritt-Anleitung laut Titel.", checked: true },
    ],
    sources: [
      { title: "Breuninger – Krawatte binden: 6 einfache Anleitungen für Krawattenknoten", url: "https://www.breuninger.com/de/editorial/anzug-guide/krawatte-binden/", kind: "Modehaus (Ratgeber)" },
      { title: "Charles Tyrwhitt – Der Four-in-Hand Krawattenknoten", url: "https://www.charlestyrwhitt.com/de/editorial-style-tips/der-four-in-hand-krawattenknoten.html", kind: "Hersteller" },
    ],
  },

  "Laut pfeifen": {
    date: DATE,
    steckbrief: {
      about: "Pfeifen ohne Finger: mit gespitzten Lippen, mit der Zunge oder durch Einatmen. Die lauteste Variante in den gelesenen Quellen ist das Pfeifen mit Fingern; für ein wirklich lautes Pfeifen ohne Finger habe ich keine belastbare Anleitung gefunden.",
      why: "Pfeifen ist erlernbar, wenn keine körperliche Ursache dagegen spricht, und nützlich, um Aufmerksamkeit zu bekommen.",
      tips: "Lippen befeuchten und spitzen, zuerst leise blasen, bis ein Ton kommt, dann fester blasen. Je stärker du die Lippen spitzt und je fester du bläst, desto lauter. [1]",
      safety: "Nicht bis zum Schwindel blasen; sehr laute Pfiffe nicht direkt am Ohr anderer. (Vorsichtsregel, keine Quelle)",
    },
    learn: [
      "Eine medizinisch geprüfte Gesundheitsseite: Außer bei einer körperlichen Ursache können die meisten Menschen pfeifen lernen, mit Lippen, Mund, Zunge oder Fingern. Pfeifen sei erlernt, nicht angeboren, und man solle bei Misserfolg nicht aufgeben. [1]",
      "Die Seite nennt vier Methoden: Lippenpfeifen, Fingerpfeifen, Zungenpfeifen und Pfeifen durch Einatmen. Das Zungenpfeifen klinge leiser als Finger- oder Lippenpfeifen; beim Einatmen-Pfeifen werde der Ton lauter, je stärker man Luft einzieht, und es sei gut, um Aufmerksamkeit zu bekommen. [1]",
      "Bei Erfolglosigkeit trotz viel Üben kann ein körperlicher Grund vorliegen: Beim Pfeifen muss sich der Gaumen-Rachen-Verschluss (Velopharynx) vollständig schließen. Die Seite räumt ein, dass es dazu keinen wissenschaftlichen Beleg in der einen oder anderen Richtung gibt. [1]",
      "Das Lexikon beschreibt das Lippenpfeifen als die in westlicher Musik häufigste Form: Die Zungenspitze ist meist abgesenkt (oft hinter den unteren Zähnen), die Tonhöhe wird vor allem durch die Zungenstellung verändert. Die gebogene Zunge wirkt als Resonanzraum (Helmholtz-Resonator). [2]",
    ],
    evidence: { level: "anleitung", why: "Praktische Fertigkeit ohne Studienlage; die Anleitung stammt aus einer medizinisch geprüften Gesundheitsseite und einem Lexikon." },
    steps: [
      "Lippen befeuchten und spitzen. [1]",
      "Zuerst leise Luft durch die Lippen blasen, bis ein Ton zu hören ist. [1]",
      "Kräftiger blasen, die Zunge dabei entspannt lassen. [1]",
      "Lippen, Kiefer und Zunge verändern, um andere Töne zu finden (Zungenspitze wie im Lexikon meist hinter den unteren Zähnen). [1][2]",
      "Für mehr Lautstärke: stärker spitzen und fester blasen. [1]",
      "Alternative Zungenpfeife: Lippen leicht spitzen, Mund leicht öffnen, die Zunge hinter die oberen Vorderzähne an den Gaumen legen; stärker spitzen und fester blasen macht lauter. [1]",
      "Alternative Einatmen: Lippen befeuchten und spitzen, Luft einziehen, bis ein Ton kommt; je stärker, desto lauter. [1]",
    ],
    plan: [
      { title: "Woche 1", text: "Täglich 5 Minuten Lippenpfeifen: nur Ton erzeugen, nicht laut. (Vorschlag)" },
      { title: "Woche 2", text: "Täglich 5 Minuten: Ton halten, mit Lippen und Zunge verändern. (Vorschlag)" },
      { title: "Woche 3–4", text: "Lautstärke steigern über Spitzen und Blasdruck; alternativ Zungen- oder Einatmen-Pfeife testen. [1] (Vorschlag)" },
    ],
    myths: [
      { myth: "Entweder man kann pfeifen oder nicht.", fact: "Laut Gesundheitsseite ist es erlernt; fast alle können es mit Üben lernen, außer bei körperlicher Ursache. [1]" },
      { myth: "Zungenpfeifen ist die lauteste Technik.", fact: "Die Seite beschreibt das Zungenpfeifen als leiser als Finger- und Lippenpfeifen. [1]" },
    ],
    mistakes: [
      "Von Anfang an laut blasen wollen: Die Anleitung beginnt mit leisem Blasen. [1]",
      "Die Zunge verkrampfen: Beim Lippenpfeifen soll sie entspannt sein. [1]",
      "Lippen nicht befeuchtet. [1]",
    ],
    safety: [
      "Langes, kräftiges Blasen kann schwindelig machen; Pausen machen. (Vorsichtsregel, keine Quelle)",
      "Sehr laute Pfiffe nicht nahe am Ohr anderer. (Vorsichtsregel, keine Quelle)",
    ],
    conflicts: [
      "Zungenstellung: Das Lexikon beschreibt beim üblichen Lippenpfeifen die Zungenspitze meist hinter den unteren Zähnen, die Gesundheitsseite beim Zungenpfeifen hinter den oberen. Das sind zwei unterschiedliche Techniken, ich habe keine Quelle gefunden, die sie vergleicht. [1][2]",
      "Die Lautstärke ohne Finger: Die gelesene Seite gibt nur an, dass mehr Spitzen und Blasdruck lauter machen; Zahlen oder Messungen fehlen. [1]",
    ],
    videos: [
      { title: "How to Whistle Without Fingers", id: "GUlmNjkCP4A", channel: "Dan Usher", why: "Tutorial zum Pfeifen ohne Finger laut Titel.", checked: true },
      { title: "How to Whistle Without Fingers - Herr Fuchs Dumbtorial 1", id: "LA1c-xl7oxo", channel: "Herr Fuchs", why: "Tutorial zum Pfeifen ohne Finger laut Titel.", checked: true },
      { title: "How to whistle LOUD without Fingers. tip #22", id: "ysn71x6IhHk", channel: "Matt B", why: "Tipp zum lauten Pfeifen ohne Finger laut Titel.", checked: true },
    ],
    sources: [
      { title: "Healthline – How to Whistle: 4 Ways (medizinisch geprüft, 2023)", url: "https://healthline.com/health/how-to-whistle", kind: "Gesundheitsportal" },
      { title: "Wikipedia – Whistling", url: "https://en.wikipedia.org/wiki/Whistling", kind: "Lexikon" },
    ],
  },

  "Münzrolle": {
    date: DATE,
    steckbrief: {
      about: "Die Münze wandert über die Fingerknöchel der Hand. Sie gilt als Münzjonglage („Coin walk“ oder „Coin roll“); es gibt keine Studienlage, die Anleitung beruht auf einer Nutzeranleitung und einem Lexikon.",
      why: "Ein kleiner Trick mit sichtbarem Fortschritt, der überall übbar ist.",
      tips: "Mit einer größeren Münze beginnen (Vorschlag). Die Schritte langsam und einzeln üben, erst dann zusammensetzen. [1]",
      safety: "Münzen von Kindern und Haustieren fernhalten (Verschluckungsgefahr). (Vorsichtsregel, keine Quelle)",
    },
    learn: [
      "Das Lexikon nennt Münzjonglage: das Handhaben von Münzen auf und um die Hände. Der Schwierigkeitsgrad reiche von Tricks, die Minuten dauern, bis zu solchen, die Monate oder Jahre brauchen. Der Coin walk gilt dort als vergleichsweise fortgeschritten. [2]",
      "Eine Nutzeranleitung beschreibt die Münzrolle in sechs Schritten: Münze auf dem Daumen balancieren, auf den Zeigefinger legen, sanft auf den Mittelfinger rollen lassen, mit dem Ringfinger weiter anstoßen und schließlich zwischen Ring- und kleinem Finger einklemmen. [1]",
      "Studien zur Münzrolle habe ich nicht gefunden. Die Anleitung stammt aus einer einzigen Seite mit kurzen Textschritten ohne Fotos; andere Seiten (Instructables, wikiHow) waren nicht lesbar. [1]",
    ],
    evidence: { level: "anleitung", why: "Handgeschicklichkeit ohne Studienlage; die Schritte stammen aus einer Nutzeranleitung (Brit + Co) und einem Lexikon." },
    steps: [
      "Eine Münze (in der Quelle ein Quarter) auf dem Daumen balancieren. [1]",
      "Die Münze nur mit dem Daumen auf den Zeigefinger legen. [1]",
      "Die Münze sanft anstoßen, damit sie auf den Mittelfinger rollt. [1]",
      "Mit dem Ringfinger sanft anstoßen, damit sie auf den Ringfinger rollt. [1]",
      "Die Münze vom Ringfinger rollen lassen und zwischen Ringfinger und kleinem Finger einklemmen. [1]",
      "Die Münze auf den Daumen fallen lassen, zum Zeigefinger bringen und von vorn beginnen. [1]",
      "Erst jeden Übergang einzeln üben (Daumen zu Zeigefinger, Zeigefinger zu Mittelfinger), dann zusammensetzen. (Vorschlag)",
    ],
    plan: [
      { title: "Woche 1", text: "5 Minuten täglich: nur die ersten zwei Übergänge (Daumen, Zeigefinger, Mittelfinger). (Vorschlag)" },
      { title: "Woche 2", text: "5 Minuten täglich: bis zum Ringfinger und Einklemmen, langsam. (Vorschlag)" },
      { title: "Woche 3–4", text: "Ganze Folge fließend; danach die andere Hand. (Vorschlag)" },
    ],
    myths: [
      { myth: "Das ist in einem Nachmittag gelernt.", fact: "Das Lexikon nennt für Münztricks eine Spanne von Minuten bis Jahren; der Coin walk gilt als fortgeschritten. [2]" },
    ],
    mistakes: [
      "Die Münze zu hart anstoßen; sie soll sanft rollen. [1]",
      "Die Schritte nicht einzeln üben, sondern sofort in Folge. (Vorschlag)",
    ],
    safety: [
      "Münzen sind für kleine Kinder und Haustiere ein Verschluckungsrisiko. (Vorsichtsregel, keine Quelle)",
    ],
    conflicts: [
      "Münzgröße und Fingerführung hängen von der Hand ab; ich habe nur eine Textanleitung im Volltext gelesen und kann Varianten nicht vergleichen. [1]",
    ],
    videos: [
      { title: "How to roll a coin across your knuckles - BEST Tutorial", id: "2vWouZ2tyr0", channel: "Jason Parker", why: "Tutorial zur Knöchelrolle laut Titel.", checked: true },
      { title: "How to Roll a Coin on Your Fingers, Full Tutorial", id: "DVdsECprTUA", channel: "Interval Magic", why: "Vollständiges Tutorial laut Titel.", checked: true },
      { title: "LEARN HOW TO ROLL A COIN ACROSS YOUR KNUCKLES: Do the COIN ROLL. In-depth tutorial! Multiple angles", id: "1aPsfnp9A-A", channel: "Hey Pete!", why: "Ausführliches Tutorial mit mehreren Kamerawinkeln laut Titel.", checked: true },
    ],
    sources: [
      { title: "Brit + Co Guides – How to roll a coin across your knuckles (Hunter Kollmann)", url: "https://guides.brit.co/guides/roll-a-coin-across-your-knuckles", kind: "Nutzeranleitung" },
      { title: "Wikipedia – Coin manipulation", url: "https://en.wikipedia.org/wiki/Coin_manipulation", kind: "Lexikon" },
    ],
  },

  "Stift drehen": {
    date: DATE,
    steckbrief: {
      about: "Pen Spinning: Der Stift dreht sich über die Finger. Der Grundtrick ist das ThumbAround, bei dem er einmal um den Daumen wandert. Es gibt keine Studienlage; die Anleitung beruht auf einem Lexikon und einer Nutzeranleitung.",
      why: "Ein kleiner Trick für Pausen mit klar sichtbarem Fortschritt.",
      tips: "Mit einem glatten, gleichmäßig gewichteten Stift beginnen. Der Daumen bewegt sich kaum; der Stift wird vom Mittelfinger angestoßen. [2]",
      safety: "Spitze Stifte und offene Minen vermeiden; abprallende Stifte können Augen treffen. (Vorsichtsregel, keine Quelle)",
    },
    learn: [
      "Das Lexikon beschreibt Pen Spinning als Form der Objektmanipulation, die oft als Zeitvertreib in Schule und Büro betrieben wird; es gibt auch Wettbewerbe. Die ThumbAround und der Sonic gehörten schon in den 1970er-Jahren in Japan zu den Grundtricks. [1]",
      "Ein ThumbAround entsteht laut Lexikon, indem man den Stift mit einem beliebigen Finger außer dem Daumen anstößt (meist mit dem Mittelfinger), sodass er einmal um den Daumen dreht und dann zwischen Daumen und einem Finger gefangen wird. [1]",
      "Die Nutzeranleitung ergänzt das Prinzip: Der Griff etwa eine Fingerlänge vom Schwerpunkt entfernt, der Mittelfinger baut Druck vor, der sich löst, wenn der Zeigefinger sich öffnet; der Stift dreht dadurch um den Daumen. [2]",
      "Zum Pen Spinning gibt es keine Studienlage. Das Lexikon weist selbst auf fehlende Quellen hin. [1]",
    ],
    evidence: { level: "anleitung", why: "Handgeschicklichkeit ohne Studienlage; die Schritte stammen aus einer Nutzeranleitung (Brit + Co), die Definition aus einem Lexikon." },
    steps: [
      "Einen glatten, gleichmäßig gewichteten Stift wählen. [2]",
      "Den Schwerpunkt finden, indem man den Stift auf der Fingerspitze balanciert; er muss nicht genau in der Mitte liegen. [2]",
      "Den Stift etwa eine Fingerlänge vom Schwerpunkt entfernt mit Daumen, Zeige- und Mittelfinger greifen; das schwerere Ende zeigt von der Hand weg. [2]",
      "Der Mittelfinger baut Druck auf den Stift auf; der Zeigefinger öffnet sich und löst den Druck, sodass der Stift um den Daumen dreht. Der Daumen bewegt sich dabei kaum. [2]",
      "Den Zeigefinger gestreckt halten, damit der Stift ihn nicht trifft. [2]",
      "Sobald der Stift am Zeigefinger vorbei ist, mit Daumen und Zeigefinger zugreifen. [2]",
      "Beim Gelingen fühlt sich der Stift wie von einem Magneten an der Hand gehalten an. [2]",
      "Zuerst ohne Tempo üben, dann steigern. (Vorschlag)",
    ],
    plan: [
      { title: "Woche 1", text: "Täglich 5 Minuten: nur den Griff und den ersten Anstoß; Stift muss nicht ganz herumkommen. (Vorschlag)" },
      { title: "Woche 2", text: "Täglich 5 Minuten: ganzer ThumbAround, Ziel mehrere gelungene Versuche hintereinander. (Vorschlag)" },
      { title: "Woche 3–4", text: "Gleichmäßigkeit steigern; danach den Sonic als zweiten Grundtrick. [1] (Vorschlag)" },
    ],
    myths: [
      { myth: "Pen Spinning ist eine Modeerscheinung der Internetvideos.", fact: "Laut Lexikon wurden in Japan schon in den 1970er-Jahren einfache Tricks wie ThumbAround und Sonic gedreht; die Verbreitung über Videoportale und Foren kam später. [1]" },
    ],
    mistakes: [
      "Den Daumen mitbewegen; er soll kaum bewegt werden. [2]",
      "Den Zeigefinger nicht gestreckt halten, der Stift stößt an. [2]",
      "Einen unausgewogenen Stift wählen. [2]",
    ],
    safety: [
      "Spitze Stifte oder offene Minen vermeiden; Stifte können wegfliegen. (Vorsichtsregel, keine Quelle)",
      "Nicht in der Nähe von Personen üben, die nicht darauf vorbereitet sind. (Vorsichtsregel, keine Quelle)",
    ],
    conflicts: [
      "Ich habe nur eine Nutzeranleitung im Volltext gelesen. Das Lexikon nennt andere Anstoßfinger („jeder Finger außer dem Daumen“); die Nutzeranleitung bleibt beim Mittelfinger. [1][2]",
    ],
    videos: [
      { title: "How to do a Thumb Around - Learn to Pen Spin in 5 Minutes", id: "V-9zo0Swe0Y", channel: "pigmie", why: "ThumbAround-Tutorial für Einsteiger laut Titel.", checked: true },
      { title: "Thumb Around - Anyone Can Do / basic Pen Spinning Tutorial", id: "XBfiQEoQZDw", channel: "Pen Stock", why: "Grundtutorial laut Titel.", checked: true },
      { title: "pen spinning fundamental trick - thumbaround", id: "z4SsXIBUFcI", channel: "Jone Rawls", why: "Grundtrick laut Titel.", checked: true },
    ],
    sources: [
      { title: "Wikipedia – Pen spinning", url: "https://en.wikipedia.org/wiki/Pen_spinning", kind: "Lexikon" },
      { title: "Brit + Co Guides – How to spin a pen around your thumb (Harley Johnson)", url: "https://guides.brit.co/guides/spin-a-pen-around-your-thumb", kind: "Nutzeranleitung" },
    ],
  },

  "Bier öffnen": {
    date: DATE,
    steckbrief: {
      about: "Eine Flasche mit Kronkorken sicher öffnen, mit dem Flaschenöffner oder im Notfall über Hebelwirkung. Es gibt keine Studie zum Öffnen selbst; zur Sicherheit liegen Studien zu Verletzungen durch Verschlüsse (an Sektflaschen) vor.",
      why: "Eine Alltagsfertigkeit; wichtig ist, dabei keine Verletzungen und keine Schäden zu verursachen.",
      tips: "Am besten mit einem Flaschenöffner öffnen. Zum Üben eine alkoholfreie Flasche oder Wasserflasche mit Kronkorken nehmen. (Vorschlag)",
      safety: "Kronkorken sind scharfkantig; Hände gut fixieren. [1] Verschlüsse können Augen verletzen (Studie an Sektflaschen). [3]",
    },
    learn: [
      "Ein Ratgeber beschreibt das Öffnen einer Kronkorken-Flasche mit einer zweiten Flasche über Hebelwirkung. Er warnt, dass Kronkorken scharfkantig sein können, und rät, die Hände gut zu fixieren, um Abrutschen zu vermeiden. [1]",
      "Zur Sicherheit: Eine Fallserie aus Modena beschreibt 34 Augenverletzungen durch Flaschenkorken und Verschlüsse, alle durch Schaumwein verursacht. Die häufigste Verletzung war ein Bluterguss in der Augenvorderkammer (Hyphäma); die schwerste eine Netzhautablösung durch einen großen Riss, zwei Personen hatten sehr schwere Sehverluste. Zu Bier gibt die Studie keine Zahlen. [3]",
      "Zum Alkohol: Die Bundeszentrale für gesundheitliche Aufklärung (BZgA) nennt in ihrem Faltblatt „Alkohol – Die Fakten“ als risikoarme Grenze für gesunde Erwachsene: bei Frauen ein Standardglas pro Tag (10 bis 12 Gramm reiner Alkohol), bei Männern zwei Standardgläser (20 bis 24 Gramm). Ein Glas Bier (0,25 Liter, 5 Vol.-%) entspricht einem Standardglas mit 12 Gramm. Alkohol sei grundsätzlich ein Risiko für die Gesundheit. [2]",
    ],
    evidence: { level: "anleitung", why: "Alltagshandgriff ohne Studienlage zum Öffnen; die Schritte stammen aus einem Ratgeber, die Sicherheitshinweise aus einer Fallstudie (Schaumwein) und einem BZgA-Faltblatt." },
    steps: [
      "Die Flasche, die geöffnet werden soll, mit der nicht dominanten Hand am Hals festhalten; die Finger knapp unterhalb des Kronkorkens. [1]",
      "Mit der dominanten Hand eine zweite Flasche am unteren Teil greifen und deren Kronkorken unter den Rand des Kronkorkens der ersten setzen, sodass ein stabiler Kontaktpunkt entsteht. [1]",
      "Die zweite Flasche nach unten drücken (Hebelwirkung), sodass der Kronkorken abspringt; eine schnelle, ruckartige Bewegung hilft. [1]",
      "Darauf achten, dass die scharfen Kanten des Kronkorkens nicht an den Händen schrammen. [1]",
      "Der Standardweg ist ein Flaschenöffner, der unter den Rand des Kronkorkens gesetzt und nach oben gehebelt wird. (Vorschlag)",
      "Flasche beim Öffnen nicht auf das Gesicht anderer richten und den Kronkorken nicht wegschleudern. (Vorsichtsregel, abgeleitet aus [3])",
    ],
    plan: [
      { title: "Einmalig", text: "Mit einer alkoholfreien oder leeren Flasche zwei- bis dreimal die Hebelbewegung üben, dann mit einem Flaschenöffner. (Vorschlag)" },
    ],
    myths: [
      { myth: "Mit Zähnen, Feuerzeug oder Tischkante ist es genauso sicher.", fact: "Der Ratgeber warnt vor Verletzungen durch scharfe Kanten und rät, Hände zu fixieren und empfindliche Oberflächen zu schonen. [1] Zu Zähnen oder Feuerzeug habe ich keine Sicherheitsbewertung gelesen; ich rate davon ab. (Vorsichtsregel, keine Quelle)" },
      { myth: "Alkohol in geringen Mengen ist gesund.", fact: "Das BZgA-Faltblatt nennt Alkohol grundsätzlich ein Risiko; die Grenzwerte beschreiben „risikoarmen“ Konsum für gesunde Erwachsene, keinen gesundheitlichen Nutzen. [2]" },
    ],
    mistakes: [
      "Abrutschen mit der Hand an die scharfe Kante des Kronkorkens. [1]",
      "Den Verschluss unkontrolliert wegspringen lassen. (Vorsichtsregel)",
    ],
    safety: [
      "Verschlüsse können Augen verletzen; die Fallserie betraf Sektflaschen (kohlensäurehaltig, unter Druck). Bei Bierflaschen habe ich keine Zahlen. [3]",
      "Alkoholgrenzen (gesunde Erwachsene): Frauen höchstens ein Standardglas (10–12 g) pro Tag, Männer zwei (20–24 g). Die Grenzwerte gelten für gesunde Erwachsene; das Faltblatt weist auf Ausnahmen hin. [2]",
    ],
    conflicts: [
      "Die Fallserie aus Modena betrifft Schaumweinflaschen, nicht Bier; die Übertragung auf Bierflaschen ist eine Annahme. [3]",
      "Ich habe zur Hebeltechnik mit dem Flaschenöffner keine Fachquelle gelesen; der Standardweg ist als Vorschlag gekennzeichnet. [1]",
    ],
    videos: [
      { title: "Bierflaschen öffnen wie ein Profi feat. Hanseatenbande | Geniale Fakten, Tipps & Tricks", id: "ew9uYxkscdg", channel: "Der Schlaumacher | Geniale Fakten, Tipps & Lifehacks", why: "Lifehack-Video laut Titel; zeigt vermutlich Methoden ohne Öffner, Inhalt nicht angesehen.", checked: true },
      { title: "Flasche einfach mit Kronkorken öffnen | Lifehack", id: "6Kon7MqKo4Y", channel: "floriansaur", why: "Lifehack laut Titel, Inhalt nicht angesehen.", checked: true },
      { title: "Bier öffnen für Dummies - ohne Flaschenöffner.", id: "mIMci18aomY", channel: "Christian Korbinian", why: "Methoden ohne Öffner laut Titel, Inhalt nicht angesehen.", checked: true },
    ],
    videoNote: "Alle drei Videos zeigen laut Titel Lifehacks ohne Flaschenöffner; ich habe sie nicht angesehen und weiß nicht, ob sie riskante Methoden zeigen. Sicherheitsempfehlung: Flaschenöffner benutzen.",
    sources: [
      { title: "Hausjournal – Flasche mit Flasche öffnen: So geht's", url: "https://www.hausjournal.net/flasche-mit-flasche-oeffnen", kind: "Ratgeber" },
      { title: "BZgA – Alkohol: Die Fakten (Faltblatt, kenn-dein-limit.info)", url: "https://shop.bzga.de/pdf/32200064.pdf", kind: "Behörde" },
      { title: "Cavallini et al. 2009, Graefes Arch Clin Exp Ophthalmol – Bottle cork and cap injury to the eye: a review of 34 cases", url: PM("18696096"), kind: "Fallserie" },
    ],
  },
};
