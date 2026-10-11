import type { DependencyPolicy, GeneratedSetting, NamingPolicy } from "./types.js";
import { type Checked } from "./validation.js";
export declare const naming: (value: unknown, label: string) => Checked<NamingPolicy>;
export declare const dependencies: (value: unknown, layerNames: readonly string[], label: string) => Checked<Required<DependencyPolicy>>;
export declare const generated: (value: unknown, label: string) => Checked<GeneratedSetting>;
//# sourceMappingURL=policies.d.ts.map