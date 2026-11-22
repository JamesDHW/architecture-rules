import { describe, expect, it } from "vitest";

import { headMatch, phraseMatches, wordsOf, type Phrase } from "../src/core/identifierWords.js";

const phrases: readonly Phrase<string>[] = [
  { words: ["client"], meaning: "client" },
  { words: ["api", "client"], meaning: "api client" },
  { words: ["line", "item"], meaning: "line item" },
  { words: ["category"], meaning: "category" },
];

const meanings = (name: string): readonly string[] => phraseMatches(wordsOf(name), phrases).map((match) => match.phrase.meaning);

describe("wordsOf", () => {
  it("splits every case style into lower-case words", () => {
    expect(wordsOf("customerId")).toEqual(["customer", "id"]);
    expect(wordsOf("HTTPClient")).toEqual(["http", "client"]);
    expect(wordsOf("LINE_ITEMS")).toEqual(["line", "items"]);
    expect(wordsOf("customer-list")).toEqual(["customer", "list"]);
    expect(wordsOf("base64Url")).toEqual(["base64", "url"]);
  });
});

describe("phraseMatches", () => {
  it("finds phrases in any position, singular or plural", () => {
    expect(meanings("getClients")).toEqual(["client"]);
    expect(meanings("lineItemsByCategories")).toEqual(["line item", "category"]);
  });

  it("lets a longer phrase own its words", () => {
    expect(meanings("apiClient")).toEqual(["api client"]);
    expect(meanings("clientApi")).toEqual(["client"]);
  });

  it("does not read part of a word as a word", () => {
    expect(meanings("clientele")).toEqual([]);
  });
});

describe("headMatch", () => {
  const head = (name: string): string | undefined => headMatch(wordsOf(name), phrases)?.phrase.meaning;

  it("reads the last word of a compound as what the name names", () => {
    expect(head("activeClients")).toBe("client");
    expect(head("clientOrders")).toBeUndefined();
    expect(head("clientId")).toBeUndefined();
  });

  it("skips a trailing by clause", () => {
    expect(head("clientsById")).toBe("client");
  });
});
