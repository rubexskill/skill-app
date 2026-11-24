import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, STATUSES, STATUS_LABEL, TYPES, TYP_LABEL, type Skill, type Status, type Typ } from "../db";
import { normalize } from "../logic";
import { EmptyState, Group, NavButton, NavPage, Row, SearchField, Sheet, useNow } from "../components/ui";
import { Icon } from "../components/Icon";
import { useStack } from "../components/Stack";
import { CategoryIcon, catVars, shortCategory } from "../categories";
import { ALL, useNav } from "../nav";
import { SkillRow, StatusIcon, useTotals } from "./parts";
import { NewSkillSheet } from "./SkillSheets";
import { TidyStrip } from "./Tidy";

export function SkillList({ category, isRoot }: { category: string; isRoot?: boolean }) {
  const nav = useNav();
  const { pop } = useStack();
  const all = category === ALL;
  const skills = useLiveQuery(
    () => (all ? db.skills.orderBy("createdAt").toArray() : db.skills.where("kategorie").equals(category).sortBy("createdAt")),
    [category],
  );
  const totals = useTotals();
  const [query, setQuery] = useState("");
  const [statusF, setStatusF] = useState<Set<Status>>(new Set());
  const [typF, setTypF] = useState<Set<Typ>>(new Set());
  const [filterOpen, setFilterOpen] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [onlyUnsorted, setOnlyUnsorted] = useState(false);
  const now = useNow(!!skills?.some((s) => s.timerStart));

  const filtered = useMemo(() => {
    const q = normalize(query);
    return (skills ?? []).filter(
      (s) =>
        (!statusF.size || statusF.has(s.status)) &&
        (!typF.size || typF.has(s.typ)) &&
        (!onlyUnsorted || !!s.unsorted) &&
        (!q || normalize(`${s.title} ${s.name} ${s.kategorie} ${s.notes}`).includes(q)),
    );
  }, [skills, query, statusF, typF, onlyUnsorted]);

  // In einer Kategorie nach Status gruppieren, bei „Alle“ nach Kategorie.
  const sections = useMemo(() => {
    const map = new Map<string, Skill[]>();
    if (all) {
      for (const s of filtered) map.set(s.kategorie, [...(map.get(s.kategorie) ?? []), s]);
      return [...map.entries()];
    }
    for (const st of STATUSES) {
      const items = filtered.filter((s) => s.status === st);
      if (items.length) map.set(st, items);
    }
    return [...map.entries()];
  }, [filtered, all]);

  const toggleIn = <T,>(set: Set<T>, v: T) => {
    const n = new Set(set);
    if (n.has(v)) n.delete(v);
    else n.add(v);
    return n;
  };
  const filterActive = statusF.size > 0 || typF.size > 0;
  const title = all ? "Alle Einträge" : shortCategory(category);

  return (
    <NavPage
      title={title}
      eyebrow={!all ? <span className="eyebrow-cat cv" style={catVars(category)}><CategoryIcon name={category} size={16} />{skills ? `${skills.length} Einträge` : ""}</span> : undefined}
      sub={!all && title !== category ? category : undefined}
      back={isRoot ? undefined : { label: nav.backLabel, onClick: pop }}
      trailing={
        <>
          <NavButton icon={filterActive ? "filter-fill" : "filter"} label="Filter" onClick={() => setFilterOpen(true)} />
          <NavButton icon="plus" label="Neuer Eintrag" onClick={() => setNewOpen(true)} />
        </>
      }
      header={
        <div className="list-tools">
          <SearchField value={query} onChange={setQuery} />
          <div className="filter-chips" role="group" aria-label="Status">
            <button className={`mini-pill${!filterActive && !onlyUnsorted ? " is-on" : ""}`} aria-pressed={!filterActive && !onlyUnsorted}
              onClick={() => { setStatusF(new Set()); setTypF(new Set()); setOnlyUnsorted(false); }}>Alle</button>
            {STATUSES.map((st) => (
              <button key={st} className={`mini-pill${statusF.has(st) ? " is-on" : ""}`} aria-pressed={statusF.has(st)} onClick={() => setStatusF((p) => toggleIn(p, st))}>{STATUS_LABEL[st]}</button>
            ))}
          </div>
          <div style={{ height: 10 }} />
          <TidyStrip kinds={["skill", "gewohnheit", "projekt"]} ids={(skills ?? []).filter((s) => s.unsorted).map((s) => s.id)} only={onlyUnsorted} onToggle={setOnlyUnsorted} />
          {filterActive && (
            <div className="filter-summary">
              <span>Gefiltert: {[...STATUSES.filter((s) => statusF.has(s)).map((s) => STATUS_LABEL[s]), ...TYPES.filter((t) => typF.has(t)).map((t) => TYP_LABEL[t])].join(", ")}</span>
              <button onClick={() => { setStatusF(new Set()); setTypF(new Set()); }}>Zurücksetzen</button>
            </div>
          )}
        </div>
      }
    >
      {skills && filtered.length === 0 && (
        query.trim() || filterActive || onlyUnsorted
          ? <EmptyState icon="search" title="Keine Treffer" text={query.trim() ? `Nichts gefunden für „${query.trim()}“.` : "Kein Eintrag passt zu diesem Filter."} />
          : <EmptyState icon="stack" title="Noch leer" text="Tippe auf +, um hier etwas anzulegen." />
      )}

      {sections.map(([key, items]) => (
        <Group key={key}
          header={all
            ? <span className="section-head cv" style={catVars(key)}><CategoryIcon name={key} size={15} />{key}<span className="section-count">{items.length}</span></span>
            : <span className={`section-head status-${key}`}><Icon name={`st-${key === "lerne" ? "active" : key === "idee" ? "later" : key === "kann" ? "done" : "clarify"}`} size={15} />{STATUS_LABEL[key as Status]}<span className="section-count">{items.length}</span></span>}>
          {items.map((s) => <SkillRow key={s.id} skill={s} total={totals?.get(s.id) ?? 0} now={now} showCategory={all && !!query.trim()} />)}
        </Group>
      ))}

      <Sheet open={filterOpen} onClose={() => setFilterOpen(false)} title="Filter" cancelLabel="Zurücksetzen"
        onCancel={() => { setStatusF(new Set()); setTypF(new Set()); }}
        action={{ label: "Fertig", onClick: () => setFilterOpen(false) }}>
        <Group>
          <Row title="Alle" onClick={() => { setStatusF(new Set()); setTypF(new Set()); }}
            trailing={!filterActive ? <Icon name="check" size={18} className="row-check" /> : undefined} />
        </Group>
        <Group header="Status">
          {STATUSES.map((s) => (
            <Row key={s} title={STATUS_LABEL[s]} onClick={() => setStatusF((p) => toggleIn(p, s))} leading={<StatusIcon status={s} />}
              trailing={statusF.has(s) ? <Icon name="check" size={18} className="row-check" /> : undefined} />
          ))}
        </Group>
        <Group header="Typ" footer="Ohne Auswahl werden alle Einträge gezeigt.">
          {TYPES.map((t) => (
            <Row key={t} title={TYP_LABEL[t]} onClick={() => setTypF((p) => toggleIn(p, t))}
              trailing={typF.has(t) ? <Icon name="check" size={18} className="row-check" /> : undefined} />
          ))}
        </Group>
      </Sheet>

      <NewSkillSheet open={newOpen} onClose={() => setNewOpen(false)} initialCategory={all ? "" : category}
        onCreated={(s) => nav.push({ type: "skill", id: s.id })} onOpenExisting={(s) => nav.push({ type: "skill", id: s.id })} />
    </NavPage>
  );
}
