import { isPresent, isRecord } from "../../core/guards.js";
import { resolveBindings } from "./bindings.js";
import { aliasIssues, needsType, typeIssues } from "./nameIssues.js";
import { ownedNames } from "./names.js";
import { judgeType } from "./types.js";
import { unusedIssues } from "./usage.js";
import { readName, vocabularyOf } from "./vocabulary.js";
const isOn = (file, ruleId) => (file.policy.rules[ruleId]?.severity ?? "off") !== "off";
const aliasMatch = (file) => {
    const [option] = file.policy.rules["glossary-aliases"]?.options ?? [];
    const readsEveryWord = isRecord(option) && option.match === "any";
    return readsEveryWord ? "any" : "head";
};
const noTermTypes = new Map();
const fileIssues = (entry, context) => {
    const names = entry.names.map((owned) => {
        const read = readName(owned.text, context.vocabulary);
        const candidates = context.match === "any" ? read.all : [read.head].filter(isPresent);
        return { owned, read, aliases: candidates.filter((match) => match.phrase.meaning.alias !== undefined) };
    }).filter((name) => name.read.all.length > 0);
    const typed = names.flatMap((name) => {
        const { node } = name.owned;
        if (node === undefined)
            return [];
        return needsType(context, name) ? [{ name, node }] : [];
    });
    const { checker } = context;
    const types = typed.length === 0 ? [] : checker.getTypeAtLocation(typed.map(({ node }) => node));
    const byName = new Map(typed.map(({ name }, index) => {
        const type = types[index];
        return [name, { judged: judgeType(checker, type), text: type === undefined ? "unknown" : checker.typeToString(type) }];
    }));
    return names.flatMap((name) => {
        const typedName = { name, typed: byName.get(name) };
        return [...aliasIssues(context, typedName), ...typeIssues(context, typedName)];
    });
};
/** Each bound term's type in one project: asked only where the project holds the file that declares it. */
const termTypesIn = (project, bindings) => new Map([...bindings].map(([key, binding]) => {
    const { symbol, keys } = binding;
    const declaration = symbol?.declarations.at(0);
    const declaringSource = declaration === undefined ? undefined : project.program.getSourceFile(declaration.path);
    const isOutsideProject = symbol === undefined || declaringSource === undefined;
    if (isOutsideProject)
        return [key, { keys }];
    return [key, { keys, type: project.checker.getDeclaredTypeOfSymbol(symbol) }];
}));
const parse = (file, projects) => {
    const found = projects.map((project) => ({ project, source: project.program.getSourceFile(file.path) })).find(({ source }) => source !== undefined);
    if (found?.source === undefined)
        return undefined;
    return { file, project: found.project, source: found.source, names: ownedNames(found.source) };
};
const followsGlossary = (file) => file.policy.glossaries.length > 0 && file.policy.generated === undefined;
export const checkGlossaries = ({ architecture, files, projects, config, checked }) => {
    const hasGlossaries = Object.keys(architecture.glossaries).length > 0;
    if (!hasGlossaries)
        return { names: [], configuration: [] };
    const parsed = files.filter(followsGlossary).map((file) => parse(file, projects)).filter(isPresent);
    const input = { architecture, files: parsed, config };
    const { bindings, issues } = resolveBindings(input);
    const byProject = new Map(projects.map((project) => [project, termTypesIn(project, bindings)]));
    const contextOf = (entry) => ({
        file: entry.file, checker: entry.project.checker, termTypes: byProject.get(entry.project) ?? noTermTypes,
        vocabulary: vocabularyOf(architecture, entry.file.policy.glossaries), match: aliasMatch(entry.file),
        types: isOn(entry.file, "glossary-types"), aliases: isOn(entry.file, "glossary-aliases"),
    });
    const names = parsed.filter(({ file }) => checked.has(file.relative)).flatMap((entry) => fileIssues(entry, contextOf(entry)));
    return { names, configuration: [...issues, ...unusedIssues(input)] };
};
//# sourceMappingURL=check.js.map