// Script untuk hapus data duplikat berdasarkan nama dan created_at
// Jalankan dengan: node scripts/remove-duplicates.js

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://veponmabdoxmrlonpour.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlcG9ubWFiZG94bXJsb25wb3VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MTcyMzIsImV4cCI6MjA3ODQ5MzIzMn0.PJLNvmM-h9_owUdQC7Vj3MAIjUnGI8kHhN155BbT418';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function removeDuplicates() {
  try {
    console.log('🔍 Mencari data duplikat...\n');

    // Get all participants
    const { data: participants, error } = await supabase
      .from('participants')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;

    console.log(`📊 Total data: ${participants.length}`);

    // Group by name to find duplicates
    const grouped = {};
    participants.forEach(p => {
      if (!grouped[p.name]) {
        grouped[p.name] = [];
      }
      grouped[p.name].push(p);
    });

    // Find duplicates
    const duplicates = Object.entries(grouped).filter(([name, records]) => records.length > 1);

    if (duplicates.length === 0) {
      console.log('✅ Tidak ada data duplikat!\n');
      return;
    }

    console.log(`⚠️ Ditemukan ${duplicates.length} nama yang duplikat:\n`);

    let totalDeleted = 0;

    // For each duplicate, keep the first one and delete the rest
    for (const [name, records] of duplicates) {
      console.log(`\n📝 ${name}: ${records.length} record`);
      
      // Sort by created_at to keep the oldest
      records.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      
      // Keep first, delete rest
      const toKeep = records[0];
      const toDelete = records.slice(1);

      console.log(`   ✓ Akan dipertahankan: ID ${toKeep.id} (${new Date(toKeep.created_at).toLocaleString('id-ID')})`);
      
      for (const record of toDelete) {
        console.log(`   ✗ Akan dihapus: ID ${record.id} (${new Date(record.created_at).toLocaleString('id-ID')})`);
        
        // Delete responses
        await supabase.from('responses').delete().eq('participant_id', record.id);
        
        // Delete digit span results
        await supabase.from('digit_span_results').delete().eq('participant_id', record.id);
        
        // Delete participant
        const { error: deleteError } = await supabase
          .from('participants')
          .delete()
          .eq('id', record.id);

        if (deleteError) {
          console.error(`   ❌ Error menghapus ID ${record.id}:`, deleteError.message);
        } else {
          totalDeleted++;
        }
      }
    }

    console.log(`\n\n🎉 Selesai! Total ${totalDeleted} data duplikat berhasil dihapus`);
    console.log(`📊 Sisa data: ${participants.length - totalDeleted}\n`);

  } catch (error) {
    console.error('💥 Error:', error.message);
    process.exit(1);
  }
}

removeDuplicates();
