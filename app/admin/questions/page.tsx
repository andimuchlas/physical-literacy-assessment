'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, Question } from '@/lib/supabase';
import Link from 'next/link';

type QuestionDomain = 'cognitive' | 'psychological' | 'social';
type QuestionType = 'multiple_choice' | 'likert';

export default function QuestionsManagementPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  
  // Form state
  const [domain, setDomain] = useState<QuestionDomain>('cognitive');
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState<QuestionType>('multiple_choice');
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState<number>(0);
  const [orderIndex, setOrderIndex] = useState<number>(1);

  useEffect(() => {
    checkAuth();
    loadQuestions();
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

  const loadQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('domain')
        .order('order_index');

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setDomain(question.domain as QuestionDomain);
    setQuestionText(question.question_text);
    setQuestionType(question.question_type as QuestionType);
    setOptions(question.options || ['', '', '', '']);
    setCorrectAnswer(question.correct_answer || 0);
    setOrderIndex(question.order_index);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus pertanyaan ini?')) return;

    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadQuestions();
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Gagal menghapus pertanyaan');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const questionData = {
      domain,
      question_text: questionText,
      question_type: questionType,
      options: questionType === 'multiple_choice' ? options.filter(o => o.trim()) : null,
      correct_answer: questionType === 'multiple_choice' ? correctAnswer : null,
      order_index: orderIndex
    };

    try {
      if (editingQuestion) {
        // Update existing question
        const { error } = await supabase
          .from('questions')
          .update(questionData)
          .eq('id', editingQuestion.id);

        if (error) throw error;
      } else {
        // Insert new question
        const { error } = await supabase
          .from('questions')
          .insert([questionData]);

        if (error) throw error;
      }

      resetForm();
      loadQuestions();
    } catch (error) {
      console.error('Error saving question:', error);
      alert('Gagal menyimpan pertanyaan');
    }
  };

  const resetForm = () => {
    setEditingQuestion(null);
    setDomain('cognitive');
    setQuestionText('');
    setQuestionType('multiple_choice');
    setOptions(['', '', '', '']);
    setCorrectAnswer(0);
    setOrderIndex(1);
    setShowForm(false);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const groupedQuestions = {
    cognitive: questions.filter(q => q.domain === 'cognitive'),
    psychological: questions.filter(q => q.domain === 'psychological'),
    social: questions.filter(q => q.domain === 'social')
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
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              Kelola Pertanyaan
            </h1>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition font-semibold text-center"
              >
                + Tambah Pertanyaan
              </button>
              <Link
                href="/admin/dashboard"
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition font-semibold text-center"
              >
                Kembali ke Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modal/Popup Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">
                    {editingQuestion ? 'Edit Pertanyaan' : 'Tambah Pertanyaan Baru'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">
                      Domain
                    </label>
                    <select
                      value={domain}
                      onChange={(e) => {
                        setDomain(e.target.value as QuestionDomain);
                        setQuestionType(e.target.value === 'cognitive' ? 'multiple_choice' : 'likert');
                      }}
                      className="w-full px-4 py-3 bg-white text-gray-900 font-medium border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    >
                      <option value="cognitive">Kognitif</option>
                      <option value="psychological">Psikologis</option>
                      <option value="social">Sosial</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">
                      Urutan
                    </label>
                    <input
                      type="number"
                      value={orderIndex}
                      onChange={(e) => setOrderIndex(parseInt(e.target.value))}
                      className="w-full px-4 py-3 bg-white text-gray-900 font-medium border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    Pertanyaan
                  </label>
                  <textarea
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    className="w-full px-4 py-3 bg-white text-gray-900 font-medium border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                    rows={4}
                    placeholder="Masukkan teks pertanyaan di sini..."
                    required
                  />
                </div>

                {domain === 'cognitive' && questionType === 'multiple_choice' && (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-3">
                        Pilihan Jawaban
                      </label>
                      <div className="space-y-3">
                        {options.map((option, index) => (
                          <div key={index} className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border-2 border-gray-200">
                            <input
                              type="radio"
                              name="correctAnswer"
                              checked={correctAnswer === index}
                              onChange={() => setCorrectAnswer(index)}
                              className="w-5 h-5 cursor-pointer"
                            />
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => handleOptionChange(index, e.target.value)}
                              className="flex-1 px-4 py-2 bg-white text-gray-900 font-medium border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                              placeholder={`Opsi ${index + 1}`}
                              required
                            />
                            {correctAnswer === index && (
                              <span className="text-sm font-bold text-green-600 whitespace-nowrap">
                                ✓ Benar
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 mt-3 font-medium">
                        💡 Pilih radio button untuk menandai jawaban yang benar
                      </p>
                    </div>
                  </>
                )}

                {questionType === 'likert' && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border-2 border-blue-200">
                    <p className="text-sm text-gray-800 font-medium">
                      📊 Pertanyaan ini menggunakan skala Likert 0-4:<br/>
                      <span className="text-xs">0 = Tidak Pernah | 1 = Jarang | 2 = Kadang-kadang | 3 = Sering | 4 = Selalu</span>
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-6 py-3 rounded-xl transition shadow-lg"
                  >
                    {editingQuestion ? '✓ Update Pertanyaan' : '+ Simpan Pertanyaan'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl transition"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Questions List */}
        <div className="space-y-8">
          {(['cognitive', 'psychological', 'social'] as QuestionDomain[]).map((dom) => (
            <div key={dom} className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-gray-200">
              <div className="bg-gradient-to-r from-gray-700 to-gray-900 text-white p-6">
                <h2 className="text-2xl font-bold">
                  Domain {dom === 'cognitive' ? 'Kognitif' : dom === 'psychological' ? 'Psikologis' : 'Sosial'}
                  <span className="ml-3 text-lg font-normal opacity-90">
                    ({groupedQuestions[dom].length} pertanyaan)
                  </span>
                </h2>
              </div>
              
              <div className="divide-y-2 divide-gray-100">
                {groupedQuestions[dom].map((question) => (
                  <div key={question.id} className="p-6 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-lg text-sm font-bold">
                            #{question.order_index}
                          </span>
                          <span className={`px-3 py-1 rounded-lg text-xs font-bold border-2 ${
                            question.question_type === 'multiple_choice' 
                              ? 'bg-blue-50 text-blue-700 border-blue-200' 
                              : 'bg-purple-50 text-purple-700 border-purple-200'
                          }`}>
                            {question.question_type === 'multiple_choice' ? '📝 Pilihan Ganda' : '📊 Likert 0-4'}
                          </span>
                        </div>
                        <p className="text-gray-900 font-medium text-lg mb-3">{question.question_text}</p>
                        
                        {question.question_type === 'multiple_choice' && question.options && (
                          <div className="mt-3 space-y-2 bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
                            {question.options.map((option, idx) => (
                              <div 
                                key={idx} 
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                                  idx === question.correct_answer 
                                    ? 'bg-green-100 border-2 border-green-300 font-bold text-green-800' 
                                    : 'bg-white border-2 border-gray-200 text-gray-700'
                                }`}
                              >
                                <span className="font-bold">{String.fromCharCode(65 + idx)}.</span>
                                <span>{option}</span>
                                {idx === question.correct_answer && (
                                  <span className="ml-auto text-green-600 font-bold">✓ BENAR</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-2 shrink-0">
                        <button
                          onClick={() => handleEdit(question)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-bold transition shadow-md hover:shadow-lg whitespace-nowrap"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(question.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold transition shadow-md hover:shadow-lg whitespace-nowrap"
                        >
                          🗑️ Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {groupedQuestions[dom].length === 0 && (
                  <div className="p-8 text-center">
                    <div className="text-gray-400 text-6xl mb-4">📋</div>
                    <p className="text-gray-500 font-medium text-lg">
                      Belum ada pertanyaan untuk domain ini
                    </p>
                    <button
                      onClick={() => {
                        setDomain(dom);
                        setQuestionType(dom === 'cognitive' ? 'multiple_choice' : 'likert');
                        setShowForm(true);
                      }}
                      className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition"
                    >
                      + Tambah Pertanyaan {dom === 'cognitive' ? 'Kognitif' : dom === 'psychological' ? 'Psikologis' : 'Sosial'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
