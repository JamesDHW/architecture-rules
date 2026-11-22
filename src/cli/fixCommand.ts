
import { matches } from "../analysis/paths.js";
import { baselineOf, readBaseline, writeBaseline, type BaselineEntry } from "../baseline/baselineFile.js";
import { ArchitectureError } from "../errors/architectureError.js";
import { projectAliases } from "../runner/projectAliases.js";
import { applyAliases } from "./aliasFix.js";
import { inspectProject, type InspectedProject } from "./inspectProject.js";
import { applyRenames, planRenames, type Rename } from "./renameFix.js";

type FixArgs = { readonly target: string; readonly config?: string; readonly rule: string; readonly paths: readonly string[] };

const report = (lines: readonly string[]): number => {
  process.stdout.write(`${[...lines, "Run architecture-check to see what is left."].join("\n")}\n`);
  return 0;
};

/** Recorded debt follows each renamed file; its naming entry goes, since the rename fixed it. */
const renamedBaseline = (project: InspectedProject, renames: readonly Rename[]): readonly string[] | ArchitectureError => {
  const { root, result } = project;
  const recorded = readBaseline(root, result.workspaces);
  if (recorded instanceof ArchitectureError) return recorded;
  const moved = new Map(renames.map((rename) => [rename.from, rename.to]));
  const entries = [...recorded.values()].flatMap((entry): readonly BaselineEntry[] => {
    const to = moved.get(entry.file);
    if (to === undefined) return [entry];
    return entry.rule === "file-naming" ? [] : [{ ...entry, file: to }];
  });
  return renames.length === 0 ? [] : writeBaseline(root, result.workspaces, baselineOf(entries));
};

const fixNaming = (project: InspectedProject, inScope: (file: string) => boolean): number | ArchitectureError => {
  const plan = planRenames(project.result, inScope);
  const changed = applyRenames(project.root, project.result, plan.renames);
  if (changed instanceof ArchitectureError) return changed;
  const written = renamedBaseline(project, plan.renames);
  if (written instanceof ArchitectureError) return written;
  return report([
    ...plan.renames.map((rename) => `renamed  ${rename.from} → ${rename.to}`),
    ...plan.skipped.map((skip) => `skipped  ${skip.file}: ${skip.reason}`),
    `${plan.renames.length} files renamed, ${changed} imports updated, ${plan.skipped.length} left for a person.`,
  ]);
};

const fixDeepImports = async (project: InspectedProject, inScope: (file: string) => boolean): Promise<number | ArchitectureError> => {
  const aliases = await projectAliases(project.root, project.architecture);
  if (aliases instanceof ArchitectureError) return aliases;
  const findings = project.result.findings.filter((finding) => finding.ruleId === "no-deep-relative-imports" && inScope(finding.file));
  const applied = applyAliases(project.root, findings, aliases);
  if (applied instanceof ArchitectureError) return applied;
  const missing = applied.unchanged === 0 ? [] : [`${applied.unchanged} imports reach a file no path alias covers: add an alias to the tsconfig, or move the code.`];
  return report([`${applied.changed} imports now use a path alias.`, ...missing]);
};

/**
 * architecture-check fix --rule <id>: fixes every finding of a rule whose fix is mechanical, in one sweep. Naming
 * renames files and updates their imports; deep relative imports go through the projects' path aliases.
 */
export const fixCommand = async (args: FixArgs): Promise<number | ArchitectureError> => {
  const isSupported = args.rule === "file-naming" || args.rule === "no-deep-relative-imports";
  if (!isSupported) return new ArchitectureError([`architecture-check fix supports file-naming and no-deep-relative-imports, not ${args.rule}. Lint fixes run with architecture-check --fix.`]);
  const project = await inspectProject(args.target, args.config);
  if (project instanceof ArchitectureError) return project;
  if (!project.result.complete) return new ArchitectureError(["Structural findings stopped the check; fix them before a sweep."]);
  const inScope = (file: string): boolean => args.paths.length === 0 || matches(file, args.paths);
  return args.rule === "file-naming" ? fixNaming(project, inScope) : fixDeepImports(project, inScope);
};

