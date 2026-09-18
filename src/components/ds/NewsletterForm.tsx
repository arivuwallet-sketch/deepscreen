import { useId, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { requestNewsletterSubscription } from "@/lib/discovery/newsletter";

import { supabase } from "@/integrations/supabase/client";

export function NewsletterForm() {
  const id = useId();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  async function subscribe(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    const accepted = await requestNewsletterSubscription(email, row => supabase.from("newsletter_subscribers").insert(row));
    setBusy(false);
    if (!accepted) {
      toast.error("Subscription failed. Please try again.");
      return;
    }
    setEmail("");
    toast.success("You’re subscribed to the DeepScreen research newsletter.");
  }

  return (
    <form onSubmit={subscribe} className="flex w-full max-w-md flex-col gap-2 sm:flex-row">
      <label className="sr-only" htmlFor={id}>Email address</label>
      <input id={id} type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="min-w-0 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm" />
      <button type="submit" disabled={busy} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60">{busy ? "Subscribing…" : "Subscribe"}</button>
    </form>
  );
}