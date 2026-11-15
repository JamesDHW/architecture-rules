// The editor side of architecture-check: starts `architecture-check lsp` from the workspace, so the
// editor shows exactly what the command reports. Findings refresh when files are saved.
const { existsSync } = require("node:fs");
const { join } = require("node:path");
const vscode = require("vscode");
const { LanguageClient } = require("vscode-languageclient/node");

const clients = new Map();

const commandFor = (folder) => {
  const configured = vscode.workspace.getConfiguration("architectureRules", folder.uri).get("command");
  if (configured) return configured;
  const name = process.platform === "win32" ? "architecture-check.cmd" : "architecture-check";
  return join(folder.uri.fsPath, "node_modules", ".bin", name);
};

const hasConfiguration = (folder) => ["architecture.config.ts", "architecture.config.mts"].some((name) => existsSync(join(folder.uri.fsPath, name)));

const start = async (folder) => {
  if (clients.has(folder.uri.toString()) || !hasConfiguration(folder)) return;
  const command = commandFor(folder);
  if (!existsSync(command)) {
    void vscode.window.showWarningMessage(`Architecture Rules: ${command} not found. Install architecture-rules in this workspace.`);
    return;
  }
  const client = new LanguageClient(
    "architectureRules",
    "Architecture Rules",
    { command, args: ["lsp"], options: { cwd: folder.uri.fsPath, shell: process.platform === "win32" } },
    {
      documentSelector: [{ scheme: "file", pattern: `${folder.uri.fsPath}/**/*` }],
      workspaceFolder: folder,
      synchronize: { fileEvents: vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(folder, "**/*.{ts,tsx,mts,cts,js,jsx,mjs,cjs,json}")) },
    },
  );
  clients.set(folder.uri.toString(), client);
  await client.start();
};

const stop = async (folder) => {
  const client = clients.get(folder.uri.toString());
  clients.delete(folder.uri.toString());
  if (client) await client.stop();
};

exports.activate = async (context) => {
  await Promise.all((vscode.workspace.workspaceFolders ?? []).map(start));
  context.subscriptions.push(vscode.workspace.onDidChangeWorkspaceFolders(async ({ added, removed }) => {
    await Promise.all([...added.map(start), ...removed.map(stop)]);
  }));
};

exports.deactivate = async () => {
  await Promise.all([...clients.values()].map((client) => client.stop()));
  clients.clear();
};
