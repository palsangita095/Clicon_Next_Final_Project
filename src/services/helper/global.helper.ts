import { AxiosError } from "axios";


export const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    return axiosError.response?.data?.message || "Something went wrong";
  }
  return "Something went wrong";
};


export const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word[0].toUpperCase())
    .join("");
};
