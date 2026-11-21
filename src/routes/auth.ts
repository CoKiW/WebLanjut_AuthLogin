import { Elysia, t } from "elysia";
import { eq } from "drizzle-orm";
import { db } from "../db/index";
import { akunTable } from "../db/schema";
import { authPlugin, requireAuth } from "../plugins/auth";

const credentials = t.Object({
    username: t.String({ minLength: 3, maxLength: 50 }),
    password: t.String({ minLength: 6, maxLength: 100 }),
});

// Semua route ditulis dalam satu rantai (chain) supaya
// TypeScript mengenali `jwt` dan `user` di dalam handler.
export const authRoute = new Elysia({ prefix: "/auth" })
    .use(authPlugin)

    // Register: akun baru selalu berperan "user".
    // Role "admin" hanya dibuat lewat seed (src/seed-admin.ts).
    .post(
        "/register",
        async ({ body, set }) => {
            const [existing] = await db
                .select()
                .from(akunTable)
                .where(eq(akunTable.username, body.username));

            if (existing) {
                set.status = 409;
                return { message: "Username sudah dipakai" };
            }

            // Password di-hash, tidak pernah disimpan sebagai teks asli
            const hash = await Bun.password.hash(body.password);

            const [user] = await db
                .insert(akunTable)
                .values({ username: body.username, password: hash })
                .returning({
                    id: akunTable.id,
                    username: akunTable.username,
                    role: akunTable.role,
                });

            set.status = 201;
            return user;
        },
        { body: credentials }
    )

    // Login: cek username + password, lalu kirim token JWT
    .post(
        "/login",
        async ({ body, set, jwt }) => {
            const [user] = await db
                .select()
                .from(akunTable)
                .where(eq(akunTable.username, body.username));

            const valid =
                user && (await Bun.password.verify(body.password, user.password));

            // Pesan sengaja sama untuk dua kemungkinan salah,
            // supaya penyerang tidak tahu username mana yang ada
            if (!valid) {
                set.status = 401;
                return { message: "Username atau password salah" };
            }

            const token = await jwt.sign({
                sub: String(user.id),
                username: user.username,
                role: user.role,
            });

            return {
                token,
                user: { id: user.id, username: user.username, role: user.role },
            };
        },
        { body: credentials }
    )

    // Cek siapa yang sedang login (butuh token valid)
    .get("/me", ({ user }) => user, { beforeHandle: requireAuth });
