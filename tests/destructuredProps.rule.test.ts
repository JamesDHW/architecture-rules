import { destructuredPropsRule } from "../src/rules/destructuredProps.rule.js";
import { runCustomRule } from "./utils/runCustomRule.js";
import { destructuredPropsCases } from "../src/rules/cases/destructuredProps.cases.js";

runCustomRule(destructuredPropsRule, destructuredPropsCases);
