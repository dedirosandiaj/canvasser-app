# 📘 Dokumentasi Lengkap Aplikasi Canvasser

**Canvasser App** adalah solusi digital modern bagian dari ekosistem **Helpdesk Monitoring System**. Aplikasi ini dirancang khusus untuk memfasilitasi tim sales dan canvaser dalam melakukan pelaporan kunjungan lapangan secara *real-time*, akurat, dan terverifikasi.

---

## 🚀 Stack Teknologi

Aplikasi ini dibangun di atas pondasi teknologi web terkini untuk menjamin kecepatan, keamanan, dan kemudahan pengembangan:

| Komponen | Teknologi | Deskripsi |
| :--- | :--- | :--- |
| **Framework** | [SolidJS](https://www.solidjs.com/) | UI Library super cepat tanpa Virtual DOM. |
| **Meta-Framework** | [SolidStart](https://start.solidjs.com/) | Menangani SSR (Server-Side Rendering) dan Routing. |
| **Styling** | [TailwindCSS](https://tailwindcss.com/) | Framework CSS utility-first untuk desain responsif. |
| **Database** | Google Sheets | Database serverless yang mudah diakses oleh manajemen. |
| **File Storage** | Google Drive | Penyimpanan bukti foto kunjungan yang aman & terpusat. |
| **Maps API** | OpenStreetMap & BigDataCloud | Layanan geolokasi dan konversi koordinat ke alamat. |
| **UI Components** | SweetAlert2 | Notifikasi dan popup interaktif yang modern. |

---

## ✨ Fitur & Fungsionalitas Detail

### 🔐 1. Keamanan & Kode Akses
Untuk mencegah akses yang tidak sah, aplikasi dilindungi oleh sistem otentikasi sederhana namun efektif:
-   **Kode Akses**: Pengguna wajib memasukkan kode rahasia (`Nus4c1t4#`) saat pertama kali membuka aplikasi.
-   **Persistensi Sesi**: Status login disimpan di *Local Storage* browser, sehingga user tidak perlu memasukkan kode berulang kali selama cache tidak dibersihkan.
-   **Antarmuka Mobile-Friendly**: Popup login didesain responsif dengan tombol besar dan input yang mudah diakses di layar ponsel.

### 📍 2. Pelacakan Lokasi Real-time (Live GPS)
Aplikasi tidak hanya mengambil satu titik lokasi, melainkan memantau pergerakan user secara aktif:
-   **Live Tracking**: Menggunakan API `navigator.geolocation.watchPosition` untuk memantau perubahan koordinat (Latitude/Longitude) secara instan.
-   **Smart Throttling**: Untuk menghemat baterai dan kuota data, alamat lengkap (Jalan, Kecamatan, Kota) hanya akan diperbarui otomatis jika pengguna berpindah tempat lebih dari **30 meter**.
-   **Akurasi Tinggi**: Memprioritaskan sinyal GPS `High Accuracy`. Jika gagal, sistem akan otomatis beralih ke estimasi lokasi berbasis IP Address (BigDataCloud).

### 📸 3. Kamera Cerdas & Watermark Otomatis
Setiap bukti kunjungan diverifikasi melalui sistem *watermarking* digital yang diproses langsung di perangkat pengguna (*Client-side Processing*):

**Elemen Watermark:**
1.  **Logo Perusahaan**: Logo dipasang di pojok kanan bawah dengan opasitas 20% agar tidak menutupi objek foto.
2.  **Timestamp**: Tanggal dan Waktu pengambilan foto yang tidak bisa dimanipulasi (mengambil waktu server/perangkat saat itu).
3.  **Koordinat GPS**: Latitude dan Longitude tempat foto diambil.
4.  **Alamat Lengkap**: Kecamatan, Kota, dan Provinsi yang diambil dari data geolokasi.
5.  **Indikator Sumber Foto**:
    -   🟢 **Source: Kamera**: Jika foto baru diambil (deteksi berdasarkan waktu modifikasi file < 3 menit).
    -   🟡 **Source: Galeri**: Jika foto diambil dari penyimpanan lama.

### 📊 4. Integrasi Laporan Otomatis
Data yang dikirimkan oleh canvaser akan langsung masuk ke Google Sheets Pusat dengan format yang rapi:
-   **Waktu**: Timestamp server.
-   **Identitas**: Nama Sales, Nama Toko, Nama PIC, No. Telp.
-   **Lokasi**: Kecamatan, Kota, Provinsi.
-   **Status & Bukti**: Status Kunjungan, Link Foto (Google Drive), Link Google Maps.
-   **Catatan**: Keterangan tambahan dari sales.

---

## 📂 Struktur Direktori Proyek

Memahami struktur folder akan memudahkan proses *maintenance* dan pengembangan fitur baru:

```bash
/src
├── /components         # Komponen UI yang dapat digunakan kembali
│   └── /ui
│       ├── PhotoCapture.tsx    # 📸 Logika Kamera & Canvas Watermark
│       ├── TextField.tsx       # Inputan Text
│       ├── Select.tsx          # Dropdown Pilihan
│       └── ...
├── /lib               # Pustaka & Logika Bisnis
│   └── /server
│       ├── gdrive.ts           # ☁️ Upload file ke Google Drive
│       └── sheets.ts           # 📊 Read/Write ke Google Sheets
├── /routes             # Halaman Aplikasi (File-based Routing)
│   └── index.tsx               # 🏠 Halaman Utama (Form, GPS Logic, Auth)
├── app.tsx             # Entry point utama aplikasi
├── app.config.ts       # Konfigurasi Vite & PWA
└── ...
```

---

## 🛠️ Panduan Instalasi & Pengembangan

Ikuti langkah ini jika ingin menjalankan project di komputer lokal (Localhost):

1.  **Persiapan Lingkungan**
    Pastikan **Node.js** (versi 18+) sudah terinstall.

2.  **Install Dependencies**
    Download semua *library* yang dibutuhkan:
    ```bash
    npm install
    ```

3.  **Konfigurasi Environment (.env)**
    Buat file `.env` di root folder dan isi kredensial berikut:
    ```env
    GOOGLE_SERVICE_ACCOUNT_EMAIL="email-service-account@project.iam.gserviceaccount.com"
    GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
    GOOGLE_SHEET_ID="ID_SPREADSHEET_GOOGLE_SHEETS"
    GOOGLE_DRIVE_FOLDER_ID="ID_FOLDER_GOOGLE_DRIVE"
    ```

4.  **Menjalankan Server Dev**
    ```bash
    npm run dev
    ```
    Akses aplikasi di browser melalui: `http://localhost:3000`

---

## ⚠️ Troubleshooting Umum

-   **Lokasi tidak muncul / Gagal**:
    -   Pastikan GPS di HP aktif.
    -   Izinkan akses lokasi pada browser (Chrome/Safari).
    -   Coba refresh halaman. Jika GPS hardware bermasalah, aplikasi akan mencoba menggunakan lokasi IP (kurang akurat tapi cukup untuk estimasi kota).
    
-   **Foto Gagal Terupload**:
    -   Pastikan koneksi internet stabil.
    -   Cek kuota penyimpanan Google Drive pada akun Service Account.

-   **Kode Akses Lupa**:
    -   Kode default hardcoded: `Nus4c1t4#` (Case sensitive).
