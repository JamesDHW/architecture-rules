/** Methods that change the array, Map or Set they are called on. */
export const CONTAINER_MUTATING_METHODS: ReadonlySet<string> = new Set(["push", "pop", "shift", "unshift", "splice", "sort", "reverse", "fill", "copyWithin", "set", "delete", "clear", "add"]);

/** Constructors whose new instances are tracked as containers. */
export const CONTAINER_CONSTRUCTORS: ReadonlySet<string> = new Set(["Map", "Set", "WeakMap", "WeakSet", "Array", "Object"]);
