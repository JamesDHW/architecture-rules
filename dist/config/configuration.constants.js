/** Field names accepted at each level of architecture.config.ts. */
export const ARCHITECTURE_FIELDS = ["projects", "layers", "naming", "rules"];
export const PROJECTS_FIELDS = ["tsconfigs", "references"];
export const LAYER_FIELDS = ["description", "files", "exclude", "naming", "dependencies", "rules", "generated"];
export const NAMING_FIELDS = ["case", "prefix", "suffixes", "requiredSuffix", "allowedNames"];
export const DEPENDENCY_FIELDS = ["internal", "external", "assets"];
export const GENERATED_FIELDS = ["reason"];
export const RULE_SETTING_FIELDS = ["severity", "options", "reason"];
export const REFERENCE_MODES = ["follow", "explicit"];
export const SEVERITIES = ["off", "warn", "error"];
/** Names that would collide with Object.prototype when used as record keys. */
export const RESERVED_LAYER_NAMES = ["__proto__", "constructor", "prototype"];
/** Upper bounds for the unsigned integer formats used by Oxlint's schema. */
export const UNSIGNED_FORMAT_MAXIMUM = { uint8: 255, uint32: 4294967295 };
//# sourceMappingURL=configuration.constants.js.map