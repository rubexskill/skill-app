import { useEffect, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, uid } from "../db";
import { backupFileName, currentCounts, exportBackup, minutesLabel, readBackup, readBackupChecked, restoreBackup, shareFile } from "../logic";
import { describeBackup } from "../backupfile";
import { demoAllowed, isDemo, setRecordMode, startDemo, useRecordMode } from "../demo/mode";
import { endDemo, resetDemo } from "../demo/control";
import { loadBackupState, markBackup, reminderText, requestPersistence, setRemind, storageInfo, storageLabel, type StorageInfo } from "../safety";
import { TidyButton } from "./Tidy";
import { CheckCircle, Group, NavPage, Row, Segmented, Switch, SwipeRow, useUI } from "../components/ui";
import { Icon } from "../components/Icon";
import { useStack } from "../components/Stack";
import { useNav } from "../nav";
import { clipStorage, exportClipFiles, importClipFiles, sizeLabel } from "../units";
import { useTheme, type ThemeSetting } from "../theme";
import { MarkdownImportSheet } from "./MdImport";
import { SyncSheet } from "./Sync";
import { ShortcutSheet } from "./Shortcut";

const THEME_OPTS: { value: ThemeSetting; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Hell" },
  { value: "dark", label: "Dunkel" },
];

export function More() {
  const nav = useNav();
  const { toast, actionSheet, undoable } = useUI();
  const [bstate, setBstate] = useState(() => loadBackupState());
  const [sinfo, setSinfo] = useState<StorageInfo | null>(null);
  const rec = useRecordMode();
  const demo = isDemo();
  useEffect(() => { void storageInfo().then(setSinfo); }, []);
  const [theme, setTheme] = useTheme();
  const fileRef = useRef<HTMLInputElement>(null);
  const clipsRef = useRef<HTMLInputElement>(null);
  const clips = useLiveQuery(() => clipStorage(), []);
  const [mdOpen, setMdOpen] = useState(false);
  const [syncOpen, setSyncOpen] = useState(false);
  const [shortcutOpen, setShortcutOpen] = useState(false);
  const stats = useLiveQuery(async () => {
    const sessions = await db.sessions.toArray();
    return {
      skills: await db.skills.count(),
      apps: await db.apps.count(),
      todos: await db.todos.count(),
      sessions: sessions.length,
      minutes: sessions.reduce((a, s) => a + s.minutes, 0),
    };
  }, []);

  const doExport = async () => {
    try {
      const r = await shareFile(await exportBackup(), backupFileName(), "Skills-Backup");
      if (r !== "cancelled") { markBackup(); setBstate(loadBackupState()); }
      if (r === "downloaded") toast("Backup gespeichert");
    } catch {
      toast("Export fehlgeschlagen");
    }
  };

  const exportClips = async () => {
    const files = await exportClipFiles();
    if (!files.length) return toast("Keine Clips auf diesem Gerät.");
    try {
      if (navigator.canShare?.({ files })) {
        await navigator.share({ files, title: "Skills-Clips" });
        return;
      }
    } catch (err) {
      if ((err as Error)?.name === "AbortError") return;
    }
    for (const f of files) {
      const url = URL.createObjectURL(f);
      const a = document.createElement("a");
      a.href = url; a.download = f.name; document.body.appendChild(a); a.click(); a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 2000);
    }
    toast(`${files.length} Clip${files.length === 1 ? "" : "s"} heruntergeladen`);
  };

  const importClips = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
    const r = await importClipFiles(files);
    toast(r.matched ? `${r.matched} Clip${r.matched === 1 ? "" : "s"} wiederhergestellt${r.unmatched ? `, ${r.unmatched} nicht zuzuordnen` : ""}` : "Keine Datei passt zu einem Clip. Der Dateiname muss mit „skills-clip_“ beginnen.");
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      // Erst prüfen und zusammenfassen, dann fragen; ersetzt wird erst nach der Bestätigung, und das Ersetzen lässt sich rückgängig machen.
      const parsed = await readBackupChecked(file);
      const data = parsed.data;
      const message = describeBackup(data, await currentCounts(), parsed);
      actionSheet({
        title: "Backup laden?",
        message,
        choices: [{
          label: "Daten ersetzen", destructive: true,
          onSelect: () => undoable("Backup geladen", async () => {
            const before = await exportBackup(); // Sicherheitskopie im Speicher für „Rückgängig“
            try { await restoreBackup(data); } catch { toast("Import fehlgeschlagen, deine Daten sind unverändert"); return async () => undefined; }
            return async () => { await restoreBackup(await readBackup(new File([before], "vorher.json"))); };
          }),
        }],
      });
    } catch (err) {
      toast((err as Error).message || "Datei konnte nicht gelesen werden");
    }
  };

  const reminder = rec ? null : reminderText(bstate, Date.now(), (stats?.skills ?? 0) + (stats?.todos ?? 0) > 0);
  const slabel = sinfo ? storageLabel(sinfo) : null;

  return (
    <NavPage title="Mehr">
      {!nav.wide && (
        <Group>
          <Row title="Gewohnheiten" chevron onClick={() => nav.push({ type: "section", id: "gewohnheiten" })}
            leading={<span className="icon-tile tile-ink"><Icon name="repeat" size={17} /></span>} />
          <Row title="Projekte" chevron onClick={() => nav.push({ type: "section", id: "projekte" })}
            leading={<span className="icon-tile tile-ink"><Icon name="checklist" size={17} /></span>} />
          <Row title="Begriffe" chevron onClick={() => nav.push({ type: "section", id: "begriffe" })}
            leading={<span className="icon-tile tile-ink"><Icon name="term" size={17} /></span>} />
          <Row title="Wunschliste" chevron onClick={() => nav.push({ type: "section", id: "wunschliste" })}
            leading={<span className="icon-tile tile-ink"><Icon name="gift" size={17} /></span>} />
          <Row title="Statistik" chevron onClick={() => nav.push({ type: "section", id: "statistik" })}
            leading={<span className="icon-tile tile-ink"><Icon name="chart" size={17} /></span>} />
        </Group>
      )}

      <Group header="Importieren & Abgleichen">
        <TidyButton inGroup />
        <Row title="Markdown importieren" subtitle="Listen aus einer .md-Datei übernehmen" chevron onClick={() => setMdOpen(true)}
          leading={<span className="icon-tile tile-accent"><Icon name="import" size={17} /></span>} />
        <Row title="Abgleichen" subtitle="iPhone und iPad zusammenführen" chevron onClick={() => setSyncOpen(true)}
          leading={<span className="icon-tile tile-accent"><Icon name="sync" size={17} /></span>} />
        <Row title="Kurzbefehl" subtitle="Schnell erfassen vom Home-Bildschirm" chevron onClick={() => setShortcutOpen(true)}
          leading={<span className="icon-tile tile-accent"><Icon name="bolt" size={17} /></span>} />
      </Group>

      <Group header="Darstellung" footer="„System“ folgt der Einstellung von iPad oder iPhone.">
        <div className="row segmented-row">
          <Segmented options={THEME_OPTS} value={theme} onChange={setTheme} />
        </div>
      </Group>

      <Group header="Listen">
        <Row title="Apps zum Ausprobieren" detail={stats?.apps} chevron onClick={() => nav.push({ type: "apps" })}
          leading={<span className="icon-tile tile-ink"><Icon name="apps" size={17} /></span>} />
      </Group>

      <Group header="Backup" footer="Deine Daten liegen nur auf diesem Gerät. Exportiere regelmäßig ein Backup, z. B. in die Dateien-App. Ein Backup-Import ersetzt alle Daten – zum Zusammenführen nimm „Abgleichen“.">
        {reminder && <Row title={reminder} subtitle="Jetzt sichern" tone="accent" onClick={() => void doExport()} />}
        <Row title="Backup exportieren" onClick={() => void doExport()} chevron leading={<span className="icon-tile tile-gray"><Icon name="share" size={17} /></span>} />
        <Row title="Backup importieren" onClick={() => fileRef.current?.click()} chevron leading={<span className="icon-tile tile-gray"><Icon name="download" size={17} /></span>} />
        <Row title="Erinnerung nach 14 Tagen" trailing={<Switch checked={bstate.remind} onChange={(v) => { setRemind(v); setBstate(loadBackupState()); }} label="Backup-Erinnerung" />} />
      </Group>
      {!rec && <Group header="Speicher" footer={slabel?.text}>
        <Row title="Speicherschutz" detail={sinfo ? (sinfo.persisted ? "Geschützt" : sinfo.supported ? "Nicht geschützt" : "Nicht möglich") : "…"} />
        {sinfo?.usage != null && <Row title="Belegt" detail={sizeLabel(sinfo.usage)} />}
        {sinfo?.supported && !sinfo.persisted && <Row title="Schutz anfordern" tone="accent" onClick={() => void requestPersistence().then(async (ok) => { setSinfo(await storageInfo()); toast(ok ? "Der Speicher ist jetzt geschützt" : "Der Browser hat den Schutz nicht erteilt. Mach regelmäßig Backups."); })} />}
      </Group>}
      {demoAllowed && (
        <Group header="Demo" footer={demo ? "Die Demo läuft in einer eigenen Datenbank. Deine echten Daten sind unberührt und kommen mit „Demo beenden“ zurück." : "Beispieldaten für Aufnahmen. Sie liegen in einer getrennten Datenbank, deine echten Daten bleiben unberührt."}>
          {!demo && <Row title="Demo-Daten laden" subtitle="Die App startet mit Beispieldaten neu" chevron onClick={() => startDemo()} leading={<span className="icon-tile tile-gray"><Icon name="bolt" size={17} /></span>} />}
          {demo && <Row title="Aufnahme-Modus" subtitle="Blendet Hinweise aus" trailing={<Switch checked={rec} onChange={(v) => setRecordMode(v)} label="Aufnahme-Modus" />} />}
          {demo && <Row title="Demo zurücksetzen" subtitle="Anfangszustand, Daten wieder relativ zu heute" chevron onClick={() => void resetDemo()} />}
          {demo && <Row title="Demo beenden" tone="danger" onClick={() => actionSheet({ title: "Demo beenden?", message: "Die Demo-Daten werden gelöscht. Deine echten Daten bleiben unverändert.", choices: [{ label: "Demo beenden", destructive: true, onSelect: () => void endDemo() }] })} />}
        </Group>
      )}
      <Group header="Clips" footer={clips ? `${clips.count} ${clips.count === 1 ? "Clip" : "Clips"}, ${sizeLabel(clips.clipBytes)}. Clips sind nicht im Backup und werden nicht zwischen Geräten abgeglichen. Der Export legt die Videos als einzelne Dateien ab; der Import ordnet sie über den Dateinamen wieder zu.` : undefined}>
        <Row title="Clips exportieren" onClick={() => void exportClips()} chevron leading={<span className="icon-tile tile-gray"><Icon name="video" size={17} /></span>} />
        <Row title="Clips importieren" onClick={() => clipsRef.current?.click()} chevron leading={<span className="icon-tile tile-gray"><Icon name="download" size={17} /></span>} />
      </Group>
      <MarkdownImportSheet open={mdOpen} onClose={() => setMdOpen(false)} />
      <SyncSheet open={syncOpen} onClose={() => setSyncOpen(false)} />
      <ShortcutSheet open={shortcutOpen} onClose={() => setShortcutOpen(false)} />
      <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => void onFile(e)} />
      <input ref={clipsRef} type="file" accept="video/*" multiple hidden onChange={(e) => void importClips(e)} />

      <Group header="Überblick">
        <Row title="Einträge" detail={stats?.skills ?? "–"} />
        <Row title="To-dos" detail={stats?.todos ?? "–"} />
        <Row title="Sessions" detail={stats?.sessions ?? "–"} />
        <Row title="Lernzeit gesamt" detail={stats ? minutesLabel(stats.minutes) : "–"} />
      </Group>

      <div className="about">Skills · Version 4.0<br />Ohne Konto, ohne Server – alles bleibt bei dir.</div>
    </NavPage>
  );
}

export function Apps() {
  const { pop } = useStack();
  const nav = useNav();
  const { undoable } = useUI();
  const apps = useLiveQuery(() => db.apps.orderBy("order").toArray(), []);
  const [name, setName] = useState("");

  const add = async () => {
    const n = name.trim();
    if (!n) return;
    const [title, ...rest] = n.split(/\s+[–-]\s+/);
    const max = (apps ?? []).reduce((m, a) => Math.max(m, a.order), -1);
    await db.apps.add({ id: uid(), name: title, note: rest.join(" – "), done: false, order: max + 1 });
    setName("");
  };

  const tried = (apps ?? []).filter((a) => a.done).length;

  return (
    <NavPage title="Apps zum Ausprobieren" back={{ label: nav.backLabel, onClick: pop }}>
      <Group footer="Tipp: „Name – wofür“ eingeben, dann wird der Teil nach dem Strich zur Beschreibung.">
        <div className="row input-row compose">
          <input value={name} placeholder="Neue App" enterKeyHint="done" onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && void add()} />
          {name.trim() && <button className="inline-btn" onClick={() => void add()}>Hinzufügen</button>}
        </div>
      </Group>
      {apps && apps.length > 0 && (
        <Group header={`${tried} von ${apps.length} ausprobiert`}>
          {apps.map((a) => (
            <SwipeRow key={a.id} actions={[{ label: "Löschen", tone: "danger", onClick: () => undoable(`„${a.name}“ entfernt`, async () => { await db.apps.delete(a.id); return async () => void (await db.apps.put(a)); }) }]}>
              <Row title={a.name} subtitle={a.note || undefined} muted={a.done}
                leading={<CheckCircle checked={a.done} label={a.name} onToggle={() => void db.apps.update(a.id, { done: !a.done })} />} />
            </SwipeRow>
          ))}
        </Group>
      )}
    </NavPage>
  );
}
