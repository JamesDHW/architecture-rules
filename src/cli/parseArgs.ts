export type CliArgs =
  | { readonly kind: "help" }
  | { readonly kind: "error"; readonly message: string }
  | { readonly kind: "run"; readonly target: string; readonly fix: boolean };

export const parseArgs = (argv: readonly string[]): CliArgs => {
  const flags = argv.filter((arg) => arg.startsWith("-"));
  const positionals = argv.filter((arg) => !arg.startsWith("-"));

  if (flags.includes("-h") || flags.includes("--help")) {
    return { kind: "help" };
  }

  const unknownFlag = flags.find((flag) => flag !== "--fix");
  if (unknownFlag !== undefined) {
    return { kind: "error", message: `Unknown option: ${unknownFlag}` };
  }

  if (positionals.length > 1) {
    return { kind: "error", message: "Expected at most one path argument." };
  }

  return {
    kind: "run",
    target: positionals[0] ?? ".",
    fix: flags.includes("--fix"),
  };
};
