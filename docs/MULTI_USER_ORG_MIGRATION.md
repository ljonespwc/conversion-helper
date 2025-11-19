# Multi-User Organizations Migration

**Date**: 2025-11-18
**Status**: Code complete, ready for database migration
**Architecture**: Single-org-per-user (simpler than full multi-tenant)

---

## Overview

Transformed from **single-user-per-org** to **multiple-users-per-org** architecture. Users can now be added to existing organizations with defined roles (owner, admin, editor, analyst).

---

## Database Changes

### New Tables

#### `organizations`
- `id` (uuid, primary key)
- `name` (text, NOT NULL)
- `website_url` (text, validated)
- `file_search_store_name` (text, UNIQUE)
- `created_at`, `updated_at` (timestamptz)

Moved org-level data from `users` table.

### Modified Tables

#### `users`
- **Added**: `organization_id` (uuid, references organizations)
- **Added**: `role` (text: owner, admin, editor, analyst)
- **Removed**: `organization_name`, `website_url`, `file_search_store_name`

#### Content Tables (widget_pages, indexed_pages, scraping_jobs, file_uploads)
- **Added**: `organization_id` (uuid, references organizations)
- **Renamed**: `user_id` → `created_by_user_id` (audit trail: who created it)

#### `conversation_sessions`
- **Added**: `organization_id` (uuid, nullable, for analytics filtering)

### RLS Policy Changes

**All content tables** now filter by organization membership:

**Old**:
```sql
WHERE auth.uid() = user_id
```

**New**:
```sql
WHERE organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
```

**Applies to**:
- users (SELECT shows all org members, UPDATE/DELETE restricted to own record)
- widget_pages
- indexed_pages
- scraping_jobs
- file_uploads

---

## Application Code Changes

### 1. Signup Flow (`src/app/login/actions.ts`)

**New order**:
1. Create auth user
2. Create organization
3. Create File Search store (associate with organization)
4. Create user record (with organization_id, role='owner')

### 2. Webhook (`src/app/api/layercode/webhook/route.ts`)

- Looks up `organization_id` from widget_page
- Stores with conversation_session for analytics filtering
- Passes to `trackConversation()` function

### 3. API Routes Updated

All routes that INSERT data now:
1. Get user's `organization_id` from users table
2. Set `organization_id` on new records
3. Set `created_by_user_id` = user.id (audit trail)

**Updated routes**:
- `/api/admin/widget-pages` (POST)
- `/api/admin/scrape` (POST)
- `/api/admin/upload-files` (POST)
- `/api/admin/upload-to-file-search` (POST)

**GET routes**: No changes needed - RLS automatically filters

### 4. Gemini File Search (`src/lib/gemini-file-search.ts`)

- Updated `queryPageContent()` to get `file_search_store_name` from organizations table (not users)
- Updated `getWidgetPage()` to return `organization_id` (not user_id)

---

## Migration Steps

### 1. Apply Database Migration

```bash
# Via Supabase MCP (recommended)
npx supabase db push

# Or manually via SQL editor
# Run: supabase/migrations/20251118_add_multi_user_organizations.sql
```

**What the migration does**:
1. Creates `organizations` table
2. Migrates existing user data → organizations
3. Adds `organization_id` + `role` to users
4. Adds `organization_id` to all content tables
5. Backfills organization_id from user's organization
6. Renames `user_id` → `created_by_user_id` on content tables
7. Updates ALL RLS policies
8. Drops old columns from users table

### 2. Verify Migration

Use MCP to check:

```sql
-- Check organizations created
SELECT * FROM organizations;

-- Check users have organization_id and role
SELECT id, email, organization_id, role FROM users;

-- Check content tables have organization_id
SELECT COUNT(*) as total,
       COUNT(organization_id) as with_org_id
FROM widget_pages;

-- Check RLS policies updated
\d+ widget_pages -- Look for new policies
```

### 3. Test Existing Functionality

**PN Account (existing user)**:
1. Log in with existing credentials
2. Visit /admin/pages - should see existing pages
3. Visit /admin/content - should see existing content
4. Create new widget page - should work
5. Create new scraping job - should work

**New Organization**:
1. Sign up with new account
2. Should create organization + File Search store
3. Should be assigned role='owner'

### 4. Add Users to Existing Org (MCP Only)

**Option A: User already has account**
```sql
-- They signed up, created their own org
-- Reassign them to PN org

UPDATE users
SET organization_id = '<PN_ORG_ID>', role = 'editor'
WHERE email = 'newuser@example.com';

-- Delete their orphaned org
DELETE FROM organizations
WHERE id = (SELECT organization_id FROM users WHERE email = 'newuser@example.com' LIMIT 1);
```

**Option B: Create new user directly**
```sql
-- First, create auth user via Supabase Dashboard
-- Then insert into users table:

INSERT INTO users (id, email, organization_id, role)
VALUES ('<AUTH_USER_ID>', 'newuser@example.com', '<PN_ORG_ID>', 'editor');
```

---

## Adding New Users (Manual Process)

Since no invitation UI was built (as requested), use this workflow:

### Step 1: Create Auth User
- Go to Supabase Dashboard → Authentication → Users
- Click "Invite user"
- Enter email, set temporary password

### Step 2: Add to Organization via MCP
```sql
-- Get organization ID first
SELECT id, name FROM organizations WHERE name = 'Precision Nutrition';

-- Add user to organization
INSERT INTO users (id, email, organization_id, role)
VALUES (
  '<AUTH_USER_ID_FROM_STEP_1>',
  'newuser@precisionnutrition.com',
  '<PN_ORG_ID>',
  'editor'  -- or 'admin', 'analyst'
);
```

### Step 3: User Logs In
- User receives invite email
- Sets their password
- Logs in
- Sees PN organization's data (filtered by RLS)

---

## Role Definitions

Currently all roles have same permissions (schema only, no enforcement yet):

- `owner`: Created the organization (one per org)
- `admin`: Full access (future: can invite users, manage settings)
- `editor`: Content management (future: can edit pages/content only)
- `analyst`: Read-only (future: can view analytics/conversations only)

To implement role-based permissions later, add checks in API routes:

```typescript
const { data: userData } = await supabase
  .from('users')
  .select('role')
  .eq('id', user.id)
  .single()

if (!['owner', 'admin'].includes(userData.role)) {
  return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
}
```

---

## What Won't Break

✅ All admin pages (RLS filters automatically)
✅ Widget functionality (looks up org via widget_page)
✅ Authentication flow
✅ Existing PN data (migrated to organizations)
✅ Conversations (organization_id optional/nullable)

---

## What Changed

⚠️ Signup creates organization first (not just user)
⚠️ API inserts require organization_id lookup
⚠️ RLS policies rewritten (queries stay same)
⚠️ File Search store now belongs to organization (not user)

---

## Rollback Plan

If migration fails:

1. Restore database backup (Supabase automatic backups)
2. Revert code changes:
   ```bash
   git revert <commit-hash>
   git push
   ```

3. Manual rollback SQL (if needed):
   ```sql
   -- Drop new columns
   ALTER TABLE users DROP COLUMN organization_id, DROP COLUMN role;
   ALTER TABLE widget_pages DROP COLUMN organization_id;
   -- etc.

   -- Restore old columns
   ALTER TABLE users ADD COLUMN organization_name TEXT;
   -- etc.

   -- Drop organizations table
   DROP TABLE organizations CASCADE;
   ```

---

## Files Changed

### Database
- `supabase/migrations/20251118_add_multi_user_organizations.sql` (NEW)

### Application Code
- `src/app/login/actions.ts` - Signup creates org first
- `src/app/api/layercode/webhook/route.ts` - Store organization_id with conversations
- `src/app/api/admin/widget-pages/route.ts` - Use organization_id
- `src/app/api/admin/scrape/route.ts` - Use organization_id
- `src/app/api/admin/upload-files/route.ts` - Use organization_id
- `src/app/api/admin/upload-to-file-search/route.ts` - Use organization_id, get store from orgs
- `src/lib/gemini-file-search.ts` - Get file_search_store_name from organizations

### Documentation
- `docs/MULTI_USER_ORG_MIGRATION.md` (THIS FILE)

---

## Next Steps

1. **Apply migration to production database** (use Supabase MCP or SQL editor)
2. **Test with existing PN account**
3. **Add first team member via MCP** (follow "Adding New Users" section)
4. **Monitor Vercel logs** for any errors
5. **Update PROGRESS.md** when stable

---

## Questions?

- Check Supabase logs for migration errors
- Check Vercel logs for application errors
- Use MCP to inspect database state
- Rollback if needed (see Rollback Plan above)
