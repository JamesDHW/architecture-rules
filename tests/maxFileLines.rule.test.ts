import { maxFileLinesWarnRule } from "../src/rules/maxFileLines.rule.js";
import { runCustomRule } from "./utils/runCustomRule.js";

runCustomRule(maxFileLinesWarnRule, {
  valid: [
    {
      name: "at the configured maximum",
      options: [{ max: 3 }],
      code: "const a = 1;\nconst b = 2;\nconst c = 3;\n",
    },
    {
      name: "blank lines skipped by default",
      options: [{ max: 3 }],
      code: "const a = 1;\n\nconst b = 2;\n\nconst c = 3;\n",
    },
    {
      name: "comment-only lines skipped by default",
      options: [{ max: 2 }],
      code: "// header\nconst a = 1;\n/* block */\nconst b = 2;\n",
    },
    {
      name: "trailing comment on a code line is still one counted line",
      options: [{ max: 2 }],
      code: "const a = 1; // note\nconst b = 2;\n",
    },
  ],
  invalid: [
    {
      name: "one line over the configured maximum",
      options: [{ max: 2 }],
      code: "const a = 1;\nconst b = 2;\nconst c = 3;\n",
      errors: [{ messageId: "tooManyLines" }],
    },
    {
      name: "blank lines count when skipBlankLines is false",
      options: [{ max: 3, skipBlankLines: false }],
      code: "const a = 1;\n\nconst b = 2;\nconst c = 3;\n",
      errors: [{ messageId: "tooManyLines" }],
    },
    {
      name: "comment-only lines count when skipComments is false",
      options: [{ max: 2, skipComments: false }],
      code: "// header\nconst a = 1;\nconst b = 2;\n",
      errors: [{ messageId: "tooManyLines" }],
    },
  ],
});
