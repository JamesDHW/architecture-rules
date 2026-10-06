import { namedPredicatesRule } from "../src/rules/namedPredicates.rule.js";
import { runCustomRule } from "./utils/runCustomRule.js";
import { namedPredicatesCases } from "../src/rules/cases/namedPredicates.cases.js";

runCustomRule(namedPredicatesRule, namedPredicatesCases);
