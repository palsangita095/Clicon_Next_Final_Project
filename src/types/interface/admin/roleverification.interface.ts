import { user_role, verification_status } from "@/types/enum/enum";

export interface RoleVerification {
  id: string;
  profile_id: string;
  request_type: user_role;
  document_url: string | null;
  status: verification_status;
  verified_by: string | null;
  verified_at: string | null;
  remarks: string | null;
  created_at: string;
  updated_at: string;


  profiles?: {
    full_name: string | null;
    email: string;
  };
}

export interface CreateVerificationPayload {
  profile_id: string;
  role_requested: user_role;
}

export interface ReviewVerificationPayload {
  id: string;
  status: verification_status;
  reviewed_by: string;
  rejection_reason?: string | null;
}
