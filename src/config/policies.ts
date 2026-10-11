import { isBuiltin } from "node:module";

import { isString } from "../core/guards.js";
import { isNamingCaseSetting, namingCases } from "../rules/namingPolicy.js";
import { DEPENDENCY_FIELDS, GENERATED_FIELDS, NAMING_FIELDS } from "./configuration.constants.js";
import type { DependencyPolicy, GeneratedSetting, NamingPolicy } from "./types.js";
import { checked, fields, optional, patterns, strings, text, type Checked } from "./validation.js";

const isExactBasename = (name: string): boolean => !/[/\\*?{}[\]]/.test(name);

/** One nonempty string or a nonempty list of them. */
const textOrList = (input: unknown, label: string): Checked<string | readonly string[]> => {
  if (isString(input)) return text(input, label);
  const list = strings(input, label);
  const isEmptyList = list.issues.length === 0 && list.value.length === 0;
  return isEmptyList ? checked(list.value, [`${label} must not be empty`]) : list;
};

export const naming = (value: unknown, label: string): Checked<NamingPolicy> => {
  const input = fields(value, NAMING_FIELDS, label);
  const namingCase = input.value.case;
  const prefix = optional(input.value.prefix, (entry) => textOrList(entry, `${label}.prefix`));
  const suffixes = optional(input.value.suffixes, (entry) => strings(entry, `${label}.suffixes`));
  const requiredSuffix = optional(input.value.requiredSuffix, (entry) => textOrList(entry, `${label}.requiredSuffix`));
  const allowedNames = optional(input.value.allowedNames, (entry) => strings(entry, `${label}.allowedNames`));
  const inexactNames = allowedNames.value?.filter((name) => !isExactBasename(name)) ?? [];
  const issues = [
    ...input.issues, ...prefix.issues, ...suffixes.issues, ...requiredSuffix.issues, ...allowedNames.issues,
    ...(isNamingCaseSetting(namingCase) ? [] : [`${label}.case must be ${namingCases.join(", ")} or a list of them`]),
    ...(inexactNames.length > 0 ? [`${label}.allowedNames must be exact basenames`] : []),
  ];
  return checked({
    case: isNamingCaseSetting(namingCase) ? namingCase : "camelCase",
    ...(prefix.value === undefined ? {} : { prefix: prefix.value }),
    ...(suffixes.value === undefined ? {} : { suffixes: suffixes.value }),
    ...(requiredSuffix.value === undefined ? {} : { requiredSuffix: requiredSuffix.value }),
    ...(allowedNames.value === undefined ? {} : { allowedNames: allowedNames.value }),
  }, issues);
};

const isPattern = (specifier: string): boolean => /[*?{}[\]!]/.test(specifier);

/** Node built-ins are written one way, with the node: prefix, so an npm package of the same name cannot hide behind one. */
const builtinIssue = (specifier: string, label: string): readonly string[] => {
  if (isPattern(specifier)) return [];
  const isPrefixed = specifier.startsWith("node:");
  const isUnknownBuiltin = isPrefixed && !isBuiltin(specifier);
  const isUnprefixedBuiltin = !isPrefixed && isBuiltin(specifier);
  if (isUnknownBuiltin) return [`${label}: '${specifier}' is not a Node built-in`];
  if (isUnprefixedBuiltin) return [`${label}: write the Node built-in '${specifier}' as 'node:${specifier}'`];
  return [];
};

export const dependencies = (value: unknown, layerNames: readonly string[], label: string): Checked<Required<DependencyPolicy>> => {
  const input = fields(value ?? {}, DEPENDENCY_FIELDS, label);
  const internal = strings(input.value.internal ?? [], `${label}.internal`);
  const external = strings(input.value.external ?? [], `${label}.external`);
  const assets = patterns(input.value.assets ?? [], `${label}.assets`);
  const unknownLayers = internal.value.filter((name) => !layerNames.includes(name));
  return checked({ internal: internal.value, external: external.value, assets: assets.value }, [
    ...input.issues, ...internal.issues, ...external.issues, ...assets.issues,
    ...unknownLayers.map((name) => `${label}.internal: unknown layer '${name}'`),
    ...external.value.flatMap((specifier) => builtinIssue(specifier, `${label}.external`)),
  ]);
};

export const generated = (value: unknown, label: string): Checked<GeneratedSetting> => {
  const input = fields(value, GENERATED_FIELDS, label);
  const reason = text(input.value.reason, `${label}.reason`);
  return checked({ reason: reason.value }, [...input.issues, ...reason.issues]);
};
