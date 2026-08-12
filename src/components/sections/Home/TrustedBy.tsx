"use client";

import { memo } from "react";
import {
  ScrollVelocityContainer,
  ScrollVelocityRow,
} from "@/components/ui/scroll-based-velocity";
import { NumberTicker } from "@/components/ui/number-ticker";

//  STATS DATA
const STATS = [
  { value: 13, suffix: "K+", label: "Vehicles tracked daily" },
  { value: 98, suffix: "%", label: "On-time delivery rate" },
  { value: 22, suffix: "%", label: "Average fuel savings" },
  { value: 64, suffix: "ms", label: "Telemetry latency" },
];

const TrustedBy = () => {
  return (
    <section className="w-full bg-background pt-16">
      {/* --- TOP: Scrolling Velocity --- */}
      <div className="flex flex-col items-center justify-center gap-8 overflow-hidden pb-16">
        {/* Eyebrow Heading */}
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Trusted by Industry Leaders
        </h3>

        {/* Scrolling Velocity Text */}
        <div className="w-full">
          <ScrollVelocityContainer className="text-3xl font-bold md:text-5xl lg:text-6xl tracking-widest uppercase">
            <ScrollVelocityRow
              baseVelocity={5}
              direction={1}
              className="text-muted-foreground opacity-40"
            >
              VELOCITY &nbsp;&nbsp; GLOBALEX &nbsp;&nbsp; SHIFTHUB &nbsp;&nbsp;
              NEXUS LOG &nbsp;&nbsp; PRIMEHAUL &nbsp;&nbsp;
            </ScrollVelocityRow>
          </ScrollVelocityContainer>
        </div>
      </div>

      {/*  BOTTOM: Stats Grid  */}
      {/* Using border-t and divide-border to create the grid lines from your reference. 
        Because it relies on `border-border`, it automatically shifts colors on theme change! 
      */}
      <div className=" w-full">
        <div className="container mx-auto border-t border-b border-border max-w-7xl">
          <div className="grid grid-cols-2 divide-x divide-y border-x border-border md:grid-cols-4 md:divide-y-0">
            {STATS.map((stat, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center py-10 text-center md:py-12 bg-background/50 backdrop-blur-sm transition-colors hover:bg-muted/10"
              >
                {/* Animated Number + Suffix */}
                <div className="flex items-center text-5xl font-black tracking-tight text-foreground md:text-6xl">
                  <NumberTicker
                    value={stat.value}
                    className="text-foreground tracking-tighter"
                  />
                  <span>{stat.suffix}</span>
                </div>

                {/* Subtitle Label */}
                <span className="mt-3 text-sm font-semibold text-muted-foreground md:text-base">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default memo(TrustedBy);
