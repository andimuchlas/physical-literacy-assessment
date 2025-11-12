// Export utilities for research data with codebook and multiple formats

export interface ExportParticipant {
  id: number;
  name: string;
  age: number;
  cognitive_score: number;
  psychological_score: number;
  social_score: number;
  digit_span_score: number;
  created_at: string;
  responses?: Record<number, number>;
  response_time_seconds?: number;
}

export interface CodebookEntry {
  variableName: string;
  label: string;
  type: 'numeric' | 'categorical' | 'ordinal' | 'text';
  values?: string;
  notes: string;
  isReverseCoded?: boolean;
}

// Generate comprehensive codebook
export function generateCodebook(questions: any[]): CodebookEntry[] {
  const codebook: CodebookEntry[] = [
    {
      variableName: 'participant_id',
      label: 'Participant ID',
      type: 'numeric',
      notes: 'Unique identifier for each participant'
    },
    {
      variableName: 'name',
      label: 'Participant Name',
      type: 'text',
      notes: 'Full name (use anonymized code for published data)'
    },
    {
      variableName: 'age',
      label: 'Age',
      type: 'numeric',
      values: '15-18',
      notes: 'Age in years at time of assessment'
    },
    {
      variableName: 'cognitive_score',
      label: 'Cognitive Domain Score',
      type: 'numeric',
      values: '0-10',
      notes: 'Total correct answers in cognitive domain (multiple choice)'
    },
    {
      variableName: 'psychological_score',
      label: 'Psychological Domain Score',
      type: 'numeric',
      values: '0-80',
      notes: 'Sum of psychological items (Likert 0-4), reverse-scored items already calculated'
    },
    {
      variableName: 'social_score',
      label: 'Social Domain Score',
      type: 'numeric',
      values: '0-80',
      notes: 'Sum of social items (Likert 0-4), reverse-scored items already calculated'
    },
    {
      variableName: 'digit_span_score',
      label: 'Digit Span Score',
      type: 'numeric',
      values: '3-15',
      notes: 'Maximum digit span achieved (working memory capacity)'
    },
    {
      variableName: 'response_time_seconds',
      label: 'Total Response Time',
      type: 'numeric',
      notes: 'Total time to complete assessment in seconds'
    },
    {
      variableName: 'created_at',
      label: 'Assessment Date',
      type: 'text',
      notes: 'Date and time assessment was completed (ISO 8601 format)'
    }
  ];

  // Add cognitive questions
  const cognitiveQuestions = questions.filter(q => q.domain === 'cognitive');
  cognitiveQuestions.forEach(q => {
    codebook.push({
      variableName: `cog_q${q.order_index}`,
      label: `Cognitive Q${q.order_index}`,
      type: 'categorical',
      values: '0-3 (0=A, 1=B, 2=C, 3=D)',
      notes: `"${q.question_text.substring(0, 50)}..." | Correct answer: ${q.correct_answer}`
    });
  });

  // Add psychological questions with reverse coding info
  const reversePsychological = [2, 6, 17, 18];
  const psychologicalQuestions = questions.filter(q => q.domain === 'psychological');
  psychologicalQuestions.forEach(q => {
    const isReverse = reversePsychological.includes(q.order_index);
    codebook.push({
      variableName: `psy_q${q.order_index}${isReverse ? '_r' : ''}`,
      label: `Psychological Q${q.order_index}${isReverse ? ' (R)' : ''}`,
      type: 'ordinal',
      values: '0-4 (0=Sangat Tidak Setuju, 1=Tidak Setuju, 2=Netral, 3=Setuju, 4=Sangat Setuju)',
      notes: `"${q.question_text.substring(0, 50)}..."${isReverse ? ' | REVERSE SCORED' : ''}`,
      isReverseCoded: isReverse
    });
  });

  // Add social questions with reverse coding info
  const reverseSocial = [12, 16];
  const socialQuestions = questions.filter(q => q.domain === 'social');
  socialQuestions.forEach(q => {
    const isReverse = reverseSocial.includes(q.order_index);
    codebook.push({
      variableName: `soc_q${q.order_index}${isReverse ? '_r' : ''}`,
      label: `Social Q${q.order_index}${isReverse ? ' (R)' : ''}`,
      type: 'ordinal',
      values: '0-4 (0=Sangat Tidak Setuju, 1=Tidak Setuju, 2=Netral, 3=Setuju, 4=Sangat Setuju)',
      notes: `"${q.question_text.substring(0, 50)}..."${isReverse ? ' | REVERSE SCORED' : ''}`,
      isReverseCoded: isReverse
    });
  });

  return codebook;
}

// Convert to CSV format
export function convertToCSV(participants: ExportParticipant[], codebook: CodebookEntry[]): string {
  const headers = codebook.map(entry => entry.variableName);
  const csvRows = [headers.join(',')];

  participants.forEach(participant => {
    const row: string[] = [];
    codebook.forEach(entry => {
      let value = '';
      if (entry.variableName === 'participant_id') value = participant.id.toString();
      else if (entry.variableName === 'name') value = `"${participant.name}"`;
      else if (entry.variableName === 'age') value = participant.age.toString();
      else if (entry.variableName === 'cognitive_score') value = participant.cognitive_score.toString();
      else if (entry.variableName === 'psychological_score') value = participant.psychological_score.toString();
      else if (entry.variableName === 'social_score') value = participant.social_score.toString();
      else if (entry.variableName === 'digit_span_score') value = participant.digit_span_score.toString();
      else if (entry.variableName === 'response_time_seconds') value = participant.response_time_seconds?.toString() || '';
      else if (entry.variableName === 'created_at') value = participant.created_at;
      else if (participant.responses) {
        // Extract individual responses
        const questionMatch = entry.variableName.match(/_(q\d+)/);
        if (questionMatch) {
          const orderIndex = parseInt(questionMatch[1].replace('q', ''));
          // Find question ID by order_index (this requires questions data)
          // For now, use responses directly if keyed by question_id
          value = ''; // Will be populated by caller with actual response data
        }
      }
      row.push(value);
    });
    csvRows.push(row.join(','));
  });

  return csvRows.join('\n');
}

// Generate codebook as CSV
export function generateCodebookCSV(codebook: CodebookEntry[]): string {
  const headers = ['Variable Name', 'Label', 'Type', 'Values', 'Notes', 'Reverse Coded'];
  const rows = [headers.join(',')];

  codebook.forEach(entry => {
    rows.push([
      entry.variableName,
      `"${entry.label}"`,
      entry.type,
      `"${entry.values || ''}"`,
      `"${entry.notes}"`,
      entry.isReverseCoded ? 'Yes' : 'No'
    ].join(','));
  });

  return rows.join('\n');
}

// Calculate descriptive statistics
export function calculateDescriptiveStats(scores: number[]) {
  if (scores.length === 0) return null;

  const sorted = [...scores].sort((a, b) => a - b);
  const n = scores.length;
  const mean = scores.reduce((sum, val) => sum + val, 0) / n;
  
  // Standard deviation
  const variance = scores.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
  const sd = Math.sqrt(variance);
  
  // Min, max
  const min = sorted[0];
  const max = sorted[n - 1];
  
  // Median
  const median = n % 2 === 0 
    ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 
    : sorted[Math.floor(n / 2)];
  
  // Quartiles
  const q1Index = Math.floor(n * 0.25);
  const q3Index = Math.floor(n * 0.75);
  const q1 = sorted[q1Index];
  const q3 = sorted[q3Index];
  
  return {
    n,
    mean: parseFloat(mean.toFixed(2)),
    sd: parseFloat(sd.toFixed(2)),
    min,
    max,
    median: parseFloat(median.toFixed(2)),
    q1,
    q3,
    range: max - min
  };
}

// Detect straight-lining (same answer for all questions)
export function detectStraightLining(responses: Record<number, number>): boolean {
  const values = Object.values(responses);
  if (values.length < 5) return false;
  
  const firstValue = values[0];
  const allSame = values.every(v => v === firstValue);
  return allSame;
}

// Calculate response time metrics
export function analyzeResponseTime(timeSeconds: number): {
  category: 'too_fast' | 'normal' | 'slow';
  flag: boolean;
  message: string;
} {
  // Expected: 30 minutes average (1800 seconds)
  // Too fast: < 10 minutes (600 seconds)
  // Slow: > 60 minutes (3600 seconds)
  
  if (timeSeconds < 600) {
    return {
      category: 'too_fast',
      flag: true,
      message: 'Completed in less than 10 minutes - may indicate insufficient attention'
    };
  } else if (timeSeconds > 3600) {
    return {
      category: 'slow',
      flag: true,
      message: 'Took more than 60 minutes - may indicate distractions or interruptions'
    };
  }
  
  return {
    category: 'normal',
    flag: false,
    message: 'Normal completion time'
  };
}

// Generate sample characteristics table (for publication)
export function generateSampleCharacteristics(participants: ExportParticipant[]): string {
  const total = participants.length;
  const ages = participants.map(p => p.age);
  const ageStats = calculateDescriptiveStats(ages);
  
  // Age distribution
  const ageDistribution: Record<number, number> = {};
  ages.forEach(age => {
    ageDistribution[age] = (ageDistribution[age] || 0) + 1;
  });
  
  let output = '═══════════════════════════════════════\n';
  output += '       SAMPLE CHARACTERISTICS\n';
  output += '═══════════════════════════════════════\n\n';
  output += `Total Participants: ${total}\n\n`;
  
  output += 'Age Distribution:\n';
  Object.keys(ageDistribution).sort().forEach(age => {
    const count = ageDistribution[parseInt(age)];
    const percent = ((count / total) * 100).toFixed(1);
    output += `  ${age} years: ${count} (${percent}%)\n`;
  });
  
  if (ageStats) {
    output += `\nAge: M = ${ageStats.mean}, SD = ${ageStats.sd}\n`;
    output += `Range: ${ageStats.min} - ${ageStats.max} years\n`;
  }
  
  return output;
}
