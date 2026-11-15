import { noLetRule } from "../src/rules/noLet.rule.js";
import { runCustomRule } from "./utils/runCustomRule.js";
import { noLetCases } from "../src/rules/cases/noLet.cases.js";

runCustomRule(noLetRule, noLetCases);
