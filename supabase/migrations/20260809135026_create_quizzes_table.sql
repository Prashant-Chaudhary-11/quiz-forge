/*
# Create quizzes table (single-tenant, no auth)

1. New Tables
- `quizzes`
  - `id` (uuid, primary key)
  - `title` (text, not null) — user-provided or auto title for the quiz
  - `source_content` (text, not null) — the study material text the quiz was generated from
  - `source_label` (text) — short label describing the source (e.g. "uploaded PDF", "pasted text")
  - `category` (text, not null) — difficulty/category: "normal", "competitive", or custom
  - `question_count` (integer, not null) — how many questions the user requested
  - `module_types` (text[], not null) — array of module types included (e.g. ["mcq","fill_blank"])
  - `quiz_data` (jsonb, not null) — the full generated quiz structure (questions, answers, options)
  - `created_at` (timestamptz, default now())
2. Security
- Enable RLS on `quizzes`.
- Allow anon + authenticated full CRUD because there is no sign-in and quizzes are intentionally shared/public.
*/

CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  source_content text NOT NULL,
  source_label text,
  category text NOT NULL,
  question_count integer NOT NULL,
  module_types text[] NOT NULL,
  quiz_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_quizzes" ON quizzes;
CREATE POLICY "anon_select_quizzes" ON quizzes FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_quizzes" ON quizzes;
CREATE POLICY "anon_insert_quizzes" ON quizzes FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_quizzes" ON quizzes;
CREATE POLICY "anon_update_quizzes" ON quizzes FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_quizzes" ON quizzes;
CREATE POLICY "anon_delete_quizzes" ON quizzes FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_quizzes_created_at ON quizzes (created_at DESC);
