import { adoptionPrompt, agentSnippet } from "./adoptionText.js";
/** Prints the adoption prompt for an agent, or the snippet for AGENTS.md / CLAUDE.md. */
export const adoptCommand = (output) => {
    process.stdout.write(output === "prompt" ? adoptionPrompt : agentSnippet);
    return 0;
};
//# sourceMappingURL=adoptCommand.js.map