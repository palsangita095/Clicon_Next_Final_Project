import logo from "@/assets/images/logo.svg";

export const footerData = {
  brand: {
    // name: "Clicon",
    logo: logo,
    tagline:
      "Real-time fleet intelligence for modern logistics teams. Track, dispatch, and optimize — all in one place.",
    badge: "ISO 27001 certified",
  },
  socials: [
    { label: "Twitter / X", href: "https://x.com/fleetflow", icon: "x" },
    {
      label: "LinkedIn",
      href: "https://linkedin.com/company/fleetflow",
      icon: "linkedin",
    },
    { label: "GitHub", href: "https://github.com/fleetflow", icon: "github" },
    {
      label: "YouTube",
      href: "https://youtube.com/@fleetflow",
      icon: "youtube",
    },
  ],
  columns: [
    {
      heading: "Product",
      links: [
        { label: "Live Tracking", href: "/tracking" },
        { label: "Route Planner", href: "/routes" },
        { label: "Dispatch", href: "/dispatch" },
        { label: "Analytics", href: "/analytics" },
        { label: "Alerts", href: "/alerts" },
        { label: "Integrations", href: "/integrations" },
      ],
    },
    {
      heading: "Company",
      links: [
        { label: "About us", href: "/about" },
        { label: "Careers", href: "/careers" },
        { label: "Blog", href: "/blog" },
        { label: "Press", href: "/press" },
        { label: "Partners", href: "/partners" },
        { label: "Contact", href: "/contact" },
      ],
    },
    {
      heading: "Support",
      links: [
        { label: "Documentation", href: "/docs" },
        { label: "Help center", href: "/help" },
        { label: "Community", href: "/community" },
        { label: "API reference", href: "/api" },
        { label: "Status", href: "https://status.fleetflow.io" },
        { label: "Changelog", href: "/changelog" },
      ],
    },
  ],
  legal: [
    { label: "Privacy policy", href: "/privacy" },
    { label: "Terms of service", href: "/terms" },
    { label: "Cookie settings", href: "/cookies" },
    { label: "Security", href: "/security" },
  ],
  copyright: "© 2026 Clicon. All rights reserved.",
};
