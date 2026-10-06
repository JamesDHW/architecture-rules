/** Configurations produced by defineArchitecture, so the CLI can tell them from look-alike objects. */
const definitions = new WeakSet();
export const registerArchitecture = (architecture) => {
    definitions.add(architecture);
};
export const isRegisteredArchitecture = (value) => definitions.has(value);
//# sourceMappingURL=architectureRegistry.state.js.map