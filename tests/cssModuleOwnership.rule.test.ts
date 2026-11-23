import { cssModuleOwnershipRule } from "../src/rules/cssModuleOwnership.rule.js";
import { runCustomRule } from "./utils/runCustomRule.js";
import { cssModuleOwnershipCases } from "../src/rules/cases/cssModuleOwnership.cases.js";

runCustomRule(cssModuleOwnershipRule, cssModuleOwnershipCases);
