import { isRecord } from "../core/guards.js";
import { ArchitectureError } from "../errors/architectureError.js";
import { orThrow } from "../errors/tryCatch.js";
import { isRegisteredArchitecture, registerArchitecture } from "./architectureRegistry.state.js";
import { ARCHITECTURE_FIELDS, DEFAULT_FIELDS, FILE_TYPE_FIELDS, GENERATED_FIELDS, IMPORT_FIELDS, NAMING_CASES, NAMING_FIELDS, PROJECT_FIELDS, REFERENCE_MODES, RESERVED_TYPE_NAMES, } from "./configuration.constants.js";
import { defaultRules, overrideRules } from "./normalizeRules.js";
import { checked, fields, freeze, optional, patterns, strings, text } from "./validation.js";
const isNamingCase = (value) => NAMING_CASES.some((name) => name === value);
const isReferenceMode = (value) => {
    return REFERENCE_MODES.some((mode) => mode === value);
};
const isExactBasename = (name) => !/[/\\*?{}[\]]/.test(name);
const isValidTypeName = (name) => /^[A-Za-z][\w-]*$/.test(name) && !RESERVED_TYPE_NAMES.includes(name);
const naming = (value, label) => {
    const input = fields(value, NAMING_FIELDS, label);
    const namingCase = input.value.case;
    const prefix = optional(input.value.prefix, (entry) => text(entry, `${label}.prefix`));
    const suffixes = optional(input.value.suffixes, (entry) => strings(entry, `${label}.suffixes`));
    const allowedNames = optional(input.value.allowedNames, (entry) => strings(entry, `${label}.allowedNames`));
    const inexactNames = allowedNames.value?.filter((name) => !isExactBasename(name)) ?? [];
    const issues = [
        ...input.issues, ...prefix.issues, ...suffixes.issues, ...allowedNames.issues,
        ...(isNamingCase(namingCase) ? [] : [`Invalid ${label}.case`]),
        ...(inexactNames.length > 0 ? [`${label}.allowedNames must be exact basenames`] : []),
    ];
    return checked({
        case: isNamingCase(namingCase) ? namingCase : "camel",
        ...(prefix.value === undefined ? {} : { prefix: prefix.value }),
        ...(suffixes.value === undefined ? {} : { suffixes: suffixes.value }),
        ...(allowedNames.value === undefined ? {} : { allowedNames: allowedNames.value }),
    }, issues);
};
const imports = (value, typeNames, label) => {
    const input = fields(value ?? {}, IMPORT_FIELDS, label);
    const internal = strings(input.value.internal ?? [], `${label}.internal`);
    const external = strings(input.value.external ?? [], `${label}.external`);
    const builtins = strings(input.value.builtins ?? [], `${label}.builtins`);
    const assets = patterns(input.value.assets ?? [], `${label}.assets`);
    const unknownTypes = internal.value.filter((name) => !typeNames.includes(name));
    return checked({
        internal: internal.value,
        external: external.value,
        builtins: builtins.value.map((name) => name.replace(/^node:/, "")),
        assets: assets.value,
    }, [
        ...input.issues, ...internal.issues, ...external.issues, ...builtins.issues, ...assets.issues,
        ...unknownTypes.map((name) => `Unknown internal file type: ${name}`),
    ]);
};
const generated = (value, label) => {
    const input = fields(value, GENERATED_FIELDS, label);
    const reason = text(input.value.reason, `${label}.reason`);
    return checked({ reason: reason.value }, [...input.issues, ...reason.issues]);
};
const projects = (value) => {
    const input = fields(value, PROJECT_FIELDS, "projects");
    const tsconfigs = patterns(input.value.tsconfigs, "projects.tsconfigs", true);
    const references = input.value.references ?? "follow";
    const hasNoProjects = tsconfigs.issues.length === 0 && tsconfigs.value.length === 0;
    return checked({ tsconfigs: tsconfigs.value, references: isReferenceMode(references) ? references : "follow" }, [
        ...input.issues, ...tsconfigs.issues,
        ...(hasNoProjects ? ["At least one tsconfig is required"] : []),
        ...(isReferenceMode(references) ? [] : ["Invalid projects.references"]),
    ]);
};
const defaultPolicy = (value, typeNames) => {
    const input = fields(value ?? {}, DEFAULT_FIELDS, "defaults");
    const policyNaming = optional(input.value.naming, (entry) => naming(entry, "defaults.naming"));
    const policyImports = imports(input.value.imports, typeNames, "defaults.imports");
    const policyRules = overrideRules(defaultRules(), input.value.rules, "defaults", true);
    return checked({
        origins: {
            naming: input.value.naming === undefined ? "unconfigured" : "defaults",
            imports: input.value.imports === undefined ? "deny by default" : "defaults",
        },
        ...(policyNaming.value === undefined ? {} : { naming: policyNaming.value }),
        imports: policyImports.value,
        rules: policyRules.value,
    }, [...input.issues, ...policyNaming.issues, ...policyImports.issues, ...policyRules.issues]);
};
const fileType = (name, value, typeNames, defaults) => {
    const label = `fileTypes.${name}`;
    const input = fields(value, FILE_TYPE_FIELDS, label);
    const declared = input.value;
    const description = text(declared.description, `${label}.description`);
    const files = patterns(declared.files, `${label}.files`);
    const exclude = patterns(declared.exclude ?? [], `${label}.exclude`);
    const typeNaming = optional(declared.naming, (entry) => naming(entry, `${label}.naming`));
    const typeImports = optional(declared.imports, (entry) => imports(entry, typeNames, `${label}.imports`));
    const typeRules = overrideRules(defaults.rules, declared.rules, label, false);
    const typeGenerated = optional(declared.generated, (entry) => generated(entry, `${label}.generated`));
    const isGeneratedWithRules = declared.generated !== undefined && declared.rules !== undefined;
    const hasNoFiles = files.issues.length === 0 && files.value.length === 0;
    const policy = {
        origins: {
            naming: declared.naming === undefined ? defaults.origins.naming : label,
            imports: declared.imports === undefined ? defaults.origins.imports : label,
        },
        ...(defaults.naming === undefined ? {} : { naming: defaults.naming }),
        ...(typeNaming.value === undefined ? {} : { naming: typeNaming.value }),
        imports: typeImports.value ?? defaults.imports,
        rules: typeRules.value,
        ...(typeGenerated.value === undefined ? {} : { generated: typeGenerated.value }),
    };
    return checked({ description: description.value, files: files.value, exclude: exclude.value, policy }, [
        ...input.issues, ...description.issues, ...files.issues, ...exclude.issues,
        ...typeNaming.issues, ...typeImports.issues, ...typeRules.issues, ...typeGenerated.issues,
        ...(isGeneratedWithRules ? [`${label}: a generated file type is never linted, so it takes no rules`] : []),
        ...(hasNoFiles ? [`${label}.files must not be empty`] : []),
    ]);
};
const fileTypeInputs = (value) => {
    if (!isRecord(value))
        return checked({}, ["fileTypes must be an object"]);
    const names = Object.keys(value);
    const hasValidNames = names.length > 0 && names.every(isValidTypeName);
    return checked(value, hasValidNames ? [] : ["fileTypes requires valid, non-reserved names"]);
};
/** Validates and normalizes configuration, returning every problem at once; filesystem checks happen in the runner. */
export const normalizeArchitecture = (value) => {
    const config = fields(value, ARCHITECTURE_FIELDS, "architecture");
    const checkedProjects = projects(config.value.projects);
    const typeInputs = fileTypeInputs(config.value.fileTypes);
    const typeNames = Object.keys(typeInputs.value);
    const defaults = defaultPolicy(config.value.defaults, typeNames);
    const fileTypes = Object.entries(typeInputs.value).map(([name, entry]) => ({ name, result: fileType(name, entry, typeNames, defaults.value) }));
    const issues = [
        ...config.issues, ...checkedProjects.issues, ...typeInputs.issues, ...defaults.issues,
        ...fileTypes.flatMap(({ result }) => result.issues),
    ];
    if (issues.length > 0)
        return new ArchitectureError(issues);
    const architecture = freeze({
        projects: checkedProjects.value,
        defaults: defaults.value,
        fileTypes: Object.fromEntries(fileTypes.map(({ name, result }) => [name, result.value])),
    });
    registerArchitecture(architecture);
    return architecture;
};
export const isArchitecture = (value) => isRecord(value) && isRegisteredArchitecture(value);
/** The configuration boundary: invalid configuration fails while architecture.config.ts loads. */
export const defineArchitecture = (config) => {
    return orThrow(normalizeArchitecture(config));
};
//# sourceMappingURL=defineArchitecture.js.map