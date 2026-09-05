import { uncheckedIndexedAccessRule } from "./uncheckedIndexedAccess.rule.js";
import { constantsModuleRule } from "./constantsModule.rule.js";
import { exactOptionalPropertyTypesRule } from "./exactOptionalPropertyTypes.rule.js";
import { explicitConditionsRule } from "./explicitConditions.rule.js";
import { fileNamingRule } from "./fileNaming.rule.js";
import { forceConsistentCasingInFileNamesRule } from "./forceConsistentCasingInFileNames.rule.js";
import { namedJsxHandlersRule } from "./namedJsxHandlers.rule.js";
import { namedPredicatesRule } from "./namedPredicates.rule.js";
import { asyncAwaitRule, awaitThenableRule, eqeqeqRule, exhaustiveDepsRule, explicitExportedReturnTypesRule, explicitJsxPropsRule, genericNameDenylistRule, guardClausesRule, jsxKeyRule, maxFileLinesRule, moduleScopeComponentsRule, namedExportsRule, noBooleanCastRule, noCycleRule, noExplicitAnyRule, noFloatingPromisesRule, noForEachRule, noMisusedPromisesRule, noNonNullAssertionRule, noParamReassignRule, noTsCommentsRule, noUnsafeArgumentRule, noUnsafeAssignmentRule, noUnsafeCallRule, noUnsafeMemberAccessRule, noUnsafeReturnRule, noUnsafeTypeAssertionRule, noUnneededTernaryRule, noUselessAssignmentRule, noVarRule, nullishDefaultsRule, preferArrowCallbackRule, preferArrowFunctionsRule, preferAtRule, preferConstRule, preferLogicalOverTernaryRule, reduceSimpleFoldsRule, rulesOfHooksRule, simpleTernariesRule, switchExhaustivenessRule, typeAliasesRule, } from "./nativeOxlint.rules.js";
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
    explicitConditionsRule,
    fileNamingRule,
    strictTypeScriptRule,
    uncheckedIndexedAccessRule,
    exactOptionalPropertyTypesRule,
    noImplicitReturnsRule,
    noFallthroughCasesInSwitchRule,
    noImplicitOverrideRule,
    forceConsistentCasingInFileNamesRule,
    guardClausesRule,
    simpleTernariesRule,
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
    maxFileLinesRule,
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