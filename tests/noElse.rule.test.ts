import { noElseRule } from "../src/rules/noElse.rule.js";
import { runCustomRule } from "./utils/runCustomRule.js";
import { noElseCases } from "../src/rules/cases/noElse.cases.js";

runCustomRule(noElseRule, noElseCases);
