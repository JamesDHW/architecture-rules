export type CliArgs =
  | { readonly kind: "help" }
  | { readonly kind: "error"; readonly message: string }
  | { readonly kind: "run"; readonly target: string; readonly fix: boolean; readonly config?: string; readonly explain?: string };

export const parseArgs = (argv: readonly string[]): CliArgs => {
  if (argv.includes("--help") || argv.includes("-h")) return { kind: "help" };
  const positionals: string[] = [];
  let fix = false;
  let config: string | undefined;
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    if (arg === "--fix") { fix = true; continue; }
    if (arg === "--config") {
      const path = argv[++index];
      if (path === undefined || path.startsWith("-")) return { kind: "error", message: "--config requires a path" };
      if (config !== undefined) return { kind: "error", message: "--config may be specified only once" };
      config = path;
      continue;
    }
    if (arg?.startsWith("-")) return { kind: "error", message: `Unknown option: ${arg}` };
    if (arg !== undefined) positionals.push(arg);
  }
  if (positionals[0] === "explain") {
    if (positionals.length !== 2 || fix) return { kind: "error", message: "Usage: architecture-check explain <file> [--config path]" };
    return { kind: "run", target: ".", fix: false, explain: positionals[1]!, ...(config === undefined ? {} : { config }) };
  }
  if (positionals.length > 1) return { kind: "error", message: "Expected at most one path argument." };
  return { kind: "run", target: positionals[0] ?? ".", fix, ...(config === undefined ? {} : { config }) };
};
