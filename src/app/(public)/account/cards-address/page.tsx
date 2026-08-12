"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoreHorizontal, Edit, Trash2, X, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface SavedCard {
  id: string;
  cardName: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
  balance: number;
}

interface AddressData {
  name: string;
  address: string;
  phone: string;
  email: string;
}

export default function CardsAddressPage() {
  const [showCardMenu, setShowCardMenu] = useState<number | null>(null);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [profile, setProfile] = useState<any>(null);

  const [newCard, setNewCard] = useState({ cardName: "", cardNumber: "", expiry: "", cvc: "" });
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});

  const [editBilling, setEditBilling] = useState(false);
  const [editShipping, setEditShipping] = useState(false);
  const [billingAddr, setBillingAddr] = useState<AddressData>({ name: "", address: "", phone: "", email: "" });
  const [shippingAddr, setShippingAddr] = useState<AddressData>({ name: "", address: "", phone: "", email: "" });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      setProfile(data);
      const name = data?.full_name || user.email?.split("@")[0] || "";
      const addr = data?.billing_address;
      setBillingAddr({
        name: addr?.firstName || name,
        address: [addr?.address, addr?.city, addr?.region, addr?.country].filter(Boolean).join(", ") || "Not set",
        phone: data?.phone_number || "Not set",
        email: data?.email || user.email || "",
      });
      setShippingAddr({
        name: addr?.firstName || name,
        address: [addr?.address, addr?.city, addr?.region, addr?.country].filter(Boolean).join(", ") || "Not set",
        phone: data?.phone_number || "Not set",
        email: data?.email || user.email || "",
      });

      const { data: cardData } = await supabase
        .from("saved_cards")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setSavedCards(
        (cardData ?? []).map((c: any) => ({
          id: c.id,
          cardName: c.card_name,
          cardNumber: c.card_number,
          expiry: c.expiry,
          cvc: c.cvc,
          balance: Math.floor(Math.random() * 90000 + 1000),
        }))
      );
    };
    fetchProfile();
  }, []);

  const validateCard = () => {
    const errors: Record<string, string> = {};
    if (!newCard.cardName.trim()) errors.cardName = "Name is required";
    const digits = newCard.cardNumber.replace(/\s/g, "");
    if (!digits || !/^\d{13,19}$/.test(digits)) errors.cardNumber = "Enter a valid card number (13-19 digits)";
    if (!/^\d{2}\/\d{2}$/.test(newCard.expiry)) errors.expiry = "Use MM/YY format";
    if (!/^\d{3,4}$/.test(newCard.cvc)) errors.cvc = "CVC must be 3 or 4 digits";
    setCardErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddCard = async () => {
    if (!validateCard()) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const masked = `**** **** **** ${newCard.cardNumber.slice(-4)}`;
    const { data, error } = await supabase
      .from("saved_cards")
      .insert({
        user_id: user.id,
        card_name: newCard.cardName,
        card_number: masked,
        expiry: newCard.expiry,
        cvc: newCard.cvc,
      })
      .select()
      .single();

    if (error) {
      toast.error(error.message);
      return;
    }

    const card: SavedCard = {
      id: data.id,
      cardName: data.card_name,
      cardNumber: data.card_number,
      expiry: data.expiry,
      cvc: data.cvc,
      balance: Math.floor(Math.random() * 90000 + 1000),
    };
    setSavedCards([...savedCards, card]);
    setShowAddCardModal(false);
    setNewCard({ cardName: "", cardNumber: "", expiry: "", cvc: "" });
    setCardErrors({});
    toast.success("Card added successfully");
  };

  const deleteCard = async (id: string) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("saved_cards")
      .delete()
      .eq("user_id", user.id)
      .eq("id", id);

    if (error) {
      toast.error(error.message);
      return;
    }

    setSavedCards(savedCards.filter((c) => c.id !== id));
    toast.success("Card removed");
  };

  const saveAddress = async (type: "billing" | "shipping", data: AddressData) => {
    if (!profile) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        billing_address: { firstName: data.name, address: data.address, phone: data.phone, email: data.email },
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`${type === "billing" ? "Billing" : "Shipping"} address saved`);
      if (type === "billing") {
        setEditBilling(false);
      } else {
        setEditShipping(false);
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-md border border-gray-100 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">PAYMENT OPTION</h3>
          <button onClick={() => setShowAddCardModal(true)} className="text-brand-orange text-sm font-medium hover:underline flex items-center gap-1">
            Add Card →
          </button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2">
          {savedCards.length === 0 && (
            <div className="w-full text-center py-8 text-gray-400 text-sm">No saved cards. Click "Add Card" to add one.</div>
          )}
          {savedCards.map((card, idx) => (
            <div key={card.id} className="w-[300px] h-[170px] bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl p-5 flex flex-col justify-between flex-shrink-0 relative">
              <div className="flex justify-between items-start">
                <p className="text-white text-xl font-bold">₹{card.balance.toLocaleString()}</p>
                <div className="relative">
                  <button onClick={() => setShowCardMenu(showCardMenu === idx ? null : idx)} className="text-white/80 hover:text-white text-xl"><MoreHorizontal className="w-5 h-5" /></button>
                  {showCardMenu === idx && (
                    <div className="absolute right-0 top-8 bg-white rounded-md shadow-lg border border-gray-100 py-1 w-36 z-20">
                      <button onClick={() => deleteCard(card.id)} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2"><Trash2 className="w-3.5 h-3.5" /> Delete Card</button>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <p className="text-teal-100 text-[10px] uppercase tracking-wider mb-0.5">CARD NUMBER</p>
                <p className="text-white text-sm tracking-widest mb-3">{card.cardNumber}</p>
                <div className="flex justify-between items-center">
                  <span className="text-white font-bold text-lg">VISA</span>
                  <span className="text-white text-sm">{card.cardName}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-md border border-gray-100 p-6 shadow-sm">
          <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">BILLING ADDRESS</h4>
          {editBilling ? (
            <div className="space-y-3">
              <Input value={billingAddr.name} onChange={(e) => setBillingAddr({ ...billingAddr, name: e.target.value })} placeholder="Name" className="h-10" />
              <Input value={billingAddr.address} onChange={(e) => setBillingAddr({ ...billingAddr, address: e.target.value })} placeholder="Address" className="h-10" />
              <Input value={billingAddr.phone} onChange={(e) => setBillingAddr({ ...billingAddr, phone: e.target.value })} placeholder="Phone" className="h-10" />
              <Input value={billingAddr.email} onChange={(e) => setBillingAddr({ ...billingAddr, email: e.target.value })} placeholder="Email" className="h-10" />
              <div className="flex gap-2">
                <Button onClick={() => saveAddress("billing", billingAddr)} disabled={saving} className="bg-brand-orange text-white h-10">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                </Button>
                <Button variant="outline" onClick={() => setEditBilling(false)} className="h-10">Cancel</Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm font-bold text-gray-900 mb-3">{billingAddr.name}</p>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">{billingAddr.address}</p>
              <p className="text-sm text-gray-500 mb-1"><span className="font-medium text-gray-700">Phone:</span> {billingAddr.phone}</p>
              <p className="text-sm text-gray-500 mb-6"><span className="font-medium text-gray-700">Email:</span> {billingAddr.email}</p>
              <Button variant="outline" onClick={() => setEditBilling(true)} className="border-brand-orange text-brand-orange hover:bg-orange-50 font-bold text-xs uppercase tracking-wide h-10 px-6">
                EDIT ADDRESS
              </Button>
            </>
          )}
        </div>

        <div className="bg-white rounded-md border border-gray-100 p-6 shadow-sm">
          <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">SHIPPING ADDRESS</h4>
          {editShipping ? (
            <div className="space-y-3">
              <Input value={shippingAddr.name} onChange={(e) => setShippingAddr({ ...shippingAddr, name: e.target.value })} placeholder="Name" className="h-10" />
              <Input value={shippingAddr.address} onChange={(e) => setShippingAddr({ ...shippingAddr, address: e.target.value })} placeholder="Address" className="h-10" />
              <Input value={shippingAddr.phone} onChange={(e) => setShippingAddr({ ...shippingAddr, phone: e.target.value })} placeholder="Phone" className="h-10" />
              <Input value={shippingAddr.email} onChange={(e) => setShippingAddr({ ...shippingAddr, email: e.target.value })} placeholder="Email" className="h-10" />
              <div className="flex gap-2">
                <Button onClick={() => saveAddress("shipping", shippingAddr)} disabled={saving} className="bg-brand-orange text-white h-10">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                </Button>
                <Button variant="outline" onClick={() => setEditShipping(false)} className="h-10">Cancel</Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm font-bold text-gray-900 mb-3">{shippingAddr.name}</p>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">{shippingAddr.address}</p>
              <p className="text-sm text-gray-500 mb-1"><span className="font-medium text-gray-700">Phone:</span> {shippingAddr.phone}</p>
              <p className="text-sm text-gray-500 mb-6"><span className="font-medium text-gray-700">Email:</span> {shippingAddr.email}</p>
              <Button variant="outline" onClick={() => setEditShipping(true)} className="border-brand-orange text-brand-orange hover:bg-orange-50 font-bold text-xs uppercase tracking-wide h-10 px-6">
                EDIT ADDRESS
              </Button>
            </>
          )}
        </div>
      </div>

      {showAddCardModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddCardModal(false)}>
          <div className="bg-white rounded-lg w-full max-w-md p-8 shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-bold text-gray-900 uppercase tracking-wider text-sm">ADD NEW CARD</h3>
              <button onClick={() => setShowAddCardModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Name on Card</label>
                <Input value={newCard.cardName} onChange={(e) => setNewCard({ ...newCard, cardName: e.target.value })} className="h-11 border-gray-200" />
                {cardErrors.cardName && <p className="text-xs text-red-500">{cardErrors.cardName}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Card Number</label>
                <Input value={newCard.cardNumber} onChange={(e) => setNewCard({ ...newCard, cardNumber: e.target.value })} placeholder="0000 0000 0000 0000" className="h-11 border-gray-200" />
                {cardErrors.cardNumber && <p className="text-xs text-red-500">{cardErrors.cardNumber}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Expire Date</label>
                  <Input value={newCard.expiry} onChange={(e) => setNewCard({ ...newCard, expiry: e.target.value })} placeholder="MM/YY" className="h-11 border-gray-200" />
                  {cardErrors.expiry && <p className="text-xs text-red-500">{cardErrors.expiry}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">CVC</label>
                  <Input value={newCard.cvc} onChange={(e) => setNewCard({ ...newCard, cvc: e.target.value })} placeholder="000" className="h-11 border-gray-200" />
                  {cardErrors.cvc && <p className="text-xs text-red-500">{cardErrors.cvc}</p>}
                </div>
              </div>
              <Button onClick={handleAddCard} className="bg-brand-orange hover:bg-orange-600 text-white font-bold h-12 px-8 uppercase tracking-wide w-full">
                ADD CARD
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
