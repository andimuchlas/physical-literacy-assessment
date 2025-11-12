'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, Participant } from '@/lib/supabase';
import {
  getCognitiveCategory,
  getPsychologicalCategory,
  getSocialCategory,
  getDigitSpanCategory
} from '@/lib/scoring';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    avgCognitive: 0,
    avgPsychological: 0,
    avgSocial: 0,
    avgDigitSpan: 0,
  });

  useEffect(() => {
    checkAuth();
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push('/admin/login');
      return;
    }

    // Check if user has admin role
    const { data: { user } } = await supabase.auth.getUser();
    const userRole = user?.user_metadata?.role;
    
    if (userRole !== 'admin') {
      await supabase.auth.signOut();
      router.push('/admin/login');
      return;
    }
  };

  const loadData = async () => {
    try {
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setParticipants(data || []);

      // Calculate statistics
      if (data && data.length > 0) {
        const total = data.length;
        const avgCog = data.reduce((sum, p) => sum + p.cognitive_score, 0) / total;
        const avgPsy = data.reduce((sum, p) => sum + p.psychological_score, 0) / total;
        const avgSoc = data.reduce((sum, p) => sum + p.social_score, 0) / total;
        const avgDig = data.reduce((sum, p) => sum + p.digit_span_score, 0) / total;

        setStats({
          total,
          avgCognitive: Math.round(avgCog * 10) / 10,
          avgPsychological: Math.round(avgPsy * 10) / 10,
          avgSocial: Math.round(avgSoc * 10) / 10,
          avgDigitSpan: Math.round(avgDig * 10) / 10,
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  const handleEdit = (participant: Participant) => {
    setEditingParticipant(participant);
    setShowEditModal(true);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Yakin ingin menghapus data ${name}?`)) return;

    try {
      // Delete responses first (foreign key constraint)
      await supabase.from('responses').delete().eq('participant_id', id);
      
      // Delete digit span results
      await supabase.from('digit_span_results').delete().eq('participant_id', id);
      
      // Delete participant
      const { error } = await supabase
        .from('participants')
        .delete()
        .eq('id', id);

      if (error) throw error;

      alert('Data berhasil dihapus!');
      loadData(); // Reload data
    } catch (error) {
      console.error('Error deleting participant:', error);
      alert('Gagal menghapus data');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingParticipant) return;

    try {
      const { error } = await supabase
        .from('participants')
        .update({
          name: editingParticipant.name,
          age: editingParticipant.age,
          cognitive_score: editingParticipant.cognitive_score,
          psychological_score: editingParticipant.psychological_score,
          social_score: editingParticipant.social_score,
          digit_span_score: editingParticipant.digit_span_score
        })
        .eq('id', editingParticipant.id);

      if (error) throw error;

      alert('Data berhasil diupdate!');
      setShowEditModal(false);
      setEditingParticipant(null);
      loadData(); // Reload data
    } catch (error) {
      console.error('Error updating participant:', error);
      alert('Gagal mengupdate data');
    }
  };

  const exportToCSV = () => {
    if (participants.length === 0) return;

    const headers = ['ID', 'Nama', 'Umur', 'Kognitif', 'Psikologis', 'Sosial', 'Digit Span', 'Tanggal'];
    const rows = participants.map(p => [
      p.id,
      p.name,
      p.age,
      p.cognitive_score,
      p.psychological_score,
      p.social_score,
      p.digit_span_score,
      new Date(p.created_at).toLocaleDateString('id-ID')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `assessment-data-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const getCategoryBadge = (score: number, type: 'cognitive' | 'psychological' | 'social' | 'digitSpan') => {
    let category;
    switch (type) {
      case 'cognitive':
        category = getCognitiveCategory(score);
        break;
      case 'psychological':
        category = getPsychologicalCategory(score);
        break;
      case 'social':
        category = getSocialCategory(score);
        break;
      case 'digitSpan':
        category = getDigitSpanCategory(score);
        break;
    }

    const colorClass = category.color === 'red' ? 'bg-red-100 text-red-700' :
                       category.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                       'bg-green-100 text-green-700';

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
        {category.category}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-2 border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              📊 Dashboard Admin
            </h1>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Link
                href="/admin/questions"
                className="bg-green-600 hover:bg-green-700 text-white font-bold px-5 py-2.5 rounded-xl transition shadow-md hover:shadow-lg text-center"
              >
                📝 Kelola Pertanyaan
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-xl transition shadow-md hover:shadow-lg"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl shadow-lg p-4 sm:p-6 border-2 border-blue-400">
            <div className="text-xs sm:text-sm font-semibold opacity-90 mb-2">Total Peserta</div>
            <div className="text-3xl sm:text-4xl font-bold">{stats.total}</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl shadow-lg p-4 sm:p-6 border-2 border-purple-400">
            <div className="text-xs sm:text-sm font-semibold opacity-90 mb-2">Rata-rata Kognitif</div>
            <div className="text-3xl sm:text-4xl font-bold">{stats.avgCognitive}</div>
            <div className="text-xs font-medium opacity-80 mt-1">dari 10</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl shadow-lg p-4 sm:p-6 border-2 border-green-400">
            <div className="text-xs sm:text-sm font-semibold opacity-90 mb-2">Rata-rata Psikologis</div>
            <div className="text-3xl sm:text-4xl font-bold">{stats.avgPsychological}</div>
            <div className="text-xs font-medium opacity-80 mt-1">dari 80</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl shadow-lg p-4 sm:p-6 border-2 border-orange-400">
            <div className="text-xs sm:text-sm font-semibold opacity-90 mb-2">Rata-rata Sosial</div>
            <div className="text-3xl sm:text-4xl font-bold">{stats.avgSocial}</div>
            <div className="text-xs font-medium opacity-80 mt-1">dari 80</div>
          </div>
          <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-2xl shadow-lg p-4 sm:p-6 border-2 border-pink-400">
            <div className="text-xs sm:text-sm font-semibold opacity-90 mb-2">Rata-rata Digit Span</div>
            <div className="text-3xl sm:text-4xl font-bold">{stats.avgDigitSpan}</div>
            <div className="text-xs font-medium opacity-80 mt-1">digit</div>
          </div>
        </div>

        {/* Simple Bar Chart Visualization */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Perbandingan Rata-rata Skor</h2>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">Kognitif</span>
                <span className="text-gray-600">{stats.avgCognitive} / 10</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-purple-600 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${(stats.avgCognitive / 10) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">Psikologis</span>
                <span className="text-gray-600">{stats.avgPsychological} / 80</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-green-600 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${(stats.avgPsychological / 80) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">Sosial</span>
                <span className="text-gray-600">{stats.avgSocial} / 80</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-orange-600 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${(stats.avgSocial / 80) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">Digit Span (target: 7)</span>
                <span className="text-gray-600">{stats.avgDigitSpan} / 7+</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-pink-600 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((stats.avgDigitSpan / 10) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-gray-200">
          <div className="bg-gradient-to-r from-gray-700 to-gray-900 text-white p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl sm:text-2xl font-bold">📋 Data Peserta</h2>
              <button
                onClick={exportToCSV}
                className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl transition shadow-md hover:shadow-lg text-sm sm:text-base w-full sm:w-auto"
              >
                📥 Export CSV
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y-2 divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                    Nama
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                    Umur
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                    Kognitif
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                    Psikologis
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                    Sosial
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                    Digit Span
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y-2 divide-gray-100">
                {participants.map((participant) => (
                  <tr key={participant.id} className="hover:bg-blue-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{participant.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-800">{participant.age} tahun</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900 mb-1">
                        {participant.cognitive_score}/10
                      </div>
                      {getCategoryBadge(participant.cognitive_score, 'cognitive')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900 mb-1">
                        {participant.psychological_score}/80
                      </div>
                      {getCategoryBadge(participant.psychological_score, 'psychological')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900 mb-1">
                        {participant.social_score}/80
                      </div>
                      {getCategoryBadge(participant.social_score, 'social')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900 mb-1">
                        {participant.digit_span_score}
                      </div>
                      {getCategoryBadge(participant.digit_span_score, 'digitSpan')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(participant.created_at).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(participant)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-3 py-1.5 rounded-lg text-sm transition shadow-md hover:shadow-lg"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(participant.id, participant.name)}
                          className="bg-red-500 hover:bg-red-600 text-white font-bold px-3 py-1.5 rounded-lg text-sm transition shadow-md hover:shadow-lg"
                        >
                          🗑️ Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {participants.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                Belum ada data peserta
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      {showEditModal && editingParticipant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">✏️ Edit Data Peserta</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingParticipant(null);
                  }}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={editingParticipant.name}
                  onChange={(e) => setEditingParticipant({...editingParticipant, name: e.target.value})}
                  className="w-full px-4 py-3 bg-white text-gray-900 font-medium border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Umur
                </label>
                <input
                  type="number"
                  value={editingParticipant.age}
                  onChange={(e) => setEditingParticipant({...editingParticipant, age: parseInt(e.target.value)})}
                  className="w-full px-4 py-3 bg-white text-gray-900 font-medium border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  min="5"
                  max="20"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    Score Kognitif (0-10)
                  </label>
                  <input
                    type="number"
                    value={editingParticipant.cognitive_score}
                    onChange={(e) => setEditingParticipant({...editingParticipant, cognitive_score: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 bg-white text-gray-900 font-medium border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    min="0"
                    max="10"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    Score Psikologis (0-80)
                  </label>
                  <input
                    type="number"
                    value={editingParticipant.psychological_score}
                    onChange={(e) => setEditingParticipant({...editingParticipant, psychological_score: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 bg-white text-gray-900 font-medium border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    min="0"
                    max="80"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    Score Sosial (0-80)
                  </label>
                  <input
                    type="number"
                    value={editingParticipant.social_score}
                    onChange={(e) => setEditingParticipant({...editingParticipant, social_score: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 bg-white text-gray-900 font-medium border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    min="0"
                    max="80"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    Score Digit Span
                  </label>
                  <input
                    type="number"
                    value={editingParticipant.digit_span_score}
                    onChange={(e) => setEditingParticipant({...editingParticipant, digit_span_score: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 bg-white text-gray-900 font-medium border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    min="0"
                    max="20"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-6 py-3 rounded-xl transition shadow-lg"
                >
                  ✓ Simpan Perubahan
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingParticipant(null);
                  }}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl transition"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
