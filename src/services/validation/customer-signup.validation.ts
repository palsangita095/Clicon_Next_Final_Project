import * as yup from "yup";

export const customerSignupSchema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Enter a valid email address").required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters long"),
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords do not match"),
  agree: yup.boolean().oneOf([true], "You must agree to the Terms and Conditions"),
});
