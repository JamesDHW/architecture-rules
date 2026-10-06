import { collectionLoopsCases } from "./collectionLoops.cases.js";
import { constantsModuleCases } from "./constantsModule.cases.js";
import { controlFlowBracesCases } from "./controlFlowBraces.cases.js";
import { destructuredPropsCases } from "./destructuredProps.cases.js";
import { domainOwnedDispatchCases } from "./domainOwnedDispatch.cases.js";
import { emptyBranchesCases } from "./emptyBranches.cases.js";
import { fileNamingCases } from "./fileNaming.cases.js";
import { groupedLogicalOperatorsCases } from "./groupedLogicalOperators.cases.js";
import { maxFileLinesWarnCases } from "./maxFileLinesWarn.cases.js";
import { namedDivisibilityCases } from "./namedDivisibility.cases.js";
import { namedJsxHandlersCases } from "./namedJsxHandlers.cases.js";
import { namedPredicatesCases } from "./namedPredicates.cases.js";
import { noArrayMutationCases } from "./noArrayMutation.cases.js";
import { noBindingAliasCases } from "./noBindingAlias.cases.js";
import { noBooleanIfElseCases } from "./noBooleanIfElse.cases.js";
import { noCapturedMutationCases } from "./noCapturedMutation.cases.js";
import { noCollapsibleIfCases } from "./noCollapsibleIf.cases.js";
import { noDeepRelativeImportsCases } from "./noDeepRelativeImports.cases.js";
import { noElseCases } from "./noElse.cases.js";
import { noEnumsCases } from "./noEnums.cases.js";
import { noFinallyCases } from "./noFinally.cases.js";
import { noLetCases } from "./noLet.cases.js";
import { noLoopJumpsCases } from "./noLoopJumps.cases.js";
import { noRawExceptionsCases } from "./noRawExceptions.cases.js";
import { noTypeAssertionsCases } from "./noTypeAssertions.cases.js";
import { onePathOneResultCases } from "./onePathOneResult.cases.js";
import { preferSingleBooleanReturnCases } from "./preferSingleBooleanReturn.cases.js";
import { preferSwitchCases } from "./preferSwitch.cases.js";
import { pureConditionsCases } from "./pureConditions.cases.js";
import { readonlyTypePropertiesCases } from "./readonlyTypeProperties.cases.js";
import { simpleTernariesCases } from "./simpleTernaries.cases.js";
import { terminalSwitchCasesCases } from "./terminalSwitchCases.cases.js";
/** Every custom rule's test cases by rule id: the tests run them and the generated rule documentation shows them. */
export const ruleCases = {
    "collection-loops": collectionLoopsCases,
    "constants-module": constantsModuleCases,
    "control-flow-braces": controlFlowBracesCases,
    "destructured-props": destructuredPropsCases,
    "domain-owned-dispatch": domainOwnedDispatchCases,
    "no-empty-branches": emptyBranchesCases,
    "file-naming": fileNamingCases,
    "grouped-logical-operators": groupedLogicalOperatorsCases,
    "max-file-lines-warn": maxFileLinesWarnCases,
    "named-divisibility": namedDivisibilityCases,
    "named-jsx-handlers": namedJsxHandlersCases,
    "named-predicates": namedPredicatesCases,
    "no-array-mutation": noArrayMutationCases,
    "no-binding-alias": noBindingAliasCases,
    "no-boolean-if-else": noBooleanIfElseCases,
    "no-captured-mutation": noCapturedMutationCases,
    "no-collapsible-if": noCollapsibleIfCases,
    "no-deep-relative-imports": noDeepRelativeImportsCases,
    "no-else": noElseCases,
    "no-enums": noEnumsCases,
    "no-finally": noFinallyCases,
    "no-let": noLetCases,
    "no-loop-jumps": noLoopJumpsCases,
    "no-raw-exceptions": noRawExceptionsCases,
    "no-type-assertions": noTypeAssertionsCases,
    "one-path-one-result": onePathOneResultCases,
    "prefer-single-boolean-return": preferSingleBooleanReturnCases,
    "prefer-switch": preferSwitchCases,
    "pure-conditions": pureConditionsCases,
    "readonly-type-properties": readonlyTypePropertiesCases,
    "simple-ternaries": simpleTernariesCases,
    "terminal-switch-cases": terminalSwitchCasesCases,
};
//# sourceMappingURL=ruleCases.js.map