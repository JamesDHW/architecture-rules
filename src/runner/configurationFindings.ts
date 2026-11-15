import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";

import { competingConfiguration, typescriptVersion, unmatchedPatterns, unusedPermissions, type ConfigText } from "../analysis/configurationChecks.js";
import type { ImportUse } from "../analysis/imports.js";
import type { ClassifiedFile } from "../analysis/inventory.js";
import { relativePath } from "../analysis/paths.js";
import type { Projects } from "../analysis/projects.js";
import type { Architecture } from "../config/types.js";
import { isRecord, isString } from "../core/guards.js";
import { structuralFinding, type Finding } from "./findings.js";

const requireFromPackage = createRequire(import.meta.url);

/** The TypeScript version the checker runs, from its own dependency. */
const checkerTypeScript = (): string => {
  const manifest: unknown = requireFromPackage("typescript/package.json");
  const version = isRecord(manifest) ? manifest.version : undefined;
  return isString(version) ? version : "unknown";
};

const configText = (path: string): string => {
  if (!existsSync(path)) return "";
  return readFileSync(path, "utf8");
};

/** The architecture configuration, read so findings about it can point at their line. */
export const readConfig = (root: string, configFile: string | undefined): ConfigText => {
  const path = configFile ?? join(root, "architecture.config.ts");
  return { file: relativePath(root, path), text: configText(path) };
};

type Scope = { readonly architecture: Architecture; readonly files: readonly ClassifiedFile[]; readonly config: ConfigText };

/** Checks of the configuration and project setup, at the severity architecture.config.ts gives each rule. */
export const configurationFindings = (root: string, opened: Projects, scope: Scope, uses: readonly ImportUse[]): readonly Finding[] => {
  const { architecture, files, config } = scope;
  const sources = [...opened.sources].map((path) => relativePath(root, path));
  const issues = [
    ...unusedPermissions(architecture, uses, config),
    ...unmatchedPatterns(architecture, files, sources, config),
    ...competingConfiguration(root),
    ...typescriptVersion(root, checkerTypeScript()),
  ];
  return issues.flatMap((issue): readonly Finding[] => {
    const severity = architecture.defaults.rules[issue.ruleId]?.severity ?? "error";
    if (severity === "off") return [];
    return [{ ...structuralFinding(issue), severity: severity === "warn" ? "warning" : "error" }];
  });
};
