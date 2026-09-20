import { controlFlowBracesRule } from "../src/rules/controlFlowBraces.rule.js";
import { runCustomRule } from "./utils/runCustomRule.js";

runCustomRule(controlFlowBracesRule, {
  valid: [
    "const findProject = () => { if (isMissing) return undefined; };",
    "const stop = () => { if (isInvalid) throw new Error(); };",
    "for (const project of projects) { if (project.isArchived) continue; }",
    "while (isRunning) { if (isFinished) break; }",
    "if (isReady) { startProject(); }",
    "if (isMissing) {\n return undefined;\n }",
    "for (;;) { break; }",
    "for (const projectId in projects) { visitProject(projectId); }",
    "do { visitProject(); } while (isRunning);",
    "while (isRunning) {}",
  ],
  invalid: [
    "if (isReady) startProject();",
    "if (isMissing)\n return undefined;",
    "if (\n isMissing\n) return undefined;",
    "if (isMissing) return (\n undefined\n);",
    "if (isReady);",
    "for (const project of projects) visitProject(project);",
    "for (const projectId in projects) visitProject(projectId);",
    "for (;;) break;",
    "while (isRunning) continue;",
    "do visitProject(); while (isRunning);",
    "if (isReady) if (isMissing) return undefined;",
  ].map((code) => ({ code, errors: [{ messageId: "requireBraces" }] })),
});
