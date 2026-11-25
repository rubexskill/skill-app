import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { BY_ISO, CONFUSABLE, CONTINENTS, FLAGS, confusedWith, inSimilarGroup, lookalikes, type Continent } from "../src/trainer/flags/data";
import {
  DEFAULT_PREFS, answerRun, applyAnswer, currentIso, distractors, isDifficult, isFinished, isNew, makeQuestion, nextLevel, parseRun, poolFor, progressOf, retryRun, startRun, summaryOf, bandOf,
  type Prefs, type Run, type Stat,
} from "../src/trainer/flags/logic";

/** Wiederholbarer Zufall */
const rng = (seed: number) => { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
const stat = (id: string, p: Partial<Stat> = {}): Stat => ({ id, level: 0, seen: 1, right: 0, wrong: 0, last: 0, ...p });
const states = (list: Stat[] = []) => new Map(list.map((s) => [s.id, s]));
const prefs = (p: Partial<Prefs> = {}): Prefs => ({ ...DEFAULT_PREFS, ...p });
const states0 = states();

describe("Flaggen-Daten", () => {
  const states = FLAGS.filter((f) => !f.territory);
  it("195 Staaten und einige Gebiete, alles eindeutig", () => {
    expect(states.length).toBe(195);
    expect(FLAGS.length - states.length).toBeGreaterThanOrEqual(10);
    for (const key of ["iso", "name", "capital"] as const) expect(new Set(FLAGS.map((f) => f[key])).size).toBe(FLAGS.length);
    for (const f of FLAGS) { expect(f.iso).toMatch(/^[A-Z]{2}$/); expect(CONTINENTS).toContain(f.continent); expect(f.name.length).toBeGreaterThan(1); }
  });
  it("Stichproben: Namen, Hauptstädte, Kontinente", () => {
    const g = (i: string) => BY_ISO.get(i)!;
    expect([g("DE").capital, g("AU").capital, g("CA").capital, g("TR").capital, g("CH").capital, g("BR").capital]).toEqual(["Berlin", "Canberra", "Ottawa", "Ankara", "Bern", "Brasília"]);
    expect([g("RU").continent, g("EG").continent, g("MX").continent, g("PE").continent, g("NZ").continent, g("JP").continent]).toEqual(["Europa", "Afrika", "Nordamerika", "Südamerika", "Ozeanien", "Asien"]);
    expect(g("CI").name).toBe("Elfenbeinküste");
  });
  it("jeder Kontinent hat genug Staaten für sinnvolle Falschantworten", () => {
    for (const c of CONTINENTS) expect(states.filter((f) => f.continent === c).length).toBeGreaterThanOrEqual(12);
  });
  it("zu jeder Flagge gibt es eine lokale SVG-Datei, dazu die MIT-Lizenz", () => {
    const dir = path.resolve(import.meta.dirname, "../public/flags");
    for (const f of FLAGS) expect(fs.existsSync(path.join(dir, `${f.iso.toLowerCase()}.svg`)), f.iso).toBe(true);
    expect(fs.readFileSync(path.join(dir, "LICENSE-flag-icons.txt"), "utf8")).toMatch(/MIT License/);
  });
  it("Verwechslungsgruppen: gültige Codes, mindestens zwei, die genannten Beispiele sind enthalten", () => {
    for (const g of CONFUSABLE) { expect(g.length).toBeGreaterThanOrEqual(2); for (const i of g) expect(BY_ISO.has(i), i).toBe(true); expect(new Set(g).size).toBe(g.length); }
    const together = (a: string, b: string) => CONFUSABLE.some((g) => g.includes(a) && g.includes(b));
    for (const [a, b] of [["SI", "SK"], ["SK", "RU"], ["RU", "RS"], ["MD", "RO"], ["RO", "TD"], ["TD", "AD"], ["ID", "MC"], ["MC", "PL"], ["IE", "CI"], ["CI", "IT"], ["IT", "MX"], ["NE", "IN"], ["AU", "NZ"], ["LU", "NL"],
      ["VE", "CO"], ["CO", "EC"], ["CM", "SN"], ["SN", "ML"], ["ML", "GN"], ["GN", "GH"], ["YE", "EG"], ["EG", "SY"], ["SY", "IQ"], ["IQ", "SD"], ["NO", "IS"], ["IS", "DK"], ["DK", "SE"], ["SE", "FI"], ["BO", "GH"],
      ["AT", "LV"], ["CU", "PR"], ["HN", "SV"], ["SV", "NI"], ["DZ", "MR"], ["MR", "PK"], ["LB", "PE"], ["BH", "QA"], ["CZ", "PL"]]) expect(together(a, b), `${a}/${b}`).toBe(true);
    expect(confusedWith("SI")).toContain("SK");
    expect(inSimilarGroup("DE")).toBe(true);
  });
});

describe("Falsche Antworten", () => {
  const all = FLAGS.filter((f) => !f.territory);
  it("immer drei verschiedene, nie die richtige, nie ein Doppelgänger", () => {
    for (const c of all) for (let seed = 1; seed <= 4; seed++) {
      const d = distractors(c, all, rng(seed * 31 + c.iso.charCodeAt(0)));
      expect(d.length, c.iso).toBe(3);
      expect(new Set(d.map((x) => x.iso)).size).toBe(3);
      expect(d.map((x) => x.iso)).not.toContain(c.iso);
      for (const x of d) expect(lookalikes(c.iso)).not.toContain(x.iso);
    }
  });
  it("die Hälfte (2 von 3) kommt aus der Verwechslungsgruppe, wenn es genug gibt", () => {
    for (const iso of ["SI", "RO", "NO", "VE", "YE", "HN", "CM", "AU"]) {
      const c = BY_ISO.get(iso)!;
      const group = new Set(confusedWith(iso).filter((x) => !lookalikes(iso).includes(x)));
      for (let seed = 1; seed <= 20; seed++) {
        const d = distractors(c, all, rng(seed));
        expect(d.filter((x) => group.has(x.iso)).length, `${iso} #${seed}`).toBeGreaterThanOrEqual(2);
      }
    }
  });
  it("Gruppen mit nur einem anderen Mitglied: dieses ist dabei, der Rest vom selben Kontinent", () => {
    const c = BY_ISO.get("NE")!;
    for (let seed = 1; seed <= 20; seed++) {
      const d = distractors(c, all, rng(seed));
      expect(d.map((x) => x.iso)).toContain("IN");
      const same = d.filter((x) => x.iso !== "IN" && x.continent === c.continent);
      expect(same.length).toBe(2);
    }
  });
  it("Doppelgänger-Paare (Indonesien/Monaco) stehen nie zusammen", () => {
    for (let seed = 1; seed <= 40; seed++) {
      expect(distractors(BY_ISO.get("ID")!, all, rng(seed)).map((x) => x.iso)).not.toContain("MC");
      expect(distractors(BY_ISO.get("MC")!, all, rng(seed)).map((x) => x.iso)).not.toContain("ID");
      const others = distractors(BY_ISO.get("PL")!, all, rng(seed)).map((x) => x.iso);
      expect(others.includes("ID") && others.includes("MC")).toBe(false);
    }
  });
  it("ohne Gruppe oder Rest: erst gleicher Kontinent, dann beliebig; Gebiete nur, wenn sie im Angebot sind", () => {
    const c = BY_ISO.get("NZ")!;
    for (let seed = 1; seed <= 15; seed++) {
      const d = distractors(c, all, rng(seed));
      expect(d.every((x) => !x.territory)).toBe(true);
    }
    const tiny = distractors(BY_ISO.get("DE")!, [BY_ISO.get("DE")!, BY_ISO.get("FR")!, BY_ISO.get("JP")!], rng(1), 3);
    expect(tiny.map((x) => x.iso).sort()).toEqual(["FR", "JP"]); // es gibt nicht mehr – nie Doppelte
  });
  it("Frage: vier verschiedene Antworten, die richtige ist dabei, Reihenfolge wechselt", () => {
    const positions = new Set<number>();
    for (let seed = 1; seed <= 40; seed++) {
      const q = makeQuestion("FR", "flag", all, rng(seed));
      expect(q.options.length).toBe(4);
      expect(new Set(q.options).size).toBe(4);
      expect(q.options).toContain("FR");
      positions.add(q.options.indexOf("FR"));
    }
    expect(positions.size).toBeGreaterThanOrEqual(3);
  });
});

describe("Lernstufen (Leitner, einfach)", () => {
  it("richtig = eine Stufe höher bis 4, falsch = zurück auf 0", () => {
    expect([0, 1, 2, 3, 4].map((l) => nextLevel(l, true))).toEqual([1, 2, 3, 4, 4]);
    expect([0, 1, 2, 3, 4].map((l) => nextLevel(l, false))).toEqual([0, 0, 0, 0, 0]);
  });
  it("Antwort aktualisiert Zähler, Stufe und Zeit", () => {
    const a = applyAnswer(undefined, "FR", true, 100);
    expect(a).toMatchObject({ id: "FR", level: 1, seen: 1, right: 1, wrong: 0, last: 100 });
    const b = applyAnswer(a, "FR", false, 200);
    expect(b).toMatchObject({ level: 0, seen: 2, right: 1, wrong: 1, last: 200 });
  });
  it("„Schwierig“ = Stufe 0–1 und mehr als ein Fehler; „Neu“ = noch nie gesehen; Bänder", () => {
    expect(isDifficult(stat("A", { level: 0, wrong: 2 }))).toBe(true);
    expect(isDifficult(stat("A", { level: 1, wrong: 3 }))).toBe(true);
    expect(isDifficult(stat("A", { level: 1, wrong: 1 }))).toBe(false);
    expect(isDifficult(stat("A", { level: 2, wrong: 5 }))).toBe(false);
    expect(isDifficult(undefined)).toBe(false);
    expect(isNew(undefined)).toBe(true);
    expect(isNew(stat("A", { seen: 0 }))).toBe(true);
    expect(isNew(stat("A"))).toBe(false);
    expect([bandOf(undefined), bandOf(stat("A", { level: 1 })), bandOf(stat("A", { level: 3 })), bandOf(stat("A", { level: 4 }))]).toEqual(["new", "learning", "sure", "sure"]);
  });
});

describe("Auswahl und Umfang", () => {
  const isos = (list: { iso: string }[]) => list.map((f) => f.iso);
  it("alle: 195 Staaten, mit Gebieten mehr", () => {
    expect(poolFor(prefs(), states0).length).toBe(195);
    expect(poolFor(prefs({ territories: true }), states0).length).toBe(FLAGS.length);
  });
  it("nach Kontinent", () => {
    const p = poolFor(prefs({ scope: "continent", continent: "Ozeanien" as Continent }), states0);
    expect(p.length).toBe(14);
    expect(p.every((f) => f.continent === "Ozeanien")).toBe(true);
  });
  it("Schwierige: nur meine Fehler; Neue: nur nie gesehene; Ähnliche: nur Verwechslungsgruppen", () => {
    const st = states([stat("FR", { level: 0, wrong: 3 }), stat("DE", { level: 1, wrong: 2 }), stat("IT", { level: 0, wrong: 1 }), stat("ES", { level: 4, right: 9 })]);
    expect(isos(poolFor(prefs({ scope: "difficult" }), st)).sort()).toEqual(["DE", "FR"]);
    const fresh = poolFor(prefs({ scope: "new" }), st);
    expect(fresh.length).toBe(195 - 4);
    expect(isos(fresh)).not.toContain("FR");
    const similar = poolFor(prefs({ scope: "similar" }), states0);
    expect(similar.length).toBeGreaterThan(40);
    expect(similar.every((f) => inSimilarGroup(f.iso))).toBe(true);
  });
  it("Umfang: 10, 25, 50, Alle, Endlos", () => {
    for (const n of [10, 25, 50] as const) {
      const run = startRun(prefs({ amount: n }), states0, rng(n), 0)!;
      expect(run.queue.length).toBe(n);
      expect(new Set(run.queue).size).toBe(n);
      expect(run.total).toBe(n);
    }
    const all = startRun(prefs({ amount: "all" }), states0, rng(5), 0)!;
    expect(all.queue.length).toBe(195);
    expect(new Set(all.queue).size).toBe(195);
    const endless = startRun(prefs({ amount: "endless" }), states0, rng(5), 0)!;
    expect(endless.endless).toBe(true);
    expect(endless.queue.length).toBeGreaterThanOrEqual(10);
  });
  it("kleinerer Pool als gewünscht: alles, was da ist; leerer Pool: kein Durchgang", () => {
    const run = startRun(prefs({ amount: 50, scope: "continent", continent: "Südamerika" as Continent }), states0, rng(1), 0)!;
    expect(run.queue.length).toBe(12);
    expect(startRun(prefs({ scope: "difficult" }), states0, rng(1), 0)).toBeNull();
  });
  it("schwache Flaggen kommen bevorzugt dran, sichere seltener", () => {
    const st = states(FLAGS.filter((f) => !f.territory).slice(0, 150).map((f) => stat(f.iso, { level: 4, right: 5 })));
    let weak = 0;
    for (let seed = 1; seed <= 30; seed++) {
      const run = startRun(prefs({ amount: 25 }), st, rng(seed), 0)!;
      weak += run.queue.filter((i) => !st.has(i)).length;
    }
    // 45 von 195 Flaggen sind ungesehen (Gewicht 5), 150 sicher (Gewicht 1): erwartet ≈ 61 % statt 23 %
    expect(weak / (30 * 25)).toBeGreaterThan(0.45);
  });
});

/** Spielt einen Durchgang durch; `correct(iso, nth)` entscheidet je Antwort. */
function play(run: Run, correct: (iso: string, n: number) => boolean, seed = 9, limit = 5000) {
  const r = rng(seed);
  const seq: string[] = [];
  const rem: number[] = [];
  const times: Record<string, number> = {};
  let cur = run;
  while (!isFinished(cur) && seq.length < limit) {
    const iso = currentIso(cur)!;
    seq.push(iso);
    rem.push(cur.queue.length - 1);
    times[iso] = (times[iso] ?? 0) + 1;
    cur = answerRun(cur, iso, correct(iso, times[iso]), r);
  }
  return { run: cur, seq, times, rem };
}

describe("Durchgang", () => {
  it("alles richtig: jede Flagge genau einmal, 100 %", () => {
    const run = startRun(prefs({ amount: 25 }), states0, rng(2), 0)!;
    const { run: end, seq } = play(run, () => true);
    expect(seq.length).toBe(25);
    expect(summaryOf(end)).toMatchObject({ total: 25, right: 25, percent: 100, wrong: [] });
    expect(progressOf(end)).toBe(1);
  });
  it("falsche Flaggen kommen im selben Durchgang noch 1–2 Mal wieder (ersten Versuch zählt das Ergebnis)", () => {
    const run = startRun(prefs({ amount: 25 }), states0, rng(3), 0)!;
    const { run: end, seq, times } = play(run, () => false);
    const counts = Object.values(times);
    expect(counts.every((n) => n === 2 || n === 3)).toBe(true); // 1 Mal + 2 Wiederholungen (die allerletzte Frage kann nicht ohne Doppelung wiederkehren)
    expect(counts.filter((n) => n === 3).length).toBeGreaterThanOrEqual(23);
    expect(seq.length).toBeGreaterThanOrEqual(73);
    expect(seq.length).toBeLessThanOrEqual(75);
    expect(summaryOf(end)).toMatchObject({ total: 25, right: 0, percent: 0 });
    expect(summaryOf(end).wrong.length).toBe(25);
  });
  it("falsch beim ersten Mal, richtig beim zweiten: eine Wiederholung, Ergebnis bleibt „falsch“", () => {
    const run = startRun(prefs({ amount: 10 }), states0, rng(4), 0)!;
    const { run: end, times } = play(run, (_i, n) => n >= 2);
    const counts = Object.values(times);
    expect(counts.every((n) => n === 1 || n === 2)).toBe(true);
    expect(counts.filter((n) => n === 2).length).toBeGreaterThanOrEqual(9);
    expect(summaryOf(end).right).toBe(0);
  });
  it("Wiederholung kommt frühestens nach 3 anderen Fragen, nie direkt hintereinander", () => {
    for (let seed = 1; seed <= 20; seed++) {
      const run = startRun(prefs({ amount: 25 }), states0, rng(seed), 0)!;
      const { seq, rem } = play(run, (i, n) => (i.charCodeAt(0) + seed) % 3 === 0 && n < 3 ? false : true, seed);
      for (let k = 1; k < seq.length; k++) expect(seq[k], `Seed ${seed}, Position ${k}`).not.toBe(seq[k - 1]);
      // hinter mindestens drei anderen Fragen, solange noch genug Fragen übrig sind
      for (let k = 0; k < seq.length; k++) { const again = seq.indexOf(seq[k], k + 1); if (again > 0 && rem[k] >= 6) expect(again - k, `Seed ${seed}, Position ${k}`).toBeGreaterThanOrEqual(4); }
    }
  });
  it("kleiner Durchgang: Wiederholungen rücken ans Ende, nie doppelt hintereinander (soweit möglich)", () => {
    const run = startRun(prefs({ amount: 10, scope: "continent", continent: "Südamerika" as Continent }), states0, rng(7), 0)!;
    const { seq } = play(run, () => false);
    for (let k = 1; k < seq.length; k++) expect(seq[k]).not.toBe(seq[k - 1]);
  });
  it("Endlos: läuft weiter, nie dieselbe Flagge zweimal hintereinander", () => {
    let run = startRun(prefs({ amount: "endless" }), states0, rng(8), 0)!;
    const r = rng(10);
    let prev = "";
    for (let i = 0; i < 600; i++) {
      const iso = currentIso(run)!;
      expect(iso).not.toBe(prev);
      prev = iso;
      expect(isFinished(run)).toBe(false);
      run = answerRun(run, iso, r() > 0.3, r, states0);
    }
  });
  it("Fortsetzen: gespeicherter Stand (JSON) liefert denselben Verlauf", () => {
    const base = startRun(prefs({ amount: 25 }), states0, rng(6), 0)!;
    let a = base;
    const r1 = rng(11);
    for (let i = 0; i < 9; i++) a = answerRun(a, currentIso(a)!, i % 3 !== 0, r1);
    const saved = parseRun(JSON.stringify(a))!;
    expect(saved).toEqual(a);
    const ra = rng(99), rb = rng(99);
    let x = a, y = saved;
    const seqX: string[] = [], seqY: string[] = [];
    while (!isFinished(x)) { seqX.push(currentIso(x)!); x = answerRun(x, currentIso(x)!, true, ra); }
    while (!isFinished(y)) { seqY.push(currentIso(y)!); y = answerRun(y, currentIso(y)!, true, rb); }
    expect(seqY).toEqual(seqX);
  });
  it("kaputter Zwischenstand wird abgelehnt", () => {
    expect(parseRun("")).toBeNull();
    expect(parseRun("{}")).toBeNull();
    expect(parseRun(JSON.stringify({ queue: ["XX-nicht-da"], prefs: DEFAULT_PREFS, done: 0 }))).toBeNull();
    expect(parseRun(JSON.stringify({ queue: "FR" }))).toBeNull();
  });
  it("Fehler wiederholen: Durchgang nur mit den falschen Flaggen", () => {
    const run = startRun(prefs({ amount: 10 }), states0, rng(12), 0)!;
    const { run: end } = play(run, (i) => i.charCodeAt(1) % 2 === 0);
    const wrong = summaryOf(end).wrong;
    expect(wrong.length).toBeGreaterThan(0);
    const again = retryRun(end.prefs, wrong, rng(13), 0)!;
    expect([...again.queue].sort()).toEqual([...wrong].sort());
    expect(again.total).toBe(wrong.length);
    expect(retryRun(end.prefs, [], rng(1), 0)).toBeNull();
  });
  it("Richtung „gemischt“ liefert beide Fragearten, Flagge→Land und Land→Flagge", () => {
    const kinds = new Set<string>();
    for (let seed = 1; seed <= 30; seed++) kinds.add(makeQuestion("DE", Math.random() < 0.5 ? "flag" : "country", FLAGS, rng(seed)).dir);
    expect(kinds).toEqual(new Set(["flag", "country"]));
  });
});
