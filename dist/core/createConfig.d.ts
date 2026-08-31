import { type ArchitectureRuleId } from "../rules/index.js";
import type { OxlintRuleConfiguration, Severity } from "./defineRule.js";
type MutableOxlintConfiguration = Severity | [Severity, ...unknown[]];
type RuleOverride = OxlintRuleConfiguration | {
    readonly severity: Severity;
    readonly reason: string;
};
type ConfigOptions = {
    readonly rules?: Partial<Record<ArchitectureRuleId, RuleOverride>>;
    readonly overrides?: readonly {
        readonly files: readonly string[];
        readonly reason: string;
        readonly rules: Partial<Record<ArchitectureRuleId, RuleOverride>>;
    }[];
    readonly pluginSpecifier?: string;
};
export declare const createConfig: (options?: ConfigOptions) => {
    plugins: ("eslint" | "import" | "jsx-a11y" | "oxc" | "promise" | "react" | "typescript" | "unicorn")[];
    jsPlugins: {
        name: string;
        specifier: string;
    }[];
    options: {
        typeAware: true;
    };
    rules: {
        [k: string]: MutableOxlintConfiguration;
    };
    overrides?: {
        files: string[];
        rules: {
            [k: string]: MutableOxlintConfiguration;
        };
    }[];
};
export {};
//# sourceMappingURL=createConfig.d.ts.map