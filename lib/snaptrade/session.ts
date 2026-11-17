// Two encrypted cookies: one for the trip to SnapTrade and back, one for staying signed in.
import { cookies } from "next/headers";
import { seal, unseal } from "./seal";

// Pawket's own names so they don't clash with the ETF app's cookies on localhost
const LOGIN_COOKIE = "pawket_login";
const SESSION_COOKIE = "pawket_session";

// Random values that tie the return from SnapTrade to this login attempt 
export type LoginState = {
    state: string;
    nonce: string;
    codeVerifier: string;
};

// What Pawket remembers after sign-in
export type Session = {
    accessToken: string; // OAuth token from before, the pass for reading your data
    refreshToken: string; // gets a new accessToken when it expires
    expiresAt: number; // when accessToken expires, in milliseconds
    userId: string; // your SnapTrade user id, replaces "demo"
};

const COOKIE_OPTIONS = {
    httpOnly: true, // browser JavaScript can't read it
    secure: process.env.NODE_ENV === "production", // HTTPS-only once online
    sameSite: "lax" as const, // still sent when SnapTrade redirects back
    path: "/", // sent to every page of Pawket
}

// Saves the login attempt for 10 mins
export async function setLoginState(login: LoginState): Promise<void> {
    (await cookies()).set(LOGIN_COOKIE, seal(login), {...COOKIE_OPTIONS, maxAge: 10 * 60 });
}
// Read the login attempt and delete it so it can only be used once
export async function takeLoginState(): Promise<LoginState | null> {
    const store = await cookies();
    const login = unseal<LoginState>(store.get(LOGIN_COOKIE)?.value);
    store.delete(LOGIN_COOKIE);
    return login;
}
// Keep user signed in for 30 days
export async function saveSession(session: Session): Promise<void> {
    (await cookies()).set(SESSION_COOKIE, seal(session), {...COOKIE_OPTIONS, maxAge: 30*24*60*60 })
}

// Who's signed in, or null if nobody is
export async function getSession(): Promise<Session | null> {
  return unseal<Session>((await cookies()).get(SESSION_COOKIE)?.value);
}