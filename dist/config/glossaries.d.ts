import type { Glossary } from "./types.js";
import { type Checked } from "./validation.js";
/** The glossaries section: each glossary's terms, checked so no phrase has two meanings. */
export declare const glossaries: (value: unknown) => Checked<Readonly<Record<string, Glossary>>>;
/**
 * The glossaries a layer follows. Each must exist, and together they must not give one phrase two meanings: a layer
 * that follows two glossaries reads both vocabularies at once.
 */
type LayerIn = {
    readonly known: Readonly<Record<string, Glossary>>;
    readonly label: string;
};
export declare const layerGlossaries: (value: unknown, { known, label }: LayerIn) => Checked<readonly string[]>;
export {};
//# sourceMappingURL=glossaries.d.ts.map