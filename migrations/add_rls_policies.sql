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
