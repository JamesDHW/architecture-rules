import { noTypeAssertionsRule } from "../src/rules/noTypeAssertions.rule.js";
import { runCustomRule } from "./utils/runCustomRule.js";
import { noTypeAssertionsCases } from "../src/rules/cases/noTypeAssertions.cases.js";

runCustomRule(noTypeAssertionsRule, noTypeAssertionsCases);
