# AI Personal Mentor – Chrisella Kurniawan

Aplikasi AI Chatbot interaktif yang berfungsi sebagai mentor pribadi bernama **Chrisella Kurniawan**, dilengkapi dengan konsultasi materi pembelajaran, voice over suara perempuan, kuis cerdas, rangkuman, dan evaluasi pemahaman.

---

## 🚀 Fitur Utama

1. **Profile Header Chrisella Kurniawan**
   - Foto profil bulat (*circular avatar*) terpusat di bagian atas.
   - Nama jelas **Chrisella Kurniawan** dengan keterangan *"Your Personal AI Mentor"*.
   - Fitur ganti/unggah foto profil kustom.

2. **Area Chat Interaktif**
   - Bubble chat pesan pengguna (kanan) dan mentor (kiri).
   - Indikator responsif *"Chrisella Kurniawan is typing..."*.
   - Konteks percakapan tersimpan selama sesi berlangsung.

3. **Fitur Voice Over (Suara Perempuan AI)**
   - Suara perempuan natural berbahasa Indonesia.
   - Didukung model Gemini TTS (`gemini-3.8-flash-lite-tts` dengan *voice* `"Kore"`) dan cadangan *Web Speech API*.
   - Tombol speaker pada setiap jawaban dengan kontrol **Play, Pause, dan Stop**.
   - Pengaturan kecepatan bicara (0.85x, 1.0x, 1.25x).

4. **Pengelolaan Materi Pembelajaran (Knowledge Base)**
   - Mendukung format **PDF, DOCX, PPT, PPTX, TXT, dan Gambar (PNG/JPG)**.
   - Menambahkan materi baru tanpa menghapus materi sebelumnya.
   - Materi menjadi sumber acuan utama mentor dalam menjawab.

5. **Aksi Belajar Cepat (Quick Actions)**
   - 💡 **Explain More**: Menerangkan ulang konsep dengan analogi sederhana sehari-hari.
   - 📝 **Summarize**: Membuat rangkuman intisari dokumen.
   - ❓ **Practice Questions**: Memberikan latihan soal berbobot dengan pembahasan.
   - 🎯 **Quiz Mode**: Antarmuka kuis interaktif dengan skor langsung dan feedback.
   - 🔍 **Feedback**: Mengoreksi dan mengevaluasi jawaban pengguna.

---

## 🛠️ Cara Menjalankan Aplikasi di Komputer Lokal

### 1. Prasyarat
- **Node.js** versi 20 atau yang lebih baru ([Unduh Node.js](https://nodejs.org/)).
- **npm** (otomatis terpasang bersama Node.js).

### 2. Instalasi Dependensi
Ekstrak file `.zip` ini, buka terminal / command prompt di folder hasil ekstraksi, lalu jalankan:

```bash
npm install
```

### 3. Konfigurasi Lingkungan (Opsional untuk AI Penuh)
Salin `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

Buka file `.env` dan masukkan API Key Gemini Anda (dapatkan gratis di [Google AI Studio](https://aistudio.google.com/)):
```env
GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"
```
*(Catatan: Aplikasi tetap memiliki respons cadangan dan suara Web Speech jika API Key belum diisi).*

### 4. Menjalankan Aplikasi

Jalankan perintah development server:

```bash
npm run dev
```

Buka browser dan akses alamat:
```
http://localhost:3000
```

---

## 📦 Struktur Folder
```text
├── index.html
├── metadata.json
├── package.json
├── tsconfig.json
├── vite.config.ts
├── server.ts                  # Server Express & integrasi Gemini API
├── public/
│   └── assets/aistudio/       # Foto Chrisella Kurniawan
└── src/
    ├── App.tsx                # Komponen utama aplikasi
    ├── index.css              # Tailwind CSS
    ├── main.tsx
    ├── types.ts               # Tipe data TypeScript
    ├── components/
    │   ├── HeaderProfile.tsx  # Header foto & identitas mentor
    │   ├── ChatMessageBubble.tsx # Gelembung chat & kontrol audio
    │   ├── ChatInputArea.tsx  # Kolom input pertanyaan
    │   ├── QuickActionsBar.tsx# Tombol aksi pembelajaran interaktif
    │   ├── AudioPlayerBar.tsx # Bar pemutar suara (Play/Pause/Stop)
    │   ├── MaterialsModal.tsx # Pengunggah & pengelola materi
    │   ├── ProfileEditModal.tsx # Pengganti foto profil
    │   └── QuizModal.tsx      # Modal kuis interaktif
    └── services/
        ├── api.ts             # Service pemanggil API server
        └── voiceService.ts    # Service pemutar suara Voice Over
```
