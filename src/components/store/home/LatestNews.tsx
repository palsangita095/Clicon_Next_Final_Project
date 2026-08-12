import Image from "next/image";
import { Calendar, User, MessageCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { fixImageUrl } from "@/lib/imageFallback";

export default function LatestNews() {
  const news = [
    {
      id: 1,
      slug: "best-wireless-earbuds-2024",
      title: "The Best Wireless Earbuds of 2024: A Complete Buying Guide",
      excerpt: "From battery life to noise cancellation, here is everything you need to know before buying your next pair of wireless earbuds.",
      image: fixImageUrl("https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800&q=80", "Tech News 1"),
      author: "Cameron Williamson",
      date: "24 May, 2024",
      comments: 4
    },
    {
      id: 2,
      slug: "laptop-buying-guide-2024",
      title: "Laptop Buying Guide: What to Look For Before You Spend",
      excerpt: "Processor, RAM, storage, display — here is how to pick a laptop that will still feel fast in five years.",
      image: fixImageUrl("https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=80", "Tech News 2"),
      author: "Floyd Miles",
      date: "17 Oct, 2020",
      comments: 4
    },
    {
      id: 3,
      slug: "noise-cancellation-explained",
      title: "Noise Cancellation Explained: How ANC Actually Works",
      excerpt: "What is active noise cancellation, how does it work, and is it really worth the extra money?",
      image: fixImageUrl("https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80", "Tech News 3"),
      author: "Bessie Cooper",
      date: "8 Sep, 2020",
      comments: 4
    }
  ];

  return (
    <div className="bg-gray-50 py-16 mt-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">Latest News</h2>
          <p className="text-gray-500 mt-2 max-w-2xl mx-auto">Stay up to date with the latest product launches, buying guides, and tech tips from our experts.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {news.map((item) => (
            <div key={item.id} className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow group">
              <Link href={`/blog/${item.slug || item.id}`} className="block relative overflow-hidden aspect-[16/10]">
                <Image src={item.image} alt={item.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-300" />
              </Link>
              <div className="p-6">
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1"><User size={14} className="text-brand-orange" /> {item.author}</div>
                  <div className="flex items-center gap-1"><Calendar size={14} className="text-brand-orange" /> {item.date}</div>
                  <div className="flex items-center gap-1"><MessageCircle size={14} className="text-brand-orange" /> {item.comments}</div>
                </div>
                <Link href={`/blog/${item.slug || item.id}`}>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 hover:text-brand-orange cursor-pointer transition-colors">
                    {item.title}
                  </h3>
                </Link>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {item.excerpt}
                </p>
                <Link
                  href={`/blog/${item.slug || item.id}`}
                  className="inline-flex items-center gap-2 hover:gap-3 text-brand-orange font-bold transition-all text-sm uppercase"
                >
                  Read More <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
