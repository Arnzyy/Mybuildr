-- Function to sync project images to media_library
CREATE OR REPLACE FUNCTION sync_project_images_to_media_library()
RETURNS TRIGGER AS $$
DECLARE
  image_url TEXT;
  image_index INT;
BEGIN
  -- On INSERT or UPDATE, add new images to media_library
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Delete existing media library entries for this project (we'll re-add them)
    DELETE FROM media_library WHERE source_project_id = NEW.id;

    -- Add each image from the project's images array
    IF NEW.images IS NOT NULL AND array_length(NEW.images, 1) > 0 THEN
      FOREACH image_url IN ARRAY NEW.images
      LOOP
        INSERT INTO media_library (
          company_id,
          image_url,
          media_type,
          source_project_id,
          is_available,
          times_posted,
          created_at,
          updated_at
        )
        VALUES (
          NEW.company_id,
          image_url,
          'image',
          NEW.id,
          true,
          0,
          NOW(),
          NOW()
        );
      END LOOP;
    END IF;
  END IF;

  -- On DELETE, remove media library entries
  IF TG_OP = 'DELETE' THEN
    DELETE FROM media_library WHERE source_project_id = OLD.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for projects table
DROP TRIGGER IF EXISTS sync_project_images ON projects;
CREATE TRIGGER sync_project_images
  AFTER INSERT OR UPDATE OR DELETE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION sync_project_images_to_media_library();

-- Populate media_library with existing project images
INSERT INTO media_library (
  company_id,
  image_url,
  media_type,
  source_project_id,
  is_available,
  times_posted,
  created_at,
  updated_at
)
SELECT
  p.company_id,
  unnest(p.images) as image_url,
  'image' as media_type,
  p.id as source_project_id,
  true as is_available,
  0 as times_posted,
  NOW() as created_at,
  NOW() as updated_at
FROM projects p
WHERE p.images IS NOT NULL
  AND array_length(p.images, 1) > 0
ON CONFLICT DO NOTHING;

COMMENT ON FUNCTION sync_project_images_to_media_library() IS 'Automatically syncs project images to media_library table for social posting';
