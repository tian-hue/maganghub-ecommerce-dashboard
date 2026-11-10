# MagangHub E-Commerce Admin Dashboard

Admin dashboard modern untuk manajemen katalog produk, transaksi pesanan, analitik dashboard, dan pengelolaan pengguna berbasis peran (Role-Based Access Control). Dibangun dengan arsitektur full-stack menggunakan Nuxt 3, Vue 3, Tailwind CSS, Prisma ORM, dan PostgreSQL pada Neon Serverless Database.

---

## 🛠️ Teknologi yang Digunakan

- **Framework**: [Nuxt 3](https://nuxt.com/) (v3.17+) & [Vue 3](https://vuejs.org/) (v3.5+)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (v3.4+)
- **Database & ORM**: [PostgreSQL (Neon Serverless)](https://neon.tech/) & [Prisma ORM](https://www.prisma.io/) (v5.22+)
- **Security & Validation**: [bcryptjs](https://www.npmjs.com/package/bcryptjs) (password hashing) & [Zod](https://zod.dev/) (runtime schema validation)
- **Icons**: [Lucide Vue Next](https://lucide.dev/)
- **Runtime**: Node.js v22 (LTS compatible, engine tested on v22.23.4) & npm 10+

---

## 📋 Fitur Utama

1. **Authentication & Server-Side Session**
   - Autentikasi berbasis email dan password dengan hash bcrypt (salt round 10).
   - Pengelolaan sesi aman melalui database token hash dan HTTP-only session cookie (`mh_session`).
   - Proteksi route di sisi server (API middleware) dan klien (Nuxt navigation middleware).
2. **Dashboard Overview**
   - Total produk aktif.
   - Total keseluruhan pesanan.
   - Akumulasi total revenue pesanan dengan status `completed`.
   - Jumlah produk dengan stok menipis (stok < 5).
   - Daftar 5 pesanan terbaru lengkap dengan status dan total nilai transaksi.
   - Seluruh metrik diagregasi secara real-time langsung dari database.
3. **Product Management**
   - Katalog produk dengan paginasi, pencarian teks (case-insensitive), dan filter kategori.
   - Operasi CRUD (Create, Read, Update, Soft-Delete).
   - Validasi nama, kategori, harga positif, dan stok non-negatif via Zod schema.
   - Dialog konfirmasi sebelum penghapusan/penonaktifan produk.
4. **Order Management**
   - Daftar riwayat transaksi pesanan dengan filter status (`pending`, `processing`, `completed`, `cancelled`).
   - Tampilan detail transaksi (`/orders/:id`) mencakup informasi pelanggan, tanggal, status, snapshot produk, jumlah barang, harga satuan, dan total harga.
   - Pembaruan status pesanan real-time.

---

## 🔐 Penjelasan Role-Based Access Control (RBAC)

Aplikasi menerapkan RBAC ketat tidak hanya di layer antarmuka (UI conditional rendering), melainkan ditegakkan secara absolut pada endpoint server API (`server/utils/rbac.ts`):

| Fitur / Tindakan | Role ADMIN | Role STAFF | Penegakan Keamanan Server |
| :--- | :---: | :---: | :--- |
| **Login & Logout** | ✅ | ✅ | Server cookie session |
| **Akses Dashboard** | ✅ | ✅ | `requireAuth(event)` |
| **Lihat Daftar Produk** | ✅ | ✅ | `requireAuth(event)` |
| **Tambah Produk Baru** | ✅ | ❌ | `requireAdmin(event)` &rarr; HTTP 403 Forbidden |
| **Edit Produk** | ✅ | ❌ | `requireAdmin(event)` &rarr; HTTP 403 Forbidden |
| **Hapus Produk** | ✅ | ❌ | `requireAdmin(event)` &rarr; HTTP 403 Forbidden |
| **Lihat Daftar & Detail Pesanan** | ✅ | ✅ | `requireAuth(event)` |
| **Ubah Status Pesanan** | ✅ | ❌ | `requireAdmin(event)` &rarr; HTTP 403 Forbidden |

Tombol aksi manipulasi data disembunyikan secara visual dari user STAFF di antarmuka web, dan seluruh request manipulasi ilegal langsung ditolak oleh server dengan status **403 Forbidden**.

---

## 🔑 Demo Credentials

Aplikasi telah dilengkapi akun pengujian pada database:

| Role | Email | Password |
| :--- | :--- | :--- |
| **ADMIN** | `admin@example.com` | `AdminDemo123!` |
| **STAFF** | `staff@example.com` | `StaffDemo123!` |

---

## ⚙️ Environment Variables

Salin template file `.env.example` menjadi `.env`:

```sh
cp .env.example .env
```

Konfigurasi variabel berikut:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
SESSION_SECRET="replace-with-a-long-random-secret"
NODE_ENV="development"
```

> **PERINGATAN KEAMANAN**: Jangan pernah menambahkan file `.env` ke Git atau mengunggahnya ke repositori publik. File `.env` sudah terdaftar dalam `.gitignore`.

---

## 🚀 Panduan Instalasi & Menjalankan Lokal

### 1. Instalasi Dependensi
```sh
npm install
# atau
npm ci
```

### 2. Validasi & Migrasi Database
```sh
# Validasi dan sinkronisasi client Prisma
npx prisma validate
npx prisma generate

# Sinkronkan skema ke database PostgreSQL Neon
npm run db:push
```

### 3. Menjalankan Database Seeder
Jalankan seeder untuk mengisi data awal (10 produk, 3 kategori, 3 produk low stock, 8 pesanan beragam status, dan akun demo):
```sh
npm run db:seed
```
*Seeder bersifat idempotent (upsert) sehingga aman dijalankan berulang kali.*

### 4. Menjalankan Server Development
```sh
npm run dev
```
Akses aplikasi di browser pada: [http://localhost:3000](http://localhost:3000)

---

## 📦 Production Build & Preview

Untuk membangun dan memverifikasi aplikasi dalam mode produksi:

```sh
# Build produksi
npm run build

# Menjalankan preview server produksi
node .output/server/index.mjs
```

Aplikasi siap menerima koneksi pada port `3000`.

---

## 🌐 Panduan Deployment ke Vercel

1. Hubungkan repository GitHub ke project baru di dashboard [Vercel](https://vercel.com/).
2. Framework Preset akan otomatis terdeteksi sebagai **Nuxt.js**.
3. Pastikan Build Command adalah `npm run build` dan Output Directory adalah `.output`.
4. Tambahkan Environment Variables pada menu **Settings &rarr; Environment Variables** di Vercel:
   - `DATABASE_URL`: Connection string PostgreSQL Neon (dengan SSL enabled / pooled connection).
   - `SESSION_SECRET`: String acak aman untuk sesi.
   - `NODE_ENV`: `production`.
5. Jalankan deployment. Schema database dan data seed sudah disiapkan terlebih dahulu melalui koneksi database Neon.

---

## ⚠️ Known Issues & Solusi

1. **Free Tier Neon Auto-Suspend (Cold Starts)**:
   Database serverless Neon pada paket free tier akan masuk ke mode sleep jika tidak ada aktivitas selama periode tertentu. Query pertama saat server database bangun (waking up) mungkin membutuhkan waktu 1-2 detik lebih lama sebelum kembali ke latensi normal (<100ms).
2. **Local Standalone Production Preview**:
   Server standalone Nitro (`node .output/server/index.mjs`) secara native membaca environment variable sistem. Aplikasi telah dilengkapi fallback native Node `process.loadEnvFile()` pada initialization Prisma client agar dapat membaca file `.env` lokal secara otomatis saat dijalankan di lingkungan Node 20+.

---

## 🤖 AI Tools yang Digunakan

- **Antigravity AI Assistant** (Google DeepMind): Digunakan selama pengembangan untuk code review, verifikasi arsitektur keamanan, perancangan skema relasional, optimasi RBAC server-side, pemeliharaan dependensi, serta pengujian end-to-end otomatis.
