#!/usr/bin/env node

import { mergeBaselineFiles } from "./baseline/mergeBaselines.js";
import { ArchitectureError } from "./errors/architectureError.js";
import { tryCatchAsync } from "./errors/tryCatch.js";
import { checkArchitecture } from "./runner/runner.js";
import { adoptCommand } from "./cli/adoptCommand.js";
import { baselineCommand } from "./cli/baselineCommand.js";
import { checkCommand } from "./cli/checkCommand.js";
import { describeCommand } from "./cli/describeCommand.js";
import { doctorCommand } from "./cli/doctorCommand.js";
import { fixCommand } from "./cli/fixCommand.js";
import { graphCommand } from "./cli/graphCommand.js";
import { help } from "./cli/help.js";
import { loadProject } from "./cli/inspectProject.js";
import { mapCommand } from "./cli/mapCommand.js";
import { parseArgs, type CliArgs, type RunArgs } from "./cli/parseArgs.js";
import { ruleById } from "./cli/ruleCatalogue.js";
import { explainRule, rulesCommand } from "./cli/rulesCommand.js";
import { statusCommand } from "./cli/statusCommand.js";
import { startServer } from "./editor/server.js";

const printHelp = (): number => {
  process.stdout.write(help);
  return 0;
};

const printUsageError = (message: string): number => {
  process.stderr.write(`${message}\n${help}`);
  return 1;
};

const printError = (error: ArchitectureError): number => {
  for (const issue of error.issues) {
    process.stderr.write(`architecture-config: ${issue}\n`);
  }
  return 1;
};

/** explain <rule> describes a rule; explain <file> the effective policy for that file. */
const explain = async (args: RunArgs, target: string): Promise<number | ArchitectureError> => {
  const rule = ruleById(target);
  if (rule !== undefined) return explainRule(rule);
  const project = await loadProject(args.target, args.config);
  if (project instanceof ArchitectureError) return project;
  return checkArchitecture(project.root, project.architecture, { configFile: project.configPath, explain: target });
};

const runCheck = async (args: RunArgs): Promise<number | ArchitectureError> => {
  if (args.describe !== undefined) return describeCommand(args, args.describe);
  if (args.explain !== undefined) return explain(args, args.explain);
  if (args.format === "report") {
    const project = await loadProject(args.target, args.config);
    if (project instanceof ArchitectureError) return project;
    return checkArchitecture(project.root, project.architecture, { configFile: project.configPath, format: "report" });
  }
  return checkCommand(args);
};

type Command = Exclude<CliArgs, { readonly kind: "help" | "error" | "lsp" }>;

const dispatch = async (args: Command): Promise<number | ArchitectureError> => {
  switch (args.kind) {
    case "run":
      return runCheck(args);
    case "status":
      return statusCommand(args);
    case "graph":
      return graphCommand(args);
    case "map":
      return mapCommand(args);
    case "rules":
      return rulesCommand(args.json);
    case "baseline":
      return baselineCommand(args);
    case "baseline-merge":
      return mergeBaselineFiles(args.ancestor, args.current, args.other);
    case "doctor":
      return doctorCommand(args);
    case "adopt":
      return adoptCommand(args.output);
    case "fix":
      return fixCommand(args);
  }
};

const run = async (args: Command): Promise<number> => {
  const outcome = await tryCatchAsync(async () => dispatch(args));
  return outcome instanceof ArchitectureError ? printError(outcome) : outcome;
};

const main = async (): Promise<number> => {
  const args = parseArgs(process.argv.slice(2));
  switch (args.kind) {
    case "help":
      return printHelp();
    case "error":
      return printUsageError(args.message);
    case "lsp":
      return startServer();
    case "run":
    case "status":
    case "graph":
    case "map":
    case "rules":
    case "baseline":
    case "baseline-merge":
    case "doctor":
    case "adopt":
    case "fix":
      return run(args);
  }
};

process.exitCode = await main();
