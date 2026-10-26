"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <main className="grid min-h-svh place-items-center bg-casuarina-deep px-5">
      <form action={action} className="w-full max-w-sm rounded-2xl bg-shell p-8">
        <p className="font-display text-2xl">Jhaubon</p>
        <h1 className="mt-6 text-lg font-semibold">Sign in to the front desk</h1>
        <label className="mt-6 grid gap-1.5 text-sm">
          <span className="font-medium">Email</span>
          <input key={state.email} name="email" type="email" autoComplete="username" required defaultValue={state.email} className={input} />
        </label>
        <label className="mt-4 grid gap-1.5 text-sm">
          <span className="font-medium">Password</span>
          <input name="password" type="password" autoFocus={!!state.error} autoComplete="current-password" required className={input} />
        </label>
        {state.error && (
          <p className="mt-4 text-sm text-red-700" role="alert">
            {state.error}
          </p>
        )}
        <Button type="submit" variant="solid" className="mt-6 w-full" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </main>
  );
}

const input = "h-10 rounded-lg border border-casuarina/20 bg-white px-3 outline-none focus-visible:border-wisteria focus-visible:ring-2 focus-visible:ring-wisteria/30";
