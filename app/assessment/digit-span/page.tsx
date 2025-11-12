'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

type GameMode = 'forward' | 'reversed';
type GameState = 'idle' | 'showing' | 'input' | 'correct' | 'wrong';

export default function DigitSpanPage() {
  const router = useRouter();
  const [mode, setMode] = useState<GameMode>('forward');
  const [gameState, setGameState] = useState<GameState>('idle');
  const [currentSequence, setCurrentSequence] = useState<number[]>([]);
  const [displayedDigit, setDisplayedDigit] = useState<number | null>(null);
  const [userInput, setUserInput] = useState('');
  const [currentSpan, setCurrentSpan] = useState(3);
  const [maxSpanForward, setMaxSpanForward] = useState(0);
  const [maxSpanReversed, setMaxSpanReversed] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Check if biodata exists
    const name = sessionStorage.getItem('participantName');
    if (!name) {
      router.push('/assessment');
    }
  }, [router]);

  const generateSequence = useCallback((length: number): number[] => {
    const sequence: number[] = [];
    for (let i = 0; i < length; i++) {
      sequence.push(Math.floor(Math.random() * 10));
    }
    return sequence;
  }, []);

  const showSequence = useCallback(async (sequence: number[]) => {
    setGameState('showing');
    setUserInput('');

    for (let i = 0; i < sequence.length; i++) {
      setDisplayedDigit(sequence[i]);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setDisplayedDigit(null);
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    setGameState('input');
  }, []);

  const startRound = useCallback(() => {
    const sequence = generateSequence(currentSpan);
    setCurrentSequence(sequence);
    setAttempts(prev => prev + 1);
    showSequence(sequence);
  }, [currentSpan, generateSequence, showSequence]);

  const handleSubmit = () => {
    const userSequence = userInput.split('').map(Number);
    
    let targetSequence = currentSequence;
    if (mode === 'reversed') {
      targetSequence = [...currentSequence].reverse();
    }

    const isCorrect = JSON.stringify(userSequence) === JSON.stringify(targetSequence);

    if (isCorrect) {
      setGameState('correct');
      
      // Update max span
      if (mode === 'forward') {
        setMaxSpanForward(Math.max(maxSpanForward, currentSpan));
      } else {
        setMaxSpanReversed(Math.max(maxSpanReversed, currentSpan));
      }

      setTimeout(() => {
        setCurrentSpan(prev => prev + 1);
        setGameState('idle');
      }, 1500);
    } else {
      setGameState('wrong');
      setTimeout(() => {
        setGameState('idle');
      }, 1500);
    }
  };

  const handleModeSwitch = () => {
    if (mode === 'forward' && maxSpanForward > 0) {
      setMode('reversed');
      setCurrentSpan(3);
      setGameState('idle');
    } else if (mode === 'reversed' && maxSpanReversed > 0) {
      // Both modes complete, save and move to results
      completeTest();
    }
  };

  const completeTest = () => {
    const finalScore = Math.max(maxSpanForward, maxSpanReversed);
    sessionStorage.setItem('digitSpanForward', maxSpanForward.toString());
    sessionStorage.setItem('digitSpanReversed', maxSpanReversed.toString());
    sessionStorage.setItem('digitSpanScore', finalScore.toString());
    sessionStorage.setItem('digitSpanAttempts', attempts.toString());
    
    setIsComplete(true);
  };

  const handleFinish = () => {
    router.push('/assessment/results');
  };

  const handleSkipToResults = () => {
    if (mode === 'forward') {
      handleModeSwitch();
    } else {
      completeTest();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Digit Span Test
          </h1>
          <p className="text-gray-700 font-medium">
            {mode === 'forward' 
              ? 'Hafalkan urutan angka dan ketik sesuai urutan yang muncul'
              : 'Hafalkan urutan angka dan ketik dengan urutan TERBALIK'}
          </p>
          <div className="mt-4 inline-block bg-gradient-to-r from-purple-100 to-pink-100 px-6 py-3 rounded-full border-2 border-purple-200">
            <span className="font-bold text-purple-900">
              Mode: {mode === 'forward' ? 'Forward' : 'Reversed'} | Span: {currentSpan} digit
            </span>
          </div>
        </div>

        {!isComplete ? (
          <>
            {/* Display area */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-12 mb-6 text-center min-h-[250px] flex items-center justify-center border-2 border-gray-200 shadow-inner">
              {gameState === 'showing' && displayedDigit !== null && (
                <div className="text-9xl font-bold text-indigo-600 animate-pulse">
                  {displayedDigit}
                </div>
              )}
              
              {gameState === 'idle' && (
                <div className="text-center">
                  <p className="text-gray-800 mb-6 font-medium text-lg">
                    {mode === 'forward' && maxSpanForward === 0 && 'Siap untuk memulai mode Forward?'}
                    {mode === 'forward' && maxSpanForward > 0 && 'Tekan tombol di bawah untuk melanjutkan'}
                    {mode === 'reversed' && maxSpanReversed === 0 && 'Siap untuk mode Reversed? (urutan terbalik)'}
                    {mode === 'reversed' && maxSpanReversed > 0 && 'Tekan tombol di bawah untuk melanjutkan'}
                  </p>
                  <button
                    onClick={startRound}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-xl transition duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Mulai Round
                  </button>
                </div>
              )}

              {gameState === 'input' && (
                <div className="w-full">
                  <p className="text-gray-900 mb-4 font-semibold text-lg">
                    Masukkan angka yang Anda ingat {mode === 'reversed' && '(urutan terbalik)'}:
                  </p>
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full text-center text-4xl font-bold px-4 py-4 border-2 border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-gray-900 bg-white"
                    placeholder="0123456789"
                    maxLength={currentSpan}
                    autoFocus
                  />
                  <button
                    onClick={handleSubmit}
                    disabled={userInput.length !== currentSpan}
                    className={`mt-4 w-full py-4 px-6 rounded-xl font-bold transition ${
                      userInput.length === currentSpan
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Submit
                  </button>
                </div>
              )}

              {gameState === 'correct' && (
                <div className="text-center">
                  <div className="text-7xl mb-4">✅</div>
                  <p className="text-3xl font-bold text-green-600">Benar!</p>
                  <p className="text-gray-700 mt-2 font-medium">Lanjut ke {currentSpan + 1} digit</p>
                </div>
              )}

              {gameState === 'wrong' && (
                <div className="text-center">
                  <div className="text-7xl mb-4">❌</div>
                  <p className="text-3xl font-bold text-red-600">Salah</p>
                  <p className="text-gray-700 mt-2 font-medium">Coba lagi</p>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl text-center border-2 border-blue-200">
                <p className="text-sm text-gray-800 font-semibold">Max Forward</p>
                <p className="text-3xl font-bold text-blue-600">{maxSpanForward}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl text-center border-2 border-purple-200">
                <p className="text-sm text-gray-800 font-semibold">Max Reversed</p>
                <p className="text-3xl font-bold text-purple-600">{maxSpanReversed}</p>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl text-center border-2 border-gray-200">
                <p className="text-sm text-gray-800 font-semibold">Attempts</p>
                <p className="text-3xl font-bold text-gray-700">{attempts}</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-4">
              {mode === 'forward' && maxSpanForward > 0 && (
                <button
                  onClick={handleModeSwitch}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition"
                >
                  Lanjut ke Mode Reversed
                </button>
              )}
              
              {mode === 'reversed' && maxSpanReversed > 0 && (
                <button
                  onClick={handleModeSwitch}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition"
                >
                  Selesai & Lihat Hasil
                </button>
              )}

              <button
                onClick={handleSkipToResults}
                className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition"
              >
                {mode === 'forward' ? 'Skip ke Reversed' : 'Skip ke Hasil'}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Test Selesai!
            </h2>
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <p className="text-gray-600 mb-2">Skor Anda:</p>
              <p className="text-4xl font-bold text-purple-600">
                {Math.max(maxSpanForward, maxSpanReversed)} digit
              </p>
              <div className="mt-4 text-sm text-gray-500">
                <p>Forward: {maxSpanForward} | Reversed: {maxSpanReversed}</p>
              </div>
            </div>
            <button
              onClick={handleFinish}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-300 transform hover:scale-105"
            >
              Lihat Hasil Lengkap →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
