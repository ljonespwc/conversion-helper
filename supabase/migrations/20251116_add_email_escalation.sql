-- Migration: Add email escalation support
-- Date: 2025-11-16
-- Description: Enable visitors to provide email for escalation and track AI analysis of incomplete answers

-- Add email escalation fields to conversation_sessions
ALTER TABLE conversation_sessions
ADD COLUMN IF NOT EXISTS user_email TEXT;

ALTER TABLE conversation_sessions
ADD COLUMN IF NOT EXISTS escalation_timestamp TIMESTAMPTZ;

ALTER TABLE conversation_sessions
ADD COLUMN IF NOT EXISTS escalation_processed BOOLEAN DEFAULT FALSE;

-- Add analysis fields to conversation_messages
ALTER TABLE conversation_messages
ADD COLUMN IF NOT EXISTS needs_followup BOOLEAN DEFAULT FALSE;

ALTER TABLE conversation_messages
ADD COLUMN IF NOT EXISTS followup_reason TEXT;

-- Create index for querying escalated sessions
CREATE INDEX IF NOT EXISTS idx_conversation_sessions_escalation
ON conversation_sessions(escalation_timestamp)
WHERE escalation_timestamp IS NOT NULL;

-- Create index for querying unprocessed escalations
CREATE INDEX IF NOT EXISTS idx_conversation_sessions_unprocessed_escalation
ON conversation_sessions(escalation_processed, user_email)
WHERE user_email IS NOT NULL AND escalation_processed = FALSE;

-- Create index for querying messages that need followup
CREATE INDEX IF NOT EXISTS idx_conversation_messages_needs_followup
ON conversation_messages(needs_followup)
WHERE needs_followup = TRUE;

-- Add column comments
COMMENT ON COLUMN conversation_sessions.user_email IS 'Visitor email address for escalation to human support';
COMMENT ON COLUMN conversation_sessions.escalation_timestamp IS 'When the visitor requested escalation (submitted email)';
COMMENT ON COLUMN conversation_sessions.escalation_processed IS 'Whether AI analysis has been run to identify incomplete answers';
COMMENT ON COLUMN conversation_messages.needs_followup IS 'Whether this message requires human followup (identified by AI analysis)';
COMMENT ON COLUMN conversation_messages.followup_reason IS 'Reason this message needs followup (from AI analysis)';
