import { expectedFinding, type RuleCases } from "../../core/ruleCases.js";

export const maxFunctionLinesWarnCases: readonly RuleCases[] = [
  {
    valid: [
      { name: "at the configured maximum", options: [{ max: 3 }], code: "const run = (): number => {\n  return 1;\n};\n" },
      { name: "blank and comment-only lines skipped", options: [{ max: 3 }], code: "const run = (): number => {\n\n  // one\n  return 1;\n};\n" },
      { name: "an immediately invoked function is not counted", options: [{ max: 2 }], code: "(() => {\n  start();\n  stop();\n})();\n" },
    ],
    invalid: [
      {
        name: "over the maximum",
        options: [{ max: 3 }],
        code: "const run = (): number => {\n  const first = 1;\n  const second = 2;\n  return first + second;\n};\n",
        errors: [expectedFinding("tooManyLines", { actual: "5", max: "3" })],
      },
      {
        name: "a method is measured from its key",
        options: [{ max: 3 }],
        code: "const store = {\n  read() {\n    const first = 1;\n    const second = 2;\n    return first + second;\n  },\n};\n",
        errors: [expectedFinding("tooManyLines", { actual: "5", max: "3" })],
      },
    ],
  },
];
