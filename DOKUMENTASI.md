# Dokumentasi Aplikasi Canvasser

**Canvasser App** adalah bagian dari **Helpdesk Monitoring System**, sebuah aplikasi web modern yang dibangun untuk memudahkan tim sales/canvaser dalam mencatat aktivitas kunjungan mereka secara real-time dan akurat.

## 🚀 Teknologi yang Digunakan

Aplikasi ini dibangun menggunakan teknologi web modern untuk performa tinggi dan pengalaman pengguna yang responsif:

-   **Frontend Framework**: [SolidJS](https://www.solidjs.com/) dengan [SolidStart](https://start.solidjs.com/) (SSR/Client-side).
-   **Styling**: [TailwindCSS](https://tailwindcss.com/) untuk desain antarmuka yang cepat dan konsisten.
-   **Database/Storage**: Google Sheets (sebagai backend sederhana) & Google Drive (untuk penyimpanan foto).
-   **Maps & Location**: OpenStreetMap (Nominatim) & BigDataCloud untuk reverse geocoding (konversi koordinat ke alamat).
-   **Build Tool**: Vite.

---

## ✨ Fitur Utama

### 1. Pencatatan Kunjungan (Visit Tracking)
Formulir input data yang intuitif untuk mencatat detail kunjungan:
-   Nama Sales
-   Informasi Toko (Nama, PIC, No. Telp)
-   Status Kunjungan (Sewa, Trial, Beli, dll)
-   Keterangan Tambahan

### 2. Geolokasi Cerdas & Alamat Otomatis
-   **Deteksi Otomatis**: Aplikasi secara otomatis mengambil koordinat GPS (Latitude & Longitude) pengguna saat formulir dibuka.
-   **Reverse Geocoding**: Koordinat tersebut otomatis dikonversi menjadi alamat lengkap yang meliputi **Kecamatan**, **Kota**, dan **Provinsi**.
-   **Fallback System**: Jika GPS gagal, sistem memiliki mekanisme cadangan (fallback) untuk tetap mendapatkan perkiraan lokasi.

### 3. Foto Bukti Kunjungan dengan Watermark
Fitur kamera terintegrasi yang canggih:
-   **Watermark Otomatis**: Setiap foto yang diambil atau diunggah akan otomatis ditempelkan informasi penting:
    -   **Logo Perusahaan** (Nusacita).
    -   **Timestamp**: Tanggal dan jam pengambilan foto.
    -   **Koordinat**: Latitude & Longitude.
    -   **Alamat**: Kecamatan, Kota, Provinsi.
    -   **Sumber Foto**: Indikator apakah foto diambil langsung dari **Kamera** (hijau) atau dari **Galeri** (kuning).
-   **Optimasi Gambar**: Kompresi otomatis di sisi klien (browser) sebelum diunggah untuk menghemat kuota dan mempercepat proses.

### 4. Integrasi Google Sheets
Data yang dikirimkan langsung tersimpan rapi di Google Sheets, memudahkan tim admin untuk melakukan rekapitulasi dan analisis data tanpa perlu dashboard backend yang rumit. Kolom data mencakup:
-   Timestamp, Sales, Toko, PIC, Telp.
-   Kec, Kota, Provinsi.
-   Status, Link Foto (Google Drive), Link Maps, Keterangan.

---

## 📂 Struktur Proyek

Berikut adalah struktur folder dan file penting dalam aplikasi `apps/canvasser-app`:

```
/src
├── /components
│   └── /ui
│       └── PhotoCapture.tsx    # Komponen kamera & logika watermark canvas
├── /lib
│   └── /server
│       ├── gdrive.ts           # Logika upload ke Google Drive
│       └── sheets.ts           # Logika koneksi ke Google Sheets
├── /routes
│   └── index.tsx               # Halaman utama formulir & logika geolokasi
├── app.tsx                     # Entry point aplikasi
└── entry-server.tsx            # Konfigurasi server-side rendering
```

---

## 🛠️ Cara Menjalankan (Development)

Pastikan sudah menginstall [Node.js](https://nodejs.org/).

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Konfigurasi Environment (.env)**
    Pastikan file `.env` memiliki kredensial yang dibutuhkan:
    ```env
    GOOGLE_SERVICE_ACCOUNT_EMAIL=...
    GOOGLE_PRIVATE_KEY=...
    GOOGLE_SHEET_ID=...
    GOOGLE_DRIVE_FOLDER_ID=...
    ```

3.  **Jalankan Server Development**
    ```bash
    npm run dev
    ```
    Aplikasi akan berjalan di `http://localhost:3000`.

---

## 📝 Catatan Penting

-   **Izin Lokasi**: Pastikan browser mengizinkan akses lokasi untuk fitur geolokasi yang akurat.
-   **Kamera**: Pada perangkat mobile, tombol "Ambil Foto" akan memprioritaskan kamera belakang.
-   **Watermark**: Proses watermark dilakukan di browser pengguna (Client-side), sehingga tidak membebani server.
