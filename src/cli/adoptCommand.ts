import { adoptionPrompt, agentSnippet } from "./adoptionText.js";

/** Prints the adoption prompt for an agent, or the snippet for AGENTS.md / CLAUDE.md. */
export const adoptCommand = (output: "prompt" | "agent-snippet"): number => {
  process.stdout.write(output === "prompt" ? adoptionPrompt : agentSnippet);
  return 0;
};
