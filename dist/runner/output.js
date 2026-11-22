import { renderReport } from "./markdownReport.js";
import { guidanceFor } from "./ruleGuidance.js";
import { renderAgent, renderJson, renderText } from "./textOutput.js";
const noGate = { notes: [], details: {} };
/** Renders the result in the format asked for. */
export const renderOutput = (root, result, format, gate = noGate) => {
    const guidance = guidanceFor(root, result.findings.filter((finding) => finding.status !== "baselined"));
    switch (format) {
        case "report":
            return renderReport(result);
        case "json":
            return renderJson(result, guidance, gate.details);
        case "text":
            return renderText(result, guidance, gate.notes);
        case "agent":
            return renderAgent(result, guidance, gate.notes);
    }
};
//# sourceMappingURL=output.js.map