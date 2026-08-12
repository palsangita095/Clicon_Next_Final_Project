import { notFound } from "next/navigation";
import AdminSignupForm from "@/components/AdminSignupForm";

export default function AdminSignupPage() {
  if (process.env.NEXT_PUBLIC_ENABLE_ADMIN_SIGNUP !== "true") {
    notFound();
  }

  return <AdminSignupForm />;
}
