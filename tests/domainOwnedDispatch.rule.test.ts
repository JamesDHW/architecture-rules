import { domainOwnedDispatchRule } from "../src/rules/domainOwnedDispatch.rule.js";
import { runCustomRule } from "./utils/runCustomRule.js";
import { domainOwnedDispatchCases } from "../src/rules/cases/domainOwnedDispatch.cases.js";

runCustomRule(domainOwnedDispatchRule, domainOwnedDispatchCases);
