import { useEffect, useRef, useState } from "react";
import { applySync, describeCounts, exportSync, parseSync, syncFileName, type SyncReport } from "../sync";
import { shareFile } from "../logic";
import { Group, Row, Sheet, useUI } from "../components/ui";
import { Icon } from "../components/Icon";

export function SyncSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useUI();
  const fileRef = useRef<HTMLInputElement>(null);
  const [report, setReport] = useState<SyncReport | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setReport(null);
      setBusy(false);
    }
  }, [open]);

  const save = async () => {
    setBusy(true);
    try {
      const r = await shareFile(await exportSync(), syncFileName(), "Skills-Abgleich");
      if (r === "downloaded") toast("Sync-Datei gespeichert");
    } catch {
      toast("Sync-Datei konnte nicht erstellt werden");
    } finally {
      setBusy(false);
    }
  };

  const load = async (f: File | undefined) => {
    if (!f) return;
    setBusy(true);
    try {
      const parsed = parseSync(await f.text());
      setReport(await applySync(parsed));
    } catch (err) {
      toast((err as Error).message || "Abgleich fehlgeschlagen");
    } finally {
      setBusy(false);
    }
  };

  const added = report ? describeCounts(report.added) : [];
  const updated = report ? describeCounts(report.updated) : [];
  const removed = report ? describeCounts(report.removed) : [];
  const shown = report?.highlights.slice(0, 8) ?? [];
  const more = (report?.highlights.length ?? 0) - shown.length;

  return (
    <Sheet open={open} onClose={onClose} title={report ? "Abgleich" : "Abgleichen"} cancelLabel={report ? "Fertig" : "Schließen"}>
      <input ref={fileRef} type="file" hidden accept="application/json,.json" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; void load(f); }} />

      {report ? (
        <>
          <div className="sync-done">
            <div className={`sync-done-icon${report.total ? "" : " is-calm"}`}><Icon name={report.total ? "sync" : "check"} size={30} /></div>
            <div className="sync-done-title">{report.total ? "Abgeglichen" : "Gleicher Stand"}</div>
            <p className="sync-done-text">
              {report.total ? "Beide Stände sind jetzt zusammengeführt. Nichts wurde überschrieben, was neuer war." : "Auf diesem Gerät war schon alles drin, was in der Datei steht."}
            </p>
          </div>
          {added.length > 0 && (
            <Group header="Neu dazugekommen">
              {added.map((l) => <Row key={l} title={l} />)}
            </Group>
          )}
          {shown.length > 0 && (
            <Group header="Darunter">
              {shown.map((n, i) => <Row key={i} title={<span className="clamp-1">{n}</span>} />)}
              {more > 0 && <Row title={`… und ${more} weitere`} muted />}
            </Group>
          )}
          {updated.length > 0 && (
            <Group header="Aktualisiert (die Datei war neuer)">
              {updated.map((l) => <Row key={l} title={l} />)}
            </Group>
          )}
          {removed.length > 0 && (
            <Group header="Gelöscht (dort gelöscht)">
              {removed.map((l) => <Row key={l} title={l} />)}
            </Group>
          )}
        </>
      ) : (
        <>
          <Group footer="So gleichst du iPhone und iPad ab: Auf dem einen Gerät „Sync-Datei sichern“ und in iCloud Drive ablegen. Auf dem anderen „Sync-Datei laden“. Danach dort ebenfalls sichern und auf dem ersten laden.">
            <Row title="Sync-Datei sichern" subtitle="Über das Teilen-Menü, z. B. in iCloud Drive" onClick={busy ? undefined : () => void save()} chevron
              leading={<span className="icon-tile tile-ink"><Icon name="share" size={17} /></span>} />
            <Row title="Sync-Datei laden" subtitle="Führt zusammen statt zu überschreiben" onClick={busy ? undefined : () => fileRef.current?.click()} chevron
              leading={<span className="icon-tile tile-ink"><Icon name="import" size={17} /></span>} />
          </Group>
          <Group header="So wird zusammengeführt">
            <Row title="Der Neuere gewinnt" subtitle="Pro Eintrag zählt die letzte Änderung." />
            <Row title="Beides bleibt erhalten" subtitle="Sessions, To-dos und Häkchen von beiden Geräten." />
            <Row title="Gelöschtes bleibt gelöscht" subtitle="Außer es wurde danach neu angelegt." />
          </Group>
        </>
      )}
    </Sheet>
  );
}
