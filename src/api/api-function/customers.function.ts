import { supabase } from "@/lib/supabase.config";
import { getErrorMessage } from "@/services/helper/global.helper";

import {
  CreateCustomerPayload,
  UpdateCustomerPayload,
} from "@/types/interface/admin/customers.interface";

// ! fetch all customers
export const getCustomersWLFns = async ({
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
      .from("customers")
      .select(
        `
        *,
        profiles(
          full_name,
          email,
          phone,
          avatar_url,
          status,
          is_active,
          role
        )
      `,
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    return {
      success: true,
      message: "Customers fetched successfully",
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

// ! fetch all customers
export const getCustomersFns = async () => {
  try {
    const { data, error } = await supabase
      .from("customers")
      .select(
        `
        *,
        profiles(
          full_name,
          email,
          phone,
          avatar_url,
          status,
          is_active,
          role
        )
      `,
      )
      .order("created_at", { ascending: false });
    // .in("role", RoleFilter);

    if (error) throw error;

    return {
      success: true,
      message: "Customers fetched successfully",
      data,
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};

// ! fetch available customer profiles
export const getAvailableCustomerProfilesFns = async () => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("role", "customer")
      .order("full_name");

    if (error) throw error;

    return {
      success: true,
      message: "Customer profiles fetched successfully",
      data,
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};

// ! create customer
export const createCustomerFns = async (payload: CreateCustomerPayload) => {
  try {
    const { data, error } = await supabase
      .from("customers")
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      message: "Customer created successfully",
      data,
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};

// ! update customer
export const updateCustomerFns = async (payload: UpdateCustomerPayload) => {
  try {
    const { id, ...updates } = payload;

    const { data, error } = await supabase
      .from("customers")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      message: "Customer updated successfully",
      data,
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};

// ! update customer credit limit
export const updateCustomerCreditLimitFns = async (
  id: string,
  credit_limit: number,
) => {
  try {
    const { data, error } = await supabase
      .from("customers")
      .update({
        credit_limit,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      message: "Credit limit updated successfully",
      data,
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};

// ! delete customer
export const deleteCustomerFns = async (id: string) => {
  try {
    const { error } = await supabase.from("customers").delete().eq("id", id);

    if (error) throw error;

    return {
      success: true,
      message: "Customer deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};
