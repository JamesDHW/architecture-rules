/** The CLI's usage text. */
export const help = `Usage: architecture-check [options] [project-dir]       check every file
       architecture-check check <layer>... [--incoming]    only the findings these layers own, or imports into them
       architecture-check status [--since <ref>] [--json]  per layer: compliant files and recorded debt
       architecture-check graph [--format text|json|mermaid|dot] [--layer <name>]
       architecture-check map [--json]                     the layer of every file, and files without one
       architecture-check baseline [--accept --reason <why>] [--rule <id>]...
       architecture-check baseline merge <ancestor> <current> <other>
       architecture-check fix --rule file-naming|no-deep-relative-imports [--path <glob>]...
       architecture-check explain <file | rule>
       architecture-check rules [--json]
       architecture-check doctor                           is adoption complete?
       architecture-check adopt --prompt | --agent-snippet
       architecture-check describe [--json | --mermaid]
       architecture-check report
       architecture-check lsp

Check options:
  --staged            also fail on recorded debt in staged files (pre-commit); stages the pruned baseline
  --worktree          also fail on recorded debt in files changed since HEAD (agents)
  --since <ref>       also fail on recorded debt in files changed since the merge base with <ref>
  --ci                with --since: never write, and fail on a stale baseline or growth without a reason
  --format <format>   text (default), json, or agent: only what must change, on stderr, exit 2 on failure
  --json              the same as --format json
  --file <path>       lint and report only this file (repeatable); the whole project is still analyzed
  --fix               apply the lint fixes that are safe, then check again
  --summary <file>    write a Markdown summary for a pull request
  --fixable-in <n>    only files at most n errors away from compliant
  --config <path>     the configuration; architecture.config.ts in project-dir by default

Exit codes: 0 pass · 1 new errors · 2 agent format failed · 3 changed files keep recorded debt ·
            4 baseline grew without a reason · 5 baseline lists fixed debt (--ci)

Requires architecture.config.ts (or architecture.config.mts) exporting defineArchitecture(...).
Existing errors are recorded in architecture.baseline.json; only new ones fail, and files you change must be fixed.
`;
//# sourceMappingURL=help.js.map