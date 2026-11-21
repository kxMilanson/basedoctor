import { describe, it, expect, beforeEach } from "vitest";
import { encryptToken, decryptToken, maskToken } from "./crypto";

describe("Crypto Module (AES-256-GCM)", () => {
  beforeEach(() => {
    process.env.ENCRYPTION_KEY =
      "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
  });

  it("szyfruje i poprawnie odszyfrowuje token API", () => {
    const rawToken = "12345-abcdef-67890-xyz";
    const encrypted = encryptToken(rawToken);

    expect(encrypted.ciphertext).toBeDefined();
    expect(encrypted.iv).toBeDefined();
    expect(encrypted.tag).toBeDefined();
    expect(encrypted.ciphertext).not.toEqual(rawToken);

    const decrypted = decryptToken(encrypted);
    expect(decrypted).toEqual(rawToken);
  });

  it("odrzuca zmanipulowany ciphertext lub tag (ochrona przed tamperingiem)", () => {
    const rawToken = "secret-token-value";
    const encrypted = encryptToken(rawToken);

    // Tamper with tag
    const tamperedTag =
      encrypted.tag.slice(0, -2) + (encrypted.tag.endsWith("0") ? "1" : "0");

    expect(() =>
      decryptToken({
        ...encrypted,
        tag: tamperedTag,
      })
    ).toThrow();
  });

  it("prawidłowo maskuje token dla interfejsu użytkownika", () => {
    expect(maskToken("1234567890abcdef")).toEqual("1234••••••••cdef");
    expect(maskToken("short")).toEqual("********");
    expect(maskToken("")).toEqual("");
  });
});
