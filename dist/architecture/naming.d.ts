import type { NamingPolicy } from "./types.js";
export declare const namingError: (path: string, policy: NamingPolicy) => string | undefined;
export declare const namingSchema: {
    type: string;
    properties: {
        case: {
            enum: string[];
        };
        prefix: {
            type: string;
            minLength: number;
        };
        suffixes: {
            type: string;
            items: {
                type: string;
                minLength: number;
            };
        };
        allowedNames: {
            type: string;
            items: {
                type: string;
                minLength: number;
            };
        };
    };
    required: string[];
    additionalProperties: boolean;
};
//# sourceMappingURL=naming.d.ts.map