import { constantsModuleRule } from "../src/rules/constantsModule.rule.js";
import { runCustomRule } from "./utils/runCustomRule.js";
import { constantsModuleCases } from "../src/rules/cases/constantsModule.cases.js";

runCustomRule(constantsModuleRule, constantsModuleCases);
