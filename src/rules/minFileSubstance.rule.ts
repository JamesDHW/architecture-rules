import { defineRule, defineRuleOptions } from "../core/defineRule.js";
import { FILE_SUBSTANCE_OPTIONS, type MinFileSubstanceOptions } from "./minFileSubstance.constants.js";

export type { MinFileSubstanceOptions } from "./minFileSubstance.constants.js";

const DESCRIPTION = `
Warn about a production file so small that it is only a detour: at most 3
top-level statements and 10 lines of code besides its imports, imported by
exactly one file, in the same folder. Move its contents into that file.

File-size limits push code into more files, and nothing pushes back. Every
extra file is another name to learn and another hop when reading. A
constant, type or helper with one nearby user usually reads best inside
that user.

Entry files, generated files, declaration files and development layers are
not checked. Files matching ignore are skipped: by default *.constants.ts
and *.state.ts, because constants-module and no-captured-mutation ask for
those files even when one file uses them.
`.trim();

const schema = [{
  type: "object",
  properties: {
    maxStatements: { type: "integer", minimum: 0 },
    maxLines: { type: "integer", minimum: 0 },
    ignore: { type: "array", items: { type: "string" } },
  },
  additionalProperties: false,
}];

export const minFileSubstanceRule = defineRule({
  id: "min-file-substance",
  options: defineRuleOptions<[Partial<MinFileSubstanceOptions>?]>(schema),
  title: "Merge tiny files into their only importer",
  description: DESCRIPTION,
  instead: "Move the file's contents into the one file that imports it, and delete the file.",
  suppressWhen: "The file is a deliberate seam, such as a port type another package will implement.",
  enforcement: { type: "program", configuration: ["warn", FILE_SUBSTANCE_OPTIONS] },
});
