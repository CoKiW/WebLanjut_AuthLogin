<script>
    import { onMount } from "svelte";
    import { getSession, saveSession, clearSession } from "./lib/api.js";
    import Login from "./lib/Login.svelte";
    import Produk from "./lib/Produk.svelte";

    // Kalau ada sesi tersimpan, langsung masuk tanpa login ulang
    let session = $state(getSession());

    function handleLogin(newSession) {
        saveSession(newSession);
        session = newSession;
    }

    function handleLogout() {
        clearSession();
        session = null;
    }

    // api.js mengirim event ini kalau token ditolak server (misalnya kedaluwarsa)
    onMount(() => {
        window.addEventListener("auth:logout", handleLogout);
        return () => window.removeEventListener("auth:logout", handleLogout);
    });
</script>

{#if session}
    <Produk user={session.user} onlogout={handleLogout} />
{:else}
    <Login onlogin={handleLogin} />
{/if}

<style>
    :global(body) {
        margin: 0;
        background: #eef1f4;
        color: #16202a;
        font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
        line-height: 1.5;
    }

    :global(*, *::before, *::after) {
        box-sizing: border-box;
    }

    :global(:focus-visible) {
        outline: 2px solid #0e6b63;
        outline-offset: 2px;
    }
</style>
