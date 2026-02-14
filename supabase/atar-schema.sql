-- Run this in Supabase SQL Editor (PostgreSQL).
-- Then run the output of: node scripts/parse-atar-2021.mjs

CREATE TABLE IF NOT EXISTS subjects (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  units INTEGER DEFAULT 2
);

CREATE TABLE IF NOT EXISTS scaling_stats (
  id BIGSERIAL PRIMARY KEY,
  subject_id BIGINT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  percentile REAL NOT NULL,
  scaled_mark REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS atar_conversion (
  id BIGSERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  aggregate REAL NOT NULL,
  atar REAL NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_scaling_stats_subject_year ON scaling_stats(subject_id, year);
CREATE INDEX IF NOT EXISTS idx_atar_conversion_year ON atar_conversion(year);

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE scaling_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE atar_conversion ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read on subjects" ON subjects;
DROP POLICY IF EXISTS "Allow public read on scaling_stats" ON scaling_stats;
DROP POLICY IF EXISTS "Allow public read on atar_conversion" ON atar_conversion;

CREATE POLICY "Allow public read on subjects" ON subjects FOR SELECT USING (true);
CREATE POLICY "Allow public read on scaling_stats" ON scaling_stats FOR SELECT USING (true);
CREATE POLICY "Allow public read on atar_conversion" ON atar_conversion FOR SELECT USING (true);
