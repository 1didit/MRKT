"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createSession, destroySession } from "./session";
import { createUser, getUserByEmail } from "./users";
import { verifyPassword } from "./password";
import {
  clearAttempts,
  ipFromHeaders,
  isRateLimited,
  recordFailure,
} from "@/lib/rate-limit";

export interface AuthState {
  error?: string;
}

export async function registerAction(
  _prev: AuthState | undefined,
  formData: FormData,
): Promise<AuthState> {
  const key = `register:${ipFromHeaders(await headers())}`;
  if (isRateLimited(key)) {
    return { error: "Слишком много попыток. Попробуйте позже." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "Заполните email и пароль" };
  if (password.length < 6)
    return { error: "Пароль должен быть не короче 6 символов" };
  if (await getUserByEmail(email))
    return { error: "Этот email уже зарегистрирован" };

  recordFailure(key);
  const id = await createUser({ email, password, name, role: "client" });
  await createSession(id);
  redirect("/account");
}

export async function loginAction(
  _prev: AuthState | undefined,
  formData: FormData,
): Promise<AuthState> {
  const key = `login:${ipFromHeaders(await headers())}`;
  if (isRateLimited(key)) {
    return { error: "Слишком много попыток входа. Попробуйте через 15 минут." };
  }

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  const user = await getUserByEmail(email);
  if (!user || !(await verifyPassword(user.passwordHash, password))) {
    recordFailure(key);
    return { error: "Неверный email или пароль" };
  }
  clearAttempts(key);
  await createSession(user.id);
  redirect("/account");
}

export async function clientLogoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}
