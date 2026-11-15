import { simpleTernariesRule } from "../src/rules/simpleTernaries.rule.js";
import { runCustomRule } from "./utils/runCustomRule.js";
import { simpleTernariesCases } from "../src/rules/cases/simpleTernaries.cases.js";

runCustomRule(simpleTernariesRule, simpleTernariesCases);
