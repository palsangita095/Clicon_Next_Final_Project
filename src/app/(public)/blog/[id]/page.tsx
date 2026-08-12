"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, User, Calendar, MessageSquare } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { fixImageUrl } from "@/lib/imageFallback";
import { toast } from "sonner";

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

interface BlogArticle {
  id: number;
  slug: string;
  author: string;
  authorAvatar: string;
  date: string;
  title: string;
  excerpt: string;
  heroImage: string;
  contentImages: [string, string];
  paragraphs: string[];
  quote: string;
}

interface BlogComment {
  name: string;
  date: string;
  text: string;
  avatar: string;
}

const OLD_SLUGS: Record<string, string> = {
  "mauris-blandit-aliquet-elit": "best-wireless-earbuds-2024",
  "massa-orci-consectetur-et-blandit": "laptop-buying-guide-2024",
  "curabitur-pulvinar-aliquam-lectus": "noise-cancellation-explained",
  "vestibulum-lorem-vel-gravida": "smartphone-photography-tips",
  "aenean-imperdiet-velit": "battery-life-tips",
  "fusce-vulputate-ipsum": "gaming-setup-essentials",
};

const BLOG_ARTICLES: BlogArticle[] = [
  {
    id: 1,
    slug: "best-wireless-earbuds-2024",
    author: "Cameron Williamson",
    authorAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
    date: "24 May, 2024",
    title: "The Best Wireless Earbuds of 2024: A Complete Buying Guide",
    excerpt: "From battery life to noise cancellation, here is everything you need to know before buying your next pair of wireless earbuds.",
    heroImage: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800&q=80",
    contentImages: [
      "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=500&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500&q=80",
    ],
    paragraphs: [
      "Wireless earbuds have become one of the most popular gadgets of the decade, and for good reason. They offer freedom from tangled cables, instant connectivity, and a level of portability that wired headphones simply cannot match. But with so many options on the market, choosing the right pair can feel overwhelming.",
      "Battery life is often the first thing people check, and for good reason. Most modern earbuds deliver between five and eight hours of playback on a single charge, with the charging case extending that to thirty hours or more. If you travel frequently, look for a pair with fast charging — a quick fifteen-minute charge should give you at least two hours of listening.",
      "Active noise cancellation, or ANC, is another feature worth considering. It uses tiny microphones to detect ambient noise and generates inverted sound waves to cancel it out. The result is a quiet space even on a noisy commute or a busy office floor. If you work in open-plan spaces, ANC is a game changer.",
      "Finally, do not underestimate the importance of a comfortable fit. Every ear is different, so choose earbuds that come with multiple ear tip sizes. A secure fit improves both sound quality and noise isolation, and it keeps the earbuds from falling out during workouts. Take your time, try different sizes, and buy from a brand that offers easy returns.",
    ],
    quote: "A great pair of earbuds disappears into your ear and leaves nothing but the music — comfort and sound quality are two halves of the same experience.",
  },
  {
    id: 2,
    slug: "laptop-buying-guide-2024",
    author: "Floyd Miles",
    authorAvatar: "https://randomuser.me/api/portraits/men/45.jpg",
    date: "17 Oct, 2020",
    title: "Laptop Buying Guide: What to Look For Before You Spend",
    excerpt: "Processor, RAM, storage, display — here is how to pick a laptop that will still feel fast in five years.",
    heroImage: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=80",
    contentImages: [
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80",
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80",
    ],
    paragraphs: [
      "Buying a laptop is a bigger commitment than most people realize. It is the machine you will carry everywhere, type on for hours, and rely on for work, study, and entertainment. Spending a little more time on research before you buy will save you money and frustration later.",
      "The processor is the heart of the laptop. For everyday tasks like browsing, documents, and video calls, a mid-range chip is more than enough. But if you edit photos or videos, compile code, or run multiple heavy applications at once, step up to a faster processor — it is the single upgrade that keeps a laptop feeling new for years.",
      "RAM and storage deserve just as much attention. Eight gigabytes of RAM is the absolute minimum today, but sixteen gigabytes is the sweet spot for comfortable multitasking. For storage, choose a solid-state drive over a hard disk — the difference in boot time and application speed is dramatic. Aim for at least 512 gigabytes.",
      "Do not neglect the display and keyboard. These are the two things you interact with every single day. Look for a screen with good brightness and color accuracy, and a keyboard with comfortable key travel. A laptop is only as good as the experience of actually using it.",
    ],
    quote: "A laptop should feel like an extension of your hands and your ideas — the best spec sheet is the one you never think about.",
  },
  {
    id: 3,
    slug: "noise-cancellation-explained",
    author: "Bessie Cooper",
    authorAvatar: "https://randomuser.me/api/portraits/women/68.jpg",
    date: "8 Sep, 2020",
    title: "Noise Cancellation Explained: How ANC Actually Works",
    excerpt: "What is active noise cancellation, how does it work, and is it really worth the extra money?",
    heroImage: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80",
    contentImages: [
      "https://images.unsplash.com/photo-1618424181497-157f25b6ddd5?w=500&q=80",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
    ],
    paragraphs: [
      "Active noise cancellation, or ANC, sounds like magic but is actually a clever bit of engineering. Tiny microphones on your headphones listen to the sounds around you, and a processor generates an inverted copy of that noise. When the two sound waves meet, they cancel each other out, leaving silence.",
      "The technology works best on constant, low-frequency sounds — the hum of an airplane engine, the rumble of a train, or the drone of an air conditioner. These are exactly the sounds that tire you out on long journeys, so ANC genuinely reduces travel fatigue.",
      "It is important to understand that ANC does not silence everything. Sharp, sudden noises like conversations or keyboard clicks are only partially reduced. For full isolation from voices, you would need soundproofing, which is why many people combine ANC with music at a moderate volume.",
      "Is ANC worth the extra cost? If you commute regularly, work in a noisy office, or travel by air several times a year, the answer is almost always yes. The silence it provides is not just comfortable — it helps you focus, relax, and enjoy your music the way it was meant to be heard.",
    ],
    quote: "Silence is not the absence of sound; it is the gift of choosing what you want to hear.",
  },
  {
    id: 4,
    slug: "smartphone-photography-tips",
    author: "Kristin Watson",
    authorAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
    date: "1 Feb, 2020",
    title: "Smartphone Photography: 8 Tips That Instantly Improve Your Photos",
    excerpt: "You don't need a professional camera to take stunning photos. These simple tips will transform your smartphone shots.",
    heroImage: "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&q=80",
    contentImages: [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&q=80",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80",
    ],
    paragraphs: [
      "The best camera is the one you have with you, and these days that is your smartphone. Modern phone cameras are capable of truly stunning results — but only if you know how to use them. The good news is that a few simple habits can dramatically improve your photos.",
      "First, clean your lens. It sounds obvious, but a smudged lens is the most common cause of blurry, hazy photos. A quick wipe with a soft cloth before you shoot makes an immediate difference. Second, tap to focus — phones make focusing easy, so always tap on your subject to lock focus and adjust exposure.",
      "Light is everything in photography. Shoot during the golden hour, just after sunrise or before sunset, when the light is warm and soft. Avoid harsh midday sun, which creates unflattering shadows. When shooting indoors, move toward a window instead of relying on the phone's flash.",
      "Finally, compose with care. Use the rule of thirds — place your subject slightly off-center for a more interesting frame. Shoot in the highest resolution available, keep your phone steady, and take multiple shots of the same scene. Editing tools on modern phones are powerful, so do not be afraid to crop and adjust.",
    ],
    quote: "Photography is the art of observation — it has little to do with the things you see and everything to do with the way you see them.",
  },
  {
    id: 5,
    slug: "battery-life-tips",
    author: "Eleanor Pena",
    authorAvatar: "https://randomuser.me/api/portraits/women/12.jpg",
    date: "12 Mar, 2021",
    title: "How to Make Your Devices Last Longer: Battery Life Tips",
    excerpt: "Simple changes to the way you charge and use your devices can add hours to every charge.",
    heroImage: "https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?w=800&q=80",
    contentImages: [
      "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=500&q=80",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80",
    ],
    paragraphs: [
      "Few things are more frustrating than a phone that dies halfway through the day. The good news is that battery drain is rarely a mystery — it is usually caused by a handful of common habits that are easy to fix. Small changes in how you use your devices can add hours to every charge.",
      "Start with screen brightness, which is often the biggest drain. Set your display to auto-brightness and let the phone adapt to its surroundings. On phones with OLED screens, using dark mode can also save a noticeable amount of battery, because black pixels are simply turned off.",
      "Background apps are silent battery killers. Apps that refresh in the background, track your location, or push notifications all consume power even when you are not using them. Review your app settings regularly and disable background refresh for the apps you rarely open.",
      "When it comes to charging, avoid extremes. Lithium batteries prefer to stay between twenty and eighty percent charge. Leaving your phone on the charger at 100 percent overnight is not as harmful as it used to be, but keeping it in the sweet spot will extend its lifespan. And avoid letting it drop to zero before charging.",
    ],
    quote: "Battery life is not about bigger batteries — it is about smarter habits.",
  },
  {
    id: 6,
    slug: "gaming-setup-essentials",
    author: "Robert Fox",
    authorAvatar: "https://randomuser.me/api/portraits/men/75.jpg",
    date: "4 Apr, 2021",
    title: "Gaming Setup Essentials: What Beginners Actually Need",
    excerpt: "From keyboards to headsets, here is what a beginner actually needs for a comfortable gaming setup.",
    heroImage: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&q=80",
    contentImages: [
      "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=500&q=80",
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&q=80",
    ],
    paragraphs: [
      "Building your first gaming setup is exciting, but it is easy to overspend on gear you do not need. The truth is that a great setup starts with the essentials done well, not with a desk full of accessories. Start simple, upgrade gradually, and focus on comfort first.",
      "A good keyboard and mouse are worth more than any other peripheral. For fast-paced games, look for a mechanical keyboard with responsive switches and a mouse with an accurate sensor. Your reflexes depend on them, and even a mid-range pair will serve you far better than the cheapest option.",
      "Your monitor is the window to the game. A 144Hz display makes motion look dramatically smoother than a standard 60Hz screen, and it is one of the most noticeable upgrades you can make. Pair it with a good gaming headset — hearing footsteps and environmental cues is often the difference between winning and losing.",
      "Finally, do not forget the basics that make long sessions comfortable: a chair that supports your back, a desk at the right height, and proper lighting that reduces eye strain. Ergonomic comfort is not a luxury; it is what allows you to enjoy your games for hours without pain.",
    ],
    quote: "A gaming setup is not about the amount of gear — it's about how comfortable and focused you feel when it matters.",
  },
];

const ARTICLE_COMMENTS: Record<number, BlogComment[]> = {
  1: [
    { name: "Emily Watson", date: "22 May, 2024", text: "This guide convinced me to finally upgrade my old earbuds. The battery life section was exactly what I needed — I had no idea fast charging was such a big deal.", avatar: "https://randomuser.me/api/portraits/women/44.jpg" },
    { name: "Marcus Reed", date: "18 May, 2024", text: "The fit advice is spot on. I used to get sore ears after an hour until I switched to smaller tips. Wish I had read this sooner!", avatar: "https://randomuser.me/api/portraits/men/32.jpg" },
    { name: "Priya Sharma", date: "12 May, 2024", text: "ANC changed my commute completely. I used to arrive at work exhausted, now I arrive relaxed. Great article, very well explained.", avatar: "https://randomuser.me/api/portraits/women/65.jpg" },
    { name: "Daniel Kim", date: "5 May, 2024", text: "Solid breakdown. A comparison of battery specs across price ranges would make a great follow-up article.", avatar: "https://randomuser.me/api/portraits/men/45.jpg" },
  ],
  2: [
    { name: "Sarah Mitchell", date: "14 Oct, 2020", text: "Just bought my first laptop after reading this. The RAM advice saved me from making a big mistake!", avatar: "https://randomuser.me/api/portraits/women/68.jpg" },
    { name: "James Carter", date: "9 Oct, 2020", text: "The display and keyboard point is underrated. I spent days comparing specs and forgot the most important part — actually using it.", avatar: "https://randomuser.me/api/portraits/men/75.jpg" },
    { name: "Nina Patel", date: "30 Sep, 2020", text: "Wish this existed when I bought my last laptop. Stuck with a hard drive and booting takes forever.", avatar: "https://randomuser.me/api/portraits/women/12.jpg" },
    { name: "Oliver Brown", date: "22 Sep, 2020", text: "Clear and practical. The processor section helped me understand what all those numbers actually mean.", avatar: "https://randomuser.me/api/portraits/men/22.jpg" },
  ],
  3: [
    { name: "Hannah White", date: "4 Sep, 2020", text: "Finally an explanation of ANC that makes sense! The inverted wave part clicked for me instantly.", avatar: "https://randomuser.me/api/portraits/women/33.jpg" },
    { name: "Liam Johnson", date: "28 Aug, 2020", text: "Bought ANC headphones for my daily train ride and it's night and day. Worth every cent.", avatar: "https://randomuser.me/api/portraits/men/86.jpg" },
    { name: "Aisha Khan", date: "20 Aug, 2020", text: "Good point about constant versus sudden sounds. I expected total silence and was confused at first.", avatar: "https://randomuser.me/api/portraits/women/41.jpg" },
    { name: "Ben Walker", date: "11 Aug, 2020", text: "Great article. The travel fatigue point is real — I feel so much fresher after flights now.", avatar: "https://randomuser.me/api/portraits/men/11.jpg" },
  ],
  4: [
    { name: "Grace Lee", date: "27 Jan, 2020", text: "The golden hour tip transformed my photos! I can't believe I never tried it before.", avatar: "https://randomuser.me/api/portraits/women/17.jpg" },
    { name: "Noah Adams", date: "20 Jan, 2020", text: "Cleaning the lens was the 'duh' moment for me. My pictures are so much sharper now.", avatar: "https://randomuser.me/api/portraits/men/36.jpg" },
    { name: "Sophia Martinez", date: "12 Jan, 2020", text: "The rule of thirds is such a simple change that makes everything look better. Thank you!", avatar: "https://randomuser.me/api/portraits/women/50.jpg" },
    { name: "Ryan Cooper", date: "4 Jan, 2020", text: "Practical advice without being preachy. The indoor lighting section helped me a lot.", avatar: "https://randomuser.me/api/portraits/men/55.jpg" },
  ],
  5: [
    { name: "Chloe Wilson", date: "8 Mar, 2021", text: "The 20 to 80 percent charging rule changed how I think about my battery. Great tip!", avatar: "https://randomuser.me/api/portraits/women/26.jpg" },
    { name: "Ethan Moore", date: "1 Mar, 2021", text: "Dark mode really does help on OLED. My phone easily lasts the whole day now.", avatar: "https://randomuser.me/api/portraits/men/14.jpg" },
    { name: "Maya Thompson", date: "22 Feb, 2021", text: "Background refresh was the culprit all along. Killed my battery in an afternoon. Fixed now!", avatar: "https://randomuser.me/api/portraits/women/29.jpg" },
    { name: "Jack Robinson", date: "14 Feb, 2021", text: "Simple and practical. The brightness tip alone gave me an extra two hours of screen time.", avatar: "https://randomuser.me/api/portraits/men/63.jpg" },
  ],
  6: [
    { name: "Adam Green", date: "1 Apr, 2021", text: "The 144Hz monitor advice is the best thing I ever did for gaming. Butter smooth.", avatar: "https://randomuser.me/api/portraits/men/47.jpg" },
    { name: "Emma Lewis", date: "25 Mar, 2021", text: "Comfort advice is so overlooked. My back was killing me until I got a proper chair.", avatar: "https://randomuser.me/api/portraits/women/54.jpg" },
    { name: "David Clark", date: "18 Mar, 2021", text: "Started with a basic setup and upgraded gradually like you said. No regrets.", avatar: "https://randomuser.me/api/portraits/men/70.jpg" },
    { name: "Zoe Martin", date: "10 Mar, 2021", text: "The headset point is so true — hearing footsteps wins games. Great read!", avatar: "https://randomuser.me/api/portraits/women/73.jpg" },
  ],
};

const SHARE_LINKS = [
  { label: "W", url: "https://api.whatsapp.com/send?text=Check%20this%20article", bg: "bg-green-500", title: "WhatsApp" },
  { label: "f", url: "https://www.facebook.com/sharer/sharer.php?u=", bg: "bg-blue-600", title: "Facebook" },
  { label: "t", url: "https://twitter.com/intent/tweet?text=Check%20this%20article", bg: "bg-blue-400", title: "Twitter" },
  { label: "in", url: "https://www.linkedin.com/sharing/share-offsite/?url=", bg: "bg-blue-700", title: "LinkedIn" },
  { label: "P", url: "https://pinterest.com/pin/create/button/?description=Check%20this%20article", bg: "bg-red-600", title: "Pinterest" },
  { label: "@", url: "mailto:?subject=Check%20this%20article", bg: "bg-gray-600", title: "Email" },
];

export default function BlogDetailPage() {
  const params = useParams();
  const articleId = String(params?.id ?? "1");
  const requestedSlug = OLD_SLUGS[articleId] ?? articleId;

  const article = BLOG_ARTICLES.find(a => a.slug === requestedSlug) || BLOG_ARTICLES.find(a => String(a.id) === articleId) || BLOG_ARTICLES[0];

  const [comments, setComments] = useState<BlogComment[]>(ARTICLE_COMMENTS[article.id] ?? []);
  const [commentName, setCommentName] = useState("");
  const [commentEmail, setCommentEmail] = useState("");
  const [commentText, setCommentText] = useState("");
  const [posting, setPosting] = useState(false);

  const latestBlogs = BLOG_ARTICLES.filter(b => b.id !== article.id).slice(0, 3);

  const postComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName.trim() || !commentText.trim()) {
      toast.error("Please fill in your name and comment.");
      return;
    }
    setPosting(true);
    setTimeout(() => {
      setComments((prev) => [
        { name: commentName.trim(), date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }), text: commentText.trim(), avatar: "https://randomuser.me/api/portraits/lego/1.jpg" },
        ...prev,
      ]);
      setCommentName("");
      setCommentEmail("");
      setCommentText("");
      setPosting(false);
      toast.success("Comment posted successfully.");
    }, 600);
  };

  return (
    <div key={article.id} className="bg-white min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="container mx-auto px-4 md:px-8 py-3 text-sm text-gray-500 flex items-center gap-2">
          <Link href="/" className="hover:text-brand-orange flex items-center gap-1">
            <span>🏠</span> Home
          </Link>
          <span className="text-gray-400">›</span>
          <span className="text-gray-400">Pages</span>
          <span className="text-gray-400">›</span>
          <Link href="/blog" className="hover:text-brand-orange">Blog</Link>
          <span className="text-gray-400">›</span>
          <span className="text-brand-orange font-medium truncate max-w-[200px] sm:max-w-xs">
            Blog Article {article.title}
          </span>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-16 flex flex-col lg:flex-row gap-12">
        
        {/* Main Article Content */}
        <div className="flex-1 max-w-4xl">
          
          {/* Header Info */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-6 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2">
              <User size={18} className="text-brand-orange" />
              <span>By {article.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-brand-orange" />
              <span>{article.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare size={18} className="text-brand-orange" />
              <span>{comments.length} Comments</span>
            </div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 leading-tight">
            {article.title}
          </h1>

          {/* Author & Share */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
            <div className="flex items-center gap-3">
              <Image src={fixImageUrl(article.authorAvatar, article.author)} alt={article.author} width={48} height={48} className="rounded-full" />
              <div>
                <p className="text-sm text-gray-500 mb-0.5">Written by</p>
                <p className="font-semibold text-gray-900 text-sm">{article.author}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 mr-2">Share:</span>
              {SHARE_LINKS.map(link => (
                <a key={link.label} href={`${link.url}${typeof window !== "undefined" ? window.location.href : ""}`} target="_blank" rel="noopener noreferrer" title={link.title} className={`w-8 h-8 rounded-full ${link.bg} text-white flex items-center justify-center hover:opacity-80 transition-opacity`}>{link.label}</a>
              ))}
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative w-full h-[400px] rounded-md overflow-hidden mb-10">
            <Image src={fixImageUrl(article.heroImage, "Article Hero")} alt={article.title} fill sizes="(max-width: 768px) 100vw, 800px" className="object-cover" />
          </div>

          {/* Article Text */}
          <div className="prose prose-lg max-w-none text-gray-600 space-y-6">
            <p>{article.excerpt}</p>
            <p>{article.paragraphs[0]}</p>

            <blockquote className="border-l-4 border-brand-orange pl-6 py-4 my-10 bg-orange-50/50 rounded-r-md">
              <div className="flex gap-4 items-start">
                <span className="text-6xl text-brand-orange leading-none opacity-50 font-serif">&ldquo;</span>
                <p className="text-xl font-medium text-gray-900 leading-relaxed m-0 italic">
                  {article.quote}
                </p>
              </div>
            </blockquote>

            <p>{article.paragraphs[1]}</p>
            <p>{article.paragraphs[2]}</p>

            {/* In-article Images */}
            <div className="grid grid-cols-2 gap-6 my-10">
              <div className="relative h-64 rounded-md overflow-hidden">
                 <Image src={fixImageUrl(article.contentImages[0], "Content Image 1")} alt="Content Image 1" fill sizes="(max-width: 768px) 100vw, 400px" className="object-cover" />
              </div>
              <div className="relative h-64 rounded-md overflow-hidden">
                 <Image src={fixImageUrl(article.contentImages[1], "Content Image 2")} alt="Content Image 2" fill sizes="(max-width: 768px) 100vw, 400px" className="object-cover" />
              </div>
            </div>

            <p>{article.paragraphs[3]}</p>
          </div>

          <hr className="my-12 border-gray-100" />

          {/* Leave a Comment */}
          <div className="mb-16">
            <h3 className="text-xl font-bold text-gray-900 mb-8">Leave a Comment</h3>
            <form className="space-y-6" onSubmit={postComment}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm text-gray-700">Full Name</label>
                  <Input type="text" value={commentName} onChange={(e) => setCommentName(e.target.value)} className="h-12 border-gray-200" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-700">Email Address</label>
                  <Input type="email" value={commentEmail} onChange={(e) => setCommentEmail(e.target.value)} className="h-12 border-gray-200" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-700">Comment</label>
                <textarea 
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full min-h-[150px] border border-gray-200 rounded-md p-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange"
                  placeholder="What's your thought about this blog..."
                ></textarea>
              </div>
              <Button type="submit" disabled={posting} className="bg-brand-orange hover:bg-orange-600 text-white font-bold h-12 px-8 uppercase tracking-wide">
                {posting ? "POSTING..." : "POST COMMENT"}
              </Button>
            </form>
          </div>

          {/* Comments List */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-8">Comments</h3>
            <div className="space-y-8">
              {comments.map((comment, idx) => (
                <div key={idx} className="flex gap-4 pb-8 border-b border-gray-100 last:border-0">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 relative">
                    <Image src={fixImageUrl(comment.avatar, comment.name)} alt={comment.name} fill sizes="64px" className="object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-gray-900 text-sm">{comment.name}</span>
                      <span className="text-gray-400 text-xs">•</span>
                      <span className="text-gray-400 text-xs">{comment.date}</span>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {comment.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-[320px] flex-shrink-0 space-y-8">
          
          {/* Search */}
          <div className="border border-gray-100 rounded-md p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-6 uppercase text-sm tracking-wider">SEARCH</h3>
            <div className="relative w-full">
              <Input type="text" placeholder="Search..." className="h-11 pr-10 border-gray-200" />
              <Search className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" />
            </div>
          </div>

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
              {latestBlogs.map((blog) => (
                <Link key={blog.id} href={`/blog/${blog.slug}`} className="flex gap-4 group cursor-pointer">
                  <div className="w-20 h-16 bg-gray-100 rounded-md overflow-hidden relative flex-shrink-0">
                    <Image src={fixImageUrl(blog.heroImage, blog.title)} alt={blog.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover group-hover:scale-105 transition-transform" />
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

          {/* Popular Tags */}
          <div className="border border-gray-100 rounded-md p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-6 uppercase text-sm tracking-wider">POPULAR TAG</h3>
            <div className="flex flex-wrap gap-2">
              {["Game", "iPhone", "TV", "Asus Laptops", "Macbook", "SSD", "Graphics Card", "Speaker", "Tablet", "Microwave", "Samsung", "Power Bank"].map(tag => (
                <span key={tag} className={`px-3 py-1.5 text-xs font-medium rounded border cursor-pointer hover:border-brand-orange hover:text-brand-orange transition-colors ${tag === 'Graphics Card' ? 'border-brand-orange text-brand-orange' : 'border-gray-200 text-gray-600'}`}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}


