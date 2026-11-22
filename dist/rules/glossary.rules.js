import { defineRule, defineRuleOptions } from "../core/defineRule.js";
const aliasOptions = defineRuleOptions([
    { type: "object", properties: { match: { enum: ["head", "any"] } }, additionalProperties: false },
]);
export const glossaryAliasesRule = defineRule({
    id: "glossary-aliases",
    title: "Name things with the glossary's words",
    description: `
In a layer that follows a glossary, a name must not use a word the glossary
avoids for one of its terms: with Customer avoiding "client", \`client\`,
\`clients\` and \`getClient\` are findings, and the message gives the term and its
definition. Two words for one thing make readers, and agents, wonder whether
they are two things.

Only names the layer declares are read: variables, parameters, functions,
classes, interfaces, types, properties, methods and file names. Imported names,
object-literal keys and \`override\` methods are someone else's choice. Only the
head noun counts by default, the last word of a compound up to a trailing "by"
clause, so \`clientOrders\` is about orders and is not a finding; set the option
\`match: "any"\` to read every word. Longer terms win, so with a term ApiClient,
\`apiClient\` is that term, not the avoided "client".

When the term has a \`type\`, a value whose type is some other object type is a
different thing that happens to share the word: \`client: HttpClient\` is not a
finding.
  `.trim(),
    instead: "Rename to the glossary's term: client becomes customer.",
    suppressWhen: "The name is fixed by something outside the layer, such as a wire format, and cannot be renamed.",
    options: aliasOptions,
    enforcement: { type: "glossary", configuration: "error" },
});
export const glossaryTypesRule = defineRule({
    id: "glossary-types",
    title: "Give each glossary term one type",
    description: `
When a glossary term has a \`type\`, the name and the type must agree. A
variable, parameter or property named after the term (\`customer\`,
\`customers\`) must have that type, an array, set, map, promise or union of it, or
a subtype or intersection; a value of that type must not be named after a
different term. Names that ask or relate rather than name, such as
\`isCustomer\` and \`forCustomer\`, are not judged. And the type itself must be
declared exactly once, at the top level of a file in the layers that follow
the glossary.

This is how the glossary checks meaning rather than spelling: \`customer:
string\` is a customer id or name pretending to be a Customer. Values whose
type cannot be determined, such as \`any\` or an unresolved import, are skipped.
  `.trim(),
    instead: "Give the value the term's type, or rename it to say what it is: customerId, customerName.",
    suppressWhen: "The value really is the concept but has to be typed loosely, such as raw input before it is parsed.",
    enforcement: { type: "glossary", configuration: "error" },
});
export const unusedTermsRule = defineRule({
    id: "unused-terms",
    title: "Define only the terms the code uses",
    description: `
Every glossary must be followed by at least one layer, and every term must
appear in at least one name declared in those layers. A term nothing uses is
dead vocabulary: it reads as part of the domain while the code says otherwise,
and it blocks its avoided words for no benefit.
  `.trim(),
    instead: "Remove the term, or the glossary, from architecture.config.ts; or name the code after it.",
    enforcement: { type: "configuration", configuration: "error" },
});
//# sourceMappingURL=glossary.rules.js.map