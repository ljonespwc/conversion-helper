-- Migration: Add role and timestamp fields to conversation_messages
-- Date: 2025-11-14
-- Description: Enable storage of both user and assistant messages with proper role tracking and timestamps

-- Add role column to distinguish user vs assistant messages
ALTER TABLE conversation_messages
ADD COLUMN IF NOT EXISTS role TEXT;

-- Add check constraint for valid roles
ALTER TABLE conversation_messages
DROP CONSTRAINT IF EXISTS conversation_messages_role_check;

ALTER TABLE conversation_messages
ADD CONSTRAINT conversation_messages_role_check
CHECK (role IN ('user', 'assistant'));

-- Rename 'question' to 'message' for more generic use
ALTER TABLE conversation_messages
RENAME COLUMN question TO message;

-- Add timestamp column (Unix timestamp from Layercode)
ALTER TABLE conversation_messages
ADD COLUMN IF NOT EXISTS timestamp BIGINT;

-- Backfill existing rows with role = 'user' (all existing are user questions)
UPDATE conversation_messages
SET role = 'user'
WHERE role IS NULL;

-- Make role NOT NULL after backfill
ALTER TABLE conversation_messages
ALTER COLUMN role SET NOT NULL;

-- Create index on role for faster filtering
CREATE INDEX IF NOT EXISTS idx_conversation_messages_role ON conversation_messages(role);

-- Create index on timestamp for chronological queries
CREATE INDEX IF NOT EXISTS idx_conversation_messages_timestamp ON conversation_messages(timestamp);

-- Add comment to table
COMMENT ON TABLE conversation_messages IS 'Stores complete conversation history with both user and assistant messages';

-- Add column comments
COMMENT ON COLUMN conversation_messages.role IS 'Message sender: user or assistant';
COMMENT ON COLUMN conversation_messages.message IS 'Message content (user question or assistant response)';
COMMENT ON COLUMN conversation_messages.timestamp IS 'Unix timestamp (milliseconds) from Layercode transcript';
