import type { DependencyPolicy, EntrySetting, GeneratedSetting, NamingPolicy } from "./types.js";
import { type Checked } from "./validation.js";
export declare const naming: (value: unknown, label: string) => Checked<NamingPolicy>;
export declare const dependencies: (value: unknown, layerNames: readonly string[], label: string) => Checked<Required<DependencyPolicy>>;
export declare const generated: (value: unknown, label: string) => Checked<GeneratedSetting>;
export declare const entryPoint: (value: unknown, label: string) => Checked<EntrySetting>;
export declare const developmentOnly: (value: unknown, label: string) => Checked<boolean>;
//# sourceMappingURL=policies.d.ts.map