import { defineRule, defineRuleOptions } from "../core/defineRule.js";
const allowOptions = () => defineRuleOptions([
    { type: "object", properties: { allow: { type: "array", items: { type: "string", minLength: 1 } } }, additionalProperties: false },
]);
export const unusedFilesRule = defineRule({
    id: "unused-files",
    title: "Delete files nothing uses",
    description: `
Every source file in the TypeScript programs must be reachable by imports from
an entry: a layer marked \`entry\` in architecture.config.ts. A file nothing
reaches is dead code: it still has to be read, reviewed and kept compiling, and
it misleads whoever finds it into thinking it matters.
  `.trim(),
    instead: "Delete the file, or, if something outside the program loads it, mark its layer as an entry with a reason.",
    enforcement: { type: "dead-code", scope: "file", configuration: "error" },
});
export const unusedExportsRule = defineRule({
    id: "unused-exports",
    title: "Export only what is imported",
    description: `
Export a value only when another file imports it. An export that nothing
imports, including one used only inside its own file, widens the module's
surface for no caller. Entry files are checked too: only the exports their
layer's \`entry.exports\` names count as used from outside.
  `.trim(),
    instead: "Remove the export keyword, or delete the value if nothing in its file uses it either.",
    suppressWhen: "Something outside the program reads this one export, and the layer's entry exports cannot name it.",
    enforcement: { type: "dead-code", scope: "file", configuration: "error" },
});
export const unusedTypesRule = defineRule({
    id: "unused-types",
    title: "Export only types that are imported",
    description: `
Export a type only when another file imports it. Unused exported types are
dead code that still shapes how readers think the module is used.
  `.trim(),
    instead: "Remove the export keyword from the type, or delete the type if its file does not use it either.",
    suppressWhen: "The type is part of a public API that its layer's entry exports cannot name.",
    enforcement: { type: "dead-code", scope: "file", configuration: "error" },
});
export const duplicateExportsRule = defineRule({
    id: "duplicate-exports",
    title: "Export each value once",
    description: `
Export a value under one name. Two names for the same value split its callers
and make renames incomplete.
  `.trim(),
    instead: "Keep one export name and update the importers of the other.",
    enforcement: { type: "dead-code", scope: "file", configuration: "error" },
});
export const productionReachabilityRule = defineRule({
    id: "production-reachability",
    title: "Ship only code production uses",
    description: `
A file or export in a production layer must be used by production code, not
only by development layers (tests, stories, scripts, tool configuration). Code
that only tests call is dead in production: it is tested, so it looks alive.
  `.trim(),
    instead: "Delete the code and its tests, move it into a development layer, or use it from production code.",
    suppressWhen: "Production deliberately keeps this export for development use, such as a test seam the build strips.",
    enforcement: { type: "dead-code", scope: "file", configuration: "error" },
});
export const unusedDependenciesRule = defineRule({
    id: "unused-dependencies",
    title: "Declare only packages that are used",
    description: `
Every package in package.json must be imported by a file in the TypeScript
programs, run by a package.json script, or used by a tool's configuration. A
package nothing uses still costs install time and supply-chain risk. A package
used without being imported, such as one a framework loads at runtime, is
allowed by name in the rule's options, with a reason.
  `.trim(),
    instead: "Remove the package from package.json, or allow it by name with a reason: \"unused-dependencies\": { options: { allow: [\"sharp\"] }, reason: \"…\" }.",
    options: allowOptions(),
    enforcement: { type: "dead-code", scope: "project", configuration: "error" },
});
export const unlistedDependenciesRule = defineRule({
    id: "unlisted-dependencies",
    title: "Declare every package that is used",
    description: `
Every package a file imports must be declared in package.json. Production
layers may only use dependencies; devDependencies are for development layers.
An undeclared package works only by accident of what else is installed.
  `.trim(),
    instead: "Add the package to package.json: to dependencies when a production layer imports it.",
    options: allowOptions(),
    enforcement: { type: "dead-code", scope: "project", configuration: "error" },
});
export const unlistedBinariesRule = defineRule({
    id: "unlisted-binaries",
    title: "Declare every command the scripts run",
    description: `
Every command a package.json script runs must come from a declared package, or
be allowed by name in the rule's options when the machine provides it.
  `.trim(),
    instead: "Add the package that provides the command, or allow a system command by name with a reason.",
    options: allowOptions(),
    enforcement: { type: "dead-code", scope: "project", configuration: "error" },
});
export const unresolvedImportsRule = defineRule({
    id: "unresolved-imports",
    title: "Resolve every import the same way everywhere",
    description: `
The dead-code analysis must resolve every import TypeScript resolves. When it
cannot, usually because of a path alias or a custom resolver, its view of what
is used is incomplete, so files and exports can look unused when they are not.
  `.trim(),
    instead: "Use an import TypeScript and the bundler resolve the same way, such as a tsconfig paths alias, or report the specifier as a bug.",
    enforcement: { type: "dead-code", scope: "file", configuration: "error" },
});
//# sourceMappingURL=deadCode.rules.js.map