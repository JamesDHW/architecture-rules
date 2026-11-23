<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Merge tiny files into their only importer

`min-file-substance` · Program check, with type information · warn by default, with options `[{"maxStatements":3,"maxLines":10,"ignore":["**/*.constants.ts","**/*.state.ts"]}]`

Warn about a production file so small that it is only a detour: at most 3 top-level statements and 10 lines of code besides its imports, imported by exactly one file, in the same folder. Move its contents into that file.

File-size limits push code into more files, and nothing pushes back. Every extra file is another name to learn and another hop when reading. A constant, type or helper with one nearby user usually reads best inside that user.

Entry files, generated files, declaration files and development layers are not checked. Files matching ignore are skipped: by default *.constants.ts and *.state.ts, because constants-module and no-captured-mutation ask for those files even when one file uses them.

## What to write instead

Move the file's contents into the one file that imports it, and delete the file.

## When to make an exception

The file is a deliberate seam, such as a port type another package will implement.

```ts
// architecture-disable-next-line min-file-substance -- <the concrete reason this line needs it>
```
