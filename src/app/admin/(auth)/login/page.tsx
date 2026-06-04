"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/admin/auth-actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, undefined);

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <div className="font-display text-3xl tracking-[0.3em] text-zinc-900">
          NEVA
        </div>
        <p className="mt-2 text-[11px] uppercase tracking-luxe text-zinc-500">
          Admin panel
        </p>
      </div>

      <form
        action={action}
        className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm"
      >
        <div>
          <label
            htmlFor="username"
            className="mb-1.5 block text-xs font-medium text-zinc-600"
          >
            Login
          </label>
          <input
            id="username"
            name="username"
            autoComplete="username"
            autoFocus
            className="h-11 w-full rounded-lg border border-zinc-300 px-3 text-sm outline-none transition-colors focus:border-zinc-900"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-xs font-medium text-zinc-600"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            className="h-11 w-full rounded-lg border border-zinc-300 px-3 text-sm outline-none transition-colors focus:border-zinc-900"
          />
        </div>

        {state?.error && (
          <p className="text-sm text-red-600">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="h-11 w-full rounded-lg bg-zinc-900 text-sm font-medium text-white transition-colors hover:bg-accent disabled:opacity-60 cursor-pointer"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>

        <p className="text-center text-xs text-zinc-400">
          Dev login: admin / 1234
        </p>
      </form>
    </div>
  );
}
