import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const SUPPORT_EMAIL = "deepscreen.online@outlook.com";

const MARKETS = ["India (NSE/BSE)", "United States (NYSE/Nasdaq)", "United Kingdom (LSE)", "All markets"];

export function LeadForm({
  heading = "Talk to the DeepScreen team",
  intro = "Tell us which markets you screen and what you need. We reply from deepscreen.online@outlook.com, usually within 24–48 hours.",
  subject = "DeepScreen enquiry",
}: {
  heading?: string;
  intro?: string;
  subject?: string;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [market, setMarket] = useState(MARKETS[3]);
  const [message, setMessage] = useState("");

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = [
      `Name: ${name}`,
      `Reply-to email: ${email}`,
      `Markets of interest: ${market}`,
      "",
      message,
    ].join("\n");
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
  };

  return (
    <section
      id="contact-form"
      className="rounded-lg border border-border bg-panel p-5"
      aria-labelledby="lead-form-heading"
    >
      <h2 id="lead-form-heading" className="text-base font-semibold text-foreground">
        {heading}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{intro}</p>
      <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
        <div className="grid gap-1.5">
          <Label htmlFor="lead-name">Your name</Label>
          <Input
            id="lead-name"
            name="name"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="lead-email">Email</Label>
          <Input
            id="lead-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="grid gap-1.5 sm:col-span-2">
          <Label htmlFor="lead-market">Markets you screen</Label>
          <select
            id="lead-market"
            name="market"
            value={market}
            onChange={(e) => setMarket(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
          >
            {MARKETS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-1.5 sm:col-span-2">
          <Label htmlFor="lead-message">How can we help?</Label>
          <Textarea
            id="lead-message"
            name="message"
            rows={4}
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <Button type="submit">Send enquiry</Button>
          <p className="mt-2 text-xs text-muted-foreground">
            This opens your email app with the details filled in, addressed to {SUPPORT_EMAIL}.
          </p>
        </div>
      </form>
    </section>
  );
}
