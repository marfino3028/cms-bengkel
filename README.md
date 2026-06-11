# BengkelKu CMS (Nuxt 4)

Panel **Admin** untuk mengelola bengkel motor: dashboard statistik & pendapatan, CRUD produk/kategori/layanan/banner, kelola booking servis (status, tambah sparepart/jasa, pembayaran), kelola pesanan sparepart, data pelanggan, dan pengaturan profil bengkel. Hanya akun ber-role **admin** yang bisa masuk. Desain modern & responsif (sidebar collapsible di mobile).

Terhubung ke [api-bengkel](https://github.com/marfino3028/api-bengkel) (Laravel). Bagian dari ekosistem **BengkelKu** (api · cms · web · mobile).

---

## 🚀 Menjalankan Lokal

```bash
npm install
cp .env.example .env       # set NUXT_PUBLIC_API_BASE ke URL API kamu
npm run dev                # http://localhost:3000
```

`.env`:
```
NUXT_PUBLIC_API_BASE=http://localhost:8000/api
```

**Login admin** (akun seed dari API):
- Email: `admin@bengkelku.com`
- Password: `password`

Build produksi: `npm run build` lalu `node .output/server/index.mjs`.

---

## ☁️ Deploy ke Koyeb (Docker)

1. [koyeb.com](https://www.koyeb.com) → **Create Service** → **GitHub** → pilih `marfino3028/cms-bengkel`.
2. **Builder**: **Dockerfile** (disediakan di repo).
3. **Port**: `8000`.
4. **Environment variables**:
   ```
   NUXT_PUBLIC_API_BASE=https://apibengkel.hamztech.my.id/api
   ```
   (sebelum domain custom aktif bisa pakai domain Railway `https://<app>.up.railway.app/api`)
5. **Deploy** → URL seperti `https://cms-bengkel-<org>.koyeb.app`.

---

## 🌐 Custom Domain via Cloudflare — `cmsbengkel.hamztech.my.id`

Panel admin dipasang di **`cmsbengkel.hamztech.my.id`** (Koyeb). Prasyarat: domain `hamztech.my.id` aktif di Cloudflare.

**Langkah 1 — Koyeb:** app cms-bengkel → **Settings** → **Domains** → **Add domain** → `cmsbengkel.hamztech.my.id`. Salin target CNAME (mis. `cms-bengkel-xxxx.koyeb.app`).

**Langkah 2 — Cloudflare DNS** (`hamztech.my.id` → DNS → Add record):

| Type | Name | Target | Proxy | TTL |
|---|---|---|---|---|
| `CNAME` | `cmsbengkel` | `cms-bengkel-xxxx.koyeb.app` *(dari Koyeb)* | **DNS only** (abu-abu) | Auto |

> Wajib **DNS only** dulu agar Koyeb bisa menerbitkan SSL. Setelah aktif boleh **Proxied** + SSL/TLS **Full (strict)**.

**Langkah 3 — Tes:** buka `https://cmsbengkel.hamztech.my.id`.

**Langkah 4 — Env Koyeb** (lalu Redeploy):
```
NUXT_PUBLIC_API_BASE=https://apibengkel.hamztech.my.id/api
```

**🗺️ Peta domain ekosistem:**
| Subdomain | Tujuan | Platform |
|---|---|---|
| `apibengkel.hamztech.my.id` | API Laravel | Railway |
| `cmsbengkel.hamztech.my.id` | Panel admin (repo ini) | Koyeb |
| `webbengkel.hamztech.my.id` | Website publik | Koyeb |

---

## 🔒 Catatan
- CMS menyimpan token di cookie `admin_token`; non-admin otomatis ditolak.
- Pastikan origin CMS diizinkan oleh CORS API. Di Railway set `FRONTEND_URLS=https://webbengkel.hamztech.my.id,https://cmsbengkel.hamztech.my.id` (atau `*`).

## 🛠️ Stack
Nuxt 4 (SSR) · Vue 3 · Tailwind CSS v4 · Pinia · @nuxt/icon (Lucide).
