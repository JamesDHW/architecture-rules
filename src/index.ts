export { defineArchitecture } from "./config/defineArchitecture.js";
export { defineRule, defineRuleOptions } from "./core/defineRule.js";
export { rules, type ArchitectureRuleId } from "./rules/index.js";
export type {
  Architecture, ArchitectureInput, LayerDefinition, Policy, DependencyPolicy, TypeScriptProjects, FileRules, ProjectRules, RuleSetting, OptionsFor,
} from "./config/types.js";
export type { NamingCase, NamingPolicy } from "./rules/namingPolicy.js";
