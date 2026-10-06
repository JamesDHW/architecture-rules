const explainUsage = "Usage: architecture-check explain <file> [--config path]";
const failure = (message) => ({ kind: "error", message });
const isOptionValue = (value) => value !== undefined && !value.startsWith("-");
const parseConfig = (argv, options) => {
    const [path, ...rest] = argv;
    if (!isOptionValue(path))
        return failure("--config requires a path");
    if (options.config !== undefined)
        return failure("--config may be specified only once");
    return parseOptions(rest, { ...options, config: path });
};
const parseOptions = (argv, options) => {
    const [arg, ...rest] = argv;
    switch (arg) {
        case undefined:
            return options;
        case "--fix":
            return parseOptions(rest, { ...options, fix: true });
        case "--config":
            return parseConfig(rest, options);
        default:
            return arg.startsWith("-") ? failure(`Unknown option: ${arg}`) : parseOptions(rest, { ...options, positionals: [...options.positionals, arg] });
    }
};
const isExplainTarget = (file, extra, fix) => {
    return file !== undefined && extra.length === 0 && !fix;
};
const toRunArgs = ({ positionals, fix, config }) => {
    const configOption = config === undefined ? {} : { config };
    const [first, second, ...extra] = positionals;
    if (first === "explain") {
        if (!isExplainTarget(second, extra, fix))
            return failure(explainUsage);
        return { kind: "run", target: ".", fix: false, explain: second, ...configOption };
    }
    if (second !== undefined)
        return failure("Expected at most one path argument.");
    return { kind: "run", target: first ?? ".", fix, ...configOption };
};
export const parseArgs = (argv) => {
    const wantsHelp = argv.includes("--help") || argv.includes("-h");
    if (wantsHelp)
        return { kind: "help" };
    const options = parseOptions(argv, { positionals: [], fix: false });
    return "kind" in options ? options : toRunArgs(options);
};
//# sourceMappingURL=parseArgs.js.map