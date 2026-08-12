"use client";

import { motion, Variants } from "framer-motion";
import {
  Hash,
  Route,
  MapPin,
  Fuel,
  Gauge,
  ShieldCheck,
  BarChart3,
} from "lucide-react";
import { memo } from "react";

const FEATURES_DATA = [
  {
    icon: Route,
    title: "AI route optimization",
    description:
      "Traffic-aware, fuel-efficient multi-stop routes that reroute in real time.",
  },
  {
    icon: MapPin,
    title: "Live fleet tracking",
    description:
      "Every vehicle, every driver, every shipment — on one live map.",
  },
  {
    icon: Fuel,
    title: "Smart fuel management",
    description:
      "Consumption tracking, efficiency scores and theft detection alerts.",
  },
  {
    icon: Gauge,
    title: "Fleet intelligence",
    description:
      "Vehicle health scores, predictive maintenance, downtime analysis.",
  },
  {
    icon: ShieldCheck,
    title: "Geofencing & alerts",
    description:
      "Zone entry/exit, route deviation and unauthorized movement detection.",
  },
  {
    icon: BarChart3,
    title: "Performance scorecard",
    description:
      "On-time rate, driver efficiency, fleet utilization and CSAT in one view.",
  },
];


const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const FeaturesSection = () => {
  return (
    <section className="w-full bg-background py-16 text-foreground">
      <div className="container mx-auto max-w-7xl px-6 lg:px-12">
       
        <div className="flex flex-col justify-between gap-12 lg:flex-row lg:items-end">
         
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/30 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-primary backdrop-blur-sm"
            >
              <Hash className="h-3.5 w-3.5" />
              Intelligence Layer
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-5xl font-black uppercase leading-[0.9] tracking-tighter md:text-7xl lg:text-8xl"
            >
              <span className="block text-foreground">Powered By</span>
              <span className="block text-primary">Precision.</span>
            </motion.h2>
          </div>

         
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="max-w-md pb-2"
          >
            <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
              Every shipment generates signal. FleetFlow+ turns it into smarter
              routes, healthier vehicles and on-time deliveries — automatically.
            </p>
          </motion.div>
        </div>

       
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-20 overflow-hidden rounded-[2rem] border border-border bg-border"
        >
          <div className="grid grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES_DATA.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group bg-background p-10 transition-colors hover:bg-muted/10 md:p-12"
              >
               
                <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform duration-300 group-hover:scale-110">
                  <feature.icon className="h-6 w-6" />
                </div>

                
                <h3 className="mb-3 text-xl font-bold text-foreground tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default memo(FeaturesSection);
