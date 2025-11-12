# 🐛 Bug Fix: Reverse Scoring Tidak Bekerja

## Tanggal: 12 November 2025

---

## 📋 Deskripsi Masalah

### Gejala:
- Ketika user memilih **jawaban 4 untuk semua pertanyaan** pada Domain Psikologis, skor yang didapat adalah **80/80**
- Padahal seharusnya **TIDAK 80** karena ada beberapa pertanyaan dengan **reverse scoring** (pertanyaan negatif)

### Contoh:
Jika user memilih 4 (Sangat Setuju) untuk semua 20 pertanyaan psikologis:
- ❌ **SEBELUM FIX**: Skor = 80/80
- ✅ **SETELAH FIX**: Skor = 64/80

---

## 🔍 Analisis Root Cause

### Kode Bermasalah (SEBELUM):
```typescript
export function calculatePsychologicalScore(answers, questions) {
  // ...
  const value = reversePsychologicalOrder.includes(q.id) ? (4 - raw) : raw;
  //                                                 ^^^^
  //                                                 BUG! Menggunakan q.id
}
```

### Masalah:
1. **Array `reversePsychologicalOrder = [2, 6, 17, 18]`** merujuk ke **`order_index`** (nomor urut pertanyaan dalam domain)
2. Namun kode mengecek **`q.id`** yang merupakan **ID database** (nilai 11-30 untuk psychological)
3. Karena tidak ada pertanyaan psychological dengan `id = 2, 6, 17, 18` (ID psychological dimulai dari 11), maka **reverse scoring TIDAK PERNAH TERJADI**

### Mapping Database:
| Order Index | Database ID | Pertanyaan | Reverse? |
|------------|-------------|------------|----------|
| 1 | 11 | Saya merasa senang ketika berolahraga | ❌ |
| **2** | **12** | Saya percaya diri dengan kemampuan olahraga saya | **✅ REVERSE** |
| 3 | 13 | Saya menikmati aktivitas fisik di sekolah | ❌ |
| ... | ... | ... | ... |
| **6** | **16** | Saya merasa bangga ketika berhasil... | **✅ REVERSE** |
| ... | ... | ... | ... |
| **17** | **27** | Saya merasa rileks ketika berolahraga | **✅ REVERSE** |
| **18** | **28** | Saya bangga dengan pencapaian olahraga saya | **✅ REVERSE** |

---

## ✅ Solusi

### Kode yang Diperbaiki:
```typescript
export function calculatePsychologicalScore(answers, questions) {
  // ...
  const value = reversePsychologicalOrder.includes(q.order_index) ? (4 - raw) : raw;
  //                                                 ^^^^^^^^^^^^
  //                                                 FIXED! Menggunakan q.order_index
}

export function calculateSocialScore(answers, questions) {
  // ...
  const value = reverseSocialOrder.includes(q.order_index) ? (4 - raw) : raw;
  //                                        ^^^^^^^^^^^^
  //                                        FIXED! Menggunakan q.order_index
}
```

---

## 📊 Hasil Setelah Fix

### Test Case 1: Semua jawaban = 4
**PSYCHOLOGICAL DOMAIN:**
- 16 pertanyaan normal: 16 × 4 = **64 poin**
- 4 pertanyaan reverse (order 2, 6, 17, 18): 4 × (4-4) = **0 poin**
- **Total: 64/80** ✅

**SOCIAL DOMAIN:**
- 18 pertanyaan normal: 18 × 4 = **72 poin**
- 2 pertanyaan reverse (order 12, 16): 2 × (4-4) = **0 poin**
- **Total: 72/80** ✅

### Test Case 2: Semua jawaban = 0
**PSYCHOLOGICAL DOMAIN:**
- 16 pertanyaan normal: 16 × 0 = **0 poin**
- 4 pertanyaan reverse: 4 × (4-0) = **16 poin**
- **Total: 16/80** ✅

**SOCIAL DOMAIN:**
- 18 pertanyaan normal: 18 × 0 = **0 poin**
- 2 pertanyaan reverse: 2 × (4-0) = **8 poin**
- **Total: 8/80** ✅

### Test Case 3: Semua jawaban = 2
**PSYCHOLOGICAL DOMAIN:**
- 16 pertanyaan normal: 16 × 2 = **32 poin**
- 4 pertanyaan reverse: 4 × (4-2) = **8 poin**
- **Total: 40/80** ✅

**SOCIAL DOMAIN:**
- 18 pertanyaan normal: 18 × 2 = **36 poin**
- 2 pertanyaan reverse: 2 × (4-2) = **4 poin**
- **Total: 40/80** ✅

---

## 📁 File yang Diubah

1. **`lib/scoring.ts`**
   - Fixed `calculatePsychologicalScore()` function
   - Fixed `calculateSocialScore()` function

---

## 🧪 Verifikasi

Jalankan script verifikasi:
```bash
node scripts/verify-reverse-scoring-fix.js
```

Output yang diharapkan:
```
✅ ALL TESTS PASSED!
```

---

## 🎯 Pertanyaan dengan Reverse Scoring

### Domain Psikologis (4 pertanyaan):
- **Order 2** (ID 12): "Saya percaya diri dengan kemampuan olahraga saya"
- **Order 6** (ID 16): "Saya merasa bangga ketika berhasil melakukan gerakan olahraga"
- **Order 17** (ID 27): "Saya merasa rileks ketika berolahraga"
- **Order 18** (ID 28): "Saya bangga dengan pencapaian olahraga saya"

### Domain Sosial (2 pertanyaan):
- **Order 12** (ID 42): "Saya dapat menyelesaikan konflik dengan baik saat berolahraga"
- **Order 16** (ID 46): "Saya aktif berkontribusi dalam kegiatan olahraga kelompok"

---

## 💡 Catatan untuk Developer

**PENTING:** Saat menambahkan pertanyaan baru dengan reverse scoring:
1. ✅ Gunakan `order_index` bukan `id` database
2. ✅ Update array `reversePsychologicalOrder` atau `reverseSocialOrder` dengan `order_index` yang benar
3. ✅ Jalankan test script untuk verifikasi
4. ❌ JANGAN menggunakan `q.id` untuk pengecekan reverse scoring

---

## 🔄 Next Steps

Setelah fix ini, Anda perlu:
1. ✅ **Rebuild aplikasi** dengan `npm run build`
2. ✅ **Restart development server** dengan `npm run dev`
3. ✅ **Test ulang** assessment dengan berbagai kombinasi jawaban
4. ✅ **Deploy** ke production jika sudah yakin

---

## 📞 Contact

Jika ada pertanyaan atau masalah terkait fix ini, silakan hubungi developer team.

---

**Status: ✅ RESOLVED**
**Verified by: Automated Test Script**
**Impact: HIGH - Affects scoring accuracy for all assessments**
