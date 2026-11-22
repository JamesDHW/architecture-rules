import { isPresent } from "../core/guards.js";
import { declarationKeys } from "./glossaryTypes.js";
export const bindingKey = (glossary, term) => `${glossary}:${term.name}`;
const escaped = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const lineAt = (text, offset) => text.slice(0, offset).split("\n").length;
/** The line of a key in the configuration, searched for after another key: a term inside its glossary. */
const keyLine = (config, keys) => {
    const offsetFrom = (from, remaining) => {
        const [key, ...rest] = remaining;
        if (key === undefined)
            return from;
        const match = new RegExp(`["']?\\b${escaped(key)}\\b["']?\\s*:`).exec(config.text.slice(from));
        return match === null ? undefined : offsetFrom(from + match.index, rest);
    };
    const found = offsetFrom(0, keys);
    return found === undefined ? undefined : lineAt(config.text, found);
};
/** An issue about the glossary configuration, at the line of the glossary or the term it is about. */
export const glossaryIssue = (ruleId, config, keys, message) => {
    const line = keyLine(config, ["glossaries", ...keys]);
    return { ruleId, file: config.file, message, ...(line === undefined ? {} : { line }) };
};
const declarationsOf = (files, glossary, typeName) => files
    .filter(({ file }) => file.policy.glossaries.includes(glossary))
    .flatMap((file) => file.names.filter((name) => name.topLevelType === true && name.text === typeName).map((name) => ({ file, name })));
const resolve = (files, glossary, term, typeName) => {
    const declared = declarationsOf(files, glossary, typeName);
    const declaringFiles = [...new Set(declared.map(({ file }) => file.file.relative))];
    const where = `Glossary ${glossary} gives ${term.name} the type ${typeName}`;
    if (declaringFiles.length === 0)
        return { keys: [], issue: `${where}, but no layer that follows ${glossary} declares it at the top level of a file.` };
    if (declaringFiles.length > 1)
        return { keys: [], issue: `${where}, which is declared in ${declaringFiles.join(", ")}. Declare it once.` };
    const symbols = declared.flatMap(({ file, name }) => (name.node === undefined ? [] : [file.project.checker.getSymbolAtLocation(name.node)])).filter(isPresent);
    const [symbol] = symbols;
    return { keys: symbols.flatMap(declarationKeys), ...(symbol === undefined ? {} : { symbol }) };
};
/** Finds the one declaration of each bound term's type; a type declared nowhere or twice is an issue in the configuration. */
export const resolveBindings = (architecture, files, config) => {
    const resolved = Object.entries(architecture.glossaries).flatMap(([glossary, { terms }]) => terms.flatMap((term) => {
        if (term.type === undefined)
            return [];
        return [{ glossary, term, result: resolve(files, glossary, term, term.type) }];
    }));
    return {
        bindings: new Map(resolved.map(({ glossary, term, result }) => [bindingKey(glossary, term), { keys: result.keys, ...(result.symbol === undefined ? {} : { symbol: result.symbol }) }])),
        issues: resolved.flatMap(({ glossary, term, result }) => {
            return result.issue === undefined ? [] : [glossaryIssue("glossary-types", config, [glossary, term.name], result.issue)];
        }),
    };
};
//# sourceMappingURL=glossaryBindings.js.map