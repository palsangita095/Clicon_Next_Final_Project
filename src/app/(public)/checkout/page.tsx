"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useStorefront } from "@/store/useStorefront";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { ArrowRight, CreditCard, Loader2, XCircle, LogIn, X, User, Lock, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { fixImageUrl } from "@/lib/imageFallback";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
function StripeElementsInner({ onReady, paymentElementOptions }: { onReady: (s: any, e: any) => void; paymentElementOptions?: any }) {
  const stripe = useStripe();
  const elements = useElements();
  useEffect(() => { if (stripe && elements) onReady(stripe, elements); }, [stripe, elements, onReady]);
  return <PaymentElement options={paymentElementOptions} />;
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const NAME_PATTERN = /^[A-Za-zÀ-ÿ\s\-']+$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LOCAL_PHONE_PATTERN = /^\d{10}$/;
const E164_PHONE_PATTERN = /^\+[1-9]\d{1,14}$/;
const CARD_PATTERN = /^\d{13,19}$/;
const EXPIRY_PATTERN = /^(0[1-9]|1[0-2])\/\d{2}$/;
const CVC_PATTERN = /^\d{3,4}$/;
const US_ZIP_PATTERN = /^\d{5}(-\d{4})?$/;
const UK_POSTAL_PATTERN = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;
const CANADA_POSTAL_PATTERN = /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i;
const INDIA_PIN_PATTERN = /^\d{6}$/;
const GLOBAL_POSTAL_PATTERN = /^[A-Za-z0-9][A-Za-z0-9\s-]{1,18}[A-Za-z0-9]$/;

const COUNTRIES: Record<string, { states: Record<string, string[]> }> = {
  "United States": { states: { "California": ["Los Angeles", "San Francisco", "San Diego", "Sacramento"], "New York": ["New York City", "Buffalo", "Rochester", "Albany"], "Texas": ["Houston", "Dallas", "Austin", "San Antonio"], "Florida": ["Miami", "Orlando", "Tampa", "Jacksonville"], "Illinois": ["Chicago", "Aurora", "Naperville", "Springfield"] } },
  "Canada": { states: { "Ontario": ["Toronto", "Ottawa", "Mississauga", "Hamilton"], "Quebec": ["Montreal", "Quebec City", "Laval", "Gatineau"], "British Columbia": ["Vancouver", "Victoria", "Surrey", "Burnaby"] } },
  "United Kingdom": { states: { "England": ["London", "Manchester", "Birmingham", "Liverpool"], "Scotland": ["Edinburgh", "Glasgow", "Aberdeen", "Dundee"], "Wales": ["Cardiff", "Swansea", "Newport", "Bangor"] } },
  "Australia": { states: { "New South Wales": ["Sydney", "Newcastle", "Wollongong", "Central Coast"], "Victoria": ["Melbourne", "Geelong", "Ballarat", "Bendigo"], "Queensland": ["Brisbane", "Gold Coast", "Cairns", "Townsville"] } },
  "Germany": { states: { "Bavaria": ["Munich", "Nuremberg", "Augsburg", "Regensburg"], "Berlin": ["Berlin"], "Hamburg": ["Hamburg"], "Hesse": ["Frankfurt", "Wiesbaden", "Darmstadt", "Kassel"] } },
  "France": { states: { "Ile-de-France": ["Paris", "Boulogne-Billancourt", "Saint-Denis", "Versailles"], "Provence-Alpes-Cote d'Azur": ["Marseille", "Nice", "Toulon", "Aix-en-Provence"], "Auvergne-Rhone-Alpes": ["Lyon", "Grenoble", "Saint-Etienne", "Clermont-Ferrand"] } },
  "India": { states: { "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane"], "Delhi": ["New Delhi", "Delhi"], "Karnataka": ["Bangalore", "Mysore", "Hubli", "Mangalore"], "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli"] } },
  "Japan": { states: { "Tokyo": ["Tokyo", "Hachioji", "Machida", "Tama"], "Osaka": ["Osaka", "Sakai", "Higashiosaka", "Toyonaka"], "Kanagawa": ["Yokohama", "Kawasaki", "Sagamihara", "Yamato"] } },
  "Brazil": { states: { "Sao Paulo": ["Sao Paulo", "Guarulhos", "Campinas", "Sao Bernardo do Campo"], "Rio de Janeiro": ["Rio de Janeiro", "Niteroi", "Duque de Caxias", "Nova Iguacu"], "Minas Gerais": ["Belo Horizonte", "Uberlandia", "Contagem", "Juiz de Fora"] } },
  "United Arab Emirates": { states: { "Dubai": ["Dubai City", "Jebel Ali", "Deira", "Bur Dubai"], "Abu Dhabi": ["Abu Dhabi City", "Al Ain", "Musaffah", "Khalifa City"] } },
};

const COUNTRY_OPTIONS = Object.keys(COUNTRIES);

function isValidPhoneNumber(value?: string | null) {
  const phone = (value ?? "").trim();
  const localPhone = phone.replace(/\D/g, "");
  const compactPhone = phone.replace(/[\s\-()]/g, "");
  return LOCAL_PHONE_PATTERN.test(localPhone) || E164_PHONE_PATTERN.test(compactPhone);
}

function isValidPostalCode(value?: string | null, countryValue?: string | null) {
  const postalCode = (value ?? "").trim();
  const country = (countryValue ?? "").trim().toLowerCase();

  if (!postalCode) return false;
  if (GLOBAL_POSTAL_PATTERN.test(postalCode)) return true;
  if (country === "united states") return US_ZIP_PATTERN.test(postalCode);
  if (country === "united kingdom" || country === "uk") return UK_POSTAL_PATTERN.test(postalCode);
  if (country === "canada") return CANADA_POSTAL_PATTERN.test(postalCode);
  if (country === "india") return INDIA_PIN_PATTERN.test(postalCode);
  return GLOBAL_POSTAL_PATTERN.test(postalCode);
}

function toStripeCountryCode(country?: string | null) {
  const value = (country ?? "").trim().toLowerCase();
  const countries: Record<string, string> = {
    "united states": "US",
    canada: "CA",
    "united kingdom": "GB",
    uk: "GB",
    australia: "AU",
    germany: "DE",
    france: "FR",
    india: "IN",
    japan: "JP",
    brazil: "BR",
    "united arab emirates": "AE",
  };

  return countries[value];
}

const schema = yup.object().shape({
  firstName: yup.string().required("First name is required").matches(NAME_PATTERN, "Only letters, spaces, and hyphens allowed"),
  lastName: yup.string().required("Last name is required").matches(NAME_PATTERN, "Only letters, spaces, and hyphens allowed"),
  company: yup.string(),
  address: yup.string().required("Address is required"),
  country: yup.string().required("Country is required"),
  region: yup.string().required("Region/State is required"),
  city: yup.string().required("City is required"),
  zipCode: yup.string().required("Zip Code is required").test("postal-code", "Enter a valid postal code for the selected country", function (value) {
    return isValidPostalCode(value, this.parent.country);
  }),
  email: yup.string().required("Email is required").matches(EMAIL_PATTERN, "Invalid email format"),
  phone: yup.string().required("Phone number is required").test("phone-number", "Enter a 10 digit phone number or E.164 number like +14155552671", isValidPhoneNumber),
  shipDifferentAddress: yup.boolean().default(false),
  orderNotes: yup.string(),
  paymentMethod: yup.string().required(),
  fallbackCard: yup.object().when(["paymentMethod"], ([paymentMethod], schema) => {
    return paymentMethod === "card" && !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? schema.shape({
      nameOnCard: yup.string().required("Name on card is required"),
      cardNumber: yup.string().required("Card number is required").test("card-num", "Enter a valid card number", val => CARD_PATTERN.test((val || "").replace(/\s/g, ""))),
      expiry: yup.string().required("Expiry is required").matches(EXPIRY_PATTERN, "Use MM/YY format"),
      cvc: yup.string().required("CVC is required").matches(CVC_PATTERN, "CVC must be 3-4 digits")
    }) : schema;
  })
});

type BaseFormValues = yup.InferType<typeof schema>;
type FormValues = Omit<BaseFormValues, "fallbackCard"> & {
  fallbackCard?: {
    nameOnCard?: string;
    cardNumber?: string;
    expiry?: string;
    cvc?: string;
  };
};

export default function CheckoutPage() {
  const cart = useStorefront((s) => s.cart);
  const clearCart = useStorefront((s) => s.clearCart);
  const settings = useStoreSettings();
  const router = useRouter();
  const { user, isAuthenticate } = useAuthStore();
  const [checkoutUser, setCheckoutUser] = useState<any>(null);
  const [stripePromise, setStripePromise] = useState<any>(null);
  const [profileData, setProfileData] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country: string;
    billingAddress: {
      company: string;
      address: string;
      country: string;
      region: string;
      city: string;
      zipCode: string;
    } | null;
  } | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [mounted, setMounted] = useState(true);
  const [showCompleteProfilePopup, setShowCompleteProfilePopup] = useState(false);

  const isLoggedIn = !!checkoutUser;
  const isProfileComplete = Boolean(
    profileData &&
    profileData.firstName?.trim() &&
    profileData.lastName?.trim() &&
    profileData.email?.trim() &&
    profileData.phone?.trim() &&
    profileData.billingAddress &&
    profileData.billingAddress.address?.trim() &&
    profileData.billingAddress.country?.trim() &&
    profileData.billingAddress.region?.trim() &&
    profileData.billingAddress.city?.trim() &&
    profileData.billingAddress.zipCode?.trim()
  );

  const billingDisplay = (() => {
    if (!isLoggedIn || !profileData) return null;
    const pd = profileData;
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">First Name</p>
            <p className="font-medium text-gray-900">{pd.firstName}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Last Name</p>
            <p className="font-medium text-gray-900">{pd.lastName}</p>
          </div>
        </div>
        {pd.billingAddress?.company && (
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Company Name</p>
            <p className="font-medium text-gray-900">{pd.billingAddress.company}</p>
          </div>
        )}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Address</p>
          <p className="font-medium text-gray-900">{pd.billingAddress?.address || "—"}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Country</p>
            <p className="font-medium text-gray-900">{pd.billingAddress?.country || pd.country || "United States"}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Region/State</p>
            <p className="font-medium text-gray-900">{pd.billingAddress?.region || "—"}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">City</p>
            <p className="font-medium text-gray-900">{pd.billingAddress?.city || "—"}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Zip Code</p>
            <p className="font-medium text-gray-900">{pd.billingAddress?.zipCode || "—"}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Email</p>
            <p className="font-medium text-gray-900">{pd.email}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Phone Number</p>
            <p className="font-medium text-gray-900">{pd.phone || "—"}</p>
          </div>
        </div>
        <Button type="button" variant="outline" onClick={() => router.push("/account/settings?redirectTo=/checkout")} className="w-full border-gray-200 text-sm">
          Edit Billing Details
        </Button>
      </div>
    );
  })();

  // Don't render form until mounted to avoid hydration mismatch
  if (false && !mounted) {
    return (
      <div className="bg-white min-h-screen">
        <div className="bg-gray-50 border-b border-gray-100">
          <div className="container mx-auto px-4 md:px-8 py-3 text-sm text-gray-500 flex items-center gap-2">
            <Link href="/" className="hover:text-brand-orange flex items-center gap-1"><span>🏠</span> Home</Link>
            <span className="text-gray-400">›</span>
            <Link href="/cart" className="hover:text-brand-orange">Shopping Card</Link>
            <span className="text-gray-400">›</span>
            <span className="text-brand-orange font-medium">Checkout</span>
          </div>
        </div>
        <div className="container mx-auto px-4 md:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-10">
              <div className="animate-pulse space-y-6">
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="h-11 bg-gray-200 rounded"></div>
                  <div className="h-11 bg-gray-200 rounded"></div>
                </div>
                <div className="h-11 bg-gray-200 rounded"></div>
                <div className="h-11 bg-gray-200 rounded"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="h-11 bg-gray-200 rounded"></div>
                  <div className="h-11 bg-gray-200 rounded"></div>
                  <div className="h-11 bg-gray-200 rounded"></div>
                  <div className="h-11 bg-gray-200 rounded"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="h-11 bg-gray-200 rounded"></div>
                  <div className="h-11 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
            <div className="animate-pulse">
              <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 sticky top-6">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-5"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
                <div className="border-t border-gray-100 pt-4 mt-2 space-y-3">
                  <div className="flex justify-between"><div className="h-4 bg-gray-200 rounded w-1/4"></div><div className="h-4 bg-gray-200 rounded w-1/6"></div></div>
                  <div className="flex justify-between"><div className="h-4 bg-gray-200 rounded w-1/4"></div><div className="h-4 bg-gray-200 rounded w-1/6"></div></div>
                  <div className="flex justify-between"><div className="h-4 bg-gray-200 rounded w-1/4"></div><div className="h-4 bg-gray-200 rounded w-1/6"></div></div>
                  <div className="border-t border-gray-100 pt-4 mt-2 flex justify-between"><div className="h-5 bg-gray-200 rounded w-1/4"></div><div className="h-5 bg-gray-200 rounded w-1/6"></div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const supabase = createClient();

    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setCheckoutUser(user ?? null);
    }

    fetchUser();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setCheckoutUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchProfile() {
      const activeUser = checkoutUser ?? user;
      if (!activeUser) {
        setProfileData(null);
        setProfileLoading(false);
        return;
      }
      try {
        setProfileLoading(true);
        const supabase = createClient();
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", activeUser.id)
          .maybeSingle();

        if (data) {
          const fullName = data.full_name ?? activeUser.email?.split("@")[0] ?? "";
          const [firstName, ...rest] = fullName.split(" ");
          const savedAddress = data.billing_address && typeof data.billing_address === "object"
            ? data.billing_address
            : null;

          setProfileData({
            firstName,
            lastName: rest.join(" "),
            email: data.email ?? activeUser.email ?? "",
            phone: data.phone_number ?? "",
            country: data.country ?? "United States",
            billingAddress: savedAddress,
          });
        } else {
          const fallbackName = activeUser.email?.split("@")[0] ?? "";
          setProfileData({
            firstName: fallbackName,
            lastName: "",
            email: activeUser.email ?? "",
            phone: "",
            country: "United States",
            billingAddress: null,
          });
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setProfileLoading(false);
      }
    }
    fetchProfile();
  }, [checkoutUser, user]);

  const { register, handleSubmit, formState: { errors }, watch, setValue, control } = useForm<FormValues>({
    resolver: yupResolver(schema) as any,
    mode: "onBlur",
    defaultValues: {
      firstName: profileData?.firstName ?? "",
      lastName: profileData?.lastName ?? "",
      company: profileData?.billingAddress?.company ?? "",
      address: profileData?.billingAddress?.address ?? "",
      country: profileData?.billingAddress?.country ?? profileData?.country ?? "United States",
      region: profileData?.billingAddress?.region ?? "",
      city: profileData?.billingAddress?.city ?? "",
      zipCode: profileData?.billingAddress?.zipCode ?? "",
      email: profileData?.email ?? "",
      phone: profileData?.phone ?? "",
      shipDifferentAddress: false,
      orderNotes: "",
      paymentMethod: "card",
      fallbackCard: { nameOnCard: "", cardNumber: "", expiry: "", cvc: "" }
    }
  });

  // Update form values when profile data loads
  useEffect(() => {
    if (profileData && isLoggedIn) {
      setValue("firstName", profileData.firstName ?? "", { shouldValidate: true });
      setValue("lastName", profileData.lastName ?? "", { shouldValidate: true });
      setValue("company", profileData.billingAddress?.company ?? "", { shouldValidate: true });
      setValue("address", profileData.billingAddress?.address ?? "", { shouldValidate: true });
      setValue("country", profileData.billingAddress?.country ?? profileData.country ?? "United States", { shouldValidate: true });
      setValue("region", profileData.billingAddress?.region ?? "", { shouldValidate: true });
      setValue("city", profileData.billingAddress?.city ?? "", { shouldValidate: true });
      setValue("zipCode", profileData.billingAddress?.zipCode ?? "", { shouldValidate: true });
      setValue("email", profileData.email ?? "", { shouldValidate: true });
      setValue("phone", profileData.phone ?? "", { shouldValidate: true });
    }
  }, [profileData, isLoggedIn, setValue]);

  const paymentMethod = watch("paymentMethod");
  const shipDifferentAddress = watch("shipDifferentAddress");
  const country = watch("country");
  const region = watch("region");
  const fallbackCard = watch("fallbackCard");
  const orderNotes = watch("orderNotes");
  const stripePaymentElementOptions = profileData ? {
    defaultValues: {
      billingDetails: {
        name: `${profileData.firstName} ${profileData.lastName}`.trim(),
        email: profileData.email,
        phone: profileData.phone,
        address: {
          line1: profileData.billingAddress?.address ?? "",
          country: toStripeCountryCode(profileData.billingAddress?.country ?? profileData.country),
          state: profileData.billingAddress?.region ?? "",
          city: profileData.billingAddress?.city ?? "",
          postal_code: profileData.billingAddress?.zipCode ?? "",
        },
      },
    },
    wallets: {
      applePay: "never",
      googlePay: "never",
    },
  } : undefined;

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (key && isLoggedIn && isProfileComplete && paymentMethod === "card") setStripePromise(loadStripe(key));
  }, [isLoggedIn, isProfileComplete, paymentMethod]);

  const [outOfStockIds, setOutOfStockIds] = useState<Set<string | number>>(new Set());
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const subTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discount_percent > 0) {
      discount = subTotal * (appliedCoupon.discount_percent / 100);
    } else if (appliedCoupon.discount_amount > 0) {
      discount = appliedCoupon.discount_amount;
    }
  }
  const tax = subTotal * (settings.taxRate / 100);
  const total = subTotal - discount + tax;

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const creatingPiRef = useRef(false);
  const lastTotalRef = useRef(0);
  const stripeInstanceRef = useRef<any>(null);
  const elementsInstanceRef = useRef<any>(null);



  const availableCart = cart.filter((item) => !outOfStockIds.has(item.id));

  const getAuthHeader = async (): Promise<Record<string, string>> => {
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    async function checkStock() {
      const supabase = createClient();
      const ids = cart.map((i) => String(i.id));
      const { data } = await supabase
        .from("products")
        .select("id, stock_quantity")
        .in("id", ids);
      if (data) {
        const outIds = new Set<string | number>();
        for (const item of cart) {
          const match = data.find((p) => String(p.id) === String(item.id));
          if (!match || Number(match.stock_quantity) <= 0) {
            outIds.add(item.id);
          }
        }
        setOutOfStockIds(outIds);
      }
    }
    if (cart.length > 0) checkStock();
  }, [cart]);

  useEffect(() => {
    if (isLoggedIn && isProfileComplete && paymentMethod === "card" && stripePromise && total > 0 && !clientSecret && !creatingPiRef.current) {
      creatingPiRef.current = true;
      lastTotalRef.current = total;
      stripeInstanceRef.current = null;
      elementsInstanceRef.current = null;
      const createIntent = async () => {
        const headers = await getAuthHeader();
        const r = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...headers },
          body: JSON.stringify({ amount: total, currency: "inr" }),
        });
        return r.json();
      };
      createIntent()
        .then((data) => {
          if (data.clientSecret) {
            setClientSecret(data.clientSecret);
            setPaymentIntentId(data.paymentIntentId || null);
          }
          creatingPiRef.current = false;
        })
        .catch(() => { creatingPiRef.current = false; });
    }
  }, [isLoggedIn, isProfileComplete, paymentMethod, stripePromise, total, clientSecret]);

  useEffect(() => {
    if (isLoggedIn && isProfileComplete && paymentIntentId && paymentMethod === "card" && total > 0 && lastTotalRef.current !== total) {
      lastTotalRef.current = total;
      const updateIntent = async () => {
        const headers = await getAuthHeader();
        await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...headers },
          body: JSON.stringify({ paymentIntentId, amount: total, currency: "inr" }),
        });
      };
      updateIntent().catch(() => {});
    }
  }, [isLoggedIn, isProfileComplete, total, paymentIntentId, paymentMethod]);


  const onSubmit = async (data: any) => {
    if (availableCart.length === 0) {
      setError("All items in your cart are out of stock.");
      return;
    }

    setIsPlacingOrder(true);
    setError(null);

    const supabase = createClient();

    try {
      const { data: { user: activeUser } } = await supabase.auth.getUser();
      if (!activeUser) {
        setShowLoginPopup(true);
        setIsPlacingOrder(false);
        return;
      }

      if (!isProfileComplete) {
        setShowCompleteProfilePopup(true);
        setIsPlacingOrder(false);
        return;
      }

      const billingWithEmail = {
        firstName: data.firstName, lastName: data.lastName, company: data.company,
        address: data.address, country: data.country, region: data.region,
        city: data.city, zipCode: data.zipCode, phone: data.phone,
        email: data.email || activeUser.email || "",
      };

      const productIdsToCheck = availableCart
        .filter((item) => UUID_PATTERN.test(String(item.id)))
        .map((item) => String(item.id));

      if (productIdsToCheck.length > 0) {
        const { data: stockData, error: stockError } = await supabase
          .from("products")
          .select("id, name, stock_quantity")
          .in("id", productIdsToCheck);

        if (stockError) throw stockError;

        for (const item of availableCart) {
          const pid = String(item.id);
          if (!UUID_PATTERN.test(pid)) continue;
          const product = stockData?.find((p) => p.id === pid);
          if (!product) {
            const names = (stockData ?? []).map((p) => p.name).join(", ");
            throw new Error(`Product ${item.name} (${pid}) not found in DB. Found: ${names || "none"}`);
          }
          if (product.stock_quantity < item.quantity) {
            throw new Error(`Insufficient stock for ${item.name}: only ${product.stock_quantity} available, ${item.quantity} requested`);
          }
        }
      }

      for (const item of availableCart) {
        const pid = String(item.id);
        if (!UUID_PATTERN.test(pid)) continue;
        const { data: ok, error: decErr } = await supabase.rpc("decrement_stock", {
          row_id: pid,
          quantity: item.quantity,
        });
        if (decErr) throw new Error(`Failed to decrement stock for ${item.name}`);
        if (ok === false) {
          throw new Error(`Insufficient stock for ${item.name}: requested=${item.quantity}`);
        }
      }

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: activeUser.id,
          total_amount: total,
          status: 'Pending',
          payment_method: paymentMethod,
          billing_address: billingWithEmail,
          shipping_address: shipDifferentAddress ? billingWithEmail : billingWithEmail,
          notes: orderNotes || null,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItemsToInsert = availableCart.map(item => ({
        order_id: orderData.id,
        product_id: UUID_PATTERN.test(String(item.id)) ? String(item.id) : null,
        product_name: item.name,
        quantity: item.quantity,
        price_at_time: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsToInsert);

      if (itemsError) throw itemsError;

      if (paymentMethod === "card") {
        if (paymentIntentId) {
          await supabase.from('orders').update({ stripe_payment_intent_id: paymentIntentId }).eq('id', orderData.id);

          const piName = `${billingWithEmail.firstName} ${billingWithEmail.lastName}`.trim();
          const piEmail = billingWithEmail.email || activeUser.email || "";
          await fetch("/api/create-payment-intent", {
            method: "POST",
            headers: { "Content-Type": "application/json", ...(await getAuthHeader()) },
            body: JSON.stringify({
              paymentIntentId,
              amount: total,
              currency: "inr",
              order_id: orderData.id,
              description: `Order #${orderData.id.slice(0, 8).toUpperCase()} - ${piName}`,
              receipt_email: piEmail,
              customer_name: piName,
              customer_phone: billingWithEmail.phone,
            }),
          });
        }
      }

      if (paymentMethod === "card" && stripePromise && stripeInstanceRef.current && clientSecret) {
        await elementsInstanceRef.current.submit();
        const { error: paymentError } = await stripeInstanceRef.current.confirmPayment({
          elements: elementsInstanceRef.current,
          clientSecret,
          redirect: "if_required",
          confirmParams: {
            return_url: `${window.location.origin}/checkout/success?orderId=${orderData.id}`,
          },
        });

        if (paymentError) {
          for (const item of availableCart) {
            const pid = String(item.id);
            if (!UUID_PATTERN.test(pid)) continue;
            const { error: incErr } = await supabase.rpc("increment_stock", {
              row_id: pid,
              quantity: item.quantity,
            });
            if (incErr) console.error(`Failed to restore stock for ${item.name}:`, incErr.message);
          }
          await supabase.from('orders').update({ status: 'Failed' }).eq('id', orderData.id);
          throw paymentError;
        }
      }

      if (appliedCoupon) {
        await supabase
          .from("promotions")
          .update({ usage_count: (appliedCoupon.usage_count || 0) + 1 })
          .eq("id", appliedCoupon.id);
      }

      clearCart();
      router.push(`/checkout/success?orderId=${orderData.id}`);

    } catch (err: any) {
      setError(err.message || "Failed to place order.");
      setIsPlacingOrder(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    setCouponError("");
    const supabase = createClient();
    const { data } = await supabase
      .from("promotions")
      .select("*")
      .ilike("code", couponCode.trim())
      .eq("is_active", true)
      .maybeSingle();
    if (!data) {
      setCouponError("Invalid or expired coupon code");
      setApplyingCoupon(false);
      return;
    }
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      setCouponError("This coupon has expired");
      setApplyingCoupon(false);
      return;
    }
    if (data.usage_limit > 0 && data.usage_count >= data.usage_limit) {
      setCouponError("This coupon has reached its usage limit");
      setApplyingCoupon(false);
      return;
    }
    if (data.min_order_amount > 0 && subTotal < data.min_order_amount) {
      setCouponError(`Minimum order amount of ₹${data.min_order_amount} required`);
      setApplyingCoupon(false);
      return;
    }
    setAppliedCoupon(data);
    setApplyingCoupon(false);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  const states = country ? Object.keys(COUNTRIES[country]?.states || {}) : [];
  const cities = country && region ? COUNTRIES[country]?.states[region] || [] : [];

  const renderInput = (field: keyof FormValues, label: string, opts?: { type?: string; placeholder?: string; optional?: boolean; disabled?: boolean }) => {
    const err = errors[field]?.message as string;
    const isDisabled = opts?.disabled ?? (mounted && isLoggedIn);
    const showError = err && (!isDisabled || !mounted || !isLoggedIn); // Don't show errors for disabled (auto-filled) fields
    return (
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1.5 block">
          {label} {opts?.optional && <span className="text-gray-400 font-normal">(Optional)</span>}
        </label>
        <div className="relative">
          <Input
            type={opts?.type || "text"}
            {...register(field)}
            placeholder={opts?.placeholder || ""}
            disabled={isDisabled}
            className={`h-11 border-gray-200 focus-visible:ring-brand-orange ${isDisabled ? "bg-gray-50 cursor-not-allowed" : ""} ${showError ? "border-red-400 focus-visible:ring-red-400" : ""}`}
          />
          {showError && <XCircle className="w-4 h-4 text-red-400 absolute right-3 top-1/2 -translate-y-1/2" />}
        </div>
        {showError && <p className="text-xs text-red-500 mt-1">{err}</p>}
      </div>
    );
  };

  const handleCheckoutSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!isLoggedIn) {
      e.preventDefault();
      setError(null);
      setShowLoginPopup(true);
      return;
    }

    if (!isProfileComplete) {
      e.preventDefault();
      setError(null);
      setShowCompleteProfilePopup(true);
      return;
    }

    handleSubmit(onSubmit)(e);
  };

  const handlePaymentMethodSelect = (methodId: string) => {
    setValue("paymentMethod", methodId, { shouldValidate: true });

    if (!isLoggedIn) {
      setError("Please sign in to make payment.");
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="container mx-auto px-4 md:px-8 py-3 text-sm text-gray-500 flex items-center gap-2">
          <Link href="/" className="hover:text-brand-orange flex items-center gap-1"><span>🏠</span> Home</Link>
          <span className="text-gray-400">›</span>
          <Link href="/cart" className="hover:text-brand-orange">Shopping Card</Link>
          <span className="text-gray-400">›</span>
          <span className="text-brand-orange font-medium">Checkout</span>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-10">
        <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          
          <div className="lg:col-span-2 space-y-10">

          
            <div>
              <div className="flex items-center gap-2 mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Billing Information</h2>
                {isLoggedIn && profileData && (
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded flex items-center gap-1">
                    <User className="w-3 h-3" /> Auto-filled from account
                  </span>
                )}
              </div>

{billingDisplay}

           
            <div className="border border-gray-100 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Payment Option</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 text-center text-sm font-medium">
                {[
                  settings.codEnabled && { id: "cod", label: "Cash on Delivery", icon: <span className="text-orange-500 font-bold text-xl">₹</span> },
                  // { id: "venmo", label: "Venmo", icon: <span className="text-blue-500 font-bold text-xl">v</span> },
                  // settings.paypalEnabled && { id: "paypal", label: "Paypal", icon: <span className="text-blue-800 font-bold text-xl">P</span> },
                  // { id: "amazon", label: "Amazon Pay", icon: <span className="text-black font-bold text-xl">a</span> },
                  settings.stripeEnabled && { id: "card", label: "Debit/Credit Card", icon: <CreditCard className="w-6 h-6 text-orange-500 mx-auto" /> },
                ].filter(Boolean).map((method: any) => (
                  <button key={method.id} type="button" role="radio" aria-checked={paymentMethod === method.id}
                    onClick={() => !method.disabled && handlePaymentMethodSelect(method.id)}
                    className={`p-4 border-b border-r border-gray-100 transition-colors ${method.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'} ${paymentMethod === method.id ? 'bg-orange-50/30' : ''}`}>
                    <div className="mb-2 h-6 flex items-center justify-center">{method.icon}</div>
                    <div className="text-xs text-gray-700 mb-3">{method.label}{method.disabled && <span className="block text-[10px] text-red-400 mt-0.5">Unavailable</span>}</div>
                    <div className={`w-4 h-4 mx-auto rounded-full border flex items-center justify-center ${paymentMethod === method.id ? 'border-brand-orange' : 'border-gray-300'}`}>
                      {paymentMethod === method.id && <div className="w-2 h-2 rounded-full bg-brand-orange" />}
                    </div>
                  </button>
                ))}
              </div>
              {(!mounted || !isLoggedIn) && (
                <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-center gap-3">
                  <Lock className="w-5 h-5 text-brand-orange flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-700">Please <Link href="/signin?redirectTo=/checkout" className="text-brand-orange hover:underline font-semibold">sign in</Link> to make payment</span>
                </div>
              )}
              {paymentMethod === "card" && (
                <div className="p-6 space-y-4">
                  {!isLoggedIn ? (
                    <div className="flex items-center justify-center gap-3 text-sm text-gray-500 p-8 bg-gray-50 rounded-lg border border-gray-200">
                      <Lock className="w-5 h-5 text-brand-orange" />
                      <span className="font-medium text-gray-700">Please <Link href="/signin?redirectTo=/checkout" className="text-brand-orange hover:underline font-semibold">sign in</Link> to enable Debit/Credit Card payment</span>
                    </div>
                  ) : !isProfileComplete ? (
                    <div className="flex items-center justify-center gap-3 text-sm text-gray-500 p-8 bg-gray-50 rounded-lg border border-gray-200">
                      <AlertCircle className="w-5 h-5 text-brand-orange" />
                      <span className="font-medium text-gray-700">Please complete your account details to make payment</span>
                    </div>
                  ) : stripePromise ? (
                    clientSecret ? (
                      <Elements stripe={stripePromise} options={{ clientSecret }}>
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 mb-4">
                          <p className="text-sm font-medium text-blue-700">Secure payment via Stripe</p>
                        </div>
                        <StripeElementsInner paymentElementOptions={stripePaymentElementOptions} onReady={(s, e) => { stripeInstanceRef.current = s; elementsInstanceRef.current = e; }} />
                        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
                      </Elements>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-gray-500 p-4">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Preparing secure payment...
                      </div>
                    )
                  ) : (
                    <>
                      <div><label className="text-sm font-medium text-gray-700 mb-1.5 block">Name on Card</label>
                        <Input {...register("fallbackCard.nameOnCard")}
                          placeholder="" className={`h-11 border-gray-200 ${errors.fallbackCard?.nameOnCard ? "border-red-400" : ""}`} />
                        {errors.fallbackCard?.nameOnCard && <p className="text-xs text-red-500 mt-1">{errors.fallbackCard.nameOnCard.message}</p>}
                      </div>
                      <div><label className="text-sm font-medium text-gray-700 mb-1.5 block">Card Number</label>
                        <Input {...register("fallbackCard.cardNumber")}
                          placeholder="0000 0000 0000 0000" className={`h-11 border-gray-200 ${errors.fallbackCard?.cardNumber ? "border-red-400" : ""}`} />
                        {errors.fallbackCard?.cardNumber && <p className="text-xs text-red-500 mt-1">{errors.fallbackCard.cardNumber.message}</p>}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-sm font-medium text-gray-700 mb-1.5 block">Expire Date</label>
                          <Input {...register("fallbackCard.expiry")}
                            placeholder="MM/YY" className={`h-11 border-gray-200 ${errors.fallbackCard?.expiry ? "border-red-400" : ""}`} />
                          {errors.fallbackCard?.expiry && <p className="text-xs text-red-500 mt-1">{errors.fallbackCard.expiry.message}</p>}
                        </div>
                        <div><label className="text-sm font-medium text-gray-700 mb-1.5 block">CVC</label>
                          <Input {...register("fallbackCard.cvc")}
                            placeholder="000" className={`h-11 border-gray-200 ${errors.fallbackCard?.cvc ? "border-red-400" : ""}`} />
                          {errors.fallbackCard?.cvc && <p className="text-xs text-red-500 mt-1">{errors.fallbackCard.cvc.message}</p>}
                        </div>
                      </div>
                    </>
                  )}
</div>
               )}
             </div>

           
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Order Notes <span className="text-gray-400 font-normal">(Optional)</span></label>
              <textarea rows={4} placeholder="Notes about your order, e.g. special notes for delivery"
                {...register("orderNotes")}
                className="w-full border border-gray-200 rounded p-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-orange resize-none" />
            </div>
          </div>

          </div>

          <div>
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-5">Order Summary</h2>

              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2">
                {cart.length === 0 ? (
                  <p className="text-sm text-gray-500">Your cart is empty.</p>
                ) : (
                  cart.map((item) => {
                    const isOos = outOfStockIds.has(item.id);
                    return (
                      <div key={item.id} className={`flex gap-3 ${isOos ? "opacity-50" : ""}`}>
                        <div className="w-12 h-12 border border-gray-100 rounded flex-shrink-0 relative overflow-hidden">
                          <Image src={fixImageUrl(item.image, item.name)} alt={item.name} fill sizes="64px" className="object-contain p-1" />
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <p className="text-xs text-gray-800 line-clamp-1">{item.name}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {isOos ? <span className="text-red-500 font-medium">Out of stock</span> : `${item.quantity} x `}
                            {!isOos && <span className="text-brand-blue font-semibold">₹{item.price.toLocaleString()}</span>}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="space-y-3 text-sm border-t border-gray-100 pt-4">
                <div className="flex justify-between text-gray-600">
                  <span>Sub-total</span>
                  <span className="font-medium text-gray-900">₹{subTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-medium text-green-500">Free</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span className="font-medium text-gray-900">₹{tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="border-t border-gray-100 pt-4 mt-2 flex justify-between items-center">
                  <span className="font-medium text-gray-900">Total</span>
                  <span className="font-bold text-lg text-gray-900">₹{total.toLocaleString(undefined, { minimumFractionDigits: 2 })} INR</span>
                </div>
              </div>

              {error && <div className="text-red-500 text-sm mb-4 text-center bg-red-50 p-3 rounded">{error}</div>}

              
              <div className="border-t border-gray-100 pt-4 mb-4">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Coupon Code</label>
                <div className="flex gap-2">
                  <Input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter coupon code"
                    className="h-11 border-gray-200 flex-1"
                    disabled={!!appliedCoupon}
                  />
                  <Button
                    onClick={handleApplyCoupon}
                    disabled={!couponCode.trim() || !!appliedCoupon || applyingCoupon}
                    variant="outline"
                    className="h-11 border-brand-orange text-brand-orange font-semibold"
                  >
                    {applyingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : appliedCoupon ? "Applied" : "Apply"}
                  </Button>
                </div>
                {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
                {appliedCoupon && (
                  <div className="flex items-center justify-between bg-green-50 p-2 rounded mt-2">
                    <span className="text-xs text-green-700 font-medium">Coupon applied: {appliedCoupon.code} ({appliedCoupon.discount_percent > 0 ? `${appliedCoupon.discount_percent}% off` : `₹${appliedCoupon.discount_amount} off`})</span>
                    <button onClick={handleRemoveCoupon} className="text-red-500 hover:text-red-700"><X className="w-3.5 h-3.5" /></button>
                  </div>
                )}
              </div>

              <Button type="submit" disabled={isPlacingOrder || cart.length === 0 || (isLoggedIn && isProfileComplete && paymentMethod === "card" && stripePromise && !clientSecret)}
                className="w-full bg-brand-orange hover:bg-orange-600 text-white font-bold h-14 uppercase tracking-wide flex items-center justify-center gap-2">
                {isPlacingOrder ? <Loader2 className="w-6 h-6 animate-spin" /> : "PLACE ORDER"}
                {!isPlacingOrder && <ArrowRight className="w-5 h-5" />}
              </Button>
            </div>
          </div>

        </form>
      </div>

      
      {showLoginPopup && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-8 shadow-2xl text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-brand-orange" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Sign in to Continue</h2>
            <p className="text-sm text-gray-500 mb-8">Please sign in or create an account to place your order.</p>
            <div className="flex flex-col gap-3">
              <Button asChild className="w-full bg-brand-orange hover:bg-orange-600 text-white font-bold h-12">
                <Link href="/signin?redirectTo=/checkout">Sign In</Link>
              </Button>
              <Button asChild variant="outline" className="w-full border-gray-200 h-12">
                <Link href="/signup?redirectTo=/checkout">Create Account</Link>
              </Button>
              <button onClick={() => setShowLoginPopup(false)} className="text-sm text-gray-500 hover:text-gray-700 mt-2">Continue as Guest</button>
            </div>
          </div>
        </div>
      )}

      {showCompleteProfilePopup && (
        <AlertDialog open={showCompleteProfilePopup} onOpenChange={setShowCompleteProfilePopup}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertCircle className="w-10 h-10 text-orange-500 mx-auto mb-3" />
              <AlertDialogTitle className="text-lg font-bold text-gray-900">Complete Your Profile</AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-gray-500">
                Please complete your account details to make payment.
                Update your details in <strong>Account Settings</strong> before placing an order.
                We need your billing address and contact information to process your order.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowCompleteProfilePopup(false)}>Cancel</AlertDialogCancel>
              <AlertDialogAction asChild>
                <Link href="/account/settings?redirectTo=/checkout">
                  <Button className="bg-brand-orange hover:bg-orange-600">Go to Account Settings</Button>
                </Link>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
