# Architecture Rules for VS Code

Shows `architecture-check` findings in the editor. The extension starts `architecture-check lsp` from the workspace's own `architecture-rules` install, so the editor shows the same rules, messages and positions as the command, and nothing else.

- Findings refresh when you save a file, and when files change on disk (a branch switch, a pull).
- Each finding links to its rule's page in `docs/rules/`.
- Turn off other linter extensions for the workspace (`.vscode/settings.json`), so only these findings show.

## Install

```sh
cd editors/vscode
npm install
npx @vscode/vsce package --allow-missing-repository
code --install-extension architecture-rules-vscode-0.0.0.vsix
```

Set `architectureRules.command` if `architecture-check` is not in the workspace's `node_modules/.bin`.
