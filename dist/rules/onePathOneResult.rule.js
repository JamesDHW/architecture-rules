import { defineRule } from "../core/defineRule.js";
const DESCRIPTION = `
Combine adjacent terminal if guards with identical return expressions into a
named predicate when they represent the same outcome. Preserve short-circuit
predicate order. Only guards whose complete body is a single return qualify.

Good:
  const isUnavailable = isMissing || isArchived;
  if (isUnavailable) return unavailableProject;

Bad:
  if (isMissing) return unavailableProject;
  if (isArchived) return unavailableProject;

Independent conditional effects are not duplicate outcomes: both may execute,
and intervening work must not move. This rule never requests merging those
branches. Matching tokens identify candidates, not proof of shared domain
meaning. Distinct policies may need distinct semantic names even when their
current values coincide. No automatic rewrite is supplied.
`.trim();
const implementation = {
    meta: {
        type: "suggestion",
        docs: { description: DESCRIPTION },
        schema: [],
        messages: {
            sameResult: "These adjacent terminal guards return the same expression. Combine their conditions into a named predicate if they represent the same outcome, preserving evaluation order. See rule one-path-one-result.",
        },
    },
    create(context) {
        const returnedTokens = (statement) => {
            if (statement.type !== "IfStatement" || statement.alternate !== null)
                return undefined;
            const body = statement.consequent;
            const terminal = body.type === "BlockStatement" && body.body.length === 1 ? body.body[0] : body;
            if (terminal?.type !== "ReturnStatement")
                return undefined;
            if (terminal.argument === null || terminal.argument === undefined)
                return "bare-return";
            return JSON.stringify(context.sourceCode.getTokens(terminal.argument).map((token) => [token.type, token.value]));
        };
        const check = (statements) => {
            for (const [index, statement] of statements.entries()) {
                const next = statements[index + 1];
                if (next === undefined)
                    continue;
                const result = returnedTokens(statement);
                if (result === undefined || result !== returnedTokens(next))
                    continue;
                context.report({ node: next, messageId: "sameResult" });
            }
        };
        return {
            BlockStatement(node) { check(node.body); },
            SwitchCase(node) { check(node.consequent); },
        };
    },
};
export const onePathOneResultRule = defineRule({
    id: "one-path-one-result",
    title: "Combine adjacent guards with the same terminal outcome",
    description: DESCRIPTION,
    enforcement: {
        type: "custom-oxlint",
        configuration: "warn",
        implementation,
    },
});
//# sourceMappingURL=onePathOneResult.rule.js.map