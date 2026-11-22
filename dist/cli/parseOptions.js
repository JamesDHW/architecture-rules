export const failure = (message) => ({ kind: "error", message });
export const initialOptions = {
    positionals: [], fix: false, files: [], ci: false, incoming: false, rules: [], accept: false, paths: [], prompt: false, agentSnippet: false,
};
const isOptionValue = (value) => value !== undefined && !value.startsWith("-");
/** A flag that takes a value: the next argument, which must not itself be a flag. */
const withValue = (argv, missing, apply) => {
    const [value, ...rest] = argv;
    if (!isOptionValue(value))
        return failure(missing);
    const applied = apply(value);
    return "kind" in applied ? applied : parseOptions(rest, applied);
};
const once = (current, flag, next) => {
    return current === undefined ? next : failure(`${flag} may be specified only once`);
};
const parseFormat = (argv, options, format) => {
    if (options.format !== undefined)
        return failure("Choose one of --json and --mermaid");
    return parseOptions(argv, { ...options, format });
};
const withChange = (argv, options, change) => {
    if (options.change !== undefined)
        return failure("Choose one of --staged, --worktree and --since");
    return parseOptions(argv, { ...options, change });
};
const fixableCount = (options, value) => {
    const count = Number(value);
    const isCount = Number.isInteger(count) && count > 0;
    return isCount ? once(options.fixableIn, "--fixable-in", { ...options, fixableIn: count }) : failure("--fixable-in requires a positive whole number");
};
const valueFlag = (argv, options, flag) => {
    switch (flag) {
        case "--config":
            return withValue(argv, "--config requires a path", (config) => once(options.config, flag, { ...options, config }));
        case "--file":
            return withValue(argv, "--file requires a path", (path) => ({ ...options, files: [...options.files, path] }));
        case "--format":
            return withValue(argv, `${flag} requires a value`, (formatName) => once(options.formatName, flag, { ...options, formatName }));
        case "--summary":
            return withValue(argv, `${flag} requires a value`, (summary) => once(options.summary, flag, { ...options, summary }));
        case "--fixable-in":
            return withValue(argv, `${flag} requires a value`, (value) => fixableCount(options, value));
        case "--layer":
            return withValue(argv, `${flag} requires a value`, (layer) => once(options.layer, flag, { ...options, layer }));
        case "--rule":
            return withValue(argv, `${flag} requires a value`, (rule) => ({ ...options, rules: [...options.rules, rule] }));
        case "--reason":
            return withValue(argv, `${flag} requires a value`, (reason) => once(options.reason, flag, { ...options, reason }));
        case "--path":
            return withValue(argv, `${flag} requires a value`, (path) => ({ ...options, paths: [...options.paths, path] }));
        default:
            return undefined;
    }
};
/** --since takes the ref to compare with, and conflicts with the other change flags as they do with each other. */
const sinceFlag = (argv, options) => {
    if (options.change !== undefined)
        return failure("Choose one of --staged, --worktree and --since");
    return withValue(argv, "--since requires a ref", (ref) => ({ ...options, change: { kind: "since", ref } }));
};
const switchFlag = (rest, options, arg) => {
    switch (arg) {
        case "--fix":
            return parseOptions(rest, { ...options, fix: true });
        case "--json":
            return parseFormat(rest, options, "json");
        case "--mermaid":
            return parseFormat(rest, options, "mermaid");
        case "--staged":
            return withChange(rest, options, { kind: "staged" });
        case "--worktree":
            return withChange(rest, options, { kind: "worktree" });
        case "--since":
            return sinceFlag(rest, options);
        case "--ci":
            return parseOptions(rest, { ...options, ci: true });
        case "--incoming":
            return parseOptions(rest, { ...options, incoming: true });
        case "--accept":
            return parseOptions(rest, { ...options, accept: true });
        case "--prompt":
            return parseOptions(rest, { ...options, prompt: true });
        case "--agent-snippet":
            return parseOptions(rest, { ...options, agentSnippet: true });
        default:
            return undefined;
    }
};
export const configOption = ({ config }) => config === undefined ? {} : { config };
/** Flags that only a check uses; any other command rejects them. */
export const hasCheckOnlyOptions = (options) => {
    const hasCheckValues = options.files.length > 0 || options.change !== undefined || options.summary !== undefined || options.fixableIn !== undefined;
    return options.fix || options.ci || options.incoming || hasCheckValues;
};
/** Flags that only baseline, fix, graph and adopt use. */
export const hasCommandOnlyOptions = (options) => {
    const hasCommandValues = options.layer !== undefined || options.rules.length > 0 || options.reason !== undefined || options.paths.length > 0;
    return options.accept || options.prompt || options.agentSnippet || hasCommandValues;
};
export const hasOnlyProjectOptions = (options) => {
    return !hasCheckOnlyOptions(options) && !hasCommandOnlyOptions(options) && options.formatName === undefined;
};
/** Reads every flag and positional argument; which apply is the command's decision. */
export const parseOptions = (argv, options) => {
    const [arg, ...rest] = argv;
    if (arg === undefined)
        return options;
    const parsed = switchFlag(rest, options, arg) ?? valueFlag(rest, options, arg);
    if (parsed !== undefined)
        return parsed;
    return arg.startsWith("-") ? failure(`Unknown option: ${arg}`) : parseOptions(rest, { ...options, positionals: [...options.positionals, arg] });
};
//# sourceMappingURL=parseOptions.js.map