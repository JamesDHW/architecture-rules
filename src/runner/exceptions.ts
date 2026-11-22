import type { LineException } from "../analysis/suppressions.js";
import type { Finding } from "./findings.js";

/** Lint, dead-code and glossary findings can be excepted on a line; structural and compiler findings cannot. */
const isExceptableFinding = (finding: Finding): boolean => finding.source === "lint" || finding.source === "dead-code" || finding.source === "glossary";

const covers = (exception: LineException, ruleId: string) => (finding: Finding): boolean => {
  return finding.file === exception.file && finding.line === exception.target && finding.ruleId === ruleId && isExceptableFinding(finding);
};

const isExcepted = (exceptions: readonly LineException[]) => (finding: Finding): boolean => {
  return exceptions.some((exception) => exception.rules.some((ruleId) => covers(exception, ruleId)(finding)));
};

const unusedFinding = (exception: LineException, ruleId: string): Finding => ({
  source: "structure",
  severity: "error",
  ruleId: "reasoned-suppressions",
  file: exception.file,
  line: exception.line,
  message: `Unused exception: line ${exception.target} has no ${ruleId} finding. Remove ${ruleId} from the exception.`,
});

/** Drops the findings line exceptions cover, and reports every exception rule that covered nothing. */
export const applyExceptions = (findings: readonly Finding[], exceptions: readonly LineException[]): readonly Finding[] => {
  const unused = exceptions.flatMap((exception) => exception.rules
    .filter((ruleId) => !findings.some(covers(exception, ruleId)))
    .map((ruleId) => unusedFinding(exception, ruleId)));
  return [...findings.filter((finding) => !isExcepted(exceptions)(finding)), ...unused];
};

/** For --fix: the rules each file excepts somewhere, which must not be auto-fixed in that file. */
export const exceptedRulesByFile = (exceptions: readonly LineException[]): ReadonlyMap<string, ReadonlySet<string>> => {
  const byFile = Map.groupBy(exceptions, (exception) => exception.file);
  return new Map([...byFile].map(([file, entries]) => [file, new Set(entries.flatMap((entry) => entry.rules))]));
};
