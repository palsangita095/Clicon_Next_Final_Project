"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  MessageCircle,
  Phone,
  MapPin,
  Send,
  Loader2,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import { useStoreSettings } from "@/hooks/useStoreSettings";

type ContactChannel = {
  icon: LucideIcon;
  label: string;
  value: string;
  hint: string;
};

type FormStatus = "idle" | "submitting" | "success" | "error";

type FormValues = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const INITIAL_VALUES: FormValues = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

export function ContactSection() {
  const settings = useStoreSettings();
  const channels: ContactChannel[] = [
    {
      icon: MessageCircle,
      label: "Shopping support",
      value: settings.contactEmail,
      hint: "Orders, returns, billing, and product questions",
    },
    {
      icon: Phone,
      label: "Support line",
      value: settings.contactPhone,
      hint: "Mon-Sat, 9am-5pm",
    },
    {
      icon: MapPin,
      label: "Store office",
      value: "New York, United States",
      hint: "Support by appointment only",
    },
  ];

  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [status, setStatus] = useState<FormStatus>("idle");

  const handleChange =
    (field: keyof FormValues) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("submitting");

    try {
      const supabase = createClient();
      const { error } = await supabase.from("support_queries").insert({
        name: values.name,
        email: values.email,
        subject: values.subject || "Customer support request",
        message: values.message,
        status: "open",
      });

      if (error) throw error;

      setStatus("success");
      setValues(INITIAL_VALUES);
    } catch {
      setStatus("error");
    }
  };

  const inputClass =
    "w-full rounded-xl border border-input bg-input/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20";

  return (
    <section className="bg-background px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-14 md:grid-cols-[1fr_1.1fr] md:gap-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange">
              # talk to us
            </span>

            <h2 className="mt-6 font-heading text-4xl font-bold uppercase leading-[1.05] tracking-tight text-foreground md:text-5xl">
              Let&apos;s solve your{" "}
              <span className="text-brand-yellow">shopping question.</span>
            </h2>

            <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
              Questions about an order, address, payment method, return, or
              product? Send the details and our support team will follow up.
            </p>

            <div className="mt-8 inline-flex items-center gap-2.5 rounded-full border border-border bg-card/40 px-4 py-2">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Support online · avg reply 12m
              </span>
            </div>

            <div className="mt-10 space-y-4">
              {channels.map((channel) => {
                const Icon = channel.icon;
                return (
                  <div key={channel.label} className="flex items-start gap-4 rounded-2xl border border-border bg-card/30 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-orange/10 text-brand-orange">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{channel.label}</p>
                      <p className="text-sm text-foreground/90">{channel.value}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{channel.hint}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Card className="border-border bg-card/40">
            <CardContent className="p-7 md:p-9">
              {status === "success" ? (
                <div className="flex min-h-90 flex-col items-center justify-center text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
                    <CheckCircle2 className="h-7 w-7 text-emerald-500" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-foreground">Message sent</h3>
                  <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                    Thanks for reaching out. Your message is now in the admin support queue.
                  </p>
                  <Button variant="outline" className="mt-6" onClick={() => setStatus("idle")}>
                    Send another message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="contact-name" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Name
                      </label>
                      <input id="contact-name" required value={values.name} onChange={handleChange("name")} placeholder="Kevin Gilbert" className={inputClass} />
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Email
                      </label>
                      <input id="contact-email" type="email" required value={values.email} onChange={handleChange("email")} placeholder="kevin@example.com" className={inputClass} />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-subject" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Subject <span className="normal-case text-muted-foreground/60">(optional)</span>
                    </label>
                    <input id="contact-subject" value={values.subject} onChange={handleChange("subject")} placeholder="Order issue, return, payment..." className={inputClass} />
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Message
                    </label>
                    <textarea id="contact-message" required rows={5} value={values.message} onChange={handleChange("message")} placeholder="Tell us what you need help with..." className={`${inputClass} resize-none`} />
                  </div>

                  <Button type="submit" disabled={status === "submitting"} className="w-full bg-brand-orange text-white hover:bg-brand-orange/90 sm:w-auto">
                    {status === "submitting" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send message
                      </>
                    )}
                  </Button>

                  {status === "error" && (
                    <p className="text-sm text-destructive">
                      Something went wrong. Please try again or email us directly.
                    </p>
                  )}
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

export default ContactSection;
