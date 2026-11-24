# CLAUDE.md – Skills (PWA)

Für jede neue Claude-Code-Sitzung (lokal oder in der Cloud über GitHub). Zuerst lesen.

## Projektziel
Kostenlose Web-App „Skills“: eine persönliche Skill-Sammlung (lernen, üben, tracken), installierbar als PWA auf iPhone/iPad.
Sie muss sich wie eine native iOS-App anfühlen. Die Oberfläche ist **deutsch**. Backup, Import und Abgleich sind eingebaut.
Vorhandene Nutzerdaten (IndexedDB) müssen jedes Update überleben: nur Dexie-Migrationen, nie Datenbank neu anlegen oder leeren.

## Technik
React 19, Vite 8, TypeScript 7, Dexie 4 (IndexedDB), vite-plugin-pwa. Tests: Vitest + fake-indexeddb. Browser-Tests: playwright-core (Edge, WebKit).
Veröffentlicht auf GitHub Pages: https://rubexskill.github.io/skill-app/ (Konto `rubexskill`, Repo `skill-app`, Quelle „GitHub Actions“).

## Aufbau (src/)
- `db.ts` Dexie-Schema und Migrationen · `logic.ts` Anlegen/Ändern/Löschen/Rückgängig · `sync.ts` Abgleich zweier Datenbestände · `mdparse.ts` Markdown-Import · `exam.ts` Abschlusstest · `srs.ts` Wiederholungsplan (SM-2-light)
- `seed.ts` Startdaten + `withDefaults` (ordnet Schätzwerte/Steckbriefe über Originalname bzw. Kurztitel zu)
- `library/` **öffentliche Skill-Bibliothek**: `Skills.md` (Originalname je Kategorie; die Überschrift bestimmt den Typ: „Gewohnheiten“ = Gewohnheit, „Projekte & Besorgungen“ = Projekt, sonst Skill), `meta.ts` (Originalname, Kurztitel, Schätzwerte), `profiles1-3.ts` (Steckbriefe, Schlüssel = Kurztitel), `types.ts`
- `library/dossiers.ts` **Wissens-Dossiers** (recherchiert, mit Quellen; Schlüssel = Kurztitel; Anzeige in `screens/Dossier.tsx` unter „Mehr erfahren“). Videos mit `checked: false`, solange Kanal/Inhalt nicht geöffnet wurden. Quellenhinweise `[n]` müssen zur Quellenliste passen (Test `tests/dossiers.test.ts`).
- `tidy.ts` + `screens/Tidy.tsx` **Aufräumen**: Skills/To-dos/Begriffe/Wünsche mit `unsorted: true` (aus der Inbox einsortiert) → Prompt (Pakete à 30) → JSON-Antwort einfügen → Vorschau → übernehmen; Original bleibt in Notizen. Antwort darf je Eintrag `aktion: loeschen` oder `duplikat_von` enthalten (Vorschau rot, Bestätigung, Rückgängig). `backfill.ts` markiert rückwirkend (Dexie-Version 5).
- `units.ts` + `unitsMigrate.ts` + `screens/Units.tsx` **Unterpunkte** („Stücke“): Unit → Parts (Abschnitte) → Clips. Clip-Videos nur lokal in `clipBlobs` (nie ins Repo, nie ins Backup/Abgleich; Metadaten ja), Export/Import über Mehr → Clips. Timer läuft über `skill.timerStart` + `skill.timerUnit`; Sessions tragen optional `unitId`. Dexie-Version 6 schiebt beim „Klavierstück“ alle Sessions in den ersten Unterpunkt. `Part.sequence` ist für eine spätere Notenfolge reserviert.
- `metronome.ts` (Takt-Planung über `AudioContext.currentTime`, BPM 30–240, Taktarten; Audio-Freischaltung über `trainer/audio.ts`), `components/Wheel.tsx` (Scrollrad), `recorder.ts` (Selbstaufnahme mit MediaRecorder; `startRecording()` muss direkt im Tipp-Handler ohne vorheriges `await` laufen, setzt iOS-Audio-Sitzung `play-and-record`, Metronom vorher stoppen, Fehler mit echtem Namen + Tipp anzeigen), `screens/Practice.tsx` (Metronom- und Aufnahmen-Zeilen auf Stück- und Abschnitt-Seite). Aufnahmen: Metadaten in `recordings` (Backup/Abgleich), Audiodateien nur lokal in `recBlobs`, Export/Import zusammen mit den Clips (`skills-aufnahme_<id>_…`). `Recording.sequence` ist für eine spätere Notenerkennung reserviert (noch nicht gebaut). Tempo/Taktart pro Abschnitt (`Part.bpm/meter`), Standard pro Stück (`Unit.bpm/meter`).
- `seed/data-empty.ts` leere Startdaten (öffentlicher Build); `seed/private/` **nur lokal, gitignored**: persönliche Startliste (Notizen, Apps, Test-Session)
- `screens/` Bildschirme · `components/` UI-Bausteine · `trainer/` Trainer (Morse mit Koch-Kurs, Kopfrechnen, Wochentag/Doomsday, Flaggen, Atem, Stoppuhr, Karteikarten; `audio.ts` iOS-Ton) · `styles.css` gesamtes Design
- `tests/` Vitest-Tests (Doomsday, Morse, Wiederholungsplan, Abgleich, Import, Statistik)

## Design-Regeln
- **Stil „Variante B“**: warmes Papier (hell `#f5f0e8`), dunkle Tinte, Kategorien mit eigener Farbe, Zahlen in SF Pro Rounded. Hell/Dunkel nach System, Umschalter unter „Mehr → Darstellung“.
- **Apple-Stil**: Tab-Leiste, Navigationsleisten, Auswahlblätter (Action Sheets), Wischgesten, Rückgängig-Hinweis statt Rückfrage, Sicherheitsabstände (Notch/Home-Balken), 44-pt-Tippflächen. iPhone und iPad (hoch/quer) müssen gut aussehen.
- **Nichts KI-Typisches**: keine Verläufe-Orgien, keine Glühen-/Neon-Effekte, keine Emoji-Deko, keine Floskeln („Entdecke…“, „Tauche ein…“), keine generischen Karten-Raster. Ruhige, sachliche deutsche Texte.
- Leere Zustände sind sinnvoll formuliert; keine Pflichtfragen beim Anlegen.

## Grundregel: schön und nie voller
Die App soll vor allem schön und stimmig aussehen und grundsätzlich nirgends voller werden. Was man nicht ständig braucht, steht als kleines Symbol oder als ruhige, eingeklappte Zeile (`Fold`) und öffnet sich erst auf Antippen. Es muss aber zum Inhalt passen: Hat eine Seite oder ein Skill ohnehin wenig Inhalt und würde sonst leer wirken, darf Nebensächliches sichtbar oder offen bleiben. Pro Seite nach dem Gesamteindruck entscheiden, nicht nach starrer Regel. Auf bestehenden Seiten nur vorsichtig anwenden, wo es offensichtlich besser aussieht, und nichts Wichtiges verstecken. Gilt für alles Neue.

## Datenschutz-Regeln (wichtig)
- Persönliche Daten kommen **nie** ins Repo oder in den öffentlichen Build: Sessions, Notizen, Status, To-dos, Inbox, Wunschliste, Begriffe, Karteikarten, Backups, Name/E-Mail der Person.
- `src/seed/private/` ist gitignored; seine Dateien tragen die Markierung `skills-private-seed-7f3a`. Nie aus dem Ordner kopieren oder die Markierung entfernen.
- In `src/library/` stehen nur allgemeine Skill-Daten (Namen, Kategorie, Typ, Schätzwerte, Steckbriefe).
- Öffentlicher Build immer mit `PUBLIC_BUILD=1` (leere Startdaten). `VITE_EXPOSE=1` (window.db/window.app für Tests) nur für Test-Builds, nie veröffentlichen.
- Der Workflow bricht ab, wenn private Dateien im Repo liegen, die Markierung oder `window.db` im Build steht oder `src/library` Sessions/To-dos/Inbox-Daten enthält.
- Keine personenbezogenen Angaben in Commits, Issues, Beschreibungen oder Anfragen an externe Dienste. Commit-Identität: `rubexskill <rubexskill@users.noreply.github.com>`.

## Testen
- `npm run test:browser` (Playwright, Chromium): baut einen Test-Build und prüft alle Hauptseiten und einen Skill mit langem Steckbrief bei 375/390/430 px auf seitliches Verschieben (auch Wischen in To-dos). Vor jedem Design-Push laufen lassen; `CHROMIUM=<Pfad>` setzt den Browser, `SHOTS=<Ordner>` speichert Bilder, `DARK=1` dunkel.
- `npm test` (Vitest, muss grün sein) · `npx tsc -b` (Typen) · `PUBLIC_BUILD=1 npm run build`
- Browser-Test: Test-Build mit `PUBLIC_BUILD=1 VITE_EXPOSE=1 npx vite build --outDir <tmp>/dist-test --emptyOutDir`, dann Playwright (Edge, WebKit) mit `context.route` auf eine Fake-Adresse; Wischgesten per CDP-Touch (nur Chromium). Formate prüfen: iPhone/iPad, hoch/quer, hell/dunkel.
- Ton lässt sich nur mit Fake-AudioContext prüfen; echte Hörprobe nur auf dem iPhone.
- Bei jeder Änderung an Daten: Migration, Backup→Import und Abgleich mitprüfen.

## Layout-Regeln
- Nie horizontal scrollen: `html/body/#root` und `.scroller` haben `overflow-x: hidden`; Flex-/Grid-Kinder `min-width: 0`; lange Texte `overflow-wrap: anywhere`. Karten nutzen `--r-card`, `--gap`, `--pad` (Ende von `styles.css`); Unterseiten-Abschnitte sind `Group.is-card` oder `Fold` (zu, bis man ihn öffnet).

## Veröffentlichen
Push auf `main` startet `.github/workflows/deploy.yml`: `npm ci` → `npm test` → Build (`PUBLIC_BUILD=1`) → Datenschutz-Prüfung → GitHub Pages. Erst veröffentlichen, wenn Tests und Typen grün sind. Nur auf ausdrücklichen Wunsch pushen.
Lauf prüfen: GitHub-API (`gh` ist lokal nicht installiert). Nach einem Update muss die installierte Web-App einmal geschlossen und neu geöffnet werden.

## Arbeitsweise
- Unbeaufsichtigt: keine Fragen, sinnvolle Entscheidungen treffen und am Ende auflisten.
- Nichts außerhalb des Projektordners löschen. Das Obsidian-Plugin ist aufgegeben, nicht anfassen.
- Quellen für Trainer-Inhalte stehen in der App unter „So funktioniert’s“; neue Inhalte mit seriösen Quellen belegen.
