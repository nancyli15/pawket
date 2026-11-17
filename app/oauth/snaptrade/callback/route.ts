// Step 2 of sign-in: SnapTrade sneds the browser back here with ?code=...&state...
import { redirectUri } from "@/lib/snaptrade/config";
import { tokenRequest, verifyIdToken } from "@/lib/snaptrade/oauth";
import { saveSession, takeLoginState } from "@/lib/snaptrade/session";
import { connection, NextResponse } from "next/server";

export async function GET(request: Request) {
    await connection();
    const params = new URL(request.url).searchParams;
    const fail = (reason: string) => NextResponse.redirect(new URL (`/?error=${reason}`, request.url));
    
    // Must match the state saved when this login started (read once, then deleted)
    const login = await takeLoginState();
    if (!login || params.get("state") !== login.state) return fail("state_mismatch");
      if (params.get("error")) return fail("access_denied");
    const code = params.get("code");
    if (!code) return fail("missing_code");

    try {
        const tokens = await tokenRequest({
        grant_type: "authorization_code",
        code,
        code_verifier: login.codeVerifier,
        redirect_uri: redirectUri(),
        });
        if (!tokens.id_token || !tokens.refresh_token) return fail("incomplete_token_response");

        const claims = await verifyIdToken(tokens.id_token, login.nonce);
        await saveSession({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: Date.now() + tokens.expires_in * 1000,
        userId: String(claims.sub),
        });
        return NextResponse.redirect(new URL("/", request.url));
    } catch (error) {
        console.error("Sign-in callback failed:", error instanceof Error ? error.message : "unknown");
        return fail("sign_in_failed");
    }
}
