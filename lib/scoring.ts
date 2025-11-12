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
