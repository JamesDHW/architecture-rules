import { defineNativeOxlintRule } from "./defineNativeOxlintRule.js";
export const maxParamsRule = defineNativeOxlintRule({
    id: "max-params",
    title: "Take at most two positional parameters",
    description: `
Give a function at most two positional parameters. With more, pass one
readonly object and destructure it, so every argument is named at the call
site.

Good: const sendUpdate = ({ to, subject, body }: Update): Promise<Sent> => { ... };
      sendUpdate({ to: address, subject: message.title, body: message.body });
Bad:  const sendUpdate = (to: string, subject: string, body: string): Promise<Sent> => { ... };
      sendUpdate(address, message.body, message.body);

Positional arguments of the same type can be swapped or repeated without a
compiler error, and the call site does not say which is which. A destructured
object parameter counts as one.
  `.trim(),
    instead: "Take one readonly object parameter and destructure it; callers then name each argument.",
    suppressWhen: "A framework or library fixes the signature, such as a middleware's (request, response, next).",
    rule: "max-params",
    configuration: ["error", { max: 2 }],
});
//# sourceMappingURL=maxParams.rule.js.map