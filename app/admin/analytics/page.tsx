'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { calculateDescriptiveStats, generateSampleCharacteristics, detectStraightLining, analyzeResponseTime } from '@/lib/export-utils';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

// Custom Tooltip dengan kontras warna lebih baik
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-xl border-2 border-slate-300">
        <p className="font-bold text-slate-900 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="font-semibold" style={{ 
            color: entry.dataKey === 'Laki-laki' ? '#1e40af' : '#be185d' // Dark blue & dark pink
          }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

interface ParticipantData {
  id: number;
  name: string;
  age: number;
  gender?: string;
  cognitive_score: number;
  psychological_score: number;
  social_score: number;
  digit_span_score: number;
  response_time_seconds?: number;
  has_straight_lining?: boolean;
  response_quality?: string;
  created_at: string;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState<ParticipantData[]>([]);
  const [selectedTab, setSelectedTab] = useState<'descriptive' | 'quality' | 'gender' | 'individual'>('descriptive');
  
  // State for Individual Responses tab
  const [selectedParticipantId, setSelectedParticipantId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [responses, setResponses] = useState<any[]>([]);

  useEffect(() => {
    checkAuth();
    fetchData();
    fetchQuestions();
  }, []);

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/admin/login');
    }
  }

  async function fetchData() {
    try {
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setParticipants(data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchQuestions() {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  }

  async function fetchResponses(participantId: number) {
    try {
      const { data, error } = await supabase
        .from('responses')
        .select('*')
        .eq('participant_id', participantId)
        .order('question_id', { ascending: true });

      if (error) throw error;
      setResponses(data || []);
    } catch (error) {
      console.error('Error fetching responses:', error);
    }
  }

  async function downloadAllResponsesCSV() {
    try {
      // Fetch all data
      const { data: allResponses, error: respError } = await supabase
        .from('responses')
        .select('*')
        .order('participant_id', { ascending: true });

      if (respError) throw respError;

      // Create CSV header
      let csv = 'Participant_ID,Participant_Name,Age,Gender,Question_ID,Question_Number,Domain,Question_Text,Answer_Value,Answer_Label\n';

      // Process each response
      for (const resp of allResponses || []) {
        const participant = participants.find(p => p.id === resp.participant_id);
        const question = questions.find(q => q.id === resp.question_id);
        
        if (!participant || !question) continue;

        const domain = question.domain;
        const questionNumber = question.id;
        
        // Determine answer label based on question type
        let answerLabel = '';
        if (question.question_type === 'multiple_choice') {
          try {
            const options = typeof question.options === 'string' ? JSON.parse(question.options) : (question.options || []);
            answerLabel = options[resp.answer_value] || `Option ${resp.answer_value}`;
          } catch (e) {
            answerLabel = `Option ${resp.answer_value}`;
          }
        } else {
          // Likert scale
          const likertLabels = ['Sangat Tidak Setuju', 'Tidak Setuju', 'Netral', 'Setuju', 'Sangat Setuju'];
          answerLabel = likertLabels[resp.answer_value] || resp.answer_value.toString();
        }

        // Escape CSV fields
        const escapeCsv = (str: string) => `"${str.replace(/"/g, '""')}"`;
        
        csv += `${resp.participant_id},${escapeCsv(participant.name)},${participant.age},${participant.gender || 'N/A'},${resp.question_id},Q${questionNumber},${domain},${escapeCsv(question.question_text)},${resp.answer_value},${escapeCsv(answerLabel)}\n`;
      }

      // Download CSV
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `all_responses_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert('✅ Data berhasil didownload!');
    } catch (error) {
      console.error('Error downloading CSV:', error);
      alert('❌ Gagal mendownload data. Cek console untuk detail.');
    }
  }

  const cogScores = participants.map(p => p.cognitive_score);
  const psyScores = participants.map(p => p.psychological_score);
  const socScores = participants.map(p => p.social_score);
  const digScores = participants.map(p => p.digit_span_score);

  const cogStats = calculateDescriptiveStats(cogScores);
  const psyStats = calculateDescriptiveStats(psyScores);
  const socStats = calculateDescriptiveStats(socScores);
  const digStats = calculateDescriptiveStats(digScores);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Memuat data analitik...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Analitik Penelitian</h1>
            <p className="text-blue-200">Analisis Statistik & Kualitas Data</p>
          </div>
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            ← Kembali ke Dashboard
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedTab('descriptive')}
            className={`px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap ${
              selectedTab === 'descriptive'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            📊 Statistik Deskriptif
          </button>
          <button
            onClick={() => setSelectedTab('gender')}
            className={`px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap ${
              selectedTab === 'gender'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            👤 Analisis Gender
          </button>
          <button
            onClick={() => setSelectedTab('quality')}
            className={`px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap ${
              selectedTab === 'quality'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            🔍 Kualitas Data
          </button>
          <button
            onClick={() => setSelectedTab('individual')}
            className={`px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap ${
              selectedTab === 'individual'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            📝 Detail Jawaban Individual
          </button>
        </div>

        {/* Descriptive Statistics Tab */}
        {selectedTab === 'descriptive' && (
          <div className="space-y-6">
            {/* Sample Overview */}
            <div className="bg-white rounded-xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Karakteristik Sampel</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                  <div className="text-blue-600 font-semibold mb-1">Total Partisipan</div>
                  <div className="text-4xl font-bold text-blue-900">{participants.length}</div>
                </div>
                <div className="bg-teal-50 p-4 rounded-lg border-2 border-teal-200">
                  <div className="text-teal-600 font-semibold mb-1">Rentang Usia</div>
                  <div className="text-4xl font-bold text-teal-900">
                    {Math.min(...participants.map(p => p.age))} - {Math.max(...participants.map(p => p.age))}
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
                  <div className="text-purple-600 font-semibold mb-1">Rata-rata Usia</div>
                  <div className="text-4xl font-bold text-purple-900">
                    {(participants.reduce((sum, p) => sum + p.age, 0) / participants.length).toFixed(1)}
                  </div>
                </div>
              </div>
            </div>

            {/* Domain Statistics */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Cognitive Domain */}
              <div className="bg-white rounded-xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">🧠</span> Cognitive Domain
                </h3>
                {cogStats && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="font-semibold text-slate-700">Rata-rata (M)</span>
                      <span className="text-xl font-bold text-slate-900">{cogStats.mean}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="font-semibold text-slate-700">Simpangan Baku (SD)</span>
                      <span className="text-xl font-bold text-slate-900">{cogStats.sd}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="font-semibold text-slate-700">Rentang</span>
                      <span className="text-xl font-bold text-slate-900">{cogStats.min} - {cogStats.max}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="font-semibold text-slate-700">Median</span>
                      <span className="text-xl font-bold text-slate-900">{cogStats.median}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <span className="font-semibold text-blue-700">Skor Maksimal</span>
                      <span className="text-xl font-bold text-blue-900">10</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Psychological Domain */}
              <div className="bg-white rounded-xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">💭</span> Psychological Domain
                </h3>
                {psyStats && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="font-semibold text-slate-700">Rata-rata (M)</span>
                      <span className="text-xl font-bold text-slate-900">{psyStats.mean}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="font-semibold text-slate-700">Simpangan Baku (SD)</span>
                      <span className="text-xl font-bold text-slate-900">{psyStats.sd}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="font-semibold text-slate-700">Rentang</span>
                      <span className="text-xl font-bold text-slate-900">{psyStats.min} - {psyStats.max}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="font-semibold text-slate-700">Median</span>
                      <span className="text-xl font-bold text-slate-900">{psyStats.median}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <span className="font-semibold text-purple-700">Skor Maksimal</span>
                      <span className="text-xl font-bold text-purple-900">80</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Social Domain */}
              <div className="bg-white rounded-xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">👥</span> Social Domain
                </h3>
                {socStats && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="font-semibold text-slate-700">Rata-rata (M)</span>
                      <span className="text-xl font-bold text-slate-900">{socStats.mean}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="font-semibold text-slate-700">Simpangan Baku (SD)</span>
                      <span className="text-xl font-bold text-slate-900">{socStats.sd}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="font-semibold text-slate-700">Rentang</span>
                      <span className="text-xl font-bold text-slate-900">{socStats.min} - {socStats.max}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="font-semibold text-slate-700">Median</span>
                      <span className="text-xl font-bold text-slate-900">{socStats.median}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                      <span className="font-semibold text-green-700">Skor Maksimal</span>
                      <span className="text-xl font-bold text-green-900">80</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Digit Span */}
              <div className="bg-white rounded-xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">🔢</span> Memori Kerja (Digit Span)
                </h3>
                {digStats && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="font-semibold text-slate-700">Rata-rata (M)</span>
                      <span className="text-xl font-bold text-slate-900">{digStats.mean}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="font-semibold text-slate-700">Simpangan Baku (SD)</span>
                      <span className="text-xl font-bold text-slate-900">{digStats.sd}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="font-semibold text-slate-700">Rentang</span>
                      <span className="text-xl font-bold text-slate-900">{digStats.min} - {digStats.max}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="font-semibold text-slate-700">Median</span>
                      <span className="text-xl font-bold text-slate-900">{digStats.median}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-pink-50 rounded-lg border border-pink-200">
                      <span className="font-semibold text-pink-700">Rentang Umum</span>
                      <span className="text-xl font-bold text-pink-900">5-9 digit</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* APA Format Output */}
            <div className="bg-white rounded-xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-4">📄 Statistik Siap Publikasi (Format APA)</h3>
              <div className="bg-slate-50 p-4 rounded-lg font-mono text-sm">
                <p className="mb-3 text-slate-800">
                  <strong>Sampel:</strong> N = {participants.length}
                </p>
                <p className="mb-3 text-slate-800">
                  <strong>Domain Kognitif:</strong> M = {cogStats?.mean}, SD = {cogStats?.sd}, Rentang = {cogStats?.min}-{cogStats?.max}
                </p>
                <p className="mb-3 text-slate-800">
                  <strong>Domain Psikologis:</strong> M = {psyStats?.mean}, SD = {psyStats?.sd}, Rentang = {psyStats?.min}-{psyStats?.max}
                </p>
                <p className="mb-3 text-slate-800">
                  <strong>Domain Sosial:</strong> M = {socStats?.mean}, SD = {socStats?.sd}, Rentang = {socStats?.min}-{socStats?.max}
                </p>
                <p className="text-slate-800">
                  <strong>Digit Span:</strong> M = {digStats?.mean}, SD = {digStats?.sd}, Rentang = {digStats?.min}-{digStats?.max}
                </p>
              </div>
              <button
                onClick={() => {
                  const text = `Sampel: N = ${participants.length}\nKognitif: M = ${cogStats?.mean}, SD = ${cogStats?.sd}\nPsikologis: M = ${psyStats?.mean}, SD = ${psyStats?.sd}\nSosial: M = ${socStats?.mean}, SD = ${socStats?.sd}\nDigit Span: M = ${digStats?.mean}, SD = ${digStats?.sd}`;
                  navigator.clipboard.writeText(text);
                  alert('Disalin ke clipboard!');
                }}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
              >
                📋 Salin ke Clipboard
              </button>
            </div>
          </div>
        )}

        {/* Gender Analysis Tab */}
        {selectedTab === 'gender' && (
          <div className="space-y-6">
            {/* Gender Distribution */}
            <div className="bg-white rounded-xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">👤 Distribusi Berdasarkan Gender</h2>
              
              {(() => {
                const maleCount = participants.filter(p => p.gender === 'L').length;
                const femaleCount = participants.filter(p => p.gender === 'P').length;
                const unknownCount = participants.filter(p => !p.gender || (p.gender !== 'L' && p.gender !== 'P')).length;
                
                if (maleCount === 0 && femaleCount === 0) {
                  return (
                    <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 text-center">
                      <p className="text-yellow-900 font-semibold">
                        ⚠️ Belum ada data gender yang tersimpan. Pastikan field gender sudah diisi saat assessment.
                      </p>
                    </div>
                  );
                }

                return (
                  <>
                    <div className="grid md:grid-cols-3 gap-6 mb-6">
                      <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-bold text-blue-900">👨 Laki-laki</h3>
                          <span className="text-4xl font-bold text-blue-600">{maleCount}</span>
                        </div>
                        <p className="text-blue-700 text-sm">
                          {participants.length > 0 ? ((maleCount / participants.length) * 100).toFixed(1) : 0}% dari total
                        </p>
                      </div>

                      <div className="bg-pink-50 p-6 rounded-lg border-2 border-pink-200">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-bold text-pink-900">👩 Perempuan</h3>
                          <span className="text-4xl font-bold text-pink-600">{femaleCount}</span>
                        </div>
                        <p className="text-pink-700 text-sm">
                          {participants.length > 0 ? ((femaleCount / participants.length) * 100).toFixed(1) : 0}% dari total
                        </p>
                      </div>

                      <div className="bg-slate-50 p-6 rounded-lg border-2 border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-bold text-slate-900">❓ Tidak Diketahui</h3>
                          <span className="text-4xl font-bold text-slate-600">{unknownCount}</span>
                        </div>
                        <p className="text-slate-700 text-sm">
                          {participants.length > 0 ? ((unknownCount / participants.length) * 100).toFixed(1) : 0}% dari total
                        </p>
                      </div>
                    </div>

                    {/* Chart */}
                    <div className="bg-slate-50 p-6 rounded-lg">
                      <h3 className="text-lg font-bold text-slate-900 mb-4">Visualisasi Distribusi Gender</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={[
                          { name: 'Laki-laki', value: maleCount, fill: '#3b82f6' },
                          { name: 'Perempuan', value: femaleCount, fill: '#ec4899' },
                          ...(unknownCount > 0 ? [{ name: 'Tidak Diketahui', value: unknownCount, fill: '#64748b' }] : [])
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                            {[
                              { name: 'Laki-laki', value: maleCount, fill: '#3b82f6' },
                              { name: 'Perempuan', value: femaleCount, fill: '#ec4899' },
                              ...(unknownCount > 0 ? [{ name: 'Tidak Diketahui', value: unknownCount, fill: '#64748b' }] : [])
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Gender Comparison by Domain */}
            {(() => {
              const males = participants.filter(p => p.gender === 'L');
              const females = participants.filter(p => p.gender === 'P');

              if (males.length === 0 || females.length === 0) {
                return null;
              }

              const maleStats = {
                cognitive: calculateDescriptiveStats(males.map(p => p.cognitive_score)),
                psychological: calculateDescriptiveStats(males.map(p => p.psychological_score)),
                social: calculateDescriptiveStats(males.map(p => p.social_score)),
                digitSpan: calculateDescriptiveStats(males.map(p => p.digit_span_score))
              };

              const femaleStats = {
                cognitive: calculateDescriptiveStats(females.map(p => p.cognitive_score)),
                psychological: calculateDescriptiveStats(females.map(p => p.psychological_score)),
                social: calculateDescriptiveStats(females.map(p => p.social_score)),
                digitSpan: calculateDescriptiveStats(females.map(p => p.digit_span_score))
              };

              const comparisonData = [
                {
                  domain: 'Kognitif',
                  'Laki-laki': Number(maleStats.cognitive?.mean) || 0,
                  'Perempuan': Number(femaleStats.cognitive?.mean) || 0,
                  maxScore: 10
                },
                {
                  domain: 'Psikologis',
                  'Laki-laki': Number(maleStats.psychological?.mean) || 0,
                  'Perempuan': Number(femaleStats.psychological?.mean) || 0,
                  maxScore: 80
                },
                {
                  domain: 'Sosial',
                  'Laki-laki': Number(maleStats.social?.mean) || 0,
                  'Perempuan': Number(femaleStats.social?.mean) || 0,
                  maxScore: 80
                },
                {
                  domain: 'Digit Span',
                  'Laki-laki': Number(maleStats.digitSpan?.mean) || 0,
                  'Perempuan': Number(femaleStats.digitSpan?.mean) || 0,
                  maxScore: 15
                }
              ];

              return (
                <div className="bg-white rounded-xl shadow-xl p-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">📊 Perbandingan Skor Berdasarkan Gender</h2>
                  
                  {/* Chart */}
                  <div className="bg-slate-50 p-6 rounded-lg mb-6">
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={comparisonData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="domain" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="Laki-laki" fill="#3b82f6" radius={[10, 10, 0, 0]} />
                        <Bar dataKey="Perempuan" fill="#ec4899" radius={[10, 10, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Detailed Comparison Table */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Male Stats */}
                    <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
                      <h3 className="text-xl font-bold text-blue-900 mb-4">👨 Laki-laki (N = {males.length})</h3>
                      <div className="space-y-3">
                        <div className="bg-white p-3 rounded-lg">
                          <div className="text-sm text-blue-700 font-semibold">Domain Kognitif</div>
                          <div className="text-2xl font-bold text-blue-900">M = {maleStats.cognitive?.mean}, SD = {maleStats.cognitive?.sd}</div>
                        </div>
                        <div className="bg-white p-3 rounded-lg">
                          <div className="text-sm text-blue-700 font-semibold">Domain Psikologis</div>
                          <div className="text-2xl font-bold text-blue-900">M = {maleStats.psychological?.mean}, SD = {maleStats.psychological?.sd}</div>
                        </div>
                        <div className="bg-white p-3 rounded-lg">
                          <div className="text-sm text-blue-700 font-semibold">Domain Sosial</div>
                          <div className="text-2xl font-bold text-blue-900">M = {maleStats.social?.mean}, SD = {maleStats.social?.sd}</div>
                        </div>
                        <div className="bg-white p-3 rounded-lg">
                          <div className="text-sm text-blue-700 font-semibold">Digit Span</div>
                          <div className="text-2xl font-bold text-blue-900">M = {maleStats.digitSpan?.mean}, SD = {maleStats.digitSpan?.sd}</div>
                        </div>
                      </div>
                    </div>

                    {/* Female Stats */}
                    <div className="bg-pink-50 p-6 rounded-lg border-2 border-pink-200">
                      <h3 className="text-xl font-bold text-pink-900 mb-4">👩 Perempuan (N = {females.length})</h3>
                      <div className="space-y-3">
                        <div className="bg-white p-3 rounded-lg">
                          <div className="text-sm text-pink-700 font-semibold">Domain Kognitif</div>
                          <div className="text-2xl font-bold text-pink-900">M = {femaleStats.cognitive?.mean}, SD = {femaleStats.cognitive?.sd}</div>
                        </div>
                        <div className="bg-white p-3 rounded-lg">
                          <div className="text-sm text-pink-700 font-semibold">Domain Psikologis</div>
                          <div className="text-2xl font-bold text-pink-900">M = {femaleStats.psychological?.mean}, SD = {femaleStats.psychological?.sd}</div>
                        </div>
                        <div className="bg-white p-3 rounded-lg">
                          <div className="text-sm text-pink-700 font-semibold">Domain Sosial</div>
                          <div className="text-2xl font-bold text-pink-900">M = {femaleStats.social?.mean}, SD = {femaleStats.social?.sd}</div>
                        </div>
                        <div className="bg-white p-3 rounded-lg">
                          <div className="text-sm text-pink-700 font-semibold">Digit Span</div>
                          <div className="text-2xl font-bold text-pink-900">M = {femaleStats.digitSpan?.mean}, SD = {femaleStats.digitSpan?.sd}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* APA Format for Gender Comparison */}
                  <div className="mt-6 bg-slate-100 p-4 rounded-lg">
                    <h4 className="font-bold text-slate-900 mb-2">📄 Format Publikasi (APA Style)</h4>
                    <div className="bg-white p-4 rounded font-mono text-sm text-slate-800 space-y-2">
                      <p><strong>Laki-laki (n = {males.length}):</strong></p>
                      <p>Kognitif: M = {maleStats.cognitive?.mean}, SD = {maleStats.cognitive?.sd}</p>
                      <p>Psikologis: M = {maleStats.psychological?.mean}, SD = {maleStats.psychological?.sd}</p>
                      <p>Sosial: M = {maleStats.social?.mean}, SD = {maleStats.social?.sd}</p>
                      <p className="mt-3"><strong>Perempuan (n = {females.length}):</strong></p>
                      <p>Kognitif: M = {femaleStats.cognitive?.mean}, SD = {femaleStats.cognitive?.sd}</p>
                      <p>Psikologis: M = {femaleStats.psychological?.mean}, SD = {femaleStats.psychological?.sd}</p>
                      <p>Sosial: M = {femaleStats.social?.mean}, SD = {femaleStats.social?.sd}</p>
                    </div>
                    <button
                      onClick={() => {
                        const text = `Laki-laki (n = ${males.length}):\nKognitif: M = ${maleStats.cognitive?.mean}, SD = ${maleStats.cognitive?.sd}\nPsikologis: M = ${maleStats.psychological?.mean}, SD = ${maleStats.psychological?.sd}\nSosial: M = ${maleStats.social?.mean}, SD = ${maleStats.social?.sd}\n\nPerempuan (n = ${females.length}):\nKognitif: M = ${femaleStats.cognitive?.mean}, SD = ${femaleStats.cognitive?.sd}\nPsikologis: M = ${femaleStats.psychological?.mean}, SD = ${femaleStats.psychological?.sd}\nSosial: M = ${femaleStats.social?.mean}, SD = ${femaleStats.social?.sd}`;
                        navigator.clipboard.writeText(text);
                        alert('Statistik gender disalin ke clipboard!');
                      }}
                      className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition"
                    >
                      📋 Salin Statistik Gender
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Data Quality Tab */}
        {selectedTab === 'quality' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">🔍 Gambaran Kualitas Data</h2>
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-6">
                <p className="text-blue-900 font-semibold">
                  💡 Pemeriksaan kualitas membantu mengidentifikasi respons yang berpotensi bermasalah dan perlu ditinjau
                </p>
              </div>
              
              {/* Quality Summary */}
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-green-900">✅ Data Valid</h3>
                    <span className="text-3xl font-bold text-green-600">
                      {participants.filter(p => !p.has_straight_lining && p.response_quality === 'normal').length}
                    </span>
                  </div>
                  <p className="text-green-700 text-sm">Respons berkualitas baik</p>
                </div>

                <div className="bg-yellow-50 p-6 rounded-lg border-2 border-yellow-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-yellow-900">⚠️ Perlu Ditinjau</h3>
                    <span className="text-3xl font-bold text-yellow-600">
                      {participants.filter(p => 
                        p.has_straight_lining || 
                        p.response_quality === 'too_fast' || 
                        p.response_quality === 'too_slow'
                      ).length}
                    </span>
                  </div>
                  <p className="text-yellow-700 text-sm">Data dengan indikator kualitas rendah</p>
                </div>

                <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-blue-900">📊 Total Data</h3>
                    <span className="text-3xl font-bold text-blue-600">{participants.length}</span>
                  </div>
                  <p className="text-blue-700 text-sm">Semua partisipan terdaftar</p>
                </div>
              </div>

              {/* Straight-lining Detection */}
              <div className="bg-red-50 p-6 rounded-lg border-2 border-red-200 mb-4">
                <h3 className="text-xl font-bold text-red-900 mb-3 flex items-center gap-2">
                  <span>🎯</span> Deteksi Straight-lining
                </h3>
                <p className="text-red-700 mb-4">
                  Straight-lining terjadi ketika responden memilih jawaban yang sama terus-menerus tanpa membaca pertanyaan dengan seksama
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-sm text-slate-600 mb-1">Respons Normal</div>
                    <div className="text-3xl font-bold text-green-600">
                      {participants.filter(p => !p.has_straight_lining).length}
                    </div>
                    <div className="text-sm text-slate-500">
                      ({((participants.filter(p => !p.has_straight_lining).length / participants.length) * 100).toFixed(1)}%)
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-sm text-slate-600 mb-1">Terdeteksi Straight-lining</div>
                    <div className="text-3xl font-bold text-red-600">
                      {participants.filter(p => p.has_straight_lining).length}
                    </div>
                    <div className="text-sm text-slate-500">
                      ({((participants.filter(p => p.has_straight_lining).length / participants.length) * 100).toFixed(1)}%)
                    </div>
                  </div>
                </div>

                {participants.filter(p => p.has_straight_lining).length > 0 && (
                  <div className="mt-4 bg-white p-4 rounded-lg">
                    <div className="text-sm font-bold text-red-900 mb-2">⚠️ Partisipan dengan Straight-lining:</div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {participants.filter(p => p.has_straight_lining).map(p => (
                        <div key={p.id} className="flex justify-between items-center text-sm bg-red-50 px-3 py-2 rounded">
                          <span className="font-semibold text-red-900">{p.name}</span>
                          <span className="text-red-700">ID: {p.id}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Response Time Analysis */}
              <div className="bg-purple-50 p-6 rounded-lg border-2 border-purple-200">
                <h3 className="text-xl font-bold text-purple-900 mb-3 flex items-center gap-2">
                  <span>⏱️</span> Analisis Waktu Respons
                </h3>
                <p className="text-purple-700 mb-4">
                  Waktu respons yang terlalu cepat atau terlalu lambat dapat mengindikasikan kualitas data yang rendah
                </p>
                
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-sm text-slate-600 mb-1">⚠️ Suspicious</div>
                    <div className="text-sm text-slate-500 mb-2">(Terlalu cepat/lambat)</div>
                    <div className="text-3xl font-bold text-orange-600">
                      {participants.filter(p => p.response_quality === 'suspicious').length}
                    </div>
                    <div className="text-sm text-slate-500">
                      ({participants.length > 0 ? ((participants.filter(p => p.response_quality === 'suspicious').length / participants.length) * 100).toFixed(1) : 0}%)
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-sm text-slate-600 mb-1">✅ Good</div>
                    <div className="text-sm text-slate-500 mb-2">(Kualitas baik)</div>
                    <div className="text-3xl font-bold text-green-600">
                      {participants.filter(p => p.response_quality === 'good').length}
                    </div>
                    <div className="text-sm text-slate-500">
                      ({participants.length > 0 ? ((participants.filter(p => p.response_quality === 'good').length / participants.length) * 100).toFixed(1) : 0}%)
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-sm text-slate-600 mb-1">❌ Invalid</div>
                    <div className="text-sm text-slate-500 mb-2">(Tidak valid)</div>
                    <div className="text-3xl font-bold text-red-600">
                      {participants.filter(p => p.response_quality === 'invalid').length}
                    </div>
                    <div className="text-sm text-slate-500">
                      ({participants.length > 0 ? ((participants.filter(p => p.response_quality === 'invalid').length / participants.length) * 100).toFixed(1) : 0}%)
                    </div>
                  </div>
                </div>

                {/* Average response time */}
                {participants.filter(p => p.response_time_seconds).length > 0 && (
                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-sm text-slate-600 mb-1">Rata-rata Waktu Pengerjaan</div>
                    <div className="text-3xl font-bold text-purple-600">
                      {Math.round(
                        participants
                          .filter(p => p.response_time_seconds)
                          .reduce((sum, p) => sum + (p.response_time_seconds || 0), 0) / 
                        participants.filter(p => p.response_time_seconds).length
                      )} detik
                    </div>
                    <div className="text-sm text-slate-500">
                      ≈ {(Math.round(
                        participants
                          .filter(p => p.response_time_seconds)
                          .reduce((sum, p) => sum + (p.response_time_seconds || 0), 0) / 
                        participants.filter(p => p.response_time_seconds).length
                      ) / 60).toFixed(1)} menit
                    </div>
                  </div>
                )}
              </div>

              {/* Recommendations */}
              <div className="bg-slate-100 p-6 rounded-lg border-2 border-slate-300 mt-6">
                <h3 className="text-xl font-bold text-slate-900 mb-3">📋 Rekomendasi</h3>
                <ul className="space-y-2 text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Tinjau manual data dengan indikator kualitas rendah sebelum analisis final</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Pertimbangkan untuk mengecualikan respons dengan straight-lining dari analisis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Waktu respons ekstrem (terlalu cepat/lambat) mungkin menunjukkan kurangnya perhatian</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Dokumentasikan kriteria eksklusi data dalam publikasi penelitian</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Individual Responses Tab */}
        {selectedTab === 'individual' && (
          <div className="space-y-6">
            {/* Download Button */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl shadow-xl p-6 border-2 border-green-200">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-1">📥 Export Data</h2>
                  <p className="text-slate-600">Download seluruh data respons semua peserta dalam format CSV</p>
                </div>
                <button
                  onClick={downloadAllResponsesCSV}
                  disabled={participants.length === 0 || questions.length === 0}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white px-6 py-3 rounded-lg font-bold transition flex items-center gap-2"
                >
                  <span>💾</span> Download All Responses CSV
                </button>
              </div>
            </div>

            {/* Participant Selector */}
            <div className="bg-white rounded-xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Pilih Peserta</h2>
              <select
                value={selectedParticipantId || ''}
                onChange={(e) => {
                  const id = parseInt(e.target.value);
                  setSelectedParticipantId(id);
                  if (id) fetchResponses(id);
                }}
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg bg-white text-slate-900 font-semibold"
              >
                <option value="" className="text-slate-500">-- Pilih Peserta --</option>
                {participants.map((p) => (
                  <option key={p.id} value={p.id} className="text-slate-900 font-semibold">
                    {p.name} (ID: {p.id}) - {p.age} tahun - {p.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                  </option>
                ))}
              </select>
            </div>

            {/* Participant Info & Responses */}
            {selectedParticipantId && (() => {
              const participant = participants.find(p => p.id === selectedParticipantId);
              if (!participant) return null;

              // Group questions by domain
              const cognitiveQuestions = questions.filter(q => q.domain === 'cognitive');
              const psychologicalQuestions = questions.filter(q => q.domain === 'psychological');
              const socialQuestions = questions.filter(q => q.domain === 'social');

              // Create response map for quick lookup
              const responseMap = new Map(responses.map(r => [r.question_id, r.answer_value]));

              // Reverse scoring arrays (from lib/scoring.ts)
              const reversePsychologicalOrder = [2, 6, 17, 18];
              const reverseSocialOrder = [12, 16];

              // Likert labels
              const likertLabels = ['Sangat Tidak Setuju', 'Tidak Setuju', 'Netral', 'Setuju', 'Sangat Setuju'];

              return (
                <>
                  {/* Participant Info Card */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-xl p-6 border-2 border-blue-200">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Informasi Peserta</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-slate-600">Nama</div>
                        <div className="text-lg font-bold text-slate-900">{participant.name}</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-600">Usia & Gender</div>
                        <div className="text-lg font-bold text-slate-900">
                          {participant.age} tahun - {participant.gender === 'L' ? '👨 Laki-laki' : '👩 Perempuan'}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-600">Waktu Pengerjaan</div>
                        <div className="text-lg font-bold text-slate-900">
                          {participant.response_time_seconds 
                            ? `${participant.response_time_seconds}s (~${(participant.response_time_seconds / 60).toFixed(1)} menit)`
                            : 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-600">Kualitas Data</div>
                        <div className="text-lg font-bold">
                          {participant.response_quality === 'good' && <span className="text-green-600">✅ Good</span>}
                          {participant.response_quality === 'suspicious' && <span className="text-orange-600">⚠️ Suspicious</span>}
                          {participant.response_quality === 'invalid' && <span className="text-red-600">❌ Invalid</span>}
                        </div>
                      </div>
                    </div>
                    
                    {/* Score Summary */}
                    <div className="mt-4 pt-4 border-t-2 border-slate-200">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-sm text-slate-600">Kognitif</div>
                          <div className="text-2xl font-bold text-blue-600">{participant.cognitive_score}/10</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-slate-600">Psikologis</div>
                          <div className="text-2xl font-bold text-purple-600">{participant.psychological_score}/80</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-slate-600">Sosial</div>
                          <div className="text-2xl font-bold text-pink-600">{participant.social_score}/80</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-slate-600">Digit Span</div>
                          <div className="text-2xl font-bold text-green-600">{participant.digit_span_score}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cognitive Domain */}
                  <div className="bg-white rounded-xl shadow-xl p-6">
                    <h2 className="text-2xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                      <span>🧠</span> Domain Kognitif ({participant.cognitive_score}/10)
                    </h2>
                    <p className="text-slate-600 mb-4">Multiple choice - Pilih jawaban yang benar</p>
                    
                    <div className="space-y-4">
                      {cognitiveQuestions.map((q, index) => {
                        const answer = responseMap.get(q.id);
                        const isCorrect = answer === q.correct_answer;
                        // Handle options - could be string or already parsed array
                        let options = [];
                        try {
                          options = typeof q.options === 'string' ? JSON.parse(q.options) : (q.options || []);
                        } catch (e) {
                          console.error('Error parsing options for question', q.id, e);
                          options = [];
                        }
                        
                        return (
                          <div key={q.id} className="border-2 border-slate-200 rounded-lg p-4 hover:border-blue-300 transition">
                            <div className="flex items-start gap-3">
                              <div className="text-lg font-bold text-slate-700 min-w-[40px]">Q{index + 1}</div>
                              <div className="flex-1">
                                <p className="text-slate-900 font-semibold mb-3">{q.question_text}</p>
                                
                                {/* Options */}
                                <div className="space-y-2 mb-3">
                                  {options.map((option: string, optIndex: number) => {
                                    const isSelectedOption = answer === optIndex;
                                    const isCorrectOption = q.correct_answer === optIndex;
                                    
                                    return (
                                      <div 
                                        key={optIndex}
                                        className={`px-3 py-2 rounded border-2 ${
                                          isSelectedOption && isCorrect ? 'bg-green-50 border-green-500' :
                                          isSelectedOption && !isCorrect ? 'bg-red-50 border-red-500' :
                                          isCorrectOption ? 'bg-green-50 border-green-300' :
                                          'bg-slate-50 border-slate-200'
                                        }`}
                                      >
                                        <span className="font-semibold text-slate-700">{String.fromCharCode(65 + optIndex)}.</span> {option}
                                        {isSelectedOption && <span className="ml-2 text-blue-600 font-bold">← Jawaban Peserta</span>}
                                        {isCorrectOption && !isSelectedOption && <span className="ml-2 text-green-600 font-bold">← Jawaban Benar</span>}
                                      </div>
                                    );
                                  })}
                                </div>
                                
                                {/* Result */}
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-bold ${
                                  isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                  {isCorrect ? '✅ BENAR' : '❌ SALAH'}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Psychological Domain */}
                  <div className="bg-white rounded-xl shadow-xl p-6">
                    <h2 className="text-2xl font-bold text-purple-900 mb-4 flex items-center gap-2">
                      <span>💭</span> Domain Psikologis ({participant.psychological_score}/80)
                    </h2>
                    <p className="text-slate-600 mb-4">Skala Likert 0-4 (Sangat Tidak Setuju → Sangat Setuju)</p>
                    
                    <div className="space-y-4">
                      {psychologicalQuestions.map((q, index) => {
                        const answer = responseMap.get(q.id);
                        const isReverse = reversePsychologicalOrder.includes(q.order_index);
                        const actualValue = answer !== undefined ? answer : 0;
                        const scoreValue = isReverse ? (4 - actualValue) : actualValue;
                        
                        return (
                          <div key={q.id} className="border-2 border-slate-200 rounded-lg p-4 hover:border-purple-300 transition">
                            <div className="flex items-start gap-3">
                              <div className="text-lg font-bold text-slate-700 min-w-[40px]">Q{index + 1}</div>
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <p className="text-slate-900 font-semibold flex-1">{q.question_text}</p>
                                  {isReverse && (
                                    <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded">
                                      REVERSE
                                    </span>
                                  )}
                                </div>
                                
                                {/* Likert Scale Visual */}
                                <div className="flex items-center gap-2 mb-2">
                                  {[0, 1, 2, 3, 4].map((val) => (
                                    <div
                                      key={val}
                                      className={`flex-1 px-2 py-3 text-center rounded border-2 transition ${
                                        actualValue === val
                                          ? 'bg-purple-600 text-white border-purple-700 font-bold scale-105'
                                          : 'bg-slate-100 border-slate-300 text-slate-600'
                                      }`}
                                    >
                                      {val}
                                    </div>
                                  ))}
                                </div>
                                
                                {/* Answer Label */}
                                <div className="flex items-center justify-between">
                                  <div>
                                    <span className="text-slate-600">Jawaban: </span>
                                    <span className="font-bold text-purple-700">{actualValue} ({likertLabels[actualValue]})</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-600">Nilai: </span>
                                    <span className="font-bold text-purple-900">{scoreValue} poin</span>
                                    {isReverse && (
                                      <span className="ml-2 text-xs text-orange-600">(reversed: 4-{actualValue}={scoreValue})</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Social Domain */}
                  <div className="bg-white rounded-xl shadow-xl p-6">
                    <h2 className="text-2xl font-bold text-pink-900 mb-4 flex items-center gap-2">
                      <span>🤝</span> Domain Sosial ({participant.social_score}/80)
                    </h2>
                    <p className="text-slate-600 mb-4">Skala Likert 0-4 (Sangat Tidak Setuju → Sangat Setuju)</p>
                    
                    <div className="space-y-4">
                      {socialQuestions.map((q, index) => {
                        const answer = responseMap.get(q.id);
                        const isReverse = reverseSocialOrder.includes(q.order_index);
                        const actualValue = answer !== undefined ? answer : 0;
                        const scoreValue = isReverse ? (4 - actualValue) : actualValue;
                        
                        return (
                          <div key={q.id} className="border-2 border-slate-200 rounded-lg p-4 hover:border-pink-300 transition">
                            <div className="flex items-start gap-3">
                              <div className="text-lg font-bold text-slate-700 min-w-[40px]">Q{index + 1}</div>
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <p className="text-slate-900 font-semibold flex-1">{q.question_text}</p>
                                  {isReverse && (
                                    <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded">
                                      REVERSE
                                    </span>
                                  )}
                                </div>
                                
                                {/* Likert Scale Visual */}
                                <div className="flex items-center gap-2 mb-2">
                                  {[0, 1, 2, 3, 4].map((val) => (
                                    <div
                                      key={val}
                                      className={`flex-1 px-2 py-3 text-center rounded border-2 transition ${
                                        actualValue === val
                                          ? 'bg-pink-600 text-white border-pink-700 font-bold scale-105'
                                          : 'bg-slate-100 border-slate-300 text-slate-600'
                                      }`}
                                    >
                                      {val}
                                    </div>
                                  ))}
                                </div>
                                
                                {/* Answer Label */}
                                <div className="flex items-center justify-between">
                                  <div>
                                    <span className="text-slate-600">Jawaban: </span>
                                    <span className="font-bold text-pink-700">{actualValue} ({likertLabels[actualValue]})</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-600">Nilai: </span>
                                    <span className="font-bold text-pink-900">{scoreValue} poin</span>
                                    {isReverse && (
                                      <span className="ml-2 text-xs text-orange-600">(reversed: 4-{actualValue}={scoreValue})</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
