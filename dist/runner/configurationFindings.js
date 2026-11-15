import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { competingConfiguration, typescriptVersion, unmatchedPatterns, unusedPermissions } from "../analysis/configurationChecks.js";
import { relativePath } from "../analysis/paths.js";
import { isRecord, isString } from "../core/guards.js";
import { structuralFinding } from "./findings.js";
const requireFromPackage = createRequire(import.meta.url);
/** The TypeScript version the checker runs, from its own dependency. */
const checkerTypeScript = () => {
    const manifest = requireFromPackage("typescript/package.json");
    const version = isRecord(manifest) ? manifest.version : undefined;
    return isString(version) ? version : "unknown";
};
const configText = (path) => {
    if (!existsSync(path))
        return "";
    return readFileSync(path, "utf8");
};
/** The architecture configuration, read so findings about it can point at their line. */
export const readConfig = (root, configFile) => {
    const path = configFile ?? join(root, "architecture.config.ts");
    return { file: relativePath(root, path), text: configText(path) };
};
/** Checks of the configuration and project setup, at the severity architecture.config.ts gives each rule. */
export const configurationFindings = (root, opened, scope, uses) => {
    const { architecture, files, config } = scope;
    const issues = [
        ...unusedPermissions(architecture, uses, config),
        ...unmatchedPatterns(architecture, files, config),
        ...competingConfiguration(root),
        ...typescriptVersion(root, checkerTypeScript()),
    ];
    return issues.flatMap((issue) => {
        const severity = architecture.defaults.rules[issue.ruleId]?.severity ?? "error";
        if (severity === "off")
            return [];
        return [{ ...structuralFinding(issue), severity: severity === "warn" ? "warning" : "error" }];
    });
};
//# sourceMappingURL=configurationFindings.js.map