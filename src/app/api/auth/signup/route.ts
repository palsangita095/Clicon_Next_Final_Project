import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ALLOWED_ROLES = ["customer", "admin"];

export async function POST(req: Request) {
  try {
    const { email, password, full_name, role, avatar_url } = await req.json();

    if (!email || !password || !full_name || !role) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!ALLOWED_ROLES.includes(role)) {
      return NextResponse.json(
        { success: false, message: "Invalid role" },
        { status: 400 }
      );
    }

    // Only an authenticated admin may create accounts through this endpoint.
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const callerSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const {
      data: { user: caller },
      error: callerError,
    } = await callerSupabase.auth.getUser(authHeader.replace("Bearer ", ""));

    if (callerError || !caller) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: callerProfile } = await callerSupabase
      .from("profiles")
      .select("role")
      .eq("id", caller.id)
      .maybeSingle();

    if (callerProfile?.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, role, avatar_url: avatar_url ?? null },
    });

    if (authError) {
      return NextResponse.json(
        { success: false, message: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { success: false, message: "Failed to create user" },
        { status: 500 }
      );
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert(
        {
          id: authData.user.id,
          email,
          full_name,
          role,
          avatar_url: avatar_url ?? null,
          is_active: true,
        },
        { onConflict: "id" }
      )
      .select("*")
      .single();

    if (profileError) {
      return NextResponse.json(
        { success: false, message: profileError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Account created successfully",
      data: profile,
    });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: err.message || "Signup failed" },
      { status: 500 }
    );
  }
}
