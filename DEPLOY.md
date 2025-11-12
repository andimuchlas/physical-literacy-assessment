# CARA DEPLOY KE VERCEL

## 1. PERSIAPAN

### Pastikan .gitignore sudah benar
node_modules/
.next/
.env.local
.DS_Store

## 2. BUAT REPOSITORY DI GITHUB

1. Buka https://github.com/new
2. Nama repository: physical-literacy-assessment (atau nama lain)
3. Description: Assessment system for physical literacy research
4. Public atau Private (terserah)
5. Jangan centang "Initialize with README" (sudah ada)
6. Klik "Create repository"

## 3. PUSH KE GITHUB

Jalankan command ini di terminal:

```powershell
cd c:\xampp\htdocs\Short_Term\claude

# Init git (jika belum)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Physical Literacy Assessment System"

# Set branch
git branch -M main

# Add remote (GANTI username dan repo-name)
git remote add origin https://github.com/username/repo-name.git

# Push
git push -u origin main
```

## 4. DEPLOY DI VERCEL

### A. Buat Akun Vercel
1. Buka https://vercel.com/signup
2. Klik "Continue with GitHub"
3. Authorize Vercel di GitHub

### B. Import Project
1. Klik "Add New..." → "Project"
2. Pilih repository "physical-literacy-assessment"
3. Klik "Import"

### C. Configure Project
- **Framework Preset**: Next.js (auto-detect)
- **Root Directory**: ./
- **Build Command**: `npm run build` (auto)
- **Output Directory**: .next (auto)

### D. Environment Variables
Tambahkan 2 environment variables:

```
NEXT_PUBLIC_SUPABASE_URL = https://veponmabdoxmrlonpour.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlcG9ubWFiZG94bXJsb25wb3VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MTcyMzIsImV4cCI6MjA3ODQ5MzIzMn0.PJLNvmM-h9_owUdQC7Vj3MAIjUnGI8kHhN155BbT418
```

### E. Deploy
1. Klik "Deploy"
2. Tunggu 2-3 menit
3. Selesai! URL: https://your-project.vercel.app

## 5. CUSTOM DOMAIN (OPTIONAL)

### Pakai Domain Gratis dari Vercel:
- your-project.vercel.app (sudah gratis)

### Atau Pakai Domain Sendiri:
1. Settings → Domains
2. Tambahkan domain (contoh: assessment.yourdomain.com)
3. Update DNS di registrar domain

## 6. AUTO DEPLOY

Setiap kali push ke GitHub, Vercel otomatis deploy:

```powershell
git add .
git commit -m "Update feature X"
git push
```

Vercel akan auto-detect dan deploy dalam 2-3 menit.

## 7. MONITORING

Dashboard Vercel menampilkan:
- Deployment status
- Build logs
- Analytics
- Error logs
- Performance metrics

---

## TROUBLESHOOTING

### Build Error?
1. Cek Vercel deployment logs
2. Pastikan environment variables sudah benar
3. Test build lokal: `npm run build`

### Environment Variables Tidak Terbaca?
1. Pastikan nama variabel diawali `NEXT_PUBLIC_`
2. Redeploy setelah tambah environment variables

### Database Connection Error?
1. Cek Supabase credentials
2. Pastikan RLS policies sudah benar
3. Cek network tab di browser DevTools

---

## KEUNTUNGAN VERCEL

✅ Automatic HTTPS
✅ Global CDN
✅ Serverless Functions
✅ Analytics (100k page views/month free)
✅ Preview deployments untuk setiap branch
✅ Rollback dengan 1 klik
✅ Custom domains unlimited

---

## ALTERNATIF JIKA VERCEL TIDAK BISA

1. **Netlify**: https://netlify.com (mirip Vercel)
2. **Railway**: https://railway.app (perlu credit card)
3. **Render**: https://render.com (ada cold start)

---

SELAMAT MENCOBA! 🚀
