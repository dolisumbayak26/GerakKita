# Reset Password dengan OTP - Panduan dan Troubleshooting

## Perubahan yang Dilakukan

File `forgot-password.tsx` telah diubah untuk menggunakan **OTP token** instead of magic link. Flow barunya:

### Flow Baru (OTP-based)
1. User memasukkan email
2. Sistem mengirim kode OTP 6 digit ke email
3. User memasukkan kode OTP + password baru
4. Sistem memverifikasi OTP dan mengupdate password

### Fitur yang Ditambahkan
- ✅ Input OTP 6 digit (hanya angka)
- ✅ Validasi OTP expired atau invalid
- ✅ Tombol "Kirim Ulang" untuk resend OTP
- ✅ Error handling untuk rate limit
- ✅ Konfirmasi password baru
- ✅ UI dua langkah (email → OTP verification)

---

## Masalah Rate Limit

### Penyebab Error "Email Rate Limit Exceeded"

Supabase membatasi jumlah email yang bisa dikirim dalam periode waktu tertentu untuk mencegah spam:

**Free Tier / Development:**
- Maksimal **3-4 email per jam** per email address
- Maksimal **30 email per jam** total

**Paid Plan:**
- Lebih tinggi tapi tetap ada batas

### Solusi untuk Rate Limit

#### 1. Tunggu Beberapa Menit (Paling Mudah)
```
❌ Error muncul
⏰ Tunggu 15-20 menit
✅ Coba lagi
```

#### 2. Gunakan Email yang Berbeda untuk Testing
```typescript
// Test dengan email berbeda-beda:
test1@example.com
test2@example.com
test3@example.com
```

#### 3. Setup Custom SMTP (Recommended untuk Production)

Supabase membolehkan Anda menggunakan SMTP provider sendiri (Gmail, SendGrid, AWS SES, dll).

**Cara setup di Supabase Dashboard:**

1. Buka Supabase Dashboard → Project Settings
2. Pilih **Authentication** → **Email Templates**
3. Scroll ke **SMTP Settings**
4. Isi konfigurasi SMTP Anda:

```
SMTP Host: smtp.gmail.com (contoh untuk Gmail)
SMTP Port: 587
SMTP User: your-email@gmail.com
SMTP Password: your-app-password
Sender Email: your-email@gmail.com
Sender Name: GerakKita
```

**Keuntungan Custom SMTP:**
- ❌ Tidak ada rate limit dari Supabase
- ✅ Rate limit tergantung provider SMTP Anda
- ✅ Email lebih reliable
- ✅ Bisa custom email template
- ✅ Tracking email delivery

**Provider SMTP Gratis:**
- **Gmail**: 500 email/hari (gratis)
- **SendGrid**: 100 email/hari (gratis)
- **Mailgun**: 5000 email/bulan (gratis trial)
- **AWS SES**: 62,000 email/bulan (gratis tier)

#### 4. Increase Wait Time untuk Resend OTP

Tambahkan cooldown timer sebelum user bisa resend:

```typescript
// Di forgot-password.tsx, tambahkan timer
const [cooldown, setCooldown] = useState(0);

// Saat kirim OTP, set cooldown 60 detik
setCooldown(60);
const interval = setInterval(() => {
  setCooldown(prev => prev > 0 ? prev - 1 : 0);
}, 1000);

// Disable tombol resend saat cooldown > 0
<Button disabled={cooldown > 0}>
  {cooldown > 0 ? `Tunggu ${cooldown}s` : 'Kirim Ulang'}
</Button>
```

---

## Testing Flow Reset Password

### Step 1: Kirim Kode OTP

1. Buka app dan klik "Lupa Password?" di login screen
2. Masukkan email terdaftar
3. Klik "Kirim Kode OTP"
4. **Jika error "rate limit"**: Tunggu 15-20 menit atau gunakan email lain

### Step 2: Cek Email

Email akan terlihat seperti ini:
```
Subject: Reset Password Request
Body: 
Your reset password code is: 123456

This code will expire in 1 hour.
```

### Step 3: Input OTP dan Password Baru

1. Masukkan 6 digit kode OTP dari email
2. Masukkan password baru (minimal 6 karakter)
3. Konfirmasi password baru
4. Klik "Reset Password"

### Step 4: Login dengan Password Baru

1. Kembali ke login screen
2. Login dengan email dan password baru
3. ✅ Berhasil!

---

## Error Messages dan Solusinya

| Error Message | Penyebab | Solusi |
|--------------|----------|---------|
| "Email rate limit exceeded" | Terlalu banyak email dikirim | Tunggu 15-20 menit atau gunakan email lain |
| "Kode OTP tidak valid atau sudah kedaluwarsa" | OTP salah atau expired (>1 jam) | Kirim ulang OTP baru |
| "Password minimal 6 karakter" | Password terlalu pendek | Gunakan password minimal 6 karakter |
| "Password tidak sama" | Konfirmasi tidak match | Pastikan kedua password sama |
| "Email harus diisi" | Email kosong | Masukkan email |
| "Format email tidak valid" | Email format salah | Gunakan format: name@domain.com |

---

## Code Changes Summary

### File: `app/(auth)/forgot-password.tsx`

**Changes:**
1. ✅ Added OTP verification step
2. ✅ Added OTP input field (6 digits, numeric only)
3. ✅ Added new password + confirm password fields
4. ✅ Added resend OTP functionality
5. ✅ Added rate limit error handling
6. ✅ Using `verifyOtp()` with type 'recovery'
7. ✅ Two-step UI: email → OTP verification

**API Calls:**
- `supabase.auth.resetPasswordForEmail()` - Send OTP
- `supabase.auth.verifyOtp()` - Verify OTP
- `supabase.auth.updateUser()` - Update password after verification

---

## Konfigurasi Supabase

Pastikan di Supabase Dashboard, setting berikut sudah benar:

**Authentication → Email Templates → Reset Password:**
- ✅ Enable "Enable email confirmations"
- ✅ Template menggunakan `{{ .Token }}` untuk OTP
- ✅ Token expiry: 3600 seconds (1 hour)

**Example Reset Password Email Template:**
```html
<h2>Reset Password</h2>
<p>Your reset password code is:</p>
<h1>{{ .Token }}</h1>
<p>This code will expire in 1 hour.</p>
<p>If you didn't request this, ignore this email.</p>
```

---

## Tips untuk Development

1. **Gunakan email testing service** seperti [Mailtrap](https://mailtrap.io/) untuk development
2. **Setup custom SMTP** untuk production
3. **Add cooldown timer** untuk resend OTP (min 60 detik)
4. **Log errors** untuk debug: `console.log(error)`
5. **Test dengan multiple email addresses** untuk avoid rate limit

---

## Next Steps (Optional)

- [ ] Add countdown timer untuk resend OTP
- [ ] Add rate limit counter di UI
- [ ] Setup custom SMTP untuk production
- [ ] Add email verification untuk new users
- [ ] Add biometric auth (fingerprint/face ID)
