<script>
    import { login, register } from "./api.js";

    let { onlogin } = $props();

    let mode = $state("login"); // "login" atau "register"
    let username = $state("");
    let password = $state("");
    let error = $state("");
    let loading = $state(false);

    const isLogin = $derived(mode === "login");

    function gantiMode() {
        mode = isLogin ? "register" : "login";
        error = "";
    }

    async function kirim(event) {
        event.preventDefault();
        error = "";
        loading = true;

        try {
            if (!isLogin) {
                await register(username, password);
            }
            // Setelah daftar, langsung masuk
            const session = await login(username, password);
            onlogin(session);
        } catch (e) {
            error = e.message;
        } finally {
            loading = false;
        }
    }
</script>

<main>
    <form onsubmit={kirim}>
        <h1>{isLogin ? "Masuk ke akunmu" : "Buat akun baru"}</h1>
        <p class="sub">
            {isLogin
                ? "Masuk untuk melihat dan mengelola data produk."
                : "Akun baru berperan sebagai user dan bisa melihat data produk."}
        </p>

        {#if error}
            <p class="error" role="alert">{error}</p>
        {/if}

        <label>
            Username
            <input
                type="text"
                bind:value={username}
                autocomplete="username"
                minlength="3"
                required
            />
        </label>

        <label>
            Password
            <input
                type="password"
                bind:value={password}
                autocomplete={isLogin ? "current-password" : "new-password"}
                minlength="6"
                required
            />
            {#if !isLogin}
                <span class="hint">Minimal 6 karakter.</span>
            {/if}
        </label>

        <button type="submit" disabled={loading}>
            {#if loading}
                Memproses...
            {:else}
                {isLogin ? "Masuk" : "Buat akun"}
            {/if}
        </button>

        <p class="ganti">
            {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}
            <button type="button" class="link" onclick={gantiMode}>
                {isLogin ? "Buat akun" : "Masuk"}
            </button>
        </p>
    </form>
</main>

<style>
    main {
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 1.5rem;
    }

    form {
        width: 100%;
        max-width: 380px;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 2rem;
        background: #fff;
        border: 1px solid #d5dbe1;
        border-radius: 10px;
    }

    h1 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 650;
        letter-spacing: -0.01em;
    }

    .sub {
        margin: -0.5rem 0 0;
        color: #5b6876;
        font-size: 0.95rem;
    }

    label {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
        font-size: 0.9rem;
        font-weight: 550;
    }

    input {
        padding: 0.65rem 0.75rem;
        border: 1px solid #b9c2cb;
        border-radius: 6px;
        font: inherit;
        font-weight: 400;
        background: #fff;
    }

    .hint {
        font-weight: 400;
        font-size: 0.82rem;
        color: #5b6876;
    }

    button[type="submit"] {
        padding: 0.7rem 1rem;
        border: none;
        border-radius: 6px;
        background: #0e6b63;
        color: #fff;
        font: inherit;
        font-weight: 600;
        cursor: pointer;
    }

    button[type="submit"]:hover:not(:disabled) {
        background: #0a5851;
    }

    button:disabled {
        opacity: 0.65;
        cursor: not-allowed;
    }

    .ganti {
        margin: 0;
        font-size: 0.9rem;
        color: #5b6876;
    }

    .link {
        padding: 0;
        border: none;
        background: none;
        color: #0e6b63;
        font: inherit;
        font-weight: 600;
        text-decoration: underline;
        cursor: pointer;
    }

    .error {
        margin: 0;
        padding: 0.6rem 0.8rem;
        background: #fdecea;
        border: 1px solid #f3b8b3;
        color: #8c1d18;
        border-radius: 6px;
        font-size: 0.9rem;
    }
</style>
