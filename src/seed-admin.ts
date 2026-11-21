// Membuat akun admin pertama.
// Jalankan sekali: bun run src/seed-admin.ts
import { eq } from "drizzle-orm";
import { db } from "./db/index";
import { akunTable } from "./db/schema";

const username = "admin";
const password = "admin123"; // ganti sesuai keinginan sebelum dijalankan

const [existing] = await db
    .select()
    .from(akunTable)
    .where(eq(akunTable.username, username));

if (existing) {
    console.log("Akun admin sudah ada, tidak dibuat ulang.");
    process.exit(0);
}

await db.insert(akunTable).values({
    username,
    password: await Bun.password.hash(password),
    role: "admin",
});

console.log(`Admin dibuat. Username: ${username}, password: ${password}`);
process.exit(0);
