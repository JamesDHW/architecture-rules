import { describe, expect, it } from "vitest";

import { checkGlossaries } from "../src/analysis/glossary/check.js";
import { inventory } from "../src/analysis/inventory.js";
import { defineArchitecture } from "../src/config/defineArchitecture.js";
import type { ProjectRules } from "../src/config/types.js";
import { openFixtureProjects } from "./utils/fixtures.js";
import { projectFixture } from "./utils/projectFixture.js";

const configText = `export default defineArchitecture({
  glossaries: {
    sales: {
      terms: {
        Customer: { definition: "A person or organisation that has placed at least one order.", avoid: ["client", "buyer"], type: "Customer" },
        ApiClient: { definition: "Our HTTP client for the payments API." },
        Order: { definition: "A confirmed purchase", type: "Order" },
        Invoice: { definition: "A bill for an order." },
      },
    },
    archive: { terms: { Ledger: { definition: "Closed books." } } },
  },
});`;

const config = { file: "architecture.config.ts", text: configText };

const files: Readonly<Record<string, string>> = {
  "src/domain/model.ts": [
    "export type Customer = { readonly id: string };",
    "export type Order = { readonly customer: Customer };",
  ].join("\n"),
  "src/domain/orders.ts": [
    "import type { Customer, Order } from './model.js';",
    "import { HttpClient } from '../infra/http.js';",
    "export const findClient = (clients: readonly Customer[]): Customer | undefined => clients.at(0);",
    "export const client: HttpClient = new HttpClient();",
    "export const customer = 'anonymous';",
    "export const order: Customer = { id: '1' };",
    "export const apiClient = new HttpClient();",
    "export const clientOrders: readonly Order[] = [];",
    "export const buyer: unknown = undefined;",
    "export const customers: ReadonlyMap<string, Customer> = new Map();",
  ].join("\n"),
  "src/domain/buyers.ts": "export const total = 1;",
  "src/infra/http.ts": "export class HttpClient {}\nexport const client = new HttpClient();",
};

const setup = (rules: ProjectRules = {}, sources: Readonly<Record<string, string>> = files) => {
  const root = projectFixture(sources);
  const architecture = defineArchitecture({
    projects: { tsconfigs: ["tsconfig.json"] },
    rules,
    glossaries: {
      sales: {
        terms: {
          Customer: { definition: "A person or organisation that has placed at least one order.", avoid: ["client", "buyer"], type: "Customer" },
          ApiClient: { definition: "Our HTTP client for the payments API." },
          Order: { definition: "A confirmed purchase", type: "Order" },
          Invoice: { definition: "A bill for an order." },
        },
      },
      archive: { terms: { Ledger: { definition: "Closed books." } } },
    },
    layers: {
      domain: { description: "Domain", files: ["src/domain/**"], glossary: "sales", dependencies: { internal: ["domain", "infra"] } },
      infra: { description: "Infrastructure", files: ["src/infra/**"] },
    },
  });
  const opened = openFixtureProjects(root, architecture);
  const { files: classified } = inventory(root, architecture, opened.sources);
  const result = checkGlossaries({ architecture, files: classified, projects: opened.projects, config, checked: new Set(classified.map((file) => file.relative)) });
  return result;
};

const summary = (issues: readonly { readonly ruleId: string; readonly file: string; readonly line?: number; readonly message: string }[]) => {
  return issues.map(({ ruleId, file, line, message }) => `${ruleId} ${file}:${line ?? "-"} ${message}`);
};

const definition = "A person or organisation that has placed at least one order.";

describe("checkGlossaries", () => {
  it("reports avoided words and names whose type disagrees with their term", () => {
    expect(summary(setup().names)).toEqual([
      `glossary-aliases src/domain/buyers.ts:- buyers says "buyer", a word the glossary avoids for Customer: ${definition} Rename it to customers.`,
      `glossary-aliases src/domain/orders.ts:3 findClient says "client", a word the glossary avoids for Customer: ${definition} Rename it to findCustomer.`,
      `glossary-aliases src/domain/orders.ts:3 clients says "client", a word the glossary avoids for Customer: ${definition} Rename it to customers.`,
      `glossary-types src/domain/orders.ts:5 customer is named after Customer but has type "anonymous". Customer: ${definition} Give it type Customer, or rename it to say what it is.`,
      "glossary-types src/domain/orders.ts:6 order has type Customer, but Order means: A confirmed purchase. Name it after Customer.",
      `glossary-aliases src/domain/orders.ts:9 buyer says "buyer", a word the glossary avoids for Customer: ${definition} Rename it to customer.`,
    ]);
  });

  it("reports unused terms and glossaries no layer follows, at their line in the configuration", () => {
    expect(summary(setup().configuration)).toEqual([
      "unused-terms architecture.config.ts:8 Glossary sales defines Invoice, but no name in the layers that follow it uses it.",
      "unused-terms architecture.config.ts:11 Glossary archive is followed by no layer, so nothing checks it. Add it to a layer's glossary, or remove it.",
    ]);
  });

  it("reads every word of a name when the rule is set to match any word", () => {
    const names = summary(setup({ "glossary-aliases": ["error", { match: "any" }] }).names);
    expect(names).toContain(`glossary-aliases src/domain/orders.ts:8 clientOrders says "client", a word the glossary avoids for Customer: ${definition} Rename it to customerOrders.`);
  });

  it("checks nothing for a rule that is off", () => {
    const names = setup({ "glossary-aliases": "off", "glossary-types": "off" }).names;
    expect(names).toEqual([]);
  });

  it("accepts subtypes and skips types it cannot determine", () => {
    const names = setup({}, {
      "src/domain/model.ts": "export interface Customer { readonly id: string }\nexport interface VipCustomer extends Customer { readonly tier: number }\nexport type Order = { readonly customer: Customer };",
      "src/domain/vip.ts": [
        "import type { VipCustomer } from './model.js';",
        "import type { Missing } from './missing.js';",
        "export const customer = (vip: VipCustomer): VipCustomer => vip;",
        "export const first: { readonly customer: VipCustomer } | undefined = undefined;",
        "export const lost: { readonly customer: Missing } | undefined = undefined;",
        "export const invoice = 1;",
        "export const order = 1 as unknown as import('./model.js').Order;",
      ].join("\n"),
    }).names;
    expect(summary(names)).toEqual([]);
  });

  it("accepts intersections with the term's type, and names that are about a term rather than one", () => {
    const names = setup({}, {
      "src/domain/model.ts": "export type Customer = { readonly id: string };\nexport type Order = { readonly id: string };\nexport const invoice = 1;",
      "src/domain/kinds.ts": [
        "import type { Customer } from './model.js';",
        "export type LoadedCustomer = Customer & { readonly loadedAt: number };",
        "export const customer: LoadedCustomer = { id: '1', loadedAt: 0 };",
        "export const isCustomer = (value: unknown): boolean => value !== undefined;",
        "export const forCustomer: readonly string[] = [];",
        "export const isClient = true;",
        "export const apiClient: { readonly id: string } = { id: '2' };",
      ].join("\n"),
    }).names;
    expect(summary(names)).toEqual([
      `glossary-aliases src/domain/kinds.ts:6 isClient says "client", a word the glossary avoids for Customer: ${definition} Rename it to isCustomer.`,
    ]);
  });

  it("reports a term's type that no layer declares, or that two files declare", () => {
    const missing = setup({}, { "src/domain/model.ts": "export type Order = { readonly id: string };\nexport const customer = 1;\nexport const invoice = 1;" });
    expect(summary(missing.configuration)).toContain(
      "glossary-types architecture.config.ts:5 Glossary sales gives Customer the type Customer, but no layer that follows sales declares it at the top level of a file.",
    );
    const twice = setup({}, {
      "src/domain/model.ts": "export type Customer = { readonly id: string };\nexport type Order = { readonly id: string };\nexport const invoice = 1;",
      "src/domain/other.ts": "export type Customer = { readonly name: string };",
    });
    expect(summary(twice.configuration)).toContain(
      "glossary-types architecture.config.ts:5 Glossary sales gives Customer the type Customer, which is declared in src/domain/model.ts, src/domain/other.ts. Declare it once.",
    );
  });
});
