import { describe, expect, it } from "vitest";

import { analyzeImports } from "../src/analysis/imports.js";
import { inventory } from "../src/analysis/inventory.js";
import { defineArchitecture } from "../src/config/defineArchitecture.js";
import type { ProjectRules } from "../src/config/types.js";
import { programFindings } from "../src/runner/programFindings.js";
import { openFixtureProjects, temporaryRoot, tsconfigJson, writeFiles } from "./utils/fixtures.js";

const ERRORS = "export class AppError extends Error {}\nexport class Plain {}\n";

const DISCARDS = `import { AppError, Plain } from "./errors.js";

declare const result: number | AppError;
export const flattened = result instanceof AppError ? null : result;
export const kept = result instanceof AppError ? result : result + 1;
export const notAnError = (value: number | Plain): number | null => value instanceof Plain ? null : value;
export const guarded = (value: number | AppError): number | undefined => {
  if (value instanceof AppError) return undefined;
  return value;
};
export const logged = (value: number | AppError, log: (text: string) => void): number | undefined => {
  if (value instanceof AppError) {
    log(value.message);
    return undefined;
  }
  return value;
};
const isAppError = (value: unknown): value is AppError => value instanceof AppError;
export const byPredicate = (value: number | AppError): number => isAppError(value) ? 0 : value;
export const negated = (value: number | AppError): number | null => !(value instanceof AppError) ? value : null;
`;

const LISTS = `type Status = "draft" | "active" | "archived";
export const everyStatus = ["draft", "active", "archived"] as const satisfies readonly Status[];
export const someStatuses = ["draft", "active"] as const satisfies readonly Status[];
export const editableStatuses: readonly Status[] = ["draft"];
export const genericForm = ["draft"] satisfies Array<Status>;
export const words = ["x"] satisfies readonly string[];
`;

const fixture = (rules: ProjectRules = {}) => {
  const root = temporaryRoot("architecture-program-");
  writeFiles(root, {
    "tsconfig.json": tsconfigJson({ target: "ES2022", module: "ESNext", moduleResolution: "Bundler" }, { include: ["src/**/*.ts"] }),
    "src/domain/errors.ts": ERRORS,
    "src/domain/discards.ts": DISCARDS,
    "src/domain/lists.ts": LISTS,
    "src/feature/main.ts": 'import { tiny } from "./tiny.js";\nimport { shared } from "./shared.js";\nimport { LIMIT } from "./limit.constants.js";\nexport const total = tiny + shared + LIMIT;\n',
    "src/feature/other.ts": 'import { shared } from "./shared.js";\nexport const twice = shared * 2;\n',
    "src/feature/tiny.ts": "export const tiny = 1;\n",
    "src/feature/shared.ts": "export const shared = 2;\n",
    "src/feature/limit.constants.ts": "export const LIMIT = 3;\n",
  });
  const architecture = defineArchitecture({
    projects: { tsconfigs: ["tsconfig.json"] },
    rules,
    layers: {
      domain: { description: "Domain", files: ["src/domain/**"], entry: { reason: "Exercised directly." } },
      feature: { description: "Feature", files: ["src/feature/**"], dependencies: { internal: ["feature"] } },
    },
  });
  const opened = openFixtureProjects(root, architecture);
  const { files } = inventory(root, architecture, opened.sources);
  const imports = analyzeImports(root, files, opened.projects);
  return programFindings({ architecture, files, selected: files, projects: opened.projects, imports });
};

const summary = (findings: ReturnType<typeof fixture>, ruleId: string): readonly string[] => {
  return findings.filter((finding) => finding.ruleId === ruleId).map((finding) => `${finding.file}:${finding.line ?? 0} ${finding.severity}`);
};

describe("program checks", () => {
  it("reports error branches that become empty values, by type, not by name", () => {
    expect(summary(fixture(), "no-discarded-errors")).toEqual([
      "src/domain/discards.ts:4 error",
      "src/domain/discards.ts:8 error",
      "src/domain/discards.ts:19 error",
      "src/domain/discards.ts:20 error",
    ]);
  });

  it("reports literal lists that satisfy a union but leave members out", () => {
    const findings = fixture().filter((finding) => finding.ruleId === "exhaustive-literal-lists");
    expect(findings.map((finding) => `${finding.file}:${finding.line ?? 0}`)).toEqual(["src/domain/lists.ts:3", "src/domain/lists.ts:5"]);
    expect(findings.at(0)?.message).toContain('leaves out "archived"');
  });

  it("warns about a tiny file that only one neighbour imports, and skips constants and shared files", () => {
    expect(summary(fixture(), "min-file-substance")).toEqual(["src/feature/tiny.ts:1 warning"]);
  });

  it("reports a directory over its limits once, at the higher severity", () => {
    const overError = fixture({ "max-directory-files": ["error", { max: 4 }], "max-directory-files-warn": ["warn", { max: 2 }] });
    expect(summary(overError, "max-directory-files")).toEqual(["src/feature/:0 error"]);
    expect(summary(overError, "max-directory-files-warn")).toEqual(["src/domain/:0 warning"]);
  });

  it("leaves a rule's findings out when it is off", () => {
    expect(summary(fixture({ "no-discarded-errors": "off" }), "no-discarded-errors")).toEqual([]);
  });
});
