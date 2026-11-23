/** Field names accepted at each level of architecture.config.ts. */
export const ARCHITECTURE_FIELDS = ["projects", "glossaries", "layers", "naming", "rules", "adoption"];
export const ADOPTION_FIELDS = ["mode", "onTouch"];
export const ON_TOUCH_FIELDS = ["default", "rules"];
export const ADOPTION_MODES = ["enforce", "observe"];
export const TOUCH_POLICIES = ["fix", "no-new"];
/**
 * Rules whose fix reaches beyond the touched file: an import's fix can move code between layers, and a function's
 * parameters change at every call site. A touched file must not add findings under them, but may keep recorded ones.
 */
export const NO_NEW_ON_TOUCH = ["allowed-imports", "max-params"];
export const PROJECTS_FIELDS = ["tsconfigs", "references"];
export const LAYER_FIELDS = ["description", "files", "exclude", "naming", "dependencies", "rules", "generated", "entry", "development", "glossary"];
export const GLOSSARY_FIELDS = ["description", "terms"];
export const TERM_FIELDS = ["definition", "avoid", "type"];
export const NAMING_FIELDS = ["case", "prefix", "suffixes", "requiredSuffix", "allowedNames"];
export const DEPENDENCY_FIELDS = ["internal", "external", "assets"];
export const GENERATED_FIELDS = ["reason"];
export const ENTRY_FIELDS = ["reason", "files", "exports"];
export const RULE_SETTING_FIELDS = ["severity", "options", "reason"];
export const REFERENCE_MODES = ["follow", "explicit"];
export const SEVERITIES = ["off", "warn", "error"];
/** Names that would collide with Object.prototype when used as record keys. */
export const RESERVED_LAYER_NAMES = ["__proto__", "constructor", "prototype"];
/** Upper bounds for the unsigned integer formats used by Oxlint's schema. */
export const UNSIGNED_FORMAT_MAXIMUM = { uint8: 255, uint32: 4294967295 };
//# sourceMappingURL=configuration.constants.js.map