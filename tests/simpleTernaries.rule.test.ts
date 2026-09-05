import { simpleTernariesRule } from "../src/rules/simpleTernaries.rule.js";
import { runCustomRule } from "./runCustomRule.js";

runCustomRule(simpleTernariesRule, {
  valid: [
    'const label = isSaving ? "Saving" : "Save";',
    'const price = isMember ? calculateMemberPrice(order) : calculateStandardPrice(order);',
    'const amount = isMember ? order.price * discount : order.price;',
    'const handleSave = isLocal ? () => { saveCount++; } : saveRemote;',
    'const result = checkReady() ? getProject() : undefined;',
  ],
  invalid: [
    { code: 'const result = isReady ? (isMember ? member : guest) : unknown;', errors: [{ messageId: "nested" }] },
    { code: 'const result = (isReady ? isMember : isGuest) ? member : guest;', errors: [{ messageId: "nested" }] },
    { code: 'const result = isReady ? (count = 1) : 0;', errors: [{ messageId: "effect" }] },
    { code: 'const result = isReady ? count++ : 0;', errors: [{ messageId: "effect" }] },
    { code: 'const result = isReady ? remove(delete project.name) : false;', errors: [{ messageId: "effect" }] },
    { code: 'const result = isReady ? new Project() : undefined;', errors: [{ messageId: "effect" }] },
    { code: 'const result = isReady ? (save(), project) : undefined;', errors: [{ messageId: "effect" }] },
    { code: 'const load = async () => isReady ? await fetchProject() : undefined;', errors: [{ messageId: "effect" }] },
    { code: 'function* load() { return isReady ? yield project : undefined; }', errors: [{ messageId: "effect" }] },
    { code: 'const result = isReady ? (() => { count++; return count; })() : 0;', errors: [{ messageId: "effect" }] },
  ],
});
