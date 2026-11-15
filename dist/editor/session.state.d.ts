/** What one editor session needs to remember between messages. */
type Session = {
    /** The workspace root the editor opened, once initialized. */
    readonly root?: string;
    /** URIs that have diagnostics in the editor, so a later check can clear the ones that became clean. */
    readonly published: ReadonlySet<string>;
    readonly checking: boolean;
    /** A save arrived during a check: check again when it ends. */
    readonly pending: boolean;
    /** Increments on every check, so an edited architecture.config.ts is imported afresh. */
    readonly checks: number;
    /** Bytes received but not yet a whole message. */
    readonly buffer: Buffer;
};
export declare const session: () => Session;
export declare const updateSession: (change: Partial<Session>) => Session;
export {};
//# sourceMappingURL=session.state.d.ts.map