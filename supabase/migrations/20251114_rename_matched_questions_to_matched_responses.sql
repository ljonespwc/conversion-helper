-- Rename matched_questions column to matched_responses in conversation_sessions table
-- This better reflects that we're counting assistant responses that came from indexed content

ALTER TABLE conversation_sessions
RENAME COLUMN matched_questions TO matched_responses;
