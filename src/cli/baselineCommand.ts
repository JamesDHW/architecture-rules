import { RULE_BASELINE_REASON } from "../baseline/baseline.constants.js";
import { existingBaselines, readBaseline, writeBaseline, type Baseline } from "../baseline/baselineFile.js";
import { recordedTotal } from "../baseline/growth.js";
import { accept, ratchet, type Accepted } from "../baseline/ratchet.js";
import type { CheckResult } from "../runner/checkResult.js";
import { ArchitectureError } from "../errors/architectureError.js";
import { ruleById } from "./ruleCatalogue.js";
import { inspectProject } from "./inspectProject.js";

type BaselineArgs = { readonly target: string; readonly config?: string; readonly accept: boolean; readonly rules: readonly string[]; readonly reason?: string };

const everyFile = (): boolean => true;

const unknownRules = (ids: readonly string[]): readonly string[] => ids.filter((id) => ruleById(id) === undefined);

const report = (lines: readonly string[]): number => {
  process.stdout.write(`${lines.join("\n")}\n`);
  return 0;
};

/** Whether this run records new debt: the first baseline, --accept, or --rule. */
type Mode = { readonly adding: boolean; readonly reason?: string; readonly rules?: ReadonlySet<string> };

const acceptOptions = (mode: Mode): { readonly reason?: string; readonly rules?: ReadonlySet<string> } => ({
  ...(mode.reason === undefined ? {} : { reason: mode.reason }),
  ...(mode.rules === undefined ? {} : { rules: mode.rules }),
});

/** Without anything to add, the command only removes fixed debt, as a check would. */
const pruneOnly = (result: CheckResult, recorded: Baseline): Accepted => {
  const pruned = ratchet({ findings: result.findings, baseline: recorded, adoption: result.architecture.adoption, inScope: everyFile });
  return { baseline: pruned.baseline, added: [] };
};

const modeOf = (args: BaselineArgs, hasBaseline: boolean): Mode => {
  if (args.rules.length > 0) return { adding: true, reason: args.reason ?? RULE_BASELINE_REASON, rules: new Set(args.rules) };
  if (args.accept) return { adding: true, ...(args.reason === undefined ? {} : { reason: args.reason }) };
  return { adding: !hasBaseline };
};

/**
 * architecture-check baseline: records today's errors as debt the first time, then only removes fixed debt. Growth
 * needs --accept with a reason; --rule records just one newly enabled rule's findings.
 */
export const baselineCommand = async (args: BaselineArgs): Promise<number | ArchitectureError> => {
  const unknown = unknownRules(args.rules);
  if (unknown.length > 0) return new ArchitectureError([`Unknown rule: ${unknown.join(", ")}`]);
  const inspected = await inspectProject(args.target, args.config);
  if (inspected instanceof ArchitectureError) return inspected;
  const { root, result } = inspected;
  if (!result.complete) {
    return new ArchitectureError(["Structural findings stopped the check, so nothing can be recorded. Fix them first: architecture-check map lists unclassified files."]);
  }
  const hasBaseline = existingBaselines(root, result.workspaces).length > 0;
  const recorded = readBaseline(root, result.workspaces);
  if (recorded instanceof ArchitectureError) return recorded;
  const mode = modeOf(args, hasBaseline);
  const next = mode.adding ? accept({ findings: result.findings, baseline: recorded, inScope: everyFile, ...acceptOptions(mode) }) : pruneOnly(result, recorded);
  const written = writeBaseline(root, result.workspaces, next.baseline);
  if (written instanceof ArchitectureError) return written;
  const remaining = mode.adding ? 0 : ratchet({ findings: result.findings, baseline: next.baseline, adoption: result.architecture.adoption, inScope: everyFile })
    .findings.filter((finding) => finding.status === "new").length;
  return report([
    `Recorded ${recordedTotal(next.baseline)} errors${next.added.length === 0 ? "" : `, ${next.added.reduce((total, entry) => total + entry.count, 0)} of them added now`}.`,
    ...(written.length === 0 ? ["No baseline file changed."] : [`Wrote ${written.join(", ")}.`]),
    ...(remaining === 0 ? [] : [`${remaining} new errors are not recorded: fix them, or record them with --accept --reason <why>.`]),
  ]);
};
