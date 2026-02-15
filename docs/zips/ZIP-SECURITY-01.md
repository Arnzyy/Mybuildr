# ZIP-SECURITY-01: Database Row-Level Security

> **Priority**: 🔴 Critical
> **Estimated Time**: 4-6 hours
> **Dependencies**: None

---

## Problem

MyBuildr has no Row-Level Security (RLS) policies. All database protection relies on API-level authorization. If any API route has a bug or is bypassed, tenant data could be exposed or modified by unauthorized users.

---

## Tables Requiring RLS

| Table | Tenant Column | Access Pattern |
|-------|---------------|----------------|
| `companies` | `id` (self) + `email` (auth) | Owner only |
| `projects` | `company_id` | Owner only |
| `reviews` | `company_id` | Owner only |
| `media_library` | `company_id` | Owner only |
| `scheduled_posts` | `company_id` | Owner only |
| `social_tokens` | `company_id` | Owner only |
| `enquiries` | `company_id` | Public INSERT, owner SELECT |

---

## Implementation

### Step 1: Create Migration File

Create `migrations/add_rls_policies.sql`:

```sql
-- =============================================================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================================================
-- This migration enables RLS on all tenant-scoped tables and creates policies
-- to ensure users can only access their own company's data.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Helper function: Get company_id for authenticated user
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT id FROM public.companies
  WHERE email = auth.jwt() ->> 'email'
  LIMIT 1
$$;

-- -----------------------------------------------------------------------------
-- COMPANIES TABLE
-- -----------------------------------------------------------------------------
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Users can only see their own company
CREATE POLICY "Users can view own company"
  ON public.companies FOR SELECT
  USING (email = auth.jwt() ->> 'email');

-- Users can only update their own company
CREATE POLICY "Users can update own company"
  ON public.companies FOR UPDATE
  USING (email = auth.jwt() ->> 'email')
  WITH CHECK (email = auth.jwt() ->> 'email');

-- No direct INSERT/DELETE - handled by service role only

-- -----------------------------------------------------------------------------
-- PROJECTS TABLE
-- -----------------------------------------------------------------------------
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects"
  ON public.projects FOR SELECT
  USING (company_id = public.get_user_company_id());

CREATE POLICY "Users can insert own projects"
  ON public.projects FOR INSERT
  WITH CHECK (company_id = public.get_user_company_id());

CREATE POLICY "Users can update own projects"
  ON public.projects FOR UPDATE
  USING (company_id = public.get_user_company_id())
  WITH CHECK (company_id = public.get_user_company_id());

CREATE POLICY "Users can delete own projects"
  ON public.projects FOR DELETE
  USING (company_id = public.get_user_company_id());

-- -----------------------------------------------------------------------------
-- REVIEWS TABLE
-- -----------------------------------------------------------------------------
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reviews"
  ON public.reviews FOR SELECT
  USING (company_id = public.get_user_company_id());

CREATE POLICY "Users can insert own reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (company_id = public.get_user_company_id());

CREATE POLICY "Users can update own reviews"
  ON public.reviews FOR UPDATE
  USING (company_id = public.get_user_company_id())
  WITH CHECK (company_id = public.get_user_company_id());

CREATE POLICY "Users can delete own reviews"
  ON public.reviews FOR DELETE
  USING (company_id = public.get_user_company_id());

-- -----------------------------------------------------------------------------
-- MEDIA_LIBRARY TABLE
-- -----------------------------------------------------------------------------
ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own media"
  ON public.media_library FOR SELECT
  USING (company_id = public.get_user_company_id());

CREATE POLICY "Users can insert own media"
  ON public.media_library FOR INSERT
  WITH CHECK (company_id = public.get_user_company_id());

CREATE POLICY "Users can update own media"
  ON public.media_library FOR UPDATE
  USING (company_id = public.get_user_company_id())
  WITH CHECK (company_id = public.get_user_company_id());

CREATE POLICY "Users can delete own media"
  ON public.media_library FOR DELETE
  USING (company_id = public.get_user_company_id());

-- -----------------------------------------------------------------------------
-- SCHEDULED_POSTS TABLE
-- -----------------------------------------------------------------------------
ALTER TABLE public.scheduled_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own posts"
  ON public.scheduled_posts FOR SELECT
  USING (company_id = public.get_user_company_id());

CREATE POLICY "Users can insert own posts"
  ON public.scheduled_posts FOR INSERT
  WITH CHECK (company_id = public.get_user_company_id());

CREATE POLICY "Users can update own posts"
  ON public.scheduled_posts FOR UPDATE
  USING (company_id = public.get_user_company_id())
  WITH CHECK (company_id = public.get_user_company_id());

CREATE POLICY "Users can delete own posts"
  ON public.scheduled_posts FOR DELETE
  USING (company_id = public.get_user_company_id());

-- -----------------------------------------------------------------------------
-- SOCIAL_TOKENS TABLE
-- -----------------------------------------------------------------------------
ALTER TABLE public.social_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tokens"
  ON public.social_tokens FOR SELECT
  USING (company_id = public.get_user_company_id());

CREATE POLICY "Users can insert own tokens"
  ON public.social_tokens FOR INSERT
  WITH CHECK (company_id = public.get_user_company_id());

CREATE POLICY "Users can update own tokens"
  ON public.social_tokens FOR UPDATE
  USING (company_id = public.get_user_company_id())
  WITH CHECK (company_id = public.get_user_company_id());

CREATE POLICY "Users can delete own tokens"
  ON public.social_tokens FOR DELETE
  USING (company_id = public.get_user_company_id());

-- -----------------------------------------------------------------------------
-- ENQUIRIES TABLE
-- Special case: Public can INSERT, only owner can SELECT
-- -----------------------------------------------------------------------------
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

-- Anyone can submit an enquiry (public form)
CREATE POLICY "Anyone can insert enquiries"
  ON public.enquiries FOR INSERT
  WITH CHECK (true);

-- Only company owner can view their enquiries
CREATE POLICY "Users can view own enquiries"
  ON public.enquiries FOR SELECT
  USING (company_id = public.get_user_company_id());

-- Only company owner can update enquiries
CREATE POLICY "Users can update own enquiries"
  ON public.enquiries FOR UPDATE
  USING (company_id = public.get_user_company_id());

-- Only company owner can delete enquiries
CREATE POLICY "Users can delete own enquiries"
  ON public.enquiries FOR DELETE
  USING (company_id = public.get_user_company_id());
```

### Step 2: Run Migration

Option A - Supabase CLI:
```bash
npx supabase db push
```

Option B - Manual (Supabase Dashboard):
1. Go to SQL Editor
2. Paste the migration SQL
3. Click Run

### Step 3: Verify RLS is Active

Run this query in Supabase SQL Editor:
```sql
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

All tables should show `rowsecurity = true`.

### Step 4: Test Tenant Isolation

**Test 1: Cross-tenant access denied**
1. Log in as User A
2. Note User A's company_id
3. Try to access projects with a different company_id via API
4. Should return empty results (not error)

**Test 2: Own data accessible**
1. Log in as User A
2. Create a project
3. Fetch projects via API
4. Should see the created project

---

## Code Changes Required

### Update `src/lib/supabase/queries.ts`

The public queries (getCompanyBySlug, getCompanyByDomain) need to use service role because they're called for public builder sites without auth. These already use `createAdminClient()` - no change needed.

### Important: Service Role Usage

The `createAdminClient()` bypasses RLS intentionally for:
- Public site rendering (no auth context)
- Cron jobs (system context)
- OAuth callbacks (before user session exists)

This is correct behavior. RLS protects when users interact via authenticated client.

---

## Exit Criteria

- [ ] Migration file created
- [ ] Migration applied to Supabase
- [ ] All 7 tables have RLS enabled (verified via query)
- [ ] `get_user_company_id()` function exists
- [ ] Cross-tenant access test: DENIED
- [ ] Own data access test: ALLOWED
- [ ] Public enquiry submission: WORKS
- [ ] Public site rendering: WORKS (uses service role)
- [ ] Cron job execution: WORKS (uses service role)

---

## Rollback Plan

If issues occur:
```sql
-- Disable RLS (emergency only)
ALTER TABLE public.companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_library DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_tokens DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries DISABLE ROW LEVEL SECURITY;

-- Drop policies
DROP POLICY IF EXISTS "Users can view own company" ON public.companies;
-- ... (repeat for all policies)

-- Drop helper function
DROP FUNCTION IF EXISTS public.get_user_company_id();
```

---

## Notes

- RLS policies use `auth.jwt() ->> 'email'` to identify the user
- The `get_user_company_id()` function is `SECURITY DEFINER` so it can read companies table
- Service role key bypasses RLS by design (needed for cron jobs, public sites)
- Anon key respects RLS (used for authenticated user operations)
