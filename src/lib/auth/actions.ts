"use server";

import { redirect } from "next/navigation";
import { createSession, destroySession } from "./session";
import { createUser, getUserByEmail } from "./users";
import { verifyPassword } from "./password";

export interface AuthState {
  error?: string;
}

export async function registerAction(
  _prev: AuthState | undefined,
  formData: FormData,
): Promise<AuthState> {
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

  const id = await createUser({ email, password, name, role: "client" });
  await createSession(id);
  redirect("/account");
}

export async function loginAction(
  _prev: AuthState | undefined,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  const user = await getUserByEmail(email);
  if (!user || !(await verifyPassword(user.passwordHash, password))) {
    return { error: "Неверный email или пароль" };
  }
  await createSession(user.id);
  redirect("/account");
}

export async function clientLogoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}
