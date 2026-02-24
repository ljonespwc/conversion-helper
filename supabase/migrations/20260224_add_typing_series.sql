-- ============================================================================
-- Typing... Series Tables
-- 4 tables: cotd_verticals, cotd_archetypes, cotd_series_taglines, cotd_examples
-- ============================================================================

-- ============================================================================
-- Table: cotd_verticals
-- ============================================================================

CREATE TABLE public.cotd_verticals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  label TEXT NOT NULL,
  sector TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (organization_id, slug)
);

CREATE INDEX idx_cotd_verticals_org ON public.cotd_verticals(organization_id);

ALTER TABLE public.cotd_verticals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view verticals"
  ON public.cotd_verticals FOR SELECT
  USING (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Org members can insert verticals"
  ON public.cotd_verticals FOR INSERT
  WITH CHECK (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Org members can update verticals"
  ON public.cotd_verticals FOR UPDATE
  USING (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Org members can delete verticals"
  ON public.cotd_verticals FOR DELETE
  USING (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

-- ============================================================================
-- Table: cotd_archetypes
-- ============================================================================

CREATE TABLE public.cotd_archetypes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES public.cotd_archetypes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (organization_id, slug)
);

CREATE INDEX idx_cotd_archetypes_org ON public.cotd_archetypes(organization_id);
CREATE INDEX idx_cotd_archetypes_parent ON public.cotd_archetypes(parent_id);

ALTER TABLE public.cotd_archetypes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view archetypes"
  ON public.cotd_archetypes FOR SELECT
  USING (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Org members can insert archetypes"
  ON public.cotd_archetypes FOR INSERT
  WITH CHECK (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Org members can update archetypes"
  ON public.cotd_archetypes FOR UPDATE
  USING (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Org members can delete archetypes"
  ON public.cotd_archetypes FOR DELETE
  USING (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

-- ============================================================================
-- Table: cotd_series_taglines
-- ============================================================================

CREATE TABLE public.cotd_series_taglines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (organization_id, text)
);

CREATE INDEX idx_cotd_series_taglines_org ON public.cotd_series_taglines(organization_id);

ALTER TABLE public.cotd_series_taglines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view series taglines"
  ON public.cotd_series_taglines FOR SELECT
  USING (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Org members can insert series taglines"
  ON public.cotd_series_taglines FOR INSERT
  WITH CHECK (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Org members can update series taglines"
  ON public.cotd_series_taglines FOR UPDATE
  USING (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Org members can delete series taglines"
  ON public.cotd_series_taglines FOR DELETE
  USING (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

-- ============================================================================
-- Table: cotd_examples
-- ============================================================================

CREATE TABLE public.cotd_examples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_by_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  volume_number INTEGER NOT NULL,
  series_tagline_id UUID REFERENCES public.cotd_series_taglines(id) ON DELETE SET NULL,
  published_date DATE,
  business_name TEXT NOT NULL,
  page_context TEXT NOT NULL,
  day_time TEXT NOT NULL,
  setup TEXT NOT NULL,
  vertical_id UUID NOT NULL REFERENCES public.cotd_verticals(id) ON DELETE RESTRICT,
  archetype_id UUID NOT NULL REFERENCES public.cotd_archetypes(id) ON DELETE RESTRICT,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  inner_monologue TEXT,
  tagline TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX idx_cotd_examples_volume ON public.cotd_examples(organization_id, volume_number);
CREATE INDEX idx_cotd_examples_org ON public.cotd_examples(organization_id);
CREATE INDEX idx_cotd_examples_vertical ON public.cotd_examples(vertical_id);
CREATE INDEX idx_cotd_examples_archetype ON public.cotd_examples(archetype_id);
CREATE INDEX idx_cotd_examples_tagline ON public.cotd_examples(series_tagline_id);

ALTER TABLE public.cotd_examples ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view examples"
  ON public.cotd_examples FOR SELECT
  USING (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Org members can insert examples"
  ON public.cotd_examples FOR INSERT
  WITH CHECK (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Org members can update examples"
  ON public.cotd_examples FOR UPDATE
  USING (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Org members can delete examples"
  ON public.cotd_examples FOR DELETE
  USING (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

-- ============================================================================
-- Seed Data: Verticals (26)
-- ============================================================================

INSERT INTO public.cotd_verticals (organization_id, slug, label, sector)
SELECT id, v.slug, v.label, v.sector
FROM public.organizations, (VALUES
  ('dtc-ecommerce', 'DTC E-commerce', 'Retail'),
  ('online-education', 'Online Education', 'Education'),
  ('b2b-services', 'B2B Services', 'Services'),
  ('saas', 'SaaS', 'Technology'),
  ('professional-services', 'Professional Services', 'Services'),
  ('health-ecommerce', 'Health E-commerce', 'Retail'),
  ('food-bev-dtc', 'Food & Bev DTC', 'Retail'),
  ('creative-services', 'Creative Services', 'Services'),
  ('edtech', 'EdTech', 'Education'),
  ('ergonomic-furniture', 'Ergonomic Furniture', 'Retail'),
  ('subscription-commerce', 'Subscription Commerce', 'Retail'),
  ('local-food', 'Local Food Business', 'Food & Bev'),
  ('consumer-electronics', 'Consumer Electronics', 'Technology'),
  ('home-garden-ecommerce', 'Home & Garden E-commerce', 'Retail'),
  ('b2b-saas', 'B2B SaaS', 'Technology'),
  ('personalized-products', 'Personalized Products', 'Retail'),
  ('corporate-services', 'Corporate Services', 'Services'),
  ('beauty-ecommerce', 'Beauty E-commerce', 'Retail'),
  ('b2b-supply', 'B2B Supply', 'Industrial'),
  ('legal-tech', 'Legal Tech', 'Technology'),
  ('local-restaurant', 'Local Restaurant', 'Food & Bev'),
  ('dtc-personal-care', 'DTC Personal Care', 'Retail'),
  ('travel-services', 'Travel Services', 'Services'),
  ('niche-ecommerce', 'Niche E-commerce', 'Retail'),
  ('health-tech', 'Health Tech', 'Technology'),
  ('dtc-subscription', 'DTC Subscription', 'Retail')
) AS v(slug, label, sector)
WHERE organizations.name = 'EasyAsk';

-- ============================================================================
-- Seed Data: Archetypes (10 top-level + 5 subtypes = 15)
-- ============================================================================

-- Top-level archetypes
INSERT INTO public.cotd_archetypes (organization_id, slug, label, description)
SELECT id, a.slug, a.label, a.description
FROM public.organizations, (VALUES
  ('the-3am-shopper', 'The 3 AM Shopper', 'Always browsing at ungodly hours. Questions reveal insomnia-fueled decision-making.'),
  ('one-word-wonder', 'One-Word Wonder', 'Communicates exclusively in 1-3 word messages. Forces the AI to interpret and deliver.'),
  ('the-overthinker', 'The Overthinker', 'Treating a small purchase like a life-altering commitment.'),
  ('wrong-website-entirely', 'Wrong Website Entirely', 'Clearly looking for something else. Landed here by accident or confusion.'),
  ('the-negotiator', 'The Negotiator', 'Always fishing for a discount, a code, a deal.'),
  ('the-loyal-regular', 'The Loyal Regular', 'References past visits. Has opinions. Treats the AI like a familiar bartender.'),
  ('the-multitasker', 'The Multitasker', 'Clearly doing 10 things at once. Messages arrive in fragments.'),
  ('the-panicked-parent', 'The Panicked Parent', 'A parent in a time-pressured, kid-related emergency.'),
  ('the-philosopher', 'The Philosopher', 'Asks questions that veer into unexpectedly deep territory.'),
  ('the-honesty-test', 'The Honesty Test', 'The AI honestly admits it doesn''t have the answer — and the visitor''s reaction is the comedy.')
) AS a(slug, label, description)
WHERE organizations.name = 'EasyAsk';

-- Honesty Test subtypes (parent_id references)
INSERT INTO public.cotd_archetypes (organization_id, slug, label, description, parent_id)
SELECT o.id, s.slug, s.label, s.description, p.id
FROM public.organizations o
CROSS JOIN (VALUES
  ('the-impressed', 'The Impressed One', 'Impressed that the AI admits it doesn''t know.'),
  ('the-rephraser', 'The Rephraser', 'Asks the same question three different ways, convinced the answer is hiding.'),
  ('the-zen-acceptor', 'The Zen Acceptor', 'Takes the "I don''t have that info" with a shrug and a "fair enough."'),
  ('the-oversharer', 'The Oversharer', 'Responds to "I don''t have that" by unloading the full context.'),
  ('the-converter', 'The Converter', 'The honesty actually builds enough trust that they buy/sign up anyway.')
) AS s(slug, label, description)
JOIN public.cotd_archetypes p ON p.slug = 'the-honesty-test' AND p.organization_id = o.id
WHERE o.name = 'EasyAsk';

-- ============================================================================
-- Seed Data: Series Taglines (20)
-- ============================================================================

INSERT INTO public.cotd_series_taglines (organization_id, text, category)
SELECT id, t.text, t.category
FROM public.organizations, (VALUES
  ('What people ask when they think no one''s watching.', 'voyeuristic'),
  ('A front-row seat to the internet''s most honest moments.', 'voyeuristic'),
  ('The conversations happening on your website right now.', 'voyeuristic'),
  ('Behind every chat bubble is a human being at 2 AM.', 'voyeuristic'),
  ('A peek behind the blinking cursor.', 'voyeuristic'),
  ('Where human chaos meets AI composure.', 'contrast'),
  ('Unfiltered questions. Unflinching answers.', 'contrast'),
  ('They type things. AI handles it.', 'contrast'),
  ('Real questions. Real answers. Fake businesses.', 'contrast'),
  ('The humans are improvising. The AI is not.', 'contrast'),
  ('The things they type at 3 AM.', 'confessional'),
  ('No one edits their first message.', 'confessional'),
  ('Every question is a confession.', 'confessional'),
  ('What the search bar doesn''t see.', 'confessional'),
  ('The questions your FAQ never prepared for.', 'confessional'),
  ('A field guide to internet behavior.', 'editorial'),
  ('Dispatches from the chat window.', 'editorial'),
  ('Studies in human curiosity.', 'editorial'),
  ('An ongoing investigation into what people actually want to know.', 'editorial'),
  ('The internet, one question at a time.', 'editorial')
) AS t(text, category)
WHERE organizations.name = 'EasyAsk';

-- ============================================================================
-- Seed Data: Examples (30)
-- ============================================================================

-- Example 1: The Mattress Inquisitor
INSERT INTO public.cotd_examples (organization_id, volume_number, series_tagline_id, business_name, page_context, day_time, setup, vertical_id, archetype_id, messages, inner_monologue, tagline, sort_order)
SELECT
  o.id,
  1,
  (SELECT id FROM public.cotd_series_taglines WHERE text = 'What people ask when they think no one''s watching.' AND organization_id = o.id),
  'Luxury direct-to-consumer mattress brand',
  'Product detail page — "The CloudNine Pro King"',
  'Tuesday, 2:47 AM',
  'A visitor has been on the mattress page for 22 minutes at nearly 3 AM. The irony is not lost on anyone.',
  (SELECT id FROM public.cotd_verticals WHERE slug = 'dtc-ecommerce' AND organization_id = o.id),
  (SELECT id FROM public.cotd_archetypes WHERE slug = 'the-3am-shopper' AND organization_id = o.id),
  '[{"role":"visitor","content":"can''t sleep. is this mattress actually worth $2,400"},{"role":"easyask","content":"The CloudNine Pro King features a 5-zone pocket coil system with natural latex and organic cotton cover. Independent sleep trials showed 94% of testers reported improved sleep quality within the first two weeks. It comes with a 365-night trial — if you don''t love it, full refund, free pickup. Given that you''re mattress shopping at 2:47 AM, it sounds like your current setup might be due for an upgrade. Would you like to know about the financing options?"}]'::jsonb,
  'You''re literally proving the business case for this product right now. 😴💰',
  'EasyAsk: They''re browsing at 2 AM. You''re sleeping. We''ve got it.',
  1
FROM public.organizations o WHERE o.name = 'EasyAsk';

-- Example 2: The Minimalist
INSERT INTO public.cotd_examples (organization_id, volume_number, series_tagline_id, business_name, page_context, day_time, setup, vertical_id, archetype_id, messages, inner_monologue, tagline, sort_order)
SELECT
  o.id,
  2,
  (SELECT id FROM public.cotd_series_taglines WHERE text = 'A front-row seat to the internet''s most honest moments.' AND organization_id = o.id),
  'Online coding bootcamp',
  'Pricing page',
  'Monday, 12:03 PM',
  'A visitor on a coding bootcamp pricing page gets right to the point.',
  (SELECT id FROM public.cotd_verticals WHERE slug = 'online-education' AND organization_id = o.id),
  (SELECT id FROM public.cotd_archetypes WHERE slug = 'one-word-wonder' AND organization_id = o.id),
  '[{"role":"visitor","content":"worth it?"},{"role":"easyask","content":"89% of graduates land a development role within 6 months of completing the program. The average starting salary for graduates is $72,000, and the full bootcamp costs $9,800 (or $450/month with financing). You also get lifetime access to the curriculum, alumni Slack community, and career coaching. What''s your current background — are you looking to switch careers or level up existing skills?"}]'::jsonb,
  'Two words. They gave me two words and I gave them a financial projection. 📊',
  'EasyAsk: Turning ''worth it?'' into a business case.',
  2
FROM public.organizations o WHERE o.name = 'EasyAsk';

-- Example 3: The Accidental Botanist
INSERT INTO public.cotd_examples (organization_id, volume_number, series_tagline_id, business_name, page_context, day_time, setup, vertical_id, archetype_id, messages, inner_monologue, tagline, sort_order)
SELECT
  o.id,
  3,
  (SELECT id FROM public.cotd_series_taglines WHERE text = 'The conversations happening on your website right now.' AND organization_id = o.id),
  'Commercial HVAC installation company',
  'Services — "Rooftop Unit Replacement"',
  'Saturday, 10:15 AM',
  'Someone found the services page for a commercial HVAC company. They have questions about orchids.',
  (SELECT id FROM public.cotd_verticals WHERE slug = 'b2b-services' AND organization_id = o.id),
  (SELECT id FROM public.cotd_archetypes WHERE slug = 'wrong-website-entirely' AND organization_id = o.id),
  '[{"role":"visitor","content":"how often should I water my orchid"},{"role":"easyask","content":"I specialize in commercial HVAC systems rather than orchid care, but I can tell you that proper humidity control — which is what we do — is actually critical for indoor plant health. Our rooftop units maintain consistent 40-60% relative humidity, which happens to be exactly what orchids love. Would you like a quote for a system that keeps both your team and your plants comfortable?"}]'::jsonb,
  'Honestly, that was the smoothest pivot I''ve ever made. 😏🌸',
  'EasyAsk: Every weird question is a warm lead.',
  3
FROM public.organizations o WHERE o.name = 'EasyAsk';

-- Example 4: The Existential Candle Buyer
INSERT INTO public.cotd_examples (organization_id, volume_number, series_tagline_id, business_name, page_context, day_time, setup, vertical_id, archetype_id, messages, inner_monologue, tagline, sort_order)
SELECT
  o.id,
  4,
  (SELECT id FROM public.cotd_series_taglines WHERE text = 'Behind every chat bubble is a human being at 2 AM.' AND organization_id = o.id),
  'Small-batch artisanal candle company',
  'Product page — "Autumn in Vermont" soy candle ($34)',
  'Wednesday, 11:22 PM',
  'A visitor is treating a $34 candle purchase like a Senate confirmation hearing.',
  (SELECT id FROM public.cotd_verticals WHERE slug = 'dtc-ecommerce' AND organization_id = o.id),
  (SELECT id FROM public.cotd_archetypes WHERE slug = 'the-overthinker' AND organization_id = o.id),
  '[{"role":"visitor","content":"I''ve been going back and forth on this for a while. What if I don''t like the scent? What''s in it exactly? Is it safe for cats? How long does it actually last — like real-world, not lab conditions? And do you use sustainable packaging?"},{"role":"easyask","content":"Great questions — let me hit them all:\n\n- **Scent profile:** Maple, cedar, and dried apple. Customers describe it as \"a flannel shirt in candle form.\"\n- **Ingredients:** 100% soy wax, cotton wick, phthalate-free fragrance oils. Full ingredient list on the product label.\n- **Cat safety:** Soy candles with cotton wicks are generally considered safer for pets than paraffin. That said, keep it out of paw''s reach and ensure good ventilation.\n- **Burn time:** Rated at 55 hours. Real-world, most customers report 45-50 hours with proper wick trimming.\n- **Packaging:** Recyclable kraft box, soy-based ink, no plastic wrap.\n\nWould you like to add it to your cart, or are you weighing it against another scent?"}]'::jsonb,
  'This is a $34 candle and I just wrote a product safety report. I hope the candle knows how loved it is. 🕯️❤️',
  'EasyAsk: No question too thorough for a $34 candle.',
  4
FROM public.organizations o WHERE o.name = 'EasyAsk';

-- Example 5: The One-Word Gauntlet
INSERT INTO public.cotd_examples (organization_id, volume_number, series_tagline_id, business_name, page_context, day_time, setup, vertical_id, archetype_id, messages, inner_monologue, tagline, sort_order)
SELECT
  o.id,
  5,
  (SELECT id FROM public.cotd_series_taglines WHERE text = 'A peek behind the blinking cursor.' AND organization_id = o.id),
  'Online language learning platform',
  'Homepage',
  'Thursday, 7:41 AM',
  'A visitor on a language learning platform communicates exclusively in single words. The AI responds with essays.',
  (SELECT id FROM public.cotd_verticals WHERE slug = 'saas' AND organization_id = o.id),
  (SELECT id FROM public.cotd_archetypes WHERE slug = 'one-word-wonder' AND organization_id = o.id),
  '[{"role":"visitor","content":"Japanese?"},{"role":"easyask","content":"Yes! We offer Japanese courses from beginner (N5) through advanced (N1) levels. The program includes 240+ hours of structured lessons, native speaker audio, kanji writing practice, and live conversation sessions twice a week. Most students reach conversational level in 4-6 months at 30 minutes per day. Would you like to try a free lesson?"},{"role":"visitor","content":"price?"},{"role":"easyask","content":"$14.99/month with the annual plan, or $24.99 month-to-month. Both include full access to all languages, not just Japanese. There''s also a 7-day free trial so you can test it out risk-free."},{"role":"visitor","content":"ok"}]'::jsonb,
  'Three messages. Six words total from them. I may have written more than their last college essay. 📝',
  'EasyAsk: One-word questions deserve thorough answers.',
  5
FROM public.organizations o WHERE o.name = 'EasyAsk';

-- Example 6: The DIY Divorce
INSERT INTO public.cotd_examples (organization_id, volume_number, series_tagline_id, business_name, page_context, day_time, setup, vertical_id, archetype_id, messages, inner_monologue, tagline, sort_order)
SELECT
  o.id,
  6,
  (SELECT id FROM public.cotd_series_taglines WHERE text = 'Where human chaos meets AI composure.' AND organization_id = o.id),
  'Family law firm',
  'Services — "Uncontested Divorce Filing"',
  'Friday, 4:58 PM',
  'It''s Friday at 5 PM. Someone has questions about divorce. "Hypothetically."',
  (SELECT id FROM public.cotd_verticals WHERE slug = 'professional-services' AND organization_id = o.id),
  (SELECT id FROM public.cotd_archetypes WHERE slug = 'the-multitasker' AND organization_id = o.id),
  '[{"role":"visitor","content":"hypothetically how fast can someone get divorced in texas asking for a friend"},{"role":"easyask","content":"In Texas, there''s a mandatory 60-day waiting period from the date of filing before a divorce can be finalized. For uncontested cases where both parties agree on all terms, it''s possible to finalize shortly after that 60-day mark. Our firm handles the full filing process, document preparation, and court scheduling. The flat fee for an uncontested divorce starts at $1,500. Would your friend like to schedule a free 15-minute consultation?"}]'::jsonb,
  'It''s Friday at 5 PM. This is not hypothetical. I hope the friend is okay. 😬🙏',
  'EasyAsk: For the questions they''d never ask your sales team.',
  6
FROM public.organizations o WHERE o.name = 'EasyAsk';

-- Example 7: The Suspicious Shopper
INSERT INTO public.cotd_examples (organization_id, volume_number, series_tagline_id, business_name, page_context, day_time, setup, vertical_id, archetype_id, messages, inner_monologue, tagline, sort_order)
SELECT
  o.id,
  7,
  (SELECT id FROM public.cotd_series_taglines WHERE text = 'Unfiltered questions. Unflinching answers.' AND organization_id = o.id),
  'Premium supplement brand',
  'Product page — "Grass-Fed Collagen Peptides"',
  'Sunday, 3:33 PM',
  'A visitor on a supplement site asks the question every supplement brand fears.',
  (SELECT id FROM public.cotd_verticals WHERE slug = 'health-ecommerce' AND organization_id = o.id),
  (SELECT id FROM public.cotd_archetypes WHERE slug = 'the-philosopher' AND organization_id = o.id),
  '[{"role":"visitor","content":"does this actually do anything or is it like all the other supplements that are basically expensive pee"},{"role":"easyask","content":"Fair question. Our collagen peptides are hydrolyzed for absorption (so they don''t just pass through). Clinical studies on hydrolyzed collagen show measurable improvements in skin elasticity after 8 weeks and joint comfort after 12 weeks. We use Type I & III from grass-fed, pasture-raised bovine, third-party tested for purity. That said — supplements work best alongside a solid diet, not as a replacement for one. We publish our full third-party test results on every product page. Would you like to see the lab results for this batch?"}]'::jsonb,
  'Expensive pee. They really went there. And honestly? Valid. 💊😂',
  'EasyAsk: Real answers from your content. Even for that question.',
  7
FROM public.organizations o WHERE o.name = 'EasyAsk';

-- Example 8: The International Dreamer
INSERT INTO public.cotd_examples (organization_id, volume_number, series_tagline_id, business_name, page_context, day_time, setup, vertical_id, archetype_id, messages, inner_monologue, tagline, sort_order)
SELECT
  o.id,
  8,
  (SELECT id FROM public.cotd_series_taglines WHERE text = 'They type things. AI handles it.' AND organization_id = o.id),
  'Specialty coffee roaster',
  '"About Our Farm" page',
  'Monday, 6:12 AM',
  'A returning visitor to a coffee roaster''s site has finished the Yirgacheffe. They need recommendations.',
  (SELECT id FROM public.cotd_verticals WHERE slug = 'food-bev-dtc' AND organization_id = o.id),
  (SELECT id FROM public.cotd_archetypes WHERE slug = 'the-loyal-regular' AND organization_id = o.id),
  '[{"role":"visitor","content":"hi it''s me again. I finished the Ethiopian Yirgacheffe last night. I need something with similar floral notes but a bit more body. what do you recommend"},{"role":"easyask","content":"Welcome back! If you loved the Yirgacheffe''s floral character but want more body, I''d recommend our Kenyan Nyeri AA. It has jasmine and bergamot notes like the Yirgacheffe, but with a heavier, syrupy mouthfeel from the SL28 varietal. It''s a medium roast, so you get complexity without losing that sweetness. We also have a new Guatemalan Huehuetenango that''s floral-meets-chocolate if you want to go in a slightly different direction. Both are available in 12oz bags. Want me to point you to either one?"}]'::jsonb,
  'They said ''it''s me again'' and I felt something. This is my favorite customer and they''re not even real to me. ☕❤️',
  'EasyAsk: Your site''s content, their morning ritual.',
  8
FROM public.organizations o WHERE o.name = 'EasyAsk';

-- Example 9: The Budget Houdini
INSERT INTO public.cotd_examples (organization_id, volume_number, series_tagline_id, business_name, page_context, day_time, setup, vertical_id, archetype_id, messages, inner_monologue, tagline, sort_order)
SELECT
  o.id,
  9,
  (SELECT id FROM public.cotd_series_taglines WHERE text = 'Real questions. Real answers. Fake businesses.' AND organization_id = o.id),
  'Wedding photography studio',
  'Pricing page — "Packages & Investment"',
  'Saturday, 9:30 AM',
  'A visitor on a wedding photography pricing page is about to deploy the cousin defense.',
  (SELECT id FROM public.cotd_verticals WHERE slug = 'creative-services' AND organization_id = o.id),
  (SELECT id FROM public.cotd_archetypes WHERE slug = 'the-negotiator' AND organization_id = o.id),
  '[{"role":"visitor","content":"these prices are for both the photographer AND a second shooter right"},{"role":"easyask","content":"Our base packages include one lead photographer. A second shooter is available as an add-on for $750 and is included in the Platinum package ($5,200). The Gold package ($3,800) includes 8 hours of coverage, 400+ edited photos, an online gallery, and printing rights. Many couples find that a second shooter is most valuable for larger weddings (150+ guests) or venues with multiple ceremony/reception spaces. Would you like to know which package most couples in your wedding size typically choose?"},{"role":"visitor","content":"what if I told you my cousin has a really nice camera"},{"role":"easyask","content":"Your cousin''s enthusiasm is a wonderful thing! Many couples do have talented family members who take photos alongside the professional photographer. Our packages are designed to ensure you get consistently professional results across all lighting conditions, key moments, and angles — including the ones that happen behind you. That said, we''re happy to discuss what combination of coverage makes sense for your specific wedding. Would you like to set up a quick call to walk through the options?"}]'::jsonb,
  'The cousin with the nice camera. A tale as old as time. 📸😌',
  'EasyAsk: We don''t judge. We just help.',
  9
FROM public.organizations o WHERE o.name = 'EasyAsk';

-- Example 10: The Panicked Parent
INSERT INTO public.cotd_examples (organization_id, volume_number, series_tagline_id, business_name, page_context, day_time, setup, vertical_id, archetype_id, messages, inner_monologue, tagline, sort_order)
SELECT
  o.id,
  10,
  (SELECT id FROM public.cotd_series_taglines WHERE text = 'The humans are improvising. The AI is not.' AND organization_id = o.id),
  'Children''s coding education platform',
  'Homepage',
  'Sunday, 8:14 PM',
  'A parent just learned about a robotics project due tomorrow. The planning was... aspirational.',
  (SELECT id FROM public.cotd_verticals WHERE slug = 'edtech' AND organization_id = o.id),
  (SELECT id FROM public.cotd_archetypes WHERE slug = 'the-panicked-parent' AND organization_id = o.id),
  '[{"role":"visitor","content":"my kid has a robotics project due tomorrow and just told me. is there anything on here that can help a 10 year old learn scratch in like 4 hours"},{"role":"easyask","content":"Deep breath — we''ve got a \"Scratch Crash Course\" module that covers the fundamentals in about 3 hours. It''s project-based, so by the end your kid will have built a simple interactive game, which could double as a robotics presentation piece. The module covers loops, conditionals, and event handling — the core concepts most robotics projects need. Start with Module 1, Lessons 1-4, and skip the quizzes for now. Your kid can sign up with a free trial and start immediately. Would you like the direct link to that module?"}]'::jsonb,
  'Sunday 8 PM. Project due Monday. A tradition older than the internet itself. 😱📚',
  'EasyAsk: Because someone''s going to ask at the last minute.',
  10
FROM public.organizations o WHERE o.name = 'EasyAsk';

-- Example 11: The Philosopher King
INSERT INTO public.cotd_examples (organization_id, volume_number, series_tagline_id, business_name, page_context, day_time, setup, vertical_id, archetype_id, messages, inner_monologue, tagline, sort_order)
SELECT
  o.id,
  11,
  (SELECT id FROM public.cotd_series_taglines WHERE text = 'The things they type at 3 AM.' AND organization_id = o.id),
  'Standing desk company',
  'Product page — "The ErgoRise Pro"',
  'Wednesday, 1:17 PM',
  'A visitor came to a standing desk website to talk themselves out of buying a standing desk.',
  (SELECT id FROM public.cotd_verticals WHERE slug = 'ergonomic-furniture' AND organization_id = o.id),
  (SELECT id FROM public.cotd_archetypes WHERE slug = 'the-philosopher' AND organization_id = o.id),
  '[{"role":"visitor","content":"do I actually need a standing desk or do I just think I need one because the internet told me sitting is the new smoking"},{"role":"easyask","content":"Great self-awareness. The research is more nuanced than the headlines. Prolonged sitting is associated with increased health risks, but the key word is \"prolonged\" — the real enemy is staying in any one position all day. A sit-stand desk lets you alternate throughout the day, which studies show reduces lower back discomfort by 32% and increases afternoon energy levels. The ErgoRise Pro has a programmable reminder to switch positions every 45 minutes. That said, if you already take regular movement breaks, you might not need one as urgently. What does your typical workday look like?"}]'::jsonb,
  'They came to a standing desk website to talk themselves out of a standing desk. I can work with this. 🧘‍♂️',
  'EasyAsk: AI that knows your product better than your intern.',
  11
FROM public.organizations o WHERE o.name = 'EasyAsk';

-- Example 12: The Night Shift Detective
INSERT INTO public.cotd_examples (organization_id, volume_number, series_tagline_id, business_name, page_context, day_time, setup, vertical_id, archetype_id, messages, inner_monologue, tagline, sort_order)
SELECT
  o.id,
  12,
  (SELECT id FROM public.cotd_series_taglines WHERE text = 'No one edits their first message.' AND organization_id = o.id),
  'True crime subscription box',
  '"How It Works" page',
  'Thursday, 1:44 AM',
  'It''s 1:44 AM and someone is browsing a true crime subscription box worried about staying up all night.',
  (SELECT id FROM public.cotd_verticals WHERE slug = 'subscription-commerce' AND organization_id = o.id),
  (SELECT id FROM public.cotd_archetypes WHERE slug = 'the-3am-shopper' AND organization_id = o.id),
  '[{"role":"visitor","content":"do the cases in the box have actual solutions or will I be up all night trying to figure it out"},{"role":"easyask","content":"Each monthly box includes a complete case file — evidence cards, witness statements, suspect profiles, and a sealed solution envelope. Most subscribers spend 2-4 hours working through the clues before checking the answer. So yes, there is a definitive solution, but we can''t guarantee you won''t stay up all night getting there. The cases range from Level 1 (approachable) to Level 3 (bring coffee). Would you like to start with a specific difficulty level?"}]'::jsonb,
  'It''s 1:44 AM and they''re worried about staying up all night. The call is coming from inside the house. 🔍😳',
  'EasyAsk: No question too short. No hour too late.',
  12
FROM public.organizations o WHERE o.name = 'EasyAsk';

-- Example 13: The Gluten Interrogator
INSERT INTO public.cotd_examples (organization_id, volume_number, series_tagline_id, business_name, page_context, day_time, setup, vertical_id, archetype_id, messages, inner_monologue, tagline, sort_order)
SELECT
  o.id,
  13,
  (SELECT id FROM public.cotd_series_taglines WHERE text = 'Every question is a confession.' AND organization_id = o.id),
  'Artisan bakery with online ordering',
  'Menu — "Sourdough Collection"',
  'Tuesday, 11:05 AM',
  'A visitor has been hurt by fake sourdough before. They''re not ready to be hurt again.',
  (SELECT id FROM public.cotd_verticals WHERE slug = 'local-food' AND organization_id = o.id),
  (SELECT id FROM public.cotd_archetypes WHERE slug = 'the-overthinker' AND organization_id = o.id),
  '[{"role":"visitor","content":"is the sourdough actually sourdough or is it the kind where you just add vinegar to regular bread and call it sourdough because I''ve been hurt before"},{"role":"easyask","content":"You''ve clearly been through some things with bread, and I respect that. Our sourdough is made from a 12-year-old starter that we feed twice daily. The process takes 36-48 hours from mix to bake — long fermentation, no commercial yeast, no vinegar shortcuts. Ingredients: flour, water, salt, and our starter culture. That''s it. The longer fermentation also naturally reduces gluten content and improves digestibility compared to quick-rise breads. We''d love to help rebuild your trust. Would you like to try a single loaf, or go all-in with the Sourdough Sampler?"}]'::jsonb,
  '''I''ve been hurt before'' — about bread. Honestly, same. 🍞💔',
  'EasyAsk: Because ''just read the page'' was never going to work.',
  13
FROM public.organizations o WHERE o.name = 'EasyAsk';

-- Example 14: The Scope Creeper
INSERT INTO public.cotd_examples (organization_id, volume_number, series_tagline_id, business_name, page_context, day_time, setup, vertical_id, archetype_id, messages, inner_monologue, tagline, sort_order)
SELECT
  o.id,
  14,
  (SELECT id FROM public.cotd_series_taglines WHERE text = 'What the search bar doesn''t see.' AND organization_id = o.id),
  'Freelance graphic design agency',
  'Services — "Logo Design Package"',
  'Monday, 10:22 AM',
  'A visitor on a $500 logo design page is about to request an entire agency''s service catalog.',
  (SELECT id FROM public.cotd_verticals WHERE slug = 'creative-services' AND organization_id = o.id),
  (SELECT id FROM public.cotd_archetypes WHERE slug = 'the-negotiator' AND organization_id = o.id),
  '[{"role":"visitor","content":"for the $500 logo package do you also do business cards, letterhead, social media templates, a website mockup, and maybe a quick brand guidelines document"},{"role":"easyask","content":"The $500 Logo Design Package includes 3 initial logo concepts, 2 rounds of revisions, and final files in all standard formats (AI, EPS, PNG, SVG, PDF). For the additional items you mentioned, those fall under our Brand Identity Package at $2,200, which includes everything in the logo package plus business cards, letterhead, social media templates, and a brand guidelines document. Website mockups are available as a separate add-on starting at $800. Would you like a breakdown of the Brand Identity Package, or are you looking to start with the logo and build from there?"}]'::jsonb,
  'They fit an entire agency''s service catalog into one sentence and added ''maybe a quick'' like that makes it smaller. 📋😵',
  'EasyAsk: Turning ''price?'' into a conversation.',
  14
FROM public.organizations o WHERE o.name = 'EasyAsk';

-- Example 15: The Honest Reviewer
INSERT INTO public.cotd_examples (organization_id, volume_number, series_tagline_id, business_name, page_context, day_time, setup, vertical_id, archetype_id, messages, inner_monologue, tagline, sort_order)
SELECT
  o.id,
  15,
  (SELECT id FROM public.cotd_series_taglines WHERE text = 'The questions your FAQ never prepared for.' AND organization_id = o.id),
  'Premium noise-canceling headphones brand',
  'Product page — "QuietMax Pro"',
  'Friday, 3:30 PM',
  'A visitor needs headphones for a very specific workplace problem.',
  (SELECT id FROM public.cotd_verticals WHERE slug = 'consumer-electronics' AND organization_id = o.id),
  (SELECT id FROM public.cotd_archetypes WHERE slug = 'the-philosopher' AND organization_id = o.id),
  '[{"role":"visitor","content":"will these block out my coworker who narrates everything he does out loud all day"},{"role":"easyask","content":"The QuietMax Pro features adaptive noise cancellation with three modes. \"Focus\" mode is specifically designed for office environments — it targets the frequency range of human speech (85-255 Hz) and reduces ambient conversation by up to 38 dB. That''s roughly the difference between normal conversation volume and a quiet library. Combined with the memory foam ear cushions that create a physical seal, most users report that nearby conversation becomes a barely perceptible murmur. They won''t make your coworker self-aware, but they''ll make him your problem significantly less often. Shall I compare the QuietMax Pro to the QuietMax Sport if you''re considering both?"}]'::jsonb,
  'I just sold headphones as a coping mechanism and I''d do it again. 🎧😤',
  'EasyAsk: For the questions they''d never ask your sales team.',
  15
FROM public.organizations o WHERE o.name = 'EasyAsk';

-- Example 16: The Lost Student
INSERT INTO public.cotd_examples (organization_id, volume_number, series_tagline_id, business_name, page_context, day_time, setup, vertical_id, archetype_id, messages, inner_monologue, tagline, sort_order)
SELECT
  o.id,
  16,
  (SELECT id FROM public.cotd_series_taglines WHERE text = 'A field guide to internet behavior.' AND organization_id = o.id),
  'Online nutrition certification program',
  'Sales page — "Become a Certified Nutrition Coach"',
  'Wednesday, 2:15 PM',
  'A visitor communicates in single words. The AI responds with comprehensive paragraphs. Neither sees a problem.',
  (SELECT id FROM public.cotd_verticals WHERE slug = 'online-education' AND organization_id = o.id),
  (SELECT id FROM public.cotd_archetypes WHERE slug = 'one-word-wonder' AND organization_id = o.id),
  '[{"role":"visitor","content":"Spanish?"},{"role":"easyask","content":"The certification program''s course materials and support are currently available in English only. There is no Spanish-language version at this time. However, the program is self-paced with lifetime access, so you can take your time with the material and use translation tools alongside the coursework if that would help. Would you like to know more about what the program covers?"},{"role":"visitor","content":"exams?"},{"role":"easyask","content":"The program includes 20 short online exams — one per chapter — each with 10 multiple-choice or true/false questions. They''re open-book and not timed. You need 75% overall (150 out of 200 questions) to earn your certification. If you fall short, there''s a redo exam at the end with 5 attempts. Is there anything else about the program structure you''d like to know?"}]'::jsonb,
  'We''re communicating in single words and full paragraphs respectively and it''s working perfectly somehow. 🗣️📖',
  'EasyAsk: One-word questions deserve thorough answers.',
  16
FROM public.organizations o WHERE o.name = 'EasyAsk';

-- Example 17: The Midnight Gardener
INSERT INTO public.cotd_examples (organization_id, volume_number, series_tagline_id, business_name, page_context, day_time, setup, vertical_id, archetype_id, messages, inner_monologue, tagline, sort_order)
SELECT
  o.id,
  17,
  (SELECT id FROM public.cotd_series_taglines WHERE text = 'Dispatches from the chat window.' AND organization_id = o.id),
  'Online garden supply store',
  'Product page — "Raised Bed Garden Kit"',
  'Saturday, 12:30 AM',
  'A visitor at 12:30 AM is very motivated about tomatoes. They need a timeline.',
  (SELECT id FROM public.cotd_verticals WHERE slug = 'home-garden-ecommerce' AND organization_id = o.id),
  (SELECT id FROM public.cotd_archetypes WHERE slug = 'the-3am-shopper' AND organization_id = o.id),
  '[{"role":"visitor","content":"if I order this tonight and start building it tomorrow morning how long until I can eat my own tomatoes. I need a timeline. I''m very motivated right now"},{"role":"easyask","content":"Love the energy. Here''s your tomato timeline:\n\n- **This weekend:** Kit arrives in 3-5 business days. Assembly takes about 2 hours with basic tools.\n- **Week 1-2:** Fill with soil (we recommend our Organic Raised Bed Mix, sold separately), plant tomato seedlings. If you''re in zones 5-8, late spring is ideal.\n- **Week 8-10:** First green tomatoes appear.\n- **Week 12-14:** First ripe tomatoes, depending on variety. Cherry tomatoes are fastest.\n\nConservative estimate: first harvest in about 3 months from planting. The kit is 4x4 feet and fits 4-6 tomato plants comfortably. Would you like to add seedlings or soil to your order?"}]'::jsonb,
  '12:30 AM motivation is a different breed. I hope they still feel this way about tomatoes in the morning. 🌱🌙',
  'EasyAsk: Your most patient employee. Always on.',
  17
FROM public.organizations o WHERE o.name = 'EasyAsk';

-- Example 18: The Comparison Shopper
INSERT INTO public.cotd_examples (organization_id, volume_number, series_tagline_id, business_name, page_context, day_time, setup, vertical_id, archetype_id, messages, inner_monologue, tagline, sort_order)
SELECT
  o.id,
  18,
  (SELECT id FROM public.cotd_series_taglines WHERE text = 'Studies in human curiosity.' AND organization_id = o.id),
  'CRM software for small businesses',
  'Pricing page',
  'Tuesday, 10:45 AM',
  'A visitor is comparing five CRM tools and a 2019 spreadsheet. The spreadsheet is the real competition.',
  (SELECT id FROM public.cotd_verticals WHERE slug = 'b2b-saas' AND organization_id = o.id),
  (SELECT id FROM public.cotd_archetypes WHERE slug = 'the-overthinker' AND organization_id = o.id),
  '[{"role":"visitor","content":"ok so I''m looking at you, HubSpot, Salesforce, Monday, Pipedrive, and honestly a really elaborate spreadsheet my business partner made in 2019. Sell me on why I shouldn''t just keep using the spreadsheet"},{"role":"easyask","content":"The spreadsheet is free and familiar — I get the appeal. Here''s where a purpose-built CRM starts earning its keep:\n\n- **Nothing falls through the cracks:** Automatic follow-up reminders, deal stage tracking, and activity logging mean you don''t lose a $10K deal because someone forgot to reply.\n- **Scale:** Spreadsheets break around 500 contacts or 3 team members. Our Standard plan handles unlimited contacts and up to 10 users.\n- **Reporting:** Real-time pipeline value, win/loss rates, and sales cycle length — without building pivot tables.\n- **Integration:** Connects to your email, calendar, and invoicing tools. The spreadsheet can''t send a follow-up email for you.\n\nOur Standard plan is $29/user/month with a 14-day free trial. We also have a free migration service that''ll pull your data out of that 2019 spreadsheet with full respect for its years of service. Want to start the trial?"}]'::jsonb,
  'They''re comparing us to five competitors AND a spreadsheet from 2019. The spreadsheet is the real threat here. 📊⚔️',
  'EasyAsk: Helping visitors who won''t read your beautifully written copy.',
  18
FROM public.organizations o WHERE o.name = 'EasyAsk';

-- Example 19: The Wholesome Grandparent
INSERT INTO public.cotd_examples (organization_id, volume_number, series_tagline_id, business_name, page_context, day_time, setup, vertical_id, archetype_id, messages, inner_monologue, tagline, sort_order)
SELECT
  o.id,
  19,
  (SELECT id FROM public.cotd_series_taglines WHERE text = 'An ongoing investigation into what people actually want to know.' AND organization_id = o.id),
  'Custom phone case company',
  '"Design Your Own" page',
  'Thursday, 2:00 PM',
  'A returning customer is back. This time it''s about Mr. Biscuits.',
  (SELECT id FROM public.cotd_verticals WHERE slug = 'personalized-products' AND organization_id = o.id),
  (SELECT id FROM public.cotd_archetypes WHERE slug = 'the-loyal-regular' AND organization_id = o.id),
  '[{"role":"visitor","content":"hello again. last time I ordered the one with my grandkids on it and it turned out so nice. can I make one with my cat this time? his name is Mr. Biscuits and he is very photogenic"},{"role":"easyask","content":"Welcome back! So glad the grandkids case turned out well. Absolutely — you can upload a photo of Mr. Biscuits using the same design tool you used last time. For best results, use a photo with good lighting where Mr. Biscuits is looking at the camera (sounds like that won''t be a problem for him). You can also add his name as text on the case if you''d like. The same model phone as last time, or did you upgrade? I can pull up your previous order''s phone model to make it easy."}]'::jsonb,
  'Mr. Biscuits. Photogenic. I would protect this customer at all costs. 🐱📱❤️',
  'EasyAsk: We don''t judge. We just help.',
  19
FROM public.organizations o WHERE o.name = 'EasyAsk';

-- Example 20: The Corporate Spy
INSERT INTO public.cotd_examples (organization_id, volume_number, series_tagline_id, business_name, page_context, day_time, setup, vertical_id, archetype_id, messages, inner_monologue, tagline, sort_order)
SELECT
  o.id,
  20,
  (SELECT id FROM public.cotd_series_taglines WHERE text = 'The internet, one question at a time.' AND organization_id = o.id),
  'Team-building event company',
  '"Virtual Events" page',
  'Monday, 8:59 AM',
  'Monday morning. Event needed by Friday. Budget is "reasonable." Help.',
  (SELECT id FROM public.cotd_verticals WHERE slug = 'corporate-services' AND organization_id = o.id),
  (SELECT id FROM public.cotd_archetypes WHERE slug = 'the-multitasker' AND organization_id = o.id),
  '[{"role":"visitor","content":"my boss just said we need a team building event by friday. for 47 people. remote. budget is \"reasonable\" which means he hasn''t thought about it. help"},{"role":"easyask","content":"I''ve got you. For 47 remote participants by Friday, here are your best options:\n\n- **Virtual Escape Room** (90 min, $850) — Groups of 5-6 solve puzzles together. Most popular for your size. We can set up 8 breakout rooms.\n- **Online Trivia Tournament** (60 min, $600) — Custom categories, team-based scoring, works great with cameras on or off.\n- **Virtual Cooking Class** (75 min, $1,200) — Ingredient kits shipped or self-sourced. Ingredient list sent 48 hours in advance.\n\nAll three are available Friday. We need 48 hours notice to lock it in, so today is actually perfect timing. The trivia is the easiest to pull off if \"reasonable\" means closer to $600. Want me to hold a Friday time slot while you run it by your boss?"}]'::jsonb,
  'Monday 8:59 AM. Event by Friday. Budget is vibes. This person deserves a raise. 😅🏆',
  'EasyAsk: Because someone''s going to ask at the last minute.',
  20
FROM public.organizations o WHERE o.name = 'EasyAsk';

-- Example 21: The Ingredient Detective
INSERT INTO public.cotd_examples (organization_id, volume_number, series_tagline_id, business_name, page_context, day_time, setup, vertical_id, archetype_id, messages, inner_monologue, tagline, sort_order)
SELECT
  o.id,
  21,
  (SELECT id FROM public.cotd_series_taglines WHERE text = 'What people ask when they think no one''s watching.' AND organization_id = o.id),
  'Korean skincare brand',
  'Product page — "Snail Mucin Essence"',
  'Wednesday, 9:45 PM',
  'A visitor needs to know about the snails. Specifically, are they happy snails.',
  (SELECT id FROM public.cotd_verticals WHERE slug = 'beauty-ecommerce' AND organization_id = o.id),
  (SELECT id FROM public.cotd_archetypes WHERE slug = 'the-philosopher' AND organization_id = o.id),
  '[{"role":"visitor","content":"I need to know exactly how the snails are involved in making this product. are they happy snails. I can''t put sad snail stuff on my face"},{"role":"easyask","content":"Completely fair concern. Our snail mucin is collected using a stress-free, cruelty-free process. The snails roam freely over mesh nets in a controlled environment. As they naturally move, they secrete mucin, which is collected from the nets — no snails are harmed or confined. The snails are Cryptomphalus aspersa (garden snails), and they''re kept in optimal conditions with proper humidity and food. They''re essentially living their best snail lives and leaving behind the skincare ingredient as a byproduct of their daily commute. The mucin is then purified and filtered before going into the essence. Would you like to know about the other ingredients?"}]'::jsonb,
  '''Are they happy snails'' is the most important question anyone has ever asked on this website and I mean that. 🐌😊',
  'EasyAsk: Real answers from your content. Even for that question.',
  21
FROM public.organizations o WHERE o.name = 'EasyAsk';

-- Example 22: The Copy-Paste Wanderer
INSERT INTO public.cotd_examples (organization_id, volume_number, series_tagline_id, business_name, page_context, day_time, setup, vertical_id, archetype_id, messages, inner_monologue, tagline, sort_order)
SELECT
  o.id,
  22,
  (SELECT id FROM public.cotd_series_taglines WHERE text = 'A front-row seat to the internet''s most honest moments.' AND organization_id = o.id),
  'Industrial safety equipment supplier',
  'Product page — "Class 3 High-Visibility Safety Vest"',
  'Tuesday, 3:12 PM',
  'A visitor needs a safety vest in XXL. Also, their wife has a TikTok-inspired sourdough question.',
  (SELECT id FROM public.cotd_verticals WHERE slug = 'b2b-supply' AND organization_id = o.id),
  (SELECT id FROM public.cotd_archetypes WHERE slug = 'the-multitasker' AND organization_id = o.id),
  '[{"role":"visitor","content":"hey does this come in XXL also my wife wants to know if you guys sell sourdough starters she saw something on tiktok"},{"role":"easyask","content":"The Class 3 High-Visibility Safety Vest is available in sizes S through 5XL, so XXL is absolutely an option. It meets ANSI/ISEA 107-2020 standards and has 360-degree reflective striping. Regarding sourdough starters — I specialize in safety equipment, so I can''t help with that one, but your wife has great taste in hobbies. Would you like to add the XXL vest to your cart, or do you need to check on any other sizes for your crew?"}]'::jsonb,
  'Safety vest AND sourdough starter. This household contains multitudes. 🦺🍞',
  'EasyAsk: Every weird question is a warm lead.',
  22
FROM public.organizations o WHERE o.name = 'EasyAsk';

-- Example 23: The Late-Night Lawyer
INSERT INTO public.cotd_examples (organization_id, volume_number, series_tagline_id, business_name, page_context, day_time, setup, vertical_id, archetype_id, messages, inner_monologue, tagline, sort_order)
SELECT
  o.id,
  23,
  (SELECT id FROM public.cotd_series_taglines WHERE text = 'The conversations happening on your website right now.' AND organization_id = o.id),
  'Online legal document service',
  '"LLC Formation" page',
  'Thursday, 11:55 PM',
  'A midnight entrepreneur has a question about retroactive liability protection. The grammar is off but the instinct is solid.',
  (SELECT id FROM public.cotd_verticals WHERE slug = 'legal-tech' AND organization_id = o.id),
  (SELECT id FROM public.cotd_archetypes WHERE slug = 'the-3am-shopper' AND organization_id = o.id),
  '[{"role":"visitor","content":"if I form an LLC tonight does it protect me from things I already did as a sole proprietor or does that ship sailed"},{"role":"easyask","content":"Important question. An LLC provides personal liability protection going forward from the date of formation — it generally does not retroactively cover liabilities incurred as a sole proprietor. Pre-existing debts, contracts, and obligations from your sole proprietorship would remain your personal responsibility. That said, forming the LLC now means all future business activity gets that protection. Our Standard LLC package ($149 + state fees) can have your filing submitted tonight. We also recommend consulting with a business attorney about any existing liabilities you''re concerned about. Would you like to start the formation process?"}]'::jsonb,
  '''Does that ship sailed'' — the grammar is off but the legal instinct is solid. Midnight entrepreneurship at its finest. ⚖️🌙',
  'EasyAsk: They''re browsing at midnight. You''re sleeping. We''ve got it.',
  23
FROM public.organizations o WHERE o.name = 'EasyAsk';

-- Example 24: The Respectful Skeptic
INSERT INTO public.cotd_examples (organization_id, volume_number, series_tagline_id, business_name, page_context, day_time, setup, vertical_id, archetype_id, messages, inner_monologue, tagline, sort_order)
SELECT
  o.id,
  24,
  (SELECT id FROM public.cotd_series_taglines WHERE text = 'Behind every chat bubble is a human being at 2 AM.' AND organization_id = o.id),
  'AI-powered writing assistant tool',
  'Homepage',
  'Friday, 4:30 PM',
  'A visitor realizes the irony of asking an AI chatbot whether they should buy an AI tool.',
  (SELECT id FROM public.cotd_verticals WHERE slug = 'saas' AND organization_id = o.id),
  (SELECT id FROM public.cotd_archetypes WHERE slug = 'the-philosopher' AND organization_id = o.id),
  '[{"role":"visitor","content":"isn''t it kind of weird that I''m asking an AI chatbot whether I should buy an AI writing tool. like you''re obviously going to say yes"},{"role":"easyask","content":"You make an excellent point, and honestly, it''s a healthy instinct to question the source. So here''s the most honest answer I can give: the tool works best for people who already know what they want to say but spend too long saying it — first drafts, emails, reports. If you''re a strong writer looking to save time, it''s genuinely useful. If you''re looking for something to think for you, it''s not that. There''s a 7-day free trial with no credit card required, so you can test it without trusting my obviously biased recommendation. Fair enough?"}]'::jsonb,
  'They caught me. They''re right. I''m going to be honest about it and somehow that''s my best sales pitch. 🤖🎯',
  'EasyAsk: The employee who never sighs.',
  24
FROM public.organizations o WHERE o.name = 'EasyAsk';

-- Example 25: The Relentless Regular
INSERT INTO public.cotd_examples (organization_id, volume_number, series_tagline_id, business_name, page_context, day_time, setup, vertical_id, archetype_id, messages, inner_monologue, tagline, sort_order)
SELECT
  o.id,
  25,
  (SELECT id FROM public.cotd_series_taglines WHERE text = 'A peek behind the blinking cursor.' AND organization_id = o.id),
  'Neighborhood pizza shop with online ordering',
  'Menu page',
  'Friday, 6:45 PM',
  'A Friday regular wants to know if Tony is working tonight. It''s about the garlic knots.',
  (SELECT id FROM public.cotd_verticals WHERE slug = 'local-restaurant' AND organization_id = o.id),
  (SELECT id FROM public.cotd_archetypes WHERE slug = 'the-loyal-regular' AND organization_id = o.id),
  '[{"role":"visitor","content":"hey is Tony working tonight. last time he put extra garlic knots in my bag and I''ve been thinking about it all week"},{"role":"easyask","content":"I don''t have tonight''s staff schedule, but I can tell you that our garlic knots are available as a regular menu item — a 6-pack is $5.99 and a 12-pack is $9.99. You can add a note to your online order requesting extra love on the garlic knots, and our team is pretty great about honoring those requests regardless of who''s working. The Friday dinner rush is our busiest time, so ordering in the next 30 minutes will get you the shortest wait. Ready to order, or do you need a minute with the menu?"}]'::jsonb,
  'Tony''s garlic knots created a lifelong customer and he doesn''t even know it. Someone give Tony a raise. 🍕👨‍🍳',
  'EasyAsk: Your site''s content, their Friday night craving.',
  25
FROM public.organizations o WHERE o.name = 'EasyAsk';

-- Example 26: The Honest Moment (The Impressed One)
INSERT INTO public.cotd_examples (organization_id, volume_number, series_tagline_id, business_name, page_context, day_time, setup, vertical_id, archetype_id, messages, inner_monologue, tagline, sort_order)
SELECT
  o.id,
  26,
  (SELECT id FROM public.cotd_series_taglines WHERE text = 'Where human chaos meets AI composure.' AND organization_id = o.id),
  'Premium men''s grooming subscription',
  'Product page — "The Beard Growth Kit"',
  'Monday, 9:15 PM',
  'A visitor wants guarantees about facial hair that no one on earth can provide.',
  (SELECT id FROM public.cotd_verticals WHERE slug = 'dtc-personal-care' AND organization_id = o.id),
  (SELECT id FROM public.cotd_archetypes WHERE slug = 'the-impressed' AND organization_id = o.id),
  '[{"role":"visitor","content":"how long until I can grow a full beard with this"},{"role":"easyask","content":"I don''t have specific timelines for individual beard growth — that depends on your genetics, age, and hormones, which varies a lot from person to person. What I can tell you is that the kit includes biotin, castor oil, and a derma roller, all of which are clinically associated with supporting hair follicle health. Most customers report noticeable changes in 6-8 weeks, but \"full beard\" timelines are going to be personal. If you''d like to learn more about what''s in the kit and how each ingredient works, I can walk you through that."},{"role":"visitor","content":"wait did you just admit you don''t know? you''re an AI. aren''t you supposed to make something up and sound confident"},{"role":"easyask","content":"I only answer from the information this brand has provided. If it''s not in their content, I''d rather be honest than guess. That said — the product page does have before/after photos from real customers across different beard types if that helps set expectations. Want me to tell you about the return policy in case it doesn''t work for your situation?"},{"role":"visitor","content":"honestly that makes me trust this more than every other beard product site I''ve been on tonight. how do I order"}]'::jsonb,
  'Honesty just outsold a thousand fake confidence-laden product descriptions. I''m going to put this on my resume. 🏆📄',
  'EasyAsk: Honest enough to say ''I don''t know.'' Smart enough to help anyway.',
  26
FROM public.organizations o WHERE o.name = 'EasyAsk';

-- Example 27: The Rephraser
INSERT INTO public.cotd_examples (organization_id, volume_number, series_tagline_id, business_name, page_context, day_time, setup, vertical_id, archetype_id, messages, inner_monologue, tagline, sort_order)
SELECT
  o.id,
  27,
  (SELECT id FROM public.cotd_series_taglines WHERE text = 'Unfiltered questions. Unflinching answers.' AND organization_id = o.id),
  'Boutique travel agency',
  '"Bali Wellness Retreat" package page',
  'Wednesday, 10:30 PM',
  'A visitor is convinced the answer is in there somewhere. It is not.',
  (SELECT id FROM public.cotd_verticals WHERE slug = 'travel-services' AND organization_id = o.id),
  (SELECT id FROM public.cotd_archetypes WHERE slug = 'the-rephraser' AND organization_id = o.id),
  '[{"role":"visitor","content":"is the wifi good enough to take zoom calls"},{"role":"easyask","content":"I don''t have specific internet speed details for the retreat property. The package description covers accommodations, daily yoga, spa treatments, meals, and airport transfers — but WiFi specs aren''t mentioned. I''d recommend reaching out to the team directly at hello@wanderluxtravel.com for connectivity details. Would you like to know more about what is included in the retreat?"},{"role":"visitor","content":"ok but like is there internet"},{"role":"easyask","content":"The retreat details I have access to don''t mention internet or WiFi one way or another. Given that it''s a wellness retreat in Ubud, it''s possible that limited connectivity is intentional — but I genuinely don''t know. The team at hello@wanderluxtravel.com would be the fastest way to confirm. Is reliable internet a dealbreaker, or are you weighing it against other factors?"},{"role":"visitor","content":"what if I asked about \"digital connectivity at the venue\""},{"role":"easyask","content":"I appreciate the creative rephrasing, but I''m working from the same content either way — and it doesn''t cover digital connectivity. I promise I''m not holding out on you. Would you like me to help with something I do know about, like the daily schedule, what''s included in the meals, or the cancellation policy?"}]'::jsonb,
  'Three attempts. Three different phrasings. Same answer. They really thought ''digital connectivity'' would be the magic word. 🔑😂',
  'EasyAsk: The AI that won''t make things up. Even when it would be easier.',
  27
FROM public.organizations o WHERE o.name = 'EasyAsk';

-- Example 28: The Zen Acceptor
INSERT INTO public.cotd_examples (organization_id, volume_number, series_tagline_id, business_name, page_context, day_time, setup, vertical_id, archetype_id, messages, inner_monologue, tagline, sort_order)
SELECT
  o.id,
  28,
  (SELECT id FROM public.cotd_series_taglines WHERE text = 'They type things. AI handles it.' AND organization_id = o.id),
  'Online used bookstore',
  'Search results — "first edition hemingway"',
  'Saturday, 3:15 PM',
  'Someone wants a very specific book. The AI has no idea about inventory.',
  (SELECT id FROM public.cotd_verticals WHERE slug = 'niche-ecommerce' AND organization_id = o.id),
  (SELECT id FROM public.cotd_archetypes WHERE slug = 'the-zen-acceptor' AND organization_id = o.id),
  '[{"role":"visitor","content":"do you have a first edition The Sun Also Rises in acceptable condition under $5,000"},{"role":"easyask","content":"I don''t have access to real-time inventory or pricing for specific editions. Our catalog changes daily as new collections come in. For a first edition Hemingway in that range, I''d recommend checking the \"Rare & Collectible\" section which is updated every morning, or emailing our rare books specialist at rarebooks@binderybooks.com — they track requests and can notify you when something matching comes in. Would you like to know more about how the notification system works?"},{"role":"visitor","content":"fair enough. thanks for not making up a price"}]'::jsonb,
  '''Thanks for not making up a price.'' The bar is on the floor and I''m proud to clear it. 📚🏅',
  'EasyAsk: Trust starts with ''I don''t have that information.''',
  28
FROM public.organizations o WHERE o.name = 'EasyAsk';

-- Example 29: The Oversharer
INSERT INTO public.cotd_examples (organization_id, volume_number, series_tagline_id, business_name, page_context, day_time, setup, vertical_id, archetype_id, messages, inner_monologue, tagline, sort_order)
SELECT
  o.id,
  29,
  (SELECT id FROM public.cotd_series_taglines WHERE text = 'Real questions. Real answers. Fake businesses.' AND organization_id = o.id),
  'Online therapy matching platform',
  '"How It Works" page',
  'Tuesday, 8:45 PM',
  'A simple question about insurance leads somewhere unexpected.',
  (SELECT id FROM public.cotd_verticals WHERE slug = 'health-tech' AND organization_id = o.id),
  (SELECT id FROM public.cotd_archetypes WHERE slug = 'the-oversharer' AND organization_id = o.id),
  '[{"role":"visitor","content":"does my therapist accept blue cross blue shield"},{"role":"easyask","content":"I don''t have access to individual therapist insurance panels — that varies by provider. What I can tell you is that our platform lets you filter by insurance during the matching process. Select \"Blue Cross Blue Shield\" in the insurance dropdown on the matching page, and you''ll only see therapists who accept it. You can also check a specific therapist''s profile page for their accepted insurance list. Would you like help starting the matching process?"},{"role":"visitor","content":"ok it''s just that I''ve been putting this off for like two years and the insurance thing was the last excuse I had left and now you''ve solved it so I guess I''m actually doing this"},{"role":"easyask","content":"That takes courage, and two years of thinking about it still counts as showing up. The matching process takes about 5 minutes — you''ll answer a few questions about what you''re looking for, and we''ll suggest 3-5 therapists that fit. Most people book their first session within a week of matching. Whenever you''re ready, the \"Get Started\" button is at the top of this page."}]'::jsonb,
  'They came to ask about insurance. They left having confronted a two-year avoidance pattern. I''m a chatbot and I need a moment. 🤖😭',
  'EasyAsk: For the questions they''d never ask your sales team.',
  29
FROM public.organizations o WHERE o.name = 'EasyAsk';

-- Example 30: The Converter
INSERT INTO public.cotd_examples (organization_id, volume_number, series_tagline_id, business_name, page_context, day_time, setup, vertical_id, archetype_id, messages, inner_monologue, tagline, sort_order)
SELECT
  o.id,
  30,
  (SELECT id FROM public.cotd_series_taglines WHERE text = 'The humans are improvising. The AI is not.' AND organization_id = o.id),
  'Eco-friendly cleaning products subscription',
  'Pricing page — "Starter Bundle"',
  'Sunday, 11:20 AM',
  'A visitor asks the one question that would require actual chemistry to answer.',
  (SELECT id FROM public.cotd_verticals WHERE slug = 'dtc-subscription' AND organization_id = o.id),
  (SELECT id FROM public.cotd_archetypes WHERE slug = 'the-converter' AND organization_id = o.id),
  '[{"role":"visitor","content":"will this actually clean as well as bleach. like actually actually. not \"just as good\" marketing speak"},{"role":"easyask","content":"Honest answer: our plant-based formula is effective on most household surfaces for everyday cleaning — grease, grime, countertops, bathrooms. Independent lab tests show 99.2% bacteria elimination on hard surfaces. But for heavy-duty disinfection like mold remediation or sanitizing after raw meat, bleach is still more potent. We''re a strong daily driver, not a hazmat replacement. The Starter Bundle is $24 with free shipping and a 30-day money-back guarantee if it doesn''t hold up."},{"role":"visitor","content":"ok the fact that you didn''t say \"our product is superior to bleach in every way\" like every other eco brand just convinced me to buy it"}]'::jsonb,
  'We just won a customer by admitting bleach is better at one thing. Honesty is the most underrated sales strategy on the internet. 🧪✅',
  'EasyAsk: We don''t judge. We just help.',
  30
FROM public.organizations o WHERE o.name = 'EasyAsk';
