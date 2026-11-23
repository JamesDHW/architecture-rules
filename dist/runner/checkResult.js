import { isBlocking } from "./findings.js";
const stageNames = ["structure", "lint", "types", "program", "dead-code"];
const stageOf = (source) => {
    switch (source) {
        case "structure":
            return "structure";
        case "lint":
        case "glossary":
            return "lint";
        case "compiler":
            return "types";
        case "program":
            return "program";
        case "dead-code":
            return "dead-code";
    }
};
const stageStatus = (name, findings, ranPastStructure) => {
    const failed = findings.some((finding) => isBlocking(finding) && stageOf(finding.source) === name);
    if (failed)
        return "failed";
    const isSkipped = !ranPastStructure && name !== "structure";
    return isSkipped ? "skipped" : "passed";
};
const stagesFor = (findings, ranPastStructure) => {
    return stageNames.map((name) => ({ name, status: stageStatus(name, findings, ranPastStructure) }));
};
/** Assembles a check's result; stages after structure are skipped when structural findings stopped the run. */
export const checkResult = (scope, findings, exceptions, imports) => ({
    architecture: scope.architecture,
    configFile: scope.configFile,
    projects: scope.projects,
    files: scope.files,
    workspaces: scope.workspaces,
    partial: scope.partial,
    findings,
    exceptions,
    stages: stagesFor(findings, imports !== undefined),
    durationMs: Math.round(performance.now() - scope.started),
    complete: imports !== undefined,
    ...(imports === undefined ? {} : { imports }),
});
/** The same result with findings compared against a baseline; stages are judged again, since recorded debt passes. */
export const withFindings = (result, findings) => ({
    ...result,
    findings,
    stages: stagesFor(findings, result.complete),
});
/** Whether any finding fails the check; recorded debt in untouched files does not. */
export const hasErrors = (result) => result.findings.some(isBlocking);
//# sourceMappingURL=checkResult.js.map