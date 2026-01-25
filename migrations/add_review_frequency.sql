-- Add review post frequency setting to companies table
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS review_post_frequency INTEGER DEFAULT 3;

-- Set default value for existing companies
UPDATE companies
SET review_post_frequency = 3
WHERE review_post_frequency IS NULL;

-- Add constraint to ensure valid frequency values
ALTER TABLE companies
ADD CONSTRAINT review_post_frequency_check
CHECK (review_post_frequency >= 1 AND review_post_frequency <= 20);

COMMENT ON COLUMN companies.review_post_frequency IS 'How often to post reviews - e.g., 3 means post a review every 3rd post';
