import { isRecord } from "../core/guards.js";
import { ArchitectureError } from "../errors/architectureError.js";
import { orThrow } from "../errors/tryCatch.js";
import { adoption } from "./adoption.js";
import { isRegisteredArchitecture, registerArchitecture } from "./architectureRegistry.state.js";
import { ARCHITECTURE_FIELDS, LAYER_FIELDS, PROJECTS_FIELDS, REFERENCE_MODES, RESERVED_LAYER_NAMES } from "./configuration.constants.js";
import { glossaries, layerGlossaries } from "./glossaries.js";
import { defaultRules, overrideRules } from "./normalizeRules.js";
import { dependencies, developmentOnly, entryPoint, generated, naming } from "./policies.js";
import type { Architecture, ArchitectureInput, EffectivePolicy, Glossary, NormalizedLayer } from "./types.js";
import { checked, fields, freeze, optional, patterns, text, type Checked } from "./validation.js";

/** Label for settings made at the top level of architecture.config.ts. */
const projectWide = "architecture";

type ReferenceMode = Architecture["projects"]["references"];

const isReferenceMode = (value: unknown): value is ReferenceMode => REFERENCE_MODES.some((mode) => mode === value);

const isValidLayerName = (name: string): boolean => /^[A-Za-z][\w-]*$/.test(name) && !RESERVED_LAYER_NAMES.includes(name);

const typescriptProjects = (value: unknown): Checked<Architecture["projects"]> => {
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
const projectPolicy = (config: Readonly<Record<string, unknown>>): Checked<EffectivePolicy> => {
  const policyNaming = optional(config.naming, (entry) => naming(entry, "naming"));
  const policyRules = overrideRules({ inherited: defaultRules(), origin: projectWide, project: true }, config.rules);
  return checked({
    origins: { naming: config.naming === undefined ? "unconfigured" : projectWide, dependencies: "deny by default" },
    ...(policyNaming.value === undefined ? {} : { naming: policyNaming.value }),
    dependencies: { internal: [], external: [], assets: [] },
    rules: policyRules.value,
    development: false,
    glossaries: [],
  }, [...policyNaming.issues, ...policyRules.issues]);
};

type Known = { readonly layerNames: readonly string[]; readonly glossaries: Readonly<Record<string, Glossary>> };

type GlossarySetting = { readonly glossary?: unknown; readonly generated?: unknown };

/** The glossaries a layer follows. A generated layer takes none: its generator chooses its names. */
const glossariesOf = (setting: GlossarySetting, { known, label }: { readonly known: Known; readonly label: string }): Checked<readonly string[]> => {
  const followed = optional(setting.glossary, (entry) => layerGlossaries(entry, { known: known.glossaries, label: `${label}.glossary` }));
  const isGenerated = setting.generated !== undefined && setting.glossary !== undefined;
  return checked(followed.value ?? [], [
    ...followed.issues, ...(isGenerated ? [`${label}: a generated layer's names come from its generator, so it takes no glossary`] : []),
  ]);
};

const layer = (name: string, value: unknown, known: Known, defaults: EffectivePolicy): Checked<NormalizedLayer> => {
  const { layerNames } = known;
  const label = `layers.${name}`;
  const declared = fields(value, LAYER_FIELDS, label);
  const { description, files, exclude, rules } = declared.value;
  const layerFiles = patterns(files, `${label}.files`);
  const layerExclude = patterns(exclude ?? [], `${label}.exclude`);
  const layerDescription = text(description, `${label}.description`);
  const layerNaming = optional(declared.value.naming, (entry) => naming(entry, `${label}.naming`));
  const layerDependencies = optional(declared.value.dependencies, (entry) => dependencies(entry, layerNames, `${label}.dependencies`));
  const layerRules = overrideRules({ inherited: defaults.rules, origin: label, project: false }, rules);
  const layerGenerated = optional(declared.value.generated, (setting) => generated(setting, `${label}.generated`));
  const layerEntry = optional(declared.value.entry, (setting) => entryPoint(setting, `${label}.entry`));
  const layerDevelopment = optional(declared.value.development, (setting) => developmentOnly(setting, `${label}.development`));
  const layerGlossary = glossariesOf(declared.value, { known, label });
  const isGeneratedWithRules = declared.value.generated !== undefined && rules !== undefined;
  const hasNoFiles = layerFiles.issues.length === 0 && layerFiles.value.length === 0;
  const policy: EffectivePolicy = {
    origins: {
      naming: declared.value.naming === undefined ? defaults.origins.naming : label,
      dependencies: declared.value.dependencies === undefined ? defaults.origins.dependencies : label,
    },
    ...(defaults.naming === undefined ? {} : { naming: defaults.naming }),
    ...(layerNaming.value === undefined ? {} : { naming: layerNaming.value }),
    dependencies: layerDependencies.value ?? defaults.dependencies,
    rules: layerRules.value,
    ...(layerGenerated.value === undefined ? {} : { generated: layerGenerated.value }),
    ...(layerEntry.value === undefined ? {} : { entry: layerEntry.value }),
    development: layerDevelopment.value ?? false,
    glossaries: layerGlossary.value,
  };
  return checked({ description: layerDescription.value, files: layerFiles.value, exclude: layerExclude.value, policy }, [
    ...declared.issues, ...layerDescription.issues, ...layerFiles.issues, ...layerExclude.issues,
    ...layerNaming.issues, ...layerDependencies.issues, ...layerRules.issues, ...layerGenerated.issues,
    ...layerEntry.issues, ...layerDevelopment.issues, ...layerGlossary.issues,
    ...(isGeneratedWithRules ? [`${label}: a generated layer is never linted, so it takes no rules`] : []),
    ...(hasNoFiles ? [`${label}.files must not be empty`] : []),
  ]);
};

const layerInputs = (value: unknown): Checked<Readonly<Record<string, unknown>>> => {
  if (!isRecord(value)) return checked({}, ["layers must be an object"]);
  const names = Object.keys(value);
  const hasValidNames = names.length > 0 && names.every(isValidLayerName);
  return checked(value, hasValidNames ? [] : ["layers needs at least one layer, each with a valid, non-reserved name"]);
};

/** Validates and normalizes configuration, returning every problem at once; filesystem checks happen in the runner. */
// architecture-disable-next-line production-reachability -- Tests read the validation result without the throw defineArchitecture adds.
export const normalizeArchitecture = (value: unknown): Architecture | ArchitectureError => {
  const config = fields(value, ARCHITECTURE_FIELDS, "architecture");
  const projects = typescriptProjects(config.value.projects);
  const inputs = layerInputs(config.value.layers);
  const layerNames = Object.keys(inputs.value);
  const defaults = projectPolicy(config.value);
  const adoptionSettings = adoption(config.value.adoption);
  const vocabularies = glossaries(config.value.glossaries);
  const known = { layerNames, glossaries: vocabularies.value };
  const layers = Object.entries(inputs.value).map(([name, entry]) => ({ name, result: layer(name, entry, known, defaults.value) }));
  const issues = [
    ...config.issues, ...projects.issues, ...inputs.issues, ...defaults.issues, ...adoptionSettings.issues, ...vocabularies.issues,
    ...layers.flatMap(({ result }) => result.issues),
  ];
  if (issues.length > 0) return new ArchitectureError(issues);
  const architecture: Architecture = freeze({
    projects: projects.value,
    adoption: adoptionSettings.value,
    glossaries: vocabularies.value,
    defaults: defaults.value,
    layers: Object.fromEntries(layers.map(({ name, result }) => [name, result.value])),
  });
  registerArchitecture(architecture);
  return architecture;
};

export const isArchitecture = (value: unknown): value is Architecture => isRecord(value) && isRegisteredArchitecture(value);

/** The configuration boundary: invalid configuration fails while architecture.config.ts loads. */
export const defineArchitecture = <const Layer extends string, const GlossaryName extends string = never>(config: ArchitectureInput<Layer, GlossaryName>): Architecture => {
  return orThrow(normalizeArchitecture(config));
};
