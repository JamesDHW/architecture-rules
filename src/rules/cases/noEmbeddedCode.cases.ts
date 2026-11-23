import { expectedFinding, type RuleCases } from "../../core/ruleCases.js";

export const noEmbeddedCodeCases: readonly RuleCases[] = [
  {
    valid: [
      { name: "prose", code: 'const title = "Close the window to finish.";\n' },
      { name: "a tagged template names its language", code: "const body = html`<p class=\"lead\">${greeting}</p>`;\n" },
      { name: "a module specifier", code: 'import { renderPage } from "./renderPage.js";\nexport const page = renderPage;\n' },
      { name: "a comparison in text", code: 'const hint = "Use a < b and b > c.";\n' },
      { name: "a stream's write is not document.write", code: 'process.stdout.write("done\\n");\n' },
    ],
    invalid: [
      {
        name: "a script in a template literal",
        code: "export const THEME_SCRIPT = `(function () { var key = \"theme\"; })();`;\n",
        errors: [expectedFinding("text", { language: "JavaScript" })],
      },
      {
        name: "markup with attributes in a template literal",
        code: "const paragraph = (text: string): string => `<p style=\"color:#123\">${text}</p>`;\n",
        errors: [expectedFinding("text", { language: "HTML" })],
      },
      {
        name: "an element opened and closed in a string",
        code: 'const banner = "<strong>Saved</strong>";\n',
        errors: [expectedFinding("text", { language: "HTML" })],
      },
      { name: "eval", code: "eval(source);\n", errors: [expectedFinding("sink", { name: "eval" })] },
      { name: "new Function", code: 'const add = new Function("a", "b", "return a + b");\n', errors: [expectedFinding("sink", { name: "new Function" })] },
      { name: "innerHTML assignment", code: "element.innerHTML = markup;\n", errors: [expectedFinding("sink", { name: "innerHTML" })] },
      { name: "document.write", code: "document.write(markup);\n", errors: [expectedFinding("sink", { name: "document.write" })] },
      { name: "__html outside JSX", code: "const props = { __html: markup };\n", errors: [expectedFinding("sink", { name: "__html" })] },
    ],
  },
  {
    lang: "tsx",
    valid: [
      { name: "ordinary props", code: "const Note = () => <p className=\"note\">Saved</p>;\n" },
    ],
    invalid: [
      {
        name: "dangerouslySetInnerHTML",
        code: "const Theme = () => <script dangerouslySetInnerHTML={{ __html: themeScript }} />;\n",
        errors: [expectedFinding("sink", { name: "dangerouslySetInnerHTML" })],
      },
    ],
  },
];
