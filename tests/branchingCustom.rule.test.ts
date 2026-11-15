import { emptyBranchesRule } from "../src/rules/emptyBranches.rule.js";
import { noFinallyRule } from "../src/rules/noFinally.rule.js";
import { noRawExceptionsRule } from "../src/rules/noRawExceptions.rule.js";
import { groupedLogicalOperatorsRule } from "../src/rules/groupedLogicalOperators.rule.js";
import {
  collectionLoopsRule,
  noLoopJumpsRule,
} from "../src/rules/loopControl.rules.js";
import { pureConditionsRule } from "../src/rules/pureConditions.rule.js";
import { terminalSwitchCasesRule } from "../src/rules/terminalSwitchCases.rule.js";
import { runCustomRule } from "./utils/runCustomRule.js";
import { collectionLoopsCases } from "../src/rules/cases/collectionLoops.cases.js";
import { noLoopJumpsCases } from "../src/rules/cases/noLoopJumps.cases.js";
import { terminalSwitchCasesCases } from "../src/rules/cases/terminalSwitchCases.cases.js";
import { groupedLogicalOperatorsCases } from "../src/rules/cases/groupedLogicalOperators.cases.js";
import { emptyBranchesCases } from "../src/rules/cases/emptyBranches.cases.js";
import { pureConditionsCases } from "../src/rules/cases/pureConditions.cases.js";
import { noRawExceptionsCases } from "../src/rules/cases/noRawExceptions.cases.js";
import { noFinallyCases } from "../src/rules/cases/noFinally.cases.js";

runCustomRule(collectionLoopsRule, collectionLoopsCases);
runCustomRule(noLoopJumpsRule, noLoopJumpsCases);
runCustomRule(terminalSwitchCasesRule, terminalSwitchCasesCases);
runCustomRule(groupedLogicalOperatorsRule, groupedLogicalOperatorsCases);
runCustomRule(emptyBranchesRule, emptyBranchesCases);
runCustomRule(pureConditionsRule, pureConditionsCases);
runCustomRule(noRawExceptionsRule, noRawExceptionsCases);
runCustomRule(noFinallyRule, noFinallyCases);
