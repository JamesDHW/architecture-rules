import { noDeepRelativeImportsRule } from "../src/rules/noDeepRelativeImports.rule.js";
import { runCustomRule } from "./utils/runCustomRule.js";
import { noDeepRelativeImportsCases } from "../src/rules/cases/noDeepRelativeImports.cases.js";

runCustomRule(noDeepRelativeImportsRule, noDeepRelativeImportsCases);
