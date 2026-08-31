declare module "picomatch" {
  type Picomatch = {
    (glob: string): (input: string) => boolean;
    isMatch: (
      input: string,
      pattern: string,
      options?: { readonly dot?: boolean },
    ) => boolean;
  };

  const picomatch: Picomatch;
  export default picomatch;
}
