import { destructuredPropsRule } from "../src/rules/destructuredProps.rule.js";
import { runCustomRule } from "./utils/runCustomRule.js";

runCustomRule(
  destructuredPropsRule,
  {
    valid: [
      { name: "destructured FC", code: "const RunList: FC<RunListProps> = ({ runs }) => <ul>{runs}</ul>;\n" },
      { name: "rest props", code: "const Button: FC<ButtonProps> = ({ tone, ...buttonProps }) => <button {...buttonProps} />;\n" },
      { name: "no props", code: "const Home = () => <main />;\n" },
      { name: "hook taking an object", code: "const useRunList = (props: RunListProps) => props.runs;\n" },
      { name: "camelCase function returning JSX", code: "const renderRow = (row: Row) => <li>{row.name}</li>;\n" },
      { name: "PascalCase non-component", code: "const Parser = (text: string) => text.trim();\n" },
    ],
    invalid: [
      { name: "props parameter on an FC", code: "const RunList: FC<RunListProps> = (props) => <ul>{props.runs}</ul>;\n", errors: [{ messageId: "destructuredProps" }] },
      { name: "untyped component returning JSX", code: "const RunList = (props: RunListProps) => {\n  return <ul>{props.runs}</ul>;\n};\n", errors: [{ messageId: "destructuredProps" }] },
      { name: "memo-wrapped component", code: "const RunList = memo((props: RunListProps) => <ul>{props.runs}</ul>);\n", errors: [{ messageId: "destructuredProps" }] },
      { name: "function declaration", code: "function RunList(props: RunListProps) { return <ul>{props.runs}</ul>; }\n", errors: [{ messageId: "destructuredProps" }] },
    ],
  },
  "tsx",
);
