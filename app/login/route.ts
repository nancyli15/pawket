// Step 1 of sign-in: remember this attempt, then send the browser to SnapTrade's login page.
import { connection, NextResponse } from "next/server";
import { SCOPES, redirectUri, requireEnv } from "@/lib/snaptrade/config";
import { codeChallenge, getMetadata, randomToken } from "@/lib/snaptrade/oauth";
import { setLoginState } from "@/lib/snaptrade/session";

export async function GET(request: Request) {
  await connection();
  try {
    const state = randomToken(32);
    const nonce = randomToken(32);
    const codeVerifier = randomToken(64);
    await setLoginState({ state, nonce, codeVerifier });

    // SnapTrade's login page, with Pawket's request written into the address
    const url = new URL((await getMetadata()).authorization_endpoint);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("client_id", requireEnv("SNAPTRADE_CLIENT_ID"));
    url.searchParams.set("redirect_uri", redirectUri());
    url.searchParams.set("scope", SCOPES);
    url.searchParams.set("state", state);
    url.searchParams.set("nonce", nonce);
    url.searchParams.set("code_challenge", codeChallenge(codeVerifier));
    url.searchParams.set("code_challenge_method", "S256");
    return NextResponse.redirect(url);
  } catch (error) {
    console.error("Starting sign-in failed:", error instanceof Error ? error.message : "unknown");
    return NextResponse.redirect(new URL("/?error=sign_in_unavailable", request.url));
  }
}