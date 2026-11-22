import { rules } from "../rules/index.js";
import { catalogue, catalogueEntry } from "./ruleCatalogue.js";
/** architecture-check rules: every rule's id, kind and title, or the whole catalogue as JSON. */
export const rulesCommand = (json) => {
    if (json) {
        process.stdout.write(`${JSON.stringify({ rules: catalogue() }, null, 2)}\n`);
        return 0;
    }
    const entries = catalogue();
    const width = Math.max(0, ...entries.map((entry) => entry.id.length));
    const kindWidth = Math.max(0, ...entries.map((entry) => entry.kind.length));
    const lines = entries.map((entry) => `${entry.id.padEnd(width)}  ${entry.kind.padEnd(kindWidth)}  ${entry.title}`);
    process.stdout.write(`${[...lines, "", `${rules.length} rules. architecture-check explain <rule> describes one.`].join("\n")}\n`);
    return 0;
};
const fixLine = (entry) => {
    const ways = [...(entry.autofix.lintFix ? ["architecture-check --fix"] : []), ...(entry.autofix.command === undefined ? [] : [entry.autofix.command])];
    return ways.length === 0 ? [] : ["", `Automatic fix: ${ways.join(", or ")}`];
};
/** architecture-check explain <rule>: what the rule checks, why, how to fix its findings, and when to except one. */
export const explainRule = (rule) => {
    const entry = catalogueEntry(rule);
    const lines = [
        `${entry.id} · ${entry.kind} · default ${JSON.stringify(entry.default ?? "off")}`,
        entry.title,
        "",
        entry.description,
        ...(entry.instead === undefined ? [] : ["", `Instead: ${entry.instead}`]),
        ...(entry.exceptionWhen === undefined ? [] : ["", `An exception is acceptable when: ${entry.exceptionWhen}`, `  // architecture-disable-next-line ${entry.id} -- <the concrete reason>`]),
        ...fixLine(entry),
        "",
        `Documentation: ${entry.docs}`,
    ];
    process.stdout.write(`${lines.join("\n")}\n`);
    return 0;
};
//# sourceMappingURL=rulesCommand.js.map