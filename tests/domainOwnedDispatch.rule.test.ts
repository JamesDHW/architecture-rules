import { domainOwnedDispatchRule } from "../src/rules/domainOwnedDispatch.rule.js";
import { runCustomRule } from "./utils/runCustomRule.js";

const reducer = (body: string) => `const reduce = (state, action) => { ${body} };`;
const dispatch = (body: string) => reducer(`switch (action.type) { ${body} }`);
const errors = [{ messageId: "domainRouting", data: { reducer: "reduceAdmin" } }];

runCustomRule(domainOwnedDispatchRule, {
  valid: [
    {
      name: "hierarchical exhaustive routing",
      code: `type Event =
        | { domain: 'admin'; action: { type: 'input' } }
        | { domain: 'create'; action: { type: 'start' } };
        const reduce = (state: unknown, event: Event) => {
          switch (event.domain) {
            case 'admin': return reduceAdmin(state, event.action);
            case 'create': return reduceCreate(state, event.action);
            default: return event satisfies never;
          }
        };`,
    },
    { name: "shared ordinary behavior", code: dispatch(`case 'idle': case 'loading': return showPending(state, action);`) },
    { name: "flat single-domain implementation", code: dispatch(`case 'input': return { ...state, input: action.input }; case 'reset': return initialState;`) },
    { name: "single delegated label", code: dispatch(`case 'admin': return reduceAdmin(state, action);`) },
    { name: "different child reducers", code: dispatch(`case 'admin': return reduceAdmin(state, action); case 'create': return reduceCreate(state, action);`) },
    { name: "default is not a second explicit label", code: dispatch(`case 'admin': default: return reduceAdmin(state, action);`) },
    { name: "trailing labels have no target", code: dispatch(`case 'a': return reduceAdmin(state, action); case 'b':`) },
    { name: "case bodies with effects are outside enforcement", code: dispatch(`case 'a': case 'b': log(action); return reduceAdmin(state, action);`) },
    { name: "transformed state is outside enforcement", code: dispatch(`case 'a': case 'b': return reduceAdmin(state.admin, action);`) },
    { name: "nested domain payload is not unchanged forwarding", code: dispatch(`case 'a': case 'b': return reduceAdmin(state, action.action);`) },
    { name: "unrelated switch subject", code: reducer(`switch (other.type) { case 'a': case 'b': return reduceAdmin(state, action); }`) },
    { name: "non-reducer function", code: `function render(state, action) { switch (action.type) { case 'a': case 'b': return reduceAdmin(state, action); } }` },
    { name: "nested callback is not the reducer", code: reducer(`return items.map(() => { switch (action.type) { case 'a': case 'b': return reduceAdmin(state, action); } });`) },
    { name: "intervening body consumes pending labels", code: dispatch(`case 'a': return state; case 'b': return reduceAdmin(state, action);`) },
  ],
  invalid: [
    { name: "grouped child action labels", code: dispatch(`case 'adminPanel': case 'adminForm': return reduceAdmin(state, action);`), errors },
    { name: "separate child action returns", code: dispatch(`case 'a': return reduceAdmin(state, action); case 'other': return state; case 'b': return reduceAdmin(state, action);`), errors },
    { name: "braced body", code: dispatch(`case 'a': case 'b': { { return reduceAdmin(state, action); } }`), errors },
    { name: "named reducer declaration with different parameter names", code: `function reduceApp(previous, event) { switch (event.type) { case 'a': case 'b': return reduceAdmin(previous, event); } }`, errors },
    { name: "function expression reducer", code: `const reduceApp = function(previous, event) { switch (event.type) { case 'a': case 'b': return reduceAdmin(previous, event); } };`, errors },
    { name: "one diagnostic per child", code: dispatch(`case 'a': case 'b': return reduceAdmin(state, action); case 'c': case 'd': return reduceCreate(state, action);`), errors: [...errors, { messageId: "domainRouting", data: { reducer: "reduceCreate" } }] },
  ],
});
