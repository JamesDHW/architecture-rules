export type MaxFunctionLinesOptions = {
  readonly max: number;
  readonly skipBlankLines: boolean;
  readonly skipComments: boolean;
};

export const FUNCTION_WARN_OPTIONS = {
  max: 40,
  skipBlankLines: true,
  skipComments: true,
} as const satisfies MaxFunctionLinesOptions;

export const FUNCTION_ERROR_OPTIONS = {
  max: 80,
  skipBlankLines: true,
  skipComments: true,
  IIFEs: false,
} as const satisfies MaxFunctionLinesOptions & { readonly IIFEs: boolean };
