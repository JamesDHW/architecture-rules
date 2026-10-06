import { noArrayMutationRule } from "../src/rules/noArrayMutation.rule.js";
import { runCustomRule } from "./utils/runCustomRule.js";

runCustomRule(noArrayMutationRule, {
  valid: [
    { name: "transformations", code: "const names = projects.filter(isVisible).map((project) => project.name);\n" },
    { name: "non-mutating reorder", code: "const ordered = runs.toSorted(byDate).toReversed();\n" },
    { name: "sequential async", code: "const results = await Array.fromAsync(checks, runCheck);\n" },
    { name: "computed access", code: "items['push'](value);\n" },
    { name: "plain function named push", code: "push(value);\n" },
    { name: "map registry calls are another rule's concern", code: "registry.set(id, value);\nregistry.delete(id);\n" },
    {
      name: "state module",
      filename: "outputBuffer.state.ts",
      code: "export const createOutputBuffer = () => {\n  const chunks: string[] = [];\n  return { append: (text: string) => { chunks.push(text); } };\n};\n",
    },
  ],
  invalid: [
    { name: "push", code: "const failures: string[] = [];\nfailures.push('x');\n", errors: [{ messageId: "arrayMutation" }] },
    { name: "push on a property path", code: "state.items.push(item);\n", errors: [{ messageId: "arrayMutation" }] },
    { name: "shift on a split result", code: "const lines = text.split('\\n');\nconst first = lines.shift();\n", errors: [{ messageId: "arrayMutation" }] },
    { name: "sort in place", code: "runs.sort(byDate);\n", errors: [{ messageId: "arrayMutation" }] },
    { name: "splice", code: "items.splice(0, 1);\n", errors: [{ messageId: "arrayMutation" }] },
    { name: "reverse", code: "items.reverse();\n", errors: [{ messageId: "arrayMutation" }] },
  ],
});
