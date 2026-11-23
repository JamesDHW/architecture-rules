<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Limit directories to 30 source files

`max-directory-files` · Program check, with type information · error by default, with options `[{"max":30}]`

Warn when one directory holds more than 15 production source files, and report an error above 30. Group related files into subfolders named after the concept they share.

Small files are easy to read one at a time, but a flat folder of a hundred of them hides which belong together: screens next to primitives next to copy next to API calls. Folders are the cheapest way to show that grouping.

Only production source files of the checked programs count: files in development layers (tests, scripts, tool configuration), generated files and declaration files are left out, and files the compiler does not see, such as stylesheets, never count. The limit uses the layer of the directory's first file.

## What to write instead

Move files that share a concept into a subfolder named after it.

## When to make an exception

A line comment cannot cover a directory. When a flat folder is the framework's contract, set the layer's limit with a reason.

```ts
// architecture-disable-next-line max-directory-files -- <the concrete reason this line needs it>
```
