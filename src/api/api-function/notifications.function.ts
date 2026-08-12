import { supabase } from "@/lib/supabase.config";
import { AppNotification } from "@/types/interface/notification.interface";

const normalizeProfile = (n: any): AppNotification => ({
  id: n.id,
  profile_id: n.profile_id,
  title: n.title,
  message: n.message,
  read: n.read,
  created_at: n.created_at,
  source: "profile",
});

const normalizeCustomer = (n: any): AppNotification => ({
  id: n.id,
  title: n.title,
  message: n.message,
  read: n.read,
  created_at: n.created_at,
  source: "customer",
});

const normalizeDriver = (n: any): AppNotification => ({
  id: n.id,
  title: n.title,
  message: n.message,
  read: n.read,
  created_at: n.created_at,
  source: "driver",
});


export const getCombinedNotificationsFns = async (
  profileId: string,
  role?: string,
): Promise<AppNotification[]> => {
  const results: AppNotification[] = [];

  const { data: profileNotifs } = await supabase
    .from("notifications")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });

  results.push(...(profileNotifs ?? []).map(normalizeProfile));

  if (role === "customer") {
    const { data: customerRow } = await supabase
      .from("customers")
      .select("id")
      .eq("profile_id", profileId)
      .single();

    if (customerRow?.id) {
      const { data: customerNotifs } = await supabase
        .from("customer_notifications")
        .select("*")
        .eq("customer_id", customerRow.id)
        .order("created_at", { ascending: false });

      results.push(...(customerNotifs ?? []).map(normalizeCustomer));
    }
  }

  if (role === "driver") {
    const { data: driverRow } = await supabase
      .from("drivers")
      .select("id")
      .eq("profile_id", profileId)
      .single();

    if (driverRow?.id) {
      const { data: driverNotifs } = await supabase
        .from("driver_notifications")
        .select("*")
        .eq("driver_id", driverRow.id)
        .order("created_at", { ascending: false });

      results.push(...(driverNotifs ?? []).map(normalizeDriver));
    }
  }

  return results.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
};


export const markAllCombinedNotificationsReadFns = async (
  profileId: string,
  role?: string,
) => {
  await supabase
    .from("notifications")
    .update({ read: true })
    .eq("profile_id", profileId)
    .eq("read", false);

  if (role === "customer") {
    const { data: customerRow } = await supabase
      .from("customers")
      .select("id")
      .eq("profile_id", profileId)
      .single();

    if (customerRow?.id) {
      await supabase
        .from("customer_notifications")
        .update({ read: true })
        .eq("customer_id", customerRow.id)
        .eq("read", false);
    }
  }

  if (role === "driver") {
    const { data: driverRow } = await supabase
      .from("drivers")
      .select("id")
      .eq("profile_id", profileId)
      .single();

    if (driverRow?.id) {
      await supabase
        .from("driver_notifications")
        .update({ read: true })
        .eq("driver_id", driverRow.id)
        .eq("read", false);
    }
  }

  return { success: true };
};


