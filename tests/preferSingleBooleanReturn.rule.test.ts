import { preferSingleBooleanReturnRule } from "../src/rules/preferSingleBooleanReturn.rule.js";
import { runCustomRule } from "./utils/runCustomRule.js";
import { preferSingleBooleanReturnCases } from "../src/rules/cases/preferSingleBooleanReturn.cases.js";

runCustomRule(preferSingleBooleanReturnRule, preferSingleBooleanReturnCases);
