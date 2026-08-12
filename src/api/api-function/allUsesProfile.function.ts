import { supabase } from "@/lib/supabase.config";
import { getErrorMessage } from "@/services/helper/global.helper";
import {
  CreateProfilePayload,
  UpdateProfilePayload,
} from "@/types/interface/admin/profiles.interface";

// ! fetch all profiles
export const getProfilesFns = async ({
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
      .from("profiles")
      .select("*", { count: "exact" })
      .order("created_at", {
        ascending: false,
      })
      .range(from, to);

    if (error) throw error;

    return {
      success: true,
      message: "Profiles fetched successfully",
      data,
      count: count,
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

// ! create profile
export const createProfileFns = async (payload: CreateProfilePayload) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      message: "Profile created successfully",
      data,
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};

// ! update profile
export const updateProfileFns = async (payload: UpdateProfilePayload) => {
  try {
    const { id, ...updates } = payload;

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      message: "Profile updated successfully",
      data,
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};

// ! toggle profile active status
export const toggleProfileStatusFns = async (
  id: string,
  currentStatus: boolean,
) => {
  try {
    const newStatus = !currentStatus;
    const { data, error } = await supabase
      .from("profiles")
      .update({
        is_active: newStatus,
        account_status: newStatus ? "active" : "suspended",
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      message: `Profile ${
        currentStatus ? "deactivated" : "activated"
      } successfully`,
      data,
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};

// ! verify profile
export const verifyProfileFns = async (id: string, verified: boolean) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .update({
        is_verified: verified,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      message: verified
        ? "Profile verified successfully"
        : "Profile unverified successfully",
      data,
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};

// ! delete profile
export const deleteProfileFns = async (id: string) => {
  try {
    const { error } = await supabase.from("profiles").delete().eq("id", id);

    if (error) throw error;

    return {
      success: true,
      message: "Profile deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};
