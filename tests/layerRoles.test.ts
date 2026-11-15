import { describe, expect, it } from "vitest";

import { describeArchitecture } from "../src/cli/architectureDescription.js";
import { renderText } from "../src/cli/renderDescription.js";
import { defineArchitecture, normalizeArchitecture } from "../src/config/defineArchitecture.js";
import { ArchitectureError } from "../src/errors/architectureError.js";

const projects = { tsconfigs: ["tsconfig.json"] };

describe("layer entry and development settings", () => {
  it("normalizes entries and development layers into each layer's policy", () => {
    const architecture = defineArchitecture({
      projects,
      layers: {
        route: { description: "Routes", files: ["src/routes/**"], entry: { reason: "The router loads them.", exports: ["Route"] } },
        api: { description: "API", files: ["src/index.ts"], entry: { reason: "Package entry.", exports: "all" } },
        cli: { description: "CLI", files: ["src/cli/**"], entry: { reason: "bin", files: ["src/cli/main.ts"] } },
        tests: { description: "Tests", files: ["tests/**"], entry: { reason: "The runner loads them." }, development: true },
      },
    });
    expect(architecture.layers.route?.policy).toMatchObject({ entry: { reason: "The router loads them.", exports: ["Route"] }, development: false });
    expect(architecture.layers.api?.policy.entry?.exports).toBe("all");
    expect(architecture.layers.cli?.policy.entry?.files).toEqual(["src/cli/main.ts"]);
    expect(architecture.layers.tests?.policy.development).toBe(true);
    expect(architecture.defaults.development).toBe(false);
  });

  it("requires a reason for an entry and rejects malformed settings", () => {
    const result = normalizeArchitecture({
      projects,
      layers: {
        a: { description: "A", files: ["src/a/**"], entry: { exports: "some" } },
        b: { description: "B", files: ["src/b/**"], entry: { reason: "Loaded.", files: ["/abs/**"], other: 1 } },
        c: { description: "C", files: ["src/c/**"], development: "yes" },
      },
    });
    if (!(result instanceof ArchitectureError)) return expect.unreachable("invalid settings must be rejected");
    expect(result.issues).toEqual(expect.arrayContaining([
      "layers.a.entry.reason must be nonempty text",
      'layers.a.entry.exports must be "all" or a list of export names',
      "Unknown layers.b.entry field: other",
      "layers.b.entry.files: expected a root-relative positive path: /abs/**",
      "layers.c.development must be true or false",
    ]));
  });

  it("shows entries and development layers in describe", () => {
    const architecture = defineArchitecture({
      projects,
      layers: {
        route: { description: "Routes", files: ["src/routes/**"], entry: { reason: "The router loads them.", exports: ["Route"] } },
        tests: { description: "Tests", files: ["tests/**"], development: true },
      },
    });
    const text = renderText(describeArchitecture(architecture, "architecture.config.ts"));
    expect(text).toContain("entry     every file; exports Route: The router loads them.");
    expect(text).toContain("role      development only");
  });

  it("keeps dependency rules project-wide", () => {
    const result = normalizeArchitecture({
      projects,
      layers: { a: { description: "A", files: ["src/**"], rules: { "unused-dependencies": "off", "unused-exports": { severity: "warn", reason: "Migrating." } } } },
    });
    if (!(result instanceof ArchitectureError)) return expect.unreachable("a layer must not set a project-wide rule");
    expect(result.issues).toEqual(["unused-dependencies applies to the whole project; set it in the top-level rules"]);
  });
});
