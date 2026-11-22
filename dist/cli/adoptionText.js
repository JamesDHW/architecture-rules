/** The instructions for an agent adopting architecture-rules on an existing codebase. Versioned with the CLI it names. */
export const adoptionPrompt = `# Adopt architecture-rules on this codebase

You are adding architecture-rules to an existing TypeScript codebase. The goal is a configuration that describes
the codebase as it should be, a baseline that records today's violations as debt, and checks that stop new
violations and make every file someone changes compliant. Do not change application code during adoption.

Work through these steps in order. Each step ends with a command that says whether it is done; do not move on until
it passes. Ask the user before deciding anything the steps leave open, and record every decision in the report
(step 9).

## 1. Read the structure

- Read every tsconfig the project builds with, and package.json workspaces (or pnpm-workspace.yaml).
- List the packages and their top-level folders. Note any monorepo tool (Nx, Turborepo, Bazel, Rush) and its
  project boundaries: tags, project.json files, BUILD files.
- tsconfig decides which files are checked. Do not invent another file list.

## 2. Draft architecture.config.ts

- Run \`architecture-check describe\` on an example from this package's examples/ folder to see the shape.
- \`projects.tsconfigs\` lists the tsconfigs from step 1.
- Map today's folders to layers with globs. Do not move or rename files to fit a layer: describe what exists.
- A layer's \`dependencies.internal\` lists the layers it should import, not every layer it imports today. The
  difference becomes baselined debt.
- Mark entries (\`entry\`, with a reason) for files loaded from outside: app entry points, routes, test files,
  tool configuration. Mark test, story and script layers \`development: true\`.
- Start with \`adoption: { mode: "observe" }\` so nothing is blocked while you tune.

## 3. Translate existing boundary rules

Translate what the team already enforces, so no rule is lost:

- Nx tags and \`@nx/enforce-module-boundaries\` depConstraints become layers and \`dependencies.internal\`.
- ESLint \`no-restricted-imports\`, eslint-plugin-boundaries and dependency-cruiser \`forbidden\` rules become
  \`dependencies\` on the layers they constrain.
- Knip \`entry\` and \`project\` settings become layer \`entry\` settings.
- List anything you cannot translate in the report as a gap. Never drop a rule silently.

## 4. Classify every file

Run \`architecture-check map\` and repeat until it exits 0. Every source file must match exactly one layer. A file
that fits nowhere gets a layer that says so (for example \`legacy\`, with a description of what it is), never a
broader glob that hides it.

## 5. Tune in observe mode

Run \`architecture-check\`. Read the findings by rule (the summary's "by rule" line). For each rule with many
findings, decide with the user: keep it (its findings become debt), set it per layer, or turn it off with a reason.
False positives found now are cheap; found after enforcement they cost trust. \`architecture-check explain <rule>\`
describes any rule.

## 6. Record the baseline and enforce

- Run \`architecture-check baseline\`. It writes architecture.baseline.json in the root and in each workspace
  package that has findings.
- Remove \`mode: "observe"\` from \`adoption\`.
- Run \`architecture-check\`: it must exit 0.

## 7. Wire the checks into the repository

Use the tools the repository already has; add none it does not need.

- **Agent hooks.** After every file edit: \`architecture-check --format agent --file <edited file>\`. When the agent
  tries to finish: \`architecture-check --format agent --worktree\`. Agent format writes to stderr and exits 2 on
  failure, which most agent hook systems show to the agent. For Claude Code, in .claude/settings.json:

  \`\`\`json
  {
    "hooks": {
      "PostToolUse": [{ "matcher": "Edit|Write|MultiEdit", "hooks": [{ "type": "command", "command": "f=$(jq -r '.tool_input.file_path // empty'); [ -z \\"$f\\" ] || pnpm exec architecture-check --format agent --file \\"$f\\"" }] }],
      "Stop": [{ "hooks": [{ "type": "command", "command": "pnpm exec architecture-check --format agent --worktree" }] }]
    }
  }
  \`\`\`

- **Agent instructions.** Add the output of \`architecture-check adopt --agent-snippet\` to AGENTS.md or CLAUDE.md.
- **Pre-commit.** Run \`architecture-check --staged\` from the hook manager the repository uses (husky, lefthook,
  simple-git-hooks, or .git/hooks). It removes fixed debt from the baseline and stages the file.
- **CI.** Run \`architecture-check --since origin/<default branch> --ci --summary architecture-summary.md\`, and
  post the summary on the pull request if the CI can. Fetch enough history for the merge base.
- **Merge driver.** Add \`architecture.baseline.json merge=architecture-baseline\` to .gitattributes, and tell the
  user each clone needs:
  \`git config merge.architecture-baseline.driver "pnpm exec architecture-check baseline merge %O %A %B"\`.
- **Ownership.** Suggest a CODEOWNERS entry for architecture.baseline.json, so growth gets reviewed.

## 8. Switch off overlapping lint rules, with proof

The check reports other linters' configuration (\`competing-configuration\`). For each rule of an existing linter:

1. Find the architecture rule that covers it: \`architecture-check rules --json\` describes every rule in plain terms.
2. Run both tools on the same files and confirm the architecture rule reports the same violations or more.
3. Only then switch the old rule off. Keep a rule that has no equivalent, and list it in the report as a gap.

During the migration, \`competing-configuration\` may be turned off in \`rules\` with a reason naming the plan.

## 9. Finish

Run \`architecture-check doctor\` and repeat until it exits 0. Then write ARCHITECTURE-ADOPTION.md with:

- the layers and why each exists, in a sentence each;
- every rule translated from another tool, and every gap kept;
- every lint rule switched off, and the evidence that the architecture rule covers it;
- every rule turned off or changed, with the user's reason;
- the baseline's size by rule (\`architecture-check status\`);
- what was wired in step 7, and what the user still has to do (merge-driver config per clone, CI secrets).

A reviewer should be able to approve the adoption from this report alone.
`;
/** What an agent working in an adopted codebase needs to know, for AGENTS.md or CLAUDE.md. */
export const agentSnippet = `## Architecture rules

This codebase is checked by architecture-rules against architecture.config.ts. Existing violations are recorded in
architecture.baseline.json as debt; new ones fail the check.

- Before changing code: \`pnpm exec architecture-check describe\` shows the layers and what each may import.
- Every file you change must be fully compliant when you finish, including debt recorded before you touched it.
  \`pnpm exec architecture-check --worktree\` lists what is left. Put that cleanup in its own commit, so reviewers
  can tell it from the feature.
- \`pnpm exec architecture-check explain <rule>\` says why a rule exists and what to write instead.
- Do not edit architecture.config.ts or architecture.baseline.json, add exceptions, or run
  \`architecture-check baseline --accept\`, without asking.
`;
//# sourceMappingURL=adoptionText.js.map