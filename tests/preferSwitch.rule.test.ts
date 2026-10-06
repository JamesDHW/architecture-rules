import { preferSwitchRule } from "../src/rules/preferSwitch.rule.js";
import { runCustomRule } from "./utils/runCustomRule.js";
import { preferSwitchCases } from "../src/rules/cases/preferSwitch.cases.js";

runCustomRule(preferSwitchRule, preferSwitchCases);
