import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { Shell } from "@/components/ds/Shell";
import { metaKeywords, portfolioKeywords, screenerKeywords } from "@/lib/seo/keywords";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  staticData: { sitemap: false },
  head: () => {
    const title = "Sign in — DeepScreen alerts";
    const description =
      "Sign in to DeepScreen to build a watchlist and receive daily holding-period and sell-alert emails for your stocks.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "keywords", content: metaKeywords(["DeepScreen sign in", "stock watchlist account", "stock alerts account", "portfolio tracker account"], portfolioKeywords, screenerKeywords) },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
        { name: "robots", content: "noindex, follow" },
      ],
    };
  },
  component: AuthPage,
});

function getRedirectPath(): "/" | "/pricing" {
  if (typeof window === "undefined") return "/";
  return new URLSearchParams(window.location.search).get("redirect") === "/pricing"
    ? "/pricing"
    : "/";
}

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && session) void navigate({ to: getRedirectPath() });
  }, [loading, session, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          toast.error(
            error.message.toLowerCase().includes("invalid login")
              ? "Wrong email or password."
              : error.message,
          );
          return;
        }
        toast.success("Signed in");
        void navigate({ to: getRedirectPath() });
        return;
      }

      const redirectPath = getRedirectPath();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth?redirect=${encodeURIComponent(redirectPath)}`,
        },
      });
      if (error) {
        toast.error(
          error.message.toLowerCase().includes("already registered")
            ? "That email already has an account — sign in instead."
            : error.message,
        );
        return;
      }
      if (!data.session) {
        setCheckEmail(true);
        toast.success("Check your email to confirm your account.");
        return;
      }
      toast.success("Account created");
      void navigate({ to: redirectPath });
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setBusy(true);
    try {
      const redirectPath = getRedirectPath();
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: `${window.location.origin}/auth?redirect=${encodeURIComponent(redirectPath)}`,
      });
      if (result.error) {
        toast.error("Google sign-in failed. Please try again.");
        return;
      }
      if (result.redirected) return;
      toast.success("Signed in with Google");
      void navigate({ to: redirectPath });
    } catch {
      toast.error("Google sign-in failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell>
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-2xl font-bold tracking-tight">
          {mode === "signin" ? "Sign in to DeepScreen" : "Create your DeepScreen account"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          A free account unlocks your watchlist, holding-period tracking and daily sell alerts by email.
        </p>

        {checkEmail ? (
          <div className="mt-6 rounded-lg border border-border bg-panel p-5 text-sm">
            <p className="font-medium">Confirm your email</p>
            <p className="mt-2 text-muted-foreground">
              We sent a confirmation link to <span className="text-foreground">{email}</span>. Click it
              to activate your account, then come back and sign in.
            </p>
            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={() => {
                setCheckEmail(false);
                setMode("signin");
              }}
            >
              Back to sign in
            </Button>
          </div>
        ) : (
        <form onSubmit={submit} className="mt-6 space-y-4 rounded-lg border border-border bg-panel p-5">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </Button>
          <Button type="button" variant="outline" className="w-full" onClick={google} disabled={busy}>
            Continue with Google
          </Button>
        </form>
        )}

        {!checkEmail && (
        <button
          type="button"
          className="mt-4 text-xs text-muted-foreground underline"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        >
          {mode === "signin" ? "No account yet? Create one" : "Already have an account? Sign in"}
        </button>
        )}
      </div>
    </Shell>
  );
}
