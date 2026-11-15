import { isError } from "./findings.js";
const stageNames = ["structure", "lint", "types", "dead-code"];
const stageOf = (source) => {
    switch (source) {
        case "structure":
            return "structure";
        case "lint":
            return "lint";
        case "compiler":
            return "types";
        case "dead-code":
            return "dead-code";
    }
};
const stageStatus = (name, findings, ranPastStructure) => {
    const failed = findings.some((finding) => isError(finding) && stageOf(finding.source) === name);
    if (failed)
        return "failed";
    const isSkipped = !ranPastStructure && name !== "structure";
    return isSkipped ? "skipped" : "passed";
};
/** Assembles a check's result; stages after structure are skipped when structural findings stopped the run. */
export const checkResult = (scope, findings, exceptions, ranPastStructure) => ({
    architecture: scope.architecture,
    configFile: scope.configFile,
    projects: scope.projects,
    files: scope.files,
    findings,
    exceptions,
    stages: stageNames.map((name) => ({ name, status: stageStatus(name, findings, ranPastStructure) })),
    durationMs: Math.round(performance.now() - scope.started),
});
export const hasErrors = (result) => result.findings.some(isError);
//# sourceMappingURL=checkResult.js.map