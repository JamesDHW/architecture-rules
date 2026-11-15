import { fileURLToPath } from "node:url";
import { isRecord, isString, isUnknownArray } from "../core/guards.js";
import { configPathFor, loadArchitecture } from "../config/loadArchitecture.js";
import { ArchitectureError } from "../errors/architectureError.js";
import { tryCatch } from "../errors/tryCatch.js";
import { inspectArchitecture } from "../runner/runner.js";
import { fileDiagnostics } from "./diagnostics.js";
import { frame, parseMessages } from "./protocol.js";
import { session, updateSession } from "./session.state.js";
/** JSON-RPC's code for a method the server does not implement. */
const methodNotFound = -32601;
const send = (message) => {
    process.stdout.write(frame(message));
};
const respond = (id, result) => send({ id, result });
const notify = (method, params) => send({ method, params });
const fileUri = (value) => {
    if (!isString(value))
        return undefined;
    const path = tryCatch(() => fileURLToPath(value));
    return path instanceof ArchitectureError ? undefined : path;
};
/** The workspace root: rootUri, or the first workspace folder. */
const rootFrom = (params) => {
    if (!isRecord(params))
        return undefined;
    const folders = isUnknownArray(params.workspaceFolders) ? params.workspaceFolders : [];
    const [folder] = folders;
    return fileUri(params.rootUri) ?? (isRecord(folder) ? fileUri(folder.uri) : undefined);
};
/** A configuration that does not load is reported on the configuration file, as the CLI prints it. */
const configurationErrors = (root, configPath, error) => {
    const file = configPath.startsWith(`${root}/`) ? configPath.slice(root.length + 1) : configPath;
    return error.issues.map((issue) => ({ source: "structure", severity: "error", ruleId: "architecture-config", file, message: issue }));
};
const findingsFor = async (root, checks) => {
    const configPath = configPathFor(root);
    const architecture = await loadArchitecture(configPath, checks);
    if (architecture instanceof ArchitectureError)
        return configurationErrors(root, configPath, architecture);
    const result = await inspectArchitecture(root, architecture, { configFile: configPath });
    return result instanceof ArchitectureError ? configurationErrors(root, configPath, result) : result.findings;
};
const publish = (root, findings) => {
    const files = fileDiagnostics(root, findings, session().published);
    for (const file of files) {
        notify("textDocument/publishDiagnostics", file);
    }
    updateSession({ published: new Set(files.filter((file) => file.diagnostics.length > 0).map((file) => file.uri)) });
};
/** Runs the same check as the CLI and publishes its findings. A save during a check queues one more check. */
const check = async () => {
    const { root, checking, checks } = session();
    if (root === undefined)
        return;
    if (checking) {
        updateSession({ pending: true });
        return;
    }
    updateSession({ checking: true, pending: false, checks: checks + 1 });
    publish(root, await findingsFor(root, checks + 1));
    const { pending } = updateSession({ checking: false });
    if (pending) {
        await check();
    }
};
const initializeResult = {
    capabilities: { textDocumentSync: { openClose: true, change: 0, save: { includeText: false } } },
    serverInfo: { name: "architecture-check" },
};
/** Requests get a reply; notifications (no id) never do. */
const reply = (id, result) => {
    if (id === undefined)
        return;
    respond(id, result);
};
const initialize = ({ id, params }) => {
    const root = rootFrom(params);
    updateSession(root === undefined ? {} : { root });
    reply(id, initializeResult);
};
const unsupported = ({ id, method }) => {
    if (id === undefined)
        return;
    send({ id, error: { code: methodNotFound, message: `Unsupported method: ${method}` } });
};
const handle = (message) => {
    switch (message.method) {
        case "initialize":
            return initialize(message);
        case "initialized":
        case "textDocument/didSave":
        case "workspace/didChangeWatchedFiles":
            return void check();
        case "shutdown":
            return reply(message.id, null);
        case "exit":
            return void process.stdin.destroy();
        default:
            return unsupported(message);
    }
};
const receive = (chunk) => {
    const parsed = parseMessages(Buffer.concat([session().buffer, chunk]));
    if (parsed instanceof ArchitectureError) {
        process.stderr.write(`${parsed.message}\n`);
        updateSession({ buffer: Buffer.alloc(0) });
        return;
    }
    updateSession({ buffer: parsed.rest });
    for (const message of parsed.messages) {
        handle(message);
    }
};
/**
 * The editor integration: a language server on stdin and stdout. It checks the saved files with exactly the check
 * the CLI runs and publishes the same findings, so the editor and the command never disagree.
 */
export const startServer = async () => new Promise((finish) => {
    process.stdin.on("data", receive);
    process.stdin.on("close", () => {
        finish(0);
    });
});
//# sourceMappingURL=server.js.map