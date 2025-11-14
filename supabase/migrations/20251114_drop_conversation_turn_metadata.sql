-- Drop conversation_turn_metadata table (no longer needed)
-- We're simplifying by removing the metadata tracking system

DROP TABLE IF EXISTS conversation_turn_metadata;
