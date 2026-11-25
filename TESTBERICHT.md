# Testbericht – Selbsttests der App

Stand: 25.11.2026 (nach dem Flaggen-Trainer). Alle Zahlen stammen aus einem vollständigen Lauf (`npm run test:e2e`, danach `npm run test:browser` in Hell und Dunkel, `npm test`, `npx tsc -b`, `PUBLIC_BUILD=1 npm run build`).

## Was getestet wird

| Ebene | Wo | Fälle |
|---|---|---:|
| Einheitentests (Logik, Daten, Migration, Abgleich, Flaggen-Trainer) | `tests/*.test.ts`, Vitest | 302 |
| Überlauf und Layout (375/390/430 px, hell/dunkel) und Fehler-Tests zu gemeldeten Fehlern | `tests/browser/overflow.mjs`, `bugs.mjs` | laufen als eine Suite, Ergebnis ja/nein |
| **Szenarien** (echte Abläufe per Touch und Eingabe) | `tests/browser/scenarios.mjs` | 253 |
| **Layout-Matrix** (alle Hauptseiten und alle Flaggen-Ansichten, siehe unten) | `tests/browser/matrix.mjs` | 1224 |
| **Affentest** (zufällig, festes Startwert) | `tests/browser/monkey.mjs` | 1800 (6 Läufe × 300 Aktionen, davon 403 Schritte im Flaggen-Trainer) |

Gesamt der Selbsttests: **3277 Fälle, 0 Fehler** im letzten Lauf.

### Motoren und Größen
- Chromium **und** WebKit (die Safari-Engine). WebKit läuft hier lokal, nachdem die Systembibliotheken nachinstalliert wurden. Ist WebKit nicht startbar, meldet der Lauf das offen und nutzt Chromium mit iPhone-Emulation.
- Größen 375×812, 390×844, 430×932, jeweils hoch und quer, hell und dunkel: 12 Kombinationen je Motor.

### Szenarien (je Motor)
Skill anlegen · Status ändern · Notiz und Link speichern · Session hinzufügen · Stück und Abschnitt anlegen · Abschnitt: Notiz und Link · Clip hinzufügen · Player öffnen, Tempo, Schleife, schließen · Clip umbenennen, löschen, Rückgängig · Metronom starten/stoppen · Aufnahme mit Fake-Mikrofon, umbenennen, löschen, Rückgängig · To-do anlegen („morgen“ im Text) und abhaken · To-do wischen (morgen, löschen, Rückgängig) · Suche und „Alle“-Ansicht · Aufräumen (Duplikat zusammenführen, löschen, bereinigen) · **Backup exportieren → alle Daten löschen → importieren → Datenstand identisch**.

### Flaggen-Trainer
- **Einheitentests** (`tests/flags.test.ts`, `tests/flagsdb.test.ts`, 39 neue Tests): 195 Staaten + 14 Gebiete, eindeutige Namen/Hauptstädte, genug Länder je Kontinent, zu jeder Flagge eine SVG-Datei samt Lizenz; Verwechslungsgruppen (alle genannten Paare); Falschantworten (immer drei verschiedene, nie die richtige, Hälfte aus der Gruppe, Doppelgänger wie Indonesien/Monaco nie zusammen, Antwortposition wechselt); Leitner-Stufen; Auswahl (alle, Kontinent, Schwierige, Neue, Ähnliche, Gebiete) und Umfang (10/25/50/Alle/Endlos); Durchgang (falsche Flaggen kommen 1–2 Mal später wieder, nie zweimal hintereinander, Endlos, Fortsetzen aus JSON, kaputter Zwischenstand); Lernstand in Dexie, Backup→Import, älteres Backup ohne Lernstand, Abgleich (jüngere Änderung gewinnt), **Migration** von Version 9 auf 10 ohne Datenverlust, Lernzeit-Sammler, Skill wird einmalig angelegt.
- **Szenarien** (beide Motoren): ganzes Quiz mit 10 Fragen (7 richtig, 3 falsch) bis zum Ergebnis, „Fehler wiederholen“ (100 %), abbrechen und fortsetzen (Fortschritt bleibt), Umfang/Bereich wählen, Endlos, Fortschrittsraster mit 195 Flaggen, Einstellungen, **Backup-Rundlauf mit Lernstand**.
- **Layout-Matrix**: Start, Frage (Flagge→Land und Land→Flagge), falsche Antwort, Start mit „Fortsetzen“, Ergebnis mit Fehlerliste, Fortschritt (mit Auswahl), Einstellungen – in allen 12 Größen-/Ausrichtungs-/Hell-Dunkel-Kombinationen beider Motoren. Geprüft werden u. a. Mindesthöhe der Antworten (52 px), Tippflächen ≥ 44 px, Flaggen geladen und 4:3, nichts ragt aus dem Blatt, Antworten überlappen nicht. Gegenprobe: Mit absichtlich zu niedrigen Antworten und verzerrten Flaggen meldete der Test vier Fehler.
- **Affentest**: öffnet den Trainer gezielt zwischendurch; 403 der 1800 Schritte liefen innerhalb des Flaggen-Trainers.
- **Größe:** Die App wuchs von 1,85 MB auf 3,28 MB (+1,43 MB, davon 1,39 MB Flaggen; JavaScript +17 KB, CSS +6 KB). Die Flaggen sind im Service-Worker-Cache (offline) und komprimiert etwa 0,42 MB schwer.

Nach jedem Schritt wird geprüft: Layout (nichts seitlich verschoben oder außerhalb, nichts überlappt, Tippflächen und Tab-Leiste erreichbar), keine Konsolenfehler, Datenintegrität (Verweise, Zahlen, Formate, keine verwaisten Dateien).

### Affentest
Tippt, wischt, scrollt, gibt Text ein (Umlaute, Emoji, 120 Zeichen, HTML, „DROP TABLE“), wechselt Tabs, geht zurück, dreht das Gerät, wechselt Hell/Dunkel und lädt neu. Startwerte 11, 22, 33, je 300 Aktionen, je Motor (Verteilung im letzten Lauf: 931 Tippen, 116 Text, 93 Tab, 82 Scrollen, 66 Drehen, 56 Zurück, 51 Wischen, 21 Hell/Dunkel; 212 Mal gab es kein sichtbares Ziel). Nach jedem Schritt dieselben Prüfungen wie oben, alle 10 Schritte die Datenintegrität. Jeder Fehler nennt Startwert, Schritt und die letzten Aktionen, damit er sich wiederholen lässt (`SEEDS=… ENGINES=… node tests/browser/monkey.mjs`).

**Der Test erkennt Fehler wirklich:** Als Gegenprobe wurde ein Layoutfehler absichtlich in den Build eingebaut (`.row-title { min-width: 900px }`). Der Affentest meldete ihn innerhalb von 17 Schritten.

## Veröffentlichung
`.github/workflows/deploy.yml` hat einen eigenen Job `e2e`. Er installiert Chromium und WebKit, führt `npm run test:browser` und `npm run test:e2e` aus (Affentest mit Startwerten 11, 22, 33 à 300 Aktionen). Der Job `deploy` wartet auf `build` **und** `e2e` – schlägt ein Test fehl, wird nicht veröffentlicht. Bei Fehlern lädt der Job den Ordner `test-results` (Screenshots, JSON, Zusammenfassung) als Artefakt „testergebnisse“ hoch.

## Gefunden und behoben
0. **Flaggen-Trainer im Querformat (iPhone):** Frage und Antworten lagen untereinander, „Weiter“ war nur durch Scrollen erreichbar; lange Namen brachen mitten im Wort. Behoben: Flagge links, Antworten rechts, Hinweis kompakt, Silbentrennung. Gefunden durch die Matrix in den Querformat-Kombinationen (zunächst auch durch einen Fehler im Testwerkzeug, das im Blatt nicht scrollte).
1. **Hinweis überdeckt den Mini-Timer.** Läuft ein Timer, schwebt der Mini-Timer über der Tab-Leiste; ein Hinweis („… geschafft“, Rückgängig) lag genau darauf. Gefunden vom Affentest. Behoben: Hinweise sitzen jetzt oberhalb des Mini-Timers (`html:has(.mini.is-shown) .toast`). Eigener Test: `bugs.mjs` Fall 3b (schlug vor dem Fix fehl, danach grün).

Am Testwerkzeug selbst (nicht an der App) wurden Fehlalarme beseitigt: Seiten in Übergangsanimationen werden erst nach deren Ende geprüft, schwebende Elemente (Mini-Timer, Hinweis) und gerade herausgewischte Zeilen gelten nicht als Überlappung, Vollbild-Sortierer und geöffnete Blätter zählen als Überlagerung.

## Offen und Einschränkungen (ehrlich)
- **WebKit speichert in dieser Umgebung keine Blobs in IndexedDB** („Error preparing Blob/File data“). Das ist eine Eigenschaft von Playwright-WebKit mit flüchtigem Speicher, kein bekannter Fehler von Safari. Folge: Clip hinzufügen, Player, Clip umbenennen/löschen und Aufnahmen werden nur in Chromium getestet; in WebKit sind diese Schritte als „übersprungen“ ausgewiesen.
- **Mikrofon:** Chromium nutzt ein Fake-Mikrofon. In WebKit gibt es keins; dort wird nur geprüft, dass eine lesbare Fehlermeldung erscheint. Die echte iPhone-Aufnahme (Audio-Sitzung `play-and-record`) ist ungetestet.
- **Wischen im Affentest** läuft mit der Maus (in WebKit gibt es keinen CDP-Touch). Die Szenarien und `bugs.mjs` testen Wischen in Chromium zusätzlich mit echten Touch-Ereignissen.
- **Einzelne Aktionen des Affentests scheitern technisch** (88 von 1800, z. B. Ziel verschwindet vor dem Tippen). Sie werden gezählt, aber nicht als App-Fehler gewertet; die Ursachen sind nicht einzeln ausgewertet.
- **Datenstand-Vergleich** nach dem Import vergleicht Metadaten (ohne Änderungszeiten). Clip-, Aufnahme- und Bilddateien gehören bewusst nicht ins Backup und werden getrennt exportiert.
- Die Tests prüfen Layout und Verhalten, aber nicht, ob etwas **gut aussieht**; dafür gibt es Screenshots (`SHOTS=<Ordner>`).

## Nur auf einem echten iPhone prüfbar
- Finger-Trägheit, Wischgefühl, Gummiband-Scrollen, Tastaturverhalten beim Tippen in Eingabefelder.
- Mikrofon-Zugriff, Aufnahme, Audio-Sitzung, Lautstärke und Stummschalter beim Metronom.
- Safari-Eigenarten: Statusleiste und Notch, `100dvh` bei ein- und ausfahrender Leiste, Drehen im Vollbild-Player, Standbild-Erzeugung und Wiedergabe von iPhone-Videos (HEVC/MOV), Tonhöhe bei langsamem Tempo, Bildauswahl aus der Mediathek, Teilen-Menü für Backups, Installation als Web-App.
- Echter Speicher (Kontingent, Löschen durch iOS nach Inaktivität).
