# Stand der App „Skills“

Ehrliche Übersicht, Stand 26.11.2026. **fertig** = benutzbar und getestet, **teilweise** = benutzbar mit Lücken, **fehlt** = nicht gebaut. Die Oberfläche ist deutsch, die App läuft ohne Konto und Server auf dem Gerät (PWA für iPhone und iPad).

## Skills
- **Skills anlegen, bearbeiten, löschen (mit Rückgängig):** fertig. Status (Idee, Aktiv, Klären, Geschafft), Kategorie, Typ, Notizen, Links und Videos, Material, geschätzte Zeit.
- **Timer und Sessions:** fertig. Timer läuft über die Startzeit, übersteht Hintergrund und Neustart; Sessions von Hand ergänzbar, Heatmap, Mini-Timer.
- **Meilensteine, Abschlusstest, Rekorde, Karteikarten (Wiederholungsplan):** fertig.
- **Steckbriefe:** fertig für die eingebaute Bibliothek (192 Einträge); eigene Skills bekommen Steckbriefe nur über „Aufräumen“.
- **Aufräumen (Inbox-Einträge mit KI-Antwort sortieren):** fertig, der Umweg über Kopieren und Einfügen eines Prompts ist gewollt (keine Verbindung zu einem Dienst).
- **Suche, Filter, Alle Einträge:** fertig. Lange Listen zeigen schrittweise „Weitere anzeigen“.
- Einschränkung: Kein automatischer Abgleich im Hintergrund, nur manuell (siehe Backup und Abgleich).

## Dossiers („Mehr erfahren“)
- **Wissens-Dossiers mit Quellen** für viele Skills: teilweise. Videos sind als „ungeprüft“ markiert, bis Kanal und Inhalt geöffnet wurden; nicht jeder Skill hat ein Dossier.

## To-dos
- **Listen, Fälligkeiten, Schnelleingabe („Zahnarzt morgen #liste“), Schule mit Fächern:** fertig.
- **Wischen (rechts: morgen, links: löschen, mit Rückgängig), Haken nur über den Kreis:** fertig.
- **Suche über alle Listen:** fertig. Bei sehr vielen Einträgen schrittweise Anzeige.
- Fehlt: Erinnerungen als Mitteilung (Web-Apps auf iOS können das nicht zuverlässig).

## Gewohnheiten
- **Heute-Haken, Serie in Tagen, beste Serie, Wochenpunkte:** fertig (Detailseite ohne Timer, seit dieser Version). Listen, „Heute“ und Statistik zählen Gewohnheiten in Tagen, nicht in Minuten.
- Alte Sessions von Gewohnheiten bleiben erhalten, werden aber nirgends mehr als Minuten gezeigt.
- Fehlt: Wochenziele („3× pro Woche“), Erinnerungen.

## Inbox
- **Schnell festhalten, später einsortieren (Skill, To-do, Gewohnheit, Projekt, Begriff, Wunsch):** fertig. Kurzbefehl für den Home-Bildschirm: teilweise (Einrichtung von Hand in der Kurzbefehle-App).

## Projekte, Begriffe, Wunschliste, Apps, Statistik
- **Projekte, Begriffe, Wunschliste, Apps zum Ausprobieren:** fertig, bewusst einfach.
- **Statistik (Woche, Monat, Serie, Kalender, am meisten geübt, Gewohnheiten der letzten 30 Tage):** fertig.

## Trainer
- **Morse (Koch-Kurs), Kopfrechnen, Wochentag/Doomsday, Atem, Stoppuhr, Karteikarten:** fertig; Ton nur auf dem iPhone prüfbar.
- **Flaggen:** fertig. 195 Staaten, 14 Gebiete, Leitner-Lernstand, Fortsetzen, Backup und Abgleich. Flaggen liegen lokal (offline).
- **Zauberwürfel:** fertig. 3D-Würfel mit Schichten ziehen, Ansicht drehen, Zeitnahme (Bestzeit, Ao5, Ao12), Anleitung (7 Schritte mit Zeig mir und Üben), **Löser** (Anfängermethode, jeder gültige Zustand, ca. 2 ms) mit Wiedergabeleiste. Ohne WebGL gibt es nur eine flache Netz-Ansicht.
- Einschränkung Würfel: Löser liefert Anfängerlösungen (ca. 95 Züge), keine kurzen; nur 3×3.

## Klavier: Stücke, Abschnitte, Clips, Metronom, Aufnahme
- **Stücke und Abschnitte** mit Notizen, Links, Status, Titelbild: fertig.
- **Clips im Vollbild (Tempo, Schleife, Ausschnitt):** fertig; Videos liegen nur lokal.
- **Metronom (30–240 BPM, Taktarten, Drehrad):** fertig; Ton nur auf dem iPhone prüfbar.
- **Selbstaufnahme:** teilweise. Funktioniert mit Mikrofonfreigabe; die Aufnahme wird gesichert, wenn die App in den Hintergrund geht. Audio liegt nur lokal.
- Fehlt: Notenfolge und Notenerkennung (Felder sind vorbereitet).

## Backup, Import, Abgleich, Datensicherheit
- **JSON-Backup und -Import:** fertig. Der Import prüft die Datei (kaputt, leer, zu groß, zu neu), zeigt eine Zusammenfassung, ist atomar und hat „Rückgängig“.
- **Abgleich zweier Geräte (jüngere Änderung gewinnt, Löschungen werden übernommen):** fertig, manuell.
- **Dauerhafter Speicher (Speicherschutz) und Backup-Erinnerung nach 14 Tagen:** fertig, unter „Mehr“.
- **Clips, Aufnahmen und Titelbilder:** nur über ihren eigenen Export, nicht im JSON-Backup und nicht im Abgleich (siehe `DATENSICHERHEIT.md`).
- Einschränkung: Wer Website-Daten löscht oder die App löscht, verliert alles, was nicht gesichert wurde.

## Plattform
- **PWA, Offline, Updates:** fertig. Alle Seiten und Trainer laufen im Flugmodus; eine neue Version meldet sich mit „Update bereit · Neu laden“ und wird nie mitten in einer Übung geladen.
- **Hell/Dunkel, iPhone und iPad, hoch und quer:** fertig; Kontrast AA, Namen für VoiceOver, „Bewegung reduzieren“ beachtet.
- **Große Schrift:** teilweise. Die Oberfläche ist in Pixeln gebaut; iOS-Textgrößen (Dynamic Type) skalieren sie nicht. Getestet wurde, dass bei 130 % und 160 % entsprechend schmaler Breite nichts abgeschnitten wird.
- **Tastatur:** Felder bleiben über der Tastatur sichtbar (nur auf dem echten iPhone endgültig prüfbar).
