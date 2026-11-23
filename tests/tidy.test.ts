import { beforeEach, describe, expect, it } from "vitest";
import { db, uid } from "../src/db";
import { addTodo, createSkill } from "../src/logic";
import { BACKFILL_FROM, backfillUnsorted, skillNeedsTidy } from "../src/backfill";
import { applyChanges, buildChanges, buildPrompts, collectAll, collectUnsorted, parseTidyResponse, skillsWithHistory, tidyContext } from "../src/tidy";

beforeEach(async () => {
  for (const t of db.tables) await t.clear();
  await db.lists.bulkAdd([{ id: "list-allgemein", name: "Allgemein", order: 0 }, { id: "list-schule", name: "Schule", order: 1 }]);
});

describe("Aufräumen", () => {
  it("sammelt nur markierte Einträge und teilt in Pakete zu höchstens 30", async () => {
    await createSkill({ name: "Schon sauber", kategorie: "Körper & Sport", typ: "skill", status: "idee" });
    for (let i = 0; i < 31; i++) await createSkill({ name: `handstand lernen ${i}`, kategorie: "Körper & Sport", typ: "skill", status: "idee", unsorted: true });
    await addTodo("zahnarzt morgen", "list-allgemein", null, true);
    const items = await collectUnsorted();
    expect(items).toHaveLength(32);
    expect(new Set(items.map((i) => i.sid)).size).toBe(32);
    const prompts = buildPrompts(items, await tidyContext());
    expect(prompts.map((p) => p.count)).toEqual([30, 2]);
    expect(prompts[0].text).toContain("Paket 1 von 2");
    expect(prompts[0].text).toContain("rausfinden");
    expect(prompts[0].text).not.toContain("Schon sauber");
    expect(await collectUnsorted({ kinds: ["todo"] })).toHaveLength(1);
  });

  it("liest Antwort im Codeblock, zeigt Vorschau und übernimmt mit Original in den Notizen", async () => {
    const s = await createSkill({ name: "handstand lernen", kategorie: "Ohne Kategorie", typ: "skill", status: "rausfinden", unsorted: true });
    const t = await addTodo("zahnarzt anrufen morgen", "list-allgemein", null, true);
    await db.terms.add({ id: uid(), term: "hash", explanation: "", understood: false, understoodAt: null, links: [], createdAt: Date.now(), unsorted: true });
    await createSkill({ name: "x", kategorie: "Körper & Sport", typ: "skill", status: "idee" });
    const items = await collectUnsorted();
    const sid = items.find((i) => i.id === s.id)!.sid, tid = items.find((i) => i.id === t.id)!.sid, bid = items.find((i) => i.term)!.sid;
    const answer = `Klar!\n\`\`\`json\n{"eintraege":[
      {"id":"${sid}","art":"skill","titel":"Handstand lernen","kurztitel":"Handstand","kategorie":"Körper & Sport","status":"idee","stunden_bis_koennen":40,"minuten_pro_einheit":15,"bewegung":2,"ort":"zuhause","material":["Wand"],"jahreszeit":"","steckbrief":{"worum":"Freier Handstand.","warum":"Kraft.","tipps":"Täglich.","sicherheit":""},"meilensteine":["Wandhandstand","Freier Handstand"]},
      {"id":"${tid}","art":"todo","titel":"Zahnarzt anrufen","liste":"Schule","datum":"2026-11-24"},
      {"id":"${bid}","art":"begriff","begriff":"Hash","erklaerung":"Prüfsumme fester Länge."},
      {"id":"x-zzzzzz","art":"todo","titel":"?"},
    ]}\n\`\`\``;
    const { entries, errors } = parseTidyResponse(answer);
    expect(errors).toEqual([]);
    expect(entries).toHaveLength(4);
    const ctx = await tidyContext();
    ctx.categories.push("Körper & Sport");
    const { changes, unmatched } = buildChanges(items, entries, { ...ctx, categories: [...new Set(ctx.categories)] }, await db.lists.toArray());
    expect(unmatched).toHaveLength(1);
    expect(changes).toHaveLength(3);
    expect(changes[0].lines.join(" ")).toContain("Handstand lernen");
    const undo = await applyChanges(changes);
    const s2 = (await db.skills.get(s.id))!;
    expect(s2).toMatchObject({ name: "Handstand lernen", title: "Handstand", kategorie: "Körper & Sport", status: "idee", estMinutes: 2400, movement: 2, place: "zuhause", unsorted: false });
    expect(s2.notes).toContain("Ursprünglich: handstand lernen");
    expect(s2.milestones).toHaveLength(2);
    expect(s2.profile?.about).toBe("Freier Handstand.");
    const t2 = (await db.todos.get(t.id))!;
    expect(t2).toMatchObject({ text: "Zahnarzt anrufen", listId: "list-schule", due: "2026-11-24", unsorted: false });
    expect(t2.note).toContain("Ursprünglich: zahnarzt anrufen morgen");
    expect((await db.terms.toArray())[0]).toMatchObject({ term: "Hash", explanation: "Prüfsumme fester Länge.", unsorted: false });
    expect(await collectUnsorted()).toHaveLength(0);
    await undo();
    expect((await db.skills.get(s.id))!.unsorted).toBe(true);
    expect((await db.todos.get(t.id))!.text).toBe("zahnarzt anrufen morgen");
  });

  it("unbekannte Kategorie wird nicht übernommen, Klären lässt Schätzwerte weg", async () => {
    const s = await createSkill({ name: "irgendwas", kategorie: "Kreativ & Alltag", typ: "skill", status: "idee", unsorted: true });
    const items = await collectUnsorted();
    const ctx = await tidyContext();
    const { changes } = buildChanges(items, [{ id: items[0].sid, titel: "Irgendwas", kategorie: "Erfunden", status: "rausfinden", stunden_bis_koennen: 5 }], ctx, []);
    expect(changes[0].warnings[0]).toContain("Erfunden");
    expect(changes[0].patch.kategorie).toBe("Kreativ & Alltag");
    expect(changes[0].patch.estMinutes).toBeUndefined();
    expect(changes[0].unclear).toBe(true);
    expect(s.id).toBeTruthy();
  });

  it("liest auch rohes JSON und meldet Unbrauchbares", () => {
    expect(parseTidyResponse(`[{"id":"s-1","titel":"a"}]`).entries).toHaveLength(1);
    expect(parseTidyResponse("Entschuldigung, das kann ich nicht.").errors.length).toBeGreaterThan(0);
    expect(parseTidyResponse("```json\n{kaputt\n```").errors.length).toBeGreaterThan(0);
  });
});

describe("Aufräumen: Löschen und Duplikate", () => {
  it("Prompt erklärt Aktionen und nennt ähnliche vorhandene Einträge", async () => {
    await createSkill({ name: "Handstand halten", kategorie: "Körper & Sport", typ: "skill", status: "idee" });
    await createSkill({ name: "handstand halten lernen", kategorie: "Ohne Kategorie", typ: "skill", status: "idee", unsorted: true });
    const all = await collectAll();
    const items = await collectUnsorted({}, all);
    const p = buildPrompts(items, await tidyContext(), 30, all)[0].text;
    expect(p).toContain("loeschen");
    expect(p).toContain("duplikat_von");
    expect(p).toContain("aehnliche_eintraege");
    expect(p).toContain("Handstand halten");
  });

  it("liest beide Schreibweisen der Aktion", () => {
    const a = parseTidyResponse('[{"id":"s-1","aktion":"loeschen"},{"id":"s-2","aktion":"duplikat_von","duplikat_von":"s-9"},{"id":"s-3","aktion":{"duplikat_von":"s-9"}}]').entries;
    expect(a.map((e) => [e.aktion, e.duplikat_von])).toEqual([["loeschen", undefined], ["duplikat_von", "s-9"], ["duplikat_von", "s-9"]]);
  });

  it("löscht und führt Duplikate zusammen – nach Auswahl, mit Rückgängig", async () => {
    const orig = await createSkill({ name: "Handstand halten", kategorie: "Körper & Sport", typ: "skill", status: "idee" });
    const dup = await createSkill({ name: "handstand halten lernen", kategorie: "Ohne Kategorie", typ: "skill", status: "idee", unsorted: true });
    const junk = await createSkill({ name: "asdf", kategorie: "Ohne Kategorie", typ: "skill", status: "idee", unsorted: true });
    const t = await addTodo("Brot", "list-allgemein", null, true);
    const t2 = await addTodo("brot kaufen", "list-allgemein", null, true);
    const all = await collectAll();
    const items = await collectUnsorted({}, all);
    const sid = (id: string) => all.find((i) => i.id === id)!.sid;
    const entries = [
      { id: sid(dup.id), aktion: "duplikat_von", duplikat_von: sid(orig.id) },
      { id: sid(junk.id), aktion: "loeschen" },
      { id: sid(t2.id), aktion: "duplikat_von", duplikat_von: sid(t.id) },
      { id: sid(t.id), titel: "Brot kaufen", liste: "Allgemein" },
    ];
    const { changes } = buildChanges(items, entries, await tidyContext(), await db.lists.toArray(), all, await skillsWithHistory());
    expect(changes.map((c) => c.action).sort()).toEqual(["delete", "merge", "merge", "update"]);
    expect(changes.every((c) => c.preselect)).toBe(true);
    const undo = await applyChanges(changes);
    expect(await db.skills.get(dup.id)).toBeUndefined();
    expect(await db.skills.get(junk.id)).toBeUndefined();
    expect((await db.skills.get(orig.id))!.notes).toContain("Zusammengeführt: handstand halten lernen");
    expect(await db.todos.get(t2.id)).toBeUndefined();
    expect((await db.todos.get(t.id))!.note).toContain("Zusammengeführt: brot kaufen");
    await undo();
    expect(await db.skills.get(dup.id)).toBeTruthy();
    expect(await db.skills.get(junk.id)).toBeTruthy();
    expect(await db.todos.get(t2.id)).toBeTruthy();
    expect((await db.skills.get(orig.id))!.notes).toBe("");
    expect((await db.todos.get(t.id))!.text).toBe("Brot");
  });

  it("verwirft ungültige Duplikate und warnt bei Skills mit Verlauf", async () => {
    const a = await createSkill({ name: "A", kategorie: "k", typ: "skill", status: "idee", unsorted: true });
    const b = await createSkill({ name: "B", kategorie: "k", typ: "skill", status: "idee", unsorted: true });
    const t = await addTodo("Zahnarzt", "list-allgemein", null, true);
    await db.sessions.add({ id: "x1", skillId: b.id, start: Date.now(), minutes: 10 });
    const all = await collectAll();
    const items = await collectUnsorted({}, all);
    const sid = (id: string) => all.find((i) => i.id === id)!.sid;
    const ctx = await tidyContext();
    const lists = await db.lists.toArray();
    const hist = await skillsWithHistory();
    // Kette: A Duplikat von B, B wird gelöscht → A bleibt unverändert; B hat Verlauf → nicht vorausgewählt
    let r = buildChanges(items, [{ id: sid(a.id), aktion: "duplikat_von", duplikat_von: sid(b.id) }, { id: sid(b.id), aktion: "loeschen" }], ctx, lists, all, hist);
    const ca = r.changes.find((c) => c.item.id === a.id)!, cb = r.changes.find((c) => c.item.id === b.id)!;
    expect(ca.action).toBe("update");
    expect(ca.preselect).toBe(false);
    expect(cb.action).toBe("delete");
    expect(cb.preselect).toBe(false);
    expect(cb.warnings.join(" ")).toContain("Sessions");
    // Selbst-Duplikat, unbekanntes Original, andere Art
    r = buildChanges(items, [{ id: sid(a.id), aktion: "duplikat_von", duplikat_von: sid(a.id) }, { id: sid(t.id), aktion: "duplikat_von", duplikat_von: sid(a.id) }, { id: sid(b.id), aktion: "duplikat_von", duplikat_von: "s-zzzzz" }], ctx, lists, all, hist);
    expect(r.changes.every((c) => c.action === "update" && !c.preselect && c.warnings.length)).toBe(true);
    await applyChanges(r.changes.filter((c) => c.action === "update"));
    expect(await db.skills.get(a.id)).toBeTruthy();
  });
});

describe("Rückwirkende Markierung", () => {
  it("markiert Klären, neue Einträge ab 22.11. und lässt Bibliotheks-Skills in Ruhe", async () => {
    const day = 86400000;
    const mk = (name: string, status: "idee" | "rausfinden", createdAt: number) => ({ ...({} as object), name, status, createdAt }) as never;
    expect(skillNeedsTidy(mk("Box breathing – advantages and learn", "idee", BACKFILL_FROM + day))).toBe(false);
    expect(skillNeedsTidy(mk("Mein neuer Einfall", "idee", BACKFILL_FROM + day))).toBe(true);
    expect(skillNeedsTidy(mk("Mein alter Einfall", "idee", BACKFILL_FROM - day))).toBe(false);
    expect(skillNeedsTidy(mk("Alt aber unklar", "rausfinden", BACKFILL_FROM - day))).toBe(true);
    const old = BACKFILL_FROM - day, fresh = BACKFILL_FROM + day;
    await db.skills.bulkAdd([
      { id: "a", name: "Alt", title: "Alt", kategorie: "k", typ: "skill", status: "idee", createdAt: old },
      { id: "b", name: "Neu", title: "Neu", kategorie: "k", typ: "skill", status: "idee", createdAt: fresh },
    ] as never);
    await db.todos.bulkAdd([{ id: "t1", listId: "x", text: "alt", due: null, done: false, doneAt: null, createdAt: old }, { id: "t2", listId: "x", text: "neu", due: null, done: false, doneAt: null, createdAt: fresh }] as never);
    await backfillUnsorted({ skills: db.skills, todos: db.todos, terms: db.terms, wishes: db.wishes });
    expect((await db.skills.toArray()).map((s) => [s.id, !!s.unsorted])).toEqual([["a", false], ["b", true]]);
    expect((await db.todos.toArray()).map((s) => [s.id, !!s.unsorted])).toEqual([["t1", false], ["t2", true]]);
  });
});
