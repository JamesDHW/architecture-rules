import { namedPredicatesRule } from "../src/rules/namedPredicates.rule.js";
import { runCustomRule } from "./utils/runCustomRule.js";

runCustomRule(namedPredicatesRule, {
  valid: [
    "if (!isNullish(project) && project.isArchived) {}",
    "if (isNullish(project) || project.isArchived) {}",
    "if (!isNullish(project) && !project.isArchived) {}",
    "if (!isNullish(project) && project.members.length > 0) {}",
    "if (!isNullish(response.project) && response.project.status === ARCHIVED_STATUS) {}",
    "if (!isNullish(project) && 'archived' === project.status) {}",
    "if (!isNullish(project) && project.balance > -1) {}",
    "while (!isNullish(project) && project.isPending) {}",
    "for (; !isNullish(project) && project.isPending;) {}",
    "do {} while (isNullish(project) || project.isPending);",
    "const label = !isNullish(project) && project.isArchived ? 'Archived' : 'Other';",
    "const isNullish = (candidate: unknown): candidate is null | undefined => candidate === null || candidate === undefined;",
    "if (project === undefined) {}",
    "if (canEditProject(project)) {}",
    {
      code: "if (isPresent(project) && project.isArchived) {}",
      options: [{ presenceGuards: ["isPresent"] }],
    },
    {
      code: "if (!isPresent(project) || project.isArchived) {}",
      options: [{ presenceGuards: ["isPresent"] }],
    },
    {
      code: "if (!isAbsent(project) && project.isArchived) {}",
      options: [{ nullishGuards: ["isAbsent"] }],
    },
  ],
  invalid: [
    "if (project !== undefined && project.isArchived) {}",
    "if (project === null || project.isArchived) {}",
    "if (isNullish(project) && project.isArchived) {}",
    "if (!isNullish(project) || project.isArchived) {}",
    "if (!isNullish(project) && canEditProject(project)) {}",
    "if (!isNullish(project) && project.ownerId === currentUser.id) {}",
    "if (!isNullish(project) && project.status === archivedStatus) {}",
    "if (!isNullish(project) && currentUser.isAdministrator) {}",
    "if (!isNullish(project) && project.isArchived && isAdministrator) {}",
    "if (!isNullish(project) && (project.isArchived || project.isDeleted)) {}",
    "if (!isNullish(loadProject()) && loadProject().isArchived) {}",
    "if (!isNullish(projects[selectedId]) && projects[selectedId].isArchived) {}",
    "if (!guards.isNullish(project) && project.isArchived) {}",
    "if (!isNullish(project, fallback) && project.isArchived) {}",
    "if (!isPresent(project) && project.isArchived) {}",
    "if (!(isOwner || isAdministrator)) {}",
  ].map((code) => ({ code, errors: [{ messageId: "namedPredicate" }] })),
});

runCustomRule(
  namedPredicatesRule,
  {
    valid: [
      "const panel = <>{canEditProject && <EditButton />}</>;",
      "const panel = <>{(!isNullish(project) && project.isArchived) && <ArchiveNotice />}</>;",
      "const panel = <>{!isNullish(project) && (project.isArchived && <ArchiveNotice />)}</>;",
    ],
    invalid: [
      {
        code: "const panel = <>{isOwner && (isAdministrator && <EditButton />)}</>;",
        errors: [{ messageId: "namedPredicate" }],
      },
      {
        code: "const panel = <>{(isOwner || isAdministrator) && <EditButton />}</>;",
        errors: [{ messageId: "namedPredicate" }],
      },
      {
        code: "const panel = <>{isOwner && isAdministrator && <EditButton />}</>;",
        errors: [{ messageId: "namedPredicate" }],
      },
    ],
  },
  "tsx",
);

runCustomRule(namedPredicatesRule, {
  valid: ['const label = isNullish(project) ? "Absent" : "Present";'],
  invalid: [
    {
      code: 'const name = isNullish(suppliedName) ? "Anonymous" : suppliedName;',
      errors: [{ messageId: "nullishFallback" }],
    },
    {
      code: 'const name = !isNullish(suppliedName) ? suppliedName : "Anonymous";',
      errors: [{ messageId: "nullishFallback" }],
    },
    {
      code: 'const name = isPresent(suppliedName) ? suppliedName : "Anonymous";',
      options: [{ presenceGuards: ["isPresent"] }],
      errors: [{ messageId: "nullishFallback" }],
    },
  ],
});
