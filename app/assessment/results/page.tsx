'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, Question } from '@/lib/supabase';
import {
  getCognitiveCategory,
  getPsychologicalCategory,
  getSocialCategory,
  getDigitSpanCategory,
  getWeakDomains
} from '@/lib/scoring';

interface ScoreData {
  cognitive: number;
  psychological: number;
  social: number;
  digitSpan: number;
}

export default function ResultsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [scores, setScores] = useState<ScoreData | null>(null);
  const [participantName, setParticipantName] = useState('');
  const [participantAge, setParticipantAge] = useState(0);
  const [savedSuccessfully, setSavedSuccessfully] = useState(false);
  const [alreadySaved, setAlreadySaved] = useState(false);

  useEffect(() => {
    // Check if already saved to prevent duplicate
    const saved = sessionStorage.getItem('resultsSaved');
    if (saved === 'true') {
      setAlreadySaved(true);
    }
    calculateScores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const calculateScores = async () => {
    try {
      // Get biodata
      const name = sessionStorage.getItem('participantName');
      const age = sessionStorage.getItem('participantAge');
      
      if (!name || !age) {
        router.push('/assessment');
        return;
      }

      setParticipantName(name);
      setParticipantAge(parseInt(age));

      // Get answers
      const answersStr = sessionStorage.getItem('questionnaireAnswers');
      if (!answersStr) {
        router.push('/assessment/questionnaire');
        return;
      }

      const answers = JSON.parse(answersStr);

      // Get questions to calculate scores
      const { data: questions } = await supabase
        .from('questions')
        .select('*');

      if (!questions) throw new Error('Failed to load questions');

      // Calculate cognitive score (correct answers out of 10)
      let cognitiveScore = 0;
      const cognitiveQuestions = questions.filter(q => q.domain === 'cognitive');
      cognitiveQuestions.forEach(q => {
        if (answers[q.id] === q.correct_answer) {
          cognitiveScore++;
        }
      });

      // Calculate psychological score (sum of Likert values, max 80)
      let psychologicalScore = 0;
      const psychologicalQuestions = questions.filter(q => q.domain === 'psychological');
      psychologicalQuestions.forEach(q => {
        psychologicalScore += (answers[q.id] || 0);
      });

      // Calculate social score (sum of Likert values, max 80)
      let socialScore = 0;
      const socialQuestions = questions.filter(q => q.domain === 'social');
      socialQuestions.forEach(q => {
        socialScore += (answers[q.id] || 0);
      });

      // Get digit span score
      const digitSpanScore = parseInt(sessionStorage.getItem('digitSpanScore') || '0');

      setScores({
        cognitive: cognitiveScore,
        psychological: psychologicalScore,
        social: socialScore,
        digitSpan: digitSpanScore
      });

      // Auto-save to database (only if not already saved)
      if (!alreadySaved) {
        await saveToDatabase(name, parseInt(age), cognitiveScore, psychologicalScore, socialScore, digitSpanScore, answers, questions);
      } else {
        console.log('⚠️ Data sudah pernah disimpan sebelumnya, skip insert');
        setSavedSuccessfully(true);
      }

    } catch (error) {
      console.error('Error calculating scores:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveToDatabase = async (
    name: string,
    age: number,
    cogScore: number,
    psyScore: number,
    socScore: number,
    digScore: number,
    answers: any,
    questions: Question[]
  ) => {
    try {
      setSaving(true);
      console.log('🔄 Mulai menyimpan data ke database...');
      console.log('📊 Data yang akan disimpan:', { name, age, cogScore, psyScore, socScore, digScore });

      // Insert participant
      const { data: participant, error: participantError } = await supabase
        .from('participants')
        .insert([
          {
            name,
            age,
            cognitive_score: cogScore,
            psychological_score: psyScore,
            social_score: socScore,
            digit_span_score: digScore
          }
        ])
        .select()
        .single();

      if (participantError) {
        console.error('❌ Error saat insert participant:', participantError);
        alert('Gagal menyimpan data peserta: ' + participantError.message);
        throw participantError;
      }

      console.log('✅ Participant berhasil disimpan, ID:', participant.id);

      // Insert responses
      const responses = Object.entries(answers).map(([questionId, answerValue]) => ({
        participant_id: participant.id,
        question_id: parseInt(questionId),
        answer_value: answerValue as number
      }));

      console.log('📝 Menyimpan', responses.length, 'jawaban...');

      const { error: responsesError } = await supabase
        .from('responses')
        .insert(responses);

      if (responsesError) {
        console.error('❌ Error saat insert responses:', responsesError);
        alert('Gagal menyimpan jawaban: ' + responsesError.message);
        throw responsesError;
      }

      console.log('✅ Responses berhasil disimpan');

      // Insert digit span results
      const forwardSpan = parseInt(sessionStorage.getItem('digitSpanForward') || '0');
      const reversedSpan = parseInt(sessionStorage.getItem('digitSpanReversed') || '0');
      const attempts = parseInt(sessionStorage.getItem('digitSpanAttempts') || '0');

      console.log('🧠 Digit span data:', { forwardSpan, reversedSpan, attempts });

      if (forwardSpan > 0) {
        const { error: forwardError } = await supabase.from('digit_span_results').insert([
          {
            participant_id: participant.id,
            mode: 'forward',
            max_span: forwardSpan,
            attempts: attempts
          }
        ]);
        
        if (forwardError) {
          console.error('❌ Error saat insert forward span:', forwardError);
        } else {
          console.log('✅ Forward span berhasil disimpan');
        }
      }

      if (reversedSpan > 0) {
        const { error: reversedError } = await supabase.from('digit_span_results').insert([
          {
            participant_id: participant.id,
            mode: 'reversed',
            max_span: reversedSpan,
            attempts: attempts
          }
        ]);
        
        if (reversedError) {
          console.error('❌ Error saat insert reversed span:', reversedError);
        } else {
          console.log('✅ Reversed span berhasil disimpan');
        }
      }

      console.log('🎉 Semua data berhasil disimpan ke database!');
      setSavedSuccessfully(true);
      
      // Mark as saved in sessionStorage
      sessionStorage.setItem('resultsSaved', 'true');
      setAlreadySaved(true);
    } catch (error: any) {
      console.error('💥 Error saving to database:', error);
      alert('Terjadi kesalahan saat menyimpan data. Cek console browser untuk detail. Error: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleNewAssessment = () => {
    sessionStorage.clear();
    router.push('/assessment');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto"></div>
          <p className="mt-4 text-white font-semibold text-lg">Menghitung hasil...</p>
        </div>
      </div>
    );
  }

  if (!scores) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-3xl shadow-2xl max-w-md">
          <p className="text-red-700 font-semibold mb-4">Terjadi kesalahan. Silakan mulai ulang assessment.</p>
          <button
            onClick={() => router.push('/assessment')}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition"
          >
            Mulai Ulang
          </button>
        </div>
      </div>
    );
  }

  const cogCategory = getCognitiveCategory(scores.cognitive);
  const psyCategory = getPsychologicalCategory(scores.psychological);
  const socCategory = getSocialCategory(scores.social);
  const digCategory = getDigitSpanCategory(scores.digitSpan);
  const weakDomains = getWeakDomains(scores.cognitive, scores.psychological, scores.social, scores.digitSpan);

  const getColorClass = (color: string) => {
    switch (color) {
      case 'red': return 'bg-red-50 border-red-400 text-red-900';
      case 'yellow': return 'bg-yellow-50 border-yellow-400 text-yellow-900';
      case 'green': return 'bg-green-50 border-green-400 text-green-900';
      default: return 'bg-gray-50 border-gray-400 text-gray-900';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
              <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Hasil Assessment Literasi Fisik
            </h1>
            <p className="text-gray-700 font-semibold text-lg">
              {participantName} ({participantAge} tahun)
            </p>
            {savedSuccessfully && (
              <div className="mt-4 inline-block bg-green-100 border-2 border-green-300 text-green-900 px-4 py-2 rounded-xl text-sm font-bold">
                ✓ Data berhasil disimpan
              </div>
            )}
          </div>

          {/* Summary */}
          {weakDomains.length > 0 && (
            <div className="bg-orange-50 border-2 border-orange-300 rounded-2xl p-6 mb-8">
              <h3 className="font-bold text-orange-900 mb-2 flex items-center text-lg">
                <span className="text-3xl mr-3">⚠️</span>
                Perlu Perhatian Khusus
              </h3>
              <p className="text-orange-900 font-medium">
                Anak ini perlu peningkatan di domain: <strong>{weakDomains.join(', ')}</strong>
              </p>
            </div>
          )}

          {weakDomains.length === 0 && (
            <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-6 mb-8">
              <h3 className="font-bold text-green-900 mb-2 flex items-center text-lg">
                <span className="text-3xl mr-3">🌟</span>
                Hasil Sangat Baik!
              </h3>
              <p className="text-green-900 font-medium">
                Semua domain literasi fisik menunjukkan hasil yang baik atau sangat baik.
              </p>
            </div>
          )}

          {/* Detailed Scores */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Cognitive */}
            <div className={`border-2 rounded-2xl p-6 shadow-lg ${getColorClass(cogCategory.color)}`}>
              <h3 className="font-bold text-xl mb-3">Domain Kognitif</h3>
              <div className="flex items-baseline mb-3">
                <span className="text-5xl font-bold">{scores.cognitive}</span>
                <span className="text-2xl ml-2 font-semibold">/ 10</span>
              </div>
              <div className="mb-3">
                <span className="inline-block px-4 py-2 rounded-xl text-sm font-bold bg-white/70 shadow">
                  {cogCategory.category}
                </span>
              </div>
              <p className="text-sm font-medium">{cogCategory.description}</p>
            </div>

            {/* Psychological */}
            <div className={`border-2 rounded-2xl p-6 shadow-lg ${getColorClass(psyCategory.color)}`}>
              <h3 className="font-bold text-xl mb-3">Domain Psikologis</h3>
              <div className="flex items-baseline mb-3">
                <span className="text-5xl font-bold">{scores.psychological}</span>
                <span className="text-2xl ml-2 font-semibold">/ 80</span>
              </div>
              <div className="mb-3">
                <span className="inline-block px-4 py-2 rounded-xl text-sm font-bold bg-white/70 shadow">
                  {psyCategory.category}
                </span>
              </div>
              <p className="text-sm font-medium">{psyCategory.description}</p>
            </div>

            {/* Social */}
            <div className={`border-2 rounded-2xl p-6 shadow-lg ${getColorClass(socCategory.color)}`}>
              <h3 className="font-bold text-xl mb-3">Domain Sosial</h3>
              <div className="flex items-baseline mb-3">
                <span className="text-5xl font-bold">{scores.social}</span>
                <span className="text-2xl ml-2 font-semibold">/ 80</span>
              </div>
              <div className="mb-3">
                <span className="inline-block px-4 py-2 rounded-xl text-sm font-bold bg-white/70 shadow">
                  {socCategory.category}
                </span>
              </div>
              <p className="text-sm font-medium">{socCategory.description}</p>
            </div>

            {/* Digit Span / Memory */}
            <div className={`border-2 rounded-2xl p-6 shadow-lg ${getColorClass(digCategory.color)}`}>
              <h3 className="font-bold text-xl mb-3">Memori Kerja (Digit Span)</h3>
              <div className="flex items-baseline mb-3">
                <span className="text-5xl font-bold">{scores.digitSpan}</span>
                <span className="text-2xl ml-2 font-semibold">digit</span>
              </div>
              <div className="mb-3">
                <span className="inline-block px-4 py-2 rounded-xl text-sm font-bold bg-white/70 shadow">
                  {digCategory.category}
                </span>
              </div>
              <p className="text-sm font-medium">{digCategory.description}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleNewAssessment}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition duration-300 shadow-lg"
            >
              Assessment Baru
            </button>
            <button
              onClick={() => router.push('/')}
              className="flex-1 bg-gray-700 hover:bg-gray-800 text-white font-bold py-4 px-6 rounded-xl transition duration-300 shadow-lg"
            >
              Kembali ke Beranda
            </button>
          </div>

          {saving && (
            <div className="mt-4 text-center text-sm text-gray-700 font-medium">
              Menyimpan data...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
