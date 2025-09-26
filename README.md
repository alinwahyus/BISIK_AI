# 🤝 BISIK AI - Platform Komunikasi Aksesibilitas

Platform sederhana untuk menjembatani komunikasi antara teman tuli dan teman buta menggunakan teknologi web modern.

## 🎯 Tujuan

Memfasilitasi komunikasi yang mudah dan inklusif antara:
- **Pengguna Tuli**: Menggunakan interface visual dengan dukungan text-to-speech
- **Pengguna Buta**: Menggunakan interface suara dengan dukungan speech-to-text

## ✨ Fitur Utama

### 🔊 Text-to-Speech (TTS)
- Konversi teks menjadi suara untuk pengguna buta
- Dukungan bahasa Indonesia
- Kontrol kecepatan dan volume suara

### 🎤 Speech-to-Text (STT)
- Konversi suara menjadi teks untuk pengguna tuli
- Pengenalan suara dalam bahasa Indonesia
- Real-time transcription

### ⌨️ Aksesibilitas Penuh
- **Keyboard Navigation**: Navigasi lengkap menggunakan keyboard
- **Screen Reader Support**: Kompatibel dengan pembaca layar
- **High Contrast Mode**: Dukungan mode kontras tinggi
- **Focus Management**: Manajemen fokus yang baik untuk navigasi

### 🎨 Antarmuka Responsif
- Design modern dan user-friendly
- Responsive untuk berbagai ukuran layar
- Visual feedback yang jelas
- Status indicator real-time

## 🚀 Cara Menjalankan

### Prasyarat
- Node.js (versi 16 atau lebih baru)
- Browser modern dengan dukungan Web Speech API

### Instalasi
```bash
# Clone atau download project
cd BISIK_AI

# Install dependencies
npm install

# Jalankan development server
npm run dev
```

### Akses Aplikasi
Buka browser dan akses: `http://localhost:5173`

## 📱 Cara Penggunaan

### Mode Tuli (Interface Visual)
1. Pilih "Mode Tuli" di halaman utama
2. Ketik pesan di kolom input
3. Klik "Kirim" atau tekan Enter
4. Gunakan "Bacakan Pesan" untuk mendengar pesan terakhir

### Mode Buta (Interface Suara)
1. Pilih "Mode Buta" di halaman utama
2. Klik "Mulai Bicara" untuk merekam suara
3. Bicara dengan jelas, lalu klik "Berhenti"
4. Gunakan "Putar Ulang" untuk mendengar pesan terakhir

### Keyboard Shortcuts
- `Alt + 1`: Pilih Mode Tuli
- `Alt + 2`: Pilih Mode Buta
- `Alt + S`: Toggle recording (Mode Buta)
- `Alt + R`: Putar/bacakan pesan terakhir
- `Tab`: Navigasi antar elemen
- `Enter/Space`: Aktivasi tombol

## 🛠️ Teknologi yang Digunakan

- **HTML5**: Struktur semantik dengan ARIA labels
- **CSS3**: Styling responsif dengan dukungan aksesibilitas
- **Vanilla JavaScript**: Logika aplikasi tanpa framework
- **Web Speech API**: Speech recognition dan synthesis
- **Vite**: Build tool dan development server

## 🔧 Fitur Aksesibilitas

### ARIA Support
- Proper ARIA labels dan roles
- Live regions untuk update dinamis
- Semantic HTML structure

### Visual Accessibility
- High contrast mode support
- Reduced motion support
- Clear visual hierarchy
- Large touch targets

### Audio Accessibility
- Text-to-speech untuk semua teks penting
- Audio feedback untuk aksi pengguna
- Dukungan multiple bahasa

## 📂 Struktur Project

```
BISIK_AI/
├── index.html          # Halaman utama
├── script.js           # Logika aplikasi
├── package.json        # Dependencies dan scripts
└── README.md          # Dokumentasi
```

## 🌐 Browser Support

### Dukungan Penuh
- Chrome 25+
- Firefox 44+
- Safari 14.1+
- Edge 79+

### Fitur yang Memerlukan Browser Modern
- **Speech Recognition**: Chrome, Edge (WebKit)
- **Speech Synthesis**: Semua browser modern
- **Service Worker**: Semua browser modern

## 🔒 Keamanan dan Privasi

- Tidak ada data yang disimpan di server
- Semua pemrosesan dilakukan di browser
- Tidak ada tracking atau analytics
- Akses mikrofon hanya saat diperlukan

## 🚧 Pengembangan Selanjutnya

### Fitur yang Direncanakan
- [ ] Real-time communication via WebRTC
- [ ] Penyimpanan riwayat pesan lokal
- [ ] Customizable voice settings
- [ ] Multi-language support
- [ ] Mobile app version
- [ ] Offline mode dengan Service Worker

### Kontribusi
Kontribusi sangat diterima! Silakan buat issue atau pull request untuk:
- Bug fixes
- Feature improvements
- Accessibility enhancements
- Documentation updates

## 📄 Lisensi

MIT License - Bebas digunakan untuk tujuan apapun.

## 🤝 Dukungan

Jika mengalami masalah atau memiliki saran:
1. Pastikan browser mendukung Web Speech API
2. Berikan izin akses mikrofon saat diminta
3. Gunakan browser terbaru untuk performa optimal
4. Periksa koneksi internet untuk fitur speech

---

**BISIK AI** - Menjembatani komunikasi, menghubungkan hati ❤️# BISIK_AI
