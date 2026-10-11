import { relative } from "node:path";

import { ArchitectureError } from "../errors/architectureError.js";
import { describeArchitecture, type ArchitectureDescription } from "./architectureDescription.js";
import { configPathFor, loadArchitecture } from "./loadArchitecture.js";
import type { DescribeFormat, RunArgs } from "./parseArgs.js";
import { renderMermaid, renderText } from "./renderDescription.js";

const render = (description: ArchitectureDescription, format: DescribeFormat): string => {
  switch (format) {
    case "text":
      return renderText(description);
    case "json":
      return `${JSON.stringify(description, null, 2)}\n`;
    case "mermaid":
      return renderMermaid(description);
  }
};

/** Prints the architecture from configuration alone; no TypeScript program is opened, so it is fast. */
export const describeCommand = async (args: RunArgs, format: DescribeFormat): Promise<number | ArchitectureError> => {
  const configPath = configPathFor(args);
  const architecture = await loadArchitecture(configPath);
  if (architecture instanceof ArchitectureError) return architecture;
  process.stdout.write(render(describeArchitecture(architecture, relative(process.cwd(), configPath)), format));
  return 0;
};
