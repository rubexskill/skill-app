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

  "Ein Bild malen": {
    date: DATE,
    steckbrief: {
      about: "Ein erstes Bild mit Acrylfarben malen: wenige Farben, einfaches Motiv, günstiges Material. Es gibt keine Studienlage; die Anleitung beruht auf einer Lehrwebsite für Anfänger.",
      why: "Malen braucht wenig Vorwissen, und Acryl trocknet schnell und verzeiht Fehler.",
      tips: "Studentenfarben statt Bastelfarben, eine kleine Palette, günstiger Malblock als Untergrund. Zuerst üben, nicht jedes Bild behalten wollen. [1]",
      safety: "Gut lüften, Hinweise der Hersteller auf der Verpackung beachten, Farbreste nicht ungefiltert ins Abwasser. (Vorsichtsregel, keine Quelle)",
    },
    learn: [
      "Die Lehrwebsite Online Art Lessons nennt Acryl für Anfänger geeignet: vielseitig, schnell trocknend und nachsichtig; man könne frei experimentieren. Sie unterscheidet drei Qualitätsstufen: Bastelfarbe (wenig Pigment), Studentenqualität (mehr Pigment) und Künstlerqualität (am meisten Pigment). Für den Anfang rät sie zu Studentenqualität, genannt werden Winsor & Newton Galeria und Liquitex Basics. [1]",
      "Zur Palette nennt dieselbe Seite drei Möglichkeiten: monochrom (Schwarz und Weiß oder eine Farbe und Weiß, um Helligkeitswerte zu lernen), Grundfarben (je ein Rot, Blau, Gelb plus Schwarz und Weiß) oder eine geteilte Grundpalette mit je einer warmen und einer kühlen Version jeder Grundfarbe plus Paynes Grau und Titanweiß. [1]",
      "Zum Malgrund: Acryl- oder Leinwandpapier-Blöcke sind für den Anfang günstig, später Leinwandplatten. Billige Leinwände aus Supermärkten seien oft dünn und rau und ließen Mischen und Schichten schwer werden. [1]",
      "Zu Pinseln: Günstige Borstenpinsel zum Anlegen und Synthetikpinsel (z. B. Taklon) für Details; Flach-, Rund- und Filbertpinsel in kleiner, mittlerer und großer Größe. Dazu Papiertücher, Sprühflasche und zwei Wasserbehälter. [1]",
      "Zum Mischen: Mit der helleren Farbe beginnen und die dunkle nach und nach zugeben („anschleichen“). Komplementärfarben können die Intensität dämpfen; leuchtende Tubenfarben kämen in der Natur selten vor. [1]",
      "Zur Seriosität: Die Seite ist eine kommerzielle Lehrseite des Autors mit Affiliate-Links und eigenen Hilfsmitteln; es ist keine Studie. [1]",
    ],
    evidence: { level: "anleitung", why: "Praktische Kreativfertigkeit ohne Studienlage; die Schritte stammen aus der Anleitung einer Lehrwebsite für Anfänger (mit Affiliate-Links)." },
    steps: [
      "Farben in Studentenqualität wählen, nicht Bastelfarbe; ein Beispiel der Quelle: Winsor & Newton Galeria oder Liquitex Basics. [1]",
      "Eine kleine Palette wählen: z. B. Grundfarben plus Schwarz und Weiß, oder erst monochrom üben. [1]",
      "Auf einem günstigen Acryl- oder Leinwandpapier-Block üben. [1]",
      "Pinsel: ein Borstenpinsel zum Anlegen, ein bis zwei Synthetikpinsel für Details; zwei Wasserbehälter und Papiertücher bereitlegen. [1]",
      "Farben mischen: mit der hellen Farbe beginnen, die dunkle in kleinen Mengen dazugeben. [1]",
      "Ein einfaches Motiv mit wenigen Formen wählen (z. B. ein Stillleben mit zwei Gegenständen). (Vorschlag)",
      "Erst Hintergrund und große Flächen anlegen, dann Details. (Vorschlag)",
      "Trocknen lassen, Abstand nehmen, nächstes Bild beginnen. (Vorschlag)",
    ],
    plan: [
      { title: "Woche 1", text: "Zweimal 30 Minuten: Farbkarte anlegen, Mischen üben (hell zu dunkel), nur Schwarz-Weiß-Studien. [1] (Vorschlag)" },
      { title: "Woche 2", text: "Einmal 60 Minuten: ein Stillleben mit zwei Gegenständen in begrenzter Palette. (Vorschlag)" },
      { title: "Woche 3–4", text: "Zweites Bild mit demselben Motiv, andere Farben; beide vergleichen. (Vorschlag)" },
    ],
    myths: [
      { myth: "Man braucht teures Material.", fact: "Die Quelle rät Anfängern zu Studentenfarben und günstigen Malblöcken; teure Leinwände seien am Anfang eher hinderlich. [1]" },
      { myth: "Möglichst viele Farben kaufen.", fact: "Die Quelle rät zu einer kleinen Palette (monochrom oder Grundfarben), um Technik zu lernen. [1]" },
    ],
    mistakes: [
      "Bastelfarben mit wenig Pigment kaufen: Sie sind laut Quelle frustrierend beim Mischen. [1]",
      "Zu viele Farben auf einmal. [1]",
      "Teure Leinwand für erste Versuche; billige Supermarktleinwände sind ebenfalls ungeeignet. [1]",
      "Zu dunkel anmischen, weil man mit der dunklen Farbe beginnt. [1]",
    ],
    safety: [
      "Gut lüften; Verpackungs- und Sicherheitshinweise des Herstellers beachten. (Vorsichtsregel, keine Quelle)",
      "Farbreste und Pinselwasser nicht in Gewässer kippen. (Vorsichtsregel, keine Quelle)",
    ],
    conflicts: [
      "Ich habe nur eine Anleitung im Volltext gelesen; andere Lehrseiten (Skillshare, Jackson's, UAL) waren nicht lesbar. Empfehlungen zu Marken und Paletten sind daher unverglichen. [1]",
    ],
    videos: [
      { title: "ACRYLMALEN - Ein Bild für Anfänger - Schritt für Schritt -ACRYLIC PAINTING - Painting for beginners", id: "14bnjBmMj9o", channel: "Mara Bauer Art", why: "Deutschsprachige Einsteigeranleitung laut Titel.", checked: true },
      { title: "Acrylmalen Schritt für Schritt erklärt - so geht das", id: "ioTtZ06Oz3c", channel: "Mara Bauer Art", why: "Deutschsprachige Schritt-für-Schritt-Anleitung laut Titel.", checked: true },
      { title: "Acrylbild mit 4 Farben - das kann jeder - ganz einfach", id: "_jxf71gsLB4", channel: "Mara Bauer Art", why: "Bild mit wenigen Farben laut Titel.", checked: true },
    ],
    videoNote: "Alle drei Videos stammen vom selben Kanal; Inhalt nur nach Titel beurteilt, nicht angesehen.",
    sources: [
      { title: "Online Art Lessons – 10 Acrylic Painting Tips for Beginners", url: "https://onlineartlessons.com/tutorial/10-acrylic-painting-tips-for-beginners/", kind: "Lehrwebsite" },
    ],
  },

  "Hyperrealismus": {
    date: DATE,
    steckbrief: {
      about: "Hyperrealismus und Fotorealismus bilden Fotos in feinster Detailtreue ab. Die Anleitung beschreibt den Ablauf der Fotorealismus-Malerei in Acryl nach einer Künstlerin; es gibt keine Studienlage.",
      why: "Ein langer, aber gut zerlegbarer Prozess: Foto, Übertragung, Untermalung, dünne Schichten, Firnis.",
      tips: "Erst kleine Studien (Farbstift oder Aquarell), dann das Foto übertragen (Gitter, Projektor, Transferpapier), in vielen dünnen Schichten aufbauen. [1]",
      safety: "Firnis, Medien und Farben nach Herstellerangaben und mit Lüftung verwenden. (Vorsichtsregel, keine Quelle)",
    },
    learn: [
      "Eine selbstlernende Fotorealismus-Malerin (Thaneeya McArdle, Seite Art is Fun) beschreibt Fotorealismus als sorgfältige Wiedergabe jedes Details des Fotos auf der Leinwand, meist in Acryl oder Öl, per Hand oder Airbrush. Vor großen Arbeiten entstünden häufig kleine Studien in Farbstift oder Aquarell, um Komposition, Perspektive, Form, Licht und Schatten zu klären. [1]",
      "Das Foto werde mechanisch übertragen: mit Projektor, Gitterverfahren oder Transferpapier. Der Begriff „Fotorealismus“ wurde 1968 vom New Yorker Kunsthändler Louis K. Meisel geprägt; seine Definition verlangt die Übertragung über mechanische oder halbmechanische Mittel. Manche Kritiker nennen das „sinnloses Kopieren“; die Autorin verweist auf Maler wie Vermeer und van Eyck, die mechanische Hilfsmittel nutzten. [1]",
      "Die Bilder entstehen additiv in vielen Schichten: Untermalung, dann Entwicklung der Formen. Die meisten Schichten sind dünne Lasuren (mit Wasser oder Medium verdünnte Farbe), die weiche Übergänge erlauben. Das Ergebnis hat meist eine glatte Oberfläche ohne sichtbaren Pinselstrich; zum Schluss kommt eine Firnisschicht. [1]",
      "Die ausführliche Anleitung derselben Autorin gliedert sich in Material (Farben, Medien, Pinsel, Malgrund, Referenzfoto), Übertragung des Fotos (Projektor, Gitter, Transferpapier) und Malen (Untermalung, Farbmischen, Lasuren, Firnis, Glas malen). Ich habe nur Inhaltsverzeichnis und Einleitung gelesen. [2]",
      "Ein Lexikon unterscheidet Hyperrealismus und Fotorealismus: Der Hyperrealismus ist eine Weiterentwicklung des Realismus mit einer „überschärften Realität“ und nutzt die Ausdrucksmittel des Fotorealismus; die Grenzen seien fließend. [3]",
    ],
    evidence: { level: "anleitung", why: "Handwerkliche Kunstfertigkeit ohne Studienlage; der Ablauf stammt aus der Anleitung einer Fotorealismus-Malerin, die Begriffe aus einem Lexikon." },
    steps: [
      "Ein Referenzfoto wählen; gutes Foto ist Teil der Vorbereitung. [2]",
      "Kleine Studien in Farbstift oder Aquarell anlegen, um Komposition, Perspektive, Form, Licht und Schatten zu klären. [1]",
      "Das Foto mechanisch auf den Malgrund übertragen: Projektor, Gitterverfahren (Gitter über Foto und Malgrund) oder Transferpapier. [1][2]",
      "Mit der Untermalung beginnen. [1][2]",
      "In vielen Schichten aufbauen; die meisten sind dünne Lasuren aus verdünnter Farbe. [1]",
      "Farben sorgfältig mischen und beobachten; Pinsel und Wassergehalt dem gewünschten Effekt anpassen. [1]",
      "Zum Schluss mit Firnis versiegeln. [1]",
    ],
    plan: [
      { title: "Woche 1–2", text: "Mit einem Foto eines einfachen Gegenstands (z. B. eine Frucht) Gitterverfahren zeichnen und als Bleistiftzeichnung übertragen. (Vorschlag)" },
      { title: "Woche 3–6", text: "Dieselbe Vorlage in Grautönen untermalen, dann in dünnen Lasuren Farbe aufbauen. (Vorschlag)" },
      { title: "Danach", text: "Schwierigere Motive (Glas, Spiegelungen) schrittweise; mehrere Monate Übung sind realistisch, die Quelle nennt keine Zeiten. (Vorschlag)" },
    ],
    myths: [
      { myth: "Hyperrealismus ist nur Abpausen.", fact: "Die Quelle nennt die Übertragung als Teil des Verfahrens; danach entstehe das Bild durch genaue Beobachtung und Wissen über die Farbe in vielen Schichten. [1]" },
      { myth: "Hyperrealismus und Fotorealismus sind dasselbe.", fact: "Das Lexikon beschreibt Unterschiede in Zielsetzung und Wirkung, nennt die Grenzen aber fließend. [3]" },
    ],
    mistakes: [
      "Ohne Vorstudien direkt ins große Format gehen. [1]",
      "Die Schichten dick statt dünn auftragen; die Quelle beschreibt dünne Lasuren. [1]",
      "Foto ungenau übertragen. (Vorschlag)",
    ],
    safety: [
      "Firnis und Malmittel nach Herstellerangaben, mit Lüftung. (Vorsichtsregel, keine Quelle)",
      "Lange Malsitzungen unterbrechen, um Augen und Rücken zu entlasten. (Vorsichtsregel, keine Quelle)",
    ],
    conflicts: [
      "Begriffe: Das Lexikon trennt Hyperrealismus (verstörende, übersteigerte Wirklichkeit) von Fotorealismus (schöne Wiedergabe); die Malerin beschreibt nur Fotorealismus. Wer „Hyperrealismus“ sucht, findet teils beide Begriffe vermischt. [1][3]",
      "Die Quelle ist eine Künstlerin mit eigener Webseite; die Angaben sind Erfahrungswissen, keine Studien. [1]",
    ],
    videos: [
      { title: "Beginning Hyper Realistic Paintings and Drawings: Grid Method", id: "SOetMDIm2Bs", channel: "Bone & Brier", why: "Gitterverfahren für hyperrealistische Arbeiten laut Titel.", checked: true },
      { title: "Painting Lesson - How to Glaze With Acrylics | Drawing & Painting - The Virtual Instructor", id: "huescUFe3aI", channel: "The Virtual Instructor", why: "Lasieren mit Acryl laut Titel.", checked: true },
      { title: "Underpainting, Glazing, and Layering Techniques with Helen Van Wyk", id: "E6ZFPHJ2Jlc", channel: "HelenVanWyk", why: "Untermalung, Lasur und Schichtaufbau laut Titel.", checked: true },
    ],
    sources: [
      { title: "Art is Fun – Photorealist Painting Techniques and Methods (Thaneeya McArdle)", url: "https://art-is-fun.com/photorealist-painting-techniques-and-methods", kind: "Künstlerin / Lehrwebsite" },
      { title: "Art is Fun – How to Paint Photorealism: A Step-by-Step Guide (nur Inhaltsverzeichnis und Einleitung gelesen)", url: "https://www.art-is-fun.com/how-to-paint-photorealism", kind: "Künstlerin / Lehrwebsite" },
      { title: "Wikipedia – Hyperrealismus", url: "https://de.wikipedia.org/wiki/Hyperrealismus", kind: "Lexikon" },
    ],
  },

  "Ball auf dem Finger": {
    date: DATE,
    steckbrief: {
      about: "Einen Basketball auf einer Fingerspitze rotieren lassen. Es gibt keine Studienlage; die Anleitung beruht auf einer Nutzeranleitung und einem Ratgeber.",
      why: "Ein kleiner Balltrick mit sichtbarem Fortschritt, überall übbar.",
      tips: "Mit einem glatten, nicht rutschigen Ball beginnen und später zum Basketball wechseln. Den Ball mit der ersten Fingerspitze des Zeigefingers balancieren. [1][2]",
      safety: "Auf ebenem Boden üben, nicht in der Nähe von Lampen oder Fenstern. (Vorsichtsregel, keine Quelle)",
    },
    learn: [
      "Ein Ratgeber (Art of Manliness) nennt den Fingerspin ein klassisches Kunststück, das bis ins späte 19. Jahrhundert zurückreicht und zuerst in Zaubererhandbüchern und bei Jongleuren vorkam; bekannt ist er von den Harlem Globetrotters. Sein Tipp: mit einem glatten, nicht rutschigen Ball üben und erst dann zum Basketball wechseln, weil die Basketballoberfläche für Anfänger schwerer ist. [1]",
      "Die Nutzeranleitung (Brit + Co, von einem Basketballspieler) beschreibt einen eher wenig aufgepumpten Ball, den man noch dribbeln kann, das Balancieren auf dem Zeigefinger, mit der anderen Hand von oben gehalten, und den seitlichen Anschub zum Spin. [2]",
      "Studien zum Ballspinnen habe ich nicht gefunden. Beide Quellen sind kurz; die Angaben sind Erfahrungswissen. [1][2]",
    ],
    evidence: { level: "anleitung", why: "Praktische Trickfertigkeit ohne Studienlage; die Schritte stammen aus einer Nutzeranleitung (Brit + Co) und einem Ratgeber (Art of Manliness)." },
    steps: [
      "Einen Ball wählen: erst ein glatter, nicht rutschiger Ball, später der Basketball; die Nutzeranleitung nennt einen eher wenig aufgepumpten Ball, den man noch dribbeln kann. [1][2]",
      "Den Ball auf den Zeigefinger der guten Hand legen und oben mit der anderen Hand halten. [2]",
      "Mit dem ersten Fingerglied des Zeigefingers halten, das gibt die meiste Balance. [2]",
      "Wenn der Ball ausbalanciert ist, die andere Hand seitlich an den Ball legen. [2]",
      "Den Ball mit der seitlichen Hand ruckartig zu sich ziehen, damit er rotiert, während er auf dem Finger bleibt. [2]",
      "Zunächst ohne Anschub üben, nur Balance. (Vorschlag)",
      "Die Rotation vor dem Absetzen auf den Finger geben und den Ball sanft landen lassen. (Vorschlag)",
    ],
    plan: [
      { title: "Woche 1", text: "Täglich 5 Minuten: Ball auf dem Finger balancieren, mit der anderen Hand gehalten. (Vorschlag)" },
      { title: "Woche 2", text: "Täglich 5 Minuten: seitlicher Anschub, Ball bleibt auf dem Finger. (Vorschlag)" },
      { title: "Woche 3–4", text: "Ohne zweite Hand halten; später zum Basketball wechseln. [1] (Vorschlag)" },
    ],
    myths: [
      { myth: "Der Trick stammt von den Harlem Globetrotters.", fact: "Der Ratgeber schreibt, das Ballspinnen reiche bis ins späte 19. Jahrhundert zurück und sei zuerst nicht mit Sport verbunden gewesen. [1]" },
    ],
    mistakes: [
      "Mit einem rutschigen oder stark profilierten Ball beginnen. [1]",
      "Den Ball nicht mit der ersten Fingerspitze halten. [2]",
      "Ball zu stark aufgepumpt (laut Nutzeranleitung besser etwas weicher). [2]",
    ],
    safety: [
      "Fingernägel kurz halten, Ball trocken halten. (Vorschlag, keine Quelle)",
      "Nicht in der Nähe von Fenstern oder Lampen üben. (Vorsichtsregel, keine Quelle)",
    ],
    conflicts: [
      "Die Nutzeranleitung rät zu einem wenig aufgepumpten Ball, der Ratgeber zu einem glatten, nicht rutschigen Ball; ich habe keine Quelle gefunden, die beide Empfehlungen vergleicht. [1][2]",
    ],
    videos: [
      { title: "How to Spin a Basketball on your Finger | Master in 3 EASY Steps", id: "cctoNkvNMqc", channel: "ShotMechanics", why: "Drei-Schritte-Lektion laut Titel.", checked: true },
      { title: "Learn How to Spin a Basketball on your Finger - A lesson from the Harlem Globetrotters", id: "f-sq1CCbet4", channel: "Harlem Globetrotters", why: "Lektion von Profis laut Titel.", checked: true },
      { title: "How to Spin a Ball on your Finger - Ball Spinning Tutorial", id: "o7GXdqw4aKI", channel: "Niels Duinker", why: "Tutorial eines Jongleurs laut Titel.", checked: true },
    ],
    sources: [
      { title: "Art of Manliness – How to Spin a Basketball on Your Finger (Patrick Hutchison)", url: "https://www.artofmanliness.com/culture/games-tricks/how-to-spin-a-basketball-on-your-finger/", kind: "Ratgeber" },
      { title: "Brit + Co Guides – How to spin a basketball on your finger (Ben Thomas)", url: "https://guides.brit.co/guides/spin-a-basketball-on-your-finger", kind: "Nutzeranleitung" },
    ],
  },

  "Akka 3000": {
    date: DATE,
    steckbrief: {
      about: "Der Akka 3000 ist ein Fußball-Freestyle-Trick, eine Weiterentwicklung des Akka. Die Quellen beschreiben ihn und den Akka unterschiedlich; es gibt keine Studie zum Trick selbst, wohl aber zur Verletzungsvorbeugung im Fußball.",
      why: "Ein Trick, bei dem man Balleinsatz, Drehung und Annahme getrennt üben und dann verbinden kann.",
      tips: "Zuerst den normalen Akka und das Hochflicken üben, den 3000 dann in Einzelteilen, langsam und ohne Gegner. Den Ball nicht zu hoch flicken. [1][4]",
      safety: "Die Drehung auf einem Bein belastet Sprunggelenk und Knie; aufwärmen. Ein Aufwärmprogramm (FIFA 11+) senkte in Studien das Verletzungsrisiko. [5]",
    },
    learn: [
      "Ein Tutorial-Portal beschreibt die Version des Freestylers PWG („Izzy Akka“) in fünf Teilen: ein Pull-Back-Flick, sobald der Ball hochgeflickt ist, den Körper um 180 Grad drehen, den Ball mit dem Knie fangen, ihn vom Knie auf den Fuß rollen lassen und kurz bevor er den Fuß berührt um den Gegner herumspielen. [1]",
      "Der Unisport-Shop stellt den Akka 3000 als „Mutter aller Fußballtricks“ vor und verweist auf PWG, einen der besten Fußball-Freestyler der Welt, mit einem Video-Tutorial. Der Artikel enthält keinen Text mit Einzelschritten. [2]",
      "Die normale Akka-Variante beschreibt ein Trick-Blog in vier Schritten: dominanten Fuß hinter den Ball, mit der Außenseite berühren, als wolle man in diese Richtung gehen, den Ball dabei leicht anheben (Unterschied zum Elastico), den Fuß um den Ball führen und nach innen zurückschnappen. Der Blog rät, den Akka erst im Spiel zu nutzen, wenn man ihn genug geübt hat, und den Ball nicht zu hoch zu heben. [4]",
      "Eine Panna-Lehrseite verwendet die Bezeichnungen „Akka“, „3000“ und „V-Pull“ für einen anderen Ablauf: mit der Außenseite nach vorn schieben, dann den Ball mit Sohle oder Innenseite scharf zurück über den Körper ziehen (V-förmige Richtungsänderung), den Standfuß aufsetzen und explosiv antreten. Sie stuft den Trick als fortgeschritten ein. [3]",
      "Eine Meta-Analyse von sechs randomisierten Studien fand bei Freizeit- und Halbprofi-Fußball ein um 25 Prozent geringeres Gesamt-Verletzungsrisiko (Risikoverhältnis 0,75; 95 %-Konfidenzintervall 0,57–0,98) mit den FIFA-Programmen; beim FIFA 11+ lag die Verringerung bei 39 Prozent, beim FIFA 11 war kein Effekt nachweisbar. [5]",
    ],
    evidence: { level: "anleitung", why: "Fußball-Freestyle ohne Studienlage; die Schritte stammen aus Tutorial-Seiten der Freestyler-Szene, die Verletzungsvorbeugung aus einer Metaanalyse." },
    steps: [
      "Aufwärmen und Ball sowie freie Fläche bereithalten. (Vorschlag)",
      "Zuerst den Pull-Back-Flick üben: den Ball mit dem Fuß zurückziehen und hochflicken. [1]",
      "Parallel den normalen Akka lernen: dominanten Fuß hinter den Ball, mit der Außenseite berühren, als wolle man in diese Richtung gehen. [4]",
      "Den Fuß um den Ball herumführen und nach innen zurückschnappen; den Ball dabei nicht zu hoch heben. [4]",
      "Beim Akka 3000 (Version PWG): Sobald der Ball hochgeflickt ist, den Körper um 180 Grad drehen. [1]",
      "Den Ball mit dem Knie fangen. [1]",
      "Den Ball vom Knie auf den Fuß rollen lassen. [1]",
      "Kurz bevor der Ball den Fuß berührt, ihn um den Gegner herumspielen. [1]",
      "Alle Teile erst langsam und ohne Gegner üben, dann zusammensetzen. (Vorschlag)",
    ],
    plan: [
      { title: "Woche 1", text: "Dreimal 15 Minuten: Pull-Back-Flick und normaler Akka, Ball niedrig halten. [1][4] (Vorschlag)" },
      { title: "Woche 2", text: "Dreimal 15 Minuten: Hochflicken, Drehung und Kniefangen getrennt üben. [1] (Vorschlag)" },
      { title: "Woche 3–4", text: "Teile verbinden, erst ohne Gegner, später mit Partner. (Vorschlag)" },
    ],
    myths: [
      { myth: "Akka und Akka 3000 sind derselbe Trick.", fact: "Der Blog beschreibt den normalen Akka als Außenseitenberührung mit Zurückschnappen; die PWG-Version des 3000 enthält Drehung und Kniefangen. [1][4]" },
      { myth: "Der Trick ist im Spiel immer sinnvoll.", fact: "Der Blog rät, ihn im Spiel erst zu nutzen, wenn man ihn ausreichend geübt hat. [4]" },
    ],
    mistakes: [
      "Den Ball zu hoch flicken; er ist dann schwerer zu kontrollieren und leichter zu verteidigen. [4]",
      "Im Spiel einsetzen, bevor der Ablauf sitzt. [4]",
      "Alle Teile gleichzeitig üben statt einzeln. (Vorschlag)",
    ],
    safety: [
      "Die Drehung um 180 Grad auf einem Bein belastet Sprunggelenk und Knie; auf ebenem, trockenem Untergrund üben. (Vorsichtsregel, keine Quelle)",
      "Das Aufwärmprogramm FIFA 11+ verringerte in einer Meta-Analyse die Verletzungen im Freizeit- und Halbprofifußball um 39 Prozent (FIFA 11: kein Effekt). [5]",
    ],
    conflicts: [
      "Die Quellen beschreiben denselben Namen als unterschiedliche Tricks: PWG-Version mit Kniefangen [1], Blog-Akka mit Zurückschnappen [4], Panna-Seite als V-Pull mit Sohle [3]. Ich habe keine Quelle gefunden, die die Varianten vergleicht.",
      "Für den 3000 selbst habe ich nur eine Textanleitung gefunden; die Schritte stammen von der PWG-Variante und sind nicht die einzige Form. [1]",
    ],
    videos: [
      { title: "Learn The AKKA 3000 - the mother of all football skills", id: "zeHHCVgVCcY", channel: "Unisport", why: "Tutorial des Shops, der PWG nennt, laut Titel; Inhalt nicht angesehen.", checked: true },
      { title: "Akka 3000 - #Unisportlife tutorial | Learn this crazy skill with a few steps", id: "T1aGeMtia7I", channel: "Unisport", why: "Schritt-für-Schritt-Tutorial laut Titel.", checked: true },
      { title: "Learn this INCREDIBLE Football Skill! (The AKKA 3000)", id: "BEeHJyms_t8", channel: "Daniel Cutting", why: "Tutorial laut Titel.", checked: true },
    ],
    videoNote: "Die Videos nicht angesehen; Beschreibungen in Suchtreffern nennen unterschiedliche Varianten (Fangen mit Fuß, Wade oder Knie), daher vor dem Üben mehrere vergleichen.",
    sources: [
      { title: "Football Tutorials – akka 3000 (Izzy akka), Text-Tutorial der PWG-Version", url: "https://footballtutorials.jouwweb.nl/freestyle-1/akka-3000-izzy-akka", kind: "Tutorial-Seite" },
      { title: "Unisport – Learn the AKKA 3000 (mit PWG)", url: "https://www.unisportstore.com/stories/8002-learn-the-akka-3000/", kind: "Hersteller / Händler" },
      { title: "Panna Football – The Akka (V-Pull)", url: "https://www.pannafootballtube.com/skill-moves/the-akka", kind: "Lehrkanal" },
      { title: "Football Tricks Learn – Akka soccer trick (2012)", url: "https://footballtrickslearn.blogspot.com/2012/05/akka-soccer-trick.html", kind: "Blog" },
      { title: "Thorborg et al. 2017, Br J Sports Med – FIFA 11 and 11+ programmes: systematic review and meta-analysis", url: PM("28087568"), kind: "Metaanalyse" },
    ],
  },

  "Dunken & Werfen": {
    date: DATE,
    steckbrief: {
      about: "Basketball: Wurf, Korbleger und Dunk. Für den Wurf und den Korbleger liegt ein Leitfaden des Deutschen Basketball Bundes (für Kinder, Mini-Bereich) vor; zum Dunk habe ich keine Fachquelle gelesen.",
      why: "Wurf und Korbleger sind gut aufbaubar; der Dunk setzt sicheren Sprung und sichere Landung voraus.",
      tips: "Wurfkraft aus den Beinen holen, anfangs beidhändig, den Ball nach oben werfen. Beim Korbleger zuerst den Zweierrhythmus üben. [1]",
      safety: "Sprung und Landung belasten Sprunggelenk und Knie; Aufwärmprogramme verringerten in Studien die Verletzungen. [2] Der Dunk am Ring ist riskant; Hinweise dazu sind Vorsichtsregeln ohne Quelle.",
    },
    learn: [
      "Der Deutsche Basketball Bund (DBB) beschreibt in seinem Jugend-Minileitfaden das Werfen: Kinder brauchen Erfolgserlebnisse, daher höhenverstellbare Körbe (Minibasketball: 2,60 Meter), leichtere und kleinere Bälle und Hilfen wie Erhöhungen. Die Kinder sollen den Schwung aus den Beinen auf die Armstreckung übertragen; anfangs dürfen sie beidhändig werfen, erst mit genug Kraft sollte die einhändige Technik beginnen. [1]",
      "Zum Korbleger rät der DBB, nicht die klassischen methodischen Reihen zu nutzen, sondern spielerisch den Rhythmus des Zweierkontakts (zwei Schritte, Absprung, Wurf) zu lernen; erst danach Abschluss und Seite. [1]",
      "Zum Dunk habe ich keine Fachquelle gelesen. Die Anleitung hier folgt dem DBB für Wurf und Korbleger; der Dunk ist als Vorschlag gekennzeichnet. [1]",
      "Zur Verletzungsvorbeugung: Eine Meta-Analyse von zehn Studien fand bei Basketballspielenden weniger Verletzungen der unteren Extremität (Odds Ratio 0,69) und weniger Sprunggelenkverstauchungen (Odds Ratio 0,45) mit Vorbeugeprogrammen; für Kreuzbandrisse war kein Effekt nachweisbar. [2]",
      "Eine Übersichtsarbeit zu Sprunggelenkverletzungen im Sport fand, dass Verstauchungen die häufigste Art von Sprunggelenkverletzung sind und in Mannschafts- und Hallensportarten wie Basketball, Fußball, Volleyball und Handball häufig auftreten. [3]",
    ],
    evidence: { level: "anleitung", why: "Sportfertigkeit; die Schritte stammen aus dem Leitfaden eines Verbands (DBB, für Kinder). Zum Dunk liegt keine Quelle vor." },
    steps: [
      "Aufwärmen. Den Korb möglichst niedrig oder verstellbar nehmen; anfangs auch leichtere Bälle oder Erhöhungen nutzen (Empfehlung für Kinder, übertragbar als Vorschlag). [1]",
      "Wurfbild „Rakete“: in die Knie gehen (erste Zündstufe: die Beine), dann den Ball von der Brust hochstoßen (zweite Zündstufe: die Arme). [1]",
      "Den Ball nach oben werfen, sodass er von oben ins Ziel trifft; Arm und Beine strecken; anfangs beidhändig. [1]",
      "Übungen: Ball maximal hoch werfen oder an einem hohen Punkt an der Wand treffen; zu zweit ein umgedrehtes Hütchen von oben treffen. [1]",
      "Erst später auf den einhändigen Wurf wechseln. [1]",
      "Korbleger: Rhythmus des Zweierkontakts üben: Ball aufnehmen, zwei Schritte, abspringen, werfen, dabei den Korb ansehen. [1]",
      "Später ein Dribbling vor dem Zweierkontakt ergänzen. [1]",
      "Dunk (Vorschlag): erst, wenn Sprung und Landung sicher sind, an einem verstellbaren Ring oder mit Aufsicht, und nur mit voll aufgewärmten Gelenken. (Vorschlag, keine Quelle)",
    ],
    plan: [
      { title: "Woche 1–2", text: "Dreimal 30 Minuten: Wurfbild „Rakete“ aus der Nähe, viele Würfe, wenig Zeitdruck. [1] (Vorschlag)" },
      { title: "Woche 3–4", text: "Dreimal 30 Minuten: Zweierkontakt-Korbleger auf beiden Seiten, danach mit Dribbling. [1] (Vorschlag)" },
      { title: "Danach", text: "Sprungkraft und Landung getrennt, vorsichtig aufbauen; Dunk nur an verstellbarem Ring. (Vorsichtsregel, keine Quelle)" },
    ],
    myths: [
      { myth: "Man muss möglichst früh am hohen Korb werfen.", fact: "Der DBB empfiehlt für Kinder verstellbare Körbe und leichtere Bälle, um Erfolgserlebnisse und eine saubere Technik zu ermöglichen. [1]" },
      { myth: "Schnell werfen ist besser.", fact: "Der DBB rät, bei Wurfspielen die Zahl der Würfe in den Vordergrund zu stellen und Zeitdruck zurückzustellen, sonst werde ein schnelles Wegstoßen zur Gewohnheit. [1]" },
    ],
    mistakes: [
      "Den Ball in die Matte oder den Boden werfen statt den Korb ansehen. [1]",
      "Zu früh einhändig werfen, bevor Kraft und Schwung ausreichen. [1]",
      "Zeitdruck beim Werfen erzeugen. [1]",
      "Dunk versuchen, bevor Sprung und Landung sicher sind. (Vorsichtsregel)",
    ],
    safety: [
      "Vorbeugeprogramme für die untere Extremität verringerten in einer Meta-Analyse Verletzungen und Sprunggelenkverstauchungen im Basketball. [2]",
      "Verstauchungen sind die häufigste Art von Sprunggelenkverletzung, im Basketball häufig. [3]",
      "Beim Dunk am Ring nicht am Ring hängen bleiben, weich landen. (Vorsichtsregel, keine Quelle)",
    ],
    conflicts: [
      "Der DBB-Leitfaden richtet sich an Kinder; Aussagen zu Korbhöhe und Balleinsatz sind als Prinzip übertragen, ohne dass für Erwachsene eine Quelle vorliegt. [1]",
      "Zum Dunk fehlt eine gelesene Fachquelle; die Videosuche ergab Titel, die ich nicht beurteilen kann.",
    ],
    videos: [
      { title: "How To Dunk! Dunk Technique Tutorial", id: "7diXgTpQKu4", channel: "Shoot The Shot", why: "Technik-Tutorial laut Titel; Inhalt nicht angesehen.", checked: true },
      { title: "Korbleger lernen - Wie trainiere ich den Korbleger im Basketball?", id: "dEcZ9HRta5I", channel: "1x1SPORT", why: "Korbleger-Training auf Deutsch laut Titel.", checked: true },
      { title: "#02 Zwei-Kontakt-Korbleger | Home-Tutorials mit der Basketball Academy by kinder Joy of Moving", id: "3dy957m_u0U", channel: "ALBA BERLIN", why: "Zweikontakt-Korbleger des Berliner Vereins laut Titel.", checked: true },
    ],
    sources: [
      { title: "Deutscher Basketball Bund – Jugend-Minileitfaden (Abschnitt Werfen und Korbleger)", url: "https://basketball-bund.de/wp-content/uploads/sites/2/2022/07/DBB_Jugend_Minileitfaden.pdf", kind: "Verband" },
      { title: "Taylor et al. 2015, Sports Health – Prevention of Lower Extremity Injuries in Basketball: A Systematic Review and Meta-Analysis", url: PM("26502412"), kind: "Metaanalyse" },
      { title: "Fong et al. 2007, Sports Med – A systematic review on ankle injury and ankle sprain in sports", url: PM("17190537"), kind: "Übersichtsarbeit" },
    ],
  },

  "3 Hockey-Skills": {
    date: DATE,
    steckbrief: {
      about: "Der Skill nennt keine Fertigkeiten; ich schlage Ballführen, Schiebepass und Ballannahme (Stoppen) als die drei Grundskills vor, die der Leitfaden eines Hockeyverbands als Kern nennt. Die Anleitung stammt aus Verbandsmaterial; Studien betreffen nur Verletzungen.",
      why: "Griff, Haltung, Ballführen, Pass und Annahme sind die Grundlage; ohne sie klappt kein Spiel.",
      tips: "Linke Hand fest oben am Schläger, rechte locker in der Mitte; nur die flache Seite benutzen. Ball vor und leicht außerhalb des rechten Fußes führen, Blick oben. [1]",
      safety: "Kein Schwingen des Schlägers, der Haken bleibt am Boden. Schienbeinschoner und Mundschutz sind im offiziellen Spiel Standard. [1]",
    },
    learn: [
      "Die FUNdamental-Field-Hockey-Anleitung von USA Field Hockey (mit Videos des Weltverbands FIH) nennt als Grundbausteine Griff, Haltung, Ballführen, Ausweichen, Passen, Annehmen und Tackling. Als Passtechnik steht der Schiebepass im Mittelpunkt: eine kontrollierte Passform, bei der der Schläger auf dem Ball startet und kein Schlag ist. [1]",
      "Hockey Australia (Hookin2Hockey-Schulleitfaden) lehrt Schieben, Annehmen, Dribbeln und Ballabnehmen in Spielen. Beim Schiebepass bleibt der Schläger am Ball, ohne Ausholen; die Bewegung sei wie ein Unterhandwurf. [2]",
      "Zu Verletzungen: Eine systematische Übersicht zu Verletzungen im Freizeithockey nennt für Jugendliche und Erwachsene vor allem Verletzungen der unteren Extremität (Jugendliche: Knie im Spiel, 0,33 je 1000 Athleten-Expositionen; Erwachsene: Oberschenkelrückseite in der Vorbereitung, 0,75) sowie Kopf, Gesicht und Augen (Jugend 0,66, Erwachsene 0,94 je 1000). Zu Maßnahmen fand sie nur eine Studie mit einem Aufwärmprogramm bei Jugendlichen. [3]",
      "Die Auswahl der drei Skills ist ein Vorschlag; die Quellen nennen mehr Grundskills (z. B. Tackling). [1]",
    ],
    evidence: { level: "anleitung", why: "Sportfertigkeit; die Schritte stammen aus den Leitfäden zweier Hockeyverbände. Studien betreffen nur Verletzungen, nicht das Erlernen." },
    steps: [
      "Griff: Linke Hand fest oben am Schläger, die Knöchel zeigen in dieselbe Richtung wie der Haken; rechte Hand locker in der Mitte, die Fingernägel zeigen ebenfalls in Richtung Haken. Die linke Hand steuert, die rechte stützt. Es wird nur die flache Seite des Schlägers benutzt. [1]",
      "Haltung: Füße schulterbreit, Knie leicht gebeugt, Ellbogen vom Körper weg, Kopf oben, Rücken gerade. [1]",
      "Ballführen: Rechte Hand locker, linke Hand vom Körper weg, linker Ellbogen höher als der rechte; Knie gebeugt, Hüfte tief. Ball vor und leicht außerhalb des rechten Fußes (1-Uhr-Position), nicht bei den Füßen; erst langsam, dann schneller. [1]",
      "Schiebepass: seitlich zum Ziel; der Schläger startet auf dem Ball, kein Ausholen; mit der linken Fußspitze zum Ziel öffnen, Gewicht auf das vordere Bein, mit der flachen Seite schieben und mit dem linken Ellbogen nachführen. [1][2]",
      "Ballannahme (flacher Pass): Grundgriff, Schläger schräg, Hände etwa kniehoch, Haken am Boden; in die Ballinie stellen, Dreieck aus Füßen und Schlägerkopf bilden, Knie beugen, „weiche Hände“ beim Kontakt. [1]",
      "Zu zweit Schieben und Annehmen abwechseln; das Stoppen sollte den Ball mit dem Schläger nahezu abdecken. [1]",
      "Pro Einheit nur ein bis zwei technische Punkte wählen und fünf- bis sechsmal wiederholen. [1]",
    ],
    plan: [
      { title: "Einheit 1", text: "Griff, Pull-Übungen am Platz („Tick Tocks“), Haltung; Ballführen mit Blick nach oben; Schieben und Annehmen kurz anschauen. [1] (angelehnt an die Sitzung 1 des Leitfadens)" },
      { title: "Einheit 2", text: "Ziehen nach links und rechts, Drehungen, kleine Hebungen mit Hütchen. [1] (angelehnt an die Sitzung 2)" },
      { title: "Woche 3–4", text: "Schiebepass und Annehmen zu zweit, danach in Kleinspielen (3 gegen 3). [1][2] (Vorschlag)" },
    ],
    myths: [
      { myth: "Hockey lernt man über kräftige Schläge.", fact: "Die Leitfäden beginnen mit Griff, Haltung, Ballführen und dem Schiebepass; der Schiebepass ist ausdrücklich kein Schlag. [1][2]" },
      { myth: "Man darf beide Seiten des Schlägers benutzen.", fact: "Nur die flache Seite ist erlaubt. [1]" },
    ],
    mistakes: [
      "Den Ball zu nah an die Füße führen. [1]",
      "Beim Schiebepass ausholen statt den Schläger am Ball zu starten. [1][2]",
      "Mit dem Schläger schwingen oder beim Ballabnehmen gegen Schläger oder Spieler schlagen. [1][2]",
      "Zu langer oder zu kurzer Schläger: Er sollte etwa bis zur Hüfte reichen. [1]",
    ],
    safety: [
      "Sicherheitsregeln: nicht mit dem Schläger schwingen, der Haken („Candy Cane“) bleibt unten am Boden. [1]",
      "Schienbeinschoner und Mundschutz sind im offiziellen Spiel Standard; in Einführungseinheiten mit dem langsamen GO-Ball sind sie optional. [1]",
      "Im Freizeithockey sind Knie, Oberschenkelrückseite und Kopf/Gesicht/Augen betroffen. [3]",
    ],
    conflicts: [
      "Beide Leitfäden richten sich an Kinder und Schulen; für Erwachsene ist die Übertragung ein Vorschlag. [1][2]",
      "Bei der Schlägerlänge nennt die US-Anleitung „etwa bis zur Hüfte“; ich habe keine Quelle gefunden, die verschiedene Schulen vergleicht. [1]",
    ],
    videos: [
      { title: "How to Push Pass | Field Hockey Basic Skills", id: "IBK0DaI7zLQ", channel: "Relentless Field Hockey", why: "Schiebepass laut Titel; kein Verbandskanal.", checked: true },
      { title: "#Hockey101: How to dribble in Hockey [Hockey for Beginners]", id: "QH-swZZPNZY", channel: "SG Sports TV", why: "Dribbeln für Einsteiger laut Titel.", checked: true },
      { title: "Field Hockey for Beginners", id: "cMtgAMtTMdA", channel: "Lindsay Scholten", why: "Überblick Haltung, Dribbeln, Passen und Annehmen laut Suchtreffer; Inhalt nicht angesehen.", checked: true },
    ],
    videoNote: "Keines der Videos stammt von einem Verbandskanal; Inhalt nur nach Titel beurteilt.",
    sources: [
      { title: "USA Field Hockey – FUNdamental Field Hockey Guide (2025, mit FIH-Videos)", url: "https://assets.contentstack.io/v3/assets/blteb7d012fc7ebef7f/bltafe3f66631916d1f/68e97779ca13526a6881c18f/FUNFH_2025_Final.pdf", kind: "Verband" },
      { title: "Hockey Australia – Hookin2Hockey Schools Guide", url: "https://www.sportaus.gov.au/__data/assets/pdf_file/0004/699646/HINHockeySchoolsGuide.pdf", kind: "Verband" },
      { title: "Cornelissen et al. 2020, J Sports Sci – A systematic review of injuries in recreational field hockey: From injury problem to prevention", url: PM("32698730"), kind: "Übersichtsarbeit" },
    ],
  },

  "Koordination": {
    date: DATE,
    steckbrief: {
      about: "Koordination ist das Zusammenspiel von Nervensystem, Muskeln und Gehirn. Sie lässt sich mit Balance-, Rhythmus-, Reaktions- und Ballübungen trainieren; die Anleitung stammt aus Fachhandouts, nicht aus Studien zum Koordinationstraining.",
      why: "Koordination ist die Basis aller Bewegungen, auch für Hockey, Ballspiele und Alltag.",
      tips: "Mit einfachen Übungen wie dem Einbeinstand beginnen, dann die Schwierigkeit steigern (Augen schließen, instabile Unterlage, zusätzliche Bewegungen). [1]",
      safety: "Auf rutschfestem Boden üben, bei Balanceübungen eine Wand oder einen Stuhl in Reichweite haben. (Vorsichtsregel, keine Quelle)",
    },
    learn: [
      "Ein Handout von DSQV Baden-Württemberg (bawue.dsqv.de) nennt sieben koordinative Fähigkeiten: Orientierung, Differenzierung, Reaktion, Rhythmus, Kopplung, Gleichgewicht und Umstellung. Koordinative Fähigkeiten seien nicht angeboren, würden in der Kindheit gelernt und müssten danach gefestigt werden; im Alter nehme die Koordination oft ab. [1]",
      "Das E-Learning des Bayerischen Volleyball-Verbands definiert Koordination als Informationsaufnahme und -verarbeitung samt Steuerung effektiver und ökonomischer Bewegungshandlungen. Informationen kommen über optische, akustische, taktile, kinästhetische und vestibuläre Kanäle. Zwei Modelle stehen nebeneinander: das fähigkeitsorientierte (individuelle Fähigkeiten) und das anforderungsorientierte nach Neumaier (Druckbedingungen wie Präzisions-, Zeit-, Komplexitäts-, Situations- und Belastungsdruck). [2]",
      "Für Hockey-Schlägerkoordination nennt die FUNdamental-Field-Hockey-Anleitung das „Air Dribbling“ (Ball auf dem Schläger in die Luft heben und kontrollieren) als Übung für die Auge-Hand-Koordination und als Einstieg für Anfänger; als Tricks: den Ball möglichst oft auf dem Schläger springen lassen oder möglichst lange balancieren. [3]",
      "Der Nutzen für Verletzungsvorbeugung wird im Handout behauptet („Stürze und andere Verletzungen verhindern“), ohne Quellenangabe. [1] Meta-Analysen zur Verletzungsvorbeugung (z. B. FIFA 11+) betreffen mehrteilige Programme, nicht Koordination allein; ich habe sie hier nicht ausgewertet.",
    ],
    evidence: { level: "anleitung", why: "Trainingspraxis; die Übungen stammen aus Fachhandouts (DSQV Baden-Württemberg, Bayerischer Volleyball-Verband, Hockeyverband), nicht aus Studien zum Koordinationstraining." },
    steps: [
      "Einbeinstand: auf ein Bein stellen, das andere im 90-Grad-Winkel anheben, nach 20 Sekunden das Standbein wechseln. [1]",
      "Steigerung: eine Minute oder länger stehen, Augen schließen, das Bein seitlich oder nach hinten heben. [1]",
      "Gegenläufiges Armkreisen: hüftbreit stehen, rechter Arm kreist nach vorn, der linke gleichzeitig nach hinten; fünf bis sechs Umdrehungen, dann die Richtung wechseln. [1]",
      "Standwaage: Oberkörper nach vorn beugen, ein Bein nach hinten heben, Arme ausbreiten oder nach vorn strecken, einige Sekunden halten, Standbein wechseln. [1]",
      "Mit Tennisball: werfen und fangen; als instabile Unterlage dienen Kissen, Decken oder eine aufgerollte Matte. [1]",
      "Hockey: den Ball auf dem Schläger springen lassen oder balancieren („Air Dribbling“-Einstieg). [3]",
      "Schwierigkeit schrittweise steigern, z. B. durch Augen zu, instabile Unterlage oder zusätzliche Aufgaben. [1][2]",
    ],
    plan: [
      { title: "Woche 1–2", text: "Dreimal 10 Minuten: Einbeinstand, gegenläufiges Armkreisen, Standwaage. [1] (Vorschlag)" },
      { title: "Woche 3–4", text: "Dreimal 15 Minuten: Steigerungen (Augen zu, Kissen) und Ballübungen mit Tennisball. [1] (Vorschlag)" },
      { title: "Danach", text: "Sportnahe Übungen (z. B. Schläger und Ball), Koordinationsleiter oder Linien-Hüpfen. (Vorschlag)" },
    ],
    myths: [
      { myth: "Koordination ist angeboren.", fact: "Das Handout schreibt, koordinative Fähigkeiten seien nicht angeboren, sondern würden gelernt und müssten gefestigt werden. [1]" },
      { myth: "Koordination ist eine einzelne Fähigkeit.", fact: "Das Volleyball-Handout nennt mehrere Teilfähigkeiten, warnt aber, sie nicht isoliert zu betrachten; der Ansatz stoße auch an Grenzen. [2]" },
    ],
    mistakes: [
      "Schwierigkeit nicht steigern, sodass die Übung zu leicht bleibt. [1][2]",
      "Zu schwere Variante (Augen zu, instabil) ohne Absicherung beginnen. (Vorsichtsregel)",
    ],
    safety: [
      "Auf rutschfestem Boden üben, bei Balanceübungen eine Wand oder einen Stuhl in Reichweite haben. (Vorsichtsregel, keine Quelle)",
      "Vor dem Training aufwärmen. (Vorsichtsregel, keine Quelle)",
    ],
    conflicts: [
      "Zwei Modelle: Das fähigkeitsorientierte und das anforderungsorientierte Modell stehen nebeneinander; das Handout nennt Grenzen des fähigkeitsorientierten Ansatzes. [2]",
      "Der Nutzen für die Verletzungsvorbeugung ist im Handout eine Behauptung ohne Quelle. [1]",
    ],
    videos: [
      { title: "Verbessere deine koordinativen Fähigkeiten // Koordinationsübung für Anfänger und Fortgeschrittene", id: "GhjTdlTtRJ8", channel: "1x1SPORT", why: "Übungen für Anfänger und Fortgeschrittene laut Titel.", checked: true },
      { title: "15 Übungen Mit Der Koordinationsleiter | Fußball-Training Für Mehr Koordination & Speed", id: "HDLckxJGlBU", channel: "Eddie Lucenka", why: "Leiterübungen laut Titel; Fußballbezug.", checked: true },
      { title: "4 Übungen für dein Koordinationstraining als Fußballer - Liniensprünge", id: "torhVyV4wY8", channel: "Soccerkinetics", why: "Liniensprünge ohne Gerät laut Titel.", checked: true },
    ],
    sources: [
      { title: "DSQV Baden-Württemberg – Koordinationstraining: Übungen (Handout)", url: "https://bawue.dsqv.de/wp-content/uploads/sites/12/2022/11/Koordinationstraining_Uebungen.pdf", kind: "Fachseite / Handout" },
      { title: "Bayerischer Volleyball-Verband – Koordination (E-Learning)", url: "https://volleyball.bayern/fileadmin/user_upload/BVV/Downloads/Lehre/E-Learning/Koordination_E_Learning.pdf", kind: "Verband" },
      { title: "USA Field Hockey – FUNdamental Field Hockey Guide (Air Dribbling)", url: "https://assets.contentstack.io/v3/assets/blteb7d012fc7ebef7f/bltafe3f66631916d1f/68e97779ca13526a6881c18f/FUNFH_2025_Final.pdf", kind: "Verband" },
    ],
  },

  "Schloss knacken": {
    date: DATE,
    steckbrief: {
      about: "Lockpicking (Schlossöffnen ohne Schlüssel) als Hobby: das Prinzip des Stiftzylinders verstehen und an eigenen Übungsschlössern üben. Keine Rechtsberatung. Wortlaut über buzer.de gelesen; amtlicher Text nicht abgerufen.",
      why: "Ein mechanisches Rätsel mit Tastgefühl; es gibt Sportgruppen, die es als Hobby betreiben.",
      tips: "Nur an eigenen Schlössern üben, am besten an einem durchsichtigen Übungsschloss oder einem eigenen, nicht genutzten Zylinder. Der Verein der Sportsfreunde der Sperrtechnik schreibt: „Du darfst nur Schlösser öffnen die Dir gehören.“ [11]",
      safety: "Nie fremde Schlösser, Türen, Fahrräder oder Vorhängeschlösser Dritter. Für fremde Schlösser brauchst du laut Sportordnung die Erlaubnis des berechtigten Besitzers; die gelesenen Strafnormen betreffen jeweils Fremdes. Keine Rechtsberatung. [1][2][4][11]",
    },
    learn: [
      "Rechtlicher Rahmen (keine Rechtsberatung). Wortlaut über buzer.de gelesen; amtlicher Text nicht abgerufen (amtliche Adressen siehe Quellen 6–10): § 123 StGB (Hausfriedensbruch) betrifft das widerrechtliche Eindringen in Wohnung, Geschäftsräume oder befriedetes Besitztum „eines anderen“: Freiheitsstrafe bis zu einem Jahr oder Geldstrafe; verfolgt nur auf Antrag. § 242 StGB (Diebstahl) betrifft das Wegnehmen einer „fremden beweglichen Sache“ in Zueignungsabsicht: bis zu fünf Jahre oder Geldstrafe; der Versuch ist strafbar. § 303 StGB (Sachbeschädigung) betrifft das rechtswidrige Beschädigen oder Zerstören einer „fremden Sache“: bis zu zwei Jahre oder Geldstrafe. [1][2][4]",
      "§ 243 und § 244 StGB nennen als Merkmale für schwerere Fälle des Diebstahls unter anderem das Eindringen in Gebäude oder Wohnungen „mit einem falschen Schlüssel oder einem anderen nicht zur ordnungsmäßigen Öffnung bestimmten Werkzeug“. Beim Wohnungseinbruchdiebstahl einer dauerhaft genutzten Privatwohnung beträgt die Strafe ein bis zehn Jahre. Einordnung: Diese Normen setzen eine Tat gegen fremde Räume oder Sachen voraus; das ist der Grund für die Regel „nur eigene Schlösser“. [3][5]",
      "Ob Besitz und Mitführen von Pickwerkzeugen in Deutschland erlaubt sind, habe ich in keiner amtlichen Quelle gelesen. Ein englisches Lexikon schreibt allgemein, in vielen Ländern seien solche Werkzeuge legal zu besitzen, solange keine Absicht besteht, sie für Straftaten zu nutzen; in Japan seien sie für die meisten verboten. Für Deutschland ist das keine Aussage. Im Zweifel: rechtlichen Rat einholen. [16]",
      "Verein: Die Sportsfreunde der Sperrtechnik – Deutschland e. V. (Hamburg) betreiben das Schlossöffnen als Sport. Laut Satzung ist der Zweck die Pflege der Sperrtechnik als sportliche Herausforderung. Die Sportordnung verlangt, dass man nur eigene Schlösser öffnet; für andere brauche man die Erlaubnis des berechtigten Besitzers, und die gesetzlichen Bestimmungen des Ortes seien zu beachten. Die öffentlichen Treffen der Sportgruppen stehen allen offen, Gäste müssen auf Verlangen die Sportordnung gegenzeichnen, und der Verein schreibt: „Wir zeigen und schulen keine Bruchtechnik!“ [11][12][13]",
      "Prinzip (Hobby-Niveau): Ein Schloss gibt dem, der es testet, Rückmeldung über Teilcodes. Wegen Fertigungsungenauigkeiten binden die Stifte nicht gleichzeitig, sondern einer nach dem anderen; so lassen sich die Stifte einzeln in die richtige Position bringen. Beim Stiftzylinder dreht sich der Kern nur, wenn alle Stiftpaare mit ihrer Trennfuge in Höhe der Scherlinie liegen. [15]",
      "Werkzeuge: Mit einem „Pick“ (speziell geformtes Werkzeug) drückt man im Schlüsselkanal des Kerns die Stifte hinunter, so wie es sonst die Schlüsselzacken tun. Um den Kern zu drehen, benutzt man den „Spanner“. „Setzen“ heißt, die Stifte einzeln hinunterzudrücken, während der Kern gefühlvoll unter Spannung gehalten wird, sodass der gesetzte Stift hängen bleibt, bis alle gesetzt sind. [15]",
      "Realismus: Je nach Zeit, Werkzeug und Kenntnissen dauert das Öffnen laut Lexikon Sekunden bis Stunden, oder es gibt keinen bekannten erfolgreichen Angriff. Das Lexikon zitiert polizeiliche Schätzungen, nach denen nur rund 0,5 Prozent der Einbrüche durch Nachschließen erfolgen. [15]",
      "Ich beschreibe nur das Grundprinzip am Übungsschloss, keine Methoden für Sicherheitsschlösser oder fremde Schlösser.",
    ],
    evidence: { level: "anleitung", why: "Hobbyfertigkeit ohne Studienlage; Grundprinzip aus einem Lexikon, Regeln aus Vereinsdokumenten, Rechtsrahmen aus dem Gesetzeswortlaut. Wortlaut über buzer.de gelesen; amtlicher Text nicht abgerufen. Keine Rechtsberatung." },
    steps: [
      "Nur an eigenen Schlössern üben: am besten ein durchsichtiges Übungsschloss oder ein eigener, nicht genutzter Zylinder. Die Sportordnung nennt als Möglichkeit, einen neuen Zylinder zu kaufen und gegen den alten auszutauschen; der ausgebaute Zylinder kann dann als Übungsschloss dienen (Vorschlag). [11][15]",
      "Aufbau lernen: Gehäuse, Kern, Stiftpaare (Kernstift, Gehäusestift, Feder), Trennfuge und Scherlinie. Der Kern dreht sich nur, wenn alle Trennfugen in Höhe der Scherlinie liegen. [15]",
      "Prinzip verstehen: Wegen kleiner Fertigungsungenauigkeiten binden die Stifte nacheinander und geben Rückmeldung. [15]",
      "Mit dem Spanner den Kern leicht unter Drehspannung halten. [15]",
      "Mit dem Pick in den Schlüsselkanal gehen und die Stifte einzeln hinunterdrücken („setzen“); ein gesetzter Stift bleibt unter Spannung hängen. [15]",
      "Wird ein Stift zu tief gedrückt, gilt er als falsch gesetzt (die Lexikonabbildung zeigt „Stift zu tief gesetzt“); Spannung lösen und neu beginnen. (Vorschlag) [15]",
      "Wenn alle Stifte gesetzt sind, dreht sich der Kern. [15]",
      "Sehr leichte Spannung nutzen und auf das Gefühl achten. (Vorschlag)",
    ],
    plan: [
      { title: "Woche 1", text: "Aufbau am durchsichtigen Übungsschloss ansehen, den Weg der Stifte mit dem Pick beobachten. (Vorschlag)" },
      { title: "Woche 2", text: "Mit dem Spanner die Rückmeldung spüren, einzelne Stifte setzen. (Vorschlag)" },
      { title: "Woche 3–4", text: "Mehrere Stifte nacheinander setzen; Sportgruppe des Vereins besuchen (öffentliche Treffen). [12] (Vorschlag)" },
    ],
    myths: [
      { myth: "Lockpicking geht wie im Film in Sekunden.", fact: "Laut Lexikon dauert das Öffnen je nach Zeit, Werkzeug und Kenntnissen Sekunden bis Stunden, oder es gibt keinen bekannten erfolgreichen Angriff. [15]" },
      { myth: "Einbrecher öffnen Schlösser mit Picks.", fact: "Das Lexikon zitiert polizeiliche Schätzungen, nach denen nur rund 0,5 Prozent der Einbrüche durch Nachschließen erfolgen. [15]" },
      { myth: "Lockpicking ist grundsätzlich legal.", fact: "Ich habe keine amtliche Aussage zu Besitz und Mitführen in Deutschland gelesen; die Strafnormen betreffen Fremdes. Im Zweifel rechtlichen Rat einholen. [1][2][3][4][5][16]" },
    ],
    mistakes: [
      "An einem Schloss einer genutzten Tür zu üben: Man kann sich aussperren oder das Schloss blockieren. (Vorsichtsregel)",
      "Zu viel Spannung auf dem Spanner. (Vorschlag)",
      "Fremde Schlösser öffnen oder Dritten dabei zu helfen, ohne Erlaubnis des berechtigten Besitzers. [11]",
    ],
    safety: [
      "Nie fremde Schlösser, Türen, Fahrräder oder Vorhängeschlösser, auch nicht „zum Test“. [11]",
      "Spanner und Pick können abbrechen oder abrutschen; Finger und Augen schützen. (Vorsichtsregel, keine Quelle)",
    ],
    conflicts: [
      "Ein Bericht im Magazin des österreichischen Innenministeriums (2007) nennt als Grundsatz des Vereins, dass immer nur das eigene Schloss geöffnet wird, niemals ein anderes; die Sportordnung erlaubt fremde Schlösser nur mit Erlaubnis des berechtigten Besitzers. Das sind unterschiedlich strenge Formulierungen. [11][14]",
      "Rechtliche Würdigung: Der Gesetzeswortlaut wurde über buzer.de gelesen; amtlicher Text nicht abgerufen. Eine Einzelfallwürdigung leistet das Dossier nicht. [1][2][3][4][5]",
      "Zu Besitz und Mitführen von Picks in Deutschland liegt mir keine amtliche Quelle vor. [16]",
    ],
    videos: [
      { title: "How to Pick a Lock (for Beginners)", id: "OrynNYSvDnE", channel: "Rob Some Knowledge", why: "Einsteigervideo laut Titel; englisch; nur an eigenen Schlössern nachmachen.", checked: true },
      { title: "Learn SINGLE Pin Lock Picking", id: "N5aUcTn0wLU", channel: "SparrowsLockPicks", why: "Einzelstift-Technik laut Titel; englisch.", checked: true },
      { title: "Single pin picking a lock. Sunday beginners series (139)", id: "Rsi3-CdliGc", channel: "Dark Arts Lock Picking", why: "Einsteigerserie laut Titel; englisch.", checked: true },
    ],
    videoNote: "Alle drei sind englischsprachige Kanäle; Inhalt nur nach Titel beurteilt. Nur an eigenen Übungsschlössern nachmachen.",
    sources: [
      { title: "§ 123 StGB Hausfriedensbruch – Wortlaut über buzer.de gelesen", url: "https://www.buzer.de/123_StGB.htm", kind: "Gesetzestext (Fachportal)" },
      { title: "§ 242 StGB Diebstahl – Wortlaut über buzer.de gelesen", url: "https://www.buzer.de/242_StGB.htm", kind: "Gesetzestext (Fachportal)" },
      { title: "§ 243 StGB Besonders schwerer Fall des Diebstahls – Wortlaut über buzer.de gelesen", url: "https://www.buzer.de/243_StGB.htm", kind: "Gesetzestext (Fachportal)" },
      { title: "§ 303 StGB Sachbeschädigung – Wortlaut über buzer.de gelesen", url: "https://www.buzer.de/303_StGB.htm", kind: "Gesetzestext (Fachportal)" },
      { title: "§ 244 StGB Diebstahl mit Waffen; Bandendiebstahl; Wohnungseinbruchdiebstahl – Wortlaut über buzer.de gelesen", url: "https://www.buzer.de/244_StGB.htm", kind: "Gesetzestext (Fachportal)" },
      { title: "Amtlich (nicht abgerufen): § 123 StGB, gesetze-im-internet.de", url: "https://www.gesetze-im-internet.de/stgb/__123.html", kind: "Amtliche Quelle" },
      { title: "Amtlich (nicht abgerufen): § 242 StGB, gesetze-im-internet.de", url: "https://www.gesetze-im-internet.de/stgb/__242.html", kind: "Amtliche Quelle" },
      { title: "Amtlich (nicht abgerufen): § 243 StGB, gesetze-im-internet.de", url: "https://www.gesetze-im-internet.de/stgb/__243.html", kind: "Amtliche Quelle" },
      { title: "Amtlich (nicht abgerufen): § 303 StGB, gesetze-im-internet.de", url: "https://www.gesetze-im-internet.de/stgb/__303.html", kind: "Amtliche Quelle" },
      { title: "Amtlich (nicht abgerufen): § 244 StGB, gesetze-im-internet.de", url: "https://www.gesetze-im-internet.de/stgb/__244.html", kind: "Amtliche Quelle" },
      { title: "SSDeV – Sportordnung (Sportsfreunde der Sperrtechnik – Deutschland e. V.)", url: "https://blog.ssdev.org/?page_id=281", kind: "Verband" },
      { title: "SSDeV – Sportgruppen", url: "https://blog.ssdev.org/?page_id=288", kind: "Verband" },
      { title: "SSDeV – Satzung", url: "https://blog.ssdev.org/?page_id=262", kind: "Verband" },
      { title: "Öffentliche Sicherheit 1–2/07 (Bundesministerium für Inneres, Österreich) – Aufsperrtechnik", url: "https://www.bmi.gv.at/magazinfiles/2007/01_02/files/aufsperrtechnik.pdf", kind: "Behörde (Magazin)" },
      { title: "Wikipedia – Lockpicking", url: "https://de.wikipedia.org/wiki/Lockpicking", kind: "Lexikon" },
      { title: "Wikipedia – Lock picking (englisch)", url: "https://en.wikipedia.org/wiki/Lock_picking", kind: "Lexikon" },
    ],
  },
};
