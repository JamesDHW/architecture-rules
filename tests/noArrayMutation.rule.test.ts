import { noArrayMutationRule } from "../src/rules/noArrayMutation.rule.js";
import { runCustomRule } from "./utils/runCustomRule.js";
import { noArrayMutationCases } from "../src/rules/cases/noArrayMutation.cases.js";

runCustomRule(noArrayMutationRule, noArrayMutationCases);
