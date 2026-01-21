# 📚 Panduan Belajar GerakKita

Panduan ini akan membantu Anda memahami aplikasi GerakKita dari dasar hingga mahir, bahkan jika ini adalah codebase yang dibuat orang lain.

## 🎯 Tujuan Pembelajaran

Setelah mengikuti panduan ini, Anda akan:
- ✅ Memahami struktur dan arsitektur aplikasi
- ✅ Mengerti alur kerja setiap fitur
- ✅ Bisa memodifikasi dan menambah fitur baru
- ✅ Memahami teknologi yang digunakan

---

## 📖 Fase 1: Memahami Dasar (Minggu 1-2)

### 1.1 Pahami Teknologi Dasar

**React Native Basics** (Jika belum paham)
- Tutorial: [React Native Tutorial for Beginners](https://reactnative.dev/docs/tutorial)
- Pelajari: Components, Props, State, Hooks (useState, useEffect)
- Praktek: Buat komponen sederhana (Button, Input, Card)

**Expo** 
- Dokumentasi: [Expo Documentation](https://docs.expo.dev/)
- Pelajari: Expo Router, File-based routing
- Praktek: Buat navigasi sederhana antara 2 screen

**TypeScript** (Opsional tapi disarankan)
- Tutorial: [TypeScript in 5 minutes](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)
- Pelajari: Types, Interfaces, Generic

### 1.2 Setup Environment

```bash
# Clone project (jika belum)
cd GerakKita

# Install dependencies
npm install

# Jalankan aplikasi
npx expo start
```

**Catatan:** Pastikan bisa menjalankan aplikasi di device/emulator sebelum lanjut!

---

## 🏗️ Fase 2: Memahami Struktur Aplikasi (Minggu 2-3)

### 2.1 Struktur Folder - Mulai dari Sini!

```
GerakKita/
├── app/              👈 MULAI DARI SINI - UI & Screens
├── components/       👈 Komponen reusable
├── lib/             👈 Logic & API calls
└── assets/          👈 Gambar & icon
```

### 2.2 Roadmap Pembelajaran - Urutan Membaca Kode

#### **Langkah 1: Pahami Constants & Types** (30 menit)
```
📁 lib/utils/constants.ts    - Warna, spacing, font size
📁 lib/types/index.ts        - Type definitions
```

**Tugas:**
- Baca file `lib/utils/constants.ts` 
- Lihat COLORS, SPACING, FONT_SIZE yang digunakan
- Coba ubah warna primary dan lihat perubahan di app

#### **Langkah 2: Pahami Komponen Dasar** (1-2 jam)
```
📁 components/common/Button.tsx    - Tombol reusable
📁 components/common/Input.tsx     - Input field
📁 components/common/Card.tsx      - Card component
```

**Tugas:**
- Baca kode Button, Input, Card
- Pahami props yang diterima
- Coba buat komponen baru: `Badge.tsx` (badge untuk status tiket)

#### **Langkah 3: Pahami Authentication** (2-3 jam)
```
📁 app/(auth)/login.tsx           - UI Login
📁 lib/api/auth.ts                - Logic login/register
📁 lib/hooks/useAuth.tsx          - Hook untuk cek status login
```

**Alur Pembelajaran:**
1. Buka `app/(auth)/login.tsx`
2. Lihat useState untuk email & password
3. Ikuti fungsi `handleLogin()` 
4. Masuk ke `lib/api/auth.ts` → fungsi `login()`
5. Pahami integrasi dengan Supabase

**Tugas Praktek:**
- Tambahkan validasi: password minimal 8 karakter
- Tambahkan loading indicator saat login
- Coba buat error handling yang lebih detail

#### **Langkah 4: Pahami Home Screen** (3-4 jam)
```
📁 app/(tabs)/index.tsx           - Home screen
📁 lib/api/routes.ts              - Get rute & halte
📁 lib/api/wallet.ts              - Get saldo wallet
```

**Alur Pembelajaran:**
1. Buka `app/(tabs)/index.tsx`
2. Lihat useEffect untuk fetch data
3. Pahami `findNearestStop()` - cara cari halte terdekat
4. Lihat penggunaan MapView dari React Native Maps

**Tugas Praktek:**
- Modifikasi quick actions: tambah action baru
- Ubah radius pencarian halte terdekat (dari 5km jadi 10km)
- Tambahkan filter rute berdasarkan nama

#### **Langkah 5: Pahami Booking & Payment** (4-6 jam)
```
📁 app/(tabs)/buy-ticket.tsx      - Pilih rute & halte
📁 app/booking/confirm.tsx        - Konfirmasi booking
📁 app/booking/payment.tsx        - Pilih metode bayar
📁 lib/api/bookings.ts            - Create booking
```

**Alur Pembelajaran:**
1. `buy-ticket.tsx` → pilih rute → pilih halte
2. `confirm.tsx` → validasi & hitung harga
3. `payment.tsx` → pilih Wallet atau Midtrans
4. Ikuti alur payment di flowchart (README.md)

**Tugas Praktek:**
- Tambahkan field "Catatan" di booking
- Buat validasi: tidak boleh pilih halte sama untuk asal & tujuan
- Tambahkan konfirmasi dialog sebelum bayar

#### **Langkah 6: Pahami Driver Mode** (3-4 jam)
```
📁 app/driver/dashboard.tsx       - Driver dashboard
📁 lib/api/tracking.ts            - GPS tracking functions
```

**Alur Pembelajaran:**
1. Lihat permission request untuk GPS
2. Pahami `handleStartTrip()` - assign driver ke bus
3. Lihat interval 10 detik untuk update lokasi
4. Pahami `handleStopTrip()` - clear data

**Tugas Praktek:**
- Ubah interval tracking dari 10s jadi 5s
- Tambahkan counter: berapa kali sudah kirim lokasi
- Tambahkan tombol untuk manual update lokasi

#### **Langkah 7: Pahami Wallet & PIN** (3-4 jam)
```
📁 app/wallet/topup.tsx           - Top-up saldo
📁 app/profile/edit-pin.tsx       - Set/change PIN
📁 lib/api/wallet.ts              - Wallet operations
📁 lib/api/security.ts            - PIN hashing & validation
```

**Alur Pembelajaran:**
1. Lihat cara input 6-digit PIN
2. Pahami hashing dengan Expo Crypto
3. Lihat validasi PIN sebelum payment
4. Pahami top-up flow dengan Midtrans

**Tugas Praktek:**
- Tambahkan "Forgot PIN" feature
- Buat limit gagal input PIN (max 3x)
- Tambahkan riwayat top-up

---

## 🔬 Fase 3: Deep Dive - Pahami Detail (Minggu 4-5)

### 3.1 State Management dengan Zustand

```typescript
📁 lib/store/auth.ts

// Contoh penggunaan Zustand
import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null })
}));
```

**Tugas:**
- Buat store baru untuk theme (dark/light mode)
- Implementasikan toggle theme di profile

### 3.2 Real-time dengan Supabase

```typescript
// Contoh real-time subscription
const subscription = supabase
  .channel('buses')
  .on('postgres_changes', 
    { event: 'UPDATE', schema: 'public', table: 'buses' },
    (payload) => {
      console.log('Bus updated:', payload);
    }
  )
  .subscribe();
```

**Tugas:**
- Lihat implementasi di `app/(tabs)/my-tickets.tsx`
- Tambahkan real-time notification untuk status tiket

### 3.3 Database Schema (Supabase)

**Tabel Penting:**
```
users          - Data user
routes         - Rute bus
bus_stops      - Halte
buses          - Bus yang beroperasi
bookings       - Booking/tiket
transactions   - Transaksi pembayaran
reviews        - Review & rating
```

**Tugas:**
- Login ke Supabase dashboard
- Lihat struktur tabel dan relasi
- Pahami Row Level Security (RLS) policies

---

## 🎨 Fase 4: Customization & Improvement (Minggu 6+)

### 4.1 Project Ideas - Praktek Mandiri

**Level Beginner:**
1. Ubah color scheme aplikasi
2. Tambah animasi pada button press
3. Buat komponen `EmptyState` untuk list kosong
4. Tambah icon baru di quick actions

**Level Intermediate:**
5. Buat fitur "Favorite Routes" 
6. Implementasi dark mode
7. Tambah notifikasi push
8. Buat halaman "About Us"

**Level Advanced:**
9. Implementasi offline mode dengan AsyncStorage
10. Buat admin panel untuk manage rute
11. Tambah analytics (Firebase Analytics)
12. Implementasi multi-language (i18n)

### 4.2 Best Practices

```typescript
// ❌ Bad Practice
const handleSubmit = () => {
  // Logic langsung di component
  fetch('https://api.example.com/data')
    .then(res => res.json())
    .then(data => setData(data));
}

// ✅ Good Practice
const handleSubmit = async () => {
  try {
    const data = await fetchData(); // Function dari lib/api
    setData(data);
  } catch (error) {
    showError(error.message);
  }
}
```

---

## 🛠️ Tools yang Membantu Belajar

### 1. **React DevTools**
```bash
npm install -g react-devtools
react-devtools
```
- Inspect component hierarchy
- Debug state & props

### 2. **Expo Go App**
- Install di phone untuk testing cepat
- Scan QR code dari `expo start`

### 3. **VS Code Extensions**
- ES7+ React/Redux/React-Native snippets
- React Native Tools
- TypeScript React code snippets

### 4. **Console Logging**
```typescript
// Debug dengan console.log
console.log('User data:', user);
console.log('Booking details:', JSON.stringify(booking, null, 2));
```

---

## 📝 Checklist Pembelajaran

### Week 1-2: Fundamentals
- [ ] Bisa jalankan aplikasi di device/emulator
- [ ] Paham struktur folder
- [ ] Baca semua constants & types
- [ ] Pahami komponen Button, Input, Card

### Week 3-4: Core Features
- [ ] Pahami authentication flow
- [ ] Pahami home screen & data fetching
- [ ] Pahami booking & payment flow
- [ ] Pahami driver mode
- [ ] Pahami wallet & PIN system

### Week 5-6: Advanced
- [ ] Pahami Zustand state management
- [ ] Pahami Supabase real-time
- [ ] Pahami database schema & RLS
- [ ] Bisa modifikasi fitur existing

### Week 7+: Mastery
- [ ] Buat 1 fitur baru dari scratch
- [ ] Bisa debug error sendiri
- [ ] Paham semua API endpoints
- [ ] Bisa explain ke orang lain

---

## 💡 Tips Belajar Efektif

### 1. **Learning by Doing**
Jangan hanya baca kode! Coba:
- Ubah sesuatu kecil → lihat hasilnya
- Break something → perbaiki lagi
- Tambah console.log dimana-mana untuk debug

### 2. **Buat Catatan**
```
Catatan Belajar:

Hari 1:
- Belajar struktur folder
- Pahami constants.ts
- Coba ubah warna primary

Hari 2:
- Belajar Button component
- Coba buat komponen Badge
- Issue: Badge tidak muncul → Fix: lupa import
```

### 3. **Bertanya ke AI/Community**
- Gunakan AI untuk explain code yang tidak paham
- Join group React Native Indonesia
- Stack Overflow untuk error messages

### 4. **Dokumentasikan**
Setiap kali paham sesuatu, tulis di dokumentasi:
```markdown
## Authentication Flow (yang saya pahami)

1. User input email & password
2. Validasi input (validateEmail, dll)
3. Call login() dari lib/api/auth.ts
4. Supabase auth.signInWithPassword()
5. Simpan session
6. Navigate ke home
```

---

## 🎓 Resources Tambahan

### Official Documentation
- [React Native](https://reactnative.dev/)
- [Expo](https://docs.expo.dev/)
- [Supabase](https://supabase.com/docs)
- [React Navigation](https://reactnavigation.org/)

### Video Tutorials
- YouTube: "Expo Router Tutorial"
- YouTube: "Supabase React Native Tutorial"
- YouTube: "React Native Maps Tutorial"

### Communities
- React Native Discord
- r/reactnative (Reddit)
- Stack Overflow
- Dev.to

---

## 🚀 Next Steps

1. **Mulai dari Fase 1** - Setup & dasar
2. **Ikuti urutan** - Jangan skip
3. **Praktek setiap hari** - 1-2 jam
4. **Catat progress** - Update checklist

**Ingat:** Tidak ada yang langsung mahir. Belajar coding butuh waktu dan praktek konsisten. 

**Happy Learning! 🎉**

---

## ❓ FAQ

**Q: Saya stuck di suatu bagian, gimana?**  
A: Normal! Coba: (1) Baca dokumentasi official, (2) Google error message, (3) Tanya AI, (4) Break problem jadi lebih kecil

**Q: Berapa lama sampai mahir?**  
A: Tergantung background. Jika sudah paham React: 2-4 minggu. Jika baru: 2-3 bulan praktek konsisten.

**Q: Harus paham TypeScript dulu?**  
A: Tidak wajib, tapi sangat membantu. Bisa belajar sambil jalan.

**Q: Bagaimana cara test fitur tanpa break production?**  
A: Buat git branch baru untuk experiment: `git checkout -b experiment/new-feature`
