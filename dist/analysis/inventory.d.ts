import type { Architecture, EffectivePolicy } from "../config/types.js";
export type Issue = {
    readonly ruleId: string;
    readonly file: string;
    readonly message: string;
    readonly line?: number;
};
export type ClassifiedFile = {
    readonly path: string;
    readonly relative: string;
    readonly type: string;
    readonly policy: EffectivePolicy;
};
export type Inventory = {
    readonly files: readonly ClassifiedFile[];
    readonly issues: readonly Issue[];
};
export declare const classify: (architecture: Architecture, path: string) => readonly string[];
/** TypeScript owns membership. Never rescan the root or reinterpret tsconfig globs. */
export declare const inventory: (rootPath: string, architecture: Architecture, sources: ReadonlySet<string>) => Inventory;
//# sourceMappingURL=inventory.d.ts.map