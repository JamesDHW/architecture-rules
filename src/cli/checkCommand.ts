import { existsSync, writeFileSync } from "node:fs";

import { EXIT_AGENT } from "../baseline/gates.constants.js";
import { failureCodes, judge, type Verdict } from "../baseline/judge.js";
import { ArchitectureError } from "../errors/architectureError.js";
import { tryCatch } from "../errors/tryCatch.js";
import { withFindings, type CheckResult } from "../runner/checkResult.js";
import { renderOutput } from "../runner/output.js";
import type { RunArgs } from "./cliArgs.js";
import { gateReport } from "./gateReport.js";
import { inspectProject, selectedFiles } from "./inspectProject.js";
import { layerFindings, unknownLayers } from "./layerScope.js";
import { renderSummary } from "./renderSummary.js";
import { withinFixDistance } from "./fixDistance.js";

const existing = (paths: readonly string[] | undefined): readonly string[] | undefined => paths?.filter((path) => existsSync(path));

/** Narrows the verdict's findings to what check <layer> or --fixable-in asked for. */
const scoped = (args: RunArgs, verdict: Verdict): Verdict | ArchitectureError => {
  const { result } = verdict;
  const unknown = unknownLayers(result.architecture, args.layers ?? []);
  if (unknown.length > 0) return new ArchitectureError([`Unknown layer: ${unknown.join(", ")}`]);
  const inLayers = args.layers === undefined ? result.findings : layerFindings(result, args.layers, args.incoming === true);
  const near = args.fixableIn === undefined ? inLayers : withinFixDistance(inLayers, args.fixableIn);
  return { ...verdict, result: withFindings(result, near) };
};

const exitCode = (args: RunArgs, verdict: Verdict): number => {
  const [first] = failureCodes(verdict, args.ci === true);
  const isObserving = verdict.result.architecture.adoption.mode === "observe";
  const passes = first === undefined || isObserving;
  if (passes) return 0;
  return args.format === "agent" ? EXIT_AGENT : first;
};

const write = (args: RunArgs, root: string, verdict: Verdict): undefined | ArchitectureError => {
  const { summary } = args;
  if (summary === undefined) return undefined;
  const written = tryCatch(() => {
    writeFileSync(summary, renderSummary(verdict));
  });
  return written instanceof ArchitectureError ? written : undefined;
};

/**
 * An agent's edits are the working tree's changes, so agent format judges them unless told otherwise. Outside git,
 * nothing counts as touched.
 */
const judgeCheck = (args: RunArgs, root: string, result: CheckResult): Verdict | ArchitectureError => {
  const options = { write: true, ...(args.ci === true ? { ci: true } : {}) };
  if (args.change !== undefined) return judge(root, result, { ...options, change: args.change });
  if (args.format !== "agent") return judge(root, result, options);
  const inWorktree = judge(root, result, { ...options, change: { kind: "worktree" } });
  return inWorktree instanceof ArchitectureError ? judge(root, result, options) : inWorktree;
};

/** Agent output goes to stderr: hooks show an agent what a failing command wrote there. */
const print = (args: RunArgs, text: string): void => {
  const stream = args.format === "agent" ? process.stderr : process.stdout;
  stream.write(text);
};

/**
 * The check: every finding compared with the baseline, the baseline pruned of fixed debt (outside CI), and the exit
 * code of the first gate that fails.
 */
export const checkCommand = async (args: RunArgs): Promise<number | ArchitectureError> => {
  // An agent hook passes whatever file was edited, which may not exist any more or may not be source.
  const isAgent = args.format === "agent";
  const selection = selectedFiles(isAgent ? existing(args.files) : args.files);
  if (selection instanceof ArchitectureError) return selection;
  const inspected = await inspectProject(args.target, args.config, { fix: args.fix, ...selection, ...(isAgent ? { ignoreUnknownFiles: true } : {}) });
  if (inspected instanceof ArchitectureError) return inspected;
  const { root, result } = inspected;
  const verdict = judgeCheck(args, root, result);
  if (verdict instanceof ArchitectureError) return verdict;
  const narrowed = scoped(args, verdict);
  if (narrowed instanceof ArchitectureError) return narrowed;
  const summaryWritten = write(args, root, narrowed);
  if (summaryWritten instanceof ArchitectureError) return summaryWritten;
  print(args, renderOutput(root, narrowed.result, args.format ?? "text", gateReport(narrowed, args)));
  return exitCode(args, narrowed);
};
