import { posix } from "../analysis/paths.js";
import { isEntryFile } from "../analysis/publicExports.js";
import { rootWorkspace, workspaceOf } from "../analysis/workspaces.js";
import { exactSelector } from "./compileOxlintConfig.js";
/** The engine's production marker: a trailing ! keeps a pattern in production-only runs. Development layers never ship. */
const withMode = (file, selector) => (file.policy.development ? selector : `${selector}!`);
/** A file's exact selector, relative to its workspace directory, as each workspace's patterns are. */
const selectorIn = (workspace, file) => {
    const relative = workspace === rootWorkspace ? file.relative : posix(file.relative).slice(workspace.length + 1);
    return withMode(file, exactSelector(relative));
};
/**
 * The dead-code engine's configuration, compiled from the inventory: TypeScript decides which files exist, layer
 * entries (and architecture.config.ts, which the checker loads) decide where reachability starts, and each file is
 * configured in its own workspace package. Entry exports count as unused unless the layer names them public.
 */
export const compileDeadCodeConfig = (files, workspaces, configFile) => {
    const byWorkspace = Map.groupBy(files, (file) => workspaceOf(workspaces, file.relative));
    const isEntry = (file) => isEntryFile(file) || file.relative === configFile;
    return {
        workspaces: Object.fromEntries([...byWorkspace].map(([workspace, members]) => [workspace, {
                entry: members.filter(isEntry).map((file) => selectorIn(workspace, file)),
                project: members.map((file) => selectorIn(workspace, file)),
            }])),
        includeEntryExports: true,
    };
};
//# sourceMappingURL=compileDeadCodeConfig.js.map