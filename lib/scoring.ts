// Scoring utilities for assessment results

export function getCognitiveCategory(score: number): {
  category: string;
  color: string;
  description: string;
} {
  if (score < 5) {
    return {
      category: 'Kurang',
      color: 'red',
      description: 'Perlu peningkatan dalam aspek kognitif'
    };
  } else if (score === 5) {
    return {
      category: 'Cukup',
      color: 'yellow',
      description: 'Kemampuan kognitif memadai'
    };
  } else {
    return {
      category: 'Bagus',
      color: 'green',
      description: 'Kemampuan kognitif sangat baik'
    };
  }
}

export function getPsychologicalCategory(score: number): {
  category: string;
  color: string;
  description: string;
} {
  if (score < 40) {
    return {
      category: 'Kurang',
      color: 'red',
      description: 'Perlu peningkatan dalam aspek psikologis'
    };
  } else if (score === 40) {
    return {
      category: 'Cukup',
      color: 'yellow',
      description: 'Aspek psikologis memadai'
    };
  } else {
    return {
      category: 'Bagus',
      color: 'green',
      description: 'Aspek psikologis sangat baik'
    };
  }
}

export function getSocialCategory(score: number): {
  category: string;
  color: string;
  description: string;
} {
  if (score < 40) {
    return {
      category: 'Kurang',
      color: 'red',
      description: 'Perlu peningkatan dalam aspek sosial'
    };
  } else if (score === 40) {
    return {
      category: 'Cukup',
      color: 'yellow',
      description: 'Aspek sosial memadai'
    };
  } else {
    return {
      category: 'Bagus',
      color: 'green',
      description: 'Aspek sosial sangat baik'
    };
  }
}

export function getDigitSpanCategory(score: number): {
  category: string;
  color: string;
  description: string;
} {
  if (score < 7) {
    return {
      category: 'Kurang',
      color: 'red',
      description: 'Memori kerja perlu peningkatan'
    };
  } else if (score === 7) {
    return {
      category: 'Cukup',
      color: 'yellow',
      description: 'Memori kerja memadai'
    };
  } else {
    return {
      category: 'Bagus',
      color: 'green',
      description: 'Memori kerja sangat baik'
    };
  }
}

export function getWeakDomains(
  cognitiveScore: number,
  psychologicalScore: number,
  socialScore: number,
  digitSpanScore: number
): string[] {
  const weakDomains: string[] = [];
  
  if (cognitiveScore < 5) weakDomains.push('Kognitif');
  if (psychologicalScore < 40) weakDomains.push('Psikologis');
  if (socialScore < 40) weakDomains.push('Sosial');
  if (digitSpanScore < 7) weakDomains.push('Memori');
  
  return weakDomains;
}

// Reverse-scored question order_index within each domain (Likert 0-4 scale).
// These numbers refer to the question's `order_index` in the domain, not global DB id.
export const reversePsychologicalOrder = [2, 6, 17, 18];
export const reverseSocialOrder = [12, 16];

// Helper to compute psychological score from answers and question list.
// answers: record of questionId -> numeric answer (0-4)
// questions: array of question objects with at least an `id`, `domain` and `order_index` property
export function calculatePsychologicalScore(answers: Record<number, number> | any, questions: any[]): number {
  let psychologicalScore = 0;
  const psychologicalQuestions = questions.filter(q => q.domain === 'psychological');
  psychologicalQuestions.forEach(q => {
    const raw = (answers[q.id] !== undefined && answers[q.id] !== null) ? Number(answers[q.id]) : 0;
    // FIXED: use order_index (not q.id) to determine reverse-scored items
    const value = reversePsychologicalOrder.includes(q.order_index) ? (4 - raw) : raw;
    psychologicalScore += value;
  });
  return psychologicalScore;
}

export function calculateSocialScore(answers: Record<number, number> | any, questions: any[]): number {
  let socialScore = 0;
  const socialQuestions = questions.filter(q => q.domain === 'social');
  socialQuestions.forEach(q => {
    const raw = (answers[q.id] !== undefined && answers[q.id] !== null) ? Number(answers[q.id]) : 0;
    // FIXED: use order_index (not q.id) to determine reverse-scored items
    const value = reverseSocialOrder.includes(q.order_index) ? (4 - raw) : raw;
    socialScore += value;
  });
  return socialScore;
}
