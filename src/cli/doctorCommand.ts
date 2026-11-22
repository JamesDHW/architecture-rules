import { existingBaselines } from "../baseline/baselineFile.js";
import { judge } from "../baseline/judge.js";
import { ArchitectureError } from "../errors/architectureError.js";
import { isBlocking, type Finding } from "../runner/findings.js";
import { inspectProject } from "./inspectProject.js";

type DoctorArgs = { readonly target: string; readonly config?: string };

type Check = { readonly name: string; readonly passed: boolean; readonly detail?: string };

const isStructural = (finding: Finding): boolean => finding.source === "structure" && isBlocking(finding);

const check = (name: string, passed: boolean, detail?: string): Check => ({ name, passed, ...(detail === undefined ? {} : { detail }) });

const line = ({ name, passed, detail }: Check): string => `${passed ? "✓" : "✗"} ${name}${detail === undefined ? "" : `: ${detail}`}`;

/** A baseline is needed only when there is debt to record. */
const baselineCheck = (exists: boolean, blocking: number): Check => {
  if (exists) return check("a baseline exists", true);
  return blocking === 0 ? check("a baseline exists", true, "not needed: nothing to record") : check("a baseline exists", false, "architecture-check baseline");
};

/**
 * architecture-check doctor: whether adoption is complete. The configuration loads, every file is classified, entry
 * points are declared, the baseline exists and is current (no new errors, no fixed debt still listed), and the
 * rules are enforced rather than observed. Exit 0 means done.
 */
export const doctorCommand = async (args: DoctorArgs): Promise<number | ArchitectureError> => {
  const inspected = await inspectProject(args.target, args.config);
  if (inspected instanceof ArchitectureError) {
    process.stdout.write(`${line(check("configuration loads", false, inspected.issues.join("; ")))}\n`);
    return 1;
  }
  const { root, result } = inspected;
  const verdict = judge(root, result, { write: false });
  if (verdict instanceof ArchitectureError) return verdict;
  const structural = result.findings.filter(isStructural);
  const unclassified = structural.filter((finding) => finding.ruleId === "file-classification").length;
  const entries = Object.entries(result.architecture.layers).filter(([, layer]) => layer.policy.entry !== undefined).map(([name]) => name);
  const blocking = verdict.result.findings.filter(isBlocking).length;
  const checks = [
    check("configuration loads", true),
    check("every file is classified", unclassified === 0, unclassified === 0 ? undefined : `${unclassified} files match no layer or several (architecture-check map)`),
    check("no other structural findings", structural.length === unclassified, structural.length === unclassified ? undefined : `${structural.length - unclassified} (architecture-check)`),
    check("entry points are declared", entries.length > 0, entries.length > 0 ? entries.join(", ") : "mark the layers something outside the program loads with entry"),
    baselineCheck(existingBaselines(root, result.workspaces).length > 0, blocking),
    check("no errors outside the baseline", blocking === 0, blocking === 0 ? undefined : `${blocking} (architecture-check)`),
    check("the baseline lists no fixed debt", verdict.stale.length === 0, verdict.stale.length === 0 ? undefined : `${verdict.stale.length} entries (architecture-check baseline)`),
    check("the rules are enforced", result.architecture.adoption.mode === "enforce", result.architecture.adoption.mode === "enforce" ? undefined : "remove adoption.mode: \"observe\""),
  ];
  const passed = checks.every((entry) => entry.passed);
  process.stdout.write(`${[...checks.map(line), "", passed ? "Adoption is complete." : "Adoption is not complete yet."].join("\n")}\n`);
  return passed ? 0 : 1;
};
