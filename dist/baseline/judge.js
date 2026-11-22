import { existsSync } from "node:fs";
import { join } from "node:path";
import { rootWorkspace } from "../analysis/workspaces.js";
import { ArchitectureError } from "../errors/architectureError.js";
import { withFindings } from "../runner/checkResult.js";
import { isBlocking } from "../runner/findings.js";
import { baselinePath, readBaseline, writeBaseline } from "./baselineFile.js";
import { changedFiles } from "./changedSet.js";
import { EXIT_GROWN, EXIT_NEW, EXIT_STALE, EXIT_TOUCHED } from "./gates.constants.js";
import { stage } from "./git.js";
import { acceptedSince, baseState, recordedTotal, unapprovedGrowth } from "./growth.js";
import { ratchet } from "./ratchet.js";
const baselineExists = (root, workspaces) => {
    return [rootWorkspace, ...workspaces].some((workspace) => existsSync(join(root, baselinePath(workspace))));
};
const changeOf = (root, change) => {
    return change === undefined ? undefined : changedFiles(root, change);
};
const scopeOf = (result) => {
    const selected = new Set(result.files.map((file) => file.relative));
    return (file) => result.complete && (!result.partial || selected.has(file));
};
const baseOf = (root, result, changed) => {
    if (changed?.base === undefined)
        return undefined;
    return baseState(root, result.workspaces, { ...changed, base: changed.base });
};
const growthOf = (result, options, base, recorded) => {
    const isCi = options.ci === true && base !== undefined;
    return isCi ? unapprovedGrowth(result.workspaces, base, recorded) : [];
};
/** Compares a check's findings with the baseline: statuses, pruning (outside CI) and, in CI, growth against the base. */
export const judge = (root, result, options) => {
    const changed = changeOf(root, options.change);
    if (changed instanceof ArchitectureError)
        return changed;
    const recorded = readBaseline(root, result.workspaces);
    if (recorded instanceof ArchitectureError)
        return recorded;
    const hasBaseline = baselineExists(root, result.workspaces);
    const base = baseOf(root, result, changed);
    if (base instanceof ArchitectureError)
        return base;
    const judged = ratchet({
        findings: result.findings, baseline: recorded, adoption: result.architecture.adoption, inScope: scopeOf(result),
        ...(changed === undefined ? {} : { changed }),
        ...(base === undefined ? {} : { acceptedInChange: acceptedSince(base, recorded) }),
    });
    const isWriting = options.write && options.ci !== true && hasBaseline && result.complete;
    const written = isWriting ? writeBaseline(root, result.workspaces, judged.baseline) : [];
    if (written instanceof ArchitectureError)
        return written;
    const staged = options.change?.kind === "staged" ? stage(root, written) : "";
    if (staged instanceof ArchitectureError)
        return staged;
    return {
        result: withFindings(result, judged.findings), hasBaseline, stale: judged.stale, grown: growthOf(result, options, base, recorded), written,
        recorded: recordedTotal(judged.baseline),
        ...(base === undefined ? {} : { recordedAtBase: recordedTotal(base.baseline) }),
        ...(changed === undefined ? {} : { changed }),
    };
};
const isTouchedError = (finding) => finding.status === "touched" && isBlocking(finding);
const isNewError = (finding) => isBlocking(finding) && finding.status !== "touched";
/** A stale baseline fails only CI, which must not write the pruned file. */
const isStaleInCi = (verdict, ci) => ci && verdict.stale.length > 0;
/** Why the check fails, in order of precedence: new findings, touched files, unapproved growth, a stale baseline (CI). */
export const failureCodes = (verdict, ci) => [
    ...(verdict.result.findings.some(isNewError) ? [EXIT_NEW] : []),
    ...(verdict.result.findings.some(isTouchedError) ? [EXIT_TOUCHED] : []),
    ...(verdict.grown.length > 0 ? [EXIT_GROWN] : []),
    ...(isStaleInCi(verdict, ci) ? [EXIT_STALE] : []),
];
//# sourceMappingURL=judge.js.map