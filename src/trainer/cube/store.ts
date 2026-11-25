// Speicher des Zauberwürfel-Trainers: Zeiten und Lernpfad-Fortschritt (Dexie), Übungszeit, Skill „Zauberwürfel“.
import { db, uid } from "../../db";
import { createSkill, loadSetting, saveSetting } from "../../logic";
import { addPracticeTimeFor } from "../practice";
import type { CubeProgress, CubeTime } from "./types";

export const addCubeTime = async (ms: number, scramble: string, at = Date.now()): Promise<CubeTime> => {
  const t: CubeTime = { id: uid(), ms: Math.max(0, Math.round(ms)), at, scramble };
  await db.cubeTimes.add(t);
  return t;
};

/** Zeiten, neueste zuerst */
export const loadCubeTimes = async (): Promise<CubeTime[]> => (await db.cubeTimes.orderBy("at").reverse().toArray());

export const deleteCubeTime = (id: string) => db.cubeTimes.delete(id);
export const restoreCubeTime = (t: CubeTime) => db.cubeTimes.put(t);

export async function loadProgress(): Promise<Map<string, CubeProgress>> {
  return new Map((await db.cubeProgress.toArray()).map((p) => [p.id, p]));
}

export const setAlgoState = (id: string, state: CubeProgress["state"], at = Date.now()) => db.cubeProgress.put({ id, state, at });

const PENDING_KEY = "cube.pendingMs", SKILL_KEY = "cube.skillEnsured";
export const addCubePracticeTime = (skillId: string, addMs: number, now = Date.now()): Promise<number> => addPracticeTimeFor(PENDING_KEY, skillId, addMs, now);

export const CUBE_SKILL = { name: "Rubik's Cube solving", title: "Zauberwürfel", kategorie: "Tricks, Geschick & Mentalismus" };

/** Legt den Skill einmalig an, falls es ihn nicht gibt (wer ihn später löscht, bekommt ihn nicht wieder). */
export async function ensureCubeSkill(): Promise<boolean> {
  if (loadSetting<boolean>(SKILL_KEY, false)) return false;
  saveSetting(SKILL_KEY, true);
  const exists = await db.skills.filter((s) => s.title === CUBE_SKILL.title || s.name === CUBE_SKILL.name).count();
  if (exists) return false;
  await createSkill({ ...CUBE_SKILL, typ: "skill", status: "lerne" });
  return true;
}
