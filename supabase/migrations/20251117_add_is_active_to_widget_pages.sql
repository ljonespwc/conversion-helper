-- Add is_active column to widget_pages table
-- This allows admins to temporarily disable the widget on specific pages
-- without deleting the page configuration

ALTER TABLE widget_pages
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add index for performance when filtering by active status
CREATE INDEX IF NOT EXISTS idx_widget_pages_is_active
ON widget_pages(is_active);

-- Add helpful comment
COMMENT ON COLUMN widget_pages.is_active IS 'Whether the widget is currently active on this page. Set to false to temporarily disable without deleting.';
