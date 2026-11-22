const stableMessage = (message) => message.replaceAll(/\d+/g, "#");
/**
 * Lint, compiler and dead-code errors can be recorded as debt. Structural findings stop the run and warnings never
 * fail it, so neither is recorded.
 */
export const isBaselineable = (finding) => finding.severity === "error" && finding.source !== "structure";
export const fingerprintOf = (finding) => ({ file: finding.file, rule: finding.ruleId, message: stableMessage(finding.message) });
export const fingerprintKey = ({ file, rule, message }) => JSON.stringify([file, rule, message]);
//# sourceMappingURL=fingerprint.js.map