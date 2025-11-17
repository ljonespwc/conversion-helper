-- Move user feedback from message-level to session-level
-- This provides overall conversation satisfaction instead of per-message granularity

-- Remove user_feedback from conversation_messages
ALTER TABLE conversation_messages
DROP COLUMN IF EXISTS user_feedback;

-- Add user_feedback to conversation_sessions
ALTER TABLE conversation_sessions
ADD COLUMN IF NOT EXISTS user_feedback TEXT CHECK (user_feedback IN ('positive', 'negative'));

COMMENT ON COLUMN conversation_sessions.user_feedback IS 'Overall user feedback for the conversation: positive (thumbs up) or negative (thumbs down)';

-- Create index for feedback filtering
CREATE INDEX IF NOT EXISTS idx_conversation_sessions_feedback
ON conversation_sessions(user_feedback)
WHERE user_feedback IS NOT NULL;
