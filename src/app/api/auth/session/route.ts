import { logAuthEvent } from "@/lib/auth/diagnostics";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Check the cookie-backed server session before navigating away from sign-in.
// Never return tokens, account details or provider errors to the browser.
export async function GET() {
  try {
    const client = await createClient();
    const { data, error } = await client.auth.getUser();
    logAuthEvent("server-session.verify.result", { authenticated: !error && Boolean(data?.user), status: error?.status });
    return NextResponse.json({ authenticated: !error && Boolean(data?.user) }, {
      status: !error && data?.user ? 200 : 401,
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch {
    logAuthEvent("server-session.verify.unavailable", { status: 503 });
    return NextResponse.json({ authenticated: false }, {
      status: 503,
      headers: { "Cache-Control": "private, no-store" },
    });
  }
}
