-- Create temporary metadata table for tracking match status across serverless invocations
-- This table bridges the gap between message events and session.end in serverless architecture

CREATE TABLE conversation_turn_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  turn_id TEXT NOT NULL,
  matched BOOLEAN DEFAULT false,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),

  -- Ensure one metadata entry per turn
  UNIQUE(session_id, turn_id)
);

-- Index for efficient cleanup of old metadata
CREATE INDEX idx_metadata_cleanup ON conversation_turn_metadata(created_at);

-- Index for fast lookups by session_id at session.end
CREATE INDEX idx_metadata_session ON conversation_turn_metadata(session_id);

-- Function to cleanup orphaned metadata (in case session.end never fires)
CREATE OR REPLACE FUNCTION cleanup_old_turn_metadata()
RETURNS void AS $$
BEGIN
  DELETE FROM conversation_turn_metadata
  WHERE created_at < NOW() - INTERVAL '2 hours';
END;
$$ LANGUAGE plpgsql;

-- Optional: Add a comment explaining the table's purpose
COMMENT ON TABLE conversation_turn_metadata IS 'Temporary storage for conversation match metadata. Stores turn-level data during message events, retrieved at session.end, then cleaned up. Auto-cleanup function removes entries older than 2 hours.';
