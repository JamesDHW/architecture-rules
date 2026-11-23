import { posix } from "node:path";
import { DIRECTORY_ERROR_OPTIONS, DIRECTORY_WARN_OPTIONS } from "../../rules/maxDirectoryFiles.constants.js";
import { isProductionSource, optionsOf, severityOf } from "./programFile.js";
import { PROGRAM_RULES } from "../../rules/programRules.constants.js";
/** Each limit with the maximum it falls back to when a layer's options leave it out; the error limit first. */
const LIMITS = [
    { ruleId: PROGRAM_RULES.directoryError, fallback: DIRECTORY_ERROR_OPTIONS.max },
    { ruleId: PROGRAM_RULES.directoryWarn, fallback: DIRECTORY_WARN_OPTIONS.max },
];
const limitOf = (scope, file) => ({ ruleId, fallback }) => {
    const lookup = { file, ruleId };
    const severity = severityOf(scope.architecture, lookup);
    if (severity === undefined)
        return undefined;
    const { max } = optionsOf(scope.architecture, lookup);
    return { ruleId, severity, max: typeof max === "number" ? max : fallback };
};
const issueFor = (directory, limit) => {
    const threshold = limit.severity === "error" ? "limit" : "warning";
    return {
        ruleId: limit.ruleId,
        file: `${directory.path}/`,
        severity: limit.severity,
        message: `${directory.path}/ holds ${directory.files.length} production source files; the ${threshold} is above ${limit.max}. Move files that share a concept into a subfolder named after it.`,
    };
};
/** The error when the directory is over the error limit, else the warning when it is over the warning limit. */
const directoryIssues = (scope, directory) => {
    const [first] = directory.files;
    if (first === undefined)
        return [];
    const over = LIMITS.map(limitOf(scope, first))
        .filter((limit) => limit !== undefined)
        .find((limit) => directory.files.length > limit.max);
    return over === undefined ? [] : [issueFor(directory, over)];
};
/** Directories holding more production source files than their layer allows. */
export const directorySize = (scope) => {
    const production = scope.files.filter(isProductionSource).toSorted((left, right) => left.relative.localeCompare(right.relative));
    const byDirectory = Map.groupBy(production, (file) => posix.dirname(file.relative));
    return [...byDirectory].flatMap(([path, files]) => directoryIssues(scope, { path, files }));
};
//# sourceMappingURL=directorySize.js.map