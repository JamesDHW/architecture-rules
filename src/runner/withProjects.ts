import { openProjects, type Projects } from "../analysis/projects.js";
import type { Architecture } from "../config/types.js";
import { ArchitectureError } from "../errors/architectureError.js";
import { afterCleanup } from "../errors/results.js";
import { tryCatch, tryCatchAsync } from "../errors/tryCatch.js";

/** Opens the TypeScript projects, runs use, and always closes them again, keeping both failures if both fail. */
export const withProjects = async <Result>(
  root: string, architecture: Architecture, use: (opened: Projects) => Promise<Result | ArchitectureError>,
): Promise<Result | ArchitectureError> => {
  const opened = openProjects(root, architecture);
  if (opened instanceof ArchitectureError) return opened;
  const outcome = await tryCatchAsync(async () => use(opened));
  const closed = tryCatch(opened.close);
  return afterCleanup(outcome, closed);
};

