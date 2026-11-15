import { readonlyTypePropertiesRule } from "../src/rules/readonlyTypeProperties.rule.js";
import { runCustomRule } from "./utils/runCustomRule.js";
import { readonlyTypePropertiesCases } from "../src/rules/cases/readonlyTypeProperties.cases.js";

runCustomRule(readonlyTypePropertiesRule, readonlyTypePropertiesCases);
