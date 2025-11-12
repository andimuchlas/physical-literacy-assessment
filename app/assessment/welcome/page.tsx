'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function WelcomePage() {
  const router = useRouter();
  const [consent, setConsent] = useState({
    understood: false,
    voluntary: false,
    dataUse: false
  });

  const allConsented = consent.understood && consent.voluntary && consent.dataUse;

  function handleStart() {
    if (allConsented) {
      sessionStorage.setItem('consentGiven', 'true');
      sessionStorage.setItem('consentTimestamp', new Date().toISOString());
      router.push('/assessment');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-teal-500/20 border-2 border-teal-400/30 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <svg className="w-12 h-12 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Selamat Datang</h1>
          <p className="text-slate-300 text-lg">Assessment Literasi Fisik untuk Siswa SMA</p>
        </div>

        {/* Time Estimate Card */}
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Estimasi Waktu Pengerjaan
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
              <span className="text-slate-300">Biodata</span>
              <span className="font-semibold text-white">~2 menit</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
              <span className="text-slate-300">Kuesioner Kognitif (10 soal)</span>
              <span className="font-semibold text-white">~5 menit</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
              <span className="text-slate-300">Kuesioner Psikologis (20 soal)</span>
              <span className="font-semibold text-white">~8 menit</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
              <span className="text-slate-300">Kuesioner Sosial (20 soal)</span>
              <span className="font-semibold text-white">~8 menit</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
              <span className="text-slate-300">Digit Span Test</span>
              <span className="font-semibold text-white">~5 menit</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-teal-600/20 border border-teal-500/30 rounded-lg">
              <span className="text-white font-semibold">Total Estimasi</span>
              <span className="text-2xl font-bold text-teal-400">~30 menit</span>
            </div>
          </div>
        </div>

        {/* Informed Consent */}
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Lembar Persetujuan Partisipasi
          </h2>

          <div className="bg-slate-900/50 p-5 rounded-lg mb-4 max-h-96 overflow-y-auto">
            <div className="space-y-4 text-slate-300 leading-relaxed">
              <div>
                <h3 className="font-semibold text-white mb-2">Tujuan Penelitian</h3>
                <p className="text-sm">
                  Assessment ini merupakan bagian dari penelitian tentang literasi fisik siswa SMA. 
                  Tujuannya adalah untuk mengukur pemahaman, sikap psikologis, interaksi sosial, 
                  dan kapasitas memori kerja terkait aktivitas fisik dan olahraga.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2">Data yang Dikumpulkan</h3>
                <ul className="text-sm list-disc list-inside space-y-1">
                  <li>Nama dan usia</li>
                  <li>Jawaban kuesioner (kognitif, psikologis, sosial)</li>
                  <li>Hasil digit span test</li>
                  <li>Waktu penyelesaian assessment</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2">Kerahasiaan</h3>
                <p className="text-sm">
                  Semua data yang dikumpulkan akan dijaga kerahasiaannya dan hanya digunakan 
                  untuk keperluan penelitian. Identitas Anda akan disamarkan dalam publikasi 
                  atau presentasi hasil penelitian.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2">Hak Partisipan</h3>
                <ul className="text-sm list-disc list-inside space-y-1">
                  <li>Anda berhak menolak atau berhenti berpartisipasi kapan saja tanpa konsekuensi</li>
                  <li>Partisipasi bersifat sukarela</li>
                  <li>Tidak ada risiko yang terkait dengan partisipasi Anda</li>
                  <li>Anda berhak meminta penjelasan lebih lanjut</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2">Manfaat</h3>
                <p className="text-sm">
                  Partisipasi Anda akan membantu pengembangan program literasi fisik dan 
                  berkontribusi pada pengembangan ilmu pengetahuan di bidang pendidikan jasmani.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-700">
                <p className="text-sm">
                  <strong className="text-white">Kontak Peneliti:</strong><br />
                  Jika Anda memiliki pertanyaan, silakan hubungi peneliti melalui email atau 
                  menghubungi institusi penelitian.
                </p>
              </div>
            </div>
          </div>

          {/* Consent Checkboxes */}
          <div className="space-y-3">
            <label className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg cursor-pointer hover:bg-slate-700/50 transition">
              <input
                type="checkbox"
                checked={consent.understood}
                onChange={(e) => setConsent({ ...consent, understood: e.target.checked })}
                className="mt-1 w-5 h-5 rounded border-slate-600 text-teal-500 focus:ring-teal-500"
              />
              <span className="text-sm text-slate-300 leading-relaxed">
                Saya telah membaca dan memahami informasi di atas tentang penelitian ini
              </span>
            </label>

            <label className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg cursor-pointer hover:bg-slate-700/50 transition">
              <input
                type="checkbox"
                checked={consent.voluntary}
                onChange={(e) => setConsent({ ...consent, voluntary: e.target.checked })}
                className="mt-1 w-5 h-5 rounded border-slate-600 text-teal-500 focus:ring-teal-500"
              />
              <span className="text-sm text-slate-300 leading-relaxed">
                Saya setuju untuk berpartisipasi dalam penelitian ini secara sukarela
              </span>
            </label>

            <label className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg cursor-pointer hover:bg-slate-700/50 transition">
              <input
                type="checkbox"
                checked={consent.dataUse}
                onChange={(e) => setConsent({ ...consent, dataUse: e.target.checked })}
                className="mt-1 w-5 h-5 rounded border-slate-600 text-teal-500 focus:ring-teal-500"
              />
              <span className="text-sm text-slate-300 leading-relaxed">
                Saya setuju data saya digunakan untuk keperluan penelitian dengan tetap menjaga kerahasiaan
              </span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => router.push('/')}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold py-4 px-6 rounded-lg transition border border-slate-600"
          >
            Kembali
          </button>
          <button
            onClick={handleStart}
            disabled={!allConsented}
            className={`flex-1 font-semibold py-4 px-6 rounded-lg transition ${
              allConsented
                ? 'bg-teal-500 hover:bg-teal-600 text-white border-2 border-teal-400'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed border border-slate-600'
            }`}
          >
            {allConsented ? 'Mulai Assessment →' : 'Setujui Semua untuk Melanjutkan'}
          </button>
        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm">
            Dengan melanjutkan, Anda menyatakan bahwa Anda telah membaca dan menyetujui ketentuan di atas
          </p>
        </div>
      </div>
    </div>
  );
}
