import { defineRule } from "../core/defineRule.js";
import { collectChainIfs, collectConsecutiveIfRuns, getSwitchCandidateHead } from "./preferSwitchCandidates.js";
const DESCRIPTION = `
Use a switch for adjacent terminal decisions comparing the same value with
strict equality. Each branch must directly return or throw, optionally after
other statements. Independent effectful if statements are not alternatives:
combining them can change execution count or the value tested later.

This syntax check does not prove a closed union or stable property reads.
Value-only mappings may instead use an exhaustive readonly record. It does
not enforce records or replace React render-state guard returns. Branches
containing JSX are left to the component-state convention.
`.trim();
const implementation = {
    meta: {
        type: "suggestion",
        docs: {
            description: DESCRIPTION,
        },
        messages: {
            preferSwitch: "Use a switch for these terminal decisions, or an exhaustive readonly record for a value mapping. Preserve evaluation order and property-read behavior. See rule prefer-switch.",
        },
    },
    create(context) {
        const reportChain = (nodes) => {
            const head = getSwitchCandidateHead(nodes, context.sourceCode);
            if (head === undefined)
                return;
            context.report({ node: head, messageId: "preferSwitch" });
        };
        const checkConsecutiveIfs = (statements) => {
            for (const run of collectConsecutiveIfRuns(statements, context.sourceCode)) {
                reportChain(run);
            }
        };
        return {
            IfStatement(node) {
                const isElseIf = node.parent.type === "IfStatement" && node.parent.alternate === node;
                if (isElseIf)
                    return;
                reportChain(collectChainIfs(node));
            },
            Program(node) {
                checkConsecutiveIfs(node.body);
            },
            BlockStatement(node) {
                checkConsecutiveIfs(node.body);
            },
            SwitchCase(node) {
                checkConsecutiveIfs(node.consequent);
            },
        };
    },
};
export const preferSwitchRule = defineRule({
    id: "prefer-switch",
    title: "Prefer switch over repeated equality ifs",
    description: DESCRIPTION,
    enforcement: {
        type: "custom-oxlint",
        configuration: "error",
        implementation,
    },
});
//# sourceMappingURL=preferSwitch.rule.js.map