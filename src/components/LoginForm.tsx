"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";
import DyanmicInput from "./common/DyanmicInput";
import { loginInputFields } from "@/services/json/login.input";
import { loginSchema } from "@/services/validation/login.validation";
import { ChromeIcon, CircleCheckBigIcon } from "@animateicons/react/lucide";
import { useAuthStore } from "@/store/useAuthStore";
import { LoginPayload } from "@/types/interface/auth.interface";
import { Separator } from "./ui/separator";

const LoginForm = () => {
  const router = useRouter();
  const {
    loginUser,
    loginWithGoogle,
    isLoading,
    isError,
    closeDrawer,
    setActiveTab,
  } = useAuthStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginPayload>({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data: LoginPayload) => {
    try {
      const res = await loginUser(data);
      const verificationStatus = res.verification?.status;

      if (
        verificationStatus === "pending" ||
        verificationStatus === "rejected"
      ) {
        closeDrawer();
        reset();
        router.push("/verificationpending");
        return;
      }

      if (!res.success) {
        toast.error(res.message);
        return;
      }

      

      switch (res.data?.role) {
        case "customer":
          router.push("/customer/dashboard");
          break;
        case "driver":
          router.push("/driver/dashboard");
          break;
        case "dispatcher":
          router.push("/dispatcher/dashboard");
          break;
        case "admin":
          router.push("/admin/dashboard");
          break;
      }

      closeDrawer();
      reset();
    } catch (error) {
      const err = error as { message: string };
      console.log("error in login form", err.message);
      toast.error(err.message ?? "Something went wrong");
    }
  };

  return (
    <main className="min-h-fit ">
      <div className="mx-auto flex flex-col lg:flex-row max-w-7xl overflow-hidden rounded-3xl border border-border shadow-xl bg-background">
      
        <div className="hidden lg:flex w-[42%] relative overflow-hidden bg-brand-teal">
          <Image
            src="https://images.unsplash.com/photo-1590796583326-afd3bb20d22d?q=80&w=687&auto=format&fit=crop"
            alt="Clicon store background"
            fill
            priority
            className="object-cover"
          />
         
          <div className="absolute inset-0 bg-black/60" />

         
          <div className="relative z-10 flex flex-col justify-between h-full p-10">
            <div className="space-y-3">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Clicon<span className="text-primary">+</span>
              </h1>
              <p className="text-sm text-white/70 max-w-50 leading-relaxed">
                Explore the next evolution of intelligent shopping.
              </p>
            </div>

            
            <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20 text-primary">
                <CircleCheckBigIcon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/50">
                  Just one click to go
                </p>
                <p className="text-sm text-white/90">
                  Blink Fast Transpotation
                </p>
              </div>
            </div>
          </div>
        </div>

      
        <div className="flex-1 p-8 md:p-12 flex items-center justify-center">
          <div className="w-full max-w-md space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-4xl font-bold text-foreground font-heading capitalize">
                Unlock the Future
              </h1>

              <p className="text-muted-foreground">
                Access your intelligent logistics dashboard
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {loginInputFields.map((field) => (
                <div key={field.name}>
                  <DyanmicInput
                    name={field.name}
                    label={field.label}
                    type={field.type}
                    register={register}
                    error={errors[field.name as keyof LoginPayload]?.message}
                  />
                </div>
              ))}

              <div className="flex items-center gap-4 my-5">
                <Separator className="flex-1" />
                <span className="text-xs text-muted-foreground">OR</span>
                <Separator className="flex-1" />
              </div>

              <div className="space-y-3">
             

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={loginWithGoogle}
                >
                  <ChromeIcon className="mr-2 h-4 w-4" />
                  Login with Google
                </Button>
              </div>

              {isError && <p className="text-red-400 text-sm">{isError}</p>}

              <Button
                type="submit"
                className="w-full mt-4"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="animate-spin" /> : "Login"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              New Here?{" "}
              <button
                type="button"
                className="font-medium text-foreground underline-offset-2 hover:underline"
                onClick={() => setActiveTab("signup")}
              >
                Create Account
              </button>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default LoginForm;
