import { posix } from "node:path";
import { isImportDeclaration, isImportEqualsDeclaration } from "typescript/unstable/ast";
import { isString } from "../../core/guards.js";
import { FILE_SUBSTANCE_OPTIONS } from "../../rules/minFileSubstance.constants.js";
import { matches } from "../paths.js";
import { isProductionSource, lineOf, optionsOf, programFiles, severityOf } from "./programFile.js";
import { PROGRAM_RULES } from "../../rules/programRules.constants.js";
const substanceOf = (scope, entry) => {
    const { maxStatements, maxLines, ignore } = optionsOf(scope.architecture, { file: entry.file, ruleId: PROGRAM_RULES.fileSubstance });
    return {
        maxStatements: typeof maxStatements === "number" ? maxStatements : FILE_SUBSTANCE_OPTIONS.maxStatements,
        maxLines: typeof maxLines === "number" ? maxLines : FILE_SUBSTANCE_OPTIONS.maxLines,
        ignore: Array.isArray(ignore) ? ignore.filter(isString) : FILE_SUBSTANCE_OPTIONS.ignore,
    };
};
const isImport = (statement) => isImportDeclaration(statement) || isImportEqualsDeclaration(statement);
const isCodeLine = (line) => {
    const trimmed = line.trim();
    const isComment = trimmed.startsWith("//") || trimmed.startsWith("/*") || trimmed.startsWith("*");
    return trimmed.length > 0 && !isComment;
};
/** Lines of code outside imports: not blank, not only a comment. */
const codeLines = (entry, statements) => {
    const text = statements.map((statement) => entry.source.text.slice(statement.getStart(entry.source), statement.end)).join("\n");
    return text.split("\n").filter(isCodeLine).length;
};
/** Every governed file that imports each file, allowed or denied. */
const importersByFile = (imports) => {
    const edges = [
        ...imports.links.map((link) => ({ from: link.from, to: link.to })),
        ...imports.issues.flatMap((issue) => issue.target === undefined ? [] : [{ from: issue.file, to: issue.target.file }]),
    ];
    const grouped = Map.groupBy(edges, (edge) => edge.to);
    return new Map([...grouped].map(([to, from]) => [to, new Set(from.map((edge) => edge.from))]));
};
/** The one file that imports this one, when it is the only importer and sits in the same folder. */
const onlyNeighbour = (entry, importers) => {
    const [importer, ...others] = [...importers];
    const isOnlyImporter = others.length === 0;
    const isNeighbour = importer !== undefined && isOnlyImporter && posix.dirname(importer) === posix.dirname(entry.file.relative);
    return isNeighbour ? importer : undefined;
};
/** Entry files are loaded from outside, and ignored files are kept on purpose. */
const isExempt = (scope, entry) => {
    return entry.file.policy.entry !== undefined || matches(entry.file.relative, substanceOf(scope, entry).ignore);
};
const candidateOf = (scope, { entry, importers }) => {
    const severity = severityOf(scope.architecture, { file: entry.file, ruleId: PROGRAM_RULES.fileSubstance });
    if (severity === undefined)
        return undefined;
    const importer = onlyNeighbour(entry, importers);
    if (importer === undefined)
        return undefined;
    return isExempt(scope, entry) ? undefined : { entry, importer, severity };
};
const issueFor = (scope, { entry, importer, severity }) => {
    const substance = substanceOf(scope, entry);
    const statements = entry.source.statements.filter((statement) => !isImport(statement));
    const lines = codeLines(entry, statements);
    const isTiny = statements.length <= substance.maxStatements && lines <= substance.maxLines;
    if (!isTiny)
        return undefined;
    const [first] = statements;
    const name = posix.basename(importer);
    return {
        ruleId: PROGRAM_RULES.fileSubstance,
        file: entry.file.relative,
        ...(first === undefined ? {} : { line: lineOf(entry.source, first) }),
        severity,
        message: `This file holds ${lines} lines of code, and only ${name} imports it. Move its contents into ${name}.`,
    };
};
const noImporters = new Set();
/** Tiny production files that only one file beside them imports. */
export const fileSubstance = (scope, imports) => {
    const importers = importersByFile(imports);
    return programFiles(scope.projects, scope.files.filter(isProductionSource))
        .map((entry) => candidateOf(scope, { entry, importers: importers.get(entry.file.relative) ?? noImporters }))
        .filter((candidate) => candidate !== undefined)
        .map((candidate) => issueFor(scope, candidate))
        .filter((issue) => issue !== undefined);
};
//# sourceMappingURL=fileSubstance.js.map