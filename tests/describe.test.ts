import { describe, expect, it } from "vitest";

import { describeArchitecture } from "../src/cli/architectureDescription.js";
import { renderMermaid, renderText } from "../src/cli/renderDescription.js";
import { defineArchitecture } from "../src/config/defineArchitecture.js";
import { layerGraph } from "../src/config/layerGraph.js";

const layered = defineArchitecture({
  projects: { tsconfigs: ["tsconfig.json"] },
  naming: { case: "camelCase" },
  rules: { "max-file-lines": { severity: "warn", reason: "Migrating large files." } },
  layers: {
    entry: { description: "Composition.", files: ["src/main.ts"], dependencies: { internal: ["adapter", "domain"], external: ["zod"] } },
    adapter: {
      description: "External systems.",
      files: ["src/adapters/**"],
      naming: { case: "camelCase", requiredSuffix: ".adapter" },
      dependencies: { internal: ["domain"], external: ["zod", "node:fs"] },
      rules: { "no-raw-exceptions": { severity: "off", reason: "The error adapter lives here." } },
    },
    domain: { description: "Business decisions.", files: ["src/domain/**"], dependencies: { internal: ["domain"] } },
  },
});

const cyclic = defineArchitecture({
  projects: { tsconfigs: ["tsconfig.json"] },
  layers: {
    leaf: { description: "Leaf.", files: ["src/leaf/**"] },
    first: { description: "First.", files: ["src/first/**"], dependencies: { internal: ["second", "leaf"] } },
    second: { description: "Second.", files: ["src/second/**"], dependencies: { internal: ["first"] } },
    dependent: { description: "Depends on the cycle.", files: ["src/dependent/**"], dependencies: { internal: ["first"] } },
  },
});

describe("layer graph", () => {
  it("orders layers after the layers they import", () => {
    expect(layerGraph(layered)).toEqual({ order: ["domain", "adapter", "entry"], cycles: [] });
  });
  it("reports import cycles and places the layers involved last", () => {
    expect(layerGraph(cyclic)).toEqual({ order: ["leaf", "first", "second", "dependent"], cycles: [["first", "second"]] });
  });
});

describe("describe", () => {
  it("summarizes the architecture in decision order", () => {
    const description = describeArchitecture(layered, "architecture.config.ts");
    expect(description.layers.map((layer) => layer.name)).toEqual(["domain", "adapter", "entry"]);
    expect(description.layers.find((layer) => layer.name === "adapter")).toMatchObject({
      naming: { case: "camelCase", requiredSuffix: ".adapter" },
      ruleOverrides: [{ rule: "no-raw-exceptions", severity: "off", reason: "The error adapter lives here." }],
    });
    expect(description.layers.find((layer) => layer.name === "domain")).not.toHaveProperty("naming");
    expect(description.rules.overrides).toEqual([{ rule: "max-file-lines", severity: "warn", reason: "Migrating large files." }]);
  });
  it("indexes each external dependency by the layers that may import it", () => {
    expect(describeArchitecture(layered, "architecture.config.ts").external).toEqual([
      { specifier: "node:fs", layers: ["adapter"] },
      { specifier: "zod", layers: ["adapter", "entry"] },
    ]);
  });
  it("renders text an agent can scan", () => {
    const text = renderText(describeArchitecture(layered, "architecture.config.ts"));
    expect(text).toContain("tsconfig.json (references: follow)");
    expect(text).toContain("internal  domain\n");
    expect(text).toContain("external  zod, node:fs\n");
    expect(text).toContain("external  none\n");
    expect(text).toContain("  zod      adapter, entry\n");
    expect(text).toContain("naming    camelCase, requires .adapter");
    expect(text).toContain("No import cycles between layers.");
    expect(renderText(describeArchitecture(cyclic, "architecture.config.ts"))).toContain("Import cycles: first ↔ second");
  });
  it("renders the layer graph as Mermaid", () => {
    expect(renderMermaid(describeArchitecture(layered, "architecture.config.ts"))).toBe([
      "flowchart TD", "  domain", "  adapter", "  entry", "  adapter --> domain", "  entry --> adapter", "  entry --> domain", "",
    ].join("\n"));
  });
});
