export type DescribeFormat = "text" | "json" | "mermaid";

export type RunArgs = {
  readonly kind: "run";
  readonly target: string;
  readonly fix: boolean;
  readonly config?: string;
  readonly explain?: string;
  readonly describe?: DescribeFormat;
};

export type CliArgs =
  | { readonly kind: "help" }
  | { readonly kind: "error"; readonly message: string }
  | RunArgs;

type ParseError = Extract<CliArgs, { readonly kind: "error" }>;
type Options = { readonly positionals: readonly string[]; readonly fix: boolean; readonly config?: string; readonly format?: "json" | "mermaid" };

const explainUsage = "Usage: architecture-check explain <file> [--config path]";
const describeUsage = "Usage: architecture-check describe [--json | --mermaid] [--config path] [project-dir]";

const failure = (message: string): ParseError => ({ kind: "error", message });

const isOptionValue = (value: string | undefined): value is string => value !== undefined && !value.startsWith("-");

const parseConfig = (argv: readonly string[], options: Options): Options | ParseError => {
  const [path, ...rest] = argv;
  if (!isOptionValue(path)) return failure("--config requires a path");
  if (options.config !== undefined) return failure("--config may be specified only once");
  return parseOptions(rest, { ...options, config: path });
};

const parseFormat = (argv: readonly string[], options: Options, format: "json" | "mermaid"): Options | ParseError => {
  if (options.format !== undefined) return failure("Choose one of --json and --mermaid");
  return parseOptions(argv, { ...options, format });
};

const parseOptions = (argv: readonly string[], options: Options): Options | ParseError => {
  const [arg, ...rest] = argv;
  switch (arg) {
    case undefined:
      return options;
    case "--fix":
      return parseOptions(rest, { ...options, fix: true });
    case "--config":
      return parseConfig(rest, options);
    case "--json":
      return parseFormat(rest, options, "json");
    case "--mermaid":
      return parseFormat(rest, options, "mermaid");
    default:
      return arg.startsWith("-") ? failure(`Unknown option: ${arg}`) : parseOptions(rest, { ...options, positionals: [...options.positionals, arg] });
  }
};

const configOption = ({ config }: Options): { readonly config?: string } => config === undefined ? {} : { config };

const isExplainTarget = (file: string | undefined, extra: readonly string[], options: Options): file is string => {
  return file !== undefined && extra.length === 0 && !options.fix && options.format === undefined;
};

const explainArgs = ([file, ...extra]: readonly string[], options: Options): CliArgs => {
  if (!isExplainTarget(file, extra, options)) return failure(explainUsage);
  return { kind: "run", target: ".", fix: false, explain: file, ...configOption(options) };
};

const describeArgs = ([target, ...extra]: readonly string[], options: Options): CliArgs => {
  const isDescribeUsage = extra.length === 0 && !options.fix;
  if (!isDescribeUsage) return failure(describeUsage);
  return { kind: "run", target: target ?? ".", fix: false, describe: options.format ?? "text", ...configOption(options) };
};

const checkArgs = (options: Options): CliArgs => {
  const [target, extra] = options.positionals;
  if (options.format !== undefined) return failure("--json and --mermaid only apply to describe");
  if (extra !== undefined) return failure("Expected at most one path argument.");
  return { kind: "run", target: target ?? ".", fix: options.fix, ...configOption(options) };
};

const toRunArgs = (options: Options): CliArgs => {
  const [command, ...rest] = options.positionals;
  switch (command) {
    case "explain":
      return explainArgs(rest, options);
    case "describe":
      return describeArgs(rest, options);
    case undefined:
    default:
      return checkArgs(options);
  }
};

export const parseArgs = (argv: readonly string[]): CliArgs => {
  const wantsHelp = argv.includes("--help") || argv.includes("-h");
  if (wantsHelp) return { kind: "help" };
  const options = parseOptions(argv, { positionals: [], fix: false });
  return "kind" in options ? options : toRunArgs(options);
};
