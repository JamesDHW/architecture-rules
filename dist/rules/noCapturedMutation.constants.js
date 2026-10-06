/** Methods that change the array, Map or Set they are called on. */
export const CONTAINER_MUTATING_METHODS = new Set(["push", "pop", "shift", "unshift", "splice", "sort", "reverse", "fill", "copyWithin", "set", "delete", "clear", "add"]);
/** Constructors whose new instances are tracked as containers. */
export const CONTAINER_CONSTRUCTORS = new Set(["Map", "Set", "WeakMap", "WeakSet", "Array", "Object"]);
//# sourceMappingURL=noCapturedMutation.constants.js.map