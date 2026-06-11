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
   NUXT_PUBLIC_API_BASE=https://api-bengkel-production.up.railway.app/api
   ```
   (atau `https://api.domainmu.com/api` bila pakai Cloudflare)
5. **Deploy** → URL seperti `https://cms-bengkel-<org>.koyeb.app`.

---

## 🌐 Custom Domain via Cloudflare (subdomain `cms`)

1. **Koyeb** → service → *Settings* → **Domains** → **Add domain** → `cms.domainmu.com`. Catat target CNAME-nya.
2. **Cloudflare** → **DNS** → **Add record**: Type `CNAME` · Name `cms` · Target `xxxx.koyeb.app` · Proxy **DNS only** dulu, aktifkan oranye setelah SSL terbit.
3. Panel admin di `https://cms.domainmu.com`.

> Total ekosistem 3 subdomain: `api` (Railway), `cms` (repo ini, Koyeb), `www` (web-bengkel, Koyeb).

---

## 🔒 Catatan
- CMS menyimpan token di cookie `admin_token`; non-admin otomatis ditolak.
- Pastikan origin CMS diizinkan oleh CORS API. Di API set `FRONTEND_URLS` (mis. `https://cms.domainmu.com,https://www.domainmu.com`) atau `*`.

## 🛠️ Stack
Nuxt 4 (SSR) · Vue 3 · Tailwind CSS v4 · Pinia · @nuxt/icon (Lucide).
