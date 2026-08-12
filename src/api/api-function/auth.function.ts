import { setCookie } from "cookies-next";
import {
  AuthResponse,
  LoginPayload,
  SignupPayload,
} from "@/types/interface/auth.interface";
import { supabase } from "@/lib/supabase.config";

const CUSTOMER_ROLE = "customer";
const SEVEN_DAYS = 60 * 60 * 24 * 7;

// ! signup function
export const signupFns = async (payload: SignupPayload) => {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        data: {
          full_name: payload.name,
          role: payload.role,
          avatar_url: payload.avatar_url ?? null,
        },
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error("Auth user not created");

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: payload.name,
        role: payload.role,
        avatar_url: payload.avatar_url ?? null,
      })
      .eq("id", authData.user.id)
      .select("*")
      .single();

    if (profileError) throw profileError;
    if (!profile) throw new Error("Profile update failed");

    // Customers auto-approve; every other role waits on a verification_requests row
    const isCustomer = profile.role === CUSTOMER_ROLE;

    return {
      success: true,
      pending: !isCustomer,
      message: isCustomer
        ? "Signup successful! You can now log in."
        : "Registration submitted. Waiting for admin approval.",
      data: profile,
    };
  } catch (error) {
    const err = error as Error;
    const message = err.message || "Signup failed";
    const lower = message.toLowerCase();
    const isRateLimited =
      lower.includes("rate limit exceeded") ||
      lower.includes("over_email_send_rate_limit") ||
      lower.includes("too many requests");

    return {
      success: false,
      message: isRateLimited
        ? "Too many signup emails were requested from this device recently. Please wait about an hour before trying again."
        : message,
    };
  }
};

// ! verification data fetch — unchanged signature, still your source of truth
export const fetchVerificationRequestByProfileId = async (
  profileId: string,
) => {
  const { data, error } = await supabase
    .from("verification_requests")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
};

// ! for the supabase & Google-O-auth
/* 
 * Shared gating pipeline: Supabase session -> profile fetch -> last_login
 * stamp -> is_active check -> driver/dispatcher verification gate -> cookies.
 * Used by both password login and Google login so the rules never diverge.
 */
const resolveLoginOutcome = async (
  userId: string,
  accessToken: string,
): Promise<AuthResponse> => {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (profileError) throw profileError;
  if (!profile) throw new Error("Profile not found");

  await supabase
    .from("profiles")
    .update({ last_login: new Date().toISOString() })
    .eq("id", userId);

  const accountStatus = profile.account_status || (profile.is_active === false ? "suspended" : "active");

  if (accountStatus === "banned") {
    return {
      success: false,
      pending: false,
      message: "Your account has been banned. Contact support.",
      data: profile,
    };
  }

  if (accountStatus === "suspended") {
    return {
      success: false,
      pending: false,
      message: "Your account has been suspended. Contact support.",
      data: profile,
    };
  }

  const rolesRequiringVerification = ["driver", "dispatcher"];

  if (!rolesRequiringVerification.includes(profile.role)) {
    setCookie("token", accessToken, { maxAge: SEVEN_DAYS });
    setCookie("role", profile.role, { maxAge: SEVEN_DAYS });
    setCookie("user", JSON.stringify(profile), { maxAge: SEVEN_DAYS });

    return {
      success: true,
      pending: false,
      message: "Login successful!",
      data: profile,
    };
  }

  const verification = await fetchVerificationRequestByProfileId(profile.id);

  if (!verification || verification.status === "pending") {
    return {
      success: true,
      pending: true,
      message: "Your account is waiting for admin approval.",
      data: profile,
      verification: verification ?? null,
    };
  }

  if (verification.status === "rejected") {
    return {
      success: false,
      pending: false,
      message: verification.remarks
        ? `Account rejected: ${verification.remarks}`
        : "Your verification request was rejected. Contact support.",
      data: profile,
      verification,
    };
  }

  // approved
  setCookie("token", accessToken, { maxAge: SEVEN_DAYS });
  setCookie("role", profile.role, { maxAge: SEVEN_DAYS });
  setCookie("user", JSON.stringify(profile), { maxAge: SEVEN_DAYS });

  return {
    success: true,
    pending: false,
    message: "Login successful!",
    data: profile,
    verification,
  };
};

// ! admin signup — used as fallback when normal signup fails (e.g. deleted user re-registration)
export const adminSignupFns = async (payload: SignupPayload) => {
  try {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: payload.email,
        password: payload.password,
        full_name: payload.name,
        role: payload.role,
        avatar_url: payload.avatar_url ?? null,
      }),
    });

    const data = await res.json();

    if (!data.success) {
      return {
        success: false,
        message: data.message || "Signup failed via admin API",
      };
    }

    // ! The service-role API creates the user without a client session. Sign
    // ! in right away so the cart / wishlist / compare tables (RLS keyed on
    // ! auth.uid()) are usable immediately for this account.
    try {
      await supabase.auth.signInWithPassword({
        email: payload.email,
        password: payload.password,
      });
    } catch (signInError) {
      console.error("Admin signup: session establishment failed", signInError);
    }

    return {
      success: true,
      message: "Account created successfully via admin signup.",
      data: data.data,
    };
  } catch (error) {
    const err = error as Error;
    return {
      success: false,
      message: err.message || "Admin signup failed",
    };
  }
};

// ! login function — authenticate, then hand off to the shared resolver
export const loginFns = async (
  payload: LoginPayload,
): Promise<AuthResponse> => {
  try {
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: payload.email,
        password: payload.password,
      });

    if (authError) throw authError;
    if (!authData.user || !authData.session) {
      throw new Error("Login failed — no session returned");
    }

    return await resolveLoginOutcome(
      authData.user.id,
      authData.session.access_token,
    );
  } catch (error) {
    const err = error as Error;
    return {
      success: false,
      pending: false,
      message: err.message || "Login failed",
    };
  }
};

// ! kicks off the Google OAuth redirect. Nothing to return —
// ! the browser navigates away to Google, then to /auth/callback.
export const loginWithGoogleFns = async (redirectTo: string) => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });

  if (error) throw error;
};

// ! login with google OAuth
/**
 * Called from /auth/callback once Google has redirected back.
 * Fills in role/name/avatar on first-ever Google sign-in, then reuses
 * the exact same gating pipeline as password login.
 */
export const completeGoogleLogin = async (): Promise<AuthResponse> => {
  try {
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError) throw sessionError;

    const session = sessionData.session;
    if (!session?.user) {
      throw new Error("No session found after Google sign-in");
    }

    const { user } = session;

    const { data: existingProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (existingProfile && !existingProfile.role) {
      await supabase
        .from("profiles")
        .update({
          full_name:
            existingProfile.full_name ??
            user.user_metadata?.full_name ??
            user.user_metadata?.name ??
            "",
          avatar_url:
            existingProfile.avatar_url ??
            user.user_metadata?.avatar_url ??
            user.user_metadata?.picture ??
            null,
          role: CUSTOMER_ROLE,
        })
        .eq("id", user.id);
    }

    return await resolveLoginOutcome(user.id, session.access_token);
  } catch (error) {
    const err = error as Error;
    return {
      success: false,
      pending: false,
      message: err.message || "Google login failed",
    };
  }
};
