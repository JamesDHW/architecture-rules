import type { Architecture, EffectivePolicy } from "./types.js";
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
export declare const inventory: (root: string, architecture: Architecture, sources: ReadonlySet<string>) => Inventory;
//# sourceMappingURL=inventory.d.ts.map