-- Lean Visitor Tracking: persistent visitor identity via first-party cookie
-- Links multiple chat sessions to the same person for attribution

CREATE TABLE visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id TEXT UNIQUE NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  first_seen_at TIMESTAMPTZ DEFAULT now(),
  last_seen_at TIMESTAMPTZ DEFAULT now(),
  first_page_url TEXT,
  total_conversations INTEGER DEFAULT 0,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_visitors_org_visitor ON visitors(organization_id, visitor_id);

ALTER TABLE conversation_sessions
ADD COLUMN visitor_id UUID REFERENCES visitors(id);
