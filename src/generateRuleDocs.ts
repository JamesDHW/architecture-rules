import { mkdir, rm, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

import { renderRuleDoc } from "./cli/ruleDocs/renderRuleDoc.js";
import { renderRuleIndex } from "./cli/ruleDocs/renderRuleIndex.js";
import { ruleCases } from "./rules/cases/ruleCases.js";
import { rules } from "./rules/index.js";

/** Rewrites docs/rules from the rule definitions and test cases, removing pages of rules that no longer exist. */
export const writeRuleDocs = async (): Promise<void> => {
  const directory = new URL("../docs/rules/", import.meta.url);
  await rm(directory, { recursive: true, force: true });
  await mkdir(directory, { recursive: true });
  const pages = rules.map(async (rule) => writeFile(new URL(`${rule.id}.md`, directory), renderRuleDoc(rule, ruleCases[rule.id] ?? [])));
  await Promise.all([...pages, writeFile(new URL("README.md", directory), renderRuleIndex(rules))]);
};

const entryPath = process.argv[1];
const isDirectRun = entryPath !== undefined && import.meta.url === pathToFileURL(entryPath).href;

if (isDirectRun) {
  await writeRuleDocs();
}
