import { describe, expect, it } from "vitest";

import { defineArchitecture, normalizeArchitecture } from "../src/config/defineArchitecture.js";
import { ArchitectureError } from "../src/errors/architectureError.js";

const projects = { tsconfigs: ["tsconfig.json"] };

const issuesOf = (config: unknown): readonly string[] => {
  const result = normalizeArchitecture(config);
  return result instanceof ArchitectureError ? result.issues : [];
};

const withGlossaries = (glossaries: unknown, glossary: unknown = "sales") => ({
  projects, glossaries,
  layers: { domain: { description: "Domain", files: ["src/**"], glossary } },
});

describe("glossary configuration", () => {
  it("normalizes terms into words, and records the glossaries each layer follows", () => {
    const result = defineArchitecture({
      projects,
      glossaries: { sales: { terms: { LineItem: { definition: "One product on an order.", avoid: ["order line", "entryRow"], type: "LineItem" } } } },
      layers: { domain: { description: "Domain", files: ["src/**"], glossary: "sales" } },
    });
    expect(result.glossaries.sales?.terms).toEqual([{
      name: "LineItem", words: ["line", "item"], definition: "One product on an order.", type: "LineItem",
      avoid: [{ text: "order line", words: ["order", "line"] }, { text: "entryRow", words: ["entry", "row"] }],
    }]);
    expect(result.layers.domain?.policy.glossaries).toEqual(["sales"]);
    expect(result.defaults.glossaries).toEqual([]);
  });

  it("rejects a phrase with two meanings in one glossary", () => {
    expect(issuesOf(withGlossaries({
      sales: { terms: {
        Customer: { definition: "Buys things.", avoid: ["client"] },
        Client: { definition: "An HTTP client." },
        Buyer: { definition: "Someone who buys.", avoid: ["client"] },
      } },
    }))).toEqual([
      'glossaries.sales: "client" is an avoided alias of Customer and the term Client and an avoided alias of Buyer; give each meaning one word',
    ]);
  });

  it("rejects malformed terms", () => {
    expect(issuesOf(withGlossaries({
      sales: { terms: {
        "line item": { definition: "" },
        Customer: { definition: "Buys.", avoid: ["customers", "client", "client"], type: "not a type", extra: true },
      } },
    }))).toEqual([
      "glossaries.sales.terms.line item: a term is written as a type name would be, such as Customer or LineItem",
      "glossaries.sales.terms.line item.definition must be nonempty text",
      "Unknown glossaries.sales.terms.Customer field: extra",
      "glossaries.sales.terms.Customer.avoid must not include the term itself",
      'glossaries.sales.terms.Customer.avoid lists "client" twice',
      "glossaries.sales.terms.Customer.type must be a type name, such as Customer",
    ]);
  });

  it("rejects unknown glossaries, empty glossaries and generated layers with a glossary", () => {
    expect(issuesOf({
      projects,
      glossaries: { sales: { terms: {} } },
      layers: {
        domain: { description: "Domain", files: ["src/**"], glossary: ["sales", "ops"] },
        generated: { description: "Generated", files: ["gen/**"], glossary: "sales", generated: { reason: "Codegen." } },
      },
    })).toEqual([
      "glossaries.sales.terms must define at least one term",
      "layers.domain.glossary: unknown glossary 'ops'",
      "layers.generated: a generated layer's names come from its generator, so it takes no glossary",
    ]);
  });

  it("rejects a layer that follows two glossaries giving one phrase two meanings", () => {
    expect(issuesOf(withGlossaries({
      sales: { terms: { Customer: { definition: "Buys.", avoid: ["account"] } } },
      billing: { terms: { Account: { definition: "A ledger." } } },
    }, ["sales", "billing"]))).toEqual([
      'layers.domain.glossary: "account" is an avoided alias of Customer in sales and the term Account in billing; give each meaning one word',
    ]);
  });
});
