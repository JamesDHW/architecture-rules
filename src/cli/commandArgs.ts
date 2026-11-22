import type { CliArgs, GraphFormat } from "./cliArgs.js";
import { configOption, failure, hasCheckOnlyOptions, hasCommandOnlyOptions, hasOnlyProjectOptions, type Options, type ParseError } from "./parseOptions.js";

const projectTarget = (rest: readonly string[], usage: string): string | ParseError => {
  const [target, extra] = rest;
  return extra === undefined ? target ?? "." : failure(usage);
};

export const statusArgs = (rest: readonly string[], options: Options): CliArgs => {
  const usage = "Usage: architecture-check status [--since <ref>] [--json] [--config path] [project-dir]";
  const target = projectTarget(rest, usage);
  const since = options.change?.kind === "since" ? { since: options.change.ref } : {};
  const isStatusUsage = options.change === undefined || options.change.kind === "since";
  const hasOtherOptions = options.fix || options.ci || options.files.length > 0 || hasCommandOnlyOptions(options) || options.formatName !== undefined;
  const isRejected = !isStatusUsage || hasOtherOptions || options.format === "mermaid";
  if (isRejected) return failure(usage);
  return typeof target === "string" ? { kind: "status", target, json: options.format === "json", ...since, ...configOption(options) } : target;
};

const graphFormat = (options: Options): GraphFormat | ParseError => {
  const name = options.formatName ?? options.format ?? "text";
  switch (name) {
    case "text":
    case "json":
    case "mermaid":
    case "dot":
      return name;
    default:
      return failure(`--format must be text, json, mermaid or dot, not ${name}`);
  }
};

export const graphArgs = (rest: readonly string[], options: Options): CliArgs => {
  const usage = "Usage: architecture-check graph [--format text|json|mermaid|dot] [--layer name] [--config path] [project-dir]";
  const target = projectTarget(rest, usage);
  const format = graphFormat(options);
  const hasOtherOptions = hasCheckOnlyOptions(options) || options.rules.length > 0 || options.reason !== undefined || options.accept || options.paths.length > 0;
  if (hasOtherOptions) return failure(usage);
  if (typeof format !== "string") return format;
  const layer = options.layer === undefined ? {} : { layer: options.layer };
  return typeof target === "string" ? { kind: "graph", target, format, ...layer, ...configOption(options) } : target;
};

export const mapArgs = (rest: readonly string[], options: Options): CliArgs => {
  const usage = "Usage: architecture-check map [--json] [--config path] [project-dir]";
  const target = projectTarget(rest, usage);
  const isMapUsage = hasOnlyProjectOptions(options) && options.format !== "mermaid";
  if (!isMapUsage) return failure(usage);
  return typeof target === "string" ? { kind: "map", target, json: options.format === "json", ...configOption(options) } : target;
};

export const rulesArgs = (rest: readonly string[], options: Options): CliArgs => {
  const isRulesUsage = rest.length === 0 && hasOnlyProjectOptions(options) && options.format !== "mermaid" && options.config === undefined;
  return isRulesUsage ? { kind: "rules", json: options.format === "json" } : failure("Usage: architecture-check rules [--json]");
};

export const baselineArgs = (rest: readonly string[], options: Options): CliArgs => {
  const usage = "Usage: architecture-check baseline [--accept --reason <text>] [--rule <id>]... [--config path] [project-dir]\n       architecture-check baseline merge <ancestor> <current> <other>";
  const [first, ancestor, current, other, ...extra] = rest;
  const isMerge = first === "merge";
  if (isMerge) {
    const hasThreeFiles = ancestor !== undefined && current !== undefined && other !== undefined && extra.length === 0;
    return hasThreeFiles ? { kind: "baseline-merge", ancestor, current, other } : failure(usage);
  }
  const target = projectTarget(rest, usage);
  const hasOtherOptions = hasCheckOnlyOptions(options) || options.format !== undefined || options.formatName !== undefined || options.layer !== undefined;
  const isAcceptWithoutReason = options.accept && options.reason === undefined;
  const isRejected = hasOtherOptions || options.paths.length > 0 || options.prompt || options.agentSnippet;
  if (isRejected) return failure(usage);
  if (isAcceptWithoutReason) return failure("baseline --accept needs --reason <text>: why the debt may grow");
  const reason = options.reason === undefined ? {} : { reason: options.reason };
  return typeof target === "string" ? { kind: "baseline", target, accept: options.accept, rules: options.rules, ...reason, ...configOption(options) } : target;
};

export const doctorArgs = (rest: readonly string[], options: Options): CliArgs => {
  const usage = "Usage: architecture-check doctor [--config path] [project-dir]";
  const target = projectTarget(rest, usage);
  const isDoctorUsage = hasOnlyProjectOptions(options) && options.format === undefined;
  if (!isDoctorUsage) return failure(usage);
  return typeof target === "string" ? { kind: "doctor", target, ...configOption(options) } : target;
};

export const adoptArgs = (rest: readonly string[], options: Options): CliArgs => {
  const usage = "Usage: architecture-check adopt --prompt | --agent-snippet";
  const hasOneOutput = options.prompt !== options.agentSnippet;
  const isAdoptUsage = rest.length === 0 && hasOneOutput && !hasCheckOnlyOptions(options) && options.config === undefined;
  if (!isAdoptUsage) return failure(usage);
  return { kind: "adopt", output: options.prompt ? "prompt" : "agent-snippet" };
};

export const fixArgs = (rest: readonly string[], options: Options): CliArgs => {
  const usage = "Usage: architecture-check fix --rule <id> [--path <glob>]... [--config path] [project-dir]";
  const target = projectTarget(rest, usage);
  const [rule, extraRule] = options.rules;
  const hasOneRule = rule !== undefined && extraRule === undefined;
  const isFixUsage = hasOneRule && !hasCheckOnlyOptions(options) && options.format === undefined && !options.accept;
  if (!isFixUsage) return failure(usage);
  return typeof target === "string" ? { kind: "fix", target, rule, paths: options.paths, ...configOption(options) } : target;
};

