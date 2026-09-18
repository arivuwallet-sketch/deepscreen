import { useId, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { requestNewsletterSubscription } from "@/lib/discovery/newsletter";

export function NewsletterForm() {
  const id = useId();
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  async function subscribe(event: FormEvent) {
    event.preventDefault();
    if (busy || !consent) return;
    setBusy(true);
    setStatus("");
    try {
      const accepted = await requestNewsletterSubscription(email, (row) =>
        supabase.from("newsletter_subscribers").insert(row),
      );
      if (!accepted) {
        setStatus(
          "We could not record your request. Please try again, or contact deepscreen.online@outlook.com.",
        );
        return;
      }
      setEmail("");
      setConsent(false);
      setStatus(
        "Your subscription request is recorded. If you already subscribed, your existing subscription stays the same.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={subscribe} aria-busy={busy} className="w-full max-w-xl space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor={`${id}-email`}>
          Email address
        </label>
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          disabled={busy}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="min-w-0 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={busy || !consent}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {busy ? "Subscribing…" : "Subscribe to updates"}
        </button>
      </div>
      <label
        htmlFor={`${id}-consent`}
        className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground"
      >
        <input
          id={`${id}-consent`}
          type="checkbox"
          required
          checked={consent}
          disabled={busy}
          onChange={(event) => setConsent(event.target.checked)}
          className="mt-0.5"
        />
        <span>
          I agree to receive DeepScreen research and product updates by email. I can ask to
          unsubscribe at deepscreen.online@outlook.com.
        </span>
      </label>
      <p className="text-xs text-muted-foreground">
        See our{" "}
        <a href="/privacy" className="text-primary underline">
          privacy policy
        </a>
        . Subscribing is optional.
      </p>
      <p role="status" aria-live="polite" aria-atomic="true" className="text-sm">
        {status}
      </p>
    </form>
  );
}
