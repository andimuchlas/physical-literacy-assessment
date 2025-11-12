import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Participant {
  id: number;
  name: string;
  age: number;
  gender?: string;
  cognitive_score: number;
  psychological_score: number;
  social_score: number;
  digit_span_score: number;
  response_time_seconds?: number;
  has_straight_lining?: boolean;
  response_quality?: string;
  created_at: string;
}

export interface Question {
  id: number;
  domain: 'cognitive' | 'psychological' | 'social';
  question_text: string;
  question_type: 'multiple_choice' | 'likert';
  options?: string[]; // For multiple choice questions
  correct_answer?: number; // For cognitive questions
  order_index: number;
  created_at: string;
}

export interface Response {
  id: number;
  participant_id: number;
  question_id: number;
  answer_value: number;
  created_at: string;
}

export interface DigitSpanResult {
  id: number;
  participant_id: number;
  mode: 'forward' | 'reversed';
  max_span: number;
  attempts: number;
  created_at: string;
}
