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
        name: "handler bound to a row's value",
        code: "const Row = () => <button onClick={model.handleRemoveClick(connection.id)}>Remove</button>;\n",
      },
      {
        name: "handler bound to literals",
        code: 'const Field = () => <input onChange={handleTextChange("describes", 1, true, `x`)} />;\n',
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
        name: "bound handler with an inline arrow argument",
        code: "const Button = () => <button onClick={handleClick(() => save())}>Save</button>;\n",
        errors: [{ messageId: "namedJsxHandler" }],
      },
      {
        name: "bound handler with a computed argument",
        code: "const Button = () => <button onClick={handleClick(id ?? fallback)}>Save</button>;\n",
        errors: [{ messageId: "namedJsxHandler" }],
      },
      {
        name: "bound handler with a call argument",
        code: "const Button = () => <button onClick={handleClick(toId(row))}>Save</button>;\n",
        errors: [{ messageId: "namedJsxHandler" }],
      },
      {
        name: "call on a call result",
        code: "const Button = () => <button onClick={useModel().handleClick(id)}>Save</button>;\n",
        errors: [{ messageId: "namedJsxHandler" }],
      },
      {
        name: "template literal with an expression",
        code: "const Button = () => <button onClick={handleClick(`row-${id}`)}>Save</button>;\n",
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
