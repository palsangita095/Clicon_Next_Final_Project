"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Loader2, RadioTower, Truck } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAuthStore } from "@/store/useAuthStore";
import DyanmicInput from "./common/DyanmicInput";
import signupImage from "@/assets/images/auth/signup.png";
import { SignupPayload } from "@/types/interface/auth.interface";
import { signupInputFields } from "@/services/json/signup.input";
import { signupSchema } from "@/services/validation/signup.validation";
import { cn } from "@/lib/utils";
import { UserCheckIcon } from "@animateicons/react/lucide";
import { toast } from "sonner";
import { AvatarUploadField } from "./AvatarUploadField";

type Role = "customer" | "driver" | "dispatcher";

const roles: { value: Role; label: string; icon: React.ReactNode }[] = [
  {
    value: "customer",
    label: "Customer",
    icon: <UserCheckIcon className="h-5 w-5" />,
  },
  { value: "driver", label: "Driver", icon: <Truck className="h-5 w-5" /> },
  {
    value: "dispatcher",
    label: "Dispatcher",
    icon: <RadioTower className="h-5 w-5" />,
  },
];

const SignupForm = () => {
  const { registerUser, isLoading, isError, setActiveTab } = useAuthStore();

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<SignupPayload>({
    resolver: yupResolver(signupSchema),
  });

  const onSubmit = async (payload: SignupPayload) => {
    const res = await registerUser(payload);
    if (res.success) {
      toast.success("SignUp Successfully");
      reset();
      setActiveTab("login");
    }
    
  };

  return (
    <main className="min-h-fit">
      <div className="mx-auto flex flex-col lg:flex-row max-w-7xl overflow-hidden rounded-3xl border border-border shadow-xl bg-background">
       
        <div className="hidden lg:flex w-[42%] relative overflow-hidden bg-brand-teal">
          <Image
            src={signupImage}
            alt="Clicon store background"
            fill
            priority
            sizes="(max-w-7xl) 42vw, 500px" 
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10 flex flex-col justify-between h-full p-10">
            <div className="space-y-3">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Clicon<span className="text-primary">+</span>
              </h1>
              <p className="text-sm text-white/70 max-w-50 leading-relaxed">
                Join the next evolution of intelligent shopping.
              </p>
            </div>
            <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20 text-primary">
                <RadioTower className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/50">
                  Real-time efficiency
                </p>
                <p className="text-sm text-white/90">
                  Optimize routes in milliseconds.
                </p>
              </div>
            </div>
          </div>
        </div>

        
        <div className="flex-1 p-8 md:p-12 flex items-center justify-center">
          <div className="w-full max-w-md space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-4xl font-bold text-foreground font-heading capitalize">
                Generate the key
              </h1>
              <p className="text-muted-foreground">
                Complete your profile to access the Intelligent Flow dashboard.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
             
              <AvatarUploadField
                onUploaded={(url) =>
                  setValue("avatar_url", url, { shouldValidate: true })
                }
              />

          
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ">
                {signupInputFields.map((field, index) => (
                  <div
                    key={field.name}
                    className={index < 2 ? "" : "md:col-span-2"}
                  >
                    <DyanmicInput
                      name={field.name}
                      label={field.label}
                      type={field.type}
                      register={register}
                      error={errors[field.name as keyof SignupPayload]?.message}
                    />
                  </div>
                ))}
              </div>

             
              <div className="space-y-2">
                <p className="text-sm font-medium">Your Role</p>

                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {roles.map(({ value, label, icon }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => field.onChange(value)}
                            className={cn(
                              "flex flex-row sm:flex-col items-center gap-3 sm:gap-2 rounded-lg border py-3 sm:py-4 px-4 sm:px-0 text-sm font-medium transition-all",
                              field.value === value
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border bg-muted/40 text-muted-foreground hover:border-primary/50 hover:text-foreground",
                            )}
                          >
                            {icon}
                            {label}
                          </button>
                        ))}
                      </div>

                      {errors.role && (
                        <p className="text-sm text-red-400 mt-1">
                          {errors.role.message}
                        </p>
                      )}
                    </>
                  )}
                />
              </div>

              {isError && <p className="text-red-400 text-sm">{isError}</p>}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <button
                type="button"
                className="font-medium text-foreground underline-offset-2 hover:underline"
                onClick={() => setActiveTab("login")}
              >
                Login
              </button>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default SignupForm;
