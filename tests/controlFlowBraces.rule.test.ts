import { controlFlowBracesRule } from "../src/rules/controlFlowBraces.rule.js";
import { runCustomRule } from "./utils/runCustomRule.js";
import { controlFlowBracesCases } from "../src/rules/cases/controlFlowBraces.cases.js";

runCustomRule(controlFlowBracesRule, controlFlowBracesCases);
