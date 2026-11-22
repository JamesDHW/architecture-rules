import { isBlocking } from "../runner/findings.js";
/** Listing more than this many grown entries helps nobody; the count says the rest. */
const listedEntries = 10;
const isTouchedError = (finding) => finding.status === "touched" && isBlocking(finding);
const entryLabel = (entry) => `    ${entry.file}  ${entry.rule}  ×${entry.count}`;
const touchedNote = (verdict) => {
    const touched = verdict.result.findings.filter(isTouchedError).length;
    if (touched === 0)
        return [];
    return [`Touched: ${touched} recorded errors are in files this change touches. A changed file must fix them (adoption.onTouch).`];
};
const writtenNote = (verdict, args) => {
    if (verdict.written.length === 0)
        return [];
    const staged = args.change?.kind === "staged" ? " and staged it" : "";
    return [`Baseline: removed fixed debt from ${verdict.written.join(", ")}${staged}.`];
};
const staleNote = (verdict, args) => {
    const isReported = args.ci === true && verdict.stale.length > 0;
    if (!isReported)
        return [];
    return [`Stale baseline: ${verdict.stale.length} entries record debt that is fixed. Run \`architecture-check baseline\` and commit the result.`];
};
const grownNote = (verdict) => {
    if (verdict.grown.length === 0)
        return [];
    const more = verdict.grown.length > listedEntries ? [`    …and ${verdict.grown.length - listedEntries} more`] : [];
    return [
        "Baseline grew without a reason. Fix the code, or record why with `architecture-check baseline --accept --reason <why>`:",
        ...verdict.grown.slice(0, listedEntries).map(entryLabel), ...more,
    ];
};
const missingNote = (verdict) => {
    const isWithoutBaseline = !verdict.hasBaseline && verdict.result.findings.some(isBlocking);
    if (!isWithoutBaseline)
        return [];
    return ["No baseline: to adopt the rules on existing code, run `architecture-check baseline` to record today's errors as debt."];
};
const observeNote = (verdict) => {
    const isObserving = verdict.result.architecture.adoption.mode === "observe";
    return isObserving ? ["Observe mode: findings are reported, but the check exits 0 (adoption.mode)."] : [];
};
/** What the baseline did and decided, for text and agent output, and as data for JSON. */
export const gateReport = (verdict, args) => ({
    notes: [...touchedNote(verdict), ...grownNote(verdict), ...staleNote(verdict, args), ...writtenNote(verdict, args), ...missingNote(verdict), ...observeNote(verdict)],
    details: {
        baseline: {
            exists: verdict.hasBaseline,
            recorded: verdict.recorded,
            ...(verdict.recordedAtBase === undefined ? {} : { recordedAtBase: verdict.recordedAtBase }),
            written: verdict.written,
            stale: verdict.stale,
            grown: verdict.grown,
            changedFiles: verdict.changed === undefined ? undefined : [...verdict.changed.files].toSorted(),
        },
        mode: verdict.result.architecture.adoption.mode,
    },
});
//# sourceMappingURL=gateReport.js.map