/** Field names accepted at each level of architecture.config.ts. */
export const ARCHITECTURE_FIELDS = ["projects", "layers", "naming", "rules", "adoption"] as const;
export const ADOPTION_FIELDS = ["mode", "onTouch"] as const;
export const ON_TOUCH_FIELDS = ["default", "rules"] as const;
export const ADOPTION_MODES = ["enforce", "observe"] as const;
export const TOUCH_POLICIES = ["fix", "no-new"] as const;

/** Rules whose existing findings stay allowed in a file someone changes: fixing one can mean a refactor. */
export const NO_NEW_ON_TOUCH: readonly string[] = ["allowed-imports"];
export const PROJECTS_FIELDS = ["tsconfigs", "references"] as const;
export const LAYER_FIELDS = ["description", "files", "exclude", "naming", "dependencies", "rules", "generated", "entry", "development"] as const;
export const NAMING_FIELDS = ["case", "prefix", "suffixes", "requiredSuffix", "allowedNames"] as const;
export const DEPENDENCY_FIELDS = ["internal", "external", "assets"] as const;
export const GENERATED_FIELDS = ["reason"] as const;
export const ENTRY_FIELDS = ["reason", "files", "exports"] as const;
export const RULE_SETTING_FIELDS = ["severity", "options", "reason"] as const;

export const REFERENCE_MODES = ["follow", "explicit"] as const;
export const SEVERITIES = ["off", "warn", "error"] as const;

/** Names that would collide with Object.prototype when used as record keys. */
export const RESERVED_LAYER_NAMES: readonly string[] = ["__proto__", "constructor", "prototype"];

/** Upper bounds for the unsigned integer formats used by Oxlint's schema. */
export const UNSIGNED_FORMAT_MAXIMUM: Readonly<Record<string, number>> = { uint8: 255, uint32: 4294967295 };
