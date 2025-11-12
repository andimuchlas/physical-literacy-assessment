# 🔍 Quality Indicators - Panduan Lengkap

## 📊 Apa itu Quality Indicators?

**Quality Indicators** adalah sistem otomatis untuk **mendeteksi kualitas data penelitian**. Sistem ini membantu peneliti mengidentifikasi respons yang berpotensi **tidak valid** atau **kurang reliabel**.

---

## 🎯 Mengapa Quality Indicators Penting?

Dalam penelitian psikologi/pendidikan, **kualitas data** sangat krusial karena:

1. **Data tidak valid** = Hasil penelitian **bias**
2. **Responden asal jawab** = Statistik **menyesatkan**
3. **Publikasi ilmiah** memerlukan **data berkualitas tinggi**

### Contoh Masalah Nyata:

❌ **Tanpa Quality Check:**
```
100 responden → Semua data dianalisis → Hasil: M=65, SD=12
Ternyata 20 responden asal jawab (straight-lining)
Hasil sebenarnya seharusnya: M=68, SD=8 (sangat berbeda!)
```

✅ **Dengan Quality Check:**
```
100 responden → Filter data berkualitas rendah → 80 responden valid
Analisis hanya data valid → Hasil: M=68, SD=8 (akurat & reliabel)
```

---

## 🧩 2 Indikator Utama

### 1️⃣ Straight-lining Detection

#### **Definisi:**
Straight-lining terjadi ketika responden memilih **jawaban yang sama secara konsisten** tanpa membaca pertanyaan.

#### **Contoh:**

**❌ STRAIGHT-LINING (Data Buruk):**
```
Q1: Saya suka olahraga         → Jawab: 3
Q2: Saya tidak suka olahraga   → Jawab: 3 (harusnya 1 jika konsisten!)
Q3: Saya aktif bergerak        → Jawab: 3
Q4: Saya tidak pernah olahraga → Jawab: 3 (harusnya 1!)
Q5: Saya rajin berolahraga     → Jawab: 3
... semua jawab 3
```

**Masalah:** Responden tidak membaca pertanyaan, hanya klik angka yang sama terus.

**✅ NORMAL (Data Bagus):**
```
Q1: Saya suka olahraga         → Jawab: 4 (Sangat setuju)
Q2: Saya tidak suka olahraga   → Jawab: 1 (Tidak setuju - konsisten!)
Q3: Saya aktif bergerak        → Jawab: 3 (Kadang-kadang)
Q4: Saya tidak pernah olahraga → Jawab: 2 (Jarang - konsisten!)
Q5: Saya rajin berolahraga     → Jawab: 3 (Kadang-kadang)
... jawaban bervariasi & logis
```

#### **Algoritma Deteksi:**

```typescript
function detectStraightLining(answerValues: number[]): boolean {
  // Hitung variance (variasi jawaban)
  const mean = answerValues.reduce((a, b) => a + b, 0) / answerValues.length;
  const variance = answerValues.reduce((sum, val) => 
    sum + Math.pow(val - mean, 2), 0) / answerValues.length;
  
  // Jika variance < 0.5 = mencurigakan
  return variance < 0.5;
}
```

**Contoh Perhitungan:**

| Jawaban | Mean | Variance | Status |
|---------|------|----------|--------|
| [3,3,3,3,3,3,3,3] | 3.0 | **0.0** | ⚠️ STRAIGHT-LINING |
| [3,3,3,3,2,3,3,3] | 2.875 | **0.11** | ⚠️ SUSPICIOUS |
| [1,2,3,4,2,3,1,4] | 2.5 | **1.25** | ✅ NORMAL |

---

### 2️⃣ Response Time Analysis

#### **Definisi:**
Waktu yang dibutuhkan responden untuk menyelesaikan seluruh assessment.

#### **Kategori:**

| Kategori | Waktu | Keterangan | Status |
|----------|-------|------------|--------|
| **Terlalu Cepat** | < 3 menit | Tidak mungkin baca 40 soal dengan baik | ⚠️ **too_fast** |
| **Normal** | 3-30 menit | Waktu wajar untuk membaca & berpikir | ✅ **normal** |
| **Terlalu Lambat** | > 30 menit | Mungkin tidak fokus/terganggu | ⚠️ **too_slow** |

#### **Contoh Perhitungan:**

```
40 soal + digit span test ≈ 45 item total

TERLALU CEPAT (150 detik):
150 ÷ 45 = 3.3 detik/item → Tidak mungkin baca soal!

NORMAL (600 detik = 10 menit):
600 ÷ 45 = 13.3 detik/item → Cukup waktu baca & pikir

TERLALU LAMBAT (2000 detik = 33 menit):
2000 ÷ 45 = 44 detik/item → Mungkin multitasking/tidak fokus
```

#### **Algoritma Deteksi:**

```typescript
function analyzeResponseTimeQuality(timeSeconds: number): string {
  if (timeSeconds === 0) return 'unknown';
  if (timeSeconds < 180) return 'too_fast';  // < 3 menit
  if (timeSeconds > 1800) return 'too_slow'; // > 30 menit
  return 'normal';
}
```

---

## 💾 Implementasi Database

### **Schema Migration:**

```sql
-- Tambahkan kolom quality indicators
ALTER TABLE participants 
ADD COLUMN gender VARCHAR(20) CHECK (gender IN ('L', 'P')),
ADD COLUMN response_time_seconds INTEGER,
ADD COLUMN has_straight_lining BOOLEAN,
ADD COLUMN response_quality VARCHAR(20);

-- Index untuk query cepat
CREATE INDEX idx_participants_gender ON participants(gender);
CREATE INDEX idx_participants_quality ON participants(response_quality);
CREATE INDEX idx_participants_straight_lining ON participants(has_straight_lining);
```

### **Data Yang Disimpan:**

```typescript
{
  name: "Ahmad Rizki",
  age: 16,
  gender: "L",
  cognitive_score: 8,
  psychological_score: 64,
  social_score: 58,
  digit_span_score: 6,
  response_time_seconds: 480,           // 8 menit
  has_straight_lining: false,           // ✅ Normal
  response_quality: "normal"            // ✅ Normal
}
```

---

## 📊 Analytics Dashboard

### **Tab: Kualitas Data**

Dashboard menampilkan:

#### 1. **Summary Cards:**
- ✅ Data Valid (normal, tidak ada straight-lining)
- ⚠️ Perlu Ditinjau (ada flag kualitas)
- 📊 Total Data

#### 2. **Straight-lining Detection:**
- Jumlah respons normal vs. straight-lining
- Persentase masing-masing
- **Daftar partisipan** dengan straight-lining (untuk review manual)

#### 3. **Response Time Analysis:**
- ⚡ Terlalu Cepat (< 3 menit) + persentase
- ✅ Normal (3-30 menit) + persentase
- 🐌 Terlalu Lambat (> 30 menit) + persentase
- Rata-rata waktu pengerjaan

#### 4. **Rekomendasi:**
- Tinjau manual data berkualitas rendah
- Pertimbangkan eksklusi data straight-lining
- Dokumentasikan kriteria dalam publikasi

---

## 🔬 Cara Menggunakan dalam Penelitian

### **Step 1: Kumpulkan Data**
Jalankan assessment seperti biasa. Sistem otomatis mendeteksi quality indicators.

### **Step 2: Buka Analytics Dashboard**
```
Admin Dashboard → Analitik Penelitian → Tab "Kualitas Data"
```

### **Step 3: Review Data Berkualitas Rendah**

**Contoh Output:**
```
✅ Data Valid: 85 (85%)
⚠️ Perlu Ditinjau: 15 (15%)

Straight-lining: 8 partisipan
  - Ahmad (ID: 12)
  - Budi (ID: 24)
  - Citra (ID: 35)
  ...

Terlalu Cepat: 5 partisipan
Terlalu Lambat: 2 partisipan
```

### **Step 4: Keputusan Peneliti**

#### **Opsi A: Eksklusi Total**
```
N awal = 100
Eksklusi straight-lining = 8
Eksklusi too_fast = 5
N akhir = 87
```

#### **Opsi B: Review Manual**
```
Review manual 15 data yang di-flag
Eksklusi hanya yang benar-benar tidak valid
N akhir = 92
```

### **Step 5: Dokumentasi**

**Contoh Penulisan di Paper:**
```
Participants (N = 100) completed the physical literacy assessment. 
Data quality checks were conducted to identify invalid responses. 
Straight-lining detection (variance < 0.5) identified 8 participants 
with suspicious response patterns. Response time analysis flagged 
5 participants who completed the assessment in under 3 minutes 
(too fast) and 2 who took over 30 minutes (too slow). 

After excluding these cases, the final sample consisted of 
N = 85 participants (M_age = 16.2, SD = 1.1).
```

---

## 📈 Contoh Hasil Penelitian

### **Sebelum Quality Check:**
```
Domain Kognitif:  M = 6.2, SD = 2.8
Domain Psikologis: M = 58.5, SD = 18.3
Domain Sosial:     M = 55.2, SD = 16.9
```

### **Setelah Quality Check (Eksklusi Data Buruk):**
```
Domain Kognitif:  M = 6.8, SD = 2.1 ← SD lebih kecil (data lebih konsisten)
Domain Psikologis: M = 62.3, SD = 14.2 ← Mean lebih tinggi (data valid)
Domain Sosial:     M = 59.1, SD = 13.5 ← Variasi lebih wajar
```

**Kesimpulan:** Data setelah quality check lebih **reliabel** dan **valid**.

---

## 🚀 Next Steps

### **Implementasi Sudah Selesai:**
- ✅ Deteksi straight-lining otomatis
- ✅ Analisis response time
- ✅ Dashboard analytics dengan visualisasi
- ✅ Database schema dengan quality flags
- ✅ Rekomendasi untuk peneliti

### **Cara Mengaktifkan:**

1. **Jalankan Migration SQL:**
   ```
   Buka Supabase Dashboard → SQL Editor
   Copy-paste isi file: supabase-migration-gender-timing.sql
   Execute
   ```

2. **Test dengan Data Baru:**
   - Isi assessment dengan pola straight-lining (semua jawab 3)
   - Isi assessment dengan waktu sangat cepat (< 3 menit)
   - Cek di Analytics Dashboard → Tab "Kualitas Data"
   - Lihat data di-flag dengan benar

3. **Interpretasi Hasil:**
   - Review partisipan yang di-flag
   - Putuskan kriteria eksklusi
   - Dokumentasikan dalam laporan penelitian

---

## 📝 FAQ

**Q: Apakah semua data dengan straight-lining harus dibuang?**  
A: Tidak selalu. Tinjau manual dulu. Kadang variance rendah terjadi karena responden benar-benar konsisten.

**Q: Berapa batas waktu ideal untuk assessment ini?**  
A: 5-15 menit adalah optimal. < 3 menit terlalu cepat, > 30 menit risiko tidak fokus.

**Q: Apakah bisa deteksi responden yang asal klik tanpa baca?**  
A: Ya, melalui kombinasi straight-lining + response time terlalu cepat.

**Q: Bagaimana jika semua data di-flag?**  
A: Periksa apakah threshold terlalu ketat. Sesuaikan di kode jika perlu.

---

## 📚 Referensi

1. **Straight-lining Detection:**  
   Greszki, R., Meyer, M., & Schoen, H. (2015). Exploring the effects of removing "too fast" responses and respondents from web surveys. *Public Opinion Quarterly*, 79(2), 471-503.

2. **Response Time Analysis:**  
   Malhotra, N. (2008). Completion time and response order effects in web surveys. *Public Opinion Quarterly*, 72(5), 914-934.

3. **Data Quality in Online Research:**  
   Meade, A. W., & Craig, S. B. (2012). Identifying careless responses in survey data. *Psychological Methods*, 17(3), 437-455.

---

**🎯 Kesimpulan:**

Quality Indicators adalah **alat penting** untuk memastikan data penelitian Anda **valid**, **reliabel**, dan **dapat dipercaya**. Sistem ini:

- ✅ Otomatis mendeteksi respons bermasalah
- ✅ Memberikan insight untuk keputusan peneliti
- ✅ Meningkatkan kualitas publikasi ilmiah
- ✅ Menghemat waktu review manual

**Status: FULLY IMPLEMENTED & READY TO USE** 🚀
