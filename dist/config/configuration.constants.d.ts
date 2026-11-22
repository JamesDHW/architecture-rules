/** Field names accepted at each level of architecture.config.ts. */
export declare const ARCHITECTURE_FIELDS: readonly ["projects", "layers", "naming", "rules", "adoption"];
export declare const ADOPTION_FIELDS: readonly ["mode", "onTouch"];
export declare const ON_TOUCH_FIELDS: readonly ["default", "rules"];
export declare const ADOPTION_MODES: readonly ["enforce", "observe"];
export declare const TOUCH_POLICIES: readonly ["fix", "no-new"];
/** Rules whose existing findings stay allowed in a file someone changes: fixing one can mean a refactor. */
export declare const NO_NEW_ON_TOUCH: readonly string[];
export declare const PROJECTS_FIELDS: readonly ["tsconfigs", "references"];
export declare const LAYER_FIELDS: readonly ["description", "files", "exclude", "naming", "dependencies", "rules", "generated", "entry", "development"];
export declare const NAMING_FIELDS: readonly ["case", "prefix", "suffixes", "requiredSuffix", "allowedNames"];
export declare const DEPENDENCY_FIELDS: readonly ["internal", "external", "assets"];
export declare const GENERATED_FIELDS: readonly ["reason"];
export declare const ENTRY_FIELDS: readonly ["reason", "files", "exports"];
export declare const RULE_SETTING_FIELDS: readonly ["severity", "options", "reason"];
export declare const REFERENCE_MODES: readonly ["follow", "explicit"];
export declare const SEVERITIES: readonly ["off", "warn", "error"];
/** Names that would collide with Object.prototype when used as record keys. */
export declare const RESERVED_LAYER_NAMES: readonly string[];
/** Upper bounds for the unsigned integer formats used by Oxlint's schema. */
export declare const UNSIGNED_FORMAT_MAXIMUM: Readonly<Record<string, number>>;
//# sourceMappingURL=configuration.constants.d.ts.map