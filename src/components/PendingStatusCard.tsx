"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { AlertCircle, Clock } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

const PendingStatusCard = () => {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const status = user?.status ?? "pending";
  const isRejected = status === "rejected";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="w-full max-w-md"
    >
      <Card className="relative overflow-hidden">
        
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
          style={{ originX: 0 }}
          className={`absolute inset-x-0 top-0 h-0.75 ${
            isRejected ? "bg-destructive" : "bg-brand-yellow"
          }`}
        />

        <CardHeader className="flex flex-row items-center justify-between pt-6">
          <CardTitle>Verification Status</CardTitle>

          <motion.div
            key={status}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
          >
            <Badge
              variant={isRejected ? "destructive" : "outline"}
              className={
                isRejected
                  ? ""
                  : "border-brand-yellow/40 bg-brand-yellow/15 text-brand-yellow"
              }
            >
              {isRejected ? (
                <AlertCircle className="mr-1 h-3 w-3" />
              ) : (
                <Clock className="mr-1 h-3 w-3" />
              )}
              {isRejected ? "Rejected" : "Under Review"}
            </Badge>
          </motion.div>
        </CardHeader>

        <CardContent className="space-y-5">
         
          <div className="flex justify-center py-2">
            <div className="relative flex h-16 w-16 items-center justify-center">
              {!isRejected && (
                <motion.span
                  className="absolute inset-0 rounded-full bg-brand-yellow/20 motion-reduce:animate-none"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{
                    duration: 2.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              )}
              <div
                className={`relative flex h-16 w-16 items-center justify-center rounded-full border ${
                  isRejected
                    ? "border-destructive/30 bg-destructive/10"
                    : "border-brand-yellow/30 bg-brand-yellow/10"
                }`}
              >
                {isRejected ? (
                  <AlertCircle className="h-7 w-7 text-destructive" />
                ) : (
                  <motion.div
                    animate={{ rotate: [0, 8, -8, 0] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Clock className="h-7 w-7 text-brand-yellow" />
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!isRejected ? (
              <motion.p
                key="pending-copy"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="text-center text-sm text-muted-foreground"
              >
                Hi {user?.full_name ?? "there"}, your account is currently being
                reviewed by our admin team. This usually takes 24–48 hours.
                You&apos;ll be notified once it&apos;s approved.
              </motion.p>
            ) : (
              <motion.div
                key="rejected-copy"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
              >
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Account Rejected</AlertTitle>
                  <AlertDescription>
                    {user?.remarks ||
                      "No reason was provided. Please contact support."}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            variant="outline"
            className="w-full border-brand-orange/40 text-brand-orange hover:bg-brand-orange/10 hover:text-brand-orange"
            onClick={async () => {
              await logout();
              router.push("/");
            }}
          >
            Back to Home
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PendingStatusCard;
