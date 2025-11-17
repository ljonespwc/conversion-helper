-- Add resolved status tracking for escalations

-- Add resolved field to conversation_sessions
ALTER TABLE conversation_sessions
ADD COLUMN IF NOT EXISTS resolved BOOLEAN DEFAULT FALSE;

-- Add resolved_at timestamp
ALTER TABLE conversation_sessions
ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;

-- Add index for efficient filtering of unresolved escalations
CREATE INDEX IF NOT EXISTS idx_conversation_sessions_unresolved_escalations
ON conversation_sessions(resolved, escalation_timestamp)
WHERE user_email IS NOT NULL AND resolved = FALSE;

-- Add index for resolved escalations
CREATE INDEX IF NOT EXISTS idx_conversation_sessions_resolved_escalations
ON conversation_sessions(resolved, resolved_at)
WHERE user_email IS NOT NULL AND resolved = TRUE;
