import { uncheckedIndexedAccessRule } from "./uncheckedIndexedAccess.rule.js";
import { exactOptionalPropertyTypesRule } from "./exactOptionalPropertyTypes.rule.js";
import { explicitConditionsRule } from "./explicitConditions.rule.js";
import { fileNamingRule } from "./fileNaming.rule.js";
import { forceConsistentCasingInFileNamesRule } from "./forceConsistentCasingInFileNames.rule.js";
import { noFallthroughCasesInSwitchRule } from "./noFallthroughCasesInSwitch.rule.js";
import { noImplicitOverrideRule } from "./noImplicitOverride.rule.js";
import { noImplicitReturnsRule } from "./noImplicitReturns.rule.js";
import { strictTypeScriptRule } from "./strictTypeScript.rule.js";

export const rules = [
  explicitConditionsRule,
  fileNamingRule,
  strictTypeScriptRule,
  uncheckedIndexedAccessRule,
  exactOptionalPropertyTypesRule,
  noImplicitReturnsRule,
  noFallthroughCasesInSwitchRule,
  noImplicitOverrideRule,
  forceConsistentCasingInFileNamesRule,
] as const;

export type ArchitectureRuleId = (typeof rules)[number]["id"];
