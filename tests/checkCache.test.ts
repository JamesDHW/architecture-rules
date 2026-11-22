import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { isRecord } from "../src/core/guards.js";
import { run } from "./utils/cliFixtures.js";
import { writeFiles } from "./utils/fixtures.js";
import { debtFixture } from "./utils/gitFixture.js";

const findingsIn = (stdout: string): unknown => {
  const parsed: unknown = JSON.parse(stdout);
  return isRecord(parsed) ? parsed.findings : undefined;
};

const cachedRoot = (): string => {
  const root = debtFixture();
  mkdirSync(join(root, "node_modules"));
  writeFiles(root, {
    "src/domain/limit.ts": "export const limit: number = 1;\n",
    "src/ui/view.ts": "import { shape } from \"../domain/shape.js\";\nimport { limit } from \"../domain/limit.js\";\n\nexport const view = `${shape} view`;\nexport const doubled: number = limit * 2;\n",
  });
  return root;
};

describe("analysis cache", { timeout: 60_000 }, () => {
  it("returns the same findings from the cache as from a fresh check", () => {
    const root = cachedRoot();
    const fresh = run(["--json"], root);
    expect(existsSync(join(root, "node_modules/.cache/architecture-rules/check.json"))).toBe(true);
    const cached = run(["--json"], root);
    expect(findingsIn(cached.stdout)).toEqual(findingsIn(fresh.stdout));
  });
  it("checks a file again when a file it imports changes, even though the file itself did not", () => {
    const root = cachedRoot();
    expect(run([], root).status).toBe(1);
    writeFiles(root, { "src/domain/limit.ts": "export const limit: string = \"one\";\n" });
    const changed = run(["--json"], root);
    expect(findingsIn(changed.stdout)).toEqual(expect.arrayContaining([expect.objectContaining({ file: "src/ui/view.ts", source: "compiler" })]));
    writeFiles(root, { "src/domain/limit.ts": "export const limit: number = 1;\n" });
    expect(findingsIn(run(["--json"], root).stdout)).toEqual(findingsIn(run(["--json"], root).stdout));
  });
});
