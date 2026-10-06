const explainUsage = "Usage: architecture-check explain <file> [--config path]";
const reportUsage = "Usage: architecture-check report [--config path] [project-dir]";
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
const parseFormat = (argv, options) => {
    const [format, ...rest] = argv;
    switch (format) {
        case "json":
            return parseOptions(rest, { ...options, format: "json" });
        case "text":
            return parseOptions(rest, options);
        case undefined:
        default:
            return failure("--format must be text or json");
    }
};
const parseFile = (argv, options) => {
    const [path, ...rest] = argv;
    if (!isOptionValue(path))
        return failure("--file requires a path");
    return parseOptions(rest, { ...options, files: [...options.files, path] });
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
        case "--format":
            return parseFormat(rest, options);
        case "--file":
            return parseFile(rest, options);
        default:
            return arg.startsWith("-") ? failure(`Unknown option: ${arg}`) : parseOptions(rest, { ...options, positionals: [...options.positionals, arg] });
    }
};
const isExplainTarget = (file, extra, fix) => {
    return file !== undefined && extra.length === 0 && !fix;
};
const toRunArgs = ({ positionals, fix, config, format, files }) => {
    const configOption = config === undefined ? {} : { config };
    const formatOption = format === undefined ? {} : { format };
    const filesOption = files.length === 0 ? {} : { files };
    const [first, second, ...extra] = positionals;
    const isReportRun = extra.length === 0 && !fix && format === undefined && files.length === 0;
    switch (first) {
        case "explain":
            return isExplainTarget(second, extra, fix) ? { kind: "run", target: ".", fix: false, explain: second, ...configOption } : failure(explainUsage);
        case "report":
            return isReportRun ? { kind: "run", target: second ?? ".", fix: false, format: "report", ...configOption } : failure(reportUsage);
        case undefined:
        default:
            return second === undefined ? { kind: "run", target: first ?? ".", fix, ...configOption, ...formatOption, ...filesOption } : failure("Expected at most one path argument.");
    }
};
export const parseArgs = (argv) => {
    const wantsHelp = argv.includes("--help") || argv.includes("-h");
    if (wantsHelp)
        return { kind: "help" };
    const options = parseOptions(argv, { positionals: [], fix: false, files: [] });
    return "kind" in options ? options : toRunArgs(options);
};
//# sourceMappingURL=parseArgs.js.map