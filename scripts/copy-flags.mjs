// Kopiert die benötigten Flaggen (4:3) aus dem MIT-lizenzierten Paket „flag-icons“ nach public/flags/.
// Aufruf: node scripts/copy-flags.mjs   (nach „npm install“; die Kopien liegen im Repository, damit der Build offline läuft)
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const src = fs.readFileSync(path.join(root, "src/trainer/flags/data.ts"), "utf8");
const isos = [...src.matchAll(/f\("([A-Z]{2})"/g)].map((m) => m[1].toLowerCase());
const from = path.join(root, "node_modules/flag-icons/flags/4x3");
const to = path.join(root, "public/flags");
fs.mkdirSync(to, { recursive: true });
let bytes = 0;
for (const iso of isos) {
  const b = fs.readFileSync(path.join(from, `${iso}.svg`));
  fs.writeFileSync(path.join(to, `${iso}.svg`), b);
  bytes += b.length;
}
fs.copyFileSync(path.join(root, "node_modules/flag-icons/LICENSE"), path.join(to, "LICENSE-flag-icons.txt"));
console.log(`${isos.length} Flaggen kopiert, ${(bytes / 1024 / 1024).toFixed(2)} MB`);
