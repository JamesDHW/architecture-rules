import { namedJsxHandlersRule } from "../src/rules/namedJsxHandlers.rule.js";
import { runCustomRule } from "./utils/runCustomRule.js";
import { namedJsxHandlersCases } from "../src/rules/cases/namedJsxHandlers.cases.js";

runCustomRule(namedJsxHandlersRule, namedJsxHandlersCases);
