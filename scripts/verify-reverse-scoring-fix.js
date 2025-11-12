/**
 * Verification script for reverse scoring fix
 * This script tests if the reverse scoring is now working correctly
 */

// Mock data structure similar to database questions
const mockPsychologicalQuestions = [
  { id: 11, domain: 'psychological', order_index: 1 },
  { id: 12, domain: 'psychological', order_index: 2 },  // REVERSE
  { id: 13, domain: 'psychological', order_index: 3 },
  { id: 14, domain: 'psychological', order_index: 4 },
  { id: 15, domain: 'psychological', order_index: 5 },
  { id: 16, domain: 'psychological', order_index: 6 },  // REVERSE
  { id: 17, domain: 'psychological', order_index: 7 },
  { id: 18, domain: 'psychological', order_index: 8 },
  { id: 19, domain: 'psychological', order_index: 9 },
  { id: 20, domain: 'psychological', order_index: 10 },
  { id: 21, domain: 'psychological', order_index: 11 },
  { id: 22, domain: 'psychological', order_index: 12 },
  { id: 23, domain: 'psychological', order_index: 13 },
  { id: 24, domain: 'psychological', order_index: 14 },
  { id: 25, domain: 'psychological', order_index: 15 },
  { id: 26, domain: 'psychological', order_index: 16 },
  { id: 27, domain: 'psychological', order_index: 17 }, // REVERSE
  { id: 28, domain: 'psychological', order_index: 18 }, // REVERSE
  { id: 29, domain: 'psychological', order_index: 19 },
  { id: 30, domain: 'psychological', order_index: 20 }
];

const mockSocialQuestions = [
  { id: 31, domain: 'social', order_index: 1 },
  { id: 32, domain: 'social', order_index: 2 },
  { id: 33, domain: 'social', order_index: 3 },
  { id: 34, domain: 'social', order_index: 4 },
  { id: 35, domain: 'social', order_index: 5 },
  { id: 36, domain: 'social', order_index: 6 },
  { id: 37, domain: 'social', order_index: 7 },
  { id: 38, domain: 'social', order_index: 8 },
  { id: 39, domain: 'social', order_index: 9 },
  { id: 40, domain: 'social', order_index: 10 },
  { id: 41, domain: 'social', order_index: 11 },
  { id: 42, domain: 'social', order_index: 12 }, // REVERSE
  { id: 43, domain: 'social', order_index: 13 },
  { id: 44, domain: 'social', order_index: 14 },
  { id: 45, domain: 'social', order_index: 15 },
  { id: 46, domain: 'social', order_index: 16 }, // REVERSE
  { id: 47, domain: 'social', order_index: 17 },
  { id: 48, domain: 'social', order_index: 18 },
  { id: 49, domain: 'social', order_index: 19 },
  { id: 50, domain: 'social', order_index: 20 }
];

const reversePsychologicalOrder = [2, 6, 17, 18];
const reverseSocialOrder = [12, 16];

function calculatePsychologicalScore(answers, questions) {
  let psychologicalScore = 0;
  const psychologicalQuestions = questions.filter(q => q.domain === 'psychological');
  psychologicalQuestions.forEach(q => {
    const raw = (answers[q.id] !== undefined && answers[q.id] !== null) ? Number(answers[q.id]) : 0;
    // Use order_index to determine reverse-scored items
    const value = reversePsychologicalOrder.includes(q.order_index) ? (4 - raw) : raw;
    psychologicalScore += value;
    
    // Debug log
    if (reversePsychologicalOrder.includes(q.order_index)) {
      console.log(`  Question ID ${q.id} (order ${q.order_index}) - REVERSE: raw=${raw}, final=${value}`);
    }
  });
  return psychologicalScore;
}

function calculateSocialScore(answers, questions) {
  let socialScore = 0;
  const socialQuestions = questions.filter(q => q.domain === 'social');
  socialQuestions.forEach(q => {
    const raw = (answers[q.id] !== undefined && answers[q.id] !== null) ? Number(answers[q.id]) : 0;
    // Use order_index to determine reverse-scored items
    const value = reverseSocialOrder.includes(q.order_index) ? (4 - raw) : raw;
    socialScore += value;
    
    // Debug log
    if (reverseSocialOrder.includes(q.order_index)) {
      console.log(`  Question ID ${q.id} (order ${q.order_index}) - REVERSE: raw=${raw}, final=${value}`);
    }
  });
  return socialScore;
}

// Test Case 1: All answers = 4 (should NOT be 80 due to reverse scoring)
console.log('========================================');
console.log('TEST CASE 1: Semua jawaban = 4');
console.log('========================================');

const allFourAnswersPsy = {};
mockPsychologicalQuestions.forEach(q => {
  allFourAnswersPsy[q.id] = 4;
});

const allFourAnswersSoc = {};
mockSocialQuestions.forEach(q => {
  allFourAnswersSoc[q.id] = 4;
});

console.log('\nPSYCHOLOGICAL DOMAIN:');
console.log('Pertanyaan yang di-reverse (order_index 2, 6, 17, 18):');
const psychScore1 = calculatePsychologicalScore(allFourAnswersPsy, mockPsychologicalQuestions);
console.log(`Total Psychological Score: ${psychScore1}/80`);
console.log('Expected: 64 (16 questions × 4 + 4 reversed questions × 0)');
console.log(`✓ ${psychScore1 === 64 ? 'PASS' : 'FAIL'}`);

console.log('\nSOCIAL DOMAIN:');
console.log('Pertanyaan yang di-reverse (order_index 12, 16):');
const socialScore1 = calculateSocialScore(allFourAnswersSoc, mockSocialQuestions);
console.log(`Total Social Score: ${socialScore1}/80`);
console.log('Expected: 72 (18 questions × 4 + 2 reversed questions × 0)');
console.log(`✓ ${socialScore1 === 72 ? 'PASS' : 'FAIL'}`);

// Test Case 2: All answers = 0 (should NOT be 0 due to reverse scoring)
console.log('\n========================================');
console.log('TEST CASE 2: Semua jawaban = 0');
console.log('========================================');

const allZeroAnswersPsy = {};
mockPsychologicalQuestions.forEach(q => {
  allZeroAnswersPsy[q.id] = 0;
});

const allZeroAnswersSoc = {};
mockSocialQuestions.forEach(q => {
  allZeroAnswersSoc[q.id] = 0;
});

console.log('\nPSYCHOLOGICAL DOMAIN:');
console.log('Pertanyaan yang di-reverse (order_index 2, 6, 17, 18):');
const psychScore2 = calculatePsychologicalScore(allZeroAnswersPsy, mockPsychologicalQuestions);
console.log(`Total Psychological Score: ${psychScore2}/80`);
console.log('Expected: 16 (16 questions × 0 + 4 reversed questions × 4)');
console.log(`✓ ${psychScore2 === 16 ? 'PASS' : 'FAIL'}`);

console.log('\nSOCIAL DOMAIN:');
console.log('Pertanyaan yang di-reverse (order_index 12, 16):');
const socialScore2 = calculateSocialScore(allZeroAnswersSoc, mockSocialQuestions);
console.log(`Total Social Score: ${socialScore2}/80`);
console.log('Expected: 8 (18 questions × 0 + 2 reversed questions × 4)');
console.log(`✓ ${socialScore2 === 8 ? 'PASS' : 'FAIL'}`);

// Test Case 3: Mixed answers
console.log('\n========================================');
console.log('TEST CASE 3: Jawaban campuran (2 untuk semua)');
console.log('========================================');

const mixedAnswersPsy = {};
mockPsychologicalQuestions.forEach(q => {
  mixedAnswersPsy[q.id] = 2;
});

const mixedAnswersSoc = {};
mockSocialQuestions.forEach(q => {
  mixedAnswersSoc[q.id] = 2;
});

console.log('\nPSYCHOLOGICAL DOMAIN:');
const psychScore3 = calculatePsychologicalScore(mixedAnswersPsy, mockPsychologicalQuestions);
console.log(`Total Psychological Score: ${psychScore3}/80`);
console.log('Expected: 40 (16 questions × 2 + 4 reversed questions × 2)');
console.log(`✓ ${psychScore3 === 40 ? 'PASS' : 'FAIL'}`);

console.log('\nSOCIAL DOMAIN:');
const socialScore3 = calculateSocialScore(mixedAnswersSoc, mockSocialQuestions);
console.log(`Total Social Score: ${socialScore3}/80`);
console.log('Expected: 40 (18 questions × 2 + 2 reversed questions × 2)');
console.log(`✓ ${socialScore3 === 40 ? 'PASS' : 'FAIL'}`);

console.log('\n========================================');
console.log('SUMMARY');
console.log('========================================');
const allPassed = (
  psychScore1 === 64 && 
  socialScore1 === 72 && 
  psychScore2 === 16 && 
  socialScore2 === 8 &&
  psychScore3 === 40 &&
  socialScore3 === 40
);
console.log(allPassed ? '✅ ALL TESTS PASSED!' : '❌ SOME TESTS FAILED!');
console.log('\nNOTE: Jika semua test PASS, berarti reverse scoring sudah bekerja dengan benar.');
console.log('Sekarang jika user memilih 4 semua, hasilnya TIDAK akan 80 lagi!');
