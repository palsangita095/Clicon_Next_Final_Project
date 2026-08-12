export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  role: string;
  status: string;
  is_verified: boolean;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateProfilePayload {
  email: string;
  full_name: string;
  avatar_url?: string | null;
  phone?: string | null;
  role: string;
  status?: string;
  is_verified?: boolean;
  is_active?: boolean;
}

export interface UpdateProfilePayload {
  id: string;
  full_name?: string;
  avatar_url?: string | null;
  phone?: string | null;
  role?: string;
  status?: string;
  is_verified?: boolean;
  is_active?: boolean;
}

export interface ToggleProfileStatusPayload {
  id: string;
  is_active: boolean;
}

export interface VerifyProfilePayload {
  id: string;
  is_verified: boolean;
}

export interface DeleteProfilePayload {
  id: string;
}
