import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { expect } from "vitest";

import { temporaryRoot, tsconfigJson, writeFiles } from "./fixtures.js";

const packageEntry = JSON.stringify(pathToFileURL(resolve("dist/index.js")).href);

/** Two layers: ui may import domain; domain may import nothing. */
const layeredConfig = (adoption = ""): string => `import { defineArchitecture } from ${packageEntry};
export default defineArchitecture({
  projects: { tsconfigs: ["tsconfig.json"] },
  naming: { case: "camelCase" },
  ${adoption}
  layers: {
    domain: { description: "Domain", files: ["src/domain/**/*.ts"], entry: { reason: "Fixture.", exports: "all" }, dependencies: { internal: [] } },
    ui: { description: "UI", files: ["src/ui/**/*.ts"], entry: { reason: "Fixture.", exports: "all" }, dependencies: { internal: ["domain"] } },
  },
});`;

/** A function that reassigns a let: one no-let finding. */
export const letFunction = (name: string): string => `export const ${name} = (): number => {\n  let count = 1;\n  count += 1;\n  return count;\n};\n`;

/** Runs git in the fixture; a failure fails the test. */
export const gitIn = (root: string, args: readonly string[]): string => {
  const result = spawnSync("git", ["-c", "user.email=fixture@example.com", "-c", "user.name=Fixture", "-c", "init.defaultBranch=main", ...args], { cwd: root, encoding: "utf8" });
  expect(result.status, result.stderr).toBe(0);
  return result.stdout;
};

export const commitAll = (root: string, message: string): void => {
  gitIn(root, ["add", "-A"]);
  gitIn(root, ["commit", "-qm", message]);
};

/**
 * A committed project with existing debt: domain imports ui (denied), and has a let. ui imports domain as allowed.
 */
export const debtFixture = (adoption = ""): string => {
  const root = temporaryRoot("architecture-baseline-");
  writeFiles(root, {
    "package.json": JSON.stringify({ name: "fixture", private: true, type: "module" }),
    "tsconfig.json": tsconfigJson({ module: "ESNext", moduleResolution: "Bundler", target: "ES2022" }, { include: ["src/**/*.ts"] }),
    "architecture.config.ts": layeredConfig(adoption),
    "src/domain/model.ts": `import { label } from "../ui/label.js";\n\nexport const describeModel = (): string => {\n  let text = "model";\n  text = \`\${text} \${label}\`;\n  return text;\n};\n`,
    "src/domain/shape.ts": "export const shape = \"shape\";\n",
    "src/ui/label.ts": "export const label = \"label\";\n",
    "src/ui/view.ts": "import { shape } from \"../domain/shape.js\";\n\nexport const view = `${shape} view`;\n",
  });
  gitIn(root, ["init", "-q"]);
  commitAll(root, "fixture");
  return root;
};

export const readText = (root: string, file: string): string => readFileSync(join(root, file), "utf8");

export const baselineJson = (root: string, file = "architecture.baseline.json"): unknown => JSON.parse(readText(root, file));
