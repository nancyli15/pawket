// Calls SnapTrade's data API as the signed-in user, renewing the access token when needed.
import { API_BASE } from "./config";
import { tokenRequest } from "./oauth";
import { clearSession, getSession, saveSession, type Session } from "./session";

export class NotSignedInError extends Error {}

// Swaps the refresh token for a new access token, and saves it in the cookie
async function refresh(session: Session): Promise<Session> {
  try {
    const tokens = await tokenRequest({ grant_type: "refresh_token", refresh_token: session.refreshToken });
    const updated: Session = {
      ...session,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? session.refreshToken, // refresh tokens rotate: keep the new one
      expiresAt: Date.now() + tokens.expires_in * 1000,
    };
    await saveSession(updated);
    return updated;
  } catch {
    await clearSession();
    throw new NotSignedInError("Session expired");
  }
}

// Returns a get(path) function for this request, e.g. get("/accounts")
export async function snapTradeClient() {
  const saved = await getSession();
  if (!saved) throw new NotSignedInError("Not signed in");
  let session: Session = Date.now() > saved.expiresAt - 60_000 ? await refresh(saved) : saved; // renew a minute early

  const call = (s: Session, path: string) =>
    fetch(API_BASE + path, {
      headers: { Authorization: `Bearer ${s.accessToken}`, Accept: "application/json" },
      cache: "no-store",
    });

  return async function get(path: string): Promise<unknown> {
    let res = await call(session, path);
    if (res.status === 401) {
      // SnapTrade's rule: refresh once, retry once, then ask the user to sign in again
      session = await refresh(session);
      res = await call(session, path);
      if (res.status === 401) {
        await clearSession();
        throw new NotSignedInError("Still unauthorized after refreshing");
      }
    }
    if (!res.ok) throw new Error(`SnapTrade ${path} failed: ${res.status}`);
    return res.json();
  };
}
