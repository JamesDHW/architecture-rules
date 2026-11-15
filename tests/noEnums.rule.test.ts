import { noEnumsRule } from "../src/rules/noEnums.rule.js";
import { runCustomRule } from "./utils/runCustomRule.js";
import { noEnumsCases } from "../src/rules/cases/noEnums.cases.js";

runCustomRule(noEnumsRule, noEnumsCases);
