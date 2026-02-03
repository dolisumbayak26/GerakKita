# Perbaikan Error Registrasi "Please Contact Support"

## 📋 Masalah
Ketika user mencoba mendaftar akun, muncul error: **"Please contact support"**

## 🔍 Penyebab
Error terjadi karena:
1. **RLS Policy Terlalu Ketat** - Policy untuk insert customer memerlukan `auth.uid() = id`, tetapi saat registrasi user belum terautentikasi
2. **Trigger Belum Ada** - Tidak ada database trigger untuk otomatis membuat profil customer saat user baru mendaftar
3. **Error Handling Kurang Jelas** - Pesan error tidak memberikan informasi yang cukup untuk debugging

## ✅ Solusi yang Diterapkan

### 1. Migration Database (`migration_007_fix_customer_registration.sql`)
- **Updated RLS Policy**: Policy baru mengizinkan insert dari user yang sedang membuat profil mereka sendiri atau dari service role
- **Database Trigger**: Trigger `on_auth_user_created_customer` otomatis membuat profil customer saat user baru signup
- **Function SECURITY DEFINER**: Function `handle_new_customer_signup()` berjalan dengan privilege penuh untuk memastikan insert berhasil

### 2. Improved Error Handling (`lib/api/auth.ts`)
- **Better Logging**: Menambahkan console.log untuk tracking proses registrasi
- **User-Friendly Messages**: Error messages yang lebih informatif dalam Bahasa Indonesia
- **Graceful Fallback**: Jika trigger belum berjalan, sistem tetap bisa mengembalikan data user

## 🧪 Testing
Untuk menguji perbaikan, coba:
1. Buka aplikasi
2. Klik "Daftar Sekarang"
3. Isi formulir registrasi dengan:
   - Nama Lengkap: Test User
   - Email: test@example.com
   - Password: minimal 8 karakter
4. Klik "Daftar"
5. Seharusnya redirect ke halaman verifikasi OTP

## 📊 Verifikasi Database
Trigger dan policy sudah aktif:
- ✅ Trigger `on_auth_user_created_customer` ada di `auth.users` table
- ✅ RLS Policy "Allow customer registration" mengizinkan insert customer baru
- ✅ Function `handle_new_customer_signup()` otomatis membuat customer profile

## 🔗 File yang Diubah
- [`lib/api/auth.ts`](file:///c:/Users/BRAM/GerakKita/lib/api/auth.ts) - Enhanced error handling
- [`supabase/migration_007_fix_customer_registration.sql`](file:///c:/Users/BRAM/GerakKita/supabase/migration_007_fix_customer_registration.sql) - Database migration

## 💡 Catatan Tambahan
- Trigger akan otomatis membuat profil customer dengan data dari `raw_user_meta_data`
- Jika email sudah terdaftar, akan muncul pesan "Email atau nomor telepon sudah terdaftar"
- Password minimal 8 karakter, sesuai policy Supabase default
