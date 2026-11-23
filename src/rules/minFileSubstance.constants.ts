export type MinFileSubstanceOptions = {
  readonly maxStatements: number;
  readonly maxLines: number;
  readonly ignore: readonly string[];
};

export const FILE_SUBSTANCE_OPTIONS = {
  maxStatements: 3,
  maxLines: 10,
  ignore: ["**/*.constants.ts", "**/*.state.ts"],
} as const satisfies MinFileSubstanceOptions;
