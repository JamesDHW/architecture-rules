import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import { createRequire } from "node:module";
import { defineArchitecture } from "../src/core/defineArchitecture.js";
import { compileOxlintConfig } from "../src/architecture/compileOxlintConfig.js";
import { buildTsconfig } from "../src/generateTsconfig.js";

const roots: string[] = [];
const rootFixture = (body = "export const value = 1;") => {
  const root = mkdtempSync(join(tmpdir(), "architecture-cli-")); roots.push(root);
  mkdirSync(join(root, "src"));
  writeFileSync(join(root, "src/abc.ts"), body);
  writeFileSync(join(root, "tsconfig.json"), JSON.stringify({ compilerOptions: { ...buildTsconfig().compilerOptions, module: "ESNext", moduleResolution: "Bundler", target: "ES2022" }, include: ["src/**/*.ts"] }));
  writeFileSync(join(root, "architecture.config.ts"), `import { defineArchitecture } from ${JSON.stringify(pathToFileURL(resolve("dist/index.js")).href)};
    export default defineArchitecture({
      projects: { tsconfigs: ["tsconfig.json"] },
      files: { otherFiles: ["tsconfig.json"], toolingFiles: ["architecture.config.ts"] },
      defaults: { naming: { case: "pascal" } },
      fileTypes: { app: { description: "App", files: ["src/**/*.ts"] } },
    });`);
  return root;
};
const run = (args: readonly string[], cwd: string) => spawnSync(process.execPath, [resolve("dist/cli.js"), ...args], { cwd, encoding: "utf8", maxBuffer: 8 * 1024 * 1024 });
afterEach(() => { for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true }); });

describe("packaged CLI", () => {
  it("requires configuration rather than falling back to lint", () => {
    const root = mkdtempSync(join(tmpdir(), "architecture-empty-")); roots.push(root);
    const result = run([], root);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Required architecture configuration not found");
  });
  it("explains a file relative to the explicit config root from another cwd", () => {
    const root = rootFixture();
    const result = run(["explain", "src/abc.ts", "--config", join(root, "architecture.config.ts")], dirname(root));
    expect(result.status, result.stderr).toBe(0);
    const explained = JSON.parse(result.stdout);
    expect(explained.file).toBe("src/abc.ts");
    expect(explained.matchingTypes[0].name).toBe("app");
    expect(explained.policy.naming).toEqual({ case: "pascal" });
  });
  it("fails inventory before --fix can modify source", () => {
    const root = rootFixture(); writeFileSync(join(root, "unexpected.js"), "export {};");
    const result = run(["--fix"], root);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("project-membership");
    expect(readdirSync(root).some((file) => file.startsWith(".architecture-run-"))).toBe(false);
  });
  it("rejects broad suppression before invoking lint", () => {
    const root = rootFixture("/* oxlint-disable */\nexport const value = 1;");
    const result = run([], root);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("reasoned-suppressions");
  });
  it("passes exact absolute selectors to native Oxlint, including glob metacharacters", () => {
    const root = mkdtempSync(join(tmpdir(), "architecture[glob]-")); roots.push(root);
    mkdirSync(join(root, "src"));
    const path = join(root, "src", "[slug].ts");
    writeFileSync(path, "debugger;");
    const architecture = defineArchitecture({ projects: { tsconfigs: ["tsconfig.json"] }, fileTypes: { app: { description: "App", files: ["src/**"] } } });
    const config = compileOxlintConfig([{ path, relative: "src/[slug].ts", type: "app", policy: architecture.fileTypes.app!.policy }], []);
    // Isolate glob behavior from this VM's unavailable large JS-plugin allocator.
    mkdirSync(join(root, ".run"));
    const configPath = join(root, ".run", "oxlint.json");
    writeFileSync(configPath, JSON.stringify({ categories: { correctness: "off" }, plugins: ["eslint"], overrides: config.overrides?.map((entry) => ({ files: entry.files, rules: { "no-debugger": "error" } })) }));
    const require = createRequire(import.meta.url);
    const binary = join(dirname(require.resolve("oxlint/package.json")), "bin/oxlint");
    const result = spawnSync(process.execPath, [binary, "--config", configPath, "--no-ignore", path], { cwd: root, encoding: "utf8" });
    expect(result.status, result.stderr).toBe(1);
    expect(result.stdout).toContain("no-debugger");
  });
  it.runIf(process.env.ARCHITECTURE_NATIVE_TESTS === "1")("reports Pascal naming through the actual Oxlint runner", () => {
    const root = rootFixture();
    const result = run([], root);
    expect(result.status).toBe(1);
    expect(result.stdout + result.stderr).toContain("pascal");
    expect(result.stdout + result.stderr).toContain("file-naming");
    expect(readdirSync(root).some((file) => file.startsWith(".architecture-run-"))).toBe(false);
  });
});
