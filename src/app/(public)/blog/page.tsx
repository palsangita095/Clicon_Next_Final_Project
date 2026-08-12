"use client";

import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronDown, Calendar, MessageSquare, User } from "lucide-react";
import Image from "next/image";
import { fixImageUrl } from "@/lib/imageFallback";

const CATEGORIES = [
  { name: "Electronics Devices", selected: false },
  { name: "Computer & Laptop", selected: false },
  { name: "Computer Accessories", selected: false },
  { name: "SmartPhone", selected: false },
  { name: "Headphone", selected: false },
  { name: "Mobile Accessories", selected: false },
  { name: "Gaming Console", selected: false },
  { name: "Camera & Photo", selected: false },
];

const LATEST_BLOGS = [
  {
    slug: "best-wireless-earbuds-2024",
    title: "The Best Wireless Earbuds of 2024: A Complete Buying Guide",
    date: "24 May, 2024",
    image: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=200&q=80"
  },
  {
    slug: "laptop-buying-guide-2024",
    title: "Laptop Buying Guide: What to Look For Before You Spend",
    date: "17 Oct, 2020",
    image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=200&q=80"
  },
  {
    slug: "noise-cancellation-explained",
    title: "Noise Cancellation Explained: How ANC Actually Works",
    date: "8 Sep, 2020",
    image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=200&q=80"
  }
];

const BLOG_POSTS = [
  {
    id: 1,
    slug: "best-wireless-earbuds-2024",
    author: "Cameron Williamson",
    date: "24 May, 2024",
    comments: "4",
    title: "The Best Wireless Earbuds of 2024: A Complete Buying Guide",
    excerpt: "From battery life to noise cancellation, here is everything you need to know before buying your next pair of wireless earbuds.",
    image: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800&q=80"
  },
  {
    id: 2,
    slug: "laptop-buying-guide-2024",
    author: "Floyd Miles",
    date: "17 Oct, 2020",
    comments: "4",
    title: "Laptop Buying Guide: What to Look For Before You Spend",
    excerpt: "Processor, RAM, storage, display — here is how to pick a laptop that will still feel fast in five years.",
    image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=80"
  },
  {
    id: 3,
    slug: "noise-cancellation-explained",
    author: "Bessie Cooper",
    date: "8 Sep, 2020",
    comments: "4",
    title: "Noise Cancellation Explained: How ANC Actually Works",
    excerpt: "What is active noise cancellation, how does it work, and is it really worth the extra money?",
    image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80"
  },
  {
    id: 4,
    slug: "smartphone-photography-tips",
    author: "Kristin Watson",
    date: "1 Feb, 2020",
    comments: "4",
    title: "Smartphone Photography: 8 Tips That Instantly Improve Your Photos",
    excerpt: "You don't need a professional camera to take stunning photos. These simple tips will transform your smartphone shots.",
    image: "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&q=80"
  },
  {
    id: 5,
    slug: "battery-life-tips",
    author: "Eleanor Pena",
    date: "12 Mar, 2021",
    comments: "4",
    title: "How to Make Your Devices Last Longer: Battery Life Tips",
    excerpt: "Simple changes to the way you charge and use your devices can add hours to every charge.",
    image: "https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?w=800&q=80"
  },
  {
    id: 6,
    slug: "gaming-setup-essentials",
    author: "Robert Fox",
    date: "4 Apr, 2021",
    comments: "4",
    title: "Gaming Setup Essentials: What Beginners Actually Need",
    excerpt: "From keyboards to headsets, here is what a beginner actually needs for a comfortable gaming setup.",
    image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&q=80"
  }
];

export default function BlogPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="container mx-auto px-4 md:px-8 py-3 text-sm text-gray-500 flex items-center gap-2">
          <Link href="/" className="hover:text-brand-orange flex items-center gap-1">
            <span>🏠</span> Home
          </Link>
          <span className="text-gray-400">›</span>
          <span className="text-gray-400">Pages</span>
          <span className="text-gray-400">›</span>
          <span className="text-brand-orange font-medium">Blog</span>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-16 flex flex-col lg:flex-row gap-8">
        
        {/* Left Sidebar */}
        <div className="w-full lg:w-[320px] flex-shrink-0 space-y-8">
          
          {/* Categories */}
          <div className="border border-gray-100 rounded-md p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-6 uppercase text-sm tracking-wider">CATEGORY</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 cursor-pointer">
                <div className="w-4 h-4 rounded-full border-4 border-brand-orange"></div>
                <span className="text-gray-900 font-medium text-sm">All</span>
              </li>
              {CATEGORIES.map((cat, idx) => (
                <li key={idx} className="flex items-center gap-3 cursor-pointer hover:text-brand-orange">
                  <div className="w-4 h-4 rounded-full border border-gray-300"></div>
                  <span className="text-gray-600 text-sm">{cat.name}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Latest Blog */}
          <div className="border border-gray-100 rounded-md p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-6 uppercase text-sm tracking-wider">LATEST BLOG</h3>
            <div className="space-y-6">
              {LATEST_BLOGS.map((blog) => (
                <Link key={blog.slug} href={`/blog/${blog.slug}`} className="flex gap-4 group cursor-pointer">
                  <div className="w-20 h-16 bg-gray-100 rounded-md overflow-hidden relative flex-shrink-0">
                    <Image src={fixImageUrl(blog.image, blog.title)} alt={blog.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2 leading-snug line-clamp-2 group-hover:text-brand-orange transition-colors">
                      {blog.title}
                    </h4>
                    <p className="text-xs text-gray-500">{blog.date}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
            <div className="relative w-full sm:w-[400px]">
              <Input type="text" placeholder="Search..." className="h-11 pr-10 border-gray-200" />
              <Search className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" />
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-sm text-gray-500 font-medium whitespace-nowrap">Sort by:</span>
              <div className="relative flex-1 sm:w-48">
                <select className="w-full appearance-none h-11 border border-gray-200 rounded-md pl-4 pr-10 text-sm text-gray-700 bg-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand-orange">
                  <option>Most Popular</option>
                  <option>Newest First</option>
                  <option>Oldest First</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Blog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {BLOG_POSTS.map(post => (
              <div key={post.id} className="border border-gray-100 rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col">
                <div className="relative h-[250px] w-full overflow-hidden">
                  <Image src={fixImageUrl(post.image, post.title)} alt={post.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                    <span className="flex items-center gap-1.5"><User className="w-4 h-4 text-brand-orange" /> {post.author}</span>
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-brand-orange" /> {post.date}</span>
                    <span className="flex items-center gap-1.5"><MessageSquare className="w-4 h-4 text-brand-orange" /> {post.comments}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight group-hover:text-brand-orange transition-colors">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>
                  <p className="text-gray-500 text-sm mb-6 leading-relaxed flex-1">
                    {post.excerpt}
                  </p>
                  <Link href={`/blog/${post.slug}`} className="text-brand-orange font-bold text-sm uppercase tracking-wide flex items-center hover:underline">
                    READ MORE ➔
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-2 mt-auto">
            <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-brand-orange hover:bg-orange-50 hover:border-brand-orange transition-colors">
              <span className="sr-only">Previous</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button className="w-10 h-10 rounded-full bg-brand-orange text-white font-medium flex items-center justify-center shadow-sm">
              01
            </button>
            <button className="w-10 h-10 rounded-full border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center">
              02
            </button>
            <button className="w-10 h-10 rounded-full border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center">
              03
            </button>
            <button className="w-10 h-10 rounded-full border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center">
              04
            </button>
            <button className="w-10 h-10 rounded-full border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center">
              05
            </button>
            <button className="w-10 h-10 rounded-full border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center">
              06
            </button>
            <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-brand-orange hover:bg-orange-50 hover:border-brand-orange transition-colors">
              <span className="sr-only">Next</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
