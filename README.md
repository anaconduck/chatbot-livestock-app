# TanyaTernak — Platform Riset & Asisten Cerdas Peternakan Unggas

TanyaTernak adalah platform digital dan repositori riset terintegrasi untuk peternakan unggas (layer & broiler), didukung asisten cerdas berbasis Retrieval-Augmented Generation (RAG). Platform ini dikembangkan dalam kerangka Program HIBAH Fakultas Peternakan Universitas Brawijaya (FAPET UB) untuk mendukung hilirisasi riset ilmiah dan peningkatan produktivitas agribisnis peternakan nasional.

---

## Fitur Utama

1. **Beranda & Edukasi Peternakan (`/`)**
   - Eksplorasi pilar riset: formulasi nutrisi, biosekuriti 3 zona, manajemen mikroklimat kandang *closed-house*, dan alur kerja terpadu.

2. **Pusat Riset & Perpustakaan Ilmiah (`/riset`)**
   - Filter pencarian berbasis domain peternakan (Nutrisi, Penyakit, Manajemen Kandang, IoT).
   - Wawasan biologis & fisiologi komparatif ayam petelur.
   - Pustaka dokumen ilmiah (*Research Library*) dengan akses unduh PDF peer-reviewed.

3. **Tentang Kami (`/about`)**
   - Visi & misi hilirisasi teknologi peternakan.
   - Dewan pakar & tim peneliti Fakultas Peternakan Universitas Brawijaya.

4. **Sistem Autentikasi Pengguna & Pengelola**
   - **Login & Registrasi Pengguna (`/login`, `/register`)**: Akses khusus peternak dan praktisi lapangan.
   - **Portal Pengelola / Administrator (`/admin/login`)**: Verifikasi peran berbasis server untuk keamanan akses manajemen data.

5. **Dashboard Peternak (`/dashboard`)**
   - Navigasi cepat topik populer peternakan (Nutrisi, Penyakit, Biosekuriti, Broiler, Layer, Produksi Telur, Kandang, Kesehatan).
   - Riwayat konsultasi dan akses langsung ke asisten riset.

6. **Asisten Cerdas Interaktif ChickAI (`/chat`)**
   - Tanya jawab berbasis literatur dan rujukan ilmiah peternakan.
   - Menampilkan referensi dokumen terkait (*citations*) pada setiap jawaban.

7. **Floating Assistant Mascot**
   - Widget obrolan cepat (*quick-drawer*) di seluruh halaman untuk kemudahan konsultasi kapan saja.

8. **Panel Pengelola / Admin (`/admin`)**
   - Metrik analitik platform dan rekap tren kunjungan vs unduhan.
   - Modul unggah dan manajemen dokumen PDF riset (*drag & drop*).
   - Manajemen aktivasi pengguna dan pemantauan sistem.

---

## Tech Stack

- **Framework**: Next.js (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Iconography**: Lucide React
- **Database & Auth**: Supabase (PostgreSQL, Row-Level Security, Auth)
- **AI / RAG Integration**: Dify Cloud API / RAG Services dengan fallback mode lokal
- **Validasi Data**: Zod

---

## Panduan Menjalankan Aplikasi

### 1. Instal Dependensi
```bash
npm install
```

### 2. Konfigurasi Lingkungan (`.env.local`)
Salin file `.env.example` ke `.env.local`:
```bash
cp .env.example .env.local
```

Pengaturan lingkungan dasar:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="TanyaTernak"
NEXT_PUBLIC_DEMO_MODE=true

# Supabase (Kredensial database & autentikasi)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Integrasi Dify RAG
DIFY_BASE_URL=https://api.dify.ai/v1
DIFY_CHAT_API_KEY=your-dify-chat-key
DIFY_KNOWLEDGE_API_KEY=your-dify-knowledge-key
DIFY_DATASET_ID=your-dataset-id
DIFY_MOCK_MODE=true
```

### 3. Menjalankan Server Pengembangan
```bash
npm run dev
```
Buka peramban di [http://localhost:3000](http://localhost:3000).

### 4. Validasi Lint & Build
```bash
npm run lint
npm run build
```

---

## Akun Demo Pengujian

Saat mode demo aktif (`NEXT_PUBLIC_DEMO_MODE=true`), akun berikut dapat digunakan untuk pengujian:

| Peran | Email | Kata Sandi | Tujuan Halaman |
|---|---|---|---|
| **Peternak (User)** | `user@demo.local` | `demo1234` | `/login` → `/dashboard` |
| **Administrator** | `admin@demo.local` | `admin1234` | `/admin/login` → `/admin` |

*Tersedia tombol pengisian otomatis pada formulir login untuk mempermudah demonstrasi.*

---

---

## Lisensi & Penghargaan

Aplikasi ini dikembangkan di bawah naungan Program HIBAH Fakultas Peternakan Universitas Brawijaya (FAPET UB) untuk kemajuan teknologi dan agribisnis peternakan nasional.
