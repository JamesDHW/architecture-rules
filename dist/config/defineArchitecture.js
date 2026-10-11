import { isRecord } from "../core/guards.js";
import { ArchitectureError } from "../errors/architectureError.js";
import { orThrow } from "../errors/tryCatch.js";
import { isRegisteredArchitecture, registerArchitecture } from "./architectureRegistry.state.js";
import { ARCHITECTURE_FIELDS, LAYER_FIELDS, PROJECTS_FIELDS, REFERENCE_MODES, RESERVED_LAYER_NAMES } from "./configuration.constants.js";
import { defaultRules, overrideRules } from "./normalizeRules.js";
import { dependencies, generated, naming } from "./policies.js";
import { checked, fields, freeze, optional, patterns, text } from "./validation.js";
/** Label for settings made at the top level of architecture.config.ts. */
const projectWide = "architecture";
const isReferenceMode = (value) => REFERENCE_MODES.some((mode) => mode === value);
const isValidLayerName = (name) => /^[A-Za-z][\w-]*$/.test(name) && !RESERVED_LAYER_NAMES.includes(name);
const typescriptProjects = (value) => {
    const input = fields(value, PROJECTS_FIELDS, "projects");
    const tsconfigs = patterns(input.value.tsconfigs, "projects.tsconfigs", true);
    const references = input.value.references ?? "follow";
    const hasNoProjects = tsconfigs.issues.length === 0 && tsconfigs.value.length === 0;
    return checked({ tsconfigs: tsconfigs.value, references: isReferenceMode(references) ? references : "follow" }, [
        ...input.issues, ...tsconfigs.issues,
        ...(hasNoProjects ? ["projects.tsconfigs needs at least one tsconfig"] : []),
        ...(isReferenceMode(references) ? [] : ["projects.references must be follow or explicit"]),
    ]);
};
/** The project-wide policy every layer inherits: top-level naming and rules. Dependencies are always declared per layer. */
const projectPolicy = (config) => {
    const policyNaming = optional(config.naming, (entry) => naming(entry, "naming"));
    const policyRules = overrideRules(defaultRules(), config.rules, projectWide, true);
    return checked({
        origins: { naming: config.naming === undefined ? "unconfigured" : projectWide, dependencies: "deny by default" },
        ...(policyNaming.value === undefined ? {} : { naming: policyNaming.value }),
        dependencies: { internal: [], external: [], assets: [] },
        rules: policyRules.value,
    }, [...policyNaming.issues, ...policyRules.issues]);
};
const layer = (name, value, layerNames, defaults) => {
    const label = `layers.${name}`;
    const declared = fields(value, LAYER_FIELDS, label);
    const { description, files, exclude, rules } = declared.value;
    const layerFiles = patterns(files, `${label}.files`);
    const layerExclude = patterns(exclude ?? [], `${label}.exclude`);
    const layerDescription = text(description, `${label}.description`);
    const layerNaming = optional(declared.value.naming, (entry) => naming(entry, `${label}.naming`));
    const layerDependencies = optional(declared.value.dependencies, (entry) => dependencies(entry, layerNames, `${label}.dependencies`));
    const layerRules = overrideRules(defaults.rules, rules, label, false);
    const layerGenerated = optional(declared.value.generated, (entry) => generated(entry, `${label}.generated`));
    const isGeneratedWithRules = declared.value.generated !== undefined && rules !== undefined;
    const hasNoFiles = layerFiles.issues.length === 0 && layerFiles.value.length === 0;
    const policy = {
        origins: {
            naming: declared.value.naming === undefined ? defaults.origins.naming : label,
            dependencies: declared.value.dependencies === undefined ? defaults.origins.dependencies : label,
        },
        ...(defaults.naming === undefined ? {} : { naming: defaults.naming }),
        ...(layerNaming.value === undefined ? {} : { naming: layerNaming.value }),
        dependencies: layerDependencies.value ?? defaults.dependencies,
        rules: layerRules.value,
        ...(layerGenerated.value === undefined ? {} : { generated: layerGenerated.value }),
    };
    return checked({ description: layerDescription.value, files: layerFiles.value, exclude: layerExclude.value, policy }, [
        ...declared.issues, ...layerDescription.issues, ...layerFiles.issues, ...layerExclude.issues,
        ...layerNaming.issues, ...layerDependencies.issues, ...layerRules.issues, ...layerGenerated.issues,
        ...(isGeneratedWithRules ? [`${label}: a generated layer is never linted, so it takes no rules`] : []),
        ...(hasNoFiles ? [`${label}.files must not be empty`] : []),
    ]);
};
const layerInputs = (value) => {
    if (!isRecord(value))
        return checked({}, ["layers must be an object"]);
    const names = Object.keys(value);
    const hasValidNames = names.length > 0 && names.every(isValidLayerName);
    return checked(value, hasValidNames ? [] : ["layers needs at least one layer, each with a valid, non-reserved name"]);
};
/** Validates and normalizes configuration, returning every problem at once; filesystem checks happen in the runner. */
export const normalizeArchitecture = (value) => {
    const config = fields(value, ARCHITECTURE_FIELDS, "architecture");
    const projects = typescriptProjects(config.value.projects);
    const inputs = layerInputs(config.value.layers);
    const layerNames = Object.keys(inputs.value);
    const defaults = projectPolicy(config.value);
    const layers = Object.entries(inputs.value).map(([name, entry]) => ({ name, result: layer(name, entry, layerNames, defaults.value) }));
    const issues = [
        ...config.issues, ...projects.issues, ...inputs.issues, ...defaults.issues,
        ...layers.flatMap(({ result }) => result.issues),
    ];
    if (issues.length > 0)
        return new ArchitectureError(issues);
    const architecture = freeze({
        projects: projects.value,
        defaults: defaults.value,
        layers: Object.fromEntries(layers.map(({ name, result }) => [name, result.value])),
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