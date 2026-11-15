import { onePathOneResultRule } from "../src/rules/onePathOneResult.rule.js";
import { runCustomRule } from "./utils/runCustomRule.js";
import { onePathOneResultCases } from "../src/rules/cases/onePathOneResult.cases.js";

runCustomRule(onePathOneResultRule, onePathOneResultCases);
