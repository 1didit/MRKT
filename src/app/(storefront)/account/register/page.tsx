"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerAction } from "@/lib/auth/actions";

const input =
  "h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm outline-none transition-colors focus:border-zinc-900";

export default function AccountRegisterPage() {
  const [state, action, pending] = useActionState(registerAction, undefined);

  return (
    <div className="mx-auto max-w-sm px-5 py-16">
      <h1 className="text-center text-2xl font-semibold text-zinc-900">
        Create account
      </h1>

      <form action={action} className="mt-8 space-y-4">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-xs font-medium text-zinc-600">
            Name
          </label>
          <input id="name" name="name" autoComplete="name" autoFocus className={input} />
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-zinc-600">
            Email
          </label>
          <input id="email" name="email" type="email" autoComplete="email" className={input} />
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-zinc-600">
            Password
          </label>
          <input id="password" name="password" type="password" autoComplete="new-password" className={input} />
        </div>

        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="h-11 w-full rounded-full bg-zinc-900 text-sm font-medium text-white transition-colors hover:bg-accent disabled:opacity-60 cursor-pointer"
        >
          {pending ? "Creating…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500">
        Already have an account?{" "}
        <Link href="/account/login" className="text-zinc-900 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
