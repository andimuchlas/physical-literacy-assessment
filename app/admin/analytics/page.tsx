'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { calculateDescriptiveStats, generateSampleCharacteristics, detectStraightLining, analyzeResponseTime } from '@/lib/export-utils';
import { useRouter } from 'next/navigation';

interface ParticipantData {
  id: number;
  name: string;
  age: number;
  cognitive_score: number;
  psychological_score: number;
  social_score: number;
  digit_span_score: number;
  created_at: string;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState<ParticipantData[]>([]);
  const [selectedTab, setSelectedTab] = useState<'descriptive' | 'quality'>('descriptive');

  useEffect(() => {
    checkAuth();
    fetchData();
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
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setSelectedTab('descriptive')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              selectedTab === 'descriptive'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            📊 Statistik Deskriptif
          </button>
          <button
            onClick={() => setSelectedTab('quality')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              selectedTab === 'quality'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            🔍 Kualitas Data
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

        {/* Data Quality Tab */}
        {selectedTab === 'quality' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Gambaran Kualitas Data</h2>
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mb-6">
                <p className="text-yellow-900 font-semibold">
                  ⚠️ Pemeriksaan kualitas membantu mengidentifikasi respons yang berpotensi bermasalah dan perlu ditinjau
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-blue-900">Total Respons Valid</h3>
                    <span className="text-3xl font-bold text-blue-600">{participants.length}</span>
                  </div>
                  <p className="text-blue-700 text-sm">Semua partisipan yang menyelesaikan assessment</p>
                </div>

                <div className="bg-slate-50 p-6 rounded-lg border-2 border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Indikator Kualitas</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-700 font-semibold">Pelacakan Waktu Respons:</span>
                      <span className="text-slate-900 font-mono">Akan diimplementasikan</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-700 font-semibold">Deteksi Pola Jawaban Sama:</span>
                      <span className="text-slate-900 font-mono">Memerlukan analisis respons</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-700 font-semibold">Pemeriksaan Perhatian:</span>
                      <span className="text-slate-900 font-mono">Akan diimplementasikan</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
                  <h3 className="text-lg font-bold text-green-900 mb-2">✓ Pengumpulan Data Aktif</h3>
                  <p className="text-green-700">Assessment sedang mengumpulkan data. Pemeriksaan kualitas akan tersedia setelah pelacakan data tingkat respons diimplementasikan.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
