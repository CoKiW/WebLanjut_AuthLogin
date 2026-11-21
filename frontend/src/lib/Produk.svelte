<script>
    import { onMount } from "svelte";
    import {
        getProduk,
        createProduk,
        updateProduk,
        deleteProduk,
    } from "./api.js";

    let { user, onlogout } = $props();

    // Authorization di sisi tampilan: hanya admin yang melihat form dan tombol aksi.
    // Catatan: ini hanya mengatur tampilan. Yang benar-benar melindungi data
    // adalah pengecekan role di backend.
    const isAdmin = $derived(user.role === "admin");

    let produk = $state([]);
    let form = $state({ namaBarang: "", harga: "", stok: "" });
    let editId = $state(null);
    let error = $state("");
    let loading = $state(false);

    async function muatData() {
        try {
            produk = await getProduk();
            error = "";
        } catch (e) {
            error = e.message;
        }
    }

    onMount(muatData);

    function resetForm() {
        form = { namaBarang: "", harga: "", stok: "" };
        editId = null;
    }

    async function simpan(event) {
        event.preventDefault();
        loading = true;

        const body = {
            namaBarang: form.namaBarang,
            harga: Number(form.harga),
            stok: Number(form.stok),
        };

        try {
            if (editId === null) {
                await createProduk(body);
            } else {
                await updateProduk(editId, body);
            }
            resetForm();
            await muatData();
        } catch (e) {
            error = e.message;
        } finally {
            loading = false;
        }
    }

    function edit(item) {
        editId = item.id;
        form = {
            namaBarang: item.namaBarang,
            harga: item.harga,
            stok: item.stok,
        };
    }

    async function hapus(id) {
        if (!confirm("Hapus produk ini? Tindakan ini tidak bisa dibatalkan.")) return;

        try {
            await deleteProduk(id);
            if (editId === id) resetForm();
            await muatData();
        } catch (e) {
            error = e.message;
        }
    }
</script>

<main>
    <header>
        <div>
            <h1>Data produk</h1>
            <p class="akun">
                Masuk sebagai <strong>{user.username}</strong>
                <span class="peran" class:admin={isAdmin}>{user.role}</span>
            </p>
        </div>
        <button class="secondary" onclick={onlogout}>Keluar</button>
    </header>

    {#if error}
        <p class="error" role="alert">{error}</p>
    {/if}

    {#if isAdmin}
        <form onsubmit={simpan}>
            <h2>{editId === null ? "Tambah produk" : "Ubah produk"}</h2>

            <label>
                Nama barang
                <input type="text" bind:value={form.namaBarang} required />
            </label>

            <div class="baris">
                <label>
                    Harga
                    <input type="number" min="0" bind:value={form.harga} required />
                </label>
                <label>
                    Stok
                    <input type="number" min="0" bind:value={form.stok} required />
                </label>
            </div>

            <div class="aksi">
                <button type="submit" disabled={loading}>
                    {editId === null ? "Simpan produk" : "Simpan perubahan"}
                </button>
                {#if editId !== null}
                    <button type="button" class="secondary" onclick={resetForm}>
                        Batal
                    </button>
                {/if}
            </div>
        </form>
    {:else}
        <p class="info">
            Akun dengan peran user hanya bisa melihat data. Menambah, mengubah,
            dan menghapus produk khusus admin.
        </p>
    {/if}

    <div class="tabel">
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nama barang</th>
                    <th>Harga</th>
                    <th>Stok</th>
                    {#if isAdmin}<th>Aksi</th>{/if}
                </tr>
            </thead>
            <tbody>
                {#each produk as item (item.id)}
                    <tr>
                        <td>{item.id}</td>
                        <td>{item.namaBarang}</td>
                        <td>{item.harga}</td>
                        <td>{item.stok}</td>
                        {#if isAdmin}
                            <td class="aksi">
                                <button class="secondary" onclick={() => edit(item)}>
                                    Ubah
                                </button>
                                <button class="danger" onclick={() => hapus(item.id)}>
                                    Hapus
                                </button>
                            </td>
                        {/if}
                    </tr>
                {:else}
                    <tr>
                        <td colspan={isAdmin ? 5 : 4} class="kosong">
                            {isAdmin
                                ? "Belum ada produk. Tambahkan produk pertama lewat form di atas."
                                : "Belum ada produk."}
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</main>

<style>
    main {
        max-width: 720px;
        margin: 0 auto;
        padding: 2rem 1rem 3rem;
    }

    header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1rem;
        margin-bottom: 1.5rem;
    }

    h1 {
        margin: 0;
        font-size: 1.6rem;
        font-weight: 650;
        letter-spacing: -0.01em;
    }

    h2 {
        margin: 0;
        font-size: 1.05rem;
        font-weight: 650;
    }

    .akun {
        margin: 0.25rem 0 0;
        color: #5b6876;
        font-size: 0.92rem;
    }

    .peran {
        display: inline-block;
        margin-left: 0.4rem;
        padding: 0.05rem 0.5rem;
        border-radius: 999px;
        background: #e1e6eb;
        color: #3d4a57;
        font-size: 0.8rem;
        font-weight: 600;
    }

    .peran.admin {
        background: #d3ece8;
        color: #0a5851;
    }

    form {
        display: flex;
        flex-direction: column;
        gap: 0.9rem;
        padding: 1.25rem;
        margin-bottom: 1.5rem;
        background: #fff;
        border: 1px solid #d5dbe1;
        border-radius: 10px;
    }

    .baris {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.9rem;
    }

    label {
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
        font-size: 0.9rem;
        font-weight: 550;
    }

    input {
        padding: 0.55rem 0.7rem;
        border: 1px solid #b9c2cb;
        border-radius: 6px;
        font: inherit;
        font-weight: 400;
    }

    button {
        padding: 0.5rem 0.95rem;
        border: none;
        border-radius: 6px;
        background: #0e6b63;
        color: #fff;
        font: inherit;
        font-size: 0.92rem;
        font-weight: 600;
        cursor: pointer;
    }

    button:hover:not(:disabled) {
        filter: brightness(0.92);
    }

    button:disabled {
        opacity: 0.65;
        cursor: not-allowed;
    }

    button.secondary {
        background: #e1e6eb;
        color: #25313d;
    }

    button.danger {
        background: #b3261e;
    }

    .aksi {
        display: flex;
        gap: 0.5rem;
    }

    .tabel {
        overflow-x: auto;
        background: #fff;
        border: 1px solid #d5dbe1;
        border-radius: 10px;
    }

    table {
        width: 100%;
        border-collapse: collapse;
    }

    th,
    td {
        padding: 0.7rem 0.9rem;
        text-align: left;
        border-bottom: 1px solid #e6eaee;
    }

    th {
        font-size: 0.85rem;
        color: #5b6876;
        font-weight: 600;
    }

    tbody tr:last-child td {
        border-bottom: none;
    }

    .kosong {
        text-align: center;
        color: #5b6876;
        padding: 1.5rem;
    }

    .info {
        margin: 0 0 1.5rem;
        padding: 0.75rem 1rem;
        background: #fff;
        border: 1px solid #d5dbe1;
        border-left: 3px solid #0e6b63;
        border-radius: 6px;
        color: #3d4a57;
        font-size: 0.92rem;
    }

    .error {
        margin: 0 0 1rem;
        padding: 0.6rem 0.8rem;
        background: #fdecea;
        border: 1px solid #f3b8b3;
        color: #8c1d18;
        border-radius: 6px;
        font-size: 0.9rem;
    }

    @media (max-width: 520px) {
        .baris {
            grid-template-columns: 1fr;
        }
    }
</style>
