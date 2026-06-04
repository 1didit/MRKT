import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { hashPassword } from "@/lib/auth/password";

const EMAIL = process.env.ADMIN_EMAIL ?? "admin@neva.ru";
const PASS = process.env.ADMIN_PASSWORD ?? "admin1234";

async function main() {
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, EMAIL))
    .limit(1);
  if (existing) {
    console.log("Admin already exists:", EMAIL);
    return;
  }
  await db.insert(users).values({
    id: nanoid(),
    email: EMAIL,
    passwordHash: await hashPassword(PASS),
    name: "Administrator",
    role: "admin",
  });
  console.log(`Admin created: ${EMAIL} / ${PASS}`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
