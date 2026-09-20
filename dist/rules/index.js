import { fileInventoryRule, fileClassificationRule, projectMembershipRule, compilerCheckingRule, reasonedSuppressionsRule } from "./architecture.rules.js";
import { allowedImportsRule } from "./allowedImports.rule.js";
import { directBooleanConditionsRule, explicitConditionalEffectsRule, neutralCollectionResultsRule, noDuplicateSwitchCasesRule, noUnreachableStatementsRule, scopedCaseDeclarationsRule, subjectFirstComparisonsRule, unnecessaryConditionsRule, } from "./branchingSafety.rules.js";
import { noFinallyRule, noRawExceptionsRule, preserveCleanupFailuresRule } from "./exceptionControlFlow.rules.js";
import { domainOwnedDispatchRule } from "./domainOwnedDispatch.rule.js";
import { exhaustiveValueMappingsRule } from "./exhaustiveValueMappings.rule.js";
import { emptyBranchesRule } from "./emptyBranches.rule.js";
import { groupedLogicalOperatorsRule } from "./groupedLogicalOperators.rule.js";
import { collectionLoopsRule, noLoopJumpsRule } from "./loopControl.rules.js";
import { pureConditionsRule } from "./pureConditions.rule.js";
import { terminalSwitchCasesRule } from "./terminalSwitchCases.rule.js";
import { controlFlowBracesRule } from "./controlFlowBraces.rule.js";
import { simpleTernariesRule } from "./simpleTernaries.rule.js";
import { uncheckedIndexedAccessRule } from "./uncheckedIndexedAccess.rule.js";
import { constantsModuleRule } from "./constantsModule.rule.js";
import { exactOptionalPropertyTypesRule } from "./exactOptionalPropertyTypes.rule.js";
import { explicitConditionsRule } from "./explicitConditions.rule.js";
import { fileNamingRule } from "./fileNaming.rule.js";
import { forceConsistentCasingInFileNamesRule } from "./forceConsistentCasingInFileNames.rule.js";
import { maxFileLinesRule, maxFileLinesWarnRule, } from "./maxFileLines.rule.js";
import { namedJsxHandlersRule } from "./namedJsxHandlers.rule.js";
import { namedPredicatesRule } from "./namedPredicates.rule.js";
import { asyncAwaitRule, awaitThenableRule, eqeqeqRule, exhaustiveDepsRule, explicitExportedReturnTypesRule, explicitJsxPropsRule, guardClausesRule, genericNameDenylistRule, jsxKeyRule, moduleScopeComponentsRule, namedExportsRule, noBooleanCastRule, noCycleRule, noExplicitAnyRule, noFloatingPromisesRule, noForEachRule, noMisusedPromisesRule, noNonNullAssertionRule, noParamReassignRule, noTsCommentsRule, noUnsafeArgumentRule, noUnsafeAssignmentRule, noUnsafeCallRule, noUnsafeMemberAccessRule, noUnsafeReturnRule, noUnsafeTypeAssertionRule, noUnneededTernaryRule, noUselessAssignmentRule, noVarRule, nullishDefaultsRule, preferArrowCallbackRule, preferArrowFunctionsRule, preferAtRule, preferConstRule, preferLogicalOverTernaryRule, reduceSimpleFoldsRule, rulesOfHooksRule, switchExhaustivenessRule, typeAliasesRule, } from "./nativeOxlint.rules.js";
import { namedDivisibilityRule } from "./namedDivisibility.rule.js";
import { noBooleanAssignmentBranchesRule } from "./noBooleanAssignmentBranches.rule.js";
import { noBooleanIfElseRule } from "./noBooleanIfElse.rule.js";
import { noCollapsibleIfRule } from "./noCollapsibleIf.rule.js";
import { noElseRule } from "./noElse.rule.js";
import { noBindingAliasRule } from "./noBindingAlias.rule.js";
import { noDeepRelativeImportsRule } from "./noDeepRelativeImports.rule.js";
import { noEnumsRule } from "./noEnums.rule.js";
import { noFallthroughCasesInSwitchRule } from "./noFallthroughCasesInSwitch.rule.js";
import { noImplicitOverrideRule } from "./noImplicitOverride.rule.js";
import { noImplicitReturnsRule } from "./noImplicitReturns.rule.js";
import { noTypeAssertionsRule } from "./noTypeAssertions.rule.js";
import { onePathOneResultRule } from "./onePathOneResult.rule.js";
import { preferSingleBooleanReturnRule } from "./preferSingleBooleanReturn.rule.js";
import { preferSwitchRule } from "./preferSwitch.rule.js";
import { readonlyTypePropertiesRule } from "./readonlyTypeProperties.rule.js";
import { strictTypeScriptRule } from "./strictTypeScript.rule.js";
export const rules = [
    fileInventoryRule, fileClassificationRule, projectMembershipRule, compilerCheckingRule, reasonedSuppressionsRule,
    allowedImportsRule,
    domainOwnedDispatchRule,
    controlFlowBracesRule,
    directBooleanConditionsRule,
    explicitConditionalEffectsRule,
    neutralCollectionResultsRule,
    noDuplicateSwitchCasesRule,
    noUnreachableStatementsRule,
    scopedCaseDeclarationsRule,
    subjectFirstComparisonsRule,
    unnecessaryConditionsRule,
    noFinallyRule,
    noRawExceptionsRule,
    preserveCleanupFailuresRule,
    exhaustiveValueMappingsRule,
    emptyBranchesRule,
    groupedLogicalOperatorsRule,
    collectionLoopsRule,
    noLoopJumpsRule,
    pureConditionsRule,
    terminalSwitchCasesRule,
    explicitConditionsRule,
    simpleTernariesRule,
    fileNamingRule,
    strictTypeScriptRule,
    uncheckedIndexedAccessRule,
    exactOptionalPropertyTypesRule,
    noImplicitReturnsRule,
    noFallthroughCasesInSwitchRule,
    noImplicitOverrideRule,
    forceConsistentCasingInFileNamesRule,
    explicitExportedReturnTypesRule,
    preferArrowFunctionsRule,
    preferArrowCallbackRule,
    preferConstRule,
    noVarRule,
    noParamReassignRule,
    reduceSimpleFoldsRule,
    noForEachRule,
    preferAtRule,
    nullishDefaultsRule,
    eqeqeqRule,
    asyncAwaitRule,
    namedExportsRule,
    typeAliasesRule,
    noCycleRule,
    explicitJsxPropsRule,
    moduleScopeComponentsRule,
    maxFileLinesWarnRule,
    maxFileLinesRule,
    guardClausesRule,
    genericNameDenylistRule,
    noExplicitAnyRule,
    noNonNullAssertionRule,
    noTsCommentsRule,
    noUnsafeAssignmentRule,
    noUnsafeCallRule,
    noUnsafeMemberAccessRule,
    noUnsafeReturnRule,
    noUnsafeArgumentRule,
    noUnsafeTypeAssertionRule,
    switchExhaustivenessRule,
    noFloatingPromisesRule,
    noMisusedPromisesRule,
    awaitThenableRule,
    rulesOfHooksRule,
    exhaustiveDepsRule,
    jsxKeyRule,
    noBooleanCastRule,
    noUnneededTernaryRule,
    preferLogicalOverTernaryRule,
    noUselessAssignmentRule,
    namedPredicatesRule,
    namedDivisibilityRule,
    noElseRule,
    noCollapsibleIfRule,
    noBooleanIfElseRule,
    noBooleanAssignmentBranchesRule,
    preferSingleBooleanReturnRule,
    onePathOneResultRule,
    preferSwitchRule,
    noEnumsRule,
    noTypeAssertionsRule,
    readonlyTypePropertiesRule,
    noBindingAliasRule,
    noDeepRelativeImportsRule,
    constantsModuleRule,
    namedJsxHandlersRule,
];
//# sourceMappingURL=index.js.map