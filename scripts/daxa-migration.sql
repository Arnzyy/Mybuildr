-- Daxa Construction Migration
-- Generated: 2026-01-19T17:33:47.534Z

-- Update company with logo
UPDATE companies SET
  logo_url = 'https://pub-230d2c6e1ece421290be2447f48c41b8.r2.dev/daxa-construction/logo.png',
  hero_image_url = 'https://pub-230d2c6e1ece421290be2447f48c41b8.r2.dev/daxa-construction/gallery/001.jpg',
  phone = '07411 179660',
  address = 'Keynsham, Somerset BS31 2SE',
  services = ARRAY['Extensions', 'Loft Conversions', 'Knock Throughs', 'Renovations', 'New Builds', 'Garden Work'],
  description = 'Bristol''s trusted building and construction experts. Extensions, renovations, loft conversions and more.'
WHERE slug = 'daxa-construction';

-- Insert reviews
INSERT INTO reviews (company_id, customer_name, location, content, rating, is_featured)
SELECT id, 'Sarah Mitchell', 'Keynsham', 'Mark and Connor were absolutely brilliant from start to finish. Our extension was completed on time and to an exceptional standard. Would highly recommend!', 5, true
FROM companies WHERE slug = 'daxa-construction';

INSERT INTO reviews (company_id, customer_name, location, content, rating, is_featured)
SELECT id, 'James Thompson', 'Bath', 'Professional, reliable, and great attention to detail. The loft conversion has transformed our home. The team kept everything clean and tidy throughout.', 5, true
FROM companies WHERE slug = 'daxa-construction';

INSERT INTO reviews (company_id, customer_name, location, content, rating, is_featured)
SELECT id, 'Helen Roberts', 'Bristol', 'We couldn''t be happier with our new open-plan living space. The knock through was done expertly with minimal disruption. True craftsmen!', 5, true
FROM companies WHERE slug = 'daxa-construction';

INSERT INTO reviews (company_id, customer_name, location, content, rating, is_featured)
SELECT id, 'David King', 'Saltford', 'From the initial quote to the final finish, everything was handled professionally. Our renovation exceeded all expectations. Thank you DAXA!', 5, true
FROM companies WHERE slug = 'daxa-construction';

-- Insert projects (gallery images)

INSERT INTO projects (company_id, title, description, image_url, is_featured)
SELECT id, 'Modern Kitchen Extension', 'A stunning open-plan kitchen extension with bi-fold doors opening onto the garden.', 'https://pub-230d2c6e1ece421290be2447f48c41b8.r2.dev/daxa-construction/gallery/001.jpg', true
FROM companies WHERE slug = 'daxa-construction';

INSERT INTO projects (company_id, title, description, image_url, is_featured)
SELECT id, 'Loft Conversion', 'Full loft conversion with en-suite bathroom and Velux windows.', 'https://pub-230d2c6e1ece421290be2447f48c41b8.r2.dev/daxa-construction/gallery/002.jpg', true
FROM companies WHERE slug = 'daxa-construction';

INSERT INTO projects (company_id, title, description, image_url, is_featured)
SELECT id, 'Open Plan Living', 'Knock-through creating a beautiful open-plan living and dining space.', 'https://pub-230d2c6e1ece421290be2447f48c41b8.r2.dev/daxa-construction/gallery/003.jpg', true
FROM companies WHERE slug = 'daxa-construction';

INSERT INTO projects (company_id, title, description, image_url, is_featured)
SELECT id, 'Period Property Renovation', 'Complete renovation of a Victorian terraced house, preserving original features.', 'https://pub-230d2c6e1ece421290be2447f48c41b8.r2.dev/daxa-construction/gallery/004.jpg', false
FROM companies WHERE slug = 'daxa-construction';

INSERT INTO projects (company_id, title, description, image_url, is_featured)
SELECT id, 'New Build Project', 'Quality new build construction from foundations to finishing touches.', 'https://pub-230d2c6e1ece421290be2447f48c41b8.r2.dev/daxa-construction/gallery/005.jpg', false
FROM companies WHERE slug = 'daxa-construction';

INSERT INTO projects (company_id, title, description, image_url, is_featured)
SELECT id, 'Garden Room', 'Bespoke garden room perfect for a home office or studio.', 'https://pub-230d2c6e1ece421290be2447f48c41b8.r2.dev/daxa-construction/gallery/006.jpg', false
FROM companies WHERE slug = 'daxa-construction';

INSERT INTO projects (company_id, title, description, image_url, is_featured)
SELECT id, 'Rear Extension', 'Single-storey rear extension maximizing living space.', 'https://pub-230d2c6e1ece421290be2447f48c41b8.r2.dev/daxa-construction/gallery/007.jpg', false
FROM companies WHERE slug = 'daxa-construction';

INSERT INTO projects (company_id, title, description, image_url, is_featured)
SELECT id, 'Side Return Extension', 'Side return extension creating additional kitchen space.', 'https://pub-230d2c6e1ece421290be2447f48c41b8.r2.dev/daxa-construction/gallery/008.jpg', false
FROM companies WHERE slug = 'daxa-construction';

INSERT INTO projects (company_id, title, description, image_url, is_featured)
SELECT id, 'Bathroom Renovation', 'Complete bathroom renovation with modern fixtures.', 'https://pub-230d2c6e1ece421290be2447f48c41b8.r2.dev/daxa-construction/gallery/009.jpg', false
FROM companies WHERE slug = 'daxa-construction';

INSERT INTO projects (company_id, title, description, image_url, is_featured)
SELECT id, 'Structural Alterations', 'Structural alterations including steel beam installation.', 'https://pub-230d2c6e1ece421290be2447f48c41b8.r2.dev/daxa-construction/gallery/010.jpg', false
FROM companies WHERE slug = 'daxa-construction';
