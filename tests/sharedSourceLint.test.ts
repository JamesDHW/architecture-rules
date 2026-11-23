import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

import { run } from "./utils/cliFixtures.js";
import { temporaryRoot, tsconfigJson, writeFiles } from "./utils/fixtures.js";

const COMPILER = { target: "ES2022", module: "ESNext", moduleResolution: "Bundler" } as const;
const packageEntry = JSON.stringify(pathToFileURL(resolve("dist/index.js")).href);

type JsonFinding = { readonly ruleId: string; readonly file: string; readonly line?: number };

const isJsonFindings = (value: unknown): value is { readonly findings: readonly JsonFinding[] } => {
  return typeof value === "object" && value !== null && "findings" in value && Array.isArray(value.findings);
};

describe("lint over several projects", () => {
  it("lints a file once when two projects hold it", () => {
    const root = temporaryRoot("architecture-shared-lint-");
    writeFiles(root, {
      "package.json": JSON.stringify({ name: "fixture", private: true, type: "module" }),
      "tsconfig.json": tsconfigJson(COMPILER, { include: ["src/shared/**/*.ts"] }),
      "tsconfig.app.json": tsconfigJson(COMPILER, { include: ["src/app/**/*.ts"] }),
      "src/shared/counter.ts": "export const count = (): number => {\n  let total = 0;\n  total += 1;\n  return total;\n};\n",
      "src/app/main.ts": 'import { count } from "../shared/counter.js";\nexport const started = count();\n',
      "architecture.config.ts": `import { defineArchitecture } from ${packageEntry};
      export default defineArchitecture({
        projects: { tsconfigs: ["tsconfig.json", "tsconfig.app.json"] },
        layers: {
          shared: { description: "Shared", files: ["src/shared/**"] },
          app: { description: "App", files: ["src/app/**"], entry: { reason: "The bundler starts here.", exports: "all" }, dependencies: { internal: ["shared"] } },
        },
      });`,
    });
    const checked = run(["--format", "json"], root);
    const parsed: unknown = JSON.parse(checked.stdout);
    if (!isJsonFindings(parsed)) return expect.unreachable(checked.stdout + checked.stderr);
    const lets = parsed.findings.filter((finding) => finding.ruleId === "no-let").map((finding) => `${finding.file}:${finding.line ?? 0}`);
    expect(lets).toEqual(["src/shared/counter.ts:2"]);
  });
});
