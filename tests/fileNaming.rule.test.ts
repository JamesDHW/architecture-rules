import { fileNamingRule } from "../src/rules/fileNaming.rule.js";
import { runCustomRule } from "./utils/runCustomRule.js";
import { fileNamingCases } from "../src/rules/cases/fileNaming.cases.js";

runCustomRule(fileNamingRule, fileNamingCases);
