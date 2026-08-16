import {
  adminSignupFns,
  completeGoogleLogin,
  loginFns,
  loginWithGoogleFns,
  signupFns,
} from "@/api/api-function/auth.function";
import { getErrorMessage } from "@/services/helper/global.helper";
import { getSiteUrl } from "@/lib/siteUrl";
import { user_role } from "@/types/enum/enum";
import {
  AuthState,
  LoginPayload,
  SignupPayload,
} from "@/types/interface/auth.interface";
import { deleteCookie, getCookie } from "cookies-next";
import { toast } from "sonner";
import { create } from "zustand";
import { useStorefront } from "./useStorefront";
import { supabase } from "@/lib/supabase.config";

export const useAuthStore = create<AuthState>((set) => ({
  drawer: false,
  isLoading: false,
  isError: null,
  user: getCookie("user") ? JSON.parse(getCookie("user") as string) : null,
  isAuthenticate: !!getCookie("token"),
  role: (getCookie("role") as user_role) ?? null,
  verification: null,
  activeTab: "login",

  setActiveTab: (tab) => set({ activeTab: tab }),
  openDrawer: () => set({ drawer: true }),
  closeDrawer: () => set({ drawer: false }),

  
  registerUser: async (payload: SignupPayload) => {
    set({ isLoading: true, isError: null });

    try {
      const res = await signupFns(payload);

      if (res.success) {
        if (res.data) {
          set({
            user: res.data,
            role: res.data.role,
            isAuthenticate: !res.pending,
          });

          if (res.pending) {
            toast.info(res.message);
          } else {
            toast.success(res.message);
          }
        }
        return res;
      }

      
      if (process.env.NEXT_PUBLIC_ENABLE_ADMIN_SIGNUP === 'true') {
        const adminRes = await adminSignupFns(payload);
        if (adminRes.success) {
          if (adminRes.data) {
            set({
              user: adminRes.data,
              role: adminRes.data.role,
              isAuthenticate: true,
            });
          }
          useStorefront.getState().rehydrate();
          toast.success(adminRes.message);
          return adminRes;
        }
        set({ isError: adminRes.message });
        toast.error(adminRes.message);
        return adminRes;
      }

      set({ isError: res.message });
      toast.error(res.message);
      return res;
    } catch (error) {
      const err = getErrorMessage(error);
      set({ isError: err });
      toast.error(err);
      return { success: false, message: err };
    } finally {
      set({ isLoading: false });
    }
  },

  
  loginUser: async (payload: LoginPayload) => {
    set({ isLoading: true, isError: null });

    try {
      const res = await loginFns(payload);

      console.log("res in the auth store", res);

      if (!res.success) {
        set({
          isError: res.message,
          user: res.data ?? null,
          role: res.data?.role ?? null,
          verification: res.verification ?? null,
          isAuthenticate: false,
        });
        toast.error(res.message);
        return res;
      }

      if (res.pending) {
        set({
          user: res.data ?? null,
          role: res.data?.role ?? null,
          verification: res.verification ?? null,
          isAuthenticate: false,
        });
        toast.warning(res.message);
        return res;
      }

      if (res.data) {
        set({
          user: res.data,
          role: res.data.role,
          verification: res.verification ?? null,
          isAuthenticate: true,
        });
        toast.success(res.message);
      }

      useStorefront.getState().rehydrate();
      return res;
    } catch (error) {
      const err = getErrorMessage(error);
      set({ isError: err });
      toast.error(err);
      return { success: false, message: err };
    } finally {
      set({ isLoading: false });
    }
  },

 
  loginWithGoogle: async () => {
    set({ isError: null });
    try {
      const redirectTo = `${getSiteUrl()}/auth/callback`;
      await loginWithGoogleFns(redirectTo);
    } catch (error) {
      const err = getErrorMessage(error);
      set({ isError: err });
      toast.error(err);
    }
  },


  handleGoogleCallback: async () => {
    set({ isLoading: true, isError: null });

    try {
      const res = await completeGoogleLogin();

      if (!res.success) {
        set({
          isError: res.message,
          user: res.data ?? null,
          role: res.data?.role ?? null,
          verification: res.verification ?? null,
          isAuthenticate: false,
        });
        toast.error(res.message);
        return res;
      }

      if (res.pending) {
        set({
          user: res.data ?? null,
          role: res.data?.role ?? null,
          verification: res.verification ?? null,
          isAuthenticate: false,
        });
        toast.warning(res.message);
        return res;
      }

      if (res.data) {
        set({
          user: res.data,
          role: res.data.role,
          verification: res.verification ?? null,
          isAuthenticate: true,
        });
        toast.success(res.message);
      }

      useStorefront.getState().rehydrate();
      return res;
    } catch (error) {
      const err = getErrorMessage(error);
      set({ isError: err });
      toast.error(err);
      return { success: false, message: err };
    } finally {
      set({ isLoading: false });
    }
  },

  
  logout: async () => {
    try {
      await supabase.auth.signOut();
    } catch {}

    deleteCookie("token");
    deleteCookie("role");
    deleteCookie("user");

    set({
      isAuthenticate: false,
      role: null,
      user: null,
      verification: null,
      isError: null,
    });

  
    useStorefront.getState().reset();
    window.location.href = "/";
   

    toast.success("Logged out successfully");
    return true;
  },
}));
