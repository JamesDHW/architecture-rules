/** The rule ids the program checks report under. */
export const PROGRAM_RULES = {
  discardedErrors: "no-discarded-errors",
  literalLists: "exhaustive-literal-lists",
  directoryError: "max-directory-files",
  directoryWarn: "max-directory-files-warn",
  fileSubstance: "min-file-substance",
} as const;
