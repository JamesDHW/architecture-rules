import { realpathSync } from "node:fs";

import { inventory, type Inventory } from "../analysis/inventory.js";
import type { Architecture } from "../config/types.js";
import type { ArchitectureError } from "../errors/architectureError.js";
import { withProjects } from "./withProjects.js";

/** Every source file of the programs and the layer it belongs to, plus the files that match no layer or several. */
export const classifyProject = async (rootPath: string, architecture: Architecture): Promise<Inventory | ArchitectureError> => {
  const root = realpathSync(rootPath);
  return withProjects(root, architecture, async (opened) => inventory(root, architecture, opened.sources));
};
