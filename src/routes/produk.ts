import { Elysia, t } from "elysia";
import { db } from "../db/index";
import { produkTable } from "../db/schema";
import { eq } from "drizzle-orm";
import { authPlugin, requireAuth, requireRole } from "../plugins/auth";

export const produkRoute = new Elysia({
    prefix: "/produk"
}).use(authPlugin);

// Validasi body (nama field harus sama dengan kolom di schema.ts)
const produkBody = t.Object({
    namaBarang: t.String({ minLength: 1 }),
    harga: t.Number({ minimum: 0 }),
    stok: t.Number({ minimum: 0 }),
});

const idParams = t.Object({
    id: t.Numeric(),
});

// Aturan akses:
// - Lihat produk (GET)                  -> semua user yang sudah login
// - Tambah/ubah/hapus (POST/PUT/DELETE) -> hanya admin

// 1. Create produk (admin)
produkRoute.post(
    "/",
    async ({ body, set }) => {
        const [data] = await db
            .insert(produkTable)
            .values(body)
            .returning();

        set.status = 201;
        return data;
    },
    { body: produkBody, beforeHandle: requireRole("admin") }
);

// 2. Read produk (semua) - harus login
produkRoute.get(
    "/",
    async () => {
        const data = await db.select().from(produkTable);
        return data;
    },
    { beforeHandle: requireAuth }
);

// 2. Read produk (by id) - harus login
produkRoute.get(
    "/:id",
    async ({ params, set }) => {
        const [data] = await db
            .select()
            .from(produkTable)
            .where(eq(produkTable.id, params.id));

        if (!data) {
            set.status = 404;
            return { message: "Produk tidak ditemukan" };
        }

        return data;
    },
    { params: idParams, beforeHandle: requireAuth }
);

// 3. Update produk (admin)
produkRoute.put(
    "/:id",
    async ({ params, body, set }) => {
        const [data] = await db
            .update(produkTable)
            .set(body)
            .where(eq(produkTable.id, params.id))
            .returning();

        if (!data) {
            set.status = 404;
            return { message: "Produk tidak ditemukan" };
        }

        return data;
    },
    {
        params: idParams,
        body: t.Partial(produkBody),
        beforeHandle: requireRole("admin"),
    }
);

// 4. Delete produk (admin)
produkRoute.delete(
    "/:id",
    async ({ params, set }) => {
        const [data] = await db
            .delete(produkTable)
            .where(eq(produkTable.id, params.id))
            .returning();

        if (!data) {
            set.status = 404;
            return { message: "Produk tidak ditemukan" };
        }

        return { message: "Produk berhasil dihapus", data };
    },
    { params: idParams, beforeHandle: requireRole("admin") }
);
