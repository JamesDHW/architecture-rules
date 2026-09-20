import { Linter } from "eslint";
import { describe, expect, it } from "vitest";

import { defineArchitecture } from "../src/core/defineArchitecture.js";
import { domainOwnedDispatchRule } from "../src/rules/domainOwnedDispatch.rule.js";
import { preferSwitchRule } from "../src/rules/preferSwitch.rule.js";
import { terminalSwitchCasesRule } from "../src/rules/terminalSwitchCases.rule.js";

const lint = (code: string) => new Linter().verify(code, {
  languageOptions: { ecmaVersion: "latest", sourceType: "module" },
  plugins: {
    architecture: {
      rules: Object.fromEntries(
        [domainOwnedDispatchRule, preferSwitchRule, terminalSwitchCasesRule].map(
          (rule) => [rule.id, rule.enforcement.implementation],
        ),
      ),
    },
  },
  rules: {
    "architecture/domain-owned-dispatch": "error",
    "architecture/prefer-switch": "error",
    "architecture/terminal-switch-cases": "error",
  },
});

describe("domain-owned-dispatch compatibility", () => {
  it("is enabled by default", () => {
    const architecture = defineArchitecture({ projects: { tsconfigs: ["tsconfig.json"] }, fileTypes: { app: { description: "Application", files: ["src/**"] } } });
    expect(architecture.defaults.rules["domain-owned-dispatch"]?.severity).toBe("error");
  });

  it.each([
    `case 'a': case 'b': return reduceAdmin(state, action);`,
    `case 'a': return reduceAdmin(state, action); case 'b': return reduceAdmin(state, action);`,
    `case 'a': case 'b': { return reduceAdmin(state, action); }`,
  ])("rejects child action routing: %s", (cases) => {
    const messages = lint(`const reduce = (state, action) => { switch (action.type) { ${cases} } };`);
    expect(messages.map((message) => [message.ruleId, message.messageId])).toEqual([
      ["architecture/domain-owned-dispatch", "domainRouting"],
    ]);
  });

  it.each([
    `const reduce = (state, event) => { switch (event.domain) {
      case 'admin': return reduceAdmin(state, event.action);
      case 'create': return reduceCreate(state, event.action);
    } };`,
    `function reduceAdmin(state, action) { switch (action.type) {
      case 'input': return { ...state, input: action.input };
      case 'reset': return initialState;
    } }`,
    `const render = (state, action) => { switch (action.type) {
      case 'a': case 'b': return reduceAdmin(state, action);
    } };`,
    `const reduce = (state, action) => { switch (action.type) {
      case 'a': case 'b': return showPending(state, action);
    } };`,
    `const reduce = (state, action) => { return items.map(() => {
      switch (action.type) { case 'a': case 'b': return reduceAdmin(state, action); }
    }); };`,
  ])("allows compatible dispatch: %s", (code) => {
    expect(lint(code)).toEqual([]);
  });
});
