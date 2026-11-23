import { defineRule } from "../core/defineRule.js";
const DESCRIPTION = `
A literal list written with satisfies readonly T[], where T is a union of
literals, must list every member of T. satisfies on its own proves only
that each listed value is a member, so a member added to T later is
silently missing from the list, and code built from it (a schema, a
select's options, a database check constraint) rejects or hides it.

Good: const STATUSES = ["draft", "active", "archived"] as const satisfies readonly Status[];
      const EDITABLE: readonly Status[] = ["draft"];
Bad:  const STATUSES = ["draft", "active"] as const satisfies readonly Status[];

A deliberate subset is declared with a type annotation instead, which says
"some of" rather than "all of". The check uses the compiler's types, so the
union may be declared anywhere.
`.trim();
export const exhaustiveLiteralListsRule = defineRule({
    id: "exhaustive-literal-lists",
    title: "List every member when a literal list satisfies a union",
    description: DESCRIPTION,
    instead: "Add the missing members, or declare a deliberate subset with a type annotation instead of satisfies.",
    enforcement: { type: "program", configuration: "error" },
});
//# sourceMappingURL=exhaustiveLiteralLists.rule.js.map