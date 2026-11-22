import { join } from "node:path";
import { fileURLToPath } from "node:url";

import type { ArchitectureRule } from "../core/defineRule.js";
import { rules } from "../rules/index.js";

/** The rules `architecture-check fix` can apply by itself. */
const commandFixes: Readonly<Record<string, string>> = {
  "file-naming": "architecture-check fix --rule file-naming",
  "no-deep-relative-imports": "architecture-check fix --rule no-deep-relative-imports",
};

/** How a rule is checked, in the words the catalogue uses rather than the engines' names. */
const kindOf = (rule: ArchitectureRule): string => {
  switch (rule.enforcement.type) {
    case "oxlint":
    case "custom-oxlint":
      return "lint";
    case "typescript":
      return "compiler";
    case "dead-code":
      return "dead code";
    case "glossary":
      return "glossary";
    case "configuration":
      return "configuration";
    case "advisory":
      return "advisory";
    case "architecture":
      return "structure";
  }
};

const defaultSetting = (rule: ArchitectureRule): unknown => {
  const { enforcement } = rule;
  if ("configuration" in enforcement) return enforcement.configuration;
  return enforcement.type === "architecture" ? "error, always" : undefined;
};

const lintFixable = (rule: ArchitectureRule): boolean => {
  const { enforcement } = rule;
  return enforcement.type === "custom-oxlint" && enforcement.implementation.meta?.fixable !== undefined;
};

/** What fixes a rule's findings without a person: `--fix` for lint fixes, or a command. */
type Autofix = { readonly lintFix: boolean; readonly command?: string };

const autofixOf = (rule: ArchitectureRule): Autofix => {
  const command = commandFixes[rule.id];
  return { lintFix: lintFixable(rule), ...(command === undefined ? {} : { command }) };
};

const docsDirectory = fileURLToPath(new URL("../../docs/rules/", import.meta.url));

/** One rule in the catalogue: what it checks and how to deal with its findings. */
export type CatalogueEntry = {
  readonly id: string;
  readonly title: string;
  readonly kind: string;
  readonly default: unknown;
  readonly description: string;
  readonly instead?: string;
  readonly exceptionWhen?: string;
  readonly autofix: Autofix;
  readonly docs: string;
};

export const catalogueEntry = (rule: ArchitectureRule): CatalogueEntry => ({
  id: rule.id,
  title: rule.title,
  kind: kindOf(rule),
  default: defaultSetting(rule),
  description: rule.description,
  ...(rule.instead === undefined ? {} : { instead: rule.instead }),
  ...(rule.suppressWhen === undefined ? {} : { exceptionWhen: rule.suppressWhen }),
  autofix: autofixOf(rule),
  docs: join(docsDirectory, `${rule.id}.md`),
});

export const ruleById = (id: string): ArchitectureRule | undefined => rules.find((rule) => rule.id === id);

/** Every rule, for an adoption agent mapping another linter's rules onto these. */
export const catalogue = (): readonly CatalogueEntry[] => rules.map(catalogueEntry);
