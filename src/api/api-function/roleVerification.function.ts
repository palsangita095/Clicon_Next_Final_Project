import { supabase } from "@/lib/supabase.config";
import {
  CreateVerificationPayload,
  ReviewVerificationPayload,
  RoleVerification,
} from "@/types/interface/admin/roleverification.interface";
import { getErrorMessage } from "@/services/helper/global.helper";

// ! get role verification list with pagination
export const getRoleVerificationListWL = async ({
  limit,
  page,
}: {
  limit: number;
  page: number;
}) => {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from("verification_requests")
      .select(
        `
        *,
        profiles!verification_requests_profile_id_fkey (
          full_name,
          email
        )
      `,
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    return {
      success: true,
      message: "Verification requests fetched successfully",
      data: data as RoleVerification[],
      count: count ?? 0,
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error),
      data: [],
      count: 0,
    };
  }
};

// ! get role verification
export const getRoleVerification = async (id: string) => {
  const { data, error } = await supabase
    .from("verification_requests")
    .select(
      `
      *,
      profiles!verification_requests_profile_id_fkey (
        full_name,
        email
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
};

// ! create the role verification
export const createRoleVerification = async (
  payload: CreateVerificationPayload,
) => {
  const { data, error } = await supabase
    .from("verification_requests")
    .insert({
      profile_id: payload.profile_id,
      role_requested: payload.role_requested,
      status: "pending",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ! update the roleverification status
export const updateRoleVerificationStatus = async (
  payload: ReviewVerificationPayload,
) => {
  const { data, error } = await supabase
    .from("verification_requests")
    .update({
      status: payload.status,
      verified_by: payload.reviewed_by,
      verified_at: new Date().toISOString(),
      remarks: payload.rejection_reason ?? "",
    })
    .eq("id", payload.id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ! delete roleverifications
export const deleteRoleVerification = async (id: string) => {
  const { error } = await supabase
    .from("verification_requests")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
};
