// Demo-Modus: eigene Datenbank („skill-app-demo“), getrennte Einstellungen, Aufnahme-Modus. Nur in der öffentlichen Version.
// Der Modus wird beim Start aus localStorage gelesen; Wechsel = Flag setzen und neu laden, damit sich Demo und echte Daten nie mischen.
import { useSyncExternalStore } from "react";

declare const __DEMO__: boolean;
export const DEMO_DB = "skill-app-demo";
export const REAL_DB = "skill-app";
const FLAG = "skills.demo", REC = "skills.demo.record", SEEDED = "skills.demo.seeded";

/** In der privaten Version (mit src/seed/private) ist der Demo-Modus nicht vorhanden. */
export const demoAllowed: boolean = typeof __DEMO__ !== "undefined" ? __DEMO__ : false;

const read = (k: string): string | null => { try { return localStorage.getItem(k); } catch { return null; } };
const write = (k: string, v: string | null) => { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch { /* privater Modus */ } };

/** Rein: Ist der Demo-Modus an? (erlaubt und Flag gesetzt) */
export const demoOn = (allowed: boolean, flag: string | null): boolean => allowed && flag === "1";
export const isDemo = (): boolean => demoOn(demoAllowed, read(FLAG));
export const dbName = (): string => (isDemo() ? DEMO_DB : REAL_DB);

/** Einstellungen im Demo-Modus getrennt halten (eigene Schlüssel), damit nichts von den echten überschrieben wird */
export const settingKey = (key: string, demo = isDemo()): string => (demo ? `demo.${key}` : key);

export const demoSeededOn = (): string | null => read(SEEDED);
export const markSeeded = (day: string) => write(SEEDED, day);

export function startDemo() { write(FLAG, "1"); write(SEEDED, null); location.reload(); }
export function leaveDemoFlags() { write(FLAG, null); write(REC, null); write(SEEDED, null); }

// ---------- Aufnahme-Modus ----------
const listeners = new Set<() => void>();
export const recordMode = (): boolean => isDemo() && read(REC) === "1";
export function setRecordMode(on: boolean) {
  write(REC, on ? "1" : null);
  document.documentElement.classList.toggle("demo-record", on);
  listeners.forEach((l) => l());
}
export const applyRecordClass = () => document.documentElement.classList.toggle("demo-record", recordMode());
export function useRecordMode(): boolean {
  return useSyncExternalStore((cb) => { listeners.add(cb); return () => void listeners.delete(cb); }, recordMode, () => false);
}
