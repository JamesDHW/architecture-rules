import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { relativePath } from "../analysis/paths.js";
import { rules } from "../rules/index.js";
const docsDirectory = fileURLToPath(new URL("../../docs/rules/", import.meta.url));
const rulesById = new Map(rules.map((rule) => [rule.id, rule]));
const guidance = (root, ruleId) => {
    const rule = rulesById.get(ruleId);
    if (rule === undefined)
        return [];
    const docs = relativePath(root, join(docsDirectory, `${ruleId}.md`));
    return [{ ruleId, ...(rule.instead === undefined ? {} : { instead: rule.instead }), docs }];
};
/** Guidance for each rule that reported a finding, in first-seen order. */
export const guidanceFor = (root, findings) => {
    return [...new Set(findings.map((finding) => finding.ruleId))].flatMap((ruleId) => guidance(root, ruleId));
};
//# sourceMappingURL=ruleGuidance.js.map