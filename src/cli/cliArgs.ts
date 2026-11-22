import type { ChangeSource } from "../baseline/changedSet.js";
import type { ParseError } from "./parseOptions.js";

export type DescribeFormat = "text" | "json" | "mermaid";

/** How a check prints its findings; omitted on RunArgs for the default text output. */
export type OutputFormat = "json" | "report" | "agent";

export type GraphFormat = "text" | "json" | "mermaid" | "dot";

export type RunArgs = {
  readonly kind: "run";
  readonly target: string;
  readonly fix: boolean;
  readonly config?: string;
  /** A file to explain, or a rule id. */
  readonly explain?: string;
  readonly describe?: DescribeFormat;
  readonly format?: OutputFormat;
  /** Lint and report only these files; the whole project is still analyzed. */
  readonly files?: readonly string[];
  /** The change whose touched files must be clean of recorded debt. */
  readonly change?: ChangeSource;
  /** Never write; fail on a stale baseline and on growth without a reason. */
  readonly ci?: true;
  /** Write a Markdown summary of the check to this file. */
  readonly summary?: string;
  /** Report only files this many errors or fewer away from compliant. */
  readonly fixableIn?: number;
  /** check <layer>...: only findings these layers own, or with incoming, imports into them from other layers. */
  readonly layers?: readonly string[];
  readonly incoming?: true;
};

type ProjectArgs = { readonly target: string; readonly config?: string };

export type CliArgs =
  | { readonly kind: "help" }
  | ParseError
  | { readonly kind: "lsp" }
  | RunArgs
  | (ProjectArgs & { readonly kind: "status"; readonly json: boolean; readonly since?: string })
  | (ProjectArgs & { readonly kind: "graph"; readonly format: GraphFormat; readonly layer?: string })
  | (ProjectArgs & { readonly kind: "map"; readonly json: boolean })
  | { readonly kind: "rules"; readonly json: boolean }
  | (ProjectArgs & { readonly kind: "baseline"; readonly accept: boolean; readonly rules: readonly string[]; readonly reason?: string })
  | { readonly kind: "baseline-merge"; readonly ancestor: string; readonly current: string; readonly other: string }
  | (ProjectArgs & { readonly kind: "doctor" })
  | { readonly kind: "adopt"; readonly output: "prompt" | "agent-snippet" }
  | (ProjectArgs & { readonly kind: "fix"; readonly rule: string; readonly paths: readonly string[] });

