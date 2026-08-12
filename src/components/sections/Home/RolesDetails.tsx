"use client";

import { memo } from "react";
import { motion, Variants } from "framer-motion";
import { Package, Route, Bell, Wrench } from "lucide-react";
import Image from "next/image";
import imgLeft from "@/assets/images/landingPage/roles/left-img.jpg";
import imgRight from "@/assets/images/landingPage/roles/right-img.jpg";
import { MapPinIcon, UsersIcon } from "@animateicons/react/lucide";

const ROLES_DATA = [
  {
    role: "Customer",
    badgeColor: "bg-accent text-accent-foreground",
    icon: Package,
    title: "Book it. Track it. Done.",
    bullets: [
      "Create shipments in seconds",
      "Real-time tracking & ETA",
      "Invoices & proof of delivery",
    ],
  },
  {
    role: "Driver",
    badgeColor: "bg-primary text-primary-foreground",
    icon: MapPinIcon,
    title: "Your route, in your pocket.",
    bullets: [
      "Assigned deliveries queue",
      "Turn-by-turn navigation",
      "Photo & signature proof",
    ],
  },
  {
    role: "Dispatcher",
    badgeColor: "bg-secondary text-secondary-foreground",
    icon: Route,
    title: "Move the whole fleet.",
    bullets: [
      "Drag-and-drop assignment",
      "Live operations map",
      "Smart route clustering",
    ],
  },
  {
    role: "Admin",
    badgeColor: "bg-muted text-foreground border border-border",
    icon: UsersIcon,
    title: "Run the business.",
    bullets: [
      "Drivers, vehicles, customers",
      "Maintenance & insurance",
      "Revenue & efficiency reports",
    ],
  },
];

// --- Animations ---
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const RolesSection = () => {
  return (
    <section className="w-full bg-background py-16 text-foreground">
      <div className="container mx-auto max-w-7xl px-6 lg:px-12">
        {/* ── Header Section ── */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="mb-16"
        >
          {/* Eyebrow */}
          <motion.div
            variants={fadeUp}
            className="mb-6 flex items-center gap-2"
          >
            <div className="flex items-center rounded-full border border-border bg-muted/50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <span className="mr-2 h-1.5 w-1.5 rounded-full bg-primary"></span>
              Built for four roles
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h2
            variants={fadeUp}
            className="max-w-4xl text-5xl font-black uppercase leading-[0.95] tracking-tighter md:text-7xl lg:text-8xl"
          >
            <span className="block text-foreground">One Platform.</span>
            <span className="block text-foreground">
              Four <span className="text-primary">Command</span>
            </span>
            <span className="block text-primary">Centers.</span>
          </motion.h2>
        </motion.div>

        {/* ── Top Grid: Four Roles ── */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 "
        >
          {ROLES_DATA.map((item, idx) => (
            <motion.div
              key={idx}
              variants={fadeUp}
              className="flex h-full flex-col rounded-[2rem] border border-border bg-card p-8 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-md"
            >
              {/* Badge */}
              <div
                className={`mb-6 inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${item.badgeColor}`}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.role}
              </div>

              {/* Title */}
              <h3 className="mb-6 text-2xl font-black tracking-tight text-card-foreground">
                {item.title}
              </h3>

              {/* Bullet Points */}
              <ul className="mt-auto space-y-3">
                {item.bullets.map((bullet, bIdx) => (
                  <li
                    key={bIdx}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"></span>
                    {bullet}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/*  Bottom Grid: Bento Boxes  */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12"
        >
          {/* Left Large Card (Live Command Center) */}
          <motion.div
            variants={fadeUp}
            className="relative flex min-h-87.5 flex-col justify-end overflow-hidden rounded-[2rem] bg-secondary p-10 lg:col-span-8"
          >
            {/* Background Image Container */}
            <div className="absolute inset-0 z-0">
              <Image
                src={imgLeft}
                alt="Operations Map"
                fill
                sizes="max-w-full max-h-full"
                className="object-cover opacity-25"
              />
            </div>

            {/* Dynamic Overlay & Gradient (Adapts to theme background) */}
            <div className="absolute inset-0 z-10 bg-linear-to-b from-background/50 to-transparent opacity-30 mix-blend-overlay" />

            {/* Content Container (Using secondary-foreground for automatic contrast) */}
            <div className="relative z-20 max-w-xl text-secondary-foreground">
              <Bell className="mb-6 h-6 w-6 text-accent" />
              <h3 className="mb-4 text-4xl font-black tracking-tight md:text-5xl lg:text-6xl">
                Live command
                <br />
                center.
              </h3>
              <p className="rounded-md text-sm leading-relaxed text-secondary-foreground/80">
                Full-screen operations map, crisis monitoring, fleet-wide
                activity — all the signal, none of the noise.
              </p>
            </div>
          </motion.div>

          {/* Right Smaller Card (Predictive Maintenance) */}
          <motion.div
            variants={fadeUp}
            className="relative flex min-h-87.5 flex-col justify-end overflow-hidden rounded-[2rem] bg-secondary p-10 lg:col-span-4"
          >
            {/* Background Image Container */}
            <div className="absolute inset-0 z-0">
              <Image
                src={imgRight}
                alt="Predictive Maintenance Machinery"
                fill
                sizes="max-w-full max-h-full"
                className="object-cover opacity-55 dark:opactiy-85 mix-blend-multiply"
              />
            </div>

            {/* Dynamic Overlay */}
            <div className="absolute inset-0 z-10 bg-linear-to-b from-background/50 to-transparent opacity-30 mix-blend-overlay" />

            {/* Content Container (Locked to secondary-foreground for automatic contrast) */}
            <div className="relative z-20 text-secondary-foreground">
              <Wrench className="mb-6 h-6 w-6 text-secondary-foreground/90" />
              <h3 className="mb-4 text-3xl font-black tracking-tight md:text-4xl">
                Predictive
                <br />
                maintenance.
              </h3>
              <p className="rounded-md text-sm leading-relaxed text-secondary-foreground/90">
                Spot failures before they ground a truck. Vehicle health scores,
                alerts and service history in one record.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default memo(RolesSection);
