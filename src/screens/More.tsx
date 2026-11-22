import { useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, uid } from "../db";
import { backupFileName, exportBackup, minutesLabel, readBackup, restoreBackup } from "../logic";
import { CheckCircle, Group, NavPage, Row, Segmented, SwipeRow, useUI } from "../components/ui";
import { Icon } from "../components/Icon";
import { useStack } from "../components/Stack";
import { useNav } from "../nav";
import { useTheme, type ThemeSetting } from "../theme";

const THEME_OPTS: { value: ThemeSetting; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Hell" },
  { value: "dark", label: "Dunkel" },
];

export function More() {
  const nav = useNav();
  const { toast, actionSheet } = useUI();
  const [theme, setTheme] = useTheme();
  const fileRef = useRef<HTMLInputElement>(null);
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
      const blob = await exportBackup();
      const name = backupFileName();
      const file = new File([blob], name, { type: "application/json" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "Skills-Backup" });
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 2000);
      toast("Backup gespeichert");
    } catch (err) {
      if ((err as Error)?.name !== "AbortError") toast("Export fehlgeschlagen");
    }
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const data = await readBackup(file);
      const when = new Date(data.exportedAt).toLocaleString("de-DE", { dateStyle: "medium", timeStyle: "short" });
      actionSheet({
        title: "Backup laden?",
        message: `Backup vom ${when} mit ${data.skills.length} Einträgen. Alle aktuellen Daten auf diesem Gerät werden ersetzt.`,
        choices: [{ label: "Daten ersetzen", destructive: true, onSelect: () => void restoreBackup(data).then(() => toast("Backup geladen")) }],
      });
    } catch (err) {
      toast((err as Error).message || "Datei konnte nicht gelesen werden");
    }
  };

  return (
    <NavPage title="Mehr">
      {!nav.wide && (
        <Group>
          <Row title="Gewohnheiten" chevron onClick={() => nav.push({ type: "section", id: "gewohnheiten" })}
            leading={<span className="icon-tile tile-ink"><Icon name="repeat" size={17} /></span>} />
          <Row title="Projekte" chevron onClick={() => nav.push({ type: "section", id: "projekte" })}
            leading={<span className="icon-tile tile-ink"><Icon name="checklist" size={17} /></span>} />
          <Row title="Statistik" chevron onClick={() => nav.push({ type: "section", id: "statistik" })}
            leading={<span className="icon-tile tile-ink"><Icon name="chart" size={17} /></span>} />
        </Group>
      )}

      <Group header="Darstellung" footer="„System“ folgt der Einstellung von iPad oder iPhone.">
        <div className="row segmented-row">
          <Segmented options={THEME_OPTS} value={theme} onChange={setTheme} />
        </div>
      </Group>

      <Group header="Listen">
        <Row title="Apps zum Ausprobieren" detail={stats?.apps} chevron onClick={() => nav.push({ type: "apps" })}
          leading={<span className="icon-tile tile-ink"><Icon name="apps" size={17} /></span>} />
      </Group>

      <Group header="Backup" footer="Deine Daten liegen nur auf diesem Gerät. Exportiere regelmäßig ein Backup, z. B. in die Dateien-App. Ein Import ersetzt alle Daten.">
        <Row title="Backup exportieren" onClick={() => void doExport()} chevron leading={<span className="icon-tile tile-gray"><Icon name="share" size={17} /></span>} />
        <Row title="Backup importieren" onClick={() => fileRef.current?.click()} chevron leading={<span className="icon-tile tile-gray"><Icon name="download" size={17} /></span>} />
      </Group>
      <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => void onFile(e)} />

      <Group header="Überblick">
        <Row title="Einträge" detail={stats?.skills ?? "–"} />
        <Row title="To-dos" detail={stats?.todos ?? "–"} />
        <Row title="Sessions" detail={stats?.sessions ?? "–"} />
        <Row title="Lernzeit gesamt" detail={stats ? minutesLabel(stats.minutes) : "–"} />
      </Group>

      <div className="about">Skills · Version 3.0<br />Ohne Konto, ohne Server – alles bleibt bei dir.</div>
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
