import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

import { isRecord, isUnknownArray } from "../src/core/guards.js";
import { run } from "./utils/cliFixtures.js";
import { temporaryRoot, tsconfigJson, writeFiles } from "./utils/fixtures.js";
import { commitAll, gitIn } from "./utils/gitFixture.js";

const packageEntry = JSON.stringify(pathToFileURL(resolve("dist/index.js")).href);

const config = (domainRules = "{}") => `import { defineArchitecture } from ${packageEntry};
export default defineArchitecture({
  projects: { tsconfigs: ["tsconfig.json"] },
  glossaries: {
    sales: { terms: { Customer: { definition: "Someone who has placed an order.", avoid: ["client"], type: "Customer" } } },
  },
  layers: {
    domain: {
      description: "Domain", files: ["src/domain/**/*.ts"], glossary: "sales", rules: ${domainRules},
      entry: { reason: "Fixture.", exports: "all" }, dependencies: { internal: ["domain"] },
    },
  },
});`;

const fixture = (domainRules?: string): string => {
  const root = temporaryRoot("architecture-glossary-");
  writeFiles(root, {
    "package.json": JSON.stringify({ name: "fixture", private: true, type: "module" }),
    "tsconfig.json": tsconfigJson({ module: "ESNext", moduleResolution: "Bundler", target: "ES2022" }, { include: ["src/**/*.ts"] }),
    "architecture.config.ts": config(domainRules),
    "src/domain/customer.ts": "export type Customer = { readonly id: string };\n",
    "src/domain/lookup.ts": [
      "import type { Customer } from \"./customer.js\";",
      "",
      "export const firstClient = (customers: readonly Customer[]): Customer | undefined => customers.at(0);",
      "// architecture-disable-next-line glossary-types -- The id arrives before the customer is loaded.",
      "export const customer: string = \"pending\";",
      "",
    ].join("\n"),
  });
  return root;
};

type Reported = { readonly source: unknown; readonly ruleId: unknown; readonly line: unknown; readonly column: unknown; readonly severity: unknown };

const reported = (stdout: string): readonly Reported[] => {
  const parsed: unknown = JSON.parse(stdout);
  const list = isRecord(parsed) ? parsed.findings : undefined;
  const findings = isUnknownArray(list) ? list : [];
  return findings.filter(isRecord).map(({ source, ruleId, line, column, severity }) => ({ source, ruleId, line, column, severity }));
};

describe("glossary checks in a project", { timeout: 60_000 }, () => {
  it("reports names at their position, honours line exceptions, and gives the same findings from the cache", () => {
    const root = fixture();
    const fresh = run(["--json"], root);
    expect(fresh.status).toBe(1);
    expect(reported(fresh.stdout)).toEqual([{ source: "glossary", ruleId: "glossary-aliases", line: 3, column: 14, severity: "error" }]);
    expect(reported(run(["--json"], root).stdout)).toEqual(reported(fresh.stdout));
  });

  it("uses the severity the layer gives the rule", () => {
    const root = fixture(`{ "glossary-aliases": { severity: "warn", reason: "The rename is scheduled." } }`);
    const result = run(["--json"], root);
    expect(result.status).toBe(0);
    expect(reported(result.stdout)).toEqual([expect.objectContaining({ ruleId: "glossary-aliases", severity: "warning" })]);
  });

  it("records existing glossary errors in the baseline, so only new ones fail", () => {
    const root = fixture();
    gitIn(root, ["init", "-q"]);
    commitAll(root, "fixture");
    expect(run(["baseline"], root).status).toBe(0);
    commitAll(root, "baseline");
    expect(run([], root).status).toBe(0);
    writeFiles(root, { "src/domain/more.ts": "export const clients: readonly string[] = [];\n" });
    expect(run([], root).status).toBe(1);
  });
});
