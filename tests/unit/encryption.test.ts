// Spec: specs/market-development-tool/spec.md — Security Requirements
// Task: specs/market-development-tool/tasks.md — Task 2

import { encrypt, decrypt, encryptContactInfo, decryptContactInfo } from "@/lib/encryption";

describe("Encryption", () => {
  it("should encrypt and decrypt a string", () => {
    const original = "Hello, World!";
    const encrypted = encrypt(original);
    expect(encrypted).not.toBe(original);
    expect(encrypted).toContain(":");
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(original);
  });

  it("should encrypt and decrypt contact info", () => {
    const contactInfo = { phone: "02-1234-5678", email: "test@example.com" };
    const encrypted = encryptContactInfo(contactInfo);
    expect(typeof encrypted).toBe("string");
    const decrypted = decryptContactInfo(encrypted);
    expect(decrypted).toEqual(contactInfo);
  });

  it("should produce different ciphertexts for the same input", () => {
    const text = "test data";
    const enc1 = encrypt(text);
    const enc2 = encrypt(text);
    expect(enc1).not.toBe(enc2); // Different IVs
  });

  it("should handle unicode (Traditional Chinese)", () => {
    const text = "聯絡資訊：台北市信義區";
    const encrypted = encrypt(text);
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(text);
  });
});
