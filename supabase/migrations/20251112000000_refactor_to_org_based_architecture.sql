-- Migration: Refactor from deployment-based to organization-based architecture
-- One user = One org = One website = One File Search store

-- =====================================================
-- Step 1: Extend users table with organization fields
-- =====================================================

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS organization_name TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS file_search_store_name TEXT;

-- Add constraints
ALTER TABLE public.users
ADD CONSTRAINT users_organization_name_check CHECK (char_length(organization_name) >= 2),
ADD CONSTRAINT users_website_url_check CHECK (website_url ~ '^https?://'),
ADD CONSTRAINT users_file_search_store_name_unique UNIQUE (file_search_store_name);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_users_file_search_store ON public.users(file_search_store_name);

-- Add helpful comments
COMMENT ON COLUMN public.users.organization_name IS 'Organization/company name for this user account';
COMMENT ON COLUMN public.users.website_url IS 'Main website URL where widgets will be deployed';
COMMENT ON COLUMN public.users.file_search_store_name IS 'Google File Search store resource name (unique per org)';

-- =====================================================
-- Step 2: Create widget_pages table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.widget_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  page_url TEXT NOT NULL,
  page_title TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Ensure one user can't have duplicate pages
  UNIQUE(user_id, page_url)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_widget_pages_user_id ON public.widget_pages(user_id);
CREATE INDEX IF NOT EXISTS idx_widget_pages_page_url ON public.widget_pages(page_url);

-- RLS Policies
ALTER TABLE public.widget_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own widget pages"
  ON public.widget_pages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own widget pages"
  ON public.widget_pages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own widget pages"
  ON public.widget_pages FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own widget pages"
  ON public.widget_pages FOR DELETE
  USING (auth.uid() = user_id);

-- Add helpful comment
COMMENT ON TABLE public.widget_pages IS 'Tracks which pages on the website have widget instances deployed';

-- =====================================================
-- Step 3: Update indexed_pages table
-- =====================================================

-- Add page_urls array column
ALTER TABLE public.indexed_pages
ADD COLUMN IF NOT EXISTS page_urls TEXT[];

-- Create index for page_urls array queries
CREATE INDEX IF NOT EXISTS idx_indexed_pages_page_urls ON public.indexed_pages USING GIN(page_urls);

-- Add helpful comment
COMMENT ON COLUMN public.indexed_pages.page_urls IS 'Array of page URLs where this content should be available';

-- =====================================================
-- Step 4: Clean up old deployment-based architecture
-- =====================================================

-- Remove deployment_id foreign key constraint
ALTER TABLE public.indexed_pages
DROP CONSTRAINT IF EXISTS indexed_pages_deployment_id_fkey;

-- Remove deployment_id column (will be dropped after migration complete)
-- Keeping it for now in case we need rollback
-- ALTER TABLE public.indexed_pages DROP COLUMN IF EXISTS deployment_id;

-- Drop widget_deployments table (will be dropped after migration complete)
-- Keeping it for now in case we need rollback
-- DROP TABLE IF EXISTS public.widget_deployments CASCADE;

-- =====================================================
-- Step 5: Update timestamp triggers
-- =====================================================

-- Create trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for widget_pages
DROP TRIGGER IF EXISTS handle_widget_pages_updated_at ON public.widget_pages;
CREATE TRIGGER handle_widget_pages_updated_at
  BEFORE UPDATE ON public.widget_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- Notes for completion:
-- After all code is updated and tested:
-- 1. Run: ALTER TABLE public.indexed_pages DROP COLUMN IF EXISTS deployment_id;
-- 2. Run: DROP TABLE IF EXISTS public.widget_deployments CASCADE;
-- 3. Wipe data: DELETE FROM indexed_pages; DELETE FROM scraping_jobs; DELETE FROM file_uploads;
-- =====================================================
