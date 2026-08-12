"use client";

import { useTheme } from "next-themes";
import Lottie from "lottie-react";
import loadingLight from "@/services/json/loading-light.json";
import loadingDark from "@/services/json/loading-dark.json";

export default function PageLoader() {
  const { resolvedTheme } = useTheme();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-85">
        {resolvedTheme === "dark" ? (
          <Lottie key="dark-loader" animationData={loadingDark} loop />
        ) : (
          <Lottie key="light-loader" animationData={loadingLight} loop />
        )}
      </div>
    </div>
  );
}
