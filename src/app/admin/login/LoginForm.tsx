"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/admin/actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function LoginForm({ from }: { from: string }) {
  const [state, formAction, isPending] = useActionState(loginAction, { error: null });

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-4">
      <input type="hidden" name="from" value={from} />
      <div>
        <Input
          type="password"
          name="password"
          placeholder="Password"
          aria-label="Admin password"
          required
          autoFocus
        />
        {state.error && <p className="mt-1.5 text-xs text-red-400">{state.error}</p>}
      </div>
      <Button type="submit" variant="primary" disabled={isPending} className="w-full">
        {isPending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
