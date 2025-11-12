-- Migration: Move scraped markdown from database to Supabase Storage
-- Date: 2025-11-12
-- Description: Add file_path column and remove markdown_content column from scraping_jobs table

-- Add file_path column to store Supabase Storage path
ALTER TABLE scraping_jobs
ADD COLUMN IF NOT EXISTS file_path TEXT;

-- Add user_id column for storage folder organization (consistent with file_uploads)
ALTER TABLE scraping_jobs
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index on file_path for faster lookups
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_file_path ON scraping_jobs(file_path);

-- Create index on user_id
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_user_id ON scraping_jobs(user_id);

-- Drop markdown_content column (moving to Storage)
ALTER TABLE scraping_jobs
DROP COLUMN IF EXISTS markdown_content;

-- Add RLS policies for user isolation
ALTER TABLE scraping_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own scraping jobs" ON scraping_jobs;
CREATE POLICY "Users can view own scraping jobs"
  ON scraping_jobs FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own scraping jobs" ON scraping_jobs;
CREATE POLICY "Users can insert own scraping jobs"
  ON scraping_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own scraping jobs" ON scraping_jobs;
CREATE POLICY "Users can update own scraping jobs"
  ON scraping_jobs FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own scraping jobs" ON scraping_jobs;
CREATE POLICY "Users can delete own scraping jobs"
  ON scraping_jobs FOR DELETE
  USING (auth.uid() = user_id);
