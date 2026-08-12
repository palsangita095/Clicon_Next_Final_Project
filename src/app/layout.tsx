import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import Provider from "./provider";
import AIChatbot from "@/components/common/chat/AIChatbot";
import ThemeApplier from "@/components/common/ThemeApplier";

const SITE_URL = "https://your-domain.com"; 
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: "Clicon",
    template: "%s | Clicon",
  },

  description:
    "Clicon is your premier e-commerce destination for electronics, gadgets, and more.",

  applicationName: "Clicon",

  keywords: [
    "Clicon",
    "E-commerce",
    "Electronics",
    "Gadgets",
    "Online Shopping",
  ],

  category: "Business",

  authors: [
    {
      name: "Clicon",
    },
  ],

  creator: "Clicon",

  publisher: "Clicon",

  alternates: {
    canonical: "/",
  },

  robots: {
    index: true,
    follow: true,
    nocache: false,

    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },

  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },

  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Clicon",

    title: "Clicon | Electronics E-commerce",

    description:
      "Shop the latest electronics and gadgets at Clicon.",

    images: [
      {
        url: "/ogImage.png",
        width: 1200,
        height: 630,
        alt: "Clicon E-commerce",
      },
    ],

    locale: "en_US",
  },

  twitter: {
    card: "summary_large_image",

    title: "Clicon | Electronics E-commerce",

    description:
      "Shop the latest electronics and gadgets at Clicon.",

    images: ["/ogImage.png"],
  },

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <Provider>
          <ThemeApplier />
          <Toaster richColors closeButton position="top-right" />
          {children}
          <AIChatbot />
        </Provider>
      </body>
    </html>
  );
}
