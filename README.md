# Physical Literacy Assessment System

Sistem assessment literasi fisik untuk mengukur kemampuan kognitif, psikologis, sosial, dan memori kerja siswa SMA melalui instrumen penelitian berbasis web menggunakan Next.js dan Supabase.

## 🌟 Fitur

### User Side (Tanpa Login)
- **Halaman Welcome & Informed Consent**: Informasi lengkap tentang penelitian dan persetujuan partisipasi
- **Estimasi Waktu**: Breakdown waktu per section (~30 menit total)
- **Halaman Biodata**: Input nama dan umur peserta
- **Angket Literasi Fisik**: 
  - Domain Kognitif: 10 soal pilihan ganda
  - Domain Psikologis: 20 soal skala Likert (0-4) dengan reverse scoring
  - Domain Sosial: 20 soal skala Likert (0-4) dengan reverse scoring
- **Digit Span Test**: Test memori kerja dengan mode Forward dan Reversed
- **Halaman Hasil**: Analisis lengkap menunjukkan domain mana yang perlu ditingkatkan

### Admin Side (Dengan Login)
- **Dashboard**: Tabel dan grafik data seluruh peserta
- **Analytics & Quality**: 
  - Descriptive statistics (M, SD, range, median, quartiles)
  - APA-formatted output untuk publikasi
  - Data quality monitoring
  - Sample characteristics table
- **Kelola Pertanyaan**: CRUD untuk menambah, edit, dan hapus pertanyaan
- **Export Data**: Download data dengan codebook lengkap untuk analisis SPSS/R
- **Statistik**: Rata-rata skor untuk setiap domain

### Research-Grade Features ✨ NEW
- 📊 **Advanced Analytics Dashboard**: Built-in descriptive statistics
- 📄 **Comprehensive Codebook**: Auto-generated data dictionary dengan marking untuk reverse-scored items
- 🔍 **Data Quality Tools**: Straight-lining detection, response time analysis
- 📋 **Informed Consent System**: Ethical research compliance
- 🎨 **Professional Design**: Age-appropriate untuk siswa SMA
- ⏱️ **Time Management**: Clear expectations dan progress tracking

## 🚀 Setup & Installation

### 1. Prerequisites
- Node.js 18+ terinstall
- Akun Supabase (sudah tersedia)

### 2. Install Dependencies
\`\`\`bash
cd c:\\xampp\\htdocs\\Short_Term\\claude
npm install
\`\`\`

### 3. Setup Supabase Database

1. Buka **Supabase Dashboard**: https://veponmabdoxmrlonpour.supabase.co
2. Pergi ke **SQL Editor**
3. Copy dan jalankan seluruh isi file `supabase-schema.sql`
4. Database akan otomatis membuat tabel dan insert data sample

### 4. Setup Admin User

Ada 2 cara untuk membuat admin user:

**Cara 1: Via Supabase Dashboard (Recommended)**
1. Buka Supabase Dashboard → **Authentication** → **Users**
2. Klik **Invite User** atau **Add User**
3. Masukkan email dan password
4. User akan otomatis dibuat

**Cara 2: Via Sign Up API (Development)**
Tambahkan endpoint signup temporary di development (tidak disarankan untuk production).

### 5. Environment Variables

File `.env.local` sudah berisi konfigurasi yang benar:
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=https://veponmabdoxmrlonpour.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
\`\`\`

### 6. Jalankan Development Server

\`\`\`bash
npm run dev
\`\`\`

Aplikasi akan berjalan di: **http://localhost:3000**

## 📊 Sistem Scoring

### Domain Kognitif (Pilihan Ganda)
- **Total**: 10 soal
- **Kurang**: < 5 poin
- **Cukup**: = 5 poin
- **Bagus**: > 5 poin

### Domain Psikologis (Likert 0-4)
- **Total**: 20 soal (maksimal 80 poin)
- **Kurang**: < 40 poin
- **Cukup**: = 40 poin
- **Bagus**: > 40 poin

### Domain Sosial (Likert 0-4)
- **Total**: 20 soal (maksimal 80 poin)
- **Kurang**: < 40 poin
- **Cukup**: = 40 poin
- **Bagus**: > 40 poin

### Digit Span Test (Memori Kerja)
- **Mode**: Forward & Reversed
- **Starting**: 3 digit, naik bertahap
- **Nyawa**: Unlimited
- **Kurang**: < 7 digit
- **Cukup**: = 7 digit
- **Bagus**: > 7 digit

## 🗂️ Struktur Database

### Tabel: `participants`
Menyimpan data peserta dan skor mereka
- id, name, age
- cognitive_score, psychological_score, social_score, digit_span_score
- created_at

### Tabel: `questions`
Menyimpan bank soal assessment
- id, domain, question_text, question_type
- options (JSON), correct_answer, order_index
- created_at

### Tabel: `responses`
Menyimpan jawaban peserta
- id, participant_id, question_id, answer_value
- created_at

### Tabel: `digit_span_results`
Menyimpan hasil digit span test
- id, participant_id, mode, max_span, attempts
- created_at

## 🛣️ Routes

### Public Routes
- `/` - Homepage dengan design professional
- `/assessment/welcome` - Welcome page dengan informed consent ✨ NEW
- `/assessment` - Halaman biodata (mulai assessment)
- `/assessment/questionnaire` - Halaman angket
- `/assessment/digit-span` - Digit span test
- `/assessment/results` - Halaman hasil

### Admin Routes (Protected)
- `/admin/login` - Login admin
- `/admin/dashboard` - Dashboard dengan tabel & grafik
- `/admin/analytics` - Research analytics & data quality ✨ NEW
- `/admin/questions` - Kelola pertanyaan (CRUD)

## 🔒 Security

- Row Level Security (RLS) enabled di semua tabel
- Public read access untuk tabel `questions`
- Public insert access untuk `participants`, `responses`, `digit_span_results`
- Admin routes dilindungi dengan Supabase Auth
- No sensitive data exposed ke client

## 🎨 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **State Management**: React Hooks + SessionStorage

## 📝 Development Notes

### Untuk Peneliti

#### Mengakses Analytics Dashboard
1. Login ke admin panel
2. Klik tombol "📊 Analytics & Quality"
3. Tab "Descriptive Statistics": Lihat M, SD, range untuk setiap domain
4. Tab "Data Quality": Monitor kualitas data
5. Copy statistik dalam format APA untuk paper

#### Export Data untuk Analisis
1. Login ke admin dashboard
2. Klik tombol "Export CSV"
3. Data sudah dilengkapi codebook dengan:
   - Variable names yang clear
   - Marking untuk reverse-scored items (e.g., `psy_q2_r`)
   - Value labels untuk SPSS
4. Import ke SPSS, R, atau Excel untuk analisis lanjut

#### Informed Consent
- Semua peserta harus menyetujui informed consent
- Consent tersimpan dengan timestamp
- Edit teks consent di `/app/assessment/welcome/page.tsx`
- Tambahkan informasi kontak peneliti sebelum pengumpulan data

### Menambah Pertanyaan Baru
1. Login ke admin panel
2. Buka "Kelola Pertanyaan"
3. Klik "Tambah Pertanyaan"
4. Isi form dan simpan
5. **PENTING**: Jika menambah reverse-scored item, update array di `lib/scoring.ts`

### Customize Scoring
Edit file `lib/scoring.ts` untuk mengubah kriteria scoring atau menambah reverse-scored items.

**Reverse-scored items saat ini:**
- Psychological: order_index [2, 6, 17, 18]
- Social: order_index [12, 16]

## 🐛 Troubleshooting

### Database Connection Error
- Pastikan Supabase URL dan API Key benar di `.env.local`
- Cek koneksi internet

### Questions Not Loading
- Pastikan sudah menjalankan `supabase-schema.sql`
- Cek RLS policies di Supabase

### Admin Cannot Login
- Pastikan user sudah dibuat di Supabase Authentication
- Email dan password harus match

## 📦 Build untuk Production

\`\`\`bash
npm run build
npm start
\`\`\`

## 📄 License

MIT License - Feel free to use for research purposes

## 👨‍💻 Support

Untuk pertanyaan atau issue, silakan hubungi developer atau buat issue di repository.

---

**Dibuat untuk penelitian literasi fisik siswa SMA** ��🏃‍♂️

**Latest Updates:**
- ✅ Research-grade analytics dashboard
- ✅ Informed consent system
- ✅ Professional design untuk SMA
- ✅ Comprehensive data export dengan codebook
- ✅ Reverse scoring bug fixed

**Dokumentasi Lengkap:**
- `RESEARCH-UX-FEATURES.md` - Research features & UX improvements
- `BUGFIX-REVERSE-SCORING.md` - Reverse scoring fix documentation
