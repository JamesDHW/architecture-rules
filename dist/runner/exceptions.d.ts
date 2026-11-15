import type { LineException } from "../analysis/suppressions.js";
import type { Finding } from "./findings.js";
/** Drops the findings line exceptions cover, and reports every exception rule that covered nothing. */
export declare const applyExceptions: (findings: readonly Finding[], exceptions: readonly LineException[]) => readonly Finding[];
/** For --fix: the rules each file excepts somewhere, which must not be auto-fixed in that file. */
export declare const exceptedRulesByFile: (exceptions: readonly LineException[]) => ReadonlyMap<string, ReadonlySet<string>>;
//# sourceMappingURL=exceptions.d.ts.map