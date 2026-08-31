import path from "node:path";
import picomatch from "picomatch";
import { defineRule } from "../core/defineRule.js";
const DESCRIPTION = `
Name files after one primary concept.

This package does not impose filename conventions on its own. The consuming
project must supply banned basenames, suffix/case rules, and named allow
groups. With none of those options, every filename is allowed.

A predictable filename should give me a strong idea of the concept I will
find inside the module.
`.trim();
const isFilenameCase = (value) => {
    return value === "pascal" || value === "camel" || value === "pascalOrCamel";
};
const isPascalCase = (value) => {
    return /^[A-Z][A-Za-z0-9]*$/.test(value);
};
const isCamelCase = (value) => {
    return /^[a-z][A-Za-z0-9]*$/.test(value);
};
const isValidCase = (stem, filenameCase) => {
    if (filenameCase === "pascal") {
        return isPascalCase(stem);
    }
    if (filenameCase === "camel") {
        return isCamelCase(stem);
    }
    return isPascalCase(stem) || isCamelCase(stem);
};
const toPosixPath = (value) => {
    return value.replaceAll("\\", "/");
};
const getRelativeFilename = (filename, cwd) => {
    const relative = toPosixPath(path.relative(cwd, filename));
    if (relative.startsWith("../") || relative === "..") {
        return toPosixPath(filename);
    }
    return relative;
};
const isAllowedByGlob = (filename, groups) => {
    return Object.values(groups).some((patterns) => patterns.some((pattern) => picomatch.isMatch(filename, pattern, { dot: true })));
};
const isPlainObject = (value) => {
    return value !== null && typeof value === "object" && !Array.isArray(value);
};
const getAllowGroups = (value) => {
    if (!isPlainObject(value)) {
        return {};
    }
    return Object.fromEntries(Object.entries(value).flatMap(([group, patterns]) => {
        if (!Array.isArray(patterns)) {
            return [];
        }
        if (!patterns.every((pattern) => typeof pattern === "string")) {
            return [];
        }
        return [[group, patterns]];
    }));
};
const getBanned = (value) => {
    if (!Array.isArray(value)) {
        return [];
    }
    return value.filter((entry) => typeof entry === "string");
};
const getSuffixes = (value) => {
    if (!isPlainObject(value)) {
        return {};
    }
    return Object.fromEntries(Object.entries(value).flatMap(([suffix, filenameCase]) => {
        if (typeof filenameCase !== "string") {
            return [];
        }
        if (!isFilenameCase(filenameCase)) {
            return [];
        }
        return [[suffix, filenameCase]];
    }));
};
const getFileNamingOptions = (options) => {
    if (!isPlainObject(options)) {
        return {};
    }
    return {
        allow: getAllowGroups(options.allow),
        banned: getBanned(options.banned),
        suffixes: getSuffixes(options.suffixes),
    };
};
const hasConstraints = (options) => {
    const banned = options.banned ?? [];
    const suffixes = options.suffixes ?? {};
    return banned.length > 0 || Object.keys(suffixes).length > 0;
};
const findSuffixRule = (filename, suffixes) => {
    const match = Object.entries(suffixes)
        .sort(([left], [right]) => right.length - left.length)
        .find(([suffix]) => filename.endsWith(suffix));
    if (match === undefined) {
        return undefined;
    }
    const [suffix, filenameCase] = match;
    return { suffix, filenameCase };
};
const implementation = {
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
                    banned: {
                        type: "array",
                        items: {
                            type: "string",
                        },
                    },
                    suffixes: {
                        type: "object",
                        additionalProperties: {
                            type: "string",
                            enum: ["pascal", "camel", "pascalOrCamel"],
                        },
                    },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            bannedFilename: "Filename '{{filename}}' is a generic dumping-ground name. " +
                "Name the file after one primary concept. See rule file-naming.",
            invalidFilename: "Filename '{{filename}}' does not match the architecture filename rules. " +
                "Files should be named after one primary concept. See rule file-naming.",
        },
    },
    create(context) {
        return {
            Program(node) {
                const options = getFileNamingOptions(context.options[0]);
                if (!hasConstraints(options)) {
                    return;
                }
                const relativeFilename = getRelativeFilename(context.filename, context.cwd);
                if (isAllowedByGlob(relativeFilename, options.allow ?? {})) {
                    return;
                }
                const filename = path.basename(relativeFilename);
                const banned = options.banned ?? [];
                if (banned.includes(filename)) {
                    context.report({
                        node,
                        messageId: "bannedFilename",
                        data: {
                            filename,
                        },
                    });
                    return;
                }
                const suffixRule = findSuffixRule(filename, options.suffixes ?? {});
                if (suffixRule === undefined) {
                    return;
                }
                const stem = filename.slice(0, -suffixRule.suffix.length);
                if (isValidCase(stem, suffixRule.filenameCase)) {
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
        configuration: "error",
        implementation,
    },
});
//# sourceMappingURL=fileNaming.rule.js.map