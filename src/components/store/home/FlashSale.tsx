"use client";

import Image from "next/image";
import Link from "next/link";
import { useProducts } from "@/hooks/queries/customer/useProducts";
import { fixImageUrl } from "@/lib/imageFallback";

function MiniProductCard({ id, slug, title, price, image }: any) {
  return (
    <Link
      href={`/products/${slug || id}`}
      className="flex gap-4 p-3 border border-gray-100 rounded-lg bg-white hover:border-brand-orange transition-colors cursor-pointer group"
    >
      <div className="w-20 h-20 bg-gray-50 flex-shrink-0 relative flex items-center justify-center rounded overflow-hidden">
        <Image src={fixImageUrl(image, title)} alt={title} fill sizes="80px" className="object-contain group-hover:scale-105 transition-transform" />
      </div>
      <div className="flex flex-col justify-center min-w-0">
        <h4 className="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-brand-orange transition-colors">
          {title}
        </h4>
        <span className="text-brand-blue font-bold mt-1">
          ₹{Number(price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
    </Link>
  );
}

export default function FlashSale({ products: propProducts }: { products?: any[] }) {
  const { data: flashSaleProducts } = useProducts({ isFlashSale: true, limit: 3 });
  const { data: bestSellerProducts } = useProducts({ isBestSeller: true, limit: 3 });
  const { data: topRatedProducts } = useProducts({ isTopRated: true, limit: 3 });
  const { data: newArrivalProducts } = useProducts({ limit: 3, orderBy: "created_at", orderDirection: "desc" });

  const mapProducts = (list?: any[], fallbackStartIndex = 0) => {
    if (list && list.length > 0) {
      return list.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.name || p.title,
        price: Number(p.price),
        image: p.image_urls?.[0] || p.image || "https://placehold.co/100x100?text=Prod",
      }));
    }
    const propSlice = propProducts && propProducts.length >= fallbackStartIndex + 3
      ? propProducts.slice(fallbackStartIndex, fallbackStartIndex + 3)
      : null;

    if (propSlice) {
      return propSlice.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.name || p.title,
        price: Number(p.price),
        image: p.image_urls?.[0] || p.image || "https://placehold.co/100x100?text=Prod",
      }));
    }

    return Array(3).fill(null).map((_, i) => ({
      id: fallbackStartIndex + i,
      slug: `item-${fallbackStartIndex + i}`,
      title: `Amazing Product ${fallbackStartIndex + i + 1}`,
      price: 19 + (fallbackStartIndex + i) * 17,
      image: `https://placehold.co/100x100?text=Prod+${fallbackStartIndex + i + 1}`,
    }));
  };

  const columns = [
    { title: "FLASH SALE TODAY", products: mapProducts(flashSaleProducts, 0) },
    { title: "BEST SELLERS", products: mapProducts(bestSellerProducts, 3) },
    { title: "TOP RATED", products: mapProducts(topRatedProducts, 6) },
    { title: "NEW ARRIVAL", products: mapProducts(newArrivalProducts, 9) },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {columns.map((col, idx) => (
          <div key={idx}>
            <h3 className="text-lg font-bold text-gray-900 mb-6 uppercase">{col.title}</h3>
            <div className="space-y-4">
              {col.products.map((prod) => (
                <MiniProductCard 
                  key={prod.id} 
                  id={prod.id}
                  slug={prod.slug}
                  title={prod.title} 
                  price={prod.price} 
                  image={prod.image} 
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
