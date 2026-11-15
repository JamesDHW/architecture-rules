import { spawn, spawnSync } from "node:child_process";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

import { fileDiagnostics } from "../src/editor/diagnostics.js";
import { frame, parseMessages, type IncomingMessage } from "../src/editor/protocol.js";
import { isRecord, isString, isUnknownArray } from "../src/core/guards.js";
import { ArchitectureError } from "../src/errors/architectureError.js";
import type { Finding } from "../src/runner/findings.js";
import { temporaryRoot, tsconfigJson, writeFiles } from "./utils/fixtures.js";

describe("editor protocol", () => {
  it("frames messages and parses them back, keeping an incomplete tail", () => {
    const framed = frame({ id: 1, method: "initialize", params: { rootUri: "file:///project" } }) + frame({ method: "initialized" });
    const whole = Buffer.from(framed, "utf8");
    const parsed = parseMessages(Buffer.concat([whole, whole.subarray(0, 10)]));
    if (parsed instanceof ArchitectureError) return expect.unreachable(parsed.message);
    expect(parsed.messages).toEqual([{ id: 1, method: "initialize", params: { rootUri: "file:///project" } }, { method: "initialized" }]);
    expect(parsed.rest.length).toBe(10);
  });
});

describe("editor diagnostics", () => {
  const finding: Finding = { source: "lint", severity: "warning", ruleId: "no-let", file: "src/app.ts", line: 3, column: 5, message: "Declare this with const." };

  it("carries the finding's rule, message and severity at its position, and clears files that became clean", () => {
    const [published, cleared] = fileDiagnostics("/project", [finding], new Set(["file:///project/src/old.ts"]));
    expect(published).toMatchObject({
      uri: "file:///project/src/app.ts",
      diagnostics: [{
        range: { start: { line: 2, character: 4 }, end: { line: 2, character: 4 } },
        severity: 2,
        code: "no-let",
        source: "architecture",
        message: "Declare this with const.",
      }],
    });
    expect(published?.diagnostics.at(0)?.codeDescription?.href).toMatch(/docs\/rules\/no-let\.md$/);
    expect(cleared).toEqual({ uri: "file:///project/src/old.ts", diagnostics: [] });
  });
});

type Published = {
  readonly uri: string;
  readonly diagnostics: readonly { readonly code: string; readonly message: string; readonly severity: number; readonly range: { readonly start: { readonly line: number } } }[];
};

const isPublished = (value: IncomingMessage): boolean => value.method === "textDocument/publishDiagnostics";

const publishedParams = (message: IncomingMessage): readonly Published[] => {
  const { params } = message;
  const isPublishedParams = isRecord(params) && isString(params.uri) && isUnknownArray(params.diagnostics);
  // architecture-disable-next-line no-type-assertions -- The server under test built these diagnostics; the shape is checked above.
  return isPublishedParams ? [params as unknown as Published] : [];
};

/** Reads the server's output until the expected file's diagnostics arrive, re-parsing everything received so far. */
const readUntil = async (output: AsyncIterator<unknown>, expectedUri: string, received: Buffer): Promise<readonly Published[]> => {
  const next = await output.next();
  const chunk = Buffer.isBuffer(next.value) ? next.value : Buffer.alloc(0);
  const all = Buffer.concat([received, chunk]);
  const parsed = parseMessages(all);
  if (parsed instanceof ArchitectureError) return expect.unreachable(parsed.message);
  const published = parsed.messages.filter(isPublished).flatMap(publishedParams);
  const isComplete = next.done === true || published.some((file) => file.uri === expectedUri);
  return isComplete ? published : readUntil(output, expectedUri, all);
};

/** Starts the server, initializes it on root, and collects published diagnostics until the expected file has some. */
const serverDiagnostics = async (root: string, expectedUri: string): Promise<readonly Published[]> => {
  const server = spawn(process.execPath, [resolve("dist/cli.js"), "lsp"], { cwd: root, stdio: ["pipe", "pipe", "inherit"] });
  server.stdin.write(frame({ id: 1, method: "initialize", params: { rootUri: pathToFileURL(root).href } }));
  server.stdin.write(frame({ method: "initialized", params: {} }));
  const published = await readUntil(server.stdout[Symbol.asyncIterator](), expectedUri, Buffer.alloc(0));
  server.stdin.end(frame({ method: "exit" }));
  return published;
};

const isFinding = (value: unknown): value is Finding => isRecord(value) && isString(value.ruleId) && isString(value.file) && isString(value.message);

const cliFindings = (stdout: string): readonly Finding[] => {
  const parsed: unknown = JSON.parse(stdout);
  const findings = isRecord(parsed) ? parsed.findings : undefined;
  return isUnknownArray(findings) ? findings.filter(isFinding) : [];
};

describe.runIf(process.env.ARCHITECTURE_NATIVE_TESTS === "1")("language server", () => {
  it("publishes exactly the findings the CLI prints", async () => {
    const root = temporaryRoot("architecture-editor-");
    writeFiles(root, {
      "package.json": JSON.stringify({ name: "fixture", private: true, type: "module" }),
      "tsconfig.json": tsconfigJson({ module: "ESNext", moduleResolution: "Bundler", target: "ES2022" }, { include: ["src/**/*.ts"] }),
      "src/app.ts": "let count = 1;\ncount += 1;\nexport const value = count;\nexport const unused = 2;\n",
      "architecture.config.ts": `import { defineArchitecture } from ${JSON.stringify(pathToFileURL(resolve("dist/index.js")).href)};
export default defineArchitecture({
  projects: { tsconfigs: ["tsconfig.json"] },
  layers: { app: { description: "App", files: ["src/**"], entry: { reason: "Started by the fixture.", exports: ["value"] } } },
});`,
    });
    const cli = spawnSync(process.execPath, [resolve("dist/cli.js"), "--json"], { cwd: root, encoding: "utf8" });
    const findings = cliFindings(cli.stdout);
    expect(findings.length).toBeGreaterThan(1);
    const published = await serverDiagnostics(root, pathToFileURL(join(root, "src/app.ts")).href);
    const fromServer = published.flatMap((file) => file.diagnostics.map((diagnostic) => [file.uri, diagnostic.code, diagnostic.message, diagnostic.severity, diagnostic.range.start.line]));
    const fromCli = findings.map((finding) => [pathToFileURL(join(root, finding.file)).href, finding.ruleId, finding.message, finding.severity === "error" ? 1 : 2, (finding.line ?? 1) - 1]);
    expect(fromServer.toSorted()).toEqual(fromCli.toSorted());
  });
});
