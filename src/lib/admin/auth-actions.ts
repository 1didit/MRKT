"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createSession, destroySession } from "@/lib/auth/session";
import { getUserByEmail } from "@/lib/auth/users";
import { verifyPassword } from "@/lib/auth/password";
import {
  clearAttempts,
  ipFromHeaders,
  isRateLimited,
  recordFailure,
} from "@/lib/rate-limit";

export interface LoginState {
  error?: string;
}

export async function adminLoginAction(
  _prev: LoginState | undefined,
  formData: FormData,
): Promise<LoginState> {
  const key = `admin-login:${ipFromHeaders(await headers())}`;
  if (isRateLimited(key)) {
    return { error: "Забагато спроб входу. Спробуйте за 15 хвилин." };
  }

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  const user = await getUserByEmail(email);
  if (
    !user ||
    user.role !== "admin" ||
    !(await verifyPassword(user.passwordHash, password))
  ) {
    recordFailure(key);
    return { error: "Невірний email або пароль" };
  }

  clearAttempts(key);
  await createSession(user.id);
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}
