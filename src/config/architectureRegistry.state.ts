import type { Architecture } from "./types.js";

/** Configurations produced by defineArchitecture, so the CLI can tell them from look-alike objects. */
const definitions = new WeakSet<object>();

export const registerArchitecture = (architecture: Architecture): void => {
  definitions.add(architecture);
};

export const isRegisteredArchitecture = (value: object): boolean => definitions.has(value);
