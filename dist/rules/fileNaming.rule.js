import path from "node:path";
import picomatch from "picomatch";
import { withPlaceholders } from "./messagePlaceholders.js";
import { hasValidCase, isNamingCase, isNamingPolicy, longestMatchingSuffix, namingError, namingSchema } from "./namingPolicy.js";
import { isRecord, isStringArray, isUnknownArray, isString } from "../core/guards.js";
import { defineRule, defineRuleOptions } from "../core/defineRule.js";
const DESCRIPTION = `
Name files after one primary concept.

Architecture file types select files by paths, never by spelling. Their naming
policy validates every selected source file. A filename failure cannot make a
file fall out of scope. Exact framework names exempt naming only.

This package does not impose filename conventions on its own. The consuming
project must supply banned basenames, suffix/case rules, and named allow
groups. With none of those options, every filename is allowed.

A predictable filename should give me a strong idea of the concept I will
find inside the module.
`.trim();
const toPosixPath = (value) => value.replaceAll("\\", "/");
const getRelativeFilename = (filename, cwd) => {
    const relative = toPosixPath(path.relative(cwd, filename));
    const isOutsideCwd = relative.startsWith("../") || relative === "..";
    return isOutsideCwd ? toPosixPath(filename) : relative;
};
const isAllowedByGlob = (filename, groups) => {
    return Object.values(groups).some((patterns) => patterns.some((pattern) => picomatch.isMatch(filename, pattern, { dot: true })));
};
const getAllowGroups = (value) => {
    if (!isRecord(value))
        return {};
    return Object.fromEntries(Object.entries(value).flatMap(([group, patterns]) => isStringArray(patterns) ? [[group, patterns]] : []));
};
const getBanned = (value) => isUnknownArray(value) ? value.filter(isString) : [];
const getSuffixes = (value) => {
    if (!isRecord(value))
        return {};
    return Object.fromEntries(Object.entries(value).flatMap(([suffix, filenameCase]) => isNamingCase(filenameCase) ? [[suffix, filenameCase]] : []));
};
const getFileNamingOptions = (options) => {
    if (!isRecord(options))
        return {};
    return { allow: getAllowGroups(options.allow), banned: getBanned(options.banned), suffixes: getSuffixes(options.suffixes) };
};
const hasConstraints = (options) => {
    const banned = options.banned ?? [];
    const suffixes = options.suffixes ?? {};
    return banned.length > 0 || Object.keys(suffixes).length > 0;
};
const findSuffixRule = (filename, suffixes) => {
    const longestSuffix = longestMatchingSuffix(filename, Object.keys(suffixes));
    return Object.entries(suffixes)
        .map(([suffix, filenameCase]) => ({ suffix, filenameCase }))
        .find(({ suffix }) => suffix === longestSuffix);
};
/** The legacy allow/banned/suffixes check, used only when no architecture policy is supplied. */
const findLegacyProblem = (options, absoluteFilename, cwd) => {
    const relativeFilename = getRelativeFilename(absoluteFilename, cwd);
    if (isAllowedByGlob(relativeFilename, options.allow ?? {}))
        return undefined;
    const filename = path.basename(relativeFilename);
    if ((options.banned ?? []).includes(filename))
        return { messageId: "bannedFilename", filename };
    const suffixRule = findSuffixRule(filename, options.suffixes ?? {});
    if (suffixRule === undefined)
        return undefined;
    const stem = filename.slice(0, -suffixRule.suffix.length);
    return hasValidCase(stem, suffixRule.filenameCase) ? undefined : { messageId: "invalidFilename", filename };
};
const implementation = {
    meta: {
        type: "suggestion",
        docs: { description: DESCRIPTION },
        schema: [
            {
                type: "object",
                properties: {
                    architecture: namingSchema,
                    allow: { type: "object", additionalProperties: { type: "array", items: { type: "string" } } },
                    banned: { type: "array", items: { type: "string" } },
                    suffixes: { type: "object", additionalProperties: { type: "string", enum: ["pascal", "camel", "pascalOrCamel"] } },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            architectureName: "{{message}} See rule file-naming.",
            bannedFilename: "Filename '{{filename}}' is a generic dumping-ground name. " +
                "Name the file after one primary concept. See rule file-naming.",
            invalidFilename: "Filename '{{filename}}' does not match the architecture filename rules. " +
                "Files should be named after one primary concept. See rule file-naming.",
        },
    },
    create(context) {
        return {
            Program(node) {
                const options = context.options[0];
                const architecture = isRecord(options) ? options.architecture : undefined;
                if (isNamingPolicy(architecture)) {
                    const message = namingError(context.filename, architecture);
                    if (message !== undefined) {
                        context.report(withPlaceholders({ node, messageId: "architectureName" }, { message }));
                    }
                    return;
                }
                const legacyOptions = getFileNamingOptions(options);
                if (!hasConstraints(legacyOptions))
                    return;
                const problem = findLegacyProblem(legacyOptions, context.filename, context.cwd);
                if (problem === undefined)
                    return;
                context.report(withPlaceholders({ node, messageId: problem.messageId }, { filename: problem.filename }));
            },
        };
    },
};
export const fileNamingRule = defineRule({
    id: "file-naming",
    options: defineRuleOptions(implementation.meta?.schema ?? []),
    title: "Name files after one primary concept",
    description: DESCRIPTION,
    enforcement: {
        type: "custom-oxlint",
        configuration: "error",
        implementation,
    },
});
//# sourceMappingURL=fileNaming.rule.js.map