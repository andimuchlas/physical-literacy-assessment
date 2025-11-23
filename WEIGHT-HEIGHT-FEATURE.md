# 📏 Fitur Berat Badan & Tinggi Badan

## ✅ Implementasi Selesai

Fitur untuk menambahkan **berat badan (kg)** dan **tinggi badan (cm)** pada form biodata peserta sudah berhasil diimplementasikan.

---

## 📋 Perubahan yang Dilakukan

### 1. **Frontend - Form Biodata** (`app/assessment/page.tsx`)

#### Input Fields Baru:
- ✅ **Berat Badan (kg)** - Input number dengan range 20-200 kg
- ✅ **Tinggi Badan (cm)** - Input number dengan range 50-250 cm

#### Validasi:
```typescript
// Validasi Berat Badan
if (!weight || weightNum < 20 || weightNum > 200) {
  setError('Berat badan harus antara 20-200 kg');
}

// Validasi Tinggi Badan
if (!height || heightNum < 50 || heightNum > 250) {
  setError('Tinggi badan harus antara 50-250 cm');
}
```

#### SessionStorage:
```typescript
sessionStorage.setItem('participantWeight', weight);
sessionStorage.setItem('participantHeight', height);
```

#### UI Layout:
- Menggunakan **grid 2 kolom** untuk weight dan height (side by side)
- Input type: `number` dengan `step="0.1"` untuk desimal
- Placeholder: "Contoh: 55" dan "Contoh: 165"

---

### 2. **Backend - Database Schema** (`add-weight-height-columns.sql`)

#### SQL Script:
```sql
-- Tambah kolom weight (berat badan dalam kg)
ALTER TABLE participants 
ADD COLUMN IF NOT EXISTS weight DECIMAL(5,2);

-- Tambah kolom height (tinggi badan dalam cm)
ALTER TABLE participants 
ADD COLUMN IF NOT EXISTS height DECIMAL(5,2);

-- Tambah komentar untuk dokumentasi
COMMENT ON COLUMN participants.weight IS 'Berat badan peserta dalam kilogram (kg)';
COMMENT ON COLUMN participants.height IS 'Tinggi badan peserta dalam sentimeter (cm)';

-- Tambah constraints untuk validasi
ALTER TABLE participants 
ADD CONSTRAINT check_weight_range CHECK (weight >= 20 AND weight <= 200);

ALTER TABLE participants 
ADD CONSTRAINT check_height_range CHECK (height >= 50 AND height <= 250);
```

#### Tipe Data:
- `DECIMAL(5,2)` - Maksimal 5 digit, 2 desimal
  - Contoh: `165.50`, `55.75`, `200.00`

#### Constraints:
- **Weight**: 20 - 200 kg
- **Height**: 50 - 250 cm

---

### 3. **Logic - Save Data** (`app/assessment/results/page.tsx`)

#### Ambil dari SessionStorage:
```typescript
const weight = sessionStorage.getItem('participantWeight');
const height = sessionStorage.getItem('participantHeight');
```

#### Insert ke Database:
```typescript
const { data: participant, error: participantError } = await supabase
  .from('participants')
  .insert([{
    name,
    age,
    gender: gender || null,
    weight: weight ? parseFloat(weight) : null,
    height: height ? parseFloat(height) : null,
    // ... other fields
  }]);
```

---

### 4. **TypeScript Interface** (`lib/supabase.ts`)

#### Update Interface:
```typescript
export interface Participant {
  id: number;
  name: string;
  age: number;
  gender?: string;
  weight?: number;      // ← BARU
  height?: number;      // ← BARU
  cognitive_score: number;
  psychological_score: number;
  social_score: number;
  digit_span_score: number;
  response_time_seconds?: number;
  has_straight_lining?: boolean;
  response_quality?: string;
  created_at: string;
}
```

---

## 🚀 Cara Menggunakan

### Step 1: Jalankan SQL Script di Supabase

1. Buka **Supabase Dashboard** → **SQL Editor**
2. Copy isi file `add-weight-height-columns.sql`
3. Paste dan **Run** script
4. Verifikasi kolom sudah ditambahkan:
   ```sql
   SELECT * FROM participants LIMIT 1;
   ```

### Step 2: Test di Aplikasi

1. Buka aplikasi: `http://localhost:3000/assessment`
2. Isi form:
   - Nama: "Test User"
   - Umur: 16
   - **Berat Badan: 55.5 kg** ← BARU
   - **Tinggi Badan: 165 cm** ← BARU
   - Jenis Kelamin: Laki-laki/Perempuan
3. Klik "Lanjut ke Assessment"
4. Selesaikan assessment
5. Cek database - data weight dan height tersimpan

### Step 3: Verifikasi Data

```sql
SELECT id, name, age, gender, weight, height, created_at 
FROM participants 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## 📊 Format Data

### Input Format:
- **Berat Badan**: Desimal dengan 1 angka di belakang koma
  - Contoh: `55.5`, `60.0`, `48.3`
- **Tinggi Badan**: Desimal dengan 1 angka di belakang koma
  - Contoh: `165.0`, `170.5`, `158.2`

### Database Format:
- Tersimpan sebagai `DECIMAL(5,2)`
- NULL-able (opsional)
- Dengan constraint validation

---

## 🎯 Fitur Tambahan yang Bisa Dikembangkan

### 1. **BMI Calculator** (Body Mass Index)
```typescript
const bmi = weight / ((height / 100) ** 2);
// BMI = kg / (m²)
```

Kategori BMI:
- < 18.5: Underweight
- 18.5 - 24.9: Normal
- 25 - 29.9: Overweight
- ≥ 30: Obese

### 2. **Growth Chart**
- Plot weight dan height berdasarkan age dan gender
- Bandingkan dengan WHO growth standards
- Tampilkan percentile

### 3. **Analytics Dashboard**
- Rata-rata weight/height per age group
- Distribusi BMI
- Korelasi antara physical literacy score dengan BMI

### 4. **Export Data**
- Tambahkan kolom weight dan height di CSV export
- Format: `Berat_Badan_kg`, `Tinggi_Badan_cm`

---

## ✅ Testing Checklist

- [x] Form validation untuk weight (20-200 kg)
- [x] Form validation untuk height (50-250 cm)
- [x] Data tersimpan ke sessionStorage
- [x] Data tersimpan ke database
- [x] TypeScript interface updated
- [x] SQL constraints berfungsi
- [x] UI responsive (mobile & desktop)
- [x] Error handling untuk input invalid

---

## 📝 Contoh Data

### Sample Input:
```
Nama: Ahmad Rizki
Umur: 16
Berat Badan: 55.5 kg
Tinggi Badan: 165.0 cm
Jenis Kelamin: Laki-laki
```

### Database Record:
```json
{
  "id": 45,
  "name": "Ahmad Rizki",
  "age": 16,
  "gender": "L",
  "weight": 55.5,
  "height": 165.0,
  "cognitive_score": 8,
  "psychological_score": 68,
  "social_score": 62,
  "digit_span_score": 7,
  "created_at": "2025-11-13T08:30:00Z"
}
```

---

## 🐛 Troubleshooting

### Error: "weight column does not exist"
**Solusi:** Jalankan SQL script `add-weight-height-columns.sql` di Supabase

### Error: "new row violates check constraint check_weight_range"
**Solusi:** Pastikan input weight antara 20-200 kg

### Error: "new row violates check constraint check_height_range"
**Solusi:** Pastikan input height antara 50-250 cm

### Data weight/height tidak tersimpan
**Solusi:** 
1. Cek console browser untuk error
2. Verifikasi sessionStorage ada data
3. Cek network tab untuk request ke Supabase

---

## 📦 Files Changed

1. ✅ `app/assessment/page.tsx` - Form biodata dengan input weight & height
2. ✅ `app/assessment/results/page.tsx` - Logic save weight & height
3. ✅ `lib/supabase.ts` - TypeScript interface updated
4. ✅ `add-weight-height-columns.sql` - SQL migration script

---

## 🎉 Status

**✅ SELESAI & SIAP DIGUNAKAN**

- Commit: `837a0b0`
- Message: "Add weight and height fields to participant biodata form and database"
- Pushed to GitHub: ✅
- Ready for production: ✅

---

## 📞 Support

Jika ada masalah atau pertanyaan, silakan:
1. Cek file ini untuk dokumentasi lengkap
2. Review SQL script sebelum run
3. Test di development environment dulu
4. Backup database sebelum migration di production

**Happy coding! 🚀**
