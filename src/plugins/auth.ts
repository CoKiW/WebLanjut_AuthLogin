import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";

const secret = process.env.JWT_SECRET;
if (!secret) {
    throw new Error("JWT_SECRET belum diisi di file .env");
}

// Plugin ini melakukan AUTHENTICATION:
// membaca token dari header "Authorization: Bearer <token>",
// memverifikasinya, lalu menyediakan `user` di setiap route.
// Kalau token tidak ada atau tidak valid, `user` bernilai null.
export const authPlugin = new Elysia({ name: "auth-plugin" })
    .use(
        jwt({
            name: "jwt",
            secret,
            exp: "1d", // token berlaku 1 hari
        })
    )
    .derive({ as: "scoped" }, async ({ jwt, headers }) => {
        const header = headers.authorization;
        const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

        if (!token) return { user: null };

        const payload = await jwt.verify(token);
        if (!payload) return { user: null };

        return {
            user: {
                id: Number(payload.sub),
                username: String(payload.username),
                role: String(payload.role),
            },
        };
    });

// Guard untuk AUTHORIZATION.
// Dipakai di route lewat opsi: { beforeHandle: requireRole("admin") }
// - belum login            -> 401 Unauthorized
// - login tapi role salah  -> 403 Forbidden
export const requireRole =
    (...roles: string[]) =>
    ({ user, set }: any) => {
        if (!user) {
            set.status = 401;
            return { message: "Silakan login terlebih dahulu" };
        }

        if (roles.length > 0 && !roles.includes(user.role)) {
            set.status = 403;
            return { message: "Kamu tidak punya akses untuk aksi ini" };
        }
    };

// Cukup login, role apa pun boleh.
export const requireAuth = requireRole();
