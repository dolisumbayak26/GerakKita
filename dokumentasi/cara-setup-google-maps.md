# Cara Mengaktifkan Google Maps di GerakKita

## 🔍 **Masalah**
Saat membuka fitur "Halte Terdekat", maps tidak muncul dan hanya menampilkan halaman kosong.

## ⚠️ **Penyebab**
Google Maps API Key di file `.env` masih menggunakan placeholder `xxxxx`:
```
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=xxxxx
```

Tanpa API key yang valid, Google Maps tidak dapat ditampilkan.

## ✅ **Solusi: Setup Google Maps API Key**

### **Langkah 1: Buat Project di Google Cloud Platform**

1. **Buka Google Cloud Console**
   - Go to: https://console.cloud.google.com/
   - Login dengan akun Google Anda

2. **Buat Project Baru** (jika belum ada)
   - Klik dropdown project di bagian atas
   - Klik **"New Project"**
   - Name: `GerakKita`
   - Location: Leave default atau pilih organization
   - Klik **"Create"**

3. **Enable Billing** (Required)
   - Go to: **Billing** → **Link a Billing Account**
   - Jika belum punya, buat billing account baru
   - ⚠️ **Note**: Google Maps API gratis untuk penggunaan kecil ($200 free credit per bulan)
   - Anda tidak akan dikenakan biaya selama di bawah limit

---

### **Langkah 2: Enable Google Maps APIs**

1. **Go to APIs & Services**
   - Di sidebar, klik **"APIs & Services"** → **"Library"**

2. **Enable Required APIs**
   Enable 3 API berikut:

   **A. Maps SDK for Android**
   - Search: "Maps SDK for Android"
   - Klik pada hasil pencarian
   - Klik **"Enable"**

   **B. Maps SDK for iOS** (jika akan deploy ke iOS)
   - Search: "Maps SDK for iOS"
   - Klik **"Enable"**

   **C. Maps JavaScript API** (opsional, untuk web)
   - Search: "Maps JavaScript API"
   - Klik **"Enable"**

---

### **Langkah 3: Buat API Key**

1. **Go to Credentials**
   - Sidebar: **APIs & Services** → **Credentials**
   - Klik **"+ CREATE CREDENTIALS"**
   - Pilih **"API Key"**

2. **Copy API Key**
   - API Key akan muncul dalam popup
   - **COPY** API key tersebut
   - Tutup popup

3. **Restrict API Key (RECOMMENDED untuk Security)**
   - Klik **icon pensil** (Edit) di sebelah API key yang baru dibuat
   - Di halaman edit:

   **Application restrictions:**
   - Pilih **"Android apps"** (untuk mobile)
   - Klik **"+ Add an item"**
   - **Package name**: `host.exp.exponent` (untuk Expo Go)
   - **SHA-1 certificate fingerprint**: (bisa dikosongkan untuk development)
   
   **API restrictions:**
   - Pilih **"Restrict key"**
   - Check **"Maps SDK for Android"**
   - Check **"Maps SDK for iOS"** (jika ada)
   
   - Klik **"Save"**

---

### **Langkah 4: Update File `.env`**

1. **Buka file `.env`**
   ```bash
   # File: c:\Users\BRAM\GerakKita\.env
   ```

2. **Replace API Key**
   Ganti baris:
   ```
   EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=xxxxx
   ```
   
   Menjadi:
   ```
   EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```
   (Gunakan API key yang Anda copy dari Google Cloud Console)

3. **Save file**

---

### **Langkah 5: Restart Aplikasi**

1. **Stop Metro Bundler**
   - Tekan `Ctrl+C` di terminal yang menjalankan `npm start`

2. **Clear Cache dan Restart**
   ```bash
   npx expo start -c
   ```

3. **Reload App**
   - Di Expo Go, shake device atau tekan `r` untuk reload
   - Atau scan QR code lagi

---

## 🧪 **Testing**

1. **Buka aplikasi**
2. Login dengan akun Anda
3. Di halaman Home, scroll ke bagian **"Halte Terdekat"**
4. ✅ Map seharusnya tampil dengan:
   - Marker biru (pulsing) = Lokasi Anda
   - Marker hijau = Halte bus
   - Marker merah = Halte terdekat

5. **Klik map** untuk membuka full-screen map view
6. **Klik tombol Navigate** untuk buka Google Maps directions

---

## 📱 **Alternative: Gunakan Environment Variables**

Jika Anda akan deploy ke production, setup env variables di:

### **Expo EAS Build**
```bash
# app.json or eas.json
{
  "android": {
    "config": {
      "googleMaps": {
        "apiKey": "YOUR_API_KEY_HERE"
      }
    }
  }
}
```

### **Android (app.json)**
```json
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_API_KEY_HERE"
        }
      }
    }
  }
}
```

---

## 💰 **Estimasi Biaya**

### **Google Maps API Pricing (Updated)**
- **Free Tier**: $200 kredit gratis per bulan
- **Maps SDK for Android/iOS**: 
  - $7 per 1000 loads (loads = setiap kali map ditampilkan)
  - Dengan $200 kredit = **~28,000 map loads per bulan GRATIS**

### **Untuk Aplikasi Kecil/Development**
- Penggunaan normal: 100-1000 loads/bulan
- **TIDAK AKAN KENA BIAYA** selama usage di bawah free tier

### **Tips Menghemat**
1. Cache map tiles (sudah di-handle otomatis oleh React Native Maps)
2. Restrict API key hanya untuk app Anda
3. Monitor usage di [Google Cloud Console](https://console.cloud.google.com/google/maps-apis/metrics)

---

## ⚠️ **Troubleshooting**

### **1. Map masih blank setelah setup API key**
```bash
# Clear cache dan rebuild
npx expo start -c
```

### **2. Error "API key not valid"**
- Pastikan API key sudah di-copy dengan benar (tidak ada spasi)
- Pastikan "Maps SDK for Android" sudah enabled
- Restart aplikasi

### **3. Error "This app is not authorized to use Google Maps"**
- Pastikan package name di API key restriction adalah `host.exp.exponent`
- Atau hapus restriction untuk development

### **4. Location permission denied**
- Pastikan allow location permission saat pertama kali buka app
- Settings → Apps → Expo Go → Permissions → Location: Allow

---

## 🎯 **Quick Start (Tanpa Restriction - Development Only)**

Jika Anda ingin cepat test tanpa setup restriction:

1. Create API key di Google Cloud Console
2. **JANGAN** set restriction (biarkan unrestricted)
3. Copy API key
4. Paste ke `.env`
5. Restart app
6. ✅ Maps akan langsung bekerja

⚠️ **WARNING**: Unrestricted API key bisa disalahgunakan! Untuk production harus di-restrict.

---

## 📚 **Resources**

- [Google Maps Platform Getting Started](https://developers.google.com/maps/get-started)
- [React Native Maps Documentation](https://github.com/react-native-maps/react-native-maps)
- [Expo Location Documentation](https://docs.expo.dev/versions/latest/sdk/location/)

---

## 📝 **Checklist**

Setup Google Maps API Key:
- [ ] Create Google Cloud Project
- [ ] Enable billing
- [ ] Enable Maps SDK for Android
- [ ] Create API Key
- [ ] Copy API Key to `.env`
- [ ] Restart app
- [ ] Test map display
- [ ] (Optional) Restrict API key for production

---

Jika sudah selesai setup, coba buka aplikasi dan lihat apakah maps sudah muncul di halaman Home bagian "Halte Terdekat"! 🗺️
