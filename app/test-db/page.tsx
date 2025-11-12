'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function TestDBPage() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    const testResults: any = {
      timestamp: new Date().toLocaleString('id-ID'),
      tests: []
    };

    try {
      // Test 1: Check participants table
      console.log('🧪 Testing participants table...');
      const { data: participants, error: participantsError } = await supabase
        .from('participants')
        .select('*')
        .limit(5);
      
      testResults.tests.push({
        name: 'Participants Table',
        status: participantsError ? 'FAILED' : 'SUCCESS',
        data: participants,
        error: participantsError?.message,
        count: participants?.length || 0
      });

      // Test 2: Check questions table
      console.log('🧪 Testing questions table...');
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .limit(5);
      
      testResults.tests.push({
        name: 'Questions Table',
        status: questionsError ? 'FAILED' : 'SUCCESS',
        data: questions,
        error: questionsError?.message,
        count: questions?.length || 0
      });

      // Test 3: Check responses table
      console.log('🧪 Testing responses table...');
      const { data: responses, error: responsesError } = await supabase
        .from('responses')
        .select('*')
        .limit(5);
      
      testResults.tests.push({
        name: 'Responses Table',
        status: responsesError ? 'FAILED' : 'SUCCESS',
        data: responses,
        error: responsesError?.message,
        count: responses?.length || 0
      });

      // Test 4: Check digit_span_results table
      console.log('🧪 Testing digit_span_results table...');
      const { data: digitSpan, error: digitSpanError } = await supabase
        .from('digit_span_results')
        .select('*')
        .limit(5);
      
      testResults.tests.push({
        name: 'Digit Span Results Table',
        status: digitSpanError ? 'FAILED' : 'SUCCESS',
        data: digitSpan,
        error: digitSpanError?.message,
        count: digitSpan?.length || 0
      });

      // Test 5: Try to insert test data
      console.log('🧪 Testing insert participant...');
      const { data: testParticipant, error: insertError } = await supabase
        .from('participants')
        .insert([
          {
            name: 'Test User ' + Date.now(),
            age: 10,
            cognitive_score: 5,
            psychological_score: 40,
            social_score: 40,
            digit_span_score: 7
          }
        ])
        .select()
        .single();
      
      testResults.tests.push({
        name: 'Insert Test Participant',
        status: insertError ? 'FAILED' : 'SUCCESS',
        data: testParticipant,
        error: insertError?.message
      });

      // If insert succeeded, delete it
      if (testParticipant) {
        await supabase
          .from('participants')
          .delete()
          .eq('id', testParticipant.id);
        console.log('✅ Test data cleaned up');
      }

    } catch (error: any) {
      testResults.tests.push({
        name: 'General Error',
        status: 'FAILED',
        error: error.message
      });
    }

    setResults(testResults);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">🔍 Database Connection Test</h1>
        
        <button
          onClick={testConnection}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg mb-8 disabled:bg-gray-600"
        >
          {loading ? 'Testing...' : 'Run Tests'}
        </button>

        {results && (
          <div className="space-y-4">
            <div className="bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-400">Test Time: {results.timestamp}</p>
            </div>

            {results.tests.map((test: any, index: number) => (
              <div
                key={index}
                className={`p-6 rounded-lg border-2 ${
                  test.status === 'SUCCESS'
                    ? 'bg-green-900 border-green-500'
                    : 'bg-red-900 border-red-500'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">{test.name}</h3>
                  <span
                    className={`px-3 py-1 rounded font-bold ${
                      test.status === 'SUCCESS'
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                    }`}
                  >
                    {test.status}
                  </span>
                </div>

                {test.count !== undefined && (
                  <p className="text-sm mb-2">
                    Records found: <strong>{test.count}</strong>
                  </p>
                )}

                {test.error && (
                  <div className="bg-black bg-opacity-30 p-3 rounded mb-3">
                    <p className="text-red-300 text-sm font-mono">{test.error}</p>
                  </div>
                )}

                {test.data && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm text-gray-300 hover:text-white">
                      Show Data
                    </summary>
                    <pre className="mt-2 bg-black bg-opacity-50 p-3 rounded text-xs overflow-auto">
                      {JSON.stringify(test.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 bg-yellow-900 border-2 border-yellow-500 p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-3">📋 Checklist:</h3>
          <ul className="space-y-2 text-sm">
            <li>✅ Pastikan sudah menjalankan file <code className="bg-black px-2 py-1 rounded">supabase-schema.sql</code> di Supabase SQL Editor</li>
            <li>✅ Pastikan RLS (Row Level Security) sudah di-disable atau policy sudah diatur dengan benar</li>
            <li>✅ Pastikan API Key di .env.local sudah benar</li>
            <li>✅ Cek error message di atas untuk detail masalah</li>
          </ul>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            ← Kembali ke Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
