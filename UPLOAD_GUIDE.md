# Panduan Upload BISIK AI ke GitHub

## Repository Target
https://github.com/alinwahyus/BISIK_AI

## ⚠️ Masalah Lisensi Xcode
Saat ini ada masalah dengan lisensi Xcode yang menghalangi penggunaan git command line. Solusi terbaik adalah menggunakan metode alternatif di bawah.

## Struktur Proyek yang Akan Diupload
```
BISIK_AI/
├── .gitignore
├── GIF/
│   ├── AKU.gif
│   ├── KAMU.gif
│   └── Mereka.gif
├── README.md
├── config.js
├── deaf-mode.js
├── gesture-detection.js
├── index.html
├── package-lock.json
├── package.json
├── script.js
├── simple-animation.js
├── sw.js
└── vite.config.js
```

## Cara Upload (Pilih salah satu):

### Opsi 1: GitHub Desktop (Paling Mudah)
1. Download dan install GitHub Desktop
2. Login dengan akun alinwahyus
3. Clone repository: https://github.com/alinwahyus/BISIK_AI
4. Copy semua file dari folder BISIK_AI ke folder yang di-clone
5. Commit dan push melalui GitHub Desktop

### Opsi 2: Web Interface GitHub
1. Buka https://github.com/alinwahyus/BISIK_AI
2. Klik "Add file" > "Upload files"
3. Drag and drop semua file dan folder
4. Tulis commit message
5. Klik "Commit changes"

### Opsi 3: Command Line (Setelah menyelesaikan masalah Xcode)
```bash
# Selesaikan masalah lisensi Xcode terlebih dahulu
sudo xcodebuild -license accept

# Inisialisasi git
git init
git add .
git commit -m "Initial commit: BISIK AI - Aplikasi Penerjemah BISINDO"

# Tambahkan remote
git remote add origin https://github.com/alinwahyus/BISIK_AI.git

# Push ke GitHub
git push -u origin main
```

## File Penting yang Sudah Disiapkan
- ✅ .gitignore (sudah dibuat)
- ✅ Semua file aplikasi
- ✅ Folder GIF dengan animasi BISINDO
- ✅ Package.json dengan dependencies

## Catatan
- Repository sudah ada di GitHub
- Pastikan login dengan akun alinwahyus
- Semua file sudah siap untuk diupload