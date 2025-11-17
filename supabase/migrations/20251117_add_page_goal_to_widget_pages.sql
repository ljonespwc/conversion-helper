-- Migration: Add page goal to widget pages
-- Date: 2025-11-17
-- Description: Add page_goal column to allow admins to set conversion goals (sell, lead, support) for each page

-- Add page_goal column to widget_pages
ALTER TABLE widget_pages
ADD COLUMN IF NOT EXISTS page_goal TEXT;

-- Add check constraint to enforce valid goal values
ALTER TABLE widget_pages
ADD CONSTRAINT page_goal_valid_values
CHECK (page_goal IS NULL OR page_goal IN ('sell', 'lead', 'support'));

-- Add column comment
COMMENT ON COLUMN widget_pages.page_goal IS 'Conversion goal for this page: sell (drive purchase), lead (capture email), support (help existing customers)';
