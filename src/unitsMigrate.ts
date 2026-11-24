import type { Table } from "dexie";
import type { RecordEntry, Session, Skill, Unit } from "./db";

/** Erster Unterpunkt, den die Migration für das bestehende Klavierstück anlegt. */
export const FIRST_UNIT_TITLE = "Homecoming – Kanye West";
/** Kurztitel des Skills, bei dem Unterpunkte standardmäßig an sind. */
export const UNITS_DEFAULT_TITLE = "Klavierstück";

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 10);

/**
 * Migration (Version 6): Beim Skill „Klavierstück“ werden Unterpunkte eingeschaltet und alle bisherigen
 * Sessions, Rekorde und das „Nächste Mal“ dem ersten Unterpunkt zugeordnet. Nichts geht verloren:
 * Sessions behalten ihre skillId, die Summe des Skills bleibt gleich. Läuft nur einmal (nur wenn der Skill noch keine Unterpunkte hat).
 */
export async function moveToFirstUnit(t: { skills: Table<Skill>; sessions: Table<Session>; records: Table<RecordEntry>; units: Table<Unit> }) {
  const skills = (await t.skills.toArray()).filter((s) => s.title === UNITS_DEFAULT_TITLE && s.useUnits === undefined);
  for (const skill of skills) {
    const existing = await t.units.where("skillId").equals(skill.id).count();
    if (existing > 0) continue;
    const unit: Unit = {
      id: uid(),
      skillId: skill.id,
      title: FIRST_UNIT_TITLE,
      status: skill.status === "kann" ? "kann" : "lerne",
      note: "",
      nextNote: skill.nextNote ?? null,
      order: 0,
      createdAt: skill.createdAt ?? Date.now(),
    };
    await t.units.add(unit);
    await t.sessions.where("skillId").equals(skill.id).modify((s) => { s.unitId = unit.id; });
    await t.records.where("skillId").equals(skill.id).modify((r) => { r.unitId = unit.id; });
    await t.skills.update(skill.id, { useUnits: true, nextNote: null, timerUnit: skill.timerStart ? unit.id : null });
  }
}
