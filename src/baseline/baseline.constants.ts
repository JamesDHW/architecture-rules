/** The baseline's file name, one in each workspace package and in the root. */
export const BASELINE_FILE_NAME = "architecture.baseline.json";

/** The baseline format; a file with another version is rejected rather than misread. */
export const BASELINE_VERSION = 1;

/** The reason recorded when a newly enabled rule's existing findings are baselined without one. */
export const RULE_BASELINE_REASON = "Recorded when the rule was turned on.";
