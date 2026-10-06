import path from "node:path";
import { defineRule } from "../core/defineRule.js";
import { SCREAMING_SNAKE_CASE } from "./constantsModule.constants.js";
import { withPlaceholders } from "./messagePlaceholders.js";
const DESCRIPTION = `
Declare SCREAMING_SNAKE_CASE semantic constants in a file ending with
.constants.ts, including constants used by only one consumer.

A consistent suffix makes policy values easy to locate and keeps executable
modules focused on behavior.
`.trim();
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
                const { id, parent } = node;
                const isSemanticConstant = parent.type === "VariableDeclaration"
                    && parent.kind === "const"
                    && id.type === "Identifier"
                    && isSemanticConstantName(id.name);
                if (!isSemanticConstant)
                    return;
                context.report(withPlaceholders({ node: id, messageId: "constantsModule" }, { name: id.name }));
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