import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { mahasiswaRoute } from "./routes/mahasiswa";
import { produkRoute } from "./routes/produk";
import { authRoute } from "./routes/auth";

const app = new Elysia()
    .use(cors())
    .use(authRoute)
    .use(produkRoute)
    .use(mahasiswaRoute)
    .listen(3000);

console.log(`Server berjalan pada http://${app.server?.hostname}:${app.server?.port}`);
