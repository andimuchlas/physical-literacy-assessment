# Script Otomatis Deploy ke GitHub
# Jalankan dengan: .\deploy-to-github.ps1

Write-Host "================================" -ForegroundColor Cyan
Write-Host "   DEPLOY KE GITHUB - OTOMATIS   " -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Fungsi untuk menampilkan error
function Show-Error {
    param($message)
    Write-Host "❌ ERROR: $message" -ForegroundColor Red
    Write-Host ""
    Read-Host "Tekan Enter untuk keluar"
    exit
}

# Fungsi untuk menampilkan sukses
function Show-Success {
    param($message)
    Write-Host "✅ $message" -ForegroundColor Green
}

# Fungsi untuk menampilkan info
function Show-Info {
    param($message)
    Write-Host "ℹ️  $message" -ForegroundColor Yellow
}

# 1. Cek apakah di folder yang benar
Write-Host "📁 Mengecek lokasi folder..." -ForegroundColor Cyan
$currentPath = Get-Location
if ($currentPath.Path -ne "c:\xampp\htdocs\Short_Term\claude") {
    Set-Location "c:\xampp\htdocs\Short_Term\claude"
    Show-Success "Pindah ke folder project"
}

# 2. Cek apakah git sudah terinstall
Write-Host ""
Write-Host "🔍 Mengecek Git..." -ForegroundColor Cyan
try {
    $gitVersion = git --version
    Show-Success "Git terinstall: $gitVersion"
} catch {
    Show-Error "Git belum terinstall! Download di: https://git-scm.com/download/win"
}

# 3. Input dari user
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "   INFORMASI GITHUB   " -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Silakan isi informasi berikut:" -ForegroundColor Yellow
Write-Host ""

# Input GitHub Username
$username = Read-Host "GitHub Username (contoh: johndoe)"
if ([string]::IsNullOrWhiteSpace($username)) {
    Show-Error "Username tidak boleh kosong!"
}

# Input Repository Name
Write-Host ""
$repoName = Read-Host "Nama Repository (contoh: physical-literacy-assessment)"
if ([string]::IsNullOrWhiteSpace($repoName)) {
    Show-Error "Nama repository tidak boleh kosong!"
}

# Input Git Name & Email untuk commit
Write-Host ""
Write-Host "Untuk Git commit, butuh nama dan email:" -ForegroundColor Yellow
$gitName = Read-Host "Nama lengkap Anda (contoh: John Doe)"
$gitEmail = Read-Host "Email GitHub Anda (contoh: john@example.com)"

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "   KONFIRMASI   " -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "GitHub Username : $username" -ForegroundColor White
Write-Host "Repository Name : $repoName" -ForegroundColor White
Write-Host "Git Name        : $gitName" -ForegroundColor White
Write-Host "Git Email       : $gitEmail" -ForegroundColor White
Write-Host "Repository URL  : https://github.com/$username/$repoName" -ForegroundColor White
Write-Host ""
$confirm = Read-Host "Lanjutkan? (y/n)"

if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "❌ Dibatalkan" -ForegroundColor Red
    exit
}

# 4. Buat .gitignore jika belum ada
Write-Host ""
Write-Host "📝 Membuat .gitignore..." -ForegroundColor Cyan
$gitignoreContent = @"
# dependencies
node_modules/
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
"@

Set-Content -Path ".gitignore" -Value $gitignoreContent
Show-Success ".gitignore dibuat"

# 5. Setup Git config
Write-Host ""
Write-Host "⚙️  Setup Git config..." -ForegroundColor Cyan
git config --global user.name "$gitName"
git config --global user.email "$gitEmail"
Show-Success "Git config selesai"

# 6. Cek apakah sudah ada git repo
Write-Host ""
Write-Host "🔍 Mengecek Git repository..." -ForegroundColor Cyan
if (Test-Path ".git") {
    Show-Info "Git repository sudah ada, menggunakan yang ada"
} else {
    git init
    Show-Success "Git repository dibuat"
}

# 7. Add all files
Write-Host ""
Write-Host "📦 Menambahkan semua files..." -ForegroundColor Cyan
git add .
Show-Success "Files ditambahkan"

# 8. Commit
Write-Host ""
Write-Host "💾 Membuat commit..." -ForegroundColor Cyan
git commit -m "Initial commit: Physical Literacy Assessment System"
if ($LASTEXITCODE -eq 0) {
    Show-Success "Commit berhasil"
} else {
    Show-Info "Tidak ada perubahan untuk di-commit atau sudah pernah commit"
}

# 9. Set branch ke main
Write-Host ""
Write-Host "🌿 Setting branch ke main..." -ForegroundColor Cyan
git branch -M main
Show-Success "Branch set ke main"

# 10. Add remote
Write-Host ""
Write-Host "🔗 Menambahkan remote repository..." -ForegroundColor Cyan
$remoteUrl = "https://github.com/$username/$repoName.git"

# Cek apakah remote sudah ada
$existingRemote = git remote get-url origin 2>$null
if ($existingRemote) {
    Show-Info "Remote sudah ada, mengupdate URL..."
    git remote set-url origin $remoteUrl
} else {
    git remote add origin $remoteUrl
}
Show-Success "Remote ditambahkan: $remoteUrl"

# 11. Push ke GitHub
Write-Host ""
Write-Host "🚀 Push ke GitHub..." -ForegroundColor Cyan
Write-Host ""
Write-Host "PENTING:" -ForegroundColor Yellow
Write-Host "1. Pastikan repository sudah dibuat di GitHub.com" -ForegroundColor Yellow
Write-Host "2. Buka: https://github.com/new" -ForegroundColor Yellow
Write-Host "3. Repository name: $repoName" -ForegroundColor Yellow
Write-Host "4. Jangan centang 'Initialize with README'" -ForegroundColor Yellow
Write-Host "5. Klik 'Create repository'" -ForegroundColor Yellow
Write-Host ""
$ready = Read-Host "Sudah buat repository di GitHub? (y/n)"

if ($ready -ne "y" -and $ready -ne "Y") {
    Write-Host ""
    Write-Host "❌ Silakan buat repository dulu di GitHub" -ForegroundColor Red
    Write-Host "   Link: https://github.com/new" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Setelah selesai, jalankan command ini:" -ForegroundColor Green
    Write-Host "   git push -u origin main" -ForegroundColor Cyan
    Write-Host ""
    Read-Host "Tekan Enter untuk keluar"
    exit
}

Write-Host ""
Write-Host "Pushing ke GitHub..." -ForegroundColor Cyan
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "================================" -ForegroundColor Green
    Write-Host "   ✅ SUKSES!   " -ForegroundColor Green
    Write-Host "================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Repository berhasil di-push ke GitHub!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📍 Repository URL:" -ForegroundColor Cyan
    Write-Host "   https://github.com/$username/$repoName" -ForegroundColor White
    Write-Host ""
    Write-Host "🚀 LANGKAH SELANJUTNYA - DEPLOY KE VERCEL:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Buka: https://vercel.com/signup" -ForegroundColor White
    Write-Host "2. Login dengan GitHub" -ForegroundColor White
    Write-Host "3. Klik 'Add New...' → 'Project'" -ForegroundColor White
    Write-Host "4. Pilih repository: $repoName" -ForegroundColor White
    Write-Host "5. Tambahkan Environment Variables:" -ForegroundColor White
    Write-Host "   - NEXT_PUBLIC_SUPABASE_URL" -ForegroundColor Cyan
    Write-Host "   - NEXT_PUBLIC_SUPABASE_ANON_KEY" -ForegroundColor Cyan
    Write-Host "6. Klik 'Deploy'" -ForegroundColor White
    Write-Host "7. Tunggu 2-3 menit, selesai!" -ForegroundColor White
    Write-Host ""
    Write-Host "================================" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "================================" -ForegroundColor Red
    Write-Host "   ❌ ERROR   " -ForegroundColor Red
    Write-Host "================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Push gagal! Kemungkinan penyebab:" -ForegroundColor Red
    Write-Host ""
    Write-Host "1. Repository belum dibuat di GitHub" -ForegroundColor Yellow
    Write-Host "   Buat di: https://github.com/new" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "2. Username atau repository name salah" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "3. Belum login ke GitHub" -ForegroundColor Yellow
    Write-Host "   Jalankan: gh auth login" -ForegroundColor Yellow
    Write-Host "   Atau push manual dengan username/password" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Coba push manual dengan command:" -ForegroundColor Cyan
    Write-Host "   git push -u origin main" -ForegroundColor White
    Write-Host ""
    Write-Host "================================" -ForegroundColor Red
    Write-Host ""
}

Read-Host "Tekan Enter untuk keluar"
