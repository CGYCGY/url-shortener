import { describe, expect, it } from "vitest";
import {
  generateSlug,
  isReservedSlug,
  isValidSlugFormat,
  RESERVED_SLUGS,
  SLUG_LENGTH,
} from "./slug";

describe("generateSlug", () => {
  it("returns a slug of the configured length", () => {
    expect(generateSlug()).toHaveLength(SLUG_LENGTH);
  });

  it("uses only base62 characters", () => {
    const charset = /^[0-9A-Za-z]+$/;
    for (let i = 0; i < 100; i++) {
      expect(generateSlug()).toMatch(charset);
    }
  });

  it("does not produce obvious duplicates across many samples", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 1000; i++) {
      seen.add(generateSlug());
    }
    expect(seen.size).toBeGreaterThan(990);
  });
});

describe("isValidSlugFormat", () => {
  it.each([
    ["abc", true],
    ["aB3xK7", true],
    ["my-talk", true],
    ["my_talk", true],
    ["a".repeat(64), true],
    ["ab", false],
    ["", false],
    ["a".repeat(65), false],
    ["has space", false],
    ["has.dot", false],
    ["has/slash", false],
    ["has?query", false],
    ["café", false],
  ])("isValidSlugFormat(%j) === %s", (input, expected) => {
    expect(isValidSlugFormat(input)).toBe(expected);
  });
});

describe("isReservedSlug", () => {
  it("flags every reserved slug exactly", () => {
    for (const slug of RESERVED_SLUGS) {
      expect(isReservedSlug(slug)).toBe(true);
    }
  });

  it("does not flag non-reserved slugs", () => {
    expect(isReservedSlug("not-reserved")).toBe(false);
    expect(isReservedSlug("Dashboard")).toBe(false);
    expect(isReservedSlug("LOGIN")).toBe(false);
  });
});
