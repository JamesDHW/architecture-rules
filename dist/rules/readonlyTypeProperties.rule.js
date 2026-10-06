import { defineRule } from "../core/defineRule.js";
import { isPresent } from "../core/guards.js";
import { childNodes, locationOf } from "./syntaxNode.js";
const DESCRIPTION = `
Mark every data-model property and collection readonly, and compose nested
models that are themselves readonly. Mutable types may exist only inside
isolated adapters where an external API requires mutation.

Readonly types prevent mutation through this contract and tell readers that
consumers must treat the value as immutable.
`.trim();
/** Property signatures and index signatures hold data; methods and call signatures do not. */
const isMutableDataMember = (member) => {
    const holdsData = member.type === "TSPropertySignature" || member.type === "TSIndexSignature";
    return holdsData && member.readonly !== true;
};
const implementation = {
    meta: {
        type: "suggestion",
        docs: {
            description: DESCRIPTION,
        },
        messages: {
            readonlyProperty: "Type-literal properties and index signatures must be readonly. See rule readonly-type-properties.",
        },
    },
    create(context) {
        return {
            TSTypeLiteral(node) {
                const locations = childNodes(node, "members").filter(isMutableDataMember).map(locationOf).filter(isPresent);
                for (const loc of locations) {
                    context.report({ loc, messageId: "readonlyProperty" });
                }
            },
        };
    },
};
export const readonlyTypePropertiesRule = defineRule({
    id: "readonly-type-properties",
    title: "Declare data as recursively readonly",
    description: DESCRIPTION,
    enforcement: {
        type: "custom-oxlint",
        configuration: "error",
        implementation,
    },
});
//# sourceMappingURL=readonlyTypeProperties.rule.js.map