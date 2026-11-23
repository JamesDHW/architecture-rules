import { type Identifier, type SourceFile } from "typescript/unstable/ast";
/**
 * What a declared name names. Values (variables, parameters, properties) have a type that can agree or disagree with
 * the name; the rest are checked for their words only.
 */
type NameKind = "value" | "function" | "type" | "file";
/** A name the file declares, so the layer chose it: its text, what it names, and where. */
export type OwnedName = {
    readonly text: string;
    readonly kind: NameKind;
    /** The identifier, for asking its type; absent for the file name. */
    readonly node?: Identifier;
    /** 1-based; absent for the file name. */
    readonly line?: number;
    readonly column?: number;
    /** A top-level type, interface, class or enum declaration: where a glossary term's type can be declared. */
    readonly topLevelType?: boolean;
};
/** Every name the file declares, and the file's own name. */
export declare const ownedNames: (source: SourceFile) => readonly OwnedName[];
export {};
//# sourceMappingURL=names.d.ts.map