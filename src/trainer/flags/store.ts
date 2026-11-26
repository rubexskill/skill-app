import { settingKey } from "../../demo/mode";
// Speicher des Flaggen-Trainers: Lernstand (Dexie), Einstellungen und Zwischenstand (lokal), Lernzeit.
import { db } from "../../db";
import { addPracticeTimeFor } from "../practice";
import { createSkill, loadSetting, saveSetting } from "../../logic";
import { applyAnswer, DEFAULT_PREFS, parsePrefs, parseRun, type Prefs, type Run, type Stat } from "./logic";

export async function loadStats(): Promise<Map<string, Stat>> {
  return new Map((await db.flagStats.toArray()).map((s) => [s.id, s]));
}

export async function recordAnswer(iso: string, correct: boolean, now = Date.now()): Promise<Stat> {
  const next = applyAnswer(await db.flagStats.get(iso), iso, correct, now);
  await db.flagStats.put(next);
  return next;
}

export async function resetStats(): Promise<void> {
  // einzeln löschen, damit Löschvermerke für den Abgleich entstehen
  for (const id of (await db.flagStats.toCollection().primaryKeys()) as string[]) await db.flagStats.delete(id);
}

// ---------------- Einstellungen und Zwischenstand (nur auf diesem Gerät) ----------------

const PREFS_KEY = "flags.prefs", RUN_KEY = "flags.run", PENDING_KEY = "flags.pendingMs", SKILL_KEY = "flags.skillEnsured";

export const loadPrefs = (): Prefs => parsePrefs(loadSetting<unknown>(PREFS_KEY, DEFAULT_PREFS));
export const savePrefs = (p: Prefs) => saveSetting(PREFS_KEY, p);

export function loadRun(): Run | null {
  try {
    const raw = localStorage.getItem(settingKey(RUN_KEY));
    const run = raw ? parseRun(raw) : null;
    return run && (run.endless || run.queue.length > 0) ? run : null;
  } catch {
    return null;
  }
}
export const saveRun = (r: Run) => saveSetting(RUN_KEY, r);
export function clearRun() {
  try { localStorage.removeItem(settingKey(RUN_KEY)); } catch { /* ohne Speicher kein Zwischenstand */ }
}

// ---------------- Lernzeit ----------------

export { splitMinutes } from "../practice";

/** Übungszeit des Quiz zählt als normale Lernzeit des Skills. Gibt die neu gespeicherten Minuten zurück. */
export const addPracticeTime = (skillId: string, addMs: number, now = Date.now()): Promise<number> => addPracticeTimeFor(PENDING_KEY, skillId, addMs, now);

// ---------------- Skill „Flaggen & Geografie“ ----------------

export const FLAG_SKILL = { name: "Learn flags and geography", title: "Flaggen & Geografie", kategorie: "Natur, Erde & Himmel" };

/** Legt den Skill einmalig an, falls es ihn nicht gibt (wer ihn später löscht, bekommt ihn nicht wieder). */
export async function ensureFlagSkill(): Promise<boolean> {
  if (loadSetting<boolean>(SKILL_KEY, false)) return false;
  saveSetting(SKILL_KEY, true);
  const exists = await db.skills.filter((s) => s.title === FLAG_SKILL.title || s.title === "Flaggen" || s.name === FLAG_SKILL.name).count();
  if (exists) return false;
  await createSkill({ ...FLAG_SKILL, typ: "skill", status: "lerne" });
  return true;
}
