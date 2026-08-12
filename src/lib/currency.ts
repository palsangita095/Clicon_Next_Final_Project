/**
 * Single source of truth for currency formatting. Every price / cost shown
 * anywhere in the app should go through this, so switching currency again
 * later is a one-line change instead of a find-and-replace.
 */
const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatINR(amount: number): string {
  return inrFormatter.format(amount);
}
