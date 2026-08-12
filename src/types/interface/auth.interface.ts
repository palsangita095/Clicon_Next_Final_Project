import { approval_status, user_role } from "../enum/enum";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload extends LoginPayload {
  name: string;
  role: user_role;
  avatar_url?: string | null;
}

// Mirrors the profiles table exactly (post-migration)
export interface ProfileSchema {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  role: user_role;
  status: approval_status;
  remarks: string | null;
  is_verified: boolean;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface VerificationRequest {
  id: string;
  profile_id: string;
  request_type: string;
  document_url: string | null;
  status: "pending" | "approved" | "rejected";
  verified_by: string | null;
  verified_at: string | null;
  remarks: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  success: boolean;
  pending?: boolean;
  message: string;
  data?: ProfileSchema;
  verification?: VerificationRequest | null;
}

export interface AuthState {
  drawer: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;

  isLoading: boolean;
  isError: string | null;

  user: ProfileSchema | null;
  role: user_role | null;
  verification: VerificationRequest | null;

  isAuthenticate: boolean;

  activeTab: "login" | "signup";
  setActiveTab: (tab: "login" | "signup") => void;

  loginWithGoogle: () => Promise<void>;
  handleGoogleCallback: () => Promise<AuthResponse>;

  registerUser: (payload: SignupPayload) => Promise<AuthResponse>;
  loginUser: (payload: LoginPayload) => Promise<AuthResponse>;
  logout: () => Promise<boolean>;
}
