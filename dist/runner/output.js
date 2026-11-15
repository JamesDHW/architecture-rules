import { hasErrors } from "./checkResult.js";
import { renderReport } from "./markdownReport.js";
import { guidanceFor } from "./ruleGuidance.js";
import { renderJson, renderText } from "./textOutput.js";
/** Prints the result and returns the exit code: 1 when any error was found, except for the report, which always exits 0. */
export const printOutput = (root, result, format) => {
    const guidance = guidanceFor(root, result.findings);
    switch (format) {
        case "report":
            process.stdout.write(renderReport(result));
            return 0;
        case "json":
            process.stdout.write(renderJson(result, guidance));
            return hasErrors(result) ? 1 : 0;
        case "text":
            process.stdout.write(renderText(result, guidance));
            return hasErrors(result) ? 1 : 0;
    }
};
//# sourceMappingURL=output.js.map