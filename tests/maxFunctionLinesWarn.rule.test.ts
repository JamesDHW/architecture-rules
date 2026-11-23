import { maxFunctionLinesWarnRule } from "../src/rules/maxFunctionLines.rule.js";
import { runCustomRule } from "./utils/runCustomRule.js";
import { maxFunctionLinesWarnCases } from "../src/rules/cases/maxFunctionLinesWarn.cases.js";

runCustomRule(maxFunctionLinesWarnRule, maxFunctionLinesWarnCases);
