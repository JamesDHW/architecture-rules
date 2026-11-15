<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Govern all local TypeScript program sources

`project-membership` · Structural check; lint comments cannot suppress it

TypeScript owns scope through files, include, exclude, inherited configuration, allowJs, imports and configured project references. Do not reinterpret compiler globs or filter program sources afterward. Excluded files imported by selected source are still program members, exactly as in TypeScript. Files outside every configured program are not checked; configuration and generated declarations inside a program must be classified like other source.
