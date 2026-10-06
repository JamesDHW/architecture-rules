export type MaxFileLinesOptions = {
  readonly max: number;
  readonly skipBlankLines: boolean;
  readonly skipComments: boolean;
};

export const WARN_OPTIONS = {
  max: 150,
  skipBlankLines: true,
  skipComments: true,
} as const satisfies MaxFileLinesOptions;

export const ERROR_OPTIONS = {
  max: 200,
  skipBlankLines: true,
  skipComments: true,
} as const satisfies MaxFileLinesOptions;
