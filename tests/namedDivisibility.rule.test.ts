import { namedDivisibilityRule } from "../src/rules/namedDivisibility.rule.js";
import { runCustomRule } from "./utils/runCustomRule.js";
import { namedDivisibilityCases } from "../src/rules/cases/namedDivisibility.cases.js";

runCustomRule(namedDivisibilityRule, namedDivisibilityCases);
