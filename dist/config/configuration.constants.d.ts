/** Field names accepted at each level of architecture.config.ts. */
export declare const ARCHITECTURE_FIELDS: readonly ["projects", "layers", "naming", "rules"];
export declare const PROJECTS_FIELDS: readonly ["tsconfigs", "references"];
export declare const LAYER_FIELDS: readonly ["description", "files", "exclude", "naming", "dependencies", "rules", "generated"];
export declare const NAMING_FIELDS: readonly ["case", "prefix", "suffixes", "requiredSuffix", "allowedNames"];
export declare const DEPENDENCY_FIELDS: readonly ["internal", "external", "assets"];
export declare const GENERATED_FIELDS: readonly ["reason"];
export declare const RULE_SETTING_FIELDS: readonly ["severity", "options", "reason"];
export declare const REFERENCE_MODES: readonly ["follow", "explicit"];
export declare const SEVERITIES: readonly ["off", "warn", "error"];
/** Names that would collide with Object.prototype when used as record keys. */
export declare const RESERVED_LAYER_NAMES: readonly string[];
/** Upper bounds for the unsigned integer formats used by Oxlint's schema. */
export declare const UNSIGNED_FORMAT_MAXIMUM: Readonly<Record<string, number>>;
//# sourceMappingURL=configuration.constants.d.ts.map