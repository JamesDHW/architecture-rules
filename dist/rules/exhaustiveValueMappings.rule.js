import { defineRule } from "../core/defineRule.js";
export const exhaustiveValueMappingsRule = defineRule({
    id: "exhaustive-value-mappings",
    title: "Use records for values and switches for behavior",
    description: `
Map a closed union directly to values with a readonly exhaustive record. Use
an exhaustive switch when variants need different behavior or variant-specific
fields. Do not hide behavior functions in a lookup table. This takes precedence
over prefer-switch for pure value mappings; polymorphic application classes
are not the default replacement for either form.

Good, in the owning constants module:
  const PROJECT_STATUS_LABELS = {
    draft: "Draft", active: "Active", archived: "Archived",
  } as const satisfies Readonly<Record<ProjectStatus, string>>;
  const label = PROJECT_STATUS_LABELS[project.status];

Bad: a switch with one literal label return per status.
Bad: a record of callbacks that hides behavior dispatch behind indexed calls.

An exhaustive record exposes a data mapping without executable branches.
Closed-domain typing prevents missing keys; do not use a broad string record
or an unchecked assertion to silence missing cases. This semantic distinction
is an agent/review obligation, not a claim that a custom AST rule proves purity
or the complete set of union members.
`.trim(),
    enforcement: { type: "advisory" },
});
//# sourceMappingURL=exhaustiveValueMappings.rule.js.map