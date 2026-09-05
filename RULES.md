# TypeScript and React Code Rules

These rules optimize primarily for understandability. Performance and security exceptions should be isolated behind descriptive names and, when the reason is not evident, an explanatory comment.

## Use guard clauses for terminal cases

Handle exceptional and terminal cases immediately. Do not use `else` or `else if`. Do not wrap the remaining function body in an `else` branch when the preceding branch returns, throws, breaks, or continues.

```ts
function getDisplayName(user: User | null): string {
  if (user === null) return "Anonymous";
  if (user.isDeleted) return "Deleted user";

  return user.profile.displayName;
}
```

**Reason:** Guard clauses keep the main path flat and make each exit condition independently visible. Avoidable nesting forces the reader to retain conditions while following the primary behavior.

## Do not assign boolean literals in branches

Do not assign `true` or `false` inside a branch to keep a result for later. Return the value now, or assign the boolean expression directly.

```ts
const isLeapYear = (year: number): boolean => {
  if (isDivisibleBy(year, 400)) return true;
  if (isDivisibleBy(year, 100)) return false;
  return isDivisibleBy(year, 4);
};
```

**Reason:** A result flag makes the flow rely on state that a later change can corrupt and hides that the function is computing one boolean.

## Return a boolean expression instead of a true/false tail

When the remaining path is only `if (condition) return true; return false` or the reverse, return the condition. Early returns that exit with `true` or `false` remain allowed when later paths return something other than the opposite literal.

**Reason:** A true/false tail is a boolean wrapped in a detour. Exception-first decisions that continue to a different result are not that pattern.

## Name non-obvious compound conditions

Assign a descriptive boolean name when a condition represents a domain concept that is not immediately evident from its clauses. Keep simple structural checks inline when naming them would merely restate the expression.

```ts
const canEditProject =
  project.ownerId === currentUser.id || currentUser.role === "admin";

if (canEditProject) {
  showEditor();
}
```

**Reason:** A domain-oriented name tells the reader what a condition means and avoids requiring each reader to reconstruct that meaning from implementation details.

## Name divisibility checks

Do not test or return an inline remainder comparison such as `value % n === 0`. Give that check a name, typically `isDivisibleBy(value, n)`. A helper whose whole body is that comparison may implement it directly.

```ts
const isDivisibleBy = (value: number, divisor: number): boolean =>
  value % divisor === 0;
```

**Reason:** A named divisibility predicate states the intention and can be reused in exception-first boolean decisions without repeating arithmetic.

## Keep ternaries simple and side-effect-free

Use a ternary only for a single, concise binary choice whose branches produce values without side effects. Do not nest ternaries. Use explicit control flow or a descriptively named function for multiple cases.

```ts
const label = isSaving ? "Saving…" : "Save";
```

**Reason:** A simple ternary makes a small value choice easy to see. Nested or effectful ternaries hide control flow inside an expression and make execution order harder to follow.

## Type exported functions and React components at their boundaries

Add an explicit return type to every exported non-component function. Declare every React function component with a named, readonly props type and assign it to `FC<Props>` instead of annotating its parameter or return type inline. Allow TypeScript to infer return types for private helpers and inline callbacks.

```tsx
export const findProject = (id: ProjectId): Project | undefined => {
  return projects.find((project) => project.id === id);
};

type ProjectCardProps = {
  readonly project: Project;
};

const ProjectCard: FC<ProjectCardProps> = ({ project }) => {
  return <article>{project.name}</article>;
};
```

**Reason:** Explicit boundary types make public contracts and component intent visible without burdening small local functions with annotations TypeScript can infer. A named props type and `FC` give every component the same recognizable declaration shape.

## Prefer arrow functions

Use arrow functions for named operations, React components, callbacks, and closures. Use other function forms only where the language or an API requires them, such as methods that need a dynamic `this`.

```ts
const getActiveProjects = (projects: Project[]): Project[] => {
  return projects.filter((project) => project.isActive);
};
```

**Reason:** One default function syntax reduces incidental variation, while arrow functions also make lexical `this` behavior consistent and explicit.

## Keep values immutable

Do not reassign bindings or mutate inputs, shared state, or previously observable values. Local mutation may construct a fresh, unaliased result inside a focused helper when that is clearer than an immutable accumulator. The result must not escape until construction is complete. Isolate performance-, security-, or API-driven observable mutation behind a descriptive abstraction.

```ts
const indexProjectsById = (
  projects: readonly Project[],
): Readonly<Record<ProjectId, Project>> => {
  const projectsById: Record<ProjectId, Project> = {};

  for (const project of projects) {
    projectsById[project.id] = project;
  }

  return projectsById;
};
```

**Reason:** Callers can understand an immutable transformation without tracking changes over time. Fresh construction-time mutation preserves that external model while avoiding contorted or noisy immutable accumulators.

## Use `reduce` only for simple folds

Use `reduce` only when the result is genuinely a single simple fold, such as a sum, minimum, or maximum. Use dedicated operations such as `map`, `filter`, or a descriptively named helper for transformation, selection, grouping, indexing, and multi-purpose accumulation.

```ts
const totalPrice = items.reduce((total, item) => total + item.price, 0);
```

**Reason:** General accumulators force readers to simulate each iteration and track the accumulator's shape. Dedicated operations state their intent directly and avoid noisy immutable accumulator copies.

## Use effects only for external synchronization

Use React effects only to synchronize with systems outside React, such as subscriptions, browser APIs, network synchronization, or third-party widgets. Derive values during rendering inside the component-specific hook and perform user-driven work in event handlers rather than using effects to coordinate internal data flow.

```tsx
type ProjectListProps = {
  readonly projects: readonly Project[];
  readonly query: string;
};

type ProjectListModel = {
  readonly visibleProjects: readonly Project[];
};

const useProjectList = ({
  projects,
  query,
}: ProjectListProps): ProjectListModel => {
  const visibleProjects = projects.filter((project) =>
    project.name.includes(query),
  );

  return { visibleProjects };
};

const ProjectList: FC<ProjectListProps> = (props) => {
  const projectList = useProjectList(props);
  return <List projects={projectList.visibleProjects} />;
};
```

**Reason:** Derived state in effects creates extra renders and multiple sources of truth. Keeping calculations in render and consequences in their initiating handlers makes the flow of data direct and traceable.

## Prefer component composition over behavior flags

Pass structure and application behavior into React components through children, slots, or callbacks rather than flags that make a component choose among internal structures or behaviors. A boolean is acceptable when it directly represents an intrinsic state of the abstraction, such as a native control's `disabled` state.

```tsx
<ProjectPanel header={<ProjectHeader project={project} />}>
  <ProjectDetails project={project} />
</ProjectPanel>
```

**Reason:** Behavioral flags accumulate interacting branches and make a component responsible for unrelated policies. Composition and inversion of control keep each policy at the call site where its purpose is visible and let the component focus on one stable abstraction.

## Do not use boolean arguments to select function behavior

When a boolean would select an implementation path, split the behaviors into descriptively named operations or inject a named policy. Booleans remain valid when they are the actual data being operated on rather than a control flag.

```ts
const user = await loadUserIncludingDeleted(userId);
```

**Reason:** A behavioral boolean is opaque at the call site and usually reveals that one function owns multiple policies. Separate operations or injected policies expose the choice by name and keep each implementation focused.

## Model exclusive states with discriminated unions

Represent mutually exclusive states as a union with one discriminant and state-specific fields. Do not represent them as independent status booleans and optional fields.

```ts
type ProjectRequest =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; project: Project }
  | { status: "failure"; error: Error };
```

**Reason:** Discriminated unions make invalid combinations unrepresentable, narrow safely in control flow, and show exactly which data is available in each state.

## Handle discriminated unions exhaustively

Every branch over a discriminated union must prove at compile time that all variants are handled. Use a `never` check; do not use a generic default that accepts unhandled variants.

```ts
const getRequestLabel = (request: ProjectRequest): string => {
  switch (request.status) {
    case "idle":
      return "Ready";
    case "loading":
      return "Loading…";
    case "success":
      return request.project.name;
    case "failure":
      return request.error.message;
    default:
      return request satisfies never;
  }
};
```

**Reason:** Exhaustiveness turns additions to a state model into useful compiler errors at every affected decision point, preventing new variants from being silently ignored.

## Isolate unchecked type escapes at boundaries

Do not use `any`, non-null assertions, unchecked type assertions, `@ts-ignore`, or `@ts-expect-error` in application code. Accept untrusted values as `unknown` and validate or narrow them. If unsafe interoperability is unavoidable, isolate it in a descriptively named boundary adapter and document the reason. Type-preserving or type-checking constructs such as `as const` and `satisfies` remain allowed.

```ts
const parseProject = (input: unknown): Project => {
  return ProjectSchema.parse(input);
};
```

**Reason:** Escape hatches move type errors away from their cause and make readers trust claims the compiler cannot verify. A narrow adapter contains that uncertainty and gives the rest of the codebase fully checked types.

## Return errors as values in the project error hierarchy

Every fallible operation returns `T | ProjectError`, where `ProjectError` stands for the project's base error class and specific failures extend it. Use a shared `tryCatch` abstraction that works with synchronous and asynchronous operations and normalizes every thrown value or rejection into that hierarchy. Narrow failures with `instanceof`; do not add a result wrapper.

```ts
const result: Project | ProjectError = await tryCatch(() =>
  createProject(input),
);

if (result instanceof ProjectNameTakenError) {
  return showNameTakenMessage();
}

if (result instanceof ProjectError) {
  return reportProjectError(result);
}

return showProject(result);
```

**Reason:** The union makes failure visible in the return type while retaining ordinary values and native TypeScript narrowing. A single project error hierarchy gives callers one dependable boundary and avoids uncaught or untyped thrown values spreading through application code.

## Use complete, domain-specific names

Name values by their domain role using complete words. Do not use generic placeholders such as `data`, `item`, `value`, `obj`, `arr`, or `tmp`, or single letters when a specific role is known. Canonical terms such as `URL`, `HTTP`, and `id`, and established notation in a narrow mathematical context, are allowed.

```ts
const matchingProject = projects.find(
  (project) => project.id === selectedProjectId,
);
```

**Reason:** Specific names carry context into every use and remove the need to inspect a declaration or infer what a generic placeholder represents.

## Minimize comments

Make code understandable through types, names, and descriptive abstractions rather than comments. Add a comment only when an unavoidable external constraint, workaround, or non-obvious invariant cannot be expressed in code. Do not narrate syntax, steps, or sections.

```ts
const newlyReceivedEvents = deduplicateByProviderEventId(events);
```

**Reason:** Comments can drift away from behavior and ask readers to reconcile two descriptions of the same logic. Executable names and types stay coupled to the code and are checked by tooling.

## Keep each function at one level of abstraction

A function should either coordinate descriptively named operations or implement one focused operation. Do not interleave high-level workflow with low-level parsing, payload construction, persistence details, or other independently nameable mechanics. Do not use line count as a substitute for this rule.

```ts
const submitOrder = async (
  input: OrderInput,
): Promise<Order | ProjectError> => {
  const order = validateOrder(input);
  if (order instanceof ProjectError) return order;

  const payment = await collectPayment(order);
  if (payment instanceof ProjectError) return payment;

  return saveOrder(order, payment);
};
```

**Reason:** A consistent abstraction level lets the reader understand a function as a sequence of meaningful concepts without repeatedly switching between business intent and implementation detail.

## Use `async`/`await` for sequential asynchronous flow

Express sequential asynchronous work with `async`/`await`, not `.then`, `.catch`, or `.finally` chains. Use explicit Promise combinators such as `Promise.all` when intentional concurrency is the operation being expressed.

```ts
const loadProject = async (
  projectId: ProjectId,
): Promise<Project | ProjectError> => {
  const response = await fetchProject(projectId);
  if (response instanceof ProjectError) return response;

  return parseProject(response);
};
```

**Reason:** `async`/`await` presents asynchronous control flow in the same readable sequence as synchronous code and keeps guard clauses and typed error handling straightforward.

## Use explicit conditions for non-boolean values

Only boolean-typed expressions may be tested directly. Compare strings, numbers, objects, and nullish values explicitly according to the intended condition.

```ts
if (project === undefined) return new ProjectNotFoundError();
if (project.name.length === 0) return new ProjectNameRequiredError();
if (retryCount > 0) scheduleRetry();
if (project.isArchived) showArchive();
```

**Reason:** Explicit comparisons state which value matters and avoid making readers reason about JavaScript's coercion rules or wonder whether values such as `0` and an empty string were intentionally treated alike.

## Use nullish coalescing for missing-value defaults

Use `??` when supplying a fallback for missing data. Do not use `||` for value defaulting; reserve it for boolean logic.

```ts
const displayName = suppliedName ?? "Anonymous";
```

**Reason:** Nullish coalescing states that only `null` or `undefined` is missing and preserves intentional values such as an empty string, zero, and `false`.

## Name every non-pass-through React handler

JSX may pass through an existing callback directly. Any handler that creates behavior—by adapting arguments, branching, sequencing work, or invoking a domain operation—must be a descriptively named value outside the JSX.

```tsx
const handleSave = async (): Promise<void> => {
  const result = await saveProject(project);
  if (result instanceof ProjectError) return showError(result);

  navigateToProject(result.id);
};

return <Button onClick={handleSave}>Save</Button>;
```

**Reason:** Named handlers keep JSX focused on describing the interface and give behavior a searchable name that communicates the user action it implements.

## Give each stateful component exactly one component-specific hook

A component with behavior calls exactly one component-specific hook. That hook owns all state, context access, derived values, effects, and handlers and returns the complete model needed by the JSX. A purely presentational component calls no hooks. Do not place behavioral logic or derived-value calculations in the component body.

```tsx
const ProjectEditor: FC<ProjectEditorProps> = (props) => {
  const projectEditor = useProjectEditor(props);

  return (
    <Form onSubmit={projectEditor.handleSubmit}>
      <TextField
        value={projectEditor.name}
        onChange={projectEditor.handleNameChange}
      />
      <Button disabled={projectEditor.isSaveDisabled}>Save</Button>
    </Form>
  );
};
```

**Reason:** A single hook creates a clear boundary between behavior and presentation. The component becomes a direct description of the rendered interface, while related state and behavior remain cohesive and independently testable.

## Render component states with guard returns

Use early returns for mutually exclusive component-level states such as loading, failure, and success. Do not select whole render states with a ternary. A small optional fragment may use `&&` when its explicit boolean condition directly controls that fragment's presence.

```tsx
const ProjectPage: FC<ProjectPageProps> = (props) => {
  const projectPage = useProjectPage(props);

  if (projectPage.status === "loading") return <LoadingPage />;
  if (projectPage.status === "failure") {
    return <ErrorPage error={projectPage.error} />;
  }

  return <ProjectDetails project={projectPage.project} />;
};
```

**Reason:** Guard returns make each complete visual state independently visible and keep the primary state flat, while a direct optional fragment remains a concise description of presence.

## Return a named model object from component-specific hooks

Every component-specific hook returns an object with a named model type and domain-specific fields. Do not return a positional tuple. Tuples remain acceptable for tiny general-purpose hooks that implement a conventional pair such as `[value, setValue]`.

```ts
const useProjectEditor = (props: ProjectEditorProps): ProjectEditorModel => {
  // ...
  return { name, isSaveDisabled, handleNameChange, handleSubmit };
};
```

**Reason:** Named fields explain each value at the use site and let the hook evolve without making consumers track or update positional meanings.

## Memoize React code only for demonstrated reasons

Do not add `useMemo`, `useCallback`, or `memo` speculatively. Use memoization only when profiling demonstrates a meaningful problem or an external API requires referential stability. Keep the optimization inside the component-specific hook or a descriptive abstraction, and document an otherwise non-evident reason.

```ts
const visibleProjects = projects.filter((project) => project.isVisible);
```

**Reason:** Memoization adds dependencies, identity concerns, and stale-value risks. Direct calculations are easier to read and should remain the default when understandability takes priority over unmeasured performance.

## Prefer named exports

Use named exports wherever the surrounding framework permits them. Use a default export only when a framework requires one.

```ts
export const ProjectCard: FC<ProjectCardProps> = (props) => {
  // ...
};
```

**Reason:** Named exports keep identifiers consistent between their definitions and imports, which makes references easier to search, navigate, and refactor safely.

## Import internal dependencies from their defining modules

Within a package, import a value directly from the module that defines it rather than through a barrel file. Across package boundaries, import from the package's deliberate public entry point.

```ts
import { ProjectCard } from "@/projects/components/ProjectCard";
```

**Reason:** Direct internal imports reveal ownership and keep the dependency graph visible, while explicit package entry points preserve a controlled public API between independently owned units.

## Use literal unions instead of enums

Do not declare TypeScript enums. Represent a closed set with a literal union. Add an `as const` object only when runtime access to named values is genuinely useful.

```ts
type ProjectStatus = "draft" | "active" | "archived";
```

**Reason:** Literal unions work directly as discriminants, preserve exact serializable values, and avoid the additional runtime and type semantics of enums.

## Use type aliases for object shapes

Use `type` aliases for object shapes as well as unions, functions, and composed types. Use an `interface` only at a boundary where a third-party API requires declaration or module augmentation.

```ts
type ProjectCardProps = {
  readonly project: Project;
  readonly onSelect: (projectId: ProjectId) => void;
};
```

**Reason:** One type-definition syntax removes an arbitrary choice, composes consistently with unions, and avoids application contracts being silently changed through declaration merging.

## Declare data as recursively readonly

Mark every data-model property and collection readonly, and compose nested models that are themselves readonly. Mutable types may exist only inside isolated adapters where an external API requires mutation.

```ts
type Project = {
  readonly id: ProjectId;
  readonly name: string;
  readonly members: readonly ProjectMember[];
};
```

**Reason:** Readonly types prevent mutation through this contract and tell readers that consumers must treat the value as immutable. They do not claim that another mutable alias cannot change the underlying object.

## Brand confusable domain primitives

Use branded types when values share a primitive representation but are not semantically interchangeable, especially domain identifiers. Construct branded values through validated boundary functions rather than unchecked assertions in application code.

```ts
type ProjectId = string & { readonly __brand: "ProjectId" };
type WorkspaceId = string & { readonly __brand: "WorkspaceId" };

const moveProject = (
  projectId: ProjectId,
  workspaceId: WorkspaceId,
): Promise<Project | ProjectError> => {
  // ...
};
```

**Reason:** Branding lets the compiler reject arguments that have the correct primitive representation but the wrong domain meaning.

## Validate every untrusted boundary

Receive network responses, storage values, URL parameters, environment variables, form payloads, and third-party messages as `unknown`. Validate and convert them into readonly domain types in a boundary adapter before they enter application code.

```ts
const parseProjectResponse = (input: unknown): Project | ProjectError => {
  return tryCatch(() => ProjectSchema.parse(input));
};
```

**Reason:** Static types do not verify runtime data. One validated boundary lets downstream code rely on its types without scattering defensive checks throughout the application.

## Prefer readonly data and functions over classes

Model application and domain concepts as readonly data transformed by functions. Use classes only when class identity or inheritance is intrinsic to a required API, especially the project's error hierarchy, or when an external framework boundary requires one. Do not use mutable domain or service classes.

```ts
type Project = {
  readonly id: ProjectId;
  readonly status: ProjectStatus;
};

const archiveProject = (project: Project): Project => {
  return { ...project, status: "archived" };
};
```

**Reason:** Plain data exposes all state, and pure transformations make inputs and outputs explicit. Classes can hide mutable state and couple data to an expanding set of behaviors.

## Inject effectful capabilities at composition roots

Operations that use time, randomness, network access, persistence, analytics, or another external effect receive those capabilities through a dependency factory. Assemble concrete dependencies once at a composition root; ordinary callers use the assembled operation without passing dependencies repeatedly. Import pure helpers, schemas, types, and constants directly.

```ts
type CreateProjectDependencies = {
  readonly getCurrentTime: () => Date;
  readonly saveProject: (
    draft: ProjectDraft,
  ) => Promise<Project | ProjectError>;
};

const createCreateProject = (dependencies: CreateProjectDependencies) => {
  return async (name: string): Promise<Project | ProjectError> => {
    const draft = createProjectDraft(name, dependencies.getCurrentTime());
    return dependencies.saveProject(draft);
  };
};
```

**Reason:** Effectful capabilities are hidden inputs and outputs. Injection makes them visible where an operation is defined and replaceable at one architectural boundary without cluttering normal call sites.

## Do not use `forEach`

Use `map`, `filter`, or another dedicated transformation for direct value transformations. Use `for...of` when intentionally sequencing effects or constructing a fresh, unaliased accumulator inside a focused helper. Do not use `forEach`, including with asynchronous callbacks.

```ts
const projectNames = projects.map((project) => project.name);

for (const project of projects) {
  await archiveProject(project.id);
}
```

**Reason:** The iteration form should reveal whether code directly transforms data, constructs a result, or performs effects. `forEach` discards callback results and misleadingly accepts async callbacks without awaiting them.

## Distinguish unknown, known-empty, and omitted values

Use `undefined` when information was not provided, is not yet known, or is not initialized. Use `null` when it is known that no value exists. Use an optional property only when callers may omit that property; use a required `T | undefined` property when callers must explicitly provide the field even though its value may be unknown.

```ts
type User = {
  readonly middleName: string | null | undefined;
};

type UpdateUserInput = {
  readonly middleName?: string | null;
};
```

Here `undefined` means the middle name has not been obtained, `null` means the user has no middle name, and omission from `UpdateUserInput` means “do not update this field.”

**Reason:** These states carry different domain information. Preserving the distinction prevents missing knowledge, known absence, and omitted instructions from being silently treated as the same case.

## Name constants by semantic meaning

Do not leave magic numbers or other unexplained policy literals in code. Extract a value when its name explains why that value is used, even if it appears only once, and name constants in `SCREAMING_SNAKE_CASE`. Equal literals with different meanings must remain separate constants. A disposable literal may stay inline when a named argument completely explains it and there is no additional domain meaning.

```ts
const QUEUE_BACK_OFF_SECONDS = 30;

scheduleRetry({ numberOfSeconds: QUEUE_BACK_OFF_SECONDS });
```

This is also acceptable when `30` has no meaning beyond the argument itself:

```ts
advanceClock({ numberOfSeconds: 30 });
```

**Reason:** A semantic constant records the policy behind a value rather than merely replacing its spelling. Keeping unrelated meanings separate prevents accidental coupling when one policy changes.

## Prefix boolean names by their meaning

Name boolean values and boolean-returning predicates with a semantic prefix such as `is`, `has`, `can`, or `should`. Do not require role prefixes for handlers or callback props; give those a descriptive domain name.

```ts
const isProjectArchived = project.status === "archived";
const hasBillingAccess = permissions.includes("billing:read");
const canCurrentUserEdit = permissions.includes("project:edit");
```

**Reason:** A predicate prefix makes the value's boolean nature and the kind of question it answers visible wherever the name is used.

## Pass JSX props explicitly

List application-component props explicitly at the call site rather than spreading an object. Prop spreading is allowed only inside a low-level pass-through primitive whose explicit purpose is forwarding a narrowly typed set of native attributes.

```tsx
<Button disabled={isSaving} onClick={saveProject} variant="primary">
  Save
</Button>
```

**Reason:** Explicit props expose a component's inputs where it is used and prevent unrelated or newly added object fields from silently becoming part of the call.

## Declare components and hooks at module scope

Do not define a React component or hook inside another function. Declare it at module scope and pass every required value through explicit props or hook inputs.

```tsx
const ProjectName: FC<ProjectNameProps> = ({ name }) => {
  return <span>{name}</span>;
};

const ProjectCard: FC<ProjectCardProps> = (props) => {
  const projectCard = useProjectCard(props);
  return <ProjectName name={projectCard.name} />;
};
```

**Reason:** Module-scope declarations give each concept a stable identity and visible dependencies. Nested component declarations recreate component identity during rendering and conceal a separate abstraction inside another function.

## Separate each component and its hook in a grouped folder

Give each component a folder containing one component file and, when behavior is needed, one component-specific hook file. Name them `ComponentName.tsx` and `ComponentName.hook.ts`. Keep private supporting modules in the same folder.

```text
ProjectEditor/
  ProjectEditor.tsx
  ProjectEditor.hook.ts
```

**Reason:** The folder keeps one component's related implementation together, while separate files preserve a visible boundary between presentation and behavior.

## Return errors; do not throw in application flow

Return project error instances directly for domain and application failures. Never use exceptions as application control flow. Immediately wrap calls to external or legacy APIs that may throw or reject with `tryCatch`, which converts every failure into the project error hierarchy. The `throw` syntax may appear only inside a low-level adapter or helper when a required API cannot be implemented otherwise.

```ts
const validateProjectName = (name: string): ValidProjectName | ProjectError => {
  if (name.length === 0) return new ProjectNameRequiredError();
  return createValidProjectName(name);
};
```

**Reason:** Returning failures keeps them visible in function contracts and makes every path use ordinary typed control flow. Immediate boundary conversion prevents hidden exception paths from bypassing the project's error model.

## Check every indexed collection access

Treat array, tuple, and record lookup results as possibly `undefined` unless the type system proves that the key exists. Handle the missing case explicitly without a non-null assertion.

```ts
const firstProject = projects.at(0);
if (firstProject === undefined) return new ProjectListEmptyError();

return openProject(firstProject);
```

**Reason:** Runtime collections do not guarantee that an index or key exists. Making absence part of the type prevents distant failures caused by an unchecked lookup assumption.

## Use records for value mappings and switches for behavior

Map a closed union directly to values with a readonly exhaustive record. Use an exhaustive `switch` when variants require different behavior or access to variant-specific fields. Do not hide behavior functions in a lookup table.

```ts
const PROJECT_STATUS_LABELS = {
  draft: "Draft",
  active: "Active",
  archived: "Archived",
} as const satisfies Readonly<Record<ProjectStatus, string>>;

const label = PROJECT_STATUS_LABELS[project.status];
```

**Reason:** A record exposes a data mapping at a glance, while a switch exposes control flow. Exhaustive typing ensures both forms remain synchronized with the closed domain.

## Limit source files to 200 lines

Warn when a source file exceeds 150 lines and report an error when it exceeds 200 lines. Split the file by cohesive responsibility rather than moving arbitrary ranges of code.

```text
ProjectEditor/
  ProjectEditor.tsx
  ProjectEditor.hook.ts
  ProjectEditor.validation.ts
```

**Reason:** A bounded file can be understood without navigating a large collection of unrelated concepts. The warning leaves room to choose a meaningful extraction before size becomes a hard failure.

## Put semantic constants in a constants module

Declare `SCREAMING_SNAKE_CASE` semantic constants in a file ending with `.constants.ts`, including constants used by only one consumer. Keep unrelated constants in their owning feature or component area rather than creating a global dumping ground.

```ts
// ProjectQueue.constants.ts
export const QUEUE_BACK_OFF_SECONDS = 30;
```

**Reason:** A consistent suffix makes policy values easy to locate and keeps executable modules focused on behavior, while local ownership preserves the context behind each constant.

## Order functions from high-level behavior to low-level helpers

Place the module's public or organizing functions first. Put private helpers below them in the order they are first called, progressing from high-level workflow toward low-level detail.

```ts
export const submitProject = async (input: ProjectInput) => {
  const project = createProject(input);
  return saveProject(project);
};

const createProject = (input: ProjectInput): Project => {
  return normalizeProject(input);
};

const normalizeProject = (input: ProjectInput): Project => {
  // ...
};
```

**Reason:** Readers encounter intent before implementation and can continue downward only when they need more detail. Call order creates a predictable narrative through the module.

## Warn on deeply ascending relative imports

Warn when an import ascends three or more parent directories. Use the owning module's `@<module>` alias when crossing to a top-level area rather than navigating the repository with `../../../` paths.

```ts
import { Project } from "@projects/domain/Project";
```

**Reason:** A deeply ascending path obscures the dependency's ownership and is fragile under file moves. It often reveals that a module boundary or local organization needs attention.

## Name files after one primary concept

Give each source file one primary concept and match the filename to that concept. Use `PascalCase` for React components and classes, `camelCase` for functions and ordinary modules, and controlled role suffixes such as `.hook.ts`, `.constants.ts`, and `.schema.ts`. Do not create generic dumping-ground modules such as `utils.ts`, `helpers.ts`, `common.ts`, or `types.ts`.

```text
ProjectEditor/
  ProjectEditor.tsx
  ProjectEditor.hook.ts
  ProjectEditor.constants.ts

createProject.ts
parseProjectResponse.ts
ProjectError.ts
```

**Reason:** A concept-matched filename makes definitions predictable to locate and keeps modules cohesive. Controlled suffixes communicate a supporting module's role without replacing its domain name.

## Colocate owned types and isolate shared domain types

Keep a type in the file of the implementation that solely owns it, such as component props in the component file and a hook model in the hook file. Give a type its own concept-matched file when it is a shared domain concept. Do not create `.types.ts` collections or extract private types merely to reduce line count.

```text
ProjectEditor.tsx       # ProjectEditorProps
ProjectEditor.hook.ts   # ProjectEditorModel
Project.ts              # shared Project domain type
ProjectId.ts            # shared brand and validated constructor
```

**Reason:** Type placement follows conceptual ownership, so readers find a contract beside the code it explains while shared domain concepts remain directly discoverable without a miscellaneous type registry.

## Forbid circular dependencies

Keep file and package dependency graphs acyclic. If two modules depend on each other, extract the shared concept or reverse an effectful dependency through an injected capability rather than retaining the cycle.

```ts
// createProject.ts may import Project.ts.
// Project.ts must not import createProject.ts.
```

**Reason:** A cycle makes neither module independently understandable, obscures initialization order, and prevents the dependency direction from communicating ownership.

## Exempt generated files and prohibit manual edits

Identify generated source with project-specific globs. Exempt those files from human-organization rules such as file length and function order, and do not edit them manually. Keep handwritten boundary adapters fully subject to all rules.

```text
src/generated/**
```

**Reason:** Generated structure is controlled by its generator and will overwrite human changes. Applying understandability rules to the handwritten adapter preserves a clear, safe boundary without forcing generated artifacts into a human-oriented shape.

## Do not rename values through aliases

Do not declare or assign a variable solely to give an existing variable another name, and do not rename imports with `as`. Use the original name, or create a genuinely new value through a named transformation. Reassignment is also forbidden by the immutability rule. Renaming while destructuring an object property remains allowed because it extracts a value from a structural field rather than renaming an existing variable.

```ts
const normalizedProjectName = projectName.trim();
const { project: selectedProject } = response;
```

Avoid direct and import aliases:

```ts
const name = projectName;
name = projectName;
import { createProject as buildProject } from "./createProject";
```

**Reason:** Multiple names for the same binding force readers to track identity without adding information. A new variable should represent a computation or a structurally extracted field, not merely rename an existing variable.

## Use stable domain identities for React list keys

Key every rendered list item with an immutable identity that is unique among its siblings. Never use an array index, mutable display value, or randomly generated value as a key. Use a composite key only when the domain guarantees that the combination is stable and unique.

```tsx
const ProjectList: FC<ProjectListProps> = ({ projects }) => {
  return projects.map((project) => (
    <ProjectCard key={project.id} project={project} />
  ));
};
```

**Reason:** Stable keys let React preserve the correct component identity when items are inserted, removed, or reordered. Positional and mutable keys can transfer local state to the wrong item and cause avoidable remounts.

## Use functional state updates for prior-state calculations

When a React state update depends on its previous value, pass an updater function to the setter. Set an independent value directly when the previous state is irrelevant.

```tsx
const toggleProjectDetails = (): void => {
  setIsProjectDetailsOpen((wasProjectDetailsOpen) => !wasProjectDetailsOpen);
};

const closeProjectDetails = (): void => {
  setIsProjectDetailsOpen(false);
};
```

**Reason:** A functional updater receives the state React will actually update, avoiding stale closure bugs across batching and asynchronous work.

## Do not commit debugging or speculative code

Do not leave ad hoc debug output, commented-out code, unused scaffolding, or implementations included only for anticipated future use in production source. Required temporary behavior must be explicit, executable, and linked to a tracked reason. Structured operational logging and framework-required stubs remain allowed.

```ts
const loadLeaderboard = async (): Promise<Leaderboard | ProjectError> => {
  if (!isLeaderboardEnabled) {
    return new FeatureUnavailableError({ trackingIssue: "APP-123" });
  }

  return tryCatch(() => leaderboardRepository.load());
};
```

**Reason:** Inert and speculative code obscures current behavior, becomes stale without being exercised, and makes it unclear which paths are supported. Version control already preserves removed implementations.

## Pin executable third-party dependencies

Pin direct application and build dependencies to exact versions and commit the package manager's lockfile. Pin third-party CI actions and other remotely executed build inputs to immutable full commit SHAs, retaining a version comment for readability. A published library may use a deliberate supported range for peer dependencies.

```json
{
  "dependencies": {
    "zod": "4.0.5"
  }
}
```

```yaml
uses: vendor/action@49933ea5288caeca8642d1e84afbd3f7d6820020 # v4.4.0
```

**Reason:** Immutable dependency references make builds reproducible and prevent a moved tag or newly selected package version from silently changing executable code.

## Delay adoption of newly published dependencies

Require a minimum release age of 14 days before adopting a newly published dependency version. A documented, reviewed exception may bypass the delay for an urgent security fix.

```ini
minimum-release-age=14d
```

**Reason:** A quarantine period gives maintainers and security tooling time to identify compromised or malicious releases before they enter the build, while an explicit exception preserves the ability to patch an active vulnerability quickly.

## Apply least privilege to permissions and secrets

Grant external capabilities only the actions and resources required by the operation. Do not commit credentials or other secrets, including in example configuration or repository history; use a secret store or injected environment value. If a real secret is committed, rotate it immediately rather than assuming deletion makes it safe. Clearly non-secret placeholders remain acceptable.

```ts
const readProjectionPolicy = {
  actions: ["s3:GetObject"],
  resources: ["arn:aws:s3:::project-data/config/EPSG/*"],
} as const;
```

**Reason:** Narrow permissions limit the impact of mistakes and compromised code. Credentials remain recoverable from history and caches after deletion, so rotation is the dependable response to exposure.

## Prefer existing language and platform operations

Before implementing a custom helper, check the obvious language, platform, and already-installed dependency APIs for the operation. Prefer an existing operation when it expresses the behavior clearly and correctly. Do not add a dependency merely to replace a trivial, well-understood implementation.

```ts
const paddedHex = hex.padStart(expectedLength, "0");
```

**Reason:** Standard operations are recognizable, maintained, and commonly handle edge cases better than local reimplementations. Bounding the search to obvious existing capabilities avoids dependency growth and unproductive investigation.

## Use semantic design tokens for UI policy

Express application colors, spacing, typography, radii, shadows, and similar design policy through named semantic tokens rather than inline literals. Keep tokens with different semantic roles separate even when their current values are equal. A truly dynamic value may be inline when the styling API requires it.

```tsx
const styles = StyleSheet.create({
  screenContent: {
    padding: spacing.screen,
    backgroundColor: colors.surfacePrimary,
    borderRadius: radii.projectCard,
  },
});
```

**Reason:** Semantic tokens explain the design role of each value and allow one role to evolve without accidentally changing another that happened to share the same literal.

## Choose fallback policy at the highest informed level

Choose missing-data and failure fallbacks in the highest-level operation that understands their user or business consequence. Require lower-level helpers to receive the resolved value unless a default is intrinsic to the low-level API itself.

```ts
const createProjectMap = (project: Project): ProjectMap => {
  const projection = project.projection ?? DEFAULT_PROJECT_PROJECTION;
  return convertCoordinates(project.coordinates, projection);
};
```

**Reason:** A low-level fallback hides a product decision inside a technical operation and silently applies it to callers that may need different behavior. Keeping policy near orchestration makes the consequence visible and changeable.

## Omit redundant local type annotations

Let TypeScript infer local bindings, callback parameters, generic arguments, and private implementation details when it infers the intended type accurately. Add an annotation when it defines a boundary, prevents unwanted widening, or communicates a non-obvious constraint.

```tsx
const [isProjectSelected, setIsProjectSelected] = useState(false);
setIsProjectSelected((wasProjectSelected) => !wasProjectSelected);
```

**Reason:** Redundant annotations repeat compiler-known information and add noise that must remain synchronized. Intentional annotations remain valuable where they constrain or expose a contract.

## Remove pass-through abstractions

Do not add a variable, function, object wrapper, or indirection that merely forwards an existing value or call. An adapter is justified when it validates, transforms, adds policy, isolates an external dependency, or establishes a deliberate public boundary.

```ts
const parseProjectResponse = (input: unknown): Project | ProjectError => {
  return tryCatch(() => ProjectSchema.parse(input));
};
```

This adapter earns its name by validating an external value. A function that only calls `projectRepository.load(projectId)` with the same input and output should be removed unless it establishes a deliberate application boundary.

**Reason:** Pass-through layers make readers navigate additional names without adding meaning. Purposeful adapters earn that indirection by containing a real responsibility.

## What is a conditional statement?

---

A conditional statement allows an algorithm to execute different logical branches in a program flow according to the value of a predicate.

The typical example is the `if` control structure, here in TypeScript:

```tsx
if (42 === aNumber) {
  // 💡 The expression between the parenthesis is the predicate 💡
  // First logical branch is executed if the predicate is true, here it assigns a specific string
  description =
    "The answer to the Ultimate Question of Life, the Universe, and Everything";
} else {
  description = "Just a number"; // Second logical branch is executed otherwise, here it assigns another string
}
```

Here are common conditional statements: `switch`, `for`, `while`...

Here are common operators adding logical branches: `?`, `&&`, `||`, `??`...

## Why is it important to write clean conditionals?

---

Conditional statements inherently increase a program complexity: each branch is a potential trap which make developers write bugs.

A program can be written with a various number of branches. So, refactoring to a minimal number of branches:

- Makes the program logic easier to understand, _freeing cognitive workload for other tasks and accelerating code reviews_
- Decreases the number of cases to maintain, _thus reduce the risk to introduce a defect_

Find an example below of a program written in two different styles. Both programs are functionally identical but have different cognitive complexity.

```tsx
const isLeapYear = (year: number): boolean => {
  let result: boolean;

  if (year % 400 === 0) {
    result = true;
  } else if (year % 4 === 0) {
    if (year % 100 !== 0) {
      result = true;
    } else {
      result = false;
    }
  } else {
    result = false;
  }

  return result;
};
```

```tsx
const isDivisibleBy = (value: number, divisor: number): boolean =>
  value % divisor === 0;

const isLeapYear = (year: number): boolean => {
  if (isDivisibleBy(year, 400)) return true;
  if (isDivisibleBy(year, 100)) return false;
  return isDivisibleBy(year, 4);
};
```

<aside>
✅ Hence, a minimal number of branches and *expressive* conditional statements testify of good internal software quality.

</aside>

## Control points

---

<aside>
⚠️ As any piece of code, a conditional statement must be instantly understandable by anyone to prevent miscomprehension of a program behaviour. Some principles are a matter of preferences and others are hard to explain**.** It always depend on the current comprehension we have of the context. **None of these rules are absolute.

So apply the rules of this standard _wisely_.
Read the examples and build your _savviness_.
_Discuss_ ambiguous cases with your team.\*\*

Since there are many ways to write the same behaviour, focus on expressing an intention when deciding how to write a conditional. To improve a conditional statement, you should ask yourself: what kind of conditions will we have to add or remove later? How likely is this change? Does it perfectly reflect the real world logic?

</aside>

**Control points**

1. Return early
2. No detour
3. Reveal logic operators
4. Use pure functions predicates / name your prédicates
5. One path = One result
6. Polymorphism > switch > if
7. Use neutral element
8. Do not cast into a boolean implicitly

### Return early

<aside>
ℹ️ **Avoid the `else` keyword as much as you can, exit from conditional flow as soon as you can. Most of `else` blocks after a `return` statement are superfluous.**

</aside>

<aside>
🤔 **Why?**

A chain of `if`/`else`/`else if` leads to more conditions to keep in mind, especially in case of **deep nesting**. Reserving conditional blocks to "special cases" **emphasises the nominal case** and eases its evolution.

</aside>

<aside>
💡 There is an es-lint rule and a py-lint rule to prevent such pattern to happen.

</aside>

<aside>
🧪 **Example context**

Imagine a very simplistic router/controller. It has to make some security check then returns the right page. The default case returns a 404 page.

</aside>

<aside>
❌ **Bad**

</aside>

```tsx
if (token.hasExpired()) {
  return loginPageResponse();
} else if (!hasAccess(token)) {
  return accessDeniedResponse();
} else {
  if (router.match("/") {
    return homepageResponse();
  } else if (router.match("/profile") {
	  return showProfileResponse();
  } else {
		return show404Response();
	}
}
```

<aside>
✅  **Good**

</aside>

```tsx
if (token.hasExpired()) {
  return loginPageResponse();
}

if (!hasAccess(token)) {
  return accessDeniedResponse();
}

if (router.match("/") {
  return homepageResponse();
}

if (router.match("/profile") {
  return showProfileResponse();
}

return show404Response();
```

---

### No detour

<aside>
ℹ️ **Don't use intermediary variable or control flag to keep a result for later, use it now.**

</aside>

<aside>
🤔 **Why?**

Not applying this rule would make your flow rely on **statefulness**/**side-effect**.
**Stopping the flow** instead of accumulating code executions prevent from unwanted behaviours during a change.

</aside>

<aside>
🧪 **Examples context**

Both examples are abstract. Focus on the `let` and `const` statements that disappear after refactoring.

</aside>

<aside>
❌ **Bad**

</aside>

```tsx
let hasToContinue = true;

while (hasToContinue) {
  displayMessage(messages.unshift());

  if (isEmpty(messages)) {
    hasToContinue = false;
  }

  // Someone could add buggy code here
}
```

<aside>
✅  **Good**

</aside>

```tsx
while (isNotEmpty(messages)) {
  displayMessage(messages.unshift());
}
```

<aside>
❌ **Bad**

</aside>

```tsx
let status: number;

if (isOk()) {
  status = 200;
}

status = 418;

return status;
```

<aside>
✅  **Good**

</aside>

```tsx
if (isOk()) {
  return 200;
}

return 418;
```

An alternative :

```tsx
return isOk() ? 200 : 418;
```

<aside>
❌ **Bad**

</aside>

```tsx
if (isEmpty(props.billingAddress)) {
  setBillingAddressSameAsShippingAddress(true);
} else {
  setBillingAddressSameAsShippingAddress(false);
}
```

<aside>
✅  **Good**

</aside>

```tsx
setBillingAddressSameAsShippingAddress(isEmpty(props.billingAddress));

// OR

const hasBillingAddress = isEmpty(props.billingAddress);
setBillingAddressSameAsShippingAddress(hasBillingAddress);
```

---

### Reveal logic operators

<aside>
ℹ️ **Don't hide simple logic operations as `||` or `&&` in nested `if` blocks, unless these `if` are accidental duplication.**

</aside>

<aside>
❌ **Bad**

</aside>

```tsx
if (a) {
  if (b) {
    pouet();
  }
}
```

<aside>
❌ **Bad**

</aside>

```tsx
if (a && b) {
  pouet();
}

if (a && c) {
  plop();
}
```

<aside>
✅  **Good**

</aside>

```tsx
if (a && b) { :warning: // never valid because you must respect the affect predicate princple
    pouet()
}

// if A and B have a good reason to be coupled
const isAAndB = a && b
if (isAAndB) {
  pouet()
}
```

<aside>
✅  **Good**

</aside>

```tsx
if (a) {
  if (b) {
    pouet();
  }
  if (c) {
    plop();
  }
}
```

---

### Name your predicates

<aside>
ℹ️ **Put logical computing in a variable or a pure functions returning boolean, instead of using anonymous logical operations**

</aside>

<aside>
🤔 **Why?**

Affecting predicates to a variable/function:

**•** Gives name to your predicates, **increasing code expressivity** (_i.e.,_ explicit developers intention, abstract real world logic better)
**•** Make your predicates **composables** (_i.e.,_ reusable with other predicates in an **expressive way**, \***\*reducing **duplication\*\* by design)

PS: Choosing between variable or function is only a matter of scope, it's not this standard topic

---

</aside>

<aside>
🧪 **Example context**

Imagine an e-commerce checkout where a user could have a discount according to a bunch of business logic rules

</aside>

<aside>
❌ **Bad**

</aside>

<aside>
✅  **Good**

</aside>

```tsx
if (
  user.premium === true ||
  basket.amount > 1000000 ||
  user.orders.length > 20
) {
  currentOrder.addDiscount(PREMIUM_DISCOUNT_RATE);
}
```

```tsx
const isEligibleForDiscount =
  user.premium === true || basket.amount > 1000000 || user.orders.length > 20;

if (isEligibleForDiscount) {
  currentOrder.addDiscount(PREMIUM_DISCOUNT_RATE);
}
```

---

### **One path = One result**

<aside>
ℹ️ **Don't make different branches return the same result**

</aside>

<aside>
🤔 **Why?**

**•** Extract logic duplicated in each branch after the branching logic
**•** Might be the right time to specify the true meaning of DRY here: we should extract the duplicated logic, not the duplicated lines of code

</aside>

<aside>
❌ **Bad**

</aside>

<aside>
✅  **Good**

</aside>

```tsx
if (a) {
  pouet();
}

if (c) {
  plop();
}

if (b) {
  pouet();
}
```

```tsx
if (a || b) {
  pouet();
}

if (c) {
  plop();
}
```

---

### **Polymorphism > switch > if**

<aside>
ℹ️ **An ensemble of predicates relying on the same unique property that categorise a type of knowledge, are preferably written thanks to polymorphism. The minimum is using a** `switch` **statement instead of a sequence of `if`**/**`else if`**/**`else`**.

</aside>

<aside>
💡 Polymorphism is a topic going far beyond this standard. Nevertheless, see this principle as a hook to a next level of coding.

</aside>

<aside>
🤔 **Why?

•** Adding/removing an instance of a structure properly decoupled from other similar structures is easier than manipulating branches and reduce risk of side-effects when modifying code.
**•\*\* A switch reduces cognitive complexity comparing to a if, because each case focus on the value of the predicate instead of having to read the whole predicate again

</aside>

<aside>
❌ **Bad**

</aside>

<aside>
✅  **Good**

</aside>

```tsx
if (food.type === VEGETABLE) {
  return steam(food);
} else if (food.type === PROTEIN) {
  return grill(food);
} else {
  return food;
}
```

```tsx
// With Switch
switch (food.type) {
  case VEGETABLE:
    return steam(food);
    break;
  case PROTEIN:
    return grill(food);
    break;
  default:
    return food;
    break;
}

// With polymorphism
return food.cook(); // The logic is inside each type of food
```

---

### Use neutral element

<aside>
ℹ️ **Do not check for data structure emptiness unless you have a behaviour that needs to be specifically implemented for that case**

</aside>

<aside>
🤔 **Why?

I\*\*f you need to compute a collection, make your computation work on an empty collection. If you need to display a specific view if your collection is empty, check the length of the collection explicitly `if(collection.length===0)`

</aside>

<aside>
❌ **Bad**

</aside>

<aside>
✅  **Good**

</aside>

```tsx
if (isEmpty(formFields)) {
  return [];
}

let validationReports = [];
for (i = 0; i > formFields.length; i++) {
  field = formFields[i];
  validationReports.push(field.validate());
}

return validationReports;
```

```tsx
let validationReports = [];
for (i = 0; i > formFields.length; i++) {
  field = formFields[i];
  validationReports.push(field.validate());
}

return validationReports;
```

---

### **Do not cast into a boolean**

<aside>
🤔 **Why?

•** Casting in Boolean (implicitly or explicitly) **hide the developer intention**. If casting in Boolean is really what you have to do, write a **comment to explain why\*\*
**•** Values "truthnyness/falsyness" are **not consistent across languages/runtimes**, leading to unwanted results, hence to bugs

</aside>

<aside>
❌ **Bad**

</aside>

```tsx
if (myArray) {
  // No idea which case we are trying to catch
  return doStuff();
}
```

<aside>
✅  **Good**

</aside>

```tsx
if (myArray.length > 0) {
} // if you meant emptyness (but in most cases you should not)
if (myArray !== null) {
} // yes
if (myArray !== undefined) {
} // undefined is bad
```
