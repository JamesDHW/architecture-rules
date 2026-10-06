/** Field names accepted at each level of architecture.config.ts. */
export const ARCHITECTURE_FIELDS = ["projects", "defaults", "fileTypes"] as const;
export const PROJECT_FIELDS = ["tsconfigs", "references"] as const;
export const DEFAULT_FIELDS = ["naming", "imports", "rules"] as const;
export const FILE_TYPE_FIELDS = ["description", "files", "exclude", "naming", "imports", "rules", "generated"] as const;
export const NAMING_FIELDS = ["case", "prefix", "suffixes", "allowedNames"] as const;
export const IMPORT_FIELDS = ["internal", "external", "builtins", "assets"] as const;
export const GENERATED_FIELDS = ["reason"] as const;
export const RULE_SETTING_FIELDS = ["severity", "options", "reason"] as const;

export const NAMING_CASES = ["camel", "pascal", "pascalOrCamel"] as const;
export const REFERENCE_MODES = ["follow", "explicit"] as const;
export const SEVERITIES = ["off", "warn", "error"] as const;

/** Names that would collide with Object.prototype when used as record keys. */
export const RESERVED_TYPE_NAMES: readonly string[] = ["__proto__", "constructor", "prototype"];

/** Upper bounds for the unsigned integer formats used by Oxlint's schema. */
export const UNSIGNED_FORMAT_MAXIMUM: Readonly<Record<string, number>> = { uint8: 255, uint32: 4294967295 };
