import { onePathOneResultRule } from "../src/rules/onePathOneResult.rule.js";
import { runCustomRule } from "./utils/runCustomRule.js";

runCustomRule(onePathOneResultRule, {
  valid: [
    "const notify = () => { if (isOwner) { notifyProject(); } if (isAdministrator) { notifyProject(); } };",
    "const notify = () => { if (isOwner) { notifyProject(); } checkpoint(); if (isAdministrator) { notifyProject(); } };",
    "const getLabel = () => { if (isMissing) return 'Missing'; if (isArchived) return 'Archived'; };",
    "const getLabel = () => { if (isMissing) return 'Not available'; if (isArchived) return 'Not  available'; };",
    "const getLabel = () => { if (isMissing) return unavailable; checkpoint(); if (isArchived) return unavailable; };",
    "const getLabel = () => { if (isMissing) { checkpoint(); return unavailable; } if (isArchived) return unavailable; };",
    "const getLabel = () => { const isUnavailable = isMissing || isArchived; if (isUnavailable) return unavailable; };",
    "const getLabel = () => { if (isMissing) { return unavailable; } else { return unavailable; } };",
  ],
  invalid: [
    "const getLabel = () => { if (isMissing) return unavailable; if (isArchived) return unavailable; };",
    "const getLabel = () => { if (isMissing) { return unavailable; } if (isArchived) return unavailable; };",
    "const getLabel = () => { if (isMissing) return formatLabel( project ); if (isArchived) return formatLabel(project); };",
    "const notify = () => { if (isMissing) return; if (isArchived) return; };",
    "const getLabel = () => { switch (status) { case 'ready': if (isMissing) return unavailable; if (isArchived) return unavailable; return available; } };",
  ].map((code) => ({ code, errors: [{ messageId: "sameResult" }] })),
});
