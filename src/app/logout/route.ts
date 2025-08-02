import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session) {
    await supabase.auth.signOut();
  }
  return NextResponse.redirect(new URL("/login", request.url), {
    status: 302,
  });
}
