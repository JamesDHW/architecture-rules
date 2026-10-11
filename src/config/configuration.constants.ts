/** Field names accepted at each level of architecture.config.ts. */
export const ARCHITECTURE_FIELDS = ["projects", "layers", "naming", "rules"] as const;
export const PROJECTS_FIELDS = ["tsconfigs", "references"] as const;
export const LAYER_FIELDS = ["description", "files", "exclude", "naming", "dependencies", "rules", "generated"] as const;
export const NAMING_FIELDS = ["case", "prefix", "suffixes", "requiredSuffix", "allowedNames"] as const;
export const DEPENDENCY_FIELDS = ["internal", "external", "assets"] as const;
export const GENERATED_FIELDS = ["reason"] as const;
export const RULE_SETTING_FIELDS = ["severity", "options", "reason"] as const;

export const REFERENCE_MODES = ["follow", "explicit"] as const;
export const SEVERITIES = ["off", "warn", "error"] as const;

/** Names that would collide with Object.prototype when used as record keys. */
export const RESERVED_LAYER_NAMES: readonly string[] = ["__proto__", "constructor", "prototype"];

/** Upper bounds for the unsigned integer formats used by Oxlint's schema. */
export const UNSIGNED_FORMAT_MAXIMUM: Readonly<Record<string, number>> = { uint8: 255, uint32: 4294967295 };
