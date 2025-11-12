// Test script for reverse-scoring logic
// Run with: node scripts/test-reverse-scoring.js

const reversePsychologicalQuestions = [2, 6, 17, 18];
const reverseSocialQuestions = [12, 16];

function calculatePsychologicalScore(answers, questions) {
  let psychologicalScore = 0;
  const psychologicalQuestions = questions.filter(q => q.domain === 'psychological');
  psychologicalQuestions.forEach(q => {
    const raw = (answers[q.id] !== undefined && answers[q.id] !== null) ? Number(answers[q.id]) : 0;
    const value = reversePsychologicalQuestions.includes(q.id) ? (4 - raw) : raw;
    psychologicalScore += value;
  });
  return psychologicalScore;
}

function calculateSocialScore(answers, questions) {
  let socialScore = 0;
  const socialQuestions = questions.filter(q => q.domain === 'social');
  socialQuestions.forEach(q => {
    const raw = (answers[q.id] !== undefined && answers[q.id] !== null) ? Number(answers[q.id]) : 0;
    const value = reverseSocialQuestions.includes(q.id) ? (4 - raw) : raw;
    socialScore += value;
  });
  return socialScore;
}

// Build sample questions: 20 psychological, 20 social. IDs chosen so reverse IDs fall into correct domain.
const questions = [];
// Psychological questions ids include 2,6,17,18
const psychIds = [1,2,3,4,5,6,7,8,9,10,11,17,18,19,20,21,22,23,24,25];
psychIds.forEach(id => questions.push({ id, domain: 'psychological' }));

// Social questions ids include 12,16
const socialIds = [26,27,28,29,30,31,32,33,34,35,36,12,13,14,15,16,37,38,39,40];
socialIds.forEach(id => questions.push({ id, domain: 'social' }));

// Helper to create answers mapping for given value for all question ids
function answersWith(value) {
  const answers = {};
  questions.forEach(q => answers[q.id] = value);
  return answers;
}

// Test cases
const tests = [
  {
    name: 'All answers = 4',
    answers: answersWith(4),
    expectedPsych: null, // compute
    expectedSocial: null
  },
  {
    name: 'All answers = 0',
    answers: answersWith(0),
  },
  {
    name: 'Non-reverse 4, reverse 0',
    answers: answersWith(4),
    modify: (a) => { reversePsychologicalQuestions.forEach(id => a[id]=0); reverseSocialQuestions.forEach(id => a[id]=0); }
  },
  {
    name: 'Non-reverse 0, reverse 4',
    answers: answersWith(0),
    modify: (a) => { reversePsychologicalQuestions.forEach(id => a[id]=4); reverseSocialQuestions.forEach(id => a[id]=4); }
  }
];

console.log('Testing reverse scoring logic (psychological reverse IDs =', reversePsychologicalQuestions, ', social reverse IDs =', reverseSocialQuestions, ')');

tests.forEach(t => {
  const ans = { ...t.answers };
  if (t.modify) t.modify(ans);
  const psy = calculatePsychologicalScore(ans, questions);
  const soc = calculateSocialScore(ans, questions);
  console.log('---');
  console.log(t.name);
  console.log('Psychological score:', psy, '/ 80');
  console.log('Social score       :', soc, '/ 80');
});

// Also show detailed breakdown for one scenario
const sample = answersWith(4);
reversePsychologicalQuestions.forEach(id => sample[id] = 4); // all 4
reverseSocialQuestions.forEach(id => sample[id] = 4);
console.log('\nDetailed breakdown for All 4 (psychological):');
questions.filter(q => q.domain === 'psychological').forEach(q => {
  const raw = sample[q.id];
  const val = reversePsychologicalQuestions.includes(q.id) ? (4 - raw) : raw;
  console.log('Q', q.id, 'raw=', raw, 'scored=', val);
});

console.log('\nDetailed breakdown for All 4 (social):');
questions.filter(q => q.domain === 'social').forEach(q => {
  const raw = sample[q.id];
  const val = reverseSocialQuestions.includes(q.id) ? (4 - raw) : raw;
  console.log('Q', q.id, 'raw=', raw, 'scored=', val);
});
