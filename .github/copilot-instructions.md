# Physical Literacy Assessment System - Copilot Instructions

## Project Overview
This is a Next.js + Supabase application for assessing physical literacy in children across multiple domains (cognitive, psychological, social) and working memory (digit span test).

## Tech Stack
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Database & Auth)
- shadcn/ui components
- Recharts (for admin dashboard)

## Project Structure
- User flow: No authentication required
- Admin panel: Requires authentication via Supabase Auth

## Scoring System
1. **Cognitive Domain**: 10 multiple choice questions (0-10 points)
   - Kurang: < 5, Cukup: = 5, Bagus: > 5
2. **Psychological Domain**: 20 questions with 0-4 Likert scale (0-80 points)
   - Kurang: < 40, Cukup: = 40, Bagus: > 40
3. **Social Domain**: 20 questions with 0-4 Likert scale (0-80 points)
   - Kurang: < 40, Cukup: = 40, Bagus: > 40
4. **Digit Span Test**: Forward & Reversed modes, starting 3 digits
   - Kurang: < 7, Cukup: = 7, Bagus: > 7

## Development Guidelines
- Use TypeScript for type safety
- Follow Next.js App Router conventions
- Use server components where possible
- Implement proper error handling
- Use Supabase RLS for data security
