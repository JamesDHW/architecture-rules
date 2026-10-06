type Tsconfig = {
    readonly $schema: string;
    readonly compilerOptions: Readonly<Record<string, unknown>>;
};
export declare const buildTsconfig: () => Tsconfig;
export declare const writeTsconfig: () => Promise<void>;
export {};
//# sourceMappingURL=generateTsconfig.d.ts.map