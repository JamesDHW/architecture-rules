import { realpathSync } from "node:fs";
import { inventory } from "../analysis/inventory.js";
import { withProjects } from "./withProjects.js";
/** Every source file of the programs and the layer it belongs to, plus the files that match no layer or several. */
export const classifyProject = async (rootPath, architecture) => {
    const root = realpathSync(rootPath);
    return withProjects(root, architecture, async (opened) => inventory(root, architecture, opened.sources));
};
//# sourceMappingURL=classifyProject.js.map