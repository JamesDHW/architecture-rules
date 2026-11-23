import { basename } from "node:path";
import { defineRule } from "../core/defineRule.js";
import { STYLE_MODULE_PATTERN } from "./cssModuleOwnership.constants.js";
import { withPlaceholders } from "./messagePlaceholders.js";
const DESCRIPTION = `
A CSS module belongs to one component. Import X.module.css (or .scss, .sass,
.less) only from the component file of the same name, X.tsx or X.jsx: not
from another component, and not from its hook or styles file.

Good: // Card.tsx
      import styles from "./Card.module.css";
Bad:  // Badge.tsx
      import styles from "./Card.module.css";
      // Card.hook.ts
      import styles from "./Card.module.css";

A stylesheet imported by many components becomes a component library
without components: changing one class changes screens nobody checked.
Styles shared on purpose belong in a primitive component that the others
render, or in global tokens.
`.trim();
const ownerOf = (specifier) => basename(specifier).replace(STYLE_MODULE_PATTERN, "");
/** The importing file's name without only its final extension: Card for Card.tsx, Card.hook for Card.hook.ts. */
const stemOf = (filename) => basename(filename).replace(/\.[cm]?[jt]sx?$/, "");
/** The specifier of an import of a CSS module; undefined for any other node or import. */
const styleModuleOf = (node) => {
    if (node.type !== "ImportDeclaration")
        return undefined;
    const specifier = node.source.value;
    const isStyleModule = typeof specifier === "string" && STYLE_MODULE_PATTERN.test(specifier);
    return isStyleModule ? specifier : undefined;
};
const implementation = {
    meta: {
        type: "suggestion",
        docs: { description: DESCRIPTION },
        schema: [],
        messages: {
            foreign: "{{stylesheet}} belongs to {{owner}}; only {{owner}}.tsx may import it. Render {{owner}}, or give this file its own module. See rule css-module-ownership.",
        },
    },
    create(context) {
        return {
            ImportDeclaration(node) {
                const specifier = styleModuleOf(node);
                if (specifier === undefined)
                    return;
                const owner = ownerOf(specifier);
                if (stemOf(context.filename) === owner)
                    return;
                context.report(withPlaceholders({ node, messageId: "foreign" }, { stylesheet: basename(specifier), owner }));
            },
        };
    },
};
export const cssModuleOwnershipRule = defineRule({
    id: "css-module-ownership",
    title: "Import a CSS module only from its own component",
    description: DESCRIPTION,
    instead: "Import X.module.css only from X.tsx; share styles by rendering a component, or give this file its own module.",
    suppressWhen: "A stylesheet is shared on purpose, such as one layout module used by every page of a route group.",
    enforcement: { type: "custom-oxlint", configuration: "error", implementation },
});
//# sourceMappingURL=cssModuleOwnership.rule.js.map