import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { isRecord, isString } from "../core/guards.js";
import { tryCatch } from "../errors/tryCatch.js";
import { ArchitectureError } from "../errors/architectureError.js";
import { matches } from "./paths.js";
const lineAt = (text, offset) => text.slice(0, offset).split("\n").length;
const escaped = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
/** The line of a quoted value inside a layer's block, or of the layer's key; undefined when neither is found. */
const configLine = (config, layer, value) => {
    const layerKey = new RegExp(`["']?\\b${escaped(layer)}\\b["']?\\s*:\\s*\\{`).exec(config.text);
    if (layerKey === null)
        return undefined;
    if (value === undefined)
        return lineAt(config.text, layerKey.index);
    const quoted = new RegExp(`["'\`]${escaped(value)}["'\`]`, "g");
    quoted.lastIndex = layerKey.index;
    const found = quoted.exec(config.text);
    return lineAt(config.text, found === null ? layerKey.index : found.index);
};
const configIssue = (ruleId, config, message, line) => {
    return { ruleId, file: config.file, message, ...(line === undefined ? {} : { line }) };
};
const grantsOf = (layer) => {
    const { internal, external, assets } = layer.policy.dependencies;
    return [
        ...internal.map((value) => ({ kind: "internal", value })),
        ...external.map((value) => ({ kind: "external", value })),
        ...assets.map((value) => ({ kind: "asset", value })),
    ];
};
const isUsedGrant = (uses, name, grant) => uses.some((use) => {
    const isSameGrant = use.layer === name && use.kind === grant.kind;
    if (!isSameGrant)
        return false;
    return grant.kind === "internal" ? use.value === grant.value : matches(use.value, [grant.value]);
});
const grantLabel = ({ kind, value }) => {
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
export const unusedPermissions = (architecture, uses, config) => {
    return Object.entries(architecture.layers).flatMap(([name, layer]) => grantsOf(layer)
        .filter((grant) => !isUsedGrant(uses, name, grant))
        .map((grant) => configIssue("unused-permissions", config, `Layer ${name} grants ${grantLabel(grant)}, but none of its imports use it.`, configLine(config, name, grant.value))));
};
const unmatched = (name, kind, patterns, paths, config) => {
    return patterns
        .filter((pattern) => !paths.some((path) => matches(path, [pattern])))
        .map((pattern) => configIssue("unmatched-patterns", config, `Layer ${name}: ${kind} pattern ${pattern} matches no source file.`, configLine(config, name, pattern)));
};
/** Layer, exclude and entry patterns that match no source file of the programs. */
export const unmatchedPatterns = (architecture, files, sources, config) => {
    return Object.entries(architecture.layers).flatMap(([name, layer]) => {
        const layerFiles = files.filter((file) => file.layer === name).map((file) => file.relative);
        const selectable = sources.filter((path) => matches(path, layer.files));
        return [
            ...unmatched(name, "files", layer.files, layerFiles, config),
            ...unmatched(name, "exclude", layer.exclude ?? [], selectable, config),
            ...unmatched(name, "entry.files", layer.policy.entry?.files ?? [], layerFiles, config),
        ];
    });
};
/** Configuration files of other linters and dead-code tools, which the checker replaces. */
const competingFiles = [
    ".eslintrc", ".eslintrc.js", ".eslintrc.cjs", ".eslintrc.json", ".eslintrc.yml", ".eslintrc.yaml",
    "eslint.config.js", "eslint.config.mjs", "eslint.config.cjs", "eslint.config.ts", "eslint.config.mts", "eslint.config.cts",
    ".oxlintrc.json", "oxlint.config.ts", "oxlint.json",
    "knip.json", "knip.jsonc", ".knip.json", ".knip.jsonc", "knip.ts", "knip.js", "knip.config.ts", "knip.config.js",
];
const competingPackageKeys = ["eslintConfig", "knip"];
const readJson = (path) => {
    const parsed = tryCatch(() => JSON.parse(readFileSync(path, "utf8")));
    return parsed instanceof ArchitectureError ? undefined : parsed;
};
/** Biome counts only while its linter is on; as a formatter alone it does not compete. */
const isLintingBiome = (path) => {
    if (!existsSync(path))
        return false;
    return !/"linter"\s*:\s*\{[^}]*"enabled"\s*:\s*false/.test(readFileSync(path, "utf8"));
};
const competingMessage = "Its checks compete with architecture-check, and editors show its warnings instead. Move what you need into architecture.config.ts and delete it.";
const packageKeyIssues = (root) => {
    const manifest = readJson(join(root, "package.json"));
    if (!isRecord(manifest))
        return [];
    return competingPackageKeys.filter((key) => key in manifest).map((key) => ({
        ruleId: "competing-configuration", file: "package.json", message: `package.json#${key}: ${competingMessage}`,
    }));
};
/** Other linters' and dead-code tools' configuration in the project root. */
export const competingConfiguration = (root) => {
    const biome = ["biome.json", "biome.jsonc"].filter((file) => isLintingBiome(join(root, file)));
    const present = [...competingFiles.filter((file) => existsSync(join(root, file))), ...biome];
    return [
        ...present.map((file) => ({ ruleId: "competing-configuration", file, message: competingMessage })),
        ...packageKeyIssues(root),
    ];
};
/** The TypeScript an editor opening the root would use: the root's own node_modules/typescript. */
const installedVersion = (root) => {
    const manifest = readJson(join(root, "node_modules", "typescript", "package.json"));
    if (!isRecord(manifest))
        return undefined;
    return isString(manifest.version) ? manifest.version : undefined;
};
/** The project's own TypeScript, when it has one, must be the version the checker runs. */
export const typescriptVersion = (root, checkerVersion) => {
    const version = installedVersion(root);
    const isOtherVersion = version !== undefined && version !== checkerVersion;
    if (!isOtherVersion)
        return [];
    return [{
            ruleId: "typescript-version",
            file: "package.json",
            message: `The project uses TypeScript ${version}, the checker ${checkerVersion}. Editors would report different compiler errors; set typescript to ${checkerVersion}.`,
        }];
};
//# sourceMappingURL=configurationChecks.js.map