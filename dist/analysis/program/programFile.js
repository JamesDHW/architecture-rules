import { isPresent, isRecord } from "../../core/guards.js";
const settingOf = (architecture, { file, ruleId }) => {
    return file.policy.rules[ruleId] ?? architecture.defaults.rules[ruleId];
};
/** The rule's severity for a file: its layer's, else the project's; undefined when the rule is off there. */
export const severityOf = (architecture, lookup) => {
    const severity = settingOf(architecture, lookup)?.severity;
    return severity === "off" ? undefined : severity;
};
/** The rule's first option object for a file, or an empty record. */
export const optionsOf = (architecture, lookup) => {
    const [options] = settingOf(architecture, lookup)?.options ?? [];
    return isRecord(options) ? options : {};
};
/** Production source: shipped code that a person wrote, not tests, scripts, generated output or declarations. */
export const isProductionSource = (file) => {
    const isDeclaration = /\.d\.[cm]?ts$/.test(file.relative);
    const isWritten = file.policy.generated === undefined && !isDeclaration;
    return !file.policy.development && isWritten;
};
const programFile = (projects, file) => {
    const found = projects.map((project) => ({ project, source: project.program.getSourceFile(file.path) })).find((entry) => entry.source !== undefined);
    if (found?.source === undefined)
        return undefined;
    return { file, project: found.project, source: found.source };
};
/** Each file with its project and syntax tree; files the compiler does not hold are skipped. */
export const programFiles = (projects, files) => {
    return files.map((file) => programFile(projects, file)).filter(isPresent);
};
/** The 1-based line a node starts on. */
export const lineOf = (source, node) => source.text.slice(0, node.getStart(source)).split("\n").length;
//# sourceMappingURL=programFile.js.map