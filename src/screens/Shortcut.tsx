import { Group, Row, Sheet, useUI } from "../components/ui";
import { Icon } from "../components/Icon";
import { copyText } from "../logic";

/** Adresse der App ohne Parameter, z. B. https://name.github.io/skill-app/ */
export const appBaseUrl = () => `${location.origin}${location.pathname.replace(/index\.html$/, "")}`;

export function ShortcutSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useUI();
  const base = appBaseUrl();

  const copy = async (text: string, what: string) => {
    toast((await copyText(text)) ? `${what} kopiert` : "Kopieren nicht möglich – bitte markieren und kopieren");
  };

  const step = (n: number, title: string, text: React.ReactNode) => (
    <div className="step">
      <span className="step-num">{n}</span>
      <div className="step-body">
        <div className="step-title">{title}</div>
        <div className="step-text">{text}</div>
      </div>
    </div>
  );

  return (
    <Sheet open={open} onClose={onClose} title="Kurzbefehl" cancelLabel="Fertig">
      <p className="sheet-lead">So legst du einen Knopf auf den Home-Bildschirm, der nach einem Text fragt und ihn in die App schickt.</p>
      <div className="steps">
        {step(1, "Nach Eingabe fragen", <>In der App <b>Kurzbefehle</b> oben rechts auf <b>+</b> tippen und die Aktion <b>Nach Eingabe fragen</b> hinzufügen (Eingabetyp: Text).</>)}
        {step(2, "Link bauen", <>Aktion <b>URL</b> hinzufügen. Als Adresse den Link unten einfügen und dahinter die Variable <b>Angeforderte Eingabe</b> antippen.</>)}
        {step(3, "Link öffnen", <>Aktion <b>URLs öffnen</b> hinzufügen. Sie öffnet den Link aus Schritt 2.</>)}
        {step(4, "Auf den Home-Bildschirm", <>Oben den Namen vergeben (z. B. „Idee“), dann auf das Teilen-Symbol tippen und <b>Zum Home-Bildschirm</b> wählen.</>)}
      </div>

      <Group header="Link für Schritt 2" footer="Alles, was nach = steht, landet in der App. Mehrere Zeilen werden zu mehreren Einträgen.">
        <Row title={<span className="mono">{base}?neu=</span>} subtitle="Landet in der Inbox" trailing={<Icon name="copy" size={18} className="row-check" />} onClick={() => void copy(`${base}?neu=`, "Link")} />
        <Row title={<span className="mono">{base}?todo=</span>} subtitle="Landet in den To-dos" trailing={<Icon name="copy" size={18} className="row-check" />} onClick={() => void copy(`${base}?todo=`, "Link")} />
      </Group>

      <Group header="Gut zu wissen">
        <Row title="Safari statt App" subtitle="Nach meinem Kenntnisstand öffnet iOS Links aus Kurzbefehlen in Safari, nicht in der installierten App. Safari hat einen eigenen Datenbestand: Der Eintrag liegt dann erst dort. Mit Mehr › Abgleichen bringst du beides zusammen." />
      </Group>
    </Sheet>
  );
}
