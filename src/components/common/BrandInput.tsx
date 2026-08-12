"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface Brand {
  id: string;
  name: string;
}

interface BrandInputProps {
  value: string;
  onChange: (brandId: string) => void;
  categoryId?: string;
}

export default function BrandInput({ value, onChange, categoryId }: BrandInputProps) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchBrands = async () => {
      const supabase = createClient();
      let query = supabase.from("brands").select("id, name");
      if (categoryId) query = query.eq("brand_categories.category_id", categoryId);
      const { data } = await query.order("name");
      if (data) setBrands(data);
    };
    fetchBrands();
  }, [categoryId]);

  // Set input value from the selected brand id
  useEffect(() => {
    if (value) {
      const brand = brands.find((b) => b.id === value);
      if (brand) setInputValue(brand.name);
    }
  }, [value, brands]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = brands.filter((b) =>
    b.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  const exactMatch = brands.some(
    (b) => b.name.toLowerCase() === inputValue.trim().toLowerCase()
  );

  const handleSelect = (brandId: string) => {
    onChange(brandId);
    const brand = brands.find((b) => b.id === brandId);
    if (brand) setInputValue(brand.name);
    setOpen(false);
  };

  const handleCreate = async () => {
    const name = inputValue.trim();
    if (!name) return;
    setCreating(true);
    try {
      const supabase = createClient();
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const payload: Record<string, any> = { name, slug };
      if (categoryId) payload.category_id = categoryId;
      const { data, error } = await supabase.from("brands").insert(payload).select("id").maybeSingle();
      if (error) {
        return;
      }
      if (data) {
        if (categoryId) {
          await supabase.from("brand_categories").insert({ brand_id: data.id, category_id: categoryId });
        }
        onChange(data.id);
        setInputValue(name);
        setBrands((prev) => [...prev, { id: data.id, name }].sort((a, b) => a.name.localeCompare(b.name)));
      }
    } finally {
      setCreating(false);
      setOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => { setInputValue(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="Type brand name..."
        className="w-full h-11 border border-gray-200 rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange bg-white"
      />
      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
          {filtered.length > 0 && filtered.map((brand) => (
            <button
              key={brand.id}
              type="button"
              onClick={() => handleSelect(brand.id)}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${value === brand.id ? "bg-brand-orange/10 text-brand-orange font-medium" : "text-gray-700"}`}
            >
              {brand.name}
            </button>
          ))}
          {inputValue.trim() && !exactMatch && (
            <button
              type="button"
              onClick={handleCreate}
              disabled={creating}
              className="w-full text-left px-3 py-2 text-sm text-brand-orange font-medium hover:bg-orange-50 transition-colors border-t border-gray-100 disabled:opacity-50"
            >
              {creating ? "Creating..." : `+ Create "${inputValue.trim()}"`}
            </button>
          )}
          {!inputValue.trim() && filtered.length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-400">No brands found</div>
          )}
        </div>
      )}
    </div>
  );
}
