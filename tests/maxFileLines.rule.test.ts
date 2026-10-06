import { maxFileLinesWarnRule } from "../src/rules/maxFileLines.rule.js";
import { runCustomRule } from "./utils/runCustomRule.js";
import { maxFileLinesWarnCases } from "../src/rules/cases/maxFileLinesWarn.cases.js";

runCustomRule(maxFileLinesWarnRule, maxFileLinesWarnCases);
