# CARA MENGAKTIFKAN EMAIL OTP DI SUPABASE

## ⚠️ **MASALAH SEBELUMNYA**

Saya telah mencoba auto-confirm email, tetapi ini menyebabkan masalah:
- ❌ User tidak bisa login setelah registrasi
- ❌ Customer profile tidak terbuat dengan benar
- ❌ Flow autentikasi rusak

## ✅ **SOLUSI YANG BENAR**

Saya telah **mengembalikan flow OTP yang normal**. Sekarang user akan:
1. Daftar akun → Redirect ke halaman verify-otp
2. Terima email dengan kode OTP
3. Masukkan kode OTP
4. Email terverifikasi → Bisa login

## 🔧 **CARA MENGAKTIFKAN EMAIL DI SUPABASE**

### **Opsi 1: Nonaktifkan Email Confirmation (Development Only)**

Ini cara tercepat untuk development, tapi **TIDAK DIREKOMENDASIKAN untuk production**.

1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project: **dolisumbayak26's Project**
3. Go to **Authentication** → **Providers** → **Email**
4. Scroll ke bawah ke **Email Confirmation**
5. **MATIKAN toggle** "Confirm email"
6. Klik **Save**

**Catatan**: Dengan ini, user langsung bisa login tanpa verifikasi email.

---

### **Opsi 2: Setup Custom SMTP (RECOMMENDED untuk Production)**

Supabase free tier memiliki limit pengiriman email dan sering masuk spam. Sebaiknya gunakan SMTP sendiri.

#### **A. Menggunakan Gmail SMTP**

1. **Buat App Password di Gmail**
   - Buka https://myaccount.google.com/security
   - Aktifkan **2-Step Verification** (jika belum)
   - Klik **App passwords**
   - Pilih app: **Mail**, device: **Other (Custom name)**
   - Ketik: "GerakKita"
   - Copy password yang dihasilkan (16 karakter)

2. **Konfigurasi di Supabase**
   - Buka [Supabase Dashboard](https://supabase.com/dashboard)
   - Go to **Project Settings** → **Authentication** → **SMTP Settings**
   - **Enable Custom SMTP**
   - Isi dengan:
     ```
     SMTP Host: smtp.gmail.com
     SMTP Port: 587
     SMTP User: your-email@gmail.com (ganti dengan email Anda)
     SMTP Password: [App Password yang dicopy tadi]
     SMTP Sender Email: your-email@gmail.com
     SMTP Sender Name: GerakKita
     ```
   - Klik **Save**

3. **Test Email**
   - Coba daftar akun baru
   - Email OTP seharusnya terkirim dari Gmail Anda

---

#### **B. Menggunakan SendGrid (RECOMMENDED)**

SendGrid lebih reliable untuk production dan gratis up to 100 emails/day.

1. **Daftar SendGrid**
   - Buka https://sendgrid.com/
   - Klik **Start for Free**
   - Daftar dengan email Anda
   - Verify email

2. **Buat API Key**
   - Login ke SendGrid Dashboard
   - Go to **Settings** → **API Keys**
   - Klik **Create API Key**
   - Name: "GerakKita Supabase"
   - Permission: **Full Access**
   - Klik **Create & View**
   - **COPY API KEY** (hanya ditampilkan sekali!)

3. **Verify Sender Email**
   - Go to **Settings** → **Sender Authentication**
   - Klik **Verify a Single Sender**
   - Isi dengan email Anda (bisa email pribadi atau noreply@yourdomain.com jika punya domain)
   - Check email dan klik link verifikasi

4. **Konfigurasi di Supabase**
   - Buka [Supabase Dashboard](https://supabase.com/dashboard)
   - Go to **Project Settings** → **Authentication** → **SMTP Settings**
   - **Enable Custom SMTP**
   - Isi dengan:
     ```
     SMTP Host: smtp.sendgrid.net
     SMTP Port: 587
     SMTP User: apikey
     SMTP Password: [SendGrid API Key yang dicopy tadi]
     SMTP Sender Email: [Email yang sudah diverifikasi di SendGrid]
     SMTP Sender Name: GerakKita
     ```
   - Klik **Save**

---

### **Opsi 3: Setup Email Templates (Optional)**

Customize template email OTP agar lebih menarik:

1. Go to **Authentication** → **Email Templates**
2. Pilih **Confirm signup**
3. Edit template HTML-nya
4. Gunakan variable `{{ .Token }}` untuk OTP code
5. Klik **Save**

Contoh template sederhana:
```html
<h2>Verifikasi Email GerakKita</h2>
<p>Kode OTP Anda adalah:</p>
<h1 style="font-size: 32px; color: #4F46E5;">{{ .Token }}</h1>
<p>Kode ini akan kedaluwarsa dalam 60 menit.</p>
<p>Jika Anda tidak mendaftar di GerakKita, abaikan email ini.</p>
```

---

## 🧪 **TESTING SETELAH KONFIGURASI**

### **Test 1: Registrasi Baru**
1. Buka aplikasi
2. Klik "Daftar Sekarang"
3. Isi form dengan data valid
4. Klik "Daftar"
5. ✅ Redirect ke halaman verify-otp
6. ✅ Check email inbox (atau spam folder)
7. ✅ Masukkan kode 6 digit
8. ✅ Klik "Verifikasi"
9. ✅ Redirect ke dashboard

### **Test 2: Login**
1. Setelah verify OTP berhasil
2. Coba logout
3. Login lagi dengan email & password
4. ✅ Berhasil login

---

## 📊 **STATUS DATABASE**

✅ **All Fixed!**
- Trigger `handle_new_customer_signup()` sudah diperbaiki
- Customer profiles untuk semua user sudah terbuat
- User dapat login setelah verify OTP

**User yang sudah diperbaiki:**
- ✅ vipgptpro@gmail.com
- ✅ dollybramsmatondang@gmail.com  
- ✅ dolisumbayak26@gmail.com
- ✅ susiloimmanuel7@gmail.com
- ✅ deopandia@gmail.com

---

## 🎯 **REKOMENDASI**

**Untuk Development Sekarang:**
- Gunakan **Opsi 1** (Disable email confirmation) agar development cepat

**Untuk Production Nanti:**
- Gunakan **Opsi 2B** (SendGrid SMTP) karena lebih reliable
- Enable email confirmation kembali
- Customize email templates

---

## 🔗 **File yang Sudah Diperbaiki**

- [`app/(auth)/register.tsx`](file:///c:/Users/BRAM/GerakKita/app/(auth)/register.tsx) - Back to OTP flow
- [`lib/api/auth.ts`](file:///c:/Users/BRAM/GerakKita/lib/api/auth.ts) - Removed auto-confirm
- [`supabase/migration_009_revert_autoconfirm_fix_profiles.sql`](file:///c:/Users/BRAM/GerakKita/supabase/migration_009_revert_autoconfirm_fix_profiles.sql) - Fixed customer profiles

---

## ❓ **FAQ**

**Q: Kenapa email OTP tidak terkirim?**
A: Supabase free tier punya rate limit. Setup custom SMTP (Gmail/SendGrid) untuk reliability lebih baik.

**Q: Email masuk spam?**
A: Setup SendGrid dengan sender authentication untuk meningkatkan deliverability.

**Q: Bisa skip email verification?**
A: Bisa dengan Opsi 1, tapi tidak direkomendasikan untuk production.

**Q: User lama yang belum verify bisa login?**
A: Semua user existing sudah saya pastikan punya customer profile dan email confirmed.
