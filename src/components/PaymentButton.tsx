"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard } from "lucide-react";

interface PaymentButtonProps {
  invoiceId: string;
  shipmentId: string;
  amount: number;
  name: string;
  email: string;
}

export const PaymentButton = ({
  invoiceId,
  shipmentId,
  amount,
  name,
  email,
}: PaymentButtonProps) => {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, amount, shipmentId, invoiceId }),
      });
      const data = await res.json();

      if (!data.success || !data.url) {
        throw new Error(data.message ?? "Could not start checkout");
      }

      window.location.href = data.url;
    } catch (error) {
      console.error("Payment initiation failed:", error);
      setLoading(false);
    }
  };

  return (
    <Button className="w-full" onClick={handlePay} disabled={loading}>
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <CreditCard className="mr-2 h-4 w-4" />
      )}
      {loading ? "Redirecting to payment..." : "Pay now"}
    </Button>
  );
};
