/**
 * Seed Complete Dummy Data with All Fields
 * Including: gender, response_time_seconds, has_straight_lining, response_quality
 * 
 * Run: node scripts/seed-complete-dummy-data.js
 */

require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Supabase credentials not found in environment variables');
  console.log('Make sure .env.local file exists with:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to generate random score
function randomScore(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper function to generate random response time (3-25 minutes in seconds)
function randomResponseTime() {
  return randomScore(180, 1500); // 3-25 minutes
}

// Helper function to generate quality data
function generateQualityData() {
  const rand = Math.random();
  
  if (rand < 0.80) {
    // 80% normal data
    return {
      has_straight_lining: false,
      response_quality: 'normal'
    };
  } else if (rand < 0.90) {
    // 10% straight-lining
    return {
      has_straight_lining: true,
      response_quality: 'normal'
    };
  } else if (rand < 0.95) {
    // 5% too fast
    return {
      has_straight_lining: false,
      response_quality: 'too_fast'
    };
  } else {
    // 5% too slow
    return {
      has_straight_lining: false,
      response_quality: 'too_slow'
    };
  }
}

// Dummy participants with complete data
const dummyParticipants = [
  // Laki-laki (50 participants)
  { name: 'Ahmad Rizki', age: 16, gender: 'L', cognitive: 8, psychological: 68, social: 62, digit: 7 },
  { name: 'Budi Santoso', age: 17, gender: 'L', cognitive: 7, psychological: 64, social: 58, digit: 6 },
  { name: 'Candra Wijaya', age: 16, gender: 'L', cognitive: 9, psychological: 72, social: 66, digit: 8 },
  { name: 'Dedi Kurniawan', age: 15, gender: 'L', cognitive: 6, psychological: 58, social: 54, digit: 6 },
  { name: 'Eko Prasetyo', age: 17, gender: 'L', cognitive: 8, psychological: 70, social: 64, digit: 7 },
  { name: 'Fajar Ramadhan', age: 16, gender: 'L', cognitive: 7, psychological: 62, social: 60, digit: 6 },
  { name: 'Gilang Permana', age: 18, gender: 'L', cognitive: 9, psychological: 74, social: 68, digit: 8 },
  { name: 'Hendra Gunawan', age: 15, gender: 'L', cognitive: 6, psychological: 56, social: 52, digit: 5 },
  { name: 'Indra Kusuma', age: 17, gender: 'L', cognitive: 8, psychological: 66, social: 62, digit: 7 },
  { name: 'Joko Susilo', age: 16, gender: 'L', cognitive: 7, psychological: 64, social: 58, digit: 6 },
  { name: 'Krisna Ardianto', age: 17, gender: 'L', cognitive: 8, psychological: 68, social: 64, digit: 7 },
  { name: 'Lukman Hakim', age: 16, gender: 'L', cognitive: 9, psychological: 72, social: 66, digit: 8 },
  { name: 'Muhammad Irfan', age: 15, gender: 'L', cognitive: 7, psychological: 60, social: 56, digit: 6 },
  { name: 'Nur Hidayat', age: 17, gender: 'L', cognitive: 8, psychological: 70, social: 64, digit: 7 },
  { name: 'Omar Syahputra', age: 16, gender: 'L', cognitive: 7, psychological: 62, social: 60, digit: 6 },
  { name: 'Putra Pratama', age: 18, gender: 'L', cognitive: 9, psychological: 74, social: 68, digit: 8 },
  { name: 'Qori Ramadhan', age: 15, gender: 'L', cognitive: 6, psychological: 58, social: 54, digit: 5 },
  { name: 'Reza Firmansyah', age: 17, gender: 'L', cognitive: 8, psychological: 66, social: 62, digit: 7 },
  { name: 'Samsul Bahri', age: 16, gender: 'L', cognitive: 7, psychological: 64, social: 58, digit: 6 },
  { name: 'Taufik Hidayat', age: 17, gender: 'L', cognitive: 8, psychological: 68, social: 64, digit: 7 },
  { name: 'Umar Faruq', age: 16, gender: 'L', cognitive: 9, psychological: 72, social: 66, digit: 8 },
  { name: 'Vino Bastian', age: 15, gender: 'L', cognitive: 7, psychological: 60, social: 56, digit: 6 },
  { name: 'Wahyu Setiawan', age: 17, gender: 'L', cognitive: 8, psychological: 70, social: 64, digit: 7 },
  { name: 'Xavier Nugraha', age: 16, gender: 'L', cognitive: 7, psychological: 62, social: 60, digit: 6 },
  { name: 'Yusuf Ibrahim', age: 18, gender: 'L', cognitive: 9, psychological: 74, social: 68, digit: 8 },
  { name: 'Zaki Maulana', age: 15, gender: 'L', cognitive: 6, psychological: 58, social: 54, digit: 5 },
  { name: 'Aldi Taher', age: 17, gender: 'L', cognitive: 8, psychological: 66, social: 62, digit: 7 },
  { name: 'Bagas Wicaksono', age: 16, gender: 'L', cognitive: 7, psychological: 64, social: 58, digit: 6 },
  { name: 'Cahyo Nugroho', age: 17, gender: 'L', cognitive: 8, psychological: 68, social: 64, digit: 7 },
  { name: 'Dimas Pradipta', age: 16, gender: 'L', cognitive: 9, psychological: 72, social: 66, digit: 8 },
  { name: 'Farhan Maulana', age: 15, gender: 'L', cognitive: 7, psychological: 60, social: 56, digit: 6 },
  { name: 'Galih Permadi', age: 17, gender: 'L', cognitive: 8, psychological: 70, social: 64, digit: 7 },
  { name: 'Hanif Mahendra', age: 16, gender: 'L', cognitive: 7, psychological: 62, social: 60, digit: 6 },
  { name: 'Ilham Ramadhan', age: 18, gender: 'L', cognitive: 9, psychological: 74, social: 68, digit: 8 },
  { name: 'Johan Pratama', age: 15, gender: 'L', cognitive: 6, psychological: 58, social: 54, digit: 5 },
  { name: 'Kemal Pasha', age: 17, gender: 'L', cognitive: 8, psychological: 66, social: 62, digit: 7 },
  { name: 'Luthfi Hakim', age: 16, gender: 'L', cognitive: 7, psychological: 64, social: 58, digit: 6 },
  { name: 'Malik Akbar', age: 17, gender: 'L', cognitive: 8, psychological: 68, social: 64, digit: 7 },
  { name: 'Naufal Fikri', age: 16, gender: 'L', cognitive: 9, psychological: 72, social: 66, digit: 8 },
  { name: 'Raffi Ahmad', age: 15, gender: 'L', cognitive: 7, psychological: 60, social: 56, digit: 6 },
  { name: 'Satria Bima', age: 17, gender: 'L', cognitive: 8, psychological: 70, social: 64, digit: 7 },
  { name: 'Teguh Santoso', age: 16, gender: 'L', cognitive: 7, psychological: 62, social: 60, digit: 6 },
  { name: 'Ujang Maman', age: 18, gender: 'L', cognitive: 9, psychological: 74, social: 68, digit: 8 },
  { name: 'Vikri Septiawan', age: 15, gender: 'L', cognitive: 6, psychological: 58, social: 54, digit: 5 },
  { name: 'Wisnu Wardhana', age: 17, gender: 'L', cognitive: 8, psychological: 66, social: 62, digit: 7 },
  { name: 'Yoga Pratama', age: 16, gender: 'L', cognitive: 7, psychological: 64, social: 58, digit: 6 },
  { name: 'Zidan Zidane', age: 17, gender: 'L', cognitive: 8, psychological: 68, social: 64, digit: 7 },
  { name: 'Arief Budiman', age: 16, gender: 'L', cognitive: 9, psychological: 72, social: 66, digit: 8 },
  { name: 'Bobby Nasution', age: 15, gender: 'L', cognitive: 7, psychological: 60, social: 56, digit: 6 },
  { name: 'Chandra Liow', age: 17, gender: 'L', cognitive: 8, psychological: 70, social: 64, digit: 7 },

  // Perempuan (50 participants)
  { name: 'Aisha Putri', age: 16, gender: 'P', cognitive: 8, psychological: 70, social: 66, digit: 7 },
  { name: 'Bella Saphira', age: 17, gender: 'P', cognitive: 9, psychological: 74, social: 68, digit: 8 },
  { name: 'Citra Kirana', age: 16, gender: 'P', cognitive: 7, psychological: 66, social: 62, digit: 6 },
  { name: 'Dina Mariana', age: 15, gender: 'P', cognitive: 8, psychological: 68, social: 64, digit: 7 },
  { name: 'Elsa Frozen', age: 17, gender: 'P', cognitive: 9, psychological: 72, social: 68, digit: 8 },
  { name: 'Fitri Handayani', age: 16, gender: 'P', cognitive: 8, psychological: 70, social: 64, digit: 7 },
  { name: 'Gita Gutawa', age: 18, gender: 'P', cognitive: 9, psychological: 76, social: 70, digit: 8 },
  { name: 'Hana Hanifah', age: 15, gender: 'P', cognitive: 7, psychological: 64, social: 60, digit: 6 },
  { name: 'Intan Permata', age: 17, gender: 'P', cognitive: 8, psychological: 68, social: 66, digit: 7 },
  { name: 'Jessica Jane', age: 16, gender: 'P', cognitive: 9, psychological: 72, social: 68, digit: 8 },
  { name: 'Kiara Larasati', age: 17, gender: 'P', cognitive: 8, psychological: 70, social: 64, digit: 7 },
  { name: 'Luna Maya', age: 16, gender: 'P', cognitive: 7, psychological: 66, social: 62, digit: 6 },
  { name: 'Mawar Melati', age: 15, gender: 'P', cognitive: 8, psychological: 68, social: 64, digit: 7 },
  { name: 'Nina Zatulini', age: 17, gender: 'P', cognitive: 9, psychological: 72, social: 68, digit: 8 },
  { name: 'Olivia Jensen', age: 16, gender: 'P', cognitive: 8, psychological: 70, social: 64, digit: 7 },
  { name: 'Putri Marino', age: 18, gender: 'P', cognitive: 9, psychological: 76, social: 70, digit: 8 },
  { name: 'Queena Miendra', age: 15, gender: 'P', cognitive: 7, psychological: 64, social: 60, digit: 6 },
  { name: 'Rina Nose', age: 17, gender: 'P', cognitive: 8, psychological: 68, social: 66, digit: 7 },
  { name: 'Siti Badriah', age: 16, gender: 'P', cognitive: 9, psychological: 72, social: 68, digit: 8 },
  { name: 'Tara Basro', age: 17, gender: 'P', cognitive: 8, psychological: 70, social: 64, digit: 7 },
  { name: 'Ussy Sulistiawaty', age: 16, gender: 'P', cognitive: 7, psychological: 66, social: 62, digit: 6 },
  { name: 'Vanesha Prescilla', age: 15, gender: 'P', cognitive: 8, psychological: 68, social: 64, digit: 7 },
  { name: 'Wulan Guritno', age: 17, gender: 'P', cognitive: 9, psychological: 72, social: 68, digit: 8 },
  { name: 'Yuki Kato', age: 16, gender: 'P', cognitive: 8, psychological: 70, social: 64, digit: 7 },
  { name: 'Zara Adhisty', age: 18, gender: 'P', cognitive: 9, psychological: 76, social: 70, digit: 8 },
  { name: 'Annisa Pohan', age: 15, gender: 'P', cognitive: 7, psychological: 64, social: 60, digit: 6 },
  { name: 'Bunga Citra', age: 17, gender: 'P', cognitive: 8, psychological: 68, social: 66, digit: 7 },
  { name: 'Chelsea Islan', age: 16, gender: 'P', cognitive: 9, psychological: 72, social: 68, digit: 8 },
  { name: 'Dewi Sandra', age: 17, gender: 'P', cognitive: 8, psychological: 70, social: 64, digit: 7 },
  { name: 'Enzy Storia', age: 16, gender: 'P', cognitive: 7, psychological: 66, social: 62, digit: 6 },
  { name: 'Febby Rastanty', age: 15, gender: 'P', cognitive: 8, psychological: 68, social: 64, digit: 7 },
  { name: 'Gisella Anastasia', age: 17, gender: 'P', cognitive: 9, psychological: 72, social: 68, digit: 8 },
  { name: 'Hamidah Rachmayanti', age: 16, gender: 'P', cognitive: 8, psychological: 70, social: 64, digit: 7 },
  { name: 'Isyana Sarasvati', age: 18, gender: 'P', cognitive: 9, psychological: 76, social: 70, digit: 8 },
  { name: 'Jennifer Bachdim', age: 15, gender: 'P', cognitive: 7, psychological: 64, social: 60, digit: 6 },
  { name: 'Kirana Larasati', age: 17, gender: 'P', cognitive: 8, psychological: 68, social: 66, digit: 7 },
  { name: 'Lesti Kejora', age: 16, gender: 'P', cognitive: 9, psychological: 72, social: 68, digit: 8 },
  { name: 'Marsha Aruan', age: 17, gender: 'P', cognitive: 8, psychological: 70, social: 64, digit: 7 },
  { name: 'Nabila Syakieb', age: 16, gender: 'P', cognitive: 7, psychological: 66, social: 62, digit: 6 },
  { name: 'Raisa Andriana', age: 15, gender: 'P', cognitive: 8, psychological: 68, social: 64, digit: 7 },
  { name: 'Syahrini', age: 17, gender: 'P', cognitive: 9, psychological: 72, social: 68, digit: 8 },
  { name: 'Tasya Kamila', age: 16, gender: 'P', cognitive: 8, psychological: 70, social: 64, digit: 7 },
  { name: 'Via Vallen', age: 18, gender: 'P', cognitive: 9, psychological: 76, social: 70, digit: 8 },
  { name: 'Widya Saputra', age: 15, gender: 'P', cognitive: 7, psychological: 64, social: 60, digit: 6 },
  { name: 'Yura Yunita', age: 17, gender: 'P', cognitive: 8, psychological: 68, social: 66, digit: 7 },
  { name: 'Zaskia Gotik', age: 16, gender: 'P', cognitive: 9, psychological: 72, social: 68, digit: 8 },
  { name: 'Agnes Monica', age: 17, gender: 'P', cognitive: 8, psychological: 70, social: 64, digit: 7 },
  { name: 'Brisia Jodie', age: 16, gender: 'P', cognitive: 7, psychological: 66, social: 62, digit: 6 },
  { name: 'Cut Tari', age: 15, gender: 'P', cognitive: 8, psychological: 68, social: 64, digit: 7 },
  { name: 'Dian Sastro', age: 17, gender: 'P', cognitive: 9, psychological: 72, social: 68, digit: 8 }
];

async function seedData() {
  console.log('🚀 Starting to seed complete dummy data...\n');

  try {
    // Step 1: Delete all existing data
    console.log('🗑️  Step 1: Deleting existing data...');
    
    // Delete responses first (foreign key)
    const { error: deleteResponsesError } = await supabase
      .from('responses')
      .delete()
      .neq('id', 0); // Delete all
    
    if (deleteResponsesError) {
      console.error('Error deleting responses:', deleteResponsesError);
    } else {
      console.log('   ✅ Deleted all responses');
    }

    // Delete digit span results
    const { error: deleteDigitError } = await supabase
      .from('digit_span_results')
      .delete()
      .neq('id', 0);
    
    if (deleteDigitError) {
      console.error('Error deleting digit span results:', deleteDigitError);
    } else {
      console.log('   ✅ Deleted all digit span results');
    }

    // Delete participants
    const { error: deleteParticipantsError } = await supabase
      .from('participants')
      .delete()
      .neq('id', 0);
    
    if (deleteParticipantsError) {
      console.error('❌ Error deleting participants:', deleteParticipantsError);
      throw deleteParticipantsError;
    }
    
    console.log('   ✅ Deleted all participants\n');

    // Step 2: Insert new complete data
    console.log('📝 Step 2: Inserting new dummy data with all fields...');
    
    const participantsToInsert = dummyParticipants.map(p => {
      const quality = generateQualityData();
      const responseTime = randomResponseTime();
      
      return {
        name: p.name,
        age: p.age,
        gender: p.gender,
        cognitive_score: p.cognitive,
        psychological_score: p.psychological,
        social_score: p.social,
        digit_span_score: p.digit,
        response_time_seconds: responseTime,
        has_straight_lining: quality.has_straight_lining,
        response_quality: quality.response_quality
      };
    });

    const { data: insertedParticipants, error: insertError } = await supabase
      .from('participants')
      .insert(participantsToInsert)
      .select();

    if (insertError) {
      console.error('❌ Error inserting participants:', insertError);
      throw insertError;
    }

    console.log(`   ✅ Inserted ${insertedParticipants.length} participants\n`);

    // Step 3: Statistics
    console.log('📊 Step 3: Data Statistics:');
    
    const males = insertedParticipants.filter(p => p.gender === 'L');
    const females = insertedParticipants.filter(p => p.gender === 'P');
    const validQuality = insertedParticipants.filter(p => !p.has_straight_lining && p.response_quality === 'normal');
    const straightLining = insertedParticipants.filter(p => p.has_straight_lining);
    const tooFast = insertedParticipants.filter(p => p.response_quality === 'too_fast');
    const tooSlow = insertedParticipants.filter(p => p.response_quality === 'too_slow');

    console.log(`   👨 Laki-laki: ${males.length}`);
    console.log(`   👩 Perempuan: ${females.length}`);
    console.log(`   ✅ Valid Quality: ${validQuality.length} (${((validQuality.length / insertedParticipants.length) * 100).toFixed(1)}%)`);
    console.log(`   ⚠️  Straight-lining: ${straightLining.length} (${((straightLining.length / insertedParticipants.length) * 100).toFixed(1)}%)`);
    console.log(`   ⚡ Too Fast: ${tooFast.length} (${((tooFast.length / insertedParticipants.length) * 100).toFixed(1)}%)`);
    console.log(`   🐌 Too Slow: ${tooSlow.length} (${((tooSlow.length / insertedParticipants.length) * 100).toFixed(1)}%)`);

    console.log('\n✨ Seeding complete! All fields populated successfully.');
    console.log('\n📋 Next steps:');
    console.log('   1. Login to admin dashboard');
    console.log('   2. Check Analytics → Gender Analysis tab');
    console.log('   3. Test data filtering by gender, age, quality');
    console.log('   4. View quality indicators in Quality Data tab\n');

  } catch (error) {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  }
}

// Run the seed function
seedData();
