import { isError } from "../runner/findings.js";
/**
 * The findings of files that are at most `distance` errors away from compliant, recorded debt included. A fixed
 * threshold, not a ranking: nothing here guesses which work matters most.
 */
export const withinFixDistance = (findings, distance) => {
    const errorsByFile = Map.groupBy(findings.filter(isError), (finding) => finding.file);
    const near = new Set([...errorsByFile].filter(([, errors]) => errors.length <= distance).map(([file]) => file));
    return findings.filter((finding) => near.has(finding.file));
};
//# sourceMappingURL=fixDistance.js.map