import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // Standard 96-bit IV for AES-GCM

/**
 * Returns a 32-byte Buffer from the ENCRYPTION_KEY environment variable.
 */
function getEncryptionKey(): Buffer {
  const secret = process.env.ENCRYPTION_KEY;
  if (!secret) {
    throw new Error(
      "Brak klucza szyfrowania ENCRYPTION_KEY w zmiennych środowiskowych."
    );
  }

  // If provided as a 64-character hex string (32 bytes)
  if (secret.length === 64 && /^[0-9a-fA-F]+$/.test(secret)) {
    return Buffer.from(secret, "hex");
  }

  // If provided as raw string, hash it with SHA-256 to ensure exact 32-byte key
  return crypto.createHash("sha256").update(secret).digest();
}

export interface EncryptedData {
  ciphertext: string;
  iv: string;
  tag: string;
}

/**
 * Encrypts sensitive text using AES-256-GCM.
 */
export function encryptToken(plainText: string): EncryptedData {
  if (!plainText || typeof plainText !== "string") {
    throw new Error("Nieprawidłowy tekst do zaszyfrowania.");
  }

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag();

  return {
    ciphertext: encrypted,
    iv: iv.toString("hex"),
    tag: authTag.toString("hex"),
  };
}

/**
 * Decrypts AES-256-GCM ciphertext using IV and auth tag.
 */
export function decryptToken(encrypted: EncryptedData): string {
  if (!encrypted?.ciphertext || !encrypted?.iv || !encrypted?.tag) {
    throw new Error("Niekompletne dane szyfrowania do odszyfrowania tokenu.");
  }

  const key = getEncryptionKey();
  const iv = Buffer.from(encrypted.iv, "hex");
  const authTag = Buffer.from(encrypted.tag, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted.ciphertext, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * Safely masks a token for display in the UI (e.g. 123456...abcd)
 */
export function maskToken(token: string): string {
  if (!token) return "";
  if (token.length <= 8) return "********";
  const start = token.slice(0, 4);
  const end = token.slice(-4);
  return `${start}••••••••${end}`;
}
