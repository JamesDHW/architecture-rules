/** Every failure this package returns as a value carries the problems it found. */
export class ArchitectureError extends Error {
    issues;
    constructor(issues, options) {
        super(issues.join("\n"), options);
        this.name = "ArchitectureError";
        this.issues = issues;
    }
}
export const isArchitectureError = (value) => value instanceof ArchitectureError;
//# sourceMappingURL=architectureError.js.map