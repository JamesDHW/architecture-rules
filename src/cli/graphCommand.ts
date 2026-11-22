import { ArchitectureError } from "../errors/architectureError.js";
import { architectureGraph } from "./architectureGraph.js";
import type { GraphFormat } from "./cliArgs.js";
import { inspectProject } from "./inspectProject.js";
import { unknownLayers } from "./layerScope.js";
import { renderGraph } from "./renderGraph.js";

type GraphArgs = { readonly target: string; readonly config?: string; readonly format: GraphFormat; readonly layer?: string };

/** The architecture as the rules declare it, overlaid with what the code imports. */
export const graphCommand = async (args: GraphArgs): Promise<number | ArchitectureError> => {
  const inspected = await inspectProject(args.target, args.config);
  if (inspected instanceof ArchitectureError) return inspected;
  const { result } = inspected;
  if (!result.complete) return new ArchitectureError(["Structural findings stopped the check, so imports were not analysed. architecture-check lists them."]);
  const unknown = unknownLayers(result.architecture, args.layer === undefined ? [] : [args.layer]);
  if (unknown.length > 0) return new ArchitectureError([`Unknown layer: ${unknown.join(", ")}`]);
  process.stdout.write(renderGraph(architectureGraph(result, args.layer), args.format));
  return 0;
};
