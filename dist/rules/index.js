import { fileInventoryRule, fileClassificationRule, projectMembershipRule, compilerCheckingRule, reasonedSuppressionsRule } from "./architecture.rules.js";
import { allowedImportsRule } from "./allowedImports.rule.js";
import { asyncAwaitRule, awaitThenableRule, noFloatingPromisesRule, noMisusedPromisesRule } from "./asyncFlow.rules.js";
import { directBooleanConditionsRule, explicitConditionalEffectsRule, neutralCollectionResultsRule, noDuplicateSwitchCasesRule, noUnreachableStatementsRule, scopedCaseDeclarationsRule, subjectFirstComparisonsRule, unnecessaryConditionsRule, } from "./branchingSafety.rules.js";
import { noForEachRule, preferAtRule, reduceSimpleFoldsRule } from "./collectionOperations.rules.js";
import { eqeqeqRule, guardClausesRule, noBooleanCastRule, noUnneededTernaryRule, nullishDefaultsRule, preferLogicalOverTernaryRule } from "./conditions.rules.js";
import { constantsModuleRule } from "./constantsModule.rule.js";
import { controlFlowBracesRule } from "./controlFlowBraces.rule.js";
import { destructuredPropsRule } from "./destructuredProps.rule.js";
import { domainOwnedDispatchRule } from "./domainOwnedDispatch.rule.js";
import { emptyBranchesRule } from "./emptyBranches.rule.js";
import { exactOptionalPropertyTypesRule } from "./exactOptionalPropertyTypes.rule.js";
import { exhaustiveValueMappingsRule } from "./exhaustiveValueMappings.rule.js";
import { explicitConditionsRule } from "./explicitConditions.rule.js";
import { fileNamingRule } from "./fileNaming.rule.js";
import { forceConsistentCasingInFileNamesRule } from "./forceConsistentCasingInFileNames.rule.js";
import { preferArrowCallbackRule, preferArrowFunctionsRule } from "./functionStyle.rules.js";
import { groupedLogicalOperatorsRule } from "./groupedLogicalOperators.rule.js";
import { noParamReassignRule, noUselessAssignmentRule, noVarRule, preferConstRule } from "./immutability.rules.js";
import { collectionLoopsRule, noLoopJumpsRule } from "./loopControl.rules.js";
import { maxFileLinesRule, maxFileLinesWarnRule } from "./maxFileLines.rule.js";
import { namedExportsRule, noCycleRule } from "./modules.rules.js";
import { namedDivisibilityRule } from "./namedDivisibility.rule.js";
import { namedJsxHandlersRule } from "./namedJsxHandlers.rule.js";
import { namedPredicatesRule } from "./namedPredicates.rule.js";
import { genericNameDenylistRule, noShadowRule } from "./naming.rules.js";
import { noArrayMutationRule } from "./noArrayMutation.rule.js";
import { noBindingAliasRule } from "./noBindingAlias.rule.js";
import { noBooleanIfElseRule } from "./noBooleanIfElse.rule.js";
import { noCapturedMutationRule } from "./noCapturedMutation.rule.js";
import { noCollapsibleIfRule } from "./noCollapsibleIf.rule.js";
import { noDeepRelativeImportsRule } from "./noDeepRelativeImports.rule.js";
import { noElseRule } from "./noElse.rule.js";
import { noEnumsRule } from "./noEnums.rule.js";
import { noFallthroughCasesInSwitchRule } from "./noFallthroughCasesInSwitch.rule.js";
import { noFinallyRule } from "./noFinally.rule.js";
import { noImplicitOverrideRule } from "./noImplicitOverride.rule.js";
import { noImplicitReturnsRule } from "./noImplicitReturns.rule.js";
import { noLetRule } from "./noLet.rule.js";
import { noRawExceptionsRule } from "./noRawExceptions.rule.js";
import { noTypeAssertionsRule } from "./noTypeAssertions.rule.js";
import { onePathOneResultRule } from "./onePathOneResult.rule.js";
import { preferSingleBooleanReturnRule } from "./preferSingleBooleanReturn.rule.js";
import { preferSwitchRule } from "./preferSwitch.rule.js";
import { preserveCleanupFailuresRule } from "./preserveCleanupFailures.rule.js";
import { pureConditionsRule } from "./pureConditions.rule.js";
import { explicitJsxPropsRule, exhaustiveDepsRule, jsxKeyRule, moduleScopeComponentsRule, rulesOfHooksRule } from "./react.rules.js";
import { readonlyTypePropertiesRule } from "./readonlyTypeProperties.rule.js";
import { simpleTernariesRule } from "./simpleTernaries.rule.js";
import { strictTypeScriptRule } from "./strictTypeScript.rule.js";
import { terminalSwitchCasesRule } from "./terminalSwitchCases.rule.js";
import { explicitExportedReturnTypesRule, switchExhaustivenessRule, typeAliasesRule } from "./typeContracts.rules.js";
import { noExplicitAnyRule, noNonNullAssertionRule, noTsCommentsRule, noUnsafeArgumentRule, noUnsafeAssignmentRule, noUnsafeCallRule, noUnsafeMemberAccessRule, noUnsafeReturnRule, noUnsafeTypeAssertionRule, } from "./typeSafety.rules.js";
import { uncheckedIndexedAccessRule } from "./uncheckedIndexedAccess.rule.js";
export const rules = [
    fileInventoryRule, fileClassificationRule, projectMembershipRule, compilerCheckingRule, reasonedSuppressionsRule,
    allowedImportsRule,
    domainOwnedDispatchRule,
    controlFlowBracesRule,
    directBooleanConditionsRule, explicitConditionalEffectsRule, neutralCollectionResultsRule, noDuplicateSwitchCasesRule,
    noUnreachableStatementsRule, scopedCaseDeclarationsRule, subjectFirstComparisonsRule, unnecessaryConditionsRule,
    noFinallyRule, noRawExceptionsRule, preserveCleanupFailuresRule,
    exhaustiveValueMappingsRule,
    emptyBranchesRule,
    groupedLogicalOperatorsRule,
    collectionLoopsRule, noLoopJumpsRule,
    pureConditionsRule,
    terminalSwitchCasesRule,
    explicitConditionsRule,
    simpleTernariesRule,
    fileNamingRule,
    strictTypeScriptRule, uncheckedIndexedAccessRule, exactOptionalPropertyTypesRule, noImplicitReturnsRule,
    noFallthroughCasesInSwitchRule, noImplicitOverrideRule, forceConsistentCasingInFileNamesRule,
    explicitExportedReturnTypesRule,
    preferArrowFunctionsRule, preferArrowCallbackRule,
    preferConstRule, noVarRule, noParamReassignRule,
    reduceSimpleFoldsRule, noForEachRule, preferAtRule,
    nullishDefaultsRule, eqeqeqRule,
    asyncAwaitRule,
    namedExportsRule,
    typeAliasesRule,
    noCycleRule,
    explicitJsxPropsRule, moduleScopeComponentsRule,
    maxFileLinesWarnRule, maxFileLinesRule,
    guardClausesRule,
    genericNameDenylistRule,
    noExplicitAnyRule, noNonNullAssertionRule, noTsCommentsRule, noUnsafeAssignmentRule, noUnsafeCallRule,
    noUnsafeMemberAccessRule, noUnsafeReturnRule, noUnsafeArgumentRule, noUnsafeTypeAssertionRule,
    switchExhaustivenessRule,
    noFloatingPromisesRule, noMisusedPromisesRule,
    noShadowRule,
    awaitThenableRule,
    rulesOfHooksRule, exhaustiveDepsRule, jsxKeyRule,
    noBooleanCastRule, noUnneededTernaryRule, preferLogicalOverTernaryRule,
    noUselessAssignmentRule,
    namedPredicatesRule, namedDivisibilityRule, noElseRule, noCollapsibleIfRule, noBooleanIfElseRule,
    preferSingleBooleanReturnRule, onePathOneResultRule, preferSwitchRule,
    noEnumsRule, noTypeAssertionsRule, readonlyTypePropertiesRule, noBindingAliasRule, noDeepRelativeImportsRule,
    constantsModuleRule,
    namedJsxHandlersRule,
    noLetRule, noCapturedMutationRule, destructuredPropsRule, noArrayMutationRule,
];
//# sourceMappingURL=index.js.map