import type { Architecture, ArchitectureInput, EffectivePolicy, FileType, ImportPolicy, NamingPolicy } from "../architecture/types.js";
import { defaultRules, overrideRules } from "../architecture/normalizeRules.js";
import { fields, freeze, patterns, strings, text } from "../architecture/validation.js";

const naming = (value: unknown): NamingPolicy => {
  const input = fields(value, ["case", "prefix", "suffixes", "allowedNames"], "naming");
  if (input.case !== "camel" && input.case !== "pascal" && input.case !== "pascalOrCamel") throw new Error("Invalid naming.case");
  const allowedNames = input.allowedNames === undefined ? undefined : strings(input.allowedNames, "allowedNames");
  if (allowedNames?.some((name) => /[/\\*?{}[\]]/.test(name))) throw new Error("allowedNames must be exact basenames");
  return {
    case: input.case,
    ...(input.prefix === undefined ? {} : { prefix: text(input.prefix, "prefix") }),
    ...(input.suffixes === undefined ? {} : { suffixes: strings(input.suffixes, "suffixes") }),
    ...(allowedNames === undefined ? {} : { allowedNames }),
  };
};
const imports = (value: unknown, names: readonly string[]): Required<ImportPolicy> => {
  const input = fields(value ?? {}, ["internal", "external", "builtins", "assets"], "imports");
  const internal = strings(input.internal ?? [], "imports.internal");
  for (const name of internal) if (!names.includes(name)) throw new Error(`Unknown internal file type: ${name}`);
  return {
    internal,
    external: strings(input.external ?? [], "imports.external"),
    builtins: strings(input.builtins ?? [], "imports.builtins").map((name) => name.replace(/^node:/, "")),
    assets: patterns(input.assets ?? [], "imports.assets"),
  };
};

const definitions = new WeakSet<object>();
export const isArchitecture = (value: unknown): value is Architecture => value !== null && typeof value === "object" && definitions.has(value);

/** Validate and normalize trusted configuration; filesystem checks happen in the runner. */
export const normalizeArchitecture = (value: unknown): Architecture => {
  const config = fields(value, ["projects", "files", "defaults", "fileTypes"], "architecture");
  const projects = fields(config.projects, ["tsconfigs", "references"], "projects");
  const tsconfigs = patterns(projects.tsconfigs, "tsconfigs", true);
  if (tsconfigs.length === 0) throw new Error("At least one tsconfig is required");
  const references = projects.references ?? "follow";
  if (references !== "follow" && references !== "explicit") throw new Error("Invalid projects.references");
  const types = fields(config.fileTypes, Object.keys((config.fileTypes ?? {}) as object), "fileTypes");
  const names = Object.keys(types);
  if (names.length === 0 || names.some((name) => !/^[A-Za-z][\w-]*$/.test(name) || ["__proto__", "constructor", "prototype"].includes(name))) throw new Error("fileTypes requires valid, non-reserved names");
  const fileConfig = fields(config.files ?? {}, ["otherFiles", "toolingFiles", "generated"], "files");
  const generated = fileConfig.generated ?? [];
  if (!Array.isArray(generated)) throw new Error("generated must be an array");
  const files: Architecture["files"] = {
    otherFiles: patterns(fileConfig.otherFiles ?? [], "otherFiles"),
    toolingFiles: patterns(fileConfig.toolingFiles ?? [], "toolingFiles", true),
    generated: generated.map((entry) => {
      const group = fields(entry, ["files", "reason"], "generated group");
      return { files: patterns(group.files, "generated.files"), reason: text(group.reason, "generated.reason") };
    }),
  };
  const base = fields(config.defaults ?? {}, ["naming", "imports", "rules"], "defaults");
  const defaults: EffectivePolicy = {
    origins: { naming: base.naming === undefined ? "unconfigured" : "defaults", imports: base.imports === undefined ? "deny by default" : "defaults" },
    ...(base.naming === undefined ? {} : { naming: naming(base.naming) }),
    imports: imports(base.imports, names),
    rules: overrideRules(defaultRules(), base.rules, "defaults", true),
  };
  const fileTypes: Record<string, FileType & { readonly policy: EffectivePolicy }> = {};
  for (const [name, value] of Object.entries(types)) {
    const type = fields(value, ["description", "files", "exclude", "naming", "imports", "rules"], name);
    const include = patterns(type.files, `${name}.files`);
    if (include.length === 0) throw new Error(`${name}.files must not be empty`);
    const policy: EffectivePolicy = {
      origins: { naming: type.naming === undefined ? defaults.origins.naming : `fileTypes.${name}`, imports: type.imports === undefined ? defaults.origins.imports : `fileTypes.${name}` },
      ...(defaults.naming === undefined ? {} : { naming: defaults.naming }),
      ...(type.naming === undefined ? {} : { naming: naming(type.naming) }),
      imports: type.imports === undefined ? defaults.imports : imports(type.imports, names),
      rules: overrideRules(defaults.rules, type.rules, `fileTypes.${name}`, false),
    };
    fileTypes[name] = { description: text(type.description, `${name}.description`), files: include, exclude: patterns(type.exclude ?? [], `${name}.exclude`), policy };
  }
  const architecture: Architecture = freeze({ projects: { tsconfigs, references }, files, defaults, fileTypes });
  definitions.add(architecture);
  return architecture;
};

export const defineArchitecture = <const Name extends string>(config: ArchitectureInput<Name>): Architecture => normalizeArchitecture(config);
