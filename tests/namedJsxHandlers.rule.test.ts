import { namedJsxHandlersRule } from "../src/rules/namedJsxHandlers.rule.js";
import { runCustomRule } from "./utils/runCustomRule.js";

runCustomRule(
  namedJsxHandlersRule,
  {
    valid: [
      {
        name: "named handler",
        code: "const Button = () => <button onClick={handleSave}>Save</button>;\n",
      },
      {
        name: "pass-through member handler",
        code: "const Button = () => <button onClick={projectEditor.handleSave}>Save</button>;\n",
      },
      {
        name: "non-handler prop may be inline",
        code: "const View = () => <Text value={() => 1} />;\n",
      },
    ],
    invalid: [
      {
        name: "inline arrow handler",
        code: "const Button = () => <button onClick={() => save()}>Save</button>;\n",
        errors: [{ messageId: "namedJsxHandler" }],
      },
      {
        name: "inline function handler",
        code: "const Button = () => <button onClick={function () { save(); }}>Save</button>;\n",
        errors: [{ messageId: "namedJsxHandler" }],
      },
    ],
  },
  "tsx",
);
