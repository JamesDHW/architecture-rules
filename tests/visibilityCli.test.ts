import { describe, expect, it } from "vitest";

import { isRecord } from "../src/core/guards.js";
import { run } from "./utils/cliFixtures.js";
import { writeFiles } from "./utils/fixtures.js";
import { commitAll, debtFixture, readText } from "./utils/gitFixture.js";

const parse = (text: string): unknown => JSON.parse(text);

describe("visibility commands", { timeout: 30_000 }, () => {
  it("checks one layer, or the imports into it from other layers", () => {
    const root = debtFixture();
    const owned = run(["check", "ui", "--json"], root);
    expect(owned.status).toBe(0);
    expect(parse(owned.stdout)).toMatchObject({ findings: [] });
    const incoming = run(["check", "ui", "--incoming", "--json"], root);
    expect(parse(incoming.stdout)).toMatchObject({ findings: [expect.objectContaining({ file: "src/domain/model.ts", ruleId: "allowed-imports" })] });
    expect(run(["check", "nowhere"], root).stderr).toContain("Unknown layer: nowhere");
  });
  it("summarises compliance and recorded debt per layer", () => {
    const root = debtFixture();
    expect(run(["baseline"], root).status).toBe(0);
    commitAll(root, "baseline");
    const status = run(["status", "--json"], root);
    expect(status.status, status.stderr).toBe(0);
    expect(parse(status.stdout)).toMatchObject({
      layers: [
        { layer: "domain", files: 2, compliant: 1, new: 0, recorded: 2, recordedByRule: [{ rule: "allowed-imports", count: 1 }, { rule: "no-let", count: 1 }] },
        { layer: "ui", files: 2, compliant: 2, recorded: 0 },
      ],
      total: { files: 4, recorded: 2 },
    });
    expect(run(["status", "--since", "HEAD"], root).stdout).toContain("2 (±0)");
  });
  it("draws the architecture: allowed and used, allowed and unused, and denied with a count", () => {
    const root = debtFixture();
    const graph = run(["graph", "--format", "json"], root);
    expect(graph.status, graph.stderr).toBe(0);
    expect(parse(graph.stdout)).toMatchObject({ edges: [{ from: "ui", to: "domain", state: "used" }, { from: "domain", to: "ui", state: "violating", count: 1 }] });
    const text = run(["graph"], root).stdout;
    expect(text).toContain("domain  → (none)     ✗ ui (1)");
    expect(run(["graph", "--format", "mermaid"], root).stdout).toContain("flowchart LR");
    expect(run(["graph", "--format", "dot"], root).stdout).toContain("\"domain\" -> \"ui\" [color=red");
    expect(run(["graph", "--layer", "domain", "--format", "json"], root).stdout).toContain("\"kind\": \"directory\"");
  });
  it("maps files to layers and fails while one has none", () => {
    const root = debtFixture();
    expect(run(["map"], root).stdout).toContain("✓ 4 files, all classified");
    writeFiles(root, { "src/stray.ts": "export const stray = 1;\n" });
    const stray = run(["map", "--json"], root);
    expect(stray.status).toBe(1);
    expect(parse(stray.stdout)).toMatchObject({ unclassified: [{ file: "src/stray.ts", problem: "Source matches no layer." }] });
  });
  it("lists every rule, explains one, and says which an automatic fix covers", () => {
    const catalogue = run(["rules", "--json"], ".");
    expect(catalogue.status).toBe(0);
    const parsed = parse(catalogue.stdout);
    const entries = isRecord(parsed) ? parsed.rules : undefined;
    expect(entries).toEqual(expect.arrayContaining([expect.objectContaining({ id: "file-naming", autofix: { lintFix: false, command: "architecture-check fix --rule file-naming" } })]));
    const explained = run(["explain", "no-let"], ".");
    expect(explained.status).toBe(0);
    expect(explained.stdout).toContain("no-let · lint");
    expect(explained.stdout).toContain("Instead:");
  });
  it("filters to files a few errors from compliant", () => {
    const root = debtFixture();
    writeFiles(root, { "src/ui/counter.ts": "export const counter = (): number => {\n  let count = 1;\n  count += 1;\n  return count;\n};\n" });
    const near = run(["--fixable-in", "1", "--json"], root);
    expect(parse(near.stdout)).toMatchObject({ findings: [expect.objectContaining({ file: "src/ui/counter.ts" })] });
  });
  it("prints the adoption prompt and the agent snippet", () => {
    expect(run(["adopt", "--prompt"], ".").stdout).toContain("architecture-check doctor");
    expect(run(["adopt", "--agent-snippet"], ".").stdout).toContain("architecture-check --worktree");
  });
  it("reports adoption as complete only with a current baseline and enforcement", () => {
    const root = debtFixture();
    const before = run(["doctor"], root);
    expect(before.status).toBe(1);
    expect(before.stdout).toContain("✗ no errors outside the baseline");
    expect(run(["baseline"], root).status).toBe(0);
    const after = run(["doctor"], root);
    expect(after.status, after.stdout).toBe(0);
    expect(after.stdout).toContain("Adoption is complete.");
  });
  it("renames files to the naming case and updates their imports and the baseline", () => {
    const root = debtFixture();
    writeFiles(root, {
      "src/domain/order-lines.ts": "export const orderLines = 1;\n",
      "src/ui/view.ts": "import { shape } from \"../domain/shape.js\";\nimport { orderLines } from \"../domain/order-lines.js\";\n\nexport const view = `${shape} ${orderLines}`;\n",
    });
    commitAll(root, "kebab file");
    expect(run(["baseline"], root).status).toBe(0);
    const fixed = run(["fix", "--rule", "file-naming"], root);
    expect(fixed.status, fixed.stderr).toBe(0);
    expect(fixed.stdout).toContain("renamed  src/domain/order-lines.ts → src/domain/orderLines.ts");
    expect(readText(root, "src/ui/view.ts")).toContain("\"../domain/orderLines.js\"");
    expect(readText(root, "architecture.baseline.json")).not.toContain("order-lines");
    expect(run([], root).status).toBe(0);
    expect(run(["fix", "--rule", "no-let"], root).stderr).toContain("supports file-naming and no-deep-relative-imports");
  });
  it("rewrites deep relative imports through a path alias", () => {
    const root = debtFixture();
    writeFiles(root, {
      "tsconfig.json": readText(root, "tsconfig.json").replace("\"compilerOptions\":{", "\"compilerOptions\":{\"paths\":{\"@domain/*\":[\"./src/domain/*\"]},"),
      "src/ui/deep/a/b/far.ts": "import { shape } from \"../../../../domain/shape.js\";\n\nexport const far = shape;\n",
    });
    const fixed = run(["fix", "--rule", "no-deep-relative-imports"], root);
    expect(fixed.status, fixed.stderr).toBe(0);
    expect(fixed.stdout).toContain("1 imports now use a path alias.");
    expect(readText(root, "src/ui/deep/a/b/far.ts")).toContain("from \"@domain/shape.js\"");
    expect(run(["fix", "--rule", "no-deep-relative-imports"], root).stdout).toContain("0 imports now use a path alias.");
  });
});
