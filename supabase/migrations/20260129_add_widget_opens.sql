-- Track widget opens (pill clicks) for analytics
CREATE TABLE widget_opens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  page_url TEXT NOT NULL,
  visitor_id TEXT,
  opened_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_widget_opens_org_page ON widget_opens(organization_id, page_url, opened_at);
