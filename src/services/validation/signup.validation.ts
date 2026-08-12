import { user_role } from "@/types/enum/enum";
import * as yup from "yup";

export const signupSchema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup.string().email().required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters long"),
  role: yup.mixed<user_role>().required("Role is Required"),
});
