'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, Question } from '@/lib/supabase';

export default function QuestionnairePage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{[key: number]: number}>({});
  const [loading, setLoading] = useState(true);
  const [currentDomain, setCurrentDomain] = useState<'cognitive' | 'psychological' | 'social'>('cognitive');
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if biodata exists
    const name = sessionStorage.getItem('participantName');
    if (!name) {
      router.push('/assessment');
      return;
    }

    // Restore answers from sessionStorage if exists
    const savedAnswers = sessionStorage.getItem('questionnaireAnswers');
    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers));
    }

    loadQuestions();
  }, [router]);

  // Scroll to top when domain changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentDomain]);

  const loadQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setQuestions(data || []);
    } catch (err) {
      console.error('Error loading questions:', err);
      setError('Gagal memuat pertanyaan. Silakan refresh halaman.');
    } finally {
      setLoading(false);
    }
  };

  const domainQuestions = questions.filter(q => q.domain === currentDomain);

  const handleAnswer = (questionId: number, value: number) => {
    const newAnswers = {
      ...answers,
      [questionId]: value
    };
    setAnswers(newAnswers);
    
    // Save to sessionStorage immediately
    sessionStorage.setItem('questionnaireAnswers', JSON.stringify(newAnswers));
  };

  const allQuestionsAnswered = (domain: string) => {
    const domainQs = questions.filter(q => q.domain === domain);
    return domainQs.every(q => answers[q.id] !== undefined && answers[q.id] !== null);
  };

  const handleNext = () => {
    const domainQs = questions.filter(q => q.domain === currentDomain);
    const unanswered = domainQs.filter(q => answers[q.id] === undefined || answers[q.id] === null);
    
    if (unanswered.length > 0) {
      setError(`Mohon jawab semua pertanyaan terlebih dahulu (${domainQs.length - unanswered.length}/${domainQs.length} terjawab)`);
      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setError('');

    if (currentDomain === 'cognitive') {
      setCurrentDomain('psychological');
    } else if (currentDomain === 'psychological') {
      setCurrentDomain('social');
    } else {
      // Save to sessionStorage and move to digit span
      sessionStorage.setItem('questionnaireAnswers', JSON.stringify(answers));
      router.push('/assessment/digit-span');
    }
  };

  const handleBack = () => {
    if (currentDomain === 'psychological') {
      setCurrentDomain('cognitive');
    } else if (currentDomain === 'social') {
      setCurrentDomain('psychological');
    }
  };

  const getDomainTitle = () => {
    switch (currentDomain) {
      case 'cognitive': return 'Domain Kognitif';
      case 'psychological': return 'Domain Psikologis';
      case 'social': return 'Domain Sosial';
    }
  };

  const getDomainDescription = () => {
    const totalQuestions = domainQuestions.length;
    const answeredCount = domainQuestions.filter(q => 
      answers[q.id] !== undefined && answers[q.id] !== null
    ).length;
    
    switch (currentDomain) {
      case 'cognitive': 
        return `Pilih jawaban yang paling tepat (${answeredCount}/${totalQuestions} soal terjawab)`;
      case 'psychological': 
        return `Berikan penilaian dari 0-4 untuk setiap pernyataan (${answeredCount}/${totalQuestions} soal terjawab)`;
      case 'social': 
        return `Berikan penilaian dari 0-4 untuk setiap pernyataan (${answeredCount}/${totalQuestions} soal terjawab)`;
    }
  };

  const likertLabels = ['Tidak Pernah', 'Jarang', 'Kadang-kadang', 'Sering', 'Selalu'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto"></div>
          <p className="mt-4 text-white font-semibold text-lg">Memuat pertanyaan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto pb-8">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">{getDomainTitle()}</h2>
              <span className="text-sm font-semibold text-gray-700 bg-gray-200 px-3 py-1 rounded-full">
                {currentDomain === 'cognitive' ? '1/3' : currentDomain === 'psychological' ? '2/3' : '3/3'}
              </span>
            </div>
            <p className="text-gray-700 mb-4 font-medium">{getDomainDescription()}</p>
            
            <div className="w-full bg-gray-300 rounded-full h-3">
              <div 
                className="bg-teal-600 h-3 rounded-full transition-all duration-300"
                style={{ 
                  width: currentDomain === 'cognitive' ? '33%' : 
                         currentDomain === 'psychological' ? '66%' : '100%' 
                }}
              />
            </div>
          </div>

          {/* Questions */}
          <div 
            className="space-y-6 mb-8 scroll-smooth"
          >
            {domainQuestions.map((question, index) => {
              const isAnswered = answers[question.id] !== undefined && answers[question.id] !== null;
              return (
                <div 
                  key={question.id} 
                  className={`bg-gradient-to-br p-6 rounded-2xl border-2 shadow-sm transition ${
                    isAnswered 
                      ? 'from-green-50 to-green-100 border-green-300' 
                      : 'from-gray-50 to-gray-100 border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <p className="font-semibold text-gray-900 text-lg flex-1">
                      {index + 1}. {question.question_text}
                    </p>
                    {isAnswered && (
                      <span className="ml-3 text-green-600 font-bold text-sm bg-green-100 px-2 py-1 rounded-full">
                        ✓
                      </span>
                    )}
                  </div>

                {question.question_type === 'multiple_choice' ? (
                  <div className="space-y-2">
                    {question.options?.map((option, optIndex) => (
                      <label
                        key={optIndex}
                        className={`flex items-center p-4 bg-white rounded-xl border-2 cursor-pointer transition-all ${
                          answers[question.id] === optIndex 
                            ? 'border-blue-600 bg-blue-50 shadow-md' 
                            : 'border-gray-200 hover:border-blue-400'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={optIndex}
                          checked={answers[question.id] === optIndex}
                          onChange={() => handleAnswer(question.id, optIndex)}
                          className="mr-3 w-5 h-5 text-blue-600"
                        />
                        <span className="text-gray-900 font-medium">{option}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs font-semibold text-gray-700 mb-2">
                      {likertLabels.map((label, i) => (
                        <span key={i} className="text-center" style={{width: '20%'}}>{label}</span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      {[0, 1, 2, 3, 4].map((value) => (
                        <label
                          key={value}
                          className="flex-1 text-center"
                        >
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={value}
                            checked={answers[question.id] === value}
                            onChange={() => handleAnswer(question.id, value)}
                            className="sr-only"
                          />
                          <div 
                            className={`py-4 px-2 rounded-xl border-2 cursor-pointer transition font-bold text-lg ${
                              answers[question.id] === value
                                ? 'bg-teal-600 text-white border-teal-600 shadow-lg transform scale-105'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-teal-400'
                            }`}
                          >
                            {value}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
            })}
          </div>

          {error && (
            <div className="bg-red-100 border-2 border-red-300 text-red-900 px-4 py-3 rounded-xl text-sm font-semibold">
              {error}
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between pt-4 border-t-2 border-gray-200">
            <button
              onClick={handleBack}
              disabled={currentDomain === 'cognitive'}
              className={`px-6 py-3 rounded-xl font-bold transition flex items-center gap-2 ${
                currentDomain === 'cognitive'
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-700 hover:bg-gray-800 text-white shadow-lg'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Kembali
            </button>

            <button
              onClick={handleNext}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-xl transition duration-300 transform hover:scale-105 shadow-xl flex items-center gap-2"
            >
              <span>{currentDomain === 'social' ? 'Lanjut ke Digit Span Test' : 'Lanjut'}</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
