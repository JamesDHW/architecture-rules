import { ArchitectureError } from "../errors/architectureError.js";
import type { Finding } from "./findings.js";
/** Findings from one Oxlint run printed with --format json. */
export declare const parseOxlintOutput: (root: string, output: string) => readonly Finding[] | ArchitectureError;
//# sourceMappingURL=oxlintDiagnostics.d.ts.map