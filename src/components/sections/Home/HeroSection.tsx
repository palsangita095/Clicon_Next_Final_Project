"use client";

import { memo } from "react";
import Image from "next/image";
import { cubicBezier, motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import heroImg from "@/assets/images/landingPage/hero/hero-img.jpg";
import map from "@/assets/images/landingPage/hero/map.png";
import { WordRotate } from "@/components/ui/word-rotate";
import { NumberTicker } from "@/components/ui/number-ticker";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";


const HERO_DATA = {
  eyebrow: "Now in beta — 500+ fleets onboarded",
  headlineLine1: "Beyond",
  headlineLine2: "Borders",
  headlineLine3: "and Limits",

  cta: { label: "Book Now", href: "/customer/bookings" },
  demo: { label: "Watch demo", href: "/demo" },
  stat: {
    value: 864,
    label: "Products successfully delivered without delays",
  },
  liveBadge: "Live telemetry active",
 
  mapPins: [
    { id: "pin-1", top: "38%", left: "28%", label: "Chicago Hub" },
    { id: "pin-2", top: "50%", left: "65.5%", label: "New Delhi" },
    { id: "pin-3", top: "30%", left: "72%", label: "New York Port" },
  ],
} as const;


const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: 0.6,
    delay,
    ease: cubicBezier(0.22, 1, 0.36, 1),
  },
});

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.7, delay },
});


const MapPin = memo(
  ({
    top,
    left,
    label,
    delay,
  }: {
    top: string;
    left: string;
    label: string;
    delay: number;
  }) => (
    <motion.div
      {...fadeIn(delay)}
      style={{ top, left }}
      className="absolute -translate-x-1/2 -translate-y-1/2"
    >
      
      <motion.div
        animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
        className="absolute inset-0 rounded-full bg-primary"
      />
  
      <div className="relative h-3 w-3 rounded-full border-2 border-background bg-primary shadow-md" />
      
      <div className="absolute left-4 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md border bg-background/90 px-2 py-0.5 text-[10px] font-medium text-foreground backdrop-blur-sm">
        {label}
      </div>
    </motion.div>
  ),
);
MapPin.displayName = "MapPin";


const HeroSection = () => {
  const router = useRouter();
  const { user, isLoading, openDrawer } = useAuthStore();

  const handleBooking = () => {
    if (isLoading) return;

    if (!user) {
      openDrawer();
      
      return;
    }

    router.push("/customer/bookings");
  };

  return (
    <section className="relative min-h-[95vh] overflow-hidden">
      
      <div className="absolute inset-0">
        <Image
          src={heroImg}
          alt="FleetFlow truck on highway at sunset"
          fill
          sizes="max-w-full max-h-full"
          priority
          className="object-cover object-center"
        />
        
        <div className="absolute inset-0 bg-linear-to-t from-white/55 via-black/30 to-black/30" />
        
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-black/60 to-transparent" />
      </div>

     
      <div className="relative z-10 container mx-auto flex min-h-[92vh] flex-col justify-between px-6 py-16 lg:px-10">
        <div className="flex flex-col justify-center flex-1 lg:flex-row lg:items-center lg:gap-20">
         
          <div className="max-w-2xl flex-1">
           
            <motion.div {...fadeUp(0.1)}>
              <Badge
                variant="outline"
                className="mb-6 border-white/20 bg-white/10 text-white/80 backdrop-blur-sm"
              >
                <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-primary inline-block" />
                {HERO_DATA.eyebrow}
              </Badge>
            </motion.div>

           
            <motion.h1
              {...fadeUp(0.2)}
              className=" font-heading  text-[clamp(55px,8vw,96px)] font-extrabold uppercase leading-[0.92] tracking-tighter text-white"
            >
              <span className="block">{HERO_DATA.headlineLine1}</span>
              <span className="block text-accent">
                
                <WordRotate
                  words={["Borders", "Boundaries", "Barriers"]}
                  duration={3000}
                />
                
              </span>
              <span className="block ">{HERO_DATA.headlineLine3}</span>
            </motion.h1>
          </div>

          
          <motion.div
            {...fadeIn(0.5)}
            className="relative mt-12 hidden w-full max-w-md shrink-0 lg:mt-0 lg:block"
          >
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm">
              <Image
                src={map}
                alt="World route map"
                fill
                sizes="max-w-full max-h-full"
                className="object-contain p-4 opacity-30 "
              />

              
              {HERO_DATA.mapPins.map((pin, i) => (
                <MapPin
                  key={pin.id}
                  top={pin.top}
                  left={pin.left}
                  label={pin.label}
                  delay={0.7 + i * 0.15}
                />
              ))}

              
              <motion.div
                {...fadeUp(1.0)}
                className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 backdrop-blur-sm"
              >
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="h-2 w-2 rounded-full bg-primary"
                />
                <span className="text-[11px] font-medium uppercase tracking-widest text-white/80">
                  {HERO_DATA.liveBadge}
                </span>
              </motion.div>
            </div>
          </motion.div>
        </div>

        
        <div className="flex flex-col md:flex-row justify-center md:justify-between items-center">
          <motion.div {...fadeUp(0.5)} className="text-center md:text-start">
            <div className="flex  gap-3">
              <span className="text-4xl font-black text-secondary">
                <NumberTicker value={HERO_DATA.stat.value} />
                <span className="text-primary">K+</span>
              </span>
              <span className="max-w-45 text-xs leading-relaxed text-white/50">
                {HERO_DATA.stat.label}
              </span>
            </div>
          </motion.div>

          
          <motion.div
            {...fadeUp(0.45)}
            className="flex flex-wrap items-center gap-3 mt-8 md:mt-0"
          >
            <ShimmerButton
             
              onClick={handleBooking}
              className="rounded-full bg-primary font-semibold group hover:-translate-y-0.5"
            >
              {HERO_DATA.cta.label}

              <ArrowUpRight className="transition-transform duration-300 group-hover:rotate-45 ml-2" />
            </ShimmerButton>
            
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default memo(HeroSection);
