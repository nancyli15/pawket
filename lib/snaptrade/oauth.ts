// Talks to SnapTrade's sign-in server (OAuth 2.0 + OpenID Connect).
import crypto from "node:crypto";
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import { ISSUER, requireEnv } from "./config";

// SnapTrade's sign-in addresses, read from its public "discovery" documents
type Metadata = {
  issuer: string;
  authorization_endpoint: string; // where the user logs in
  token_endpoint: string; // where the code is swapped for tokens
  jwks_uri: string; // SnapTrade's public keys, for checking id_token signatures
};

// What SnapTrade sends back from the token endpoint
export type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number; // seconds
  id_token?: string; // signed "who you are"
};

async function fetchJson(url: string): Promise<Record<string, unknown>> {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Discovery failed: ${res.status} ${url}`);
  return (await res.json()) as Record<string, unknown>;
}

// Fetched once, then reused. Retries on the next call if it failed.
let metadataPromise: Promise<Metadata> | null = null;
export function getMetadata(): Promise<Metadata> {
  if (!metadataPromise) {
    metadataPromise = Promise.all([
      fetchJson(`${ISSUER}/.well-known/openid-configuration`),
      fetchJson(`${ISSUER}/.well-known/oauth-authorization-server`),
    ])
      .then(([oidc, oauth]) => ({ ...oauth, ...oidc }) as unknown as Metadata)
      .catch((error) => {
        metadataPromise = null;
        throw error;
      });
  }
  return metadataPromise;
}

// SnapTrade's public keys; jose downloads and caches them
let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;
async function getJwks() {
  if (!jwks) jwks = createRemoteJWKSet(new URL((await getMetadata()).jwks_uri));
  return jwks;
}

// Unguessable random text, for state, nonce and the PKCE verifier
export function randomToken(bytes: number): string {
  return crypto.randomBytes(bytes).toString("base64url");
}

// PKCE: SnapTrade gets this hash now; we prove we hold the original at the swap
export function codeChallenge(verifier: string): string {
  return crypto.createHash("sha256").update(verifier).digest("base64url");
}

// Proves to SnapTrade that this request comes from Pawket: "Basic " + base64("id:secret")
function clientAuthHeader(): string {
  const id = requireEnv("SNAPTRADE_CLIENT_ID");
  const secret = requireEnv("SNAPTRADE_CLIENT_SECRET");
  return `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`;
}

// Swaps a code (or a refresh token) for tokens. Never logs token values.
export async function tokenRequest(fields: Record<string, string>): Promise<TokenResponse> {
  const { token_endpoint } = await getMetadata();
  const res = await fetch(token_endpoint, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: clientAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded", // OAuth wants form fields, not JSON
    },
    body: new URLSearchParams(fields),
    cache: "no-store",
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(`Token request failed: ${res.status} ${body.error ?? "unknown_error"}`);
  }
  return (await res.json()) as TokenResponse;
}

// Checks the id_token is genuine, fresh, for Pawket and for this login. Returns who you are.
export async function verifyIdToken(idToken: string, expectedNonce: string): Promise<JWTPayload> {
  const metadata = await getMetadata();
  const { payload } = await jwtVerify(idToken, await getJwks(), {
    issuer: metadata.issuer,
    audience: requireEnv("SNAPTRADE_CLIENT_ID"),
    algorithms: ["RS256"],
    maxTokenAge: "10m",
  });
  if (payload.nonce !== expectedNonce) throw new Error("ID token nonce mismatch");
  if (!payload.sub) throw new Error("ID token missing sub");
  return payload;
}
