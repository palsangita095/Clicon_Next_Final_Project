"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";

import { Button } from "@/components/ui/button";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

const ErrorPage = ({ error, reset }: ErrorPageProps) => {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-6">
      <div className="w-full max-w-lg rounded-2xl border bg-background p-8 text-center shadow-lg">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-10 w-10 text-destructive" />
        </div>

        <h1 className="text-3xl font-bold">Something went wrong</h1>

        <p className="mt-3 text-muted-foreground">
          An unexpected error occurred while loading this page. Please try
          again.
        </p>

        {process.env.NODE_ENV === "development" && (
          <div className="mt-6 rounded-lg bg-muted p-4 text-left">
            <p className="mb-2 text-sm font-semibold">Error Details</p>

            <pre className="overflow-auto text-xs whitespace-pre-wrap">
              {error.message}
            </pre>
          </div>
        )}

        <div className="mt-8 flex justify-center gap-4">
          <Button onClick={reset}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>

          <Button variant="outline" onClick={() => router.push("/")}>
            <Home className="mr-2 h-4 w-4" />
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
