"use client";

import React, { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "next-themes";
import { setupStorefrontSessionIsolation } from "@/lib/storefrontSession";

const Provider = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ! Keeps cart / wishlist / compare / history isolated per user on every
  // ! auth transition (sign-in, sign-out, session expiry, user switch).
  useEffect(() => {
    const unsubscribe = setupStorefrontSessionIsolation();
    return () => unsubscribe();
  }, []);

  return (
    <>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
      >
        <QueryClientProvider client={queryClient}>
          {children}

          {process.env.NODE_ENV === "development" && mounted && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
        </QueryClientProvider>
      </ThemeProvider>
    </>
  );
};

export default Provider;
