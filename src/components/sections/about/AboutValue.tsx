import { Eye, Truck, Zap, Handshake, type LucideIcon } from "lucide-react";



type Value = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const VALUES: Value[] = [
  {
    icon: Eye,
    title: "Radical transparency",
    description:
      'Every mile, every rupee, visible to the people who need it. No hidden fees, no vague "in transit."',
  },
  {
    icon: Truck,
    title: "Built for the field",
    description:
      "We test on real trucks with real 3am breakdowns, not just in demos and slide decks.",
  },
  {
    icon: Zap,
    title: "Speed with judgment",
    description:
      "Real-time doesn't help if it's wrong. We optimize for fast and right, in that order of difficulty.",
  },
  {
    icon: Handshake,
    title: "Partnership over contracts",
    description:
      "Growing your fleet is the goal, not lock-in. We'd rather earn the renewal every year.",
  },
];



export function AboutValuesSection() {
  return (
    <section className="bg-background px-6 py-24 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange">
              # what drives us
            </span>
            <h2 className="mt-6 max-w-xl font-heading text-4xl font-bold uppercase leading-[1.05] tracking-tight text-foreground md:text-5xl">
              Principles built{" "}
              <span className="text-brand-yellow">for the road.</span>
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground md:text-base">
            These aren&apos;t posters on a wall. They&apos;re the calls we make
            when a shipment is late and a customer is waiting.
          </p>
        </div>

        <div className="grid grid-cols-1 divide-y divide-border overflow-hidden rounded-3xl border border-border sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
          {VALUES.map((value) => {
            const Icon = value.icon;
            return (
              <div
                key={value.title}
                className="group relative bg-card/30 p-7 transition-colors hover:bg-card/60"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-yellow/15 text-brand-yellow transition-colors group-hover:bg-brand-yellow group-hover:text-black">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-base font-semibold text-foreground">
                  {value.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {value.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default AboutValuesSection;
