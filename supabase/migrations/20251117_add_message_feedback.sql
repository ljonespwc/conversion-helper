-- Add user feedback tracking to assistant messages

-- Add user_feedback column to conversation_messages
ALTER TABLE conversation_messages
ADD COLUMN IF NOT EXISTS user_feedback TEXT CHECK (user_feedback IN ('positive', 'negative'));

-- Add comment
COMMENT ON COLUMN conversation_messages.user_feedback IS 'User feedback on assistant responses: positive (thumbs up) or negative (thumbs down)';

-- Add index for analytics queries
CREATE INDEX IF NOT EXISTS idx_conversation_messages_feedback
ON conversation_messages(session_id, user_feedback)
WHERE user_feedback IS NOT NULL;
