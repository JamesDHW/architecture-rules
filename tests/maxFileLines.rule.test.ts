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
    {
      name: "inner and closing lines of a block comment are skipped",
      options: [{ max: 2 }],
      code: "const a = 1; /* opens after code\n   continues\n*/\nconst b = 2;\n",
    },
    {
      name: "a block comment line shared with code still counts",
      options: [{ max: 1 }],
      code: "/* opens alone\n*/ const a = 1;\n",
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
    {
      name: "the message reports the counted lines and the maximum",
      options: [{ max: 1 }],
      code: "/*\n * header\n */\nconst a = 1;\nconst b = 2;\n",
      errors: [{ message: "File has 2 lines; warning starts at 1. Split by cohesive responsibility. See rule max-file-lines-warn." }],
    },
  ],
});
