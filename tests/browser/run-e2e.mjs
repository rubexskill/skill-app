// Startet Szenarien, Layout-Matrix und Affentest nacheinander (ein gemeinsamer Test-Build), fasst die Ergebnisse zusammen.
// Aufruf: npm run test:e2e   (ENGINES=chromium,webkit  QUICK=1  SEEDS=11,22,33  ACTIONS=300)
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { buildDist, resultsDir } from "./lib.mjs";

const dist = buildDist();
const suites = ["scenarios", "cube", "matrix", "monkey"];
let failed = false;
const rows = [];
for (const s of suites) {
  const r = spawnSync("node", [path.join(import.meta.dirname, `${s}.mjs`)], { stdio: "inherit", env: { ...process.env, DIST: dist } });
  if (r.status !== 0) failed = true;
  const f = path.join(resultsDir, `${s}.json`);
  const res = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : { cases: 0, failures: ["kein Ergebnis"], seconds: 0 };
  rows.push({ s, ...res });
}
const md = ["# Ergebnis der Selbsttests", "", "| Suite | Fälle | Fehler | Dauer |", "|---|---:|---:|---:|", ...rows.map((r) => `| ${r.s} | ${r.cases} | ${r.failures.length} | ${r.seconds} s |`), "", `Gesamt: ${rows.reduce((n, r) => n + r.cases, 0)} Fälle, ${rows.reduce((n, r) => n + r.failures.length, 0)} Fehler.`, ""];
for (const r of rows) for (const f of r.failures) md.push(`- ${r.s}: ${f}`);
fs.writeFileSync(path.join(resultsDir, "zusammenfassung.md"), md.join("\n"));
console.log("\n" + md.join("\n"));
process.exit(failed ? 1 : 0);
