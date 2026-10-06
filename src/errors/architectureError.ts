/** Every failure this package returns as a value carries the problems it found. */
export class ArchitectureError extends Error {
  readonly issues: readonly string[];

  constructor(issues: readonly string[], options?: ErrorOptions) {
    super(issues.join("\n"), options);
    this.name = "ArchitectureError";
    this.issues = issues;
  }
}

export const isArchitectureError = (value: unknown): value is ArchitectureError => value instanceof ArchitectureError;
