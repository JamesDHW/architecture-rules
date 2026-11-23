import type { ConfigText } from "../analysis/configurationChecks.js";
import { checkGlossaries } from "../analysis/glossary/check.js";
import type { NameIssue } from "../analysis/glossary/nameIssues.js";
import type { ClassifiedFile, Issue } from "../analysis/inventory.js";
import type { Projects } from "../analysis/projects.js";
import type { Architecture, EffectiveRule } from "../config/types.js";
import type { Finding } from "./findings.js";

type Glossary = { readonly names: readonly Finding[]; readonly configuration: readonly Finding[] };

const finding = (issue: NameIssue, rule: EffectiveRule | undefined): readonly Finding[] => {
  const severity = rule?.severity ?? "error";
  if (severity === "off") return [];
  return [{
    source: "glossary", severity: severity === "warn" ? "warning" : "error", ruleId: issue.ruleId, file: issue.file, message: issue.message,
    ...(issue.line === undefined ? {} : { line: issue.line }), ...(issue.column === undefined ? {} : { column: issue.column }),
  }];
};

/**
 * Glossary findings: about names in the checked files, at the severity their layer gives each rule, and about the
 * glossaries in the configuration, at the project-wide severity.
 */
type Scope = {
  readonly architecture: Architecture;
  readonly opened: Projects;
  readonly files: readonly ClassifiedFile[];
  /** The files whose names to check now; the rest have cached findings or are outside the selection. */
  readonly checked: readonly ClassifiedFile[];
  readonly config: ConfigText;
};

export const glossaryFindings = ({ architecture, opened, files, checked, config }: Scope): Glossary => {
  const result = checkGlossaries({ architecture, files, projects: opened.projects, config, checked: new Set(checked.map((file) => file.relative)) });
  const byPath = new Map(files.map((file) => [file.relative, file]));
  const projectWide = (issue: Issue): readonly Finding[] => finding(issue, architecture.defaults.rules[issue.ruleId]);
  return {
    names: result.names.flatMap((issue) => finding(issue, byPath.get(issue.file)?.policy.rules[issue.ruleId])),
    configuration: result.configuration.flatMap(projectWide),
  };
};
