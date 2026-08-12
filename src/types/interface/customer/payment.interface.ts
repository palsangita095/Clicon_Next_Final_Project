export type PaymentStatus = "pending" | "succeeded" | "failed" | "refunded";
export type PaymentMethodType =
  | "card"
  | "upi"
  | "netbanking"
  | "wallet"
  | "other";

export interface Payment {
  id: string;
  invoice_id: string;
  amount: number;
  method: PaymentMethodType;
  transaction_reference: string | null;
  status: PaymentStatus;
  paid_at: string | null;
  created_at: string;
}

export interface CreatePaymentRequest {
  invoice_id: string;
  amount: number;
  method: PaymentMethodType;
  transaction_reference: string;
  status: PaymentStatus;
  paid_at: string;
}
