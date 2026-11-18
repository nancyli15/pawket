// Settings for talking to SnapTrade.

export function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) throw new Error(`Missing environment variable ${name}`);
    return value;
}

// SnapTrade's sign-in server and data API share one address
export const ISSUER = "https://api.snaptrade.com"; 
export const API_BASE = "https://api.snaptrade.com"; 

// Read-only on purpose: no `trade` scope, so Pawket can never place orders
export const SCOPES = "openid email read"; // permissions allowed thus far

// Builds callback address. Where SnapTrade sends the user back. Must match the Dashboard's redirect URI exactly.
export function redirectUri(): string {
    return `${requireEnv("APP_URL").replace(/\/$/,"")}/oauth/snaptrade/callback`;
}