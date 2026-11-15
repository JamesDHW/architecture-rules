import type { OxlintConfig } from "oxlint";
import type { ClassifiedFile } from "../analysis/inventory.js";
import type { ImportIssue } from "../analysis/imports.js";
/** Rules switched off for one file: during --fix, the rules a line exception in that file covers, so excepted lines are never rewritten. */
export type FixGuard = ReadonlyMap<string, ReadonlySet<string>>;
/** Compiles disjoint policies for the runner's child-directory config (pinned Oxlint path semantics).
 * Generated files never reach this point; the runner checks only their names and imports. */
export declare const compileOxlintConfig: (files: readonly ClassifiedFile[], imports: readonly ImportIssue[], guard?: FixGuard) => OxlintConfig;
//# sourceMappingURL=compileOxlintConfig.d.ts.map