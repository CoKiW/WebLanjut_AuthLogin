import { integer, pgTable, varchar, timestamp } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  age: integer().notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  createdAt: timestamp().defaultNow()
});

export const produkTable = pgTable("produk", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    namaBarang: varchar({ length: 255}).notNull(),
    stok: integer().default(0),
    harga: integer().notNull(),
    createdAt: timestamp().defaultNow()
})

export const akunTable = pgTable("akun", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    username: varchar({ length: 50 }).notNull().unique(),
    password: varchar({ length: 255 }).notNull(),
    role: varchar({ length: 20 }).notNull().default("user"),
    createdAt: timestamp().defaultNow().notNull(),
});
