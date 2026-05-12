import { describe, expect, it } from "vitest";
import { isValidDestinationUrl } from "./url";

describe("isValidDestinationUrl", () => {
  it.each([
    "https://example.com",
    "http://example.com",
    "https://example.com/path?q=1#frag",
    "https://sub.example.com:8080/a/b",
    "http://localhost:3000",
  ])("accepts %s", (input) => {
    expect(isValidDestinationUrl(input)).toBe(true);
  });

  it.each([
    "javascript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "ftp://example.com",
    "mailto:alice@example.com",
    "file:///etc/passwd",
    "//example.com",
    "example.com",
    "",
    "not a url",
  ])("rejects %s", (input) => {
    expect(isValidDestinationUrl(input)).toBe(false);
  });
});
