/** Field names accepted at each level of architecture.config.ts. */
export declare const ARCHITECTURE_FIELDS: readonly ["projects", "defaults", "fileTypes"];
export declare const PROJECT_FIELDS: readonly ["tsconfigs", "references"];
export declare const DEFAULT_FIELDS: readonly ["naming", "imports", "rules"];
export declare const FILE_TYPE_FIELDS: readonly ["description", "files", "exclude", "naming", "imports", "rules", "generated"];
export declare const NAMING_FIELDS: readonly ["case", "prefix", "suffixes", "allowedNames"];
export declare const IMPORT_FIELDS: readonly ["internal", "external", "builtins", "assets"];
export declare const GENERATED_FIELDS: readonly ["reason"];
export declare const RULE_SETTING_FIELDS: readonly ["severity", "options", "reason"];
export declare const NAMING_CASES: readonly ["camel", "pascal", "pascalOrCamel"];
export declare const REFERENCE_MODES: readonly ["follow", "explicit"];
export declare const SEVERITIES: readonly ["off", "warn", "error"];
/** Names that would collide with Object.prototype when used as record keys. */
export declare const RESERVED_TYPE_NAMES: readonly string[];
/** Upper bounds for the unsigned integer formats used by Oxlint's schema. */
export declare const UNSIGNED_FORMAT_MAXIMUM: Readonly<Record<string, number>>;
//# sourceMappingURL=configuration.constants.d.ts.map