// Script untuk insert 10 data dummy ke Supabase
// Jalankan dengan: node scripts/seed-dummy-data.js

const { createClient } = require('@supabase/supabase-js');

// Supabase credentials
const SUPABASE_URL = 'https://veponmabdoxmrlonpour.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlcG9ubWFiZG94bXJsb25wb3VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MTcyMzIsImV4cCI6MjA3ODQ5MzIzMn0.PJLNvmM-h9_owUdQC7Vj3MAIjUnGI8kHhN155BbT418';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Nama-nama dummy
const names = [
  'Andi Wijaya', 'Budi Santoso', 'Citra Dewi', 'Dina Putri', 'Eka Pratama',
  'Fajar Ramadhan', 'Gita Sari', 'Hendra Kusuma', 'Indah Permata', 'Joko Susilo'
];

// Function untuk generate random score
function randomScore(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Function untuk generate dummy data
function generateDummyData() {
  const dummyData = [];
  
  for (let i = 0; i < 10; i++) {
    const participant = {
      name: names[i],
      age: randomScore(8, 18), // Umur 8-18 tahun
      cognitive_score: randomScore(3, 10), // Score 3-10
      psychological_score: randomScore(30, 75), // Score 30-75
      social_score: randomScore(30, 75), // Score 30-75
      digit_span_score: randomScore(5, 10) // Score 5-10 digit
    };
    
    dummyData.push(participant);
  }
  
  return dummyData;
}

// Main function
async function seedData() {
  try {
    console.log('🌱 Mulai seeding dummy data...\n');
    
    // Generate dummy data
    const dummyData = generateDummyData();
    
    console.log('📊 Data yang akan di-insert:');
    console.table(dummyData);
    
    // Insert ke database
    const { data, error } = await supabase
      .from('participants')
      .insert(dummyData)
      .select();
    
    if (error) {
      console.error('❌ Error saat insert:', error);
      throw error;
    }
    
    console.log('\n✅ Berhasil insert', data.length, 'data dummy!');
    console.log('🎉 Seeding selesai!\n');
    console.log('👉 Silakan cek di: http://localhost:3000/admin/dashboard');
    
  } catch (error) {
    console.error('💥 Error:', error.message);
    process.exit(1);
  }
}

// Run
seedData();
