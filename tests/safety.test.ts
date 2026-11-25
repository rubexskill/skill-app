import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { REMIND_DAYS, loadBackupState, markBackup, reminderText, requestPersistence, setRemind, storageInfo, storageLabel } from "../src/safety";

const store = new Map<string, string>();
beforeEach(() => {
  store.clear();
  (globalThis as unknown as { localStorage: unknown }).localStorage = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v), removeItem: (k: string) => void store.delete(k) };
});
const setStorage = (s: unknown) => Object.defineProperty(globalThis.navigator, "storage", { value: s, configurable: true });
afterEach(() => { Object.defineProperty(globalThis.navigator, "storage", { value: undefined, configurable: true }); });
const DAY = 86400000;

describe("Dauerhafter Speicher", () => {
  it("nicht unterstützt: Hinweis statt Fehler", async () => {
    setStorage(undefined);
    const i = await storageInfo();
    expect(i.supported).toBe(false);
    expect(await requestPersistence()).toBeNull();
    expect(storageLabel(i).ok).toBe(false);
  });
  it("wird angefordert und gemeldet", async () => {
    let persisted = false;
    setStorage({ persisted: async () => persisted, persist: async () => (persisted = true), estimate: async () => ({ usage: 1000, quota: 5000 }) });
    expect((await storageInfo()).persisted).toBe(false);
    expect(await requestPersistence()).toBe(true);
    const i = await storageInfo();
    expect(i).toEqual({ supported: true, persisted: true, usage: 1000, quota: 5000 });
    expect(storageLabel(i).ok).toBe(true);
  });
  it("abgelehnt oder Fehler: false, nie eine Ausnahme", async () => {
    setStorage({ persisted: async () => false, persist: async () => false });
    expect(await requestPersistence()).toBe(false);
    setStorage({ persisted: async () => { throw new Error("x"); }, persist: async () => { throw new Error("x"); } });
    expect(await requestPersistence()).toBe(false);
    expect((await storageInfo()).persisted).toBeNull();
  });
});

describe("Backup-Erinnerung", () => {
  it("erst nach 14 Tagen, nie ohne Daten, abschaltbar", () => {
    const t0 = Date.UTC(2026, 0, 1);
    const s = loadBackupState(t0);
    expect(s).toEqual({ last: null, since: t0, remind: true });
    expect(reminderText(s, t0 + (REMIND_DAYS - 1) * DAY, true)).toBeNull();
    expect(reminderText(s, t0 + REMIND_DAYS * DAY, true)).toMatch(/Noch kein Backup.*14 Tagen/);
    expect(reminderText(s, t0 + 40 * DAY, false)).toBeNull();
    setRemind(false);
    expect(reminderText(loadBackupState(t0), t0 + 40 * DAY, true)).toBeNull();
  });
  it("nach einem Backup beginnt das Zählen neu", () => {
    const t0 = Date.UTC(2026, 0, 1);
    loadBackupState(t0);
    markBackup(t0 + 20 * DAY);
    const s = loadBackupState(t0 + 21 * DAY);
    expect(s.last).toBe(t0 + 20 * DAY);
    expect(s.since).toBe(t0);
    expect(reminderText(s, t0 + 33 * DAY, true)).toBeNull();
    expect(reminderText(s, t0 + 34 * DAY, true)).toBe("Seit 14 Tagen kein Backup.");
  });
});
