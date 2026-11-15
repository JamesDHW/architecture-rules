/** TypeScript's JsxEmit values whose output imports the JSX runtime, or leaves JSX to a bundler that does. */
const automaticRuntimeEmits = new Set([1, 3, 4, 5]);
const developmentRuntimeEmit = 5;
/** JSX compiles to an import of the JSX runtime that the source never spells out; a JSX file uses that permission too. */
export const jsxRuntimeUses = (file, project) => {
    const { jsx, jsxImportSource } = project.compilerOptions;
    const hasJsx = /\.[jt]sx$/i.test(file.path) && automaticRuntimeEmits.has(jsx);
    if (!hasJsx)
        return [];
    const source = typeof jsxImportSource === "string" ? jsxImportSource : "react";
    const runtime = jsx === developmentRuntimeEmit ? "jsx-dev-runtime" : "jsx-runtime";
    return [{ layer: file.layer, kind: "external", value: `${source}/${runtime}` }];
};
//# sourceMappingURL=jsxRuntime.js.map