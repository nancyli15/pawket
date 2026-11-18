// Encrypts small bits of data for storing in cookies (AES-256-GCM).
import crypto from "node:crypto";
import { requireEnv } from "./config";

// After sign-in, the token is stored in an encrypted and tamper-proof cookie so the browser holds it but can't read or change it
function encryptionKey(): Buffer {
    return crypto.createHash("sha256").update(requireEnv("SESSION_SECRET")).digest();
}

// Returns "iv.tag.ciphertext", each part in base64url so it's safe inside a cookie
export function seal(data: unknown): string {
    const iv = crypto.randomBytes(12); // new every time, so the same data never encrpyts the same way twice
    const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey(), iv);
    const ciphertext = Buffer.concat([cipher.update(JSON.stringify(data), "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag(); // checksum: unsealing fails if one byte was changed
    return [iv, tag, ciphertext].map((part) => part.toString("base64url")).join(".");
}

// Reverses seal(), returns null for a missing, tampered or wrongly keyed cookie.
export function unseal<T>(value: string | undefined): T | null {
    if (!value) return null;
    try {
        const [iv, tag, ciphertext] = value.split(".").map((part) => Buffer.from(part, "base64url"));
        const decipher = crypto.createDecipheriv("aes-256-gcm", encryptionKey(), iv);
        decipher.setAuthTag(tag);
        const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
        return JSON.parse(plaintext.toString("utf8")) as T;
    }
    catch {
        return null; // treat as signed out
    }
}