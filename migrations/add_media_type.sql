-- Add media_type column to media_library table
ALTER TABLE media_library
ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'image' CHECK (media_type IN ('image', 'video'));

-- Update existing rows to have 'image' as media_type
UPDATE media_library SET media_type = 'image' WHERE media_type IS NULL;

-- Make media_type NOT NULL after setting defaults
ALTER TABLE media_library
ALTER COLUMN media_type SET NOT NULL;

-- Add media_type column to scheduled_posts table
ALTER TABLE scheduled_posts
ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'image' CHECK (media_type IN ('image', 'video'));

-- Update existing rows to have 'image' as media_type
UPDATE scheduled_posts SET media_type = 'image' WHERE media_type IS NULL;

-- Make media_type NOT NULL after setting defaults
ALTER TABLE scheduled_posts
ALTER COLUMN media_type SET NOT NULL;

-- Add comment to explain the columns
COMMENT ON COLUMN media_library.media_type IS 'Type of media: image or video';
COMMENT ON COLUMN scheduled_posts.media_type IS 'Type of media: image or video';
