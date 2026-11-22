import { isBlocking } from "../runner/findings.js";
import { architectureGraph } from "./architectureGraph.js";
import { renderMermaid } from "./renderGraph.js";
const isTouchedError = (finding) => finding.status === "touched" && isBlocking(finding);
const isNewError = (finding) => isBlocking(finding) && finding.status !== "touched";
const recordedRow = (verdict) => {
    if (verdict.recordedAtBase === undefined)
        return `| Recorded debt | ${verdict.recorded} |`;
    const delta = verdict.recorded - verdict.recordedAtBase;
    const sign = delta > 0 ? "+" : "";
    return `| Recorded debt | ${verdict.recordedAtBase} → ${verdict.recorded} (${sign}${delta}) |`;
};
const violatingGraph = (verdict) => {
    const graph = architectureGraph(verdict.result, undefined);
    const violating = graph.edges.filter((edge) => edge.state === "violating");
    if (violating.length === 0)
        return [];
    const involved = new Set(violating.flatMap((edge) => [edge.from, edge.to]));
    const shown = { ...graph, nodes: graph.nodes.filter((node) => involved.has(node.id)), edges: violating };
    return ["### Denied imports between layers", "", "```mermaid", renderMermaid(shown).trimEnd(), "```", ""];
};
/** Markdown for a pull request: the gates' counts, the change in recorded debt, and the denied imports as a graph. */
export const renderSummary = (verdict) => {
    const { findings } = verdict.result;
    const rows = [
        "| | |", "| --- | --- |",
        `| New errors | ${findings.filter(isNewError).length} |`,
        `| Touched files with debt to fix | ${new Set(findings.filter(isTouchedError).map((finding) => finding.file)).size} |`,
        recordedRow(verdict),
        `| Grown without a reason | ${verdict.grown.length} |`,
        `| Stale entries | ${verdict.stale.length} |`,
    ];
    return `${["## Architecture check", "", ...rows, "", ...violatingGraph(verdict)].join("\n")}\n`;
};
//# sourceMappingURL=renderSummary.js.map