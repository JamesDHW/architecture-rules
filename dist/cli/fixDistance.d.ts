import { type Finding } from "../runner/findings.js";
/**
 * The findings of files that are at most `distance` errors away from compliant, recorded debt included. A fixed
 * threshold, not a ranking: nothing here guesses which work matters most.
 */
export declare const withinFixDistance: (findings: readonly Finding[], distance: number) => readonly Finding[];
//# sourceMappingURL=fixDistance.d.ts.map