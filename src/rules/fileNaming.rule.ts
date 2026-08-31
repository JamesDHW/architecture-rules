import path from "node:path";

import type { Rule } from "eslint";
import picomatch from "picomatch";

import { defineRule } from "../core/defineRule.js";

const DESCRIPTION = `
Name files after one primary concept.

Use PascalCase for React components and classes, camelCase for ordinary
functions and modules, and controlled suffixes such as .hook.ts,
.constants.ts, and .schema.ts.

Generic dumping-ground filenames such as utils.ts, helpers.ts, common.ts,
and types.ts are not allowed.

Framework-required or otherwise exceptional filenames may be explicitly
allowed through named glob groups.

A predictable filename should give me a strong idea of the concept I will
find inside the module.
`.trim();

const BANNED_FILENAMES = new Set([
  "utils.ts",
  "utils.tsx",
  "helpers.ts",
  "helpers.tsx",
  "common.ts",
  "common.tsx",
  "types.ts",
  "types.tsx",
]);

const DEFAULT_ALLOW = {
  entrypoints: ["**/index.ts", "**/index.tsx"],
  tests: [
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/*.spec.ts",
    "**/*.spec.tsx",
  ],
  framework: ["**/page.tsx", "**/layout.tsx"],
} as const;

const isPascalCase = (value: string): boolean => {
  return /^[A-Z][A-Za-z0-9]*$/.test(value);
};

const isCamelCase = (value: string): boolean => {
  return /^[a-z][A-Za-z0-9]*$/.test(value);
};

const toPosixPath = (value: string): string => {
  return value.replaceAll("\\", "/");
};

const getRelativeFilename = (filename: string, cwd: string): string => {
  const relative = toPosixPath(path.relative(cwd, filename));
  if (relative.startsWith("../") || relative === "..") {
    return toPosixPath(filename);
  }

  return relative;
};

const isAllowedByGlob = (
  filename: string,
  groups: Readonly<Record<string, readonly string[]>>,
): boolean => {
  return Object.values(groups).some((patterns) =>
    patterns.some((pattern) =>
      picomatch.isMatch(filename, pattern, { dot: true }),
    ),
  );
};

const getAllowGroups = (
  options: unknown,
): Readonly<Record<string, readonly string[]>> => {
  if (options === undefined || options === null || typeof options !== "object") {
    return DEFAULT_ALLOW;
  }

  if (!("allow" in options)) {
    return DEFAULT_ALLOW;
  }

  const { allow } = options;
  if (allow === undefined || allow === null || typeof allow !== "object") {
    return DEFAULT_ALLOW;
  }

  return allow as Readonly<Record<string, readonly string[]>>;
};

const stemIfSuffix = (
  filename: string,
  suffix: string,
): string | undefined => {
  if (!filename.endsWith(suffix)) {
    return undefined;
  }

  return filename.slice(0, -suffix.length);
};

const isValidNamedFile = (filename: string): boolean => {
  const hookStem = stemIfSuffix(filename, ".hook.ts");
  if (hookStem !== undefined) {
    return isPascalCase(hookStem);
  }

  const constantsStem = stemIfSuffix(filename, ".constants.ts");
  if (constantsStem !== undefined) {
    return isCamelCase(constantsStem);
  }

  const schemaStem = stemIfSuffix(filename, ".schema.ts");
  if (schemaStem !== undefined) {
    return isCamelCase(schemaStem);
  }

  const tsxStem = stemIfSuffix(filename, ".tsx");
  if (tsxStem !== undefined) {
    return isPascalCase(tsxStem);
  }

  const tsStem = stemIfSuffix(filename, ".ts");
  if (tsStem !== undefined) {
    return isPascalCase(tsStem) || isCamelCase(tsStem);
  }

  return true;
};

const implementation: Rule.RuleModule = {
  meta: {
    type: "suggestion",

    docs: {
      description: DESCRIPTION,
    },

    schema: [
      {
        type: "object",
        properties: {
          allow: {
            type: "object",
            additionalProperties: {
              type: "array",
              items: {
                type: "string",
              },
            },
          },
        },
        additionalProperties: false,
      },
    ],

    messages: {
      bannedFilename:
        "Filename '{{filename}}' is a generic dumping-ground name. " +
        "Name the file after one primary concept. See rule file-naming.",
      invalidFilename:
        "Filename '{{filename}}' does not match the architecture filename rules. " +
        "Files should be named after one primary concept. See rule file-naming.",
    },
  },

  create(context) {
    return {
      Program(node) {
        const relativeFilename = getRelativeFilename(
          context.filename,
          context.cwd,
        );
        const allow = getAllowGroups(context.options[0]);

        if (isAllowedByGlob(relativeFilename, allow)) {
          return;
        }

        const filename = path.basename(relativeFilename);

        if (BANNED_FILENAMES.has(filename)) {
          context.report({
            node,
            messageId: "bannedFilename",
            data: {
              filename,
            },
          });
          return;
        }

        if (isValidNamedFile(filename)) {
          return;
        }

        context.report({
          node,
          messageId: "invalidFilename",
          data: {
            filename,
          },
        });
      },
    };
  },
};

export const fileNamingRule = defineRule({
  id: "file-naming",

  title: "Name files after one primary concept",

  description: DESCRIPTION,

  enforcement: {
    type: "custom-oxlint",

    configuration: [
      "error",
      {
        allow: DEFAULT_ALLOW,
      },
    ],

    implementation,
  },
});
