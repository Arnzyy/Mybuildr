-- Add posting_times column to companies table
-- This allows users to customize when their posts go live (in UK time)

ALTER TABLE companies
ADD COLUMN IF NOT EXISTS posting_times integer[] DEFAULT ARRAY[8, 12, 18];

COMMENT ON COLUMN companies.posting_times IS 'Array of hours (0-23) when posts should be scheduled, in UK time. Default is [8, 12, 18] for 8am, 12pm, 6pm.';
