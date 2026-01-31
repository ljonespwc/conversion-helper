-- Purchase attribution events table
CREATE TABLE purchase_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  visitor_id UUID REFERENCES visitors(id),
  external_order_id TEXT,
  amount DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  product_name TEXT,
  attributed_session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_purchase_events_org ON purchase_events(organization_id);
CREATE INDEX idx_purchase_events_visitor ON purchase_events(visitor_id);
-- Prevent duplicate purchase events for same order
CREATE UNIQUE INDEX idx_purchase_events_order ON purchase_events(organization_id, external_order_id) WHERE external_order_id IS NOT NULL;

-- Enable RLS
ALTER TABLE purchase_events ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (matches existing table patterns)
CREATE POLICY "Service role full access on purchase_events"
  ON purchase_events
  FOR ALL
  USING (true)
  WITH CHECK (true);
