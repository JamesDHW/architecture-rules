import path from "node:path";
import { defineRule } from "../core/defineRule.js";
const DESCRIPTION = `
Declare SCREAMING_SNAKE_CASE semantic constants in a file ending with
.constants.ts, including constants used by only one consumer.

A consistent suffix makes policy values easy to locate and keeps executable
modules focused on behavior.
`.trim();
const SCREAMING_SNAKE_CASE = /^[A-Z][A-Z0-9]*(_[A-Z0-9]+)+$/;
const isSemanticConstantName = (name) => {
    return SCREAMING_SNAKE_CASE.test(name);
};
const implementation = {
    meta: {
        type: "suggestion",
        docs: {
            description: DESCRIPTION,
        },
        messages: {
            constantsModule: "Declare '{{name}}' in a *.constants.ts module. See rule constants-module.",
        },
    },
    create(context) {
        const filename = path.basename(context.filename.replaceAll("\\", "/"));
        if (filename.endsWith(".constants.ts")) {
            return {};
        }
        return {
            VariableDeclarator(node) {
                if (node.parent.type !== "VariableDeclaration") {
                    return;
                }
                if (node.parent.kind !== "const") {
                    return;
                }
                if (node.id.type !== "Identifier") {
                    return;
                }
                if (!isSemanticConstantName(node.id.name)) {
                    return;
                }
                context.report({
                    node: node.id,
                    messageId: "constantsModule",
                    data: {
                        name: node.id.name,
                    },
                });
            },
        };
    },
};
export const constantsModuleRule = defineRule({
    id: "constants-module",
    title: "Put semantic constants in a constants module",
    description: DESCRIPTION,
    enforcement: {
        type: "custom-oxlint",
        configuration: "error",
        implementation,
    },
});
//# sourceMappingURL=constantsModule.rule.js.map