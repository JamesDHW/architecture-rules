import { defineRule } from "../core/defineRule.js";
export const forceConsistentCasingInFileNamesRule = defineRule({
    id: "force-consistent-casing-in-file-names",
    title: "Match import paths to on-disk file casing",
    description: `
Enable forceConsistentCasingInFileNames so import specifiers must match the
casing of the files they resolve to.

Case-insensitive filesystems hide these mismatches until the same import
fails on a case-sensitive filesystem.
  `.trim(),
    enforcement: {
        type: "typescript",
        compilerOptions: {
            forceConsistentCasingInFileNames: true,
        },
    },
});
//# sourceMappingURL=forceConsistentCasingInFileNames.rule.js.map