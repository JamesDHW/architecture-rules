import { expectedFinding } from "../../core/ruleCases.js";
export const cssModuleOwnershipCases = [
    {
        lang: "tsx",
        valid: [
            { name: "a component imports its own module", filename: "src/ui/Card.tsx", code: 'import styles from "./Card.module.css";\nexport const cardClass = styles.card;\n' },
            { name: "a Sass module", filename: "src/ui/Card.tsx", code: 'import styles from "./Card.module.scss";\nexport const cardClass = styles.card;\n' },
            { name: "a global stylesheet is not a module", filename: "src/app/Layout.tsx", code: 'import "./globals.css";\nexport const layoutName = "layout";\n' },
        ],
        invalid: [
            {
                name: "another component's module",
                filename: "src/ui/Badge.tsx",
                code: 'import styles from "./Card.module.css";\nexport const badgeClass = styles.card;\n',
                errors: [expectedFinding("foreign", { stylesheet: "Card.module.css", owner: "Card" })],
            },
        ],
    },
    {
        valid: [],
        invalid: [
            {
                name: "the component's hook",
                filename: "src/ui/Card.hook.ts",
                code: 'import styles from "./Card.module.css";\nexport const cardClass = styles.card;\n',
                errors: [expectedFinding("foreign", { stylesheet: "Card.module.css", owner: "Card" })],
            },
        ],
    },
];
//# sourceMappingURL=cssModuleOwnership.cases.js.map