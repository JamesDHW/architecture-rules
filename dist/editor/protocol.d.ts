import { ArchitectureError } from "../errors/architectureError.js";
/** A JSON-RPC message from the editor: a request when it has an id, a notification otherwise. */
export type IncomingMessage = {
    readonly id?: number | string;
    readonly method: string;
    readonly params?: unknown;
};
type Parsed = {
    readonly messages: readonly IncomingMessage[];
    readonly rest: Buffer;
};
/** Splits complete Content-Length framed messages off the front of the buffer; an incomplete tail stays in rest. */
export declare const parseMessages: (buffer: Buffer, parsed?: readonly IncomingMessage[]) => Parsed | ArchitectureError;
/** Frames one JSON-RPC message for the editor. */
export declare const frame: (message: Readonly<Record<string, unknown>>) => string;
export {};
//# sourceMappingURL=protocol.d.ts.map