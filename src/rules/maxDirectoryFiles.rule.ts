import { defineRule, defineRuleOptions } from "../core/defineRule.js";
import { DIRECTORY_ERROR_OPTIONS, DIRECTORY_GUIDANCE, DIRECTORY_WARN_OPTIONS, type MaxDirectoryFilesOptions } from "./maxDirectoryFiles.constants.js";

export type { MaxDirectoryFilesOptions } from "./maxDirectoryFiles.constants.js";

const DESCRIPTION = `
Warn when one directory holds more than 15 production source files, and
report an error above 30. Group related files into subfolders named after
the concept they share.

Small files are easy to read one at a time, but a flat folder of a hundred
of them hides which belong together: screens next to primitives next to
copy next to API calls. Folders are the cheapest way to show that grouping.

Only production source files of the checked programs count: files in
development layers (tests, scripts, tool configuration), generated files
and declaration files are left out, and files the compiler does not see,
such as stylesheets, never count. The limit uses the layer of the
directory's first file.
`.trim();

const schema = [{
  type: "object",
  properties: { max: { type: "integer", minimum: 1 } },
  additionalProperties: false,
}];


export const maxDirectoryFilesWarnRule = defineRule({
  id: "max-directory-files-warn",
  options: defineRuleOptions<[Partial<MaxDirectoryFilesOptions>?]>(schema),
  title: "Warn when a directory holds more than 15 source files",
  description: DESCRIPTION,
  instead: DIRECTORY_GUIDANCE.instead,
  suppressWhen: DIRECTORY_GUIDANCE.suppressWhen,
  enforcement: { type: "program", configuration: ["warn", DIRECTORY_WARN_OPTIONS] },
});

export const maxDirectoryFilesRule = defineRule({
  id: "max-directory-files",
  options: defineRuleOptions<[Partial<MaxDirectoryFilesOptions>?]>(schema),
  title: "Limit directories to 30 source files",
  description: DESCRIPTION,
  instead: DIRECTORY_GUIDANCE.instead,
  suppressWhen: DIRECTORY_GUIDANCE.suppressWhen,
  enforcement: { type: "program", configuration: ["error", DIRECTORY_ERROR_OPTIONS] },
});
