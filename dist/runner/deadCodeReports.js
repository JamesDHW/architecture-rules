import { isRecord, isString, isUnknownArray } from "../core/guards.js";
import { ArchitectureError } from "../errors/architectureError.js";
import { tryCatch } from "../errors/tryCatch.js";
const entryName = (entry) => {
    if (isRecord(entry))
        return isString(entry.name) ? entry.name : undefined;
    // Duplicate exports are reported as a list of the names that export the same value.
    return isUnknownArray(entry) ? entry.map(entryName).filter(isString).join(" and ") : undefined;
};
const entryPosition = (entry) => {
    const first = isUnknownArray(entry) ? entry.at(0) : entry;
    if (!isRecord(first))
        return {};
    const { line, col } = first;
    return { ...(typeof line === "number" ? { line } : {}), ...(typeof col === "number" ? { column: col } : {}) };
};
const reportsOf = (issue) => {
    if (!isRecord(issue))
        return [];
    const { file } = issue;
    if (!isString(file))
        return [];
    return Object.entries(issue).flatMap(([type, entries]) => {
        if (!isUnknownArray(entries))
            return [];
        return entries.flatMap((entry) => {
            const name = entryName(entry);
            return name === undefined ? [] : [{ type, file, name, ...entryPosition(entry) }];
        });
    });
};
/** Every report in the engine's JSON output. */
export const parseReports = (output) => {
    const parsed = tryCatch(() => JSON.parse(output));
    const issues = isRecord(parsed) ? parsed.issues : undefined;
    if (!isUnknownArray(issues))
        return new ArchitectureError([`The dead-code analysis printed output that is not its report: ${output.slice(0, 200)}`]);
    return issues.flatMap(reportsOf);
};
/** The engine's issue types, under the architecture rule that owns them. Types not listed are not reported. */
export const ruleByIssueType = {
    files: "unused-files",
    exports: "unused-exports",
    nsExports: "unused-exports",
    enumMembers: "unused-exports",
    namespaceMembers: "unused-exports",
    types: "unused-types",
    nsTypes: "unused-types",
    duplicates: "duplicate-exports",
    dependencies: "unused-dependencies",
    devDependencies: "unused-dependencies",
    optionalPeerDependencies: "unused-dependencies",
    unlisted: "unlisted-dependencies",
    binaries: "unlisted-binaries",
    unresolved: "unresolved-imports",
};
export const projectRules = new Set(["unused-dependencies", "unlisted-dependencies", "unlisted-binaries"]);
export const exportRules = new Set(["unused-exports", "unused-types", "duplicate-exports"]);
export const message = (ruleId, report, developmentOnly) => {
    const subject = ruleId === "unused-files" ? "This file" : `\`${report.name}\``;
    if (developmentOnly)
        return `${subject} is used only by development layers (tests, tooling), not by production code.`;
    switch (ruleId) {
        case "unused-files":
            return "Nothing imports this file, and its layer is not an entry.";
        case "unused-types":
            return `Type \`${report.name}\` is exported, but nothing imports it.`;
        case "duplicate-exports":
            return `${report.name} export the same value.`;
        case "unused-dependencies":
            return `\`${report.name}\` is declared in package.json, but nothing uses it.`;
        case "unlisted-dependencies":
            return `\`${report.name}\` is imported, but package.json does not declare it.`;
        case "unlisted-binaries":
            return `A script runs \`${report.name}\`, which no declared package provides.`;
        case "unresolved-imports":
            return `The dead-code analysis cannot resolve \`${report.name}\`, so what this file uses is incomplete.`;
        default:
            return `\`${report.name}\` is exported, but nothing imports it.`;
    }
};
export const devDependencyMessage = (report) => `\`${report.name}\` is a devDependency, but production code imports it. Move it to dependencies.`;
//# sourceMappingURL=deadCodeReports.js.map