import { noBooleanIfElseRule } from "../src/rules/noBooleanIfElse.rule.js";
import { runCustomRule } from "./utils/runCustomRule.js";
import { noBooleanIfElseCases } from "../src/rules/cases/noBooleanIfElse.cases.js";

runCustomRule(noBooleanIfElseRule, noBooleanIfElseCases);
