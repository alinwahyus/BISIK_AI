# Setup GitHub Pages untuk BISIK AI

## 🚀 Langkah-langkah Setup GitHub Pages

### 1. Konfigurasi Repository di GitHub
1. Buka repository: https://github.com/alinwahyus/BISIK_AI
2. Klik tab **Settings**
3. Scroll ke bagian **Pages** di sidebar kiri
4. Pilih **Source**: GitHub Actions
5. Klik **Save**

### 2. Upload File yang Sudah Dikonfigurasi
File-file berikut sudah dikonfigurasi untuk GitHub Pages:

#### ✅ File yang Diperbarui:
- `vite.config.js` - Ditambahkan `base: '/BISIK_AI/'`
- `package.json` - Ditambahkan script deploy dan gh-pages dependency
- `.github/workflows/deploy.yml` - GitHub Actions untuk auto-deploy

#### 📁 Struktur File Baru:
```
BISIK_AI/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── vite.config.js (updated)
├── package.json (updated)
└── ... (file lainnya)
```

### 3. Cara Deploy

#### Opsi A: Auto Deploy (Direkomendasikan)
1. Push semua file ke repository GitHub
2. GitHub Actions akan otomatis build dan deploy
3. Akses aplikasi di: `https://alinwahyus.github.io/BISIK_AI/`

#### Opsi B: Manual Deploy
```bash
# Install dependencies
npm install

# Build dan deploy manual
npm run deploy
```

### 4. Verifikasi Deployment
1. Cek tab **Actions** di GitHub untuk melihat status deployment
2. Setelah selesai, akses: `https://alinwahyus.github.io/BISIK_AI/`
3. Aplikasi BISIK AI akan tersedia secara online

## 🔧 Konfigurasi yang Dilakukan

### Vite Configuration
```javascript
export default defineConfig({
  base: '/BISIK_AI/', // Penting untuk GitHub Pages
  // ... konfigurasi lainnya
})
```

### GitHub Actions Workflow
- Auto-deploy saat push ke branch `main`
- Build menggunakan Node.js 18
- Deploy ke GitHub Pages secara otomatis

## 🌐 URL Aplikasi
Setelah setup selesai, aplikasi akan tersedia di:
**https://alinwahyus.github.io/BISIK_AI/**

## 📝 Catatan Penting
- Pastikan repository visibility adalah **Public** untuk GitHub Pages gratis
- Deployment membutuhkan waktu 2-5 menit
- Setiap push ke branch `main` akan trigger auto-deploy
- Cek tab **Actions** untuk monitoring deployment status