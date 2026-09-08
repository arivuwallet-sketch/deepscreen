import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, User2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export function AuthButton() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  if (loading) return <div className="h-8 w-20 animate-pulse rounded bg-accent" />;

  if (!session) {
    return (
      <Button asChild size="sm" variant="outline" className="whitespace-nowrap">
        <Link to="/auth">Sign in</Link>
      </Button>
    );
  }

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden max-w-[10rem] truncate text-xs text-muted-foreground md:flex md:items-center md:gap-1">
        <User2 className="size-3.5 shrink-0" />
        {session.user.email}
      </span>
      <Button size="sm" variant="ghost" onClick={signOut} className="whitespace-nowrap">
        <LogOut className="size-3.5" /> Sign out
      </Button>
    </div>
  );
}
