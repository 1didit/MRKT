import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "./auth-shared";

/**
 * TEMPORARY dev gate: username `admin` / password `1234`.
 * Not production-grade (single hardcoded credential). Replace with real
 * email + argon2id auth and roles before launch.
 */
const SECRET = process.env.AUTH_SECRET ?? "dev-neva-secret-change-me";
const ADMIN_USER = process.env.ADMIN_USER ?? "admin";
const ADMIN_PASS = process.env.ADMIN_PASS ?? "1234";

export { SESSION_COOKIE };

function hmac(body: string) {
  return crypto.createHmac("sha256", SECRET).update(body).digest("base64url");
}

export function createToken(): string {
  const body = Buffer.from(
    JSON.stringify({ u: ADMIN_USER, t: Date.now() }),
  ).toString("base64url");
  return `${body}.${hmac(body)}`;
}

export function verifyToken(token?: string): boolean {
  if (!token) return false;
  const [body, sig] = token.split(".");
  if (!body || !sig) return false;
  const expected = hmac(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function checkCredentials(username: string, password: string): boolean {
  return username === ADMIN_USER && password === ADMIN_PASS;
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return verifyToken(store.get(SESSION_COOKIE)?.value);
}
