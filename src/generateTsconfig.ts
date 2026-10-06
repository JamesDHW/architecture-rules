import { writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

import { rules } from "./rules/index.js";

type Tsconfig = { readonly $schema: string; readonly compilerOptions: Readonly<Record<string, unknown>> };

export const buildTsconfig = (): Tsconfig => ({
  $schema: "https://json.schemastore.org/tsconfig",
  compilerOptions: Object.fromEntries(rules.flatMap(({ enforcement }) => {
    return enforcement.type === "typescript" ? Object.entries(enforcement.compilerOptions) : [];
  })),
});

export const writeTsconfig = async (): Promise<void> => {
  const outputUrl = new URL("../tsconfig.base.json", import.meta.url);
  await writeFile(outputUrl, `${JSON.stringify(buildTsconfig(), null, 2)}\n`);
};

const entryPath = process.argv[1];
const isDirectRun = entryPath !== undefined && import.meta.url === pathToFileURL(entryPath).href;

if (isDirectRun) {
  await writeTsconfig();
}
