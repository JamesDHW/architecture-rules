import { noCollapsibleIfRule } from "../src/rules/noCollapsibleIf.rule.js";
import { runCustomRule } from "./utils/runCustomRule.js";
import { noCollapsibleIfCases } from "../src/rules/cases/noCollapsibleIf.cases.js";

runCustomRule(noCollapsibleIfRule, noCollapsibleIfCases);
