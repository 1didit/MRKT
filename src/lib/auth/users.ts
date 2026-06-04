import "server-only";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/db/client";
import { users, type UserRow } from "@/db/schema";
import { hashPassword } from "./password";
import type { Role } from "./session";

export async function getUserByEmail(email: string): Promise<UserRow | null> {
  const [u] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);
  return u ?? null;
}

export async function createUser({
  email,
  password,
  name,
  role = "client",
}: {
  email: string;
  password: string;
  name?: string;
  role?: Role;
}): Promise<string> {
  const id = nanoid();
  await db.insert(users).values({
    id,
    email: email.toLowerCase(),
    passwordHash: await hashPassword(password),
    name: name ?? "",
    role,
  });
  return id;
}
