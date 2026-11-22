import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
/** Every single-, double- or backtick-quoted string without interpolation or a line break. */
export const literals = (text) => {
    return [...text.matchAll(/(["'`])((?:(?!\1)[^\\\n$])+)\1/g)].map((match) => ({ value: match[2] ?? "", start: match.index + 1 }));
};
/** The files a relative specifier can mean: as written, with a .js extension standing for .ts, or as a directory index. */
const candidates = (base) => [
    base, base.replace(/\.js$/, ".ts"), base.replace(/\.jsx$/, ".tsx"), base.replace(/\.mjs$/, ".mts"), base.replace(/\.cjs$/, ".cts"),
    ...[".ts", ".tsx", ".d.ts", ".mts", ".cts", ".js", ".jsx"].map((extension) => `${base}${extension}`),
    ...["index.ts", "index.tsx", "index.js"].map((name) => join(base, name)),
];
/** The existing file a relative specifier resolves to from the importing file, or undefined. */
export const resolveRelative = (importer, specifier) => {
    const isRelative = specifier.startsWith("./") || specifier.startsWith("../");
    if (!isRelative)
        return undefined;
    return candidates(resolve(dirname(importer), specifier)).find((path) => existsSync(path) && !path.endsWith("/"));
};
/** Applies non-overlapping edits from the end, so earlier offsets stay valid. */
export const applyTextEdits = (text, edits) => {
    const sorted = edits.toSorted((left, right) => left.start - right.start);
    const previousEnd = (index) => (index === 0 ? 0 : sorted.at(index - 1)?.end ?? 0);
    const pieces = sorted.flatMap((edit, index) => [text.slice(previousEnd(index), edit.start), edit.replacement]);
    return [...pieces, text.slice(sorted.at(-1)?.end ?? 0)].join("");
};
//# sourceMappingURL=specifiers.js.map