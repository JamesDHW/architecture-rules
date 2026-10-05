import { noCapturedMutationRule } from "../src/rules/noCapturedMutation.rule.js";
import { runCustomRule } from "./utils/runCustomRule.js";

runCustomRule(noCapturedMutationRule, {
  valid: [
    {
      name: "building a value inside one call",
      code: "const collect = (checks: readonly number[]) => {\n  const failures: number[] = [];\n  for (const check of checks) { failures.push(check); }\n  return failures;\n};\n",
    },
    {
      name: "module setup at the top level",
      code: "const routes: string[] = [];\nroutes.push('home');\n",
    },
    {
      name: "mutation through a parameter is out of scope",
      code: "const add = (list: number[]) => { list.push(1); };\n",
    },
    {
      name: "a call result is not a tracked container",
      code: "const create = (database: Db) => async () => database.update(runs).set({ status: 'done' });\n",
    },
    {
      name: "method named add on a dependency",
      code: "const create = (dependencies: Deps) => (id: string) => { dependencies.pendingRequests.add(id); };\n",
    },
    {
      name: "state module",
      filename: "pendingRequests.state.ts",
      code: "export const createPendingRequests = () => {\n  const pending = new Map<string, number>();\n  return { add: (id: string) => { pending.set(id, 1); } };\n};\n",
    },
  ],
  invalid: [
    {
      name: "array cell changed by a closure",
      code: "const link = () => {\n  const sockets: WebSocket[] = [];\n  return (socket: WebSocket) => { sockets.splice(0, sockets.length, socket); };\n};\n",
      errors: [{ messageId: "capturedMutation" }],
    },
    {
      name: "map registry outside a state module",
      code: "const hub = () => {\n  const pending = new Map<string, number>();\n  return { add: (id: string) => { pending.set(id, 1); } };\n};\n",
      errors: [{ messageId: "capturedMutation" }],
    },
    {
      name: "module-level cache changed inside a function",
      code: "const cache = new Map<string, number>();\nexport const remember = (key: string) => { cache.set(key, 1); };\n",
      errors: [{ messageId: "capturedMutation" }],
    },
    {
      name: "object box assigned from a closure",
      code: "const make = () => {\n  const box = { current: 0 };\n  return () => { box.current = 1; };\n};\n",
      errors: [{ messageId: "capturedMutation" }],
    },
    {
      name: "counter incremented from a closure",
      code: "const make = () => {\n  const state = { count: 0 };\n  return () => { state.count++; };\n};\n",
      errors: [{ messageId: "capturedMutation" }],
    },
    {
      name: "typed and asserted container",
      code: "const make = () => {\n  const seen = new Set<string>() as Set<string>;\n  return (id: string) => { seen.add(id); };\n};\n",
      errors: [{ messageId: "capturedMutation" }],
    },
  ],
});
