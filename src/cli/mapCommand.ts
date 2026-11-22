import { ArchitectureError } from "../errors/architectureError.js";
import { classifyProject } from "../runner/classifyProject.js";
import { loadProject } from "./inspectProject.js";

type MapArgs = { readonly target: string; readonly config?: string; readonly json: boolean };

const isClassificationIssue = (issue: { readonly ruleId: string }): boolean => issue.ruleId === "file-classification";

/**
 * Which layer each source file belongs to, and the files no layer (or several) claims. Adoption loops on this until
 * every file is classified; a classification problem cannot be excepted or baselined, so it exits 1.
 */
export const mapCommand = async (args: MapArgs): Promise<number | ArchitectureError> => {
  const project = await loadProject(args.target, args.config);
  if (project instanceof ArchitectureError) return project;
  const tree = await classifyProject(project.root, project.architecture);
  if (tree instanceof ArchitectureError) return tree;
  const unclassified = tree.issues.filter(isClassificationIssue).map((issue) => ({ file: issue.file, problem: issue.message }));
  const files = tree.files.map((file) => ({ file: file.relative, layer: file.layer }));
  if (args.json) {
    process.stdout.write(`${JSON.stringify({ files, unclassified }, null, 2)}\n`);
    return unclassified.length === 0 ? 0 : 1;
  }
  const width = Math.max(0, ...files.map((entry) => entry.layer.length));
  const lines = files.map((entry) => `${entry.layer.padEnd(width)}  ${entry.file}`);
  const problems = unclassified.map((entry) => `${"✗".padEnd(width)}  ${entry.file}  ${entry.problem}`);
  const counts = Map.groupBy(files, (entry) => entry.layer);
  const summary = [...counts].map(([layer, group]) => `${layer} ${group.length}`).join(" · ");
  const headline = unclassified.length === 0 ? `✓ ${files.length} files, all classified` : `✗ ${unclassified.length} files match no layer or several`;
  process.stdout.write(`${[...lines, ...problems, "", headline, `  by layer: ${summary}`].join("\n")}\n`);
  return unclassified.length === 0 ? 0 : 1;
};
