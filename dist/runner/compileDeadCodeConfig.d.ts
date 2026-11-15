import type { ClassifiedFile } from "../analysis/inventory.js";
type WorkspaceConfig = {
    readonly entry: readonly string[];
    readonly project: readonly string[];
};
export type DeadCodeConfig = {
    readonly workspaces: Readonly<Record<string, WorkspaceConfig>>;
    readonly includeEntryExports: true;
};
/**
 * The dead-code engine's configuration, compiled from the inventory: TypeScript decides which files exist, layer
 * entries (and architecture.config.ts, which the checker loads) decide where reachability starts, and each file is
 * configured in its own workspace package. Entry exports count as unused unless the layer names them public.
 */
export declare const compileDeadCodeConfig: (files: readonly ClassifiedFile[], workspaces: readonly string[], configFile: string) => DeadCodeConfig;
export {};
//# sourceMappingURL=compileDeadCodeConfig.d.ts.map