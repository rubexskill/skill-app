import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: { environment: "node", setupFiles: ["tests/setup.ts"], include: ["tests/**/*.test.ts"] },
  define: { __DEMO__: true }, // Tests laufen wie die öffentliche Version
  resolve: { alias: { "@seed-data": path.resolve(import.meta.dirname, "src/seed/data-empty.ts") } },
});
