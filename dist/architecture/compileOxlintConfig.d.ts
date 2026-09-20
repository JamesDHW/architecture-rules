import type { OxlintConfig } from "oxlint";
import type { ClassifiedFile } from "./inventory.js";
import type { ImportIssue } from "./imports.js";
/** Compiles disjoint policies for the runner's child-directory config (pinned Oxlint path semantics). */
export declare const compileOxlintConfig: (files: readonly ClassifiedFile[], imports: readonly ImportIssue[]) => OxlintConfig;
//# sourceMappingURL=compileOxlintConfig.d.ts.map