"use client";

import { memo } from "react";
import { motion, Variants } from "framer-motion";
import { ArrowUpRight, Phone } from "lucide-react"; // Using standard lucide icons
import Link from "next/link";
import { Button } from "@/components/ui/button";


const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const CtaSection = () => {
  return (
    <section className="w-full bg-background py-16">
      <div className="container mx-auto max-w-7xl px-6 lg:px-12">
       
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="relative overflow-hidden rounded-[2.5rem] bg-secondary px-8 py-20 shadow-2xl lg:px-20 lg:py-24"
        >
         
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-accent/20 blur-[120px] pointer-events-none" />

          <div className="absolute inset-0 z-0 bg-black/5 opacity-10 pointer-events-none" />

          
          <div className="relative z-10 flex flex-col items-start justify-between gap-12 lg:flex-row lg:items-center lg:gap-20">
            
            <motion.div variants={fadeUp} className="flex-1">
              <h2 className="text-5xl font-black uppercase leading-[0.95] tracking-tighter text-secondary-foreground md:text-6xl lg:text-7xl">
                Ready to run
                <br />
                your fleet
                <br />
                like{" "}
                <span className="text-accent">
                  a command
                  <br />
                  center?
                </span>
              </h2>
            </motion.div>

           
            <motion.div
              variants={fadeUp}
              className="flex max-w-md flex-col items-start gap-8 min-w-fit md:min-w-100"
            >
              <p className="text-base leading-relaxed text-secondary-foreground/80 md:text-lg">
                Start a free pilot with up to 10 vehicles. We'll migrate your
                existing routes and drivers in under a week.
              </p>

              <div className="flex flex-wrap items-center gap-4 justify-center lg:justify-start">
                
                <Button
                  asChild
                  size="lg"
                  className="group rounded-full bg-accent px-8 text-accent-foreground hover:bg-accent/90 font-bold"
                >
                  <Link href="/demo">
                    Book a demo
                    <ArrowUpRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:rotate-45" />
                  </Link>
                </Button>

                
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="rounded-full border-border bg-background/10 px-8 text-secondary-foreground backdrop-blur-md hover:bg-background/20 font-semibold"
                >
                  <Link href="/sales">
                    <Phone className="mr-2 h-4 w-4 text-accent" />
                    Talk to sales
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default memo(CtaSection);
