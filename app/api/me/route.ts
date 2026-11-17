import { getSession } from "@/lib/snaptrade/session";
import { connection } from "next/server";

// GET /api/me: who's signed in, without revealing any token
export async function GET() {
    await connection();
    const session = await getSession();
    if (!session) return Response.json({ signedIn: false});
    return Response.json({ signedIn: true, userId: session.userId});
}