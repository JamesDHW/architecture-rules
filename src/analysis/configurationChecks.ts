import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { isRecord, isString } from "../core/guards.js";
import type { Architecture, NormalizedLayer } from "../config/types.js";
import { tryCatch } from "../errors/tryCatch.js";
import { ArchitectureError } from "../errors/architectureError.js";
import type { ImportUse } from "./imports.js";
import type { ClassifiedFile, Issue } from "./inventory.js";
import { matches } from "./paths.js";

/** The configuration file's root-relative path and text, so findings can point at the line they are about. */
export type ConfigText = { readonly file: string; readonly text: string };

const lineAt = (text: string, offset: number): number => text.slice(0, offset).split("\n").length;

const escaped = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const layerKeyAt = (config: ConfigText, layer: string): number | undefined => {
  const layerKey = new RegExp(`["']?\\b${escaped(layer)}\\b["']?\\s*:\\s*\\{`).exec(config.text);
  return layerKey === null ? undefined : layerKey.index;
};

/** Where a layer's block ends: at the next layer's key, or the end of the file. */
const blockEnd = (config: ConfigText, start: number, layers: readonly string[]): number => {
  const later = layers.map((name) => layerKeyAt(config, name)).filter((index): index is number => index !== undefined && index > start);
  return Math.min(config.text.length, ...later);
};

/**
 * The line of a quoted value inside a layer's block, or of the layer's key when the value is not written there
 * literally (a spread constant, say); undefined when the layer's key is not found.
 */
const configLine = (config: ConfigText, layers: readonly string[], layer: string, value?: string): number | undefined => {
  const start = layerKeyAt(config, layer);
  if (start === undefined) return undefined;
  if (value === undefined) return lineAt(config.text, start);
  const block = config.text.slice(start, blockEnd(config, start, layers));
  const found = new RegExp(`["'\`]${escaped(value)}["'\`]`).exec(block);
  return lineAt(config.text, start + (found === null ? 0 : found.index));
};

const configIssue = (ruleId: string, config: ConfigText, message: string, line: number | undefined): Issue => {
  return { ruleId, file: config.file, message, ...(line === undefined ? {} : { line }) };
};

type Grant = { readonly kind: ImportUse["kind"]; readonly value: string };

const grantsOf = (layer: NormalizedLayer): readonly Grant[] => {
  const { internal, external, assets } = layer.policy.dependencies;
  return [
    ...internal.map((value) => ({ kind: "internal" as const, value })),
    ...external.map((value) => ({ kind: "external" as const, value })),
    ...assets.map((value) => ({ kind: "asset" as const, value })),
  ];
};

const isUsedGrant = (uses: readonly ImportUse[], name: string, grant: Grant): boolean => uses.some((use) => {
  const isSameGrant = use.layer === name && use.kind === grant.kind;
  if (!isSameGrant) return false;
  return grant.kind === "internal" ? use.value === grant.value : matches(use.value, [grant.value]);
});

const grantLabel = ({ kind, value }: Grant): string => {
  switch (kind) {
    case "internal":
      return `internal layer ${value}`;
    case "external":
      return `external ${value}`;
    case "asset":
      return `asset ${value}`;
  }
};

/** Dependencies a layer grants that no import from the layer uses. */
export const unusedPermissions = (architecture: Architecture, uses: readonly ImportUse[], config: ConfigText): readonly Issue[] => {
  const layers = Object.keys(architecture.layers);
  return Object.entries(architecture.layers).flatMap(([name, layer]) => grantsOf(layer)
    .filter((grant) => !isUsedGrant(uses, name, grant))
    .map((grant) => configIssue(
      "unused-permissions", config,
      `Layer ${name} grants ${grantLabel(grant)}, but none of its imports use it.`,
      configLine(config, layers, name, grant.value),
    )));
};

type Unmatched = { readonly name: string; readonly kind: string; readonly patterns: readonly string[]; readonly paths: readonly string[] };

const unmatched = (config: ConfigText, layers: readonly string[], { name, kind, patterns, paths }: Unmatched): readonly Issue[] => {
  return patterns
    .filter((pattern) => !paths.some((path) => matches(path, [pattern])))
    .map((pattern) => configIssue("unmatched-patterns", config, `Layer ${name}: ${kind} pattern ${pattern} matches no source file.`, configLine(config, layers, name, pattern)));
};

/**
 * Layer and entry patterns that match no source file of the programs. Exclude patterns are not checked: they guard
 * against files that do not exist yet. Nor are a generated layer's files, which exist only after a build.
 */
export const unmatchedPatterns = (architecture: Architecture, files: readonly ClassifiedFile[], config: ConfigText): readonly Issue[] => {
  const layers = Object.keys(architecture.layers);
  return Object.entries(architecture.layers).flatMap(([name, layer]) => {
    const paths = files.filter((file) => file.layer === name).map((file) => file.relative);
    const filePatterns = layer.policy.generated === undefined ? layer.files : [];
    return [
      ...unmatched(config, layers, { name, kind: "files", patterns: filePatterns, paths }),
      ...unmatched(config, layers, { name, kind: "entry.files", patterns: layer.policy.entry?.files ?? [], paths }),
    ];
  });
};

/** Configuration files of other linters and dead-code tools, which the checker replaces. */
const competingFiles: readonly string[] = [
  ".eslintrc", ".eslintrc.js", ".eslintrc.cjs", ".eslintrc.json", ".eslintrc.yml", ".eslintrc.yaml",
  "eslint.config.js", "eslint.config.mjs", "eslint.config.cjs", "eslint.config.ts", "eslint.config.mts", "eslint.config.cts",
  ".oxlintrc.json", "oxlint.config.ts", "oxlint.json",
  "knip.json", "knip.jsonc", ".knip.json", ".knip.jsonc", "knip.ts", "knip.js", "knip.config.ts", "knip.config.js",
];

const competingPackageKeys: readonly string[] = ["eslintConfig", "knip"];

const readJson = (path: string): unknown => {
  const parsed = tryCatch((): unknown => JSON.parse(readFileSync(path, "utf8")));
  return parsed instanceof ArchitectureError ? undefined : parsed;
};

/** Biome counts only while its linter is on; as a formatter alone it does not compete. */
const isLintingBiome = (path: string): boolean => {
  if (!existsSync(path)) return false;
  return !/"linter"\s*:\s*\{[^}]*"enabled"\s*:\s*false/.test(readFileSync(path, "utf8"));
};

const competingMessage = "Its checks compete with architecture-check, and editors show its warnings instead. Move what you need into architecture.config.ts and delete it.";

const packageKeyIssues = (root: string): readonly Issue[] => {
  const manifest = readJson(join(root, "package.json"));
  if (!isRecord(manifest)) return [];
  return competingPackageKeys.filter((key) => key in manifest).map((key) => ({
    ruleId: "competing-configuration", file: "package.json", message: `package.json#${key}: ${competingMessage}`,
  }));
};

/** Other linters' and dead-code tools' configuration in the project root. */
export const competingConfiguration = (root: string): readonly Issue[] => {
  const biome = ["biome.json", "biome.jsonc"].filter((file) => isLintingBiome(join(root, file)));
  const present = [...competingFiles.filter((file) => existsSync(join(root, file))), ...biome];
  return [
    ...present.map((file) => ({ ruleId: "competing-configuration", file, message: competingMessage })),
    ...packageKeyIssues(root),
  ];
};

/** The TypeScript an editor opening the root would use: the root's own node_modules/typescript. */
const installedVersion = (root: string): string | undefined => {
  const manifest = readJson(join(root, "node_modules", "typescript", "package.json"));
  if (!isRecord(manifest)) return undefined;
  return isString(manifest.version) ? manifest.version : undefined;
};

/** The project's own TypeScript, when it has one, must be the version the checker runs. */
export const typescriptVersion = (root: string, checkerVersion: string): readonly Issue[] => {
  const version = installedVersion(root);
  const isOtherVersion = version !== undefined && version !== checkerVersion;
  if (!isOtherVersion) return [];
  return [{
    ruleId: "typescript-version",
    file: "package.json",
    message: `The project uses TypeScript ${version}, the checker ${checkerVersion}. Editors would report different compiler errors; set typescript to ${checkerVersion}.`,
  }];
};
