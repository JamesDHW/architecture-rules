import { isRecord, isString } from "../core/guards.js";
import { ArchitectureError } from "../errors/architectureError.js";
import { tryCatch } from "../errors/tryCatch.js";
const headerEnd = "\r\n\r\n";
const contentLength = (header) => {
    const match = /Content-Length:\s*(\d+)/i.exec(header);
    return match === null ? undefined : Number(match[1]);
};
const isId = (value) => typeof value === "number" || isString(value);
const toMessage = (value) => {
    if (!isRecord(value))
        return undefined;
    const { id, method, params } = value;
    if (!isString(method))
        return undefined;
    return { method, ...(isId(id) ? { id } : {}), ...(params === undefined ? {} : { params }) };
};
/** Splits complete Content-Length framed messages off the front of the buffer; an incomplete tail stays in rest. */
export const parseMessages = (buffer, parsed = []) => {
    const end = buffer.indexOf(headerEnd);
    if (end === -1)
        return { messages: parsed, rest: buffer };
    const length = contentLength(buffer.subarray(0, end).toString("ascii"));
    if (length === undefined)
        return new ArchitectureError(["Editor message without a Content-Length header"]);
    const start = end + headerEnd.length;
    if (buffer.length < start + length)
        return { messages: parsed, rest: buffer };
    const body = tryCatch(() => JSON.parse(buffer.subarray(start, start + length).toString("utf8")));
    const message = body instanceof ArchitectureError ? undefined : toMessage(body);
    const messages = message === undefined ? parsed : [...parsed, message];
    return parseMessages(buffer.subarray(start + length), messages);
};
/** Frames one JSON-RPC message for the editor. */
export const frame = (message) => {
    const body = JSON.stringify({ jsonrpc: "2.0", ...message });
    return `Content-Length: ${Buffer.byteLength(body, "utf8")}${headerEnd}${body}`;
};
//# sourceMappingURL=protocol.js.map