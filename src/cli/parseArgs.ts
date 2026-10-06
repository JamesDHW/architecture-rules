export type RunArgs = { readonly kind: "run"; readonly target: string; readonly fix: boolean; readonly config?: string; readonly explain?: string };

export type CliArgs =
  | { readonly kind: "help" }
  | { readonly kind: "error"; readonly message: string }
  | RunArgs;

type ParseError = Extract<CliArgs, { readonly kind: "error" }>;
type Options = { readonly positionals: readonly string[]; readonly fix: boolean; readonly config?: string };

const explainUsage = "Usage: architecture-check explain <file> [--config path]";

const failure = (message: string): ParseError => ({ kind: "error", message });

const isOptionValue = (value: string | undefined): value is string => value !== undefined && !value.startsWith("-");

const parseConfig = (argv: readonly string[], options: Options): Options | ParseError => {
  const [path, ...rest] = argv;
  if (!isOptionValue(path)) return failure("--config requires a path");
  if (options.config !== undefined) return failure("--config may be specified only once");
  return parseOptions(rest, { ...options, config: path });
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
    default:
      return arg.startsWith("-") ? failure(`Unknown option: ${arg}`) : parseOptions(rest, { ...options, positionals: [...options.positionals, arg] });
  }
};

const isExplainTarget = (file: string | undefined, extra: readonly string[], fix: boolean): file is string => {
  return file !== undefined && extra.length === 0 && !fix;
};

const toRunArgs = ({ positionals, fix, config }: Options): CliArgs => {
  const configOption = config === undefined ? {} : { config };
  const [first, second, ...extra] = positionals;
  if (first === "explain") {
    if (!isExplainTarget(second, extra, fix)) return failure(explainUsage);
    return { kind: "run", target: ".", fix: false, explain: second, ...configOption };
  }
  if (second !== undefined) return failure("Expected at most one path argument.");
  return { kind: "run", target: first ?? ".", fix, ...configOption };
};

export const parseArgs = (argv: readonly string[]): CliArgs => {
  const wantsHelp = argv.includes("--help") || argv.includes("-h");
  if (wantsHelp) return { kind: "help" };
  const options = parseOptions(argv, { positionals: [], fix: false });
  return "kind" in options ? options : toRunArgs(options);
};
