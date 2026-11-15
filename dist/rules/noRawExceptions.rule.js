import { defineRule } from "../core/defineRule.js";
const DESCRIPTION = `
Return errors as values instead of throwing or catching exceptions. Keep the
project's error adapter, such as a tryCatch helper and its error types, in a
layer of its own and turn this rule off there with a reason. Everywhere
else, wrap a throwing or rejecting external operation with that adapter
immediately and branch on the returned error.

Good: const project = await tryCatch(() => loadExternalProject(projectId));
      if (project instanceof Error) return project;
Bad: try { return await loadExternalProject(projectId); }
     catch (caught) { return new ProjectLoadError({ cause: caught }); }

A single required API case outside the adapter can use a reasoned line
suppression. This syntax check does not prove that every potentially throwing
external call is wrapped.
`.trim();
const implementation = {
    meta: {
        type: "suggestion", docs: { description: DESCRIPTION }, schema: [],
        messages: { raw: "Return errors as values. Raw throw and catch belong in the error adapter layer. See rule no-raw-exceptions." },
    },
    create(context) {
        return {
            "CatchClause, ThrowStatement"(node) { context.report({ node, messageId: "raw" }); },
        };
    },
};
export const noRawExceptionsRule = defineRule({
    id: "no-raw-exceptions",
    title: "Confine raw exceptions to explicit adapters",
    description: DESCRIPTION,
    instead: "Return an error value; wrap a call that can throw or reject in tryCatch or tryCatchAsync, and keep raw try/throw in the error adapter.",
    suppressWhen: "A framework requires a throw, such as a router redirect, at the one place it is required.",
    evasions: [
        {
            name: "Leaving a rejecting call unwrapped",
            code: "const loadProject = async (projectId: string): Promise<Project | ProjectError> => {\n  const response = await httpClient.get(`/projects/${projectId}`);\n  return parseProject(response.body);\n};",
            why: "There is no try or throw to report, so the rule passes, but a network failure rejects past every caller that branches on returned errors. Wrap the call: await tryCatchAsync(() => httpClient.get(url)).",
        },
    ],
    enforcement: { type: "custom-oxlint", configuration: "error", implementation },
});
//# sourceMappingURL=noRawExceptions.rule.js.map