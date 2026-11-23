import type { ArchitectureRule } from "../core/defineRule.js";

/** The name the Oxlint config and suppression comments use for a lint rule, such as architecture/no-let; undefined when the rule is not a lint rule. */
export const lintRuleName = (rule: ArchitectureRule): string | undefined => {
  const { enforcement } = rule;
  switch (enforcement.type) {
    case "oxlint":
      return enforcement.rule.includes("/") ? enforcement.rule : `eslint/${enforcement.rule}`;
    case "custom-oxlint":
      return `architecture/${rule.id}`;
    case "typescript":
    case "advisory":
    case "dead-code":
    case "program":
    case "configuration":
    case "architecture":
      return undefined;
  }
};

/**
 * Every name the engine may use for a lint rule: its configured name, and for React's hook rules the react-hooks
 * name the engine reports them and their disable comments under.
 */
export const lintNameAliases = (lintName: string): readonly string[] => {
  return lintName.startsWith("react/") ? [lintName, lintName.replace(/^react\//, "react-hooks/")] : [lintName];
};

/** How Oxlint labels a lint rule's findings: architecture/no-let becomes architecture(no-let). */
export const diagnosticCode = (lintName: string): string => {
  const [plugin, ...name] = lintName.split("/");
  return `${plugin ?? ""}(${name.join("/")})`;
};

/** Lint, dead-code and program rules can be excepted on a line; structural, configuration and compiler checks always apply. */
export const isExceptable = (rule: ArchitectureRule): boolean => {
  switch (rule.enforcement.type) {
    case "oxlint":
    case "custom-oxlint":
    case "dead-code":
    case "program":
      return true;
    case "typescript":
    case "advisory":
    case "configuration":
    case "architecture":
      return false;
  }
};
