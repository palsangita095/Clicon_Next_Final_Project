"use client";

import { useEffect, useRef, useState } from "react";
import {
  MapPin,
  Truck,
  TrendingUp,
  Rocket,
  type LucideIcon,
} from "lucide-react";


type Milestone = {
  year: string;
  title: string;
  description: string;
  icon: LucideIcon;
};


const MILESTONES: Milestone[] = [
  {
    year: "2022",
    title: "First mile",
    description:
      "Two dispatchers and a spreadsheet. FleetFlow+ started as a side tool to stop losing track of trucks between phone calls.",
    icon: MapPin,
  },
  {
    year: "2023",
    title: "Beta on the road",
    description:
      "50 fleets ran their first live routes on FleetFlow+. We rebuilt the tracking engine twice before it held up at scale.",
    icon: Truck,
  },
  {
    year: "2024",
    title: "500 fleets onboarded",
    description:
      "AI route optimization and geofencing shipped. Average fuel savings crossed 20% across active fleets.",
    icon: TrendingUp,
  },
  {
    year: "2025",
    title: "Command centers, everywhere",
    description:
      "Customer, driver, dispatcher and admin views unified into one live operations layer — the platform you see today.",
    icon: Rocket,
  },
];


function useRevealOnScroll<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, inView };
}



export function AboutStorySection() {
  const { ref, inView } = useRevealOnScroll<HTMLOListElement>();

  return (
    <section className="relative overflow-hidden bg-background px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-16 md:grid-cols-[0.9fr_1.1fr]">
          
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange">
              # how we started
            </span>

            <h2 className="mt-6 font-heading text-4xl font-bold uppercase leading-[1.05] tracking-tight text-foreground md:text-5xl">
              We built FleetFlow+{" "}
              <span className="text-brand-yellow">from the cab</span>, not the
              boardroom.
            </h2>

            <p className="mt-6 text-base leading-relaxed text-muted-foreground md:text-lg">
              Every feature started as a problem someone on our team hit
              firsthand — a driver stuck without a route, a dispatcher guessing
              which truck was free, a customer refreshing a page for news that
              never came. FleetFlow+ is the fix we kept building.
            </p>

            <div className="mt-10 flex items-center gap-3 rounded-2xl border border-border bg-card/40 px-5 py-4">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-orange/60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-orange" />
              </span>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">
                  500+ fleets
                </span>{" "}
                now run on the platform we started in a garage.
              </p>
            </div>
          </div>

          
          <div className="relative">
            <div
              aria-hidden
              className="absolute left-4.75 top-2 hidden h-[calc(100%-2rem)] w-px bg-border md:block"
            />
            <ol ref={ref} className="space-y-10">
              {MILESTONES.map((milestone, index) => {
                const Icon = milestone.icon;
                return (
                  <li
                    key={milestone.year}
                    className="relative flex gap-5 transition-all duration-700 ease-out"
                    style={{
                      transitionDelay: `${index * 120}ms`,
                      opacity: inView ? 1 : 0,
                      transform: inView ? "translateY(0)" : "translateY(1rem)",
                    }}
                  >
                    <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-brand-orange">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="pb-2">
                      <div className="flex items-baseline gap-3">
                        <span className="font-heading text-lg font-bold text-brand-yellow">
                          {milestone.year}
                        </span>
                        <h3 className="text-base font-semibold text-foreground">
                          {milestone.title}
                        </h3>
                      </div>
                      <p className="mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground">
                        {milestone.description}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutStorySection;
