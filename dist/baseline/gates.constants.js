/**
 * Exit codes, one per reason a check fails, so CI can tell them apart. 2 is left to agent hooks, where it means
 * "show this output to the agent".
 */
export const EXIT_NEW = 1;
export const EXIT_AGENT = 2;
export const EXIT_TOUCHED = 3;
export const EXIT_GROWN = 4;
export const EXIT_STALE = 5;
//# sourceMappingURL=gates.constants.js.map