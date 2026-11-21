const API_URL = "http://localhost:3000";
const TOKEN_KEY = "token";
const USER_KEY = "user";

// ---------- Sesi login (disimpan di localStorage) ----------

export function getSession() {
    try {
        const token = localStorage.getItem(TOKEN_KEY);
        const user = localStorage.getItem(USER_KEY);
        if (!token || !user) return null;
        return { token, user: JSON.parse(user) };
    } catch {
        return null;
    }
}

export function saveSession({ token, user }) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

// ---------- Fungsi request ----------

async function request(path, options = {}) {
    const session = getSession();

    const res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            // Token dikirim di setiap request supaya backend tahu siapa kita
            ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
        },
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
        // Token kedaluwarsa atau ditolak: keluar otomatis
        if (res.status === 401 && session) {
            clearSession();
            window.dispatchEvent(new Event("auth:logout"));
        }

        if (res.status === 422) {
            throw new Error("Data tidak valid, periksa kembali isian kamu");
        }

        throw new Error(
            data?.message ?? data?.error ?? "Terjadi kesalahan, coba lagi"
        );
    }

    return data;
}

// ---------- Auth ----------

export const login = (username, password) =>
    request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
    });

export const register = (username, password) =>
    request("/auth/register", {
        method: "POST",
        body: JSON.stringify({ username, password }),
    });

// ---------- Produk ----------

export const getProduk = () => request("/produk");

export const createProduk = (body) =>
    request("/produk", { method: "POST", body: JSON.stringify(body) });

export const updateProduk = (id, body) =>
    request(`/produk/${id}`, { method: "PUT", body: JSON.stringify(body) });

export const deleteProduk = (id) =>
    request(`/produk/${id}`, { method: "DELETE" });
