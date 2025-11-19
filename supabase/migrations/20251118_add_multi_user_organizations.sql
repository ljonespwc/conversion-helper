-- Migration: Add Multi-User Organizations
-- Transform from single-user-per-org to multiple-users-per-org
-- Architecture: Single-org-per-user (simpler than full multi-tenant)
--
-- Changes:
-- 1. Create organizations table (move org data from users)
-- 2. Add organization_id + role to users
-- 3. Add organization_id to content tables (widget_pages, indexed_pages, scraping_jobs, file_uploads)
-- 4. Rename user_id → created_by_user_id on content tables (audit trail)
-- 5. Add organization_id to conversation_sessions (cleaner analytics)
-- 6. Rewrite ALL RLS policies to filter by organization
-- 7. Add indexes for performance

-- =====================================================
-- Step 1: Create organizations table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(name) >= 2),
  website_url TEXT CHECK (website_url ~ '^https?://'),
  file_search_store_name TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add helpful comments
COMMENT ON TABLE public.organizations IS 'Organizations that own widget deployments and content';
COMMENT ON COLUMN public.organizations.name IS 'Organization/company name';
COMMENT ON COLUMN public.organizations.website_url IS 'Main website URL where widgets are deployed';
COMMENT ON COLUMN public.organizations.file_search_store_name IS 'Google File Search store resource name (unique per org)';

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_organizations_file_search_store ON public.organizations(file_search_store_name);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS handle_organizations_updated_at ON public.organizations;
CREATE TRIGGER handle_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- RLS: Users can view their own organization
CREATE POLICY "Users can view their organization"
  ON public.organizations FOR SELECT
  USING (id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

-- =====================================================
-- Step 2: Migrate existing data to organizations
-- =====================================================

-- Insert existing users' organizations
INSERT INTO public.organizations (name, website_url, file_search_store_name)
SELECT
  COALESCE(organization_name, 'Organization'), -- Fallback if null
  website_url,
  file_search_store_name
FROM public.users
WHERE organization_name IS NOT NULL OR website_url IS NOT NULL OR file_search_store_name IS NOT NULL
ON CONFLICT (file_search_store_name) DO NOTHING; -- Skip if already exists

-- =====================================================
-- Step 3: Update users table
-- =====================================================

-- Add new columns
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'admin' CHECK (role IN ('owner', 'admin', 'editor', 'analyst'));

-- Populate organization_id for existing users (match by file_search_store_name)
UPDATE public.users u
SET organization_id = o.id
FROM public.organizations o
WHERE u.file_search_store_name = o.file_search_store_name;

-- Set role to 'owner' for existing users (they created the org)
UPDATE public.users
SET role = 'owner'
WHERE organization_id IS NOT NULL;

-- Make organization_id NOT NULL after backfill
ALTER TABLE public.users
ALTER COLUMN organization_id SET NOT NULL;

-- Add helpful comments
COMMENT ON COLUMN public.users.organization_id IS 'Organization this user belongs to';
COMMENT ON COLUMN public.users.role IS 'User role: owner (created org), admin (full access), editor (content only), analyst (read-only)';

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON public.users(organization_id);

-- Drop old RLS policies
DROP POLICY IF EXISTS "Users can view own record" ON public.users;
DROP POLICY IF EXISTS "Users can insert own record" ON public.users;
DROP POLICY IF EXISTS "Users can update own record" ON public.users;
DROP POLICY IF EXISTS "Users can delete own record" ON public.users;

-- New RLS policies
CREATE POLICY "Users can view org members"
  ON public.users FOR SELECT
  USING (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can insert own record"
  ON public.users FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update own record"
  ON public.users FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Users can delete own record"
  ON public.users FOR DELETE
  USING (id = auth.uid());

-- =====================================================
-- Step 4: Update widget_pages table
-- =====================================================

-- Add organization_id
ALTER TABLE public.widget_pages
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Backfill organization_id from user's organization
UPDATE public.widget_pages wp
SET organization_id = u.organization_id
FROM public.users u
WHERE wp.user_id = u.id;

-- Make organization_id NOT NULL after backfill
ALTER TABLE public.widget_pages
ALTER COLUMN organization_id SET NOT NULL;

-- Rename user_id to created_by_user_id (audit trail)
ALTER TABLE public.widget_pages
RENAME COLUMN user_id TO created_by_user_id;

-- Create index
CREATE INDEX IF NOT EXISTS idx_widget_pages_organization_id ON public.widget_pages(organization_id);

-- Drop old RLS policies
DROP POLICY IF EXISTS "Users can view their own widget pages" ON public.widget_pages;
DROP POLICY IF EXISTS "Users can insert their own widget pages" ON public.widget_pages;
DROP POLICY IF EXISTS "Users can update their own widget pages" ON public.widget_pages;
DROP POLICY IF EXISTS "Users can delete their own widget pages" ON public.widget_pages;

-- New RLS policies
CREATE POLICY "Org members can view widget pages"
  ON public.widget_pages FOR SELECT
  USING (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Org members can insert widget pages"
  ON public.widget_pages FOR INSERT
  WITH CHECK (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Org members can update widget pages"
  ON public.widget_pages FOR UPDATE
  USING (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Org members can delete widget pages"
  ON public.widget_pages FOR DELETE
  USING (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

-- =====================================================
-- Step 5: Update indexed_pages table
-- =====================================================

-- Add organization_id
ALTER TABLE public.indexed_pages
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Backfill organization_id from user's organization
UPDATE public.indexed_pages ip
SET organization_id = u.organization_id
FROM public.users u
WHERE ip.user_id = u.id;

-- Make organization_id NOT NULL after backfill
ALTER TABLE public.indexed_pages
ALTER COLUMN organization_id SET NOT NULL;

-- Rename user_id to created_by_user_id (audit trail)
ALTER TABLE public.indexed_pages
RENAME COLUMN user_id TO created_by_user_id;

-- Create index
CREATE INDEX IF NOT EXISTS idx_indexed_pages_organization_id ON public.indexed_pages(organization_id);

-- Drop old RLS policies
DROP POLICY IF EXISTS "Users can view own indexed pages" ON public.indexed_pages;
DROP POLICY IF EXISTS "Users can insert own indexed pages" ON public.indexed_pages;
DROP POLICY IF EXISTS "Users can update own indexed pages" ON public.indexed_pages;
DROP POLICY IF EXISTS "Users can delete own indexed pages" ON public.indexed_pages;

-- New RLS policies
CREATE POLICY "Org members can view indexed pages"
  ON public.indexed_pages FOR SELECT
  USING (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Org members can insert indexed pages"
  ON public.indexed_pages FOR INSERT
  WITH CHECK (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Org members can update indexed pages"
  ON public.indexed_pages FOR UPDATE
  USING (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Org members can delete indexed pages"
  ON public.indexed_pages FOR DELETE
  USING (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

-- =====================================================
-- Step 6: Update scraping_jobs table
-- =====================================================

-- Add organization_id
ALTER TABLE public.scraping_jobs
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Backfill organization_id from user's organization
UPDATE public.scraping_jobs sj
SET organization_id = u.organization_id
FROM public.users u
WHERE sj.user_id = u.id;

-- Make organization_id NOT NULL after backfill
ALTER TABLE public.scraping_jobs
ALTER COLUMN organization_id SET NOT NULL;

-- Rename user_id to created_by_user_id (audit trail)
ALTER TABLE public.scraping_jobs
RENAME COLUMN user_id TO created_by_user_id;

-- Create index
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_organization_id ON public.scraping_jobs(organization_id);

-- Drop old RLS policies
DROP POLICY IF EXISTS "Users can view own scraping jobs" ON public.scraping_jobs;
DROP POLICY IF EXISTS "Users can insert own scraping jobs" ON public.scraping_jobs;
DROP POLICY IF EXISTS "Users can update own scraping jobs" ON public.scraping_jobs;
DROP POLICY IF EXISTS "Users can delete own scraping jobs" ON public.scraping_jobs;

-- New RLS policies
CREATE POLICY "Org members can view scraping jobs"
  ON public.scraping_jobs FOR SELECT
  USING (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Org members can insert scraping jobs"
  ON public.scraping_jobs FOR INSERT
  WITH CHECK (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Org members can update scraping jobs"
  ON public.scraping_jobs FOR UPDATE
  USING (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Org members can delete scraping jobs"
  ON public.scraping_jobs FOR DELETE
  USING (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

-- =====================================================
-- Step 7: Update file_uploads table
-- =====================================================

-- Add organization_id
ALTER TABLE public.file_uploads
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Backfill organization_id from user's organization
UPDATE public.file_uploads fu
SET organization_id = u.organization_id
FROM public.users u
WHERE fu.user_id = u.id;

-- Make organization_id NOT NULL after backfill
ALTER TABLE public.file_uploads
ALTER COLUMN organization_id SET NOT NULL;

-- Rename user_id to created_by_user_id (audit trail)
ALTER TABLE public.file_uploads
RENAME COLUMN user_id TO created_by_user_id;

-- Create index
CREATE INDEX IF NOT EXISTS idx_file_uploads_organization_id ON public.file_uploads(organization_id);

-- Drop old RLS policies
DROP POLICY IF EXISTS "Users can view own uploads" ON public.file_uploads;
DROP POLICY IF EXISTS "Users can insert own uploads" ON public.file_uploads;
DROP POLICY IF EXISTS "Users can update own uploads" ON public.file_uploads;
DROP POLICY IF EXISTS "Users can delete own uploads" ON public.file_uploads;

-- New RLS policies
CREATE POLICY "Org members can view file uploads"
  ON public.file_uploads FOR SELECT
  USING (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Org members can insert file uploads"
  ON public.file_uploads FOR INSERT
  WITH CHECK (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Org members can update file uploads"
  ON public.file_uploads FOR UPDATE
  USING (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Org members can delete file uploads"
  ON public.file_uploads FOR DELETE
  USING (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

-- =====================================================
-- Step 8: Update conversation_sessions table (optional but cleaner)
-- =====================================================

-- Add organization_id (nullable - conversations may exist before org lookup)
ALTER TABLE public.conversation_sessions
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;

-- Create index
CREATE INDEX IF NOT EXISTS idx_conversation_sessions_organization_id ON public.conversation_sessions(organization_id);

-- Note: No RLS changes needed - conversations remain publicly accessible for widget

-- =====================================================
-- Step 9: Drop old columns from users table
-- =====================================================

-- Now safe to drop old org fields from users
ALTER TABLE public.users
DROP COLUMN IF EXISTS organization_name,
DROP COLUMN IF EXISTS website_url,
DROP COLUMN IF EXISTS file_search_store_name;

-- =====================================================
-- Rollback Instructions (if needed)
-- =====================================================
--
-- To rollback this migration:
-- 1. Restore user_id columns on content tables:
--    ALTER TABLE widget_pages RENAME COLUMN created_by_user_id TO user_id;
-- 2. Drop organization_id columns
-- 3. Restore old RLS policies
-- 4. Add back organization_name, website_url, file_search_store_name to users
-- 5. DROP TABLE organizations;
--
-- =====================================================
