import type { Rule } from "eslint";
export declare const noRawExceptionsRule: {
    readonly id: "no-raw-exceptions";
    readonly title: "Confine raw exceptions to explicit adapters";
    readonly description: string;
    readonly instead: "Return an error value; wrap a call that can throw or reject in tryCatch or tryCatchAsync, and keep raw try/throw in the error adapter.";
    readonly suppressWhen: "A framework requires a throw, such as a router redirect, at the one place it is required.";
    readonly evasions: readonly [{
        readonly name: "Leaving a rejecting call unwrapped";
        readonly code: "const loadProject = async (projectId: string): Promise<Project | ProjectError> => {\n  const response = await httpClient.get(`/projects/${projectId}`);\n  return parseProject(response.body);\n};";
        readonly why: "There is no try or throw to report, so the rule passes, but a network failure rejects past every caller that branches on returned errors. Wrap the call: await tryCatchAsync(() => httpClient.get(url)).";
    }];
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: Rule.RuleModule;
    };
};
//# sourceMappingURL=noRawExceptions.rule.d.ts.map