# Spesifikasi Teknis Aplikasi GerakKita

Dokumen ini berisi detail teknis mengenai pengembangan aplikasi **GerakKita**, mencakup bahasa pemrograman, database, arsitektur sistem, dan fitur utama. Dokumentasi ini dapat digunakan sebagai bahan referensi untuk laporan tugas akhir, skripsi, atau dokumentasi pengembang.

---

## BAB I: Gambaran Umum

**GerakKita** adalah aplikasi pelacakan bus (Bus Tracking System) yang dirancang untuk memudahkan pengguna dalam memantau posisi bus secara real-time, melihat rute, dan melakukan pembayaran tiket secara digital. Aplikasi ini menghubungkan penumpang (Customer) dan pengemudi (Driver) dalam satu ekosistem yang terintegrasi.

## BAB II: Teknologi yang Digunakan (Tech Stack)

Berikut adalah rincian teknologi yang digunakan dalam pengembangan aplikasi:

### 1. Frontend (Mobile App)
*   **Bahasa Pemrograman**: TypeScript (dikembangkan dari JavaScript)
*   **Framework**: React Native
*   **Platform Pengembang**: Expo (SDK 54)
*   **Routing & Navigasi**: Expo Router & React Navigation
*   **Peta Digital**: `react-native-maps` (Google Maps API)
*   **Manajemen State**: Zustand
*   **Styling**: React Native StyleSheet (CSS-in-JS)
*   **Komponen UI**: Custom components, `@react-native-picker/picker`, `react-native-screens`
*   **Autentikasi**: Expo Auth Session
*   **Penyimpanan Lokal**: `@react-native-async-storage/async-storage`

### 2. Backend & Database
*   **Platform BaaS (Backend as a Service)**: Supabase
*   **Database**: PostgreSQL
*   **Autentikasi**: Supabase Auth (Email & Password, OTP)
*   **Keamanan Database**: Row Level Security (RLS) Policies
*   **Real-time**: Supabase Realtime (untuk update lokasi bus)

### 3. Integrasi Pihak Ketiga (Third-Party APIs)
*   **Google Maps API**: Untuk menampilkan peta, rute, dan marker lokasi.
*   **Midtrans** (Rencana Integrasi): Untuk gateway pembayaran digital (QRIS, E-Wallet).

### 4. Tools Pengembangan
*   **Code Editor**: Visual Studio Code (VS Code)
*   **Version Control**: Git
*   **Package Manager**: npm (Node Package Manager)
*   **Testing**: Jest (Unit Testing)

---

## BAB III: Struktur Database

Database dirancang menggunakan PostgreSQL di platform Supabase. Berikut adalah skema tabel utama:

### 1. Tabel `users` (Auth Schema)
Tabel bawaan Supabase untuk manajemen autentikasi dasar.

### 2. Tabel `customers`
Menyimpan data profil pengguna tipe penumpang.
*   `id` (UUID, Primary Key): Referensi ke `auth.users`
*   `email` (Text): Email pengguna
*   `full_name` (Text): Nama lengkap
*   `phone_number` (Text): Nomor telepon
*   `profile_image_url` (Text): URL foto profil
*   `encrypted_pin` (Text): PIN keamanan untuk transaksi wallet
*   `created_at`: Waktu pembuatan akun

### 3. Tabel `drivers`
Menyimpan data profil pengemudi.
*   `id` (UUID, Primary Key): Referensi ke `auth.users`
*   `email` (Text): Email pengemudi
*   `full_name` (Text): Nama lengkap
*   `bus_id` (UUID, Unique): ID Bus yang sedang dikendarai (Relasi ke tabel `buses`)
*   `created_at`: Waktu pembuatan akun

### 4. Tabel `buses`
Menyimpan informasi armada bus.
*   `id` (UUID, Primary Key)
*   `plate_number` (Text): Plat nomor bus
*   `route_id` (UUID): Referensi ke rute trayek
*   `current_location` (Geography/Point): Koordinat lokasi bus saat ini (Update real-time)
*   `status` (Text): Status operasional (Active, Inactive, Maintenance)

### 5. Tabel `routes` (Trayek)
Menyimpan data rute perjalanan.
*   `id` (UUID, Primary Key)
*   `name` (Text): Nama rute (Contoh: "Koridor 1")
*   `origin` (Text): Titik awal
*   `destination` (Text): Titik akhir
*   `stops` (JSONB): Daftar halte/pemberhentian dalam rute

### 6. Tabel Pendukung Lainnya (Rencana/Implementasi Lanjutan)
*   `transactions`: Riwayat pembayaran tiket/top-up.
*   `wallets`: Saldo pengguna.
*   `reviews`: Ulasan layanan dari penumpang.

---

## BAB IV: Fitur Utama Aplikasi

### 1. Modul Penumpang (Customer)
*   **Registrasi & Login**: Mendaftar akun baru dan masuk menggunakan email/password.
*   **Pelacakan Bus Real-time**: Melihat posisi bus bergerak di peta secara langsung.
*   **Informasi Rute & Halte**: Melihat daftar rute tersedia dan lokasi halte terdekat.
*   **Estimasi Kedatangan**: Melihat perkiraan waktu kedatangan bus.
*   **E-Wallet & Pembayaran**: Top-up saldo dan membayar tiket secara digital (QR Code/Langsung).

### 2. Modul Pengemudi (Driver)
*   **Login Pengemudi**: Akses khusus untuk akun pengemudi.
*   **Manajemen Perjalanan**: Memulai dan mengakhiri perjalanan (Trip).
*   **Broadcast Lokasi**: Aplikasi mengirimkan lokasi GPS pengemudi ke server secara terus-menerus saat perjalanan aktif.
*   **Status Bus**: Mengupdate status ketersediaan bus.

### 3. Modul Admin (Web Dashboard)
*   **Manajemen User**: Mengelola data penumpang dan pengemudi.
*   **Manajemen Armada**: Menambah atau mengedit data bus dan rute.
*   **Laporan Transaksi**: Melihat rekapitulasi pembayaran dan pendapatan.

---

## BAB V: Alur Kerja Sistem (System Workflow)

1.  **Driver** login dan menekan tombol "Mulai Perjalanan".
2.  Aplikasi Driver mengirimkan koordinat GPS ke tabel `buses` di Supabase setiap beberapa detik.
3.  **Customer** membuka aplikasi dan melihat peta.
4.  Aplikasi Customer berlangganan (subscribe) ke perubahan data di tabel `buses` via Supabase Realtime.
5.  Saat data lokasi di database berubah, ikon bus di peta Customer bergerak secara otomatis tanpa perlu refresh halaman.
