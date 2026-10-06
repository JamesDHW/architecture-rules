import type { OxlintConfig } from "oxlint";
import type { ClassifiedFile } from "../analysis/inventory.js";
import type { ImportIssue } from "../analysis/imports.js";
/** Compiles disjoint policies for the runner's child-directory config (pinned Oxlint path semantics).
 * Generated files never reach this point; the runner checks only their names and imports. */
export declare const compileOxlintConfig: (files: readonly ClassifiedFile[], imports: readonly ImportIssue[]) => OxlintConfig;
//# sourceMappingURL=compileOxlintConfig.d.ts.map