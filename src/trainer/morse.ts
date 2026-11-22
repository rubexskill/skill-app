/** Morse-Logik ohne Oberfläche: Tabelle, Koch-Reihenfolge, Zeitberechnung (PARIS/Farnsworth). */

export const MORSE: Record<string, string> = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....", I: "..", J: ".---",
  K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.", S: "...", T: "-",
  U: "..-", V: "...-", W: ".--", X: "-..-", Y: "-.--", Z: "--..",
  "0": "-----", "1": ".----", "2": "..---", "3": "...--", "4": "....-", "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----.",
  ".": ".-.-.-", ",": "--..--", "?": "..--..", "/": "-..-.", "=": "-...-",
};

/** Reihenfolge der Zeichen nach der Koch-Methode, wie sie z. B. LCWO verwendet. */
export const KOCH_ORDER = "KMURESNAPTLWI.JZ=FOY,VG5/Q92H38B?47C1D60X".split("");

export const MORSE_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
export const MORSE_ALL = [...MORSE_LETTERS, ..."0123456789".split("")];
export const MORSE_EASY = ["E", "T", "A", "N", "I", "M"];

export function morseOf(word: string): string {
  return word.split("").map((c) => MORSE[c] ?? "").join(" ");
}

/** Länge einer Einheit (ein Punkt) in Sekunden bei c Wörtern pro Minute (Wort PARIS = 50 Einheiten). */
export const unitSec = (wpm: number) => 1.2 / wpm;

/** Farnsworth: Länge einer Pausen-Einheit zwischen Zeichen (3 Einheiten) und Wörtern (7), damit das Gesamttempo s Wörter pro Minute ergibt. */
export function farnsworthUnit(charWpm: number, effWpm: number): number {
  if (effWpm >= charWpm) return unitSec(charWpm);
  return (60 * charWpm - 37.2 * effWpm) / (19 * effWpm * charWpm);
}

export interface Beep { start: number; dur: number }

/** Töne für einen Text (Leerzeichen = Wortpause). Zeiten in Sekunden ab 0, total = Gesamtlänge. */
export function morseEvents(text: string, charWpm = 20, effWpm = charWpm): { beeps: Beep[]; total: number } {
  const u = unitSec(charWpm);
  const g = farnsworthUnit(charWpm, effWpm);
  const beeps: Beep[] = [];
  let t = 0;
  const words = text.toUpperCase().split(/\s+/).filter(Boolean);
  words.forEach((word, wi) => {
    const chars = word.split("").filter((c) => MORSE[c]);
    chars.forEach((ch, ci) => {
      const code = MORSE[ch];
      for (let k = 0; k < code.length; k++) {
        const dur = (code[k] === "-" ? 3 : 1) * u;
        beeps.push({ start: t, dur });
        t += dur;
        if (k < code.length - 1) t += u;
      }
      if (ci < chars.length - 1) t += 3 * g;
    });
    if (wi < words.length - 1) t += 7 * g;
  });
  return { beeps, total: t };
}

/** Zeichengruppen für die Koch-Methode: size Zeichen pro Gruppe aus den ersten `unlocked` Zeichen; das neueste Zeichen kommt oft vor. */
export function kochGroups(unlocked: number, groups = 10, size = 5, rnd: () => number = Math.random): string[] {
  const pool = KOCH_ORDER.slice(0, Math.max(2, Math.min(unlocked, KOCH_ORDER.length)));
  const newest = pool[pool.length - 1];
  const pick = () => pool[Math.floor(rnd() * pool.length)];
  return Array.from({ length: groups }, (_, gi) => {
    const chars = Array.from({ length: size }, pick);
    if (gi % 2 === 0 && pool.length > 2) chars[Math.floor(rnd() * size)] = newest;
    return chars.join("");
  });
}

/** Anteil richtig getippter Zeichen (Position für Position, 0 bis 1). */
export function groupCredit(expected: string, typed: string): number {
  const a = expected.toUpperCase();
  const b = typed.toUpperCase().replace(/\s+/g, "");
  let ok = 0;
  for (let i = 0; i < a.length; i++) if (b[i] === a[i]) ok++;
  return a.length ? ok / a.length : 0;
}

export const KOCH_PASS = 0.9;

export interface MorsePrefs { charWpm: number; effWpm: number; koch: number }
const KEY = "skills.morse";
export function loadPrefs(): MorsePrefs {
  const d: MorsePrefs = { charWpm: 20, effWpm: 10, koch: 2 };
  try {
    const p = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    return {
      charWpm: [15, 20, 25].includes(p.charWpm) ? p.charWpm : d.charWpm,
      effWpm: [5, 8, 10, 15, 20, 25].includes(p.effWpm) ? p.effWpm : d.effWpm,
      koch: Number.isInteger(p.koch) ? Math.max(2, Math.min(KOCH_ORDER.length, p.koch)) : d.koch,
    };
  } catch { return d; }
}
export function savePrefs(p: MorsePrefs) {
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* privater Modus */ }
}
