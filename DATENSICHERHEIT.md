# Datensicherheit: Was liegt wo, was geht wann verloren?

Alle Daten liegen nur auf dem Gerät (IndexedDB und localStorage der Web-App). Es gibt keinen Server.

| Daten | Ort | JSON-Backup | Eigener Export | Abgleich |
|---|---|:-:|---|:-:|
| Skills, Gewohnheiten, Projekte, Sessions, Notizen, Links, Meilensteine, Rekorde, Abschlusstests | IndexedDB | ja | – | ja |
| To-dos, Listen, Inbox, Begriffe, Wunschliste, Apps, Haken | IndexedDB | ja | – | ja |
| Karteikarten | IndexedDB | ja | – | ja |
| Stücke und Abschnitte (Texte, Tempo, Clip-**Metadaten**) | IndexedDB | ja | – | ja |
| Aufnahmen: Metadaten | IndexedDB | ja | – | ja |
| **Clip-Videos** | IndexedDB (`clipBlobs`) | **nein** | Mehr → Clips exportieren (`skills-clip_…`) | nein |
| **Aufnahmen: Audiodateien** | IndexedDB (`recBlobs`) | **nein** | zusammen mit den Clips (`skills-aufnahme_…`) | nein |
| **Titelbilder der Stücke** | IndexedDB (`covers`) | **nein** (nur das Merkmal) | zusammen mit den Clips (`skills-bild_…`) | nein |
| Würfelzeiten, Anleitungs-Stand | IndexedDB | ja | – | ja |
| Flaggen-Lernstand | IndexedDB | ja | – | ja |
| Einstellungen: Darstellung, Metronom-Stumm, Flaggen-Einstellungen und angefangener Durchgang, Morse-Stand, Inbox-Sortierstand, Filter, Backup-Erinnerung | localStorage | **nein** | – | nein |
| Sammler für Übungszeit (unter einer Minute, Flaggen/Würfel) | localStorage | nein | – | nein |

## Was geht in welchem Fall verloren?

- **Safari → Einstellungen → Website-Daten löschen / „Verlauf und Websitedaten löschen“:** alles, auch Clips, Aufnahmen und Bilder. Backup und Clip-Export vorher sichern.
- **App vom Home-Bildschirm löschen:** alles (die Daten gehören zur installierten Web-App).
- **Safari räumt bei Platzmangel auf oder die App wird lange nicht geöffnet:** Safari darf Daten von Websites löschen, die nicht dauerhaft geschützt sind. Die App fordert dauerhaften Speicher an (siehe Mehr → Speicher); ob iOS ihn gewährt, zeigt die Zeile „Speicherschutz“. Für als App installierte Seiten gilt die 7-Tage-Regel von Safari nicht.
- **Neuinstallation oder neues Gerät:** nur, was im Backup steht, kommt zurück. Clips, Aufnahmen und Bilder nur über ihren Export (Dateiname muss mit `skills-clip_`, `skills-aufnahme_` bzw. `skills-bild_` beginnen und zur Stück-ID passen).
- **„Backup importieren“ ersetzt alle Daten:** vorher gibt es eine Zusammenfassung (Datei gegen aktuellen Stand), danach „Rückgängig“ für einige Sekunden. Eine kaputte, zu große oder zu neue Datei ändert nichts; der Import ist atomar (alles oder nichts).
- **Einstellungen im localStorage** sind nicht im Backup; sie lassen sich schnell neu setzen (Darstellung, Flaggen-Umfang). Der angefangene Flaggen-Durchgang geht verloren.
- **Abgleich** führt zwei Geräte zusammen, übernimmt aber keine Dateien (Clips, Aufnahmen, Bilder) und keine Einstellungen.
