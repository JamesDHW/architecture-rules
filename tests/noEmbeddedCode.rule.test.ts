import { noEmbeddedCodeRule } from "../src/rules/noEmbeddedCode.rule.js";
import { runCustomRule } from "./utils/runCustomRule.js";
import { noEmbeddedCodeCases } from "../src/rules/cases/noEmbeddedCode.cases.js";

runCustomRule(noEmbeddedCodeRule, noEmbeddedCodeCases);
