import { noCapturedMutationRule } from "../src/rules/noCapturedMutation.rule.js";
import { runCustomRule } from "./utils/runCustomRule.js";
import { noCapturedMutationCases } from "../src/rules/cases/noCapturedMutation.cases.js";

runCustomRule(noCapturedMutationRule, noCapturedMutationCases);
