import type { CliArgs, OutputFormat, RunArgs } from "./cliArgs.js";
import { adoptArgs, baselineArgs, doctorArgs, fixArgs, graphArgs, mapArgs, rulesArgs, statusArgs } from "./commandArgs.js";
import { configOption, failure, hasCommandOnlyOptions, hasOnlyProjectOptions, initialOptions, parseOptions, type Options, type ParseError } from "./parseOptions.js";

export type { CliArgs, DescribeFormat, RunArgs } from "./cliArgs.js";

const explainUsage = "Usage: architecture-check explain <file | rule> [--config path]";
const describeUsage = "Usage: architecture-check describe [--json | --mermaid] [--config path] [project-dir]";
const reportUsage = "Usage: architecture-check report [--config path] [project-dir]";

const isExplainTarget = (file: string | undefined, extra: readonly string[], options: Options): file is string => {
  return file !== undefined && extra.length === 0 && hasOnlyProjectOptions(options) && options.format === undefined;
};

const explainArgs = ([file, ...extra]: readonly string[], options: Options): CliArgs => {
  if (!isExplainTarget(file, extra, options)) return failure(explainUsage);
  return { kind: "run", target: ".", fix: false, explain: file, ...configOption(options) };
};

const describeArgs = ([target, ...extra]: readonly string[], options: Options): CliArgs => {
  const isDescribeUsage = extra.length === 0 && hasOnlyProjectOptions(options);
  if (!isDescribeUsage) return failure(describeUsage);
  return { kind: "run", target: target ?? ".", fix: false, describe: options.format ?? "text", ...configOption(options) };
};

const reportArgs = ([target, ...extra]: readonly string[], options: Options): CliArgs => {
  const isReportUsage = extra.length === 0 && hasOnlyProjectOptions(options) && options.format === undefined;
  if (!isReportUsage) return failure(reportUsage);
  return { kind: "run", target: target ?? ".", fix: false, format: "report", ...configOption(options) };
};

const lspArgs = (rest: readonly string[], options: Options): CliArgs => {
  const isLspUsage = rest.length === 0 && hasOnlyProjectOptions(options) && options.format === undefined && options.config === undefined;
  return isLspUsage ? { kind: "lsp" } : failure("Usage: architecture-check lsp");
};

/** --json, or --format text|json|agent; the default text output is left out. */
const checkFormat = (options: Options): { readonly format?: OutputFormat } | ParseError => {
  if (options.format === "mermaid") return failure("--mermaid only applies to describe and graph");
  const isBothFormats = options.format !== undefined && options.formatName !== undefined;
  if (isBothFormats) return failure("Choose one of --json and --format");
  switch (options.formatName ?? options.format) {
    case undefined:
    case "text":
      return {};
    case "json":
      return { format: "json" };
    case "agent":
      return { format: "agent" };
    default:
      return failure(`--format must be text, json or agent, not ${options.formatName ?? ""}`);
  }
};

const isCiWithoutBase = (options: Options): boolean => options.ci && options.change?.kind !== "since";

const checkOptions = (options: Options): Omit<RunArgs, "kind" | "target" | "fix"> | ParseError => {
  const format = checkFormat(options);
  if ("kind" in format) return format;
  if (hasCommandOnlyOptions(options)) return failure("--layer, --rule, --reason, --path, --accept, --prompt and --agent-snippet do not apply to a check");
  if (isCiWithoutBase(options)) return failure("--ci needs --since <ref>: the base the change is compared with");
  return {
    ...configOption(options), ...format,
    ...(options.files.length === 0 ? {} : { files: options.files }),
    ...(options.change === undefined ? {} : { change: options.change }),
    ...(options.ci ? { ci: true } : {}),
    ...(options.summary === undefined ? {} : { summary: options.summary }),
    ...(options.fixableIn === undefined ? {} : { fixableIn: options.fixableIn }),
  };
};

const checkArgs = (options: Options): CliArgs => {
  const [target, extra] = options.positionals;
  if (extra !== undefined) return failure("Expected at most one path argument.");
  if (options.incoming) return failure("--incoming applies to check <layer>");
  const rest = checkOptions(options);
  if ("kind" in rest) return rest;
  return { kind: "run", target: target ?? ".", fix: options.fix, ...rest };
};

const layerCheckArgs = (layers: readonly string[], options: Options): CliArgs => {
  if (layers.length === 0) return failure("Usage: architecture-check check <layer>... [--incoming]");
  const rest = checkOptions(options);
  if ("kind" in rest) return rest;
  return { kind: "run", target: ".", fix: options.fix, ...rest, layers, ...(options.incoming ? { incoming: true } : {}) };
};

const toRunArgs = (options: Options): CliArgs => {
  const [command, ...rest] = options.positionals;
  switch (command) {
    case "explain":
      return explainArgs(rest, options);
    case "describe":
      return describeArgs(rest, options);
    case "report":
      return reportArgs(rest, options);
    case "lsp":
      return lspArgs(rest, options);
    case "check":
      return layerCheckArgs(rest, options);
    case "status":
      return statusArgs(rest, options);
    case "graph":
      return graphArgs(rest, options);
    case "map":
      return mapArgs(rest, options);
    case "rules":
      return rulesArgs(rest, options);
    case "baseline":
      return baselineArgs(rest, options);
    case "doctor":
      return doctorArgs(rest, options);
    case "adopt":
      return adoptArgs(rest, options);
    case "fix":
      return fixArgs(rest, options);
    case undefined:
    default:
      return checkArgs(options);
  }
};

export const parseArgs = (argv: readonly string[]): CliArgs => {
  const wantsHelp = argv.includes("--help") || argv.includes("-h");
  if (wantsHelp) return { kind: "help" };
  const options = parseOptions(argv, initialOptions);
  return "kind" in options ? options : toRunArgs(options);
};
