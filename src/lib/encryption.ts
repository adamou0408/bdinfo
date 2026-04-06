// Spec: specs/market-development-tool/spec.md — Security Requirements
// Task: specs/market-development-tool/tasks.md — Task 2

import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString("hex");

function getKey(): Buffer {
  return Buffer.from(KEY, "hex");
}

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

export function decrypt(encryptedText: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedText.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export function encryptContactInfo(contactInfo: Record<string, unknown>): string {
  return encrypt(JSON.stringify(contactInfo));
}

export function decryptContactInfo(encrypted: string): Record<string, unknown> {
  return JSON.parse(decrypt(encrypted));
}
