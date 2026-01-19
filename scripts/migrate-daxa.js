/**
 * Migration script for Daxa Construction
 * Run with: node scripts/migrate-daxa.js
 */

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

// R2 Configuration - using your credentials
const R2_ACCOUNT_ID = 'aa2e35887d729ca0eaa64934e6c761e1';
const R2_ACCESS_KEY_ID = 'a555602f1a01969d98481d2b92539ac8';
const R2_SECRET_ACCESS_KEY = 'efbf33e3021cb2a23b178742a4340496aab0b72de07bb5fe73955e5f9eeabc7a';
const R2_BUCKET = 'bytradetest';
const R2_PUBLIC_URL = 'https://pub-230d2c6e1ece421290be2447f48c41b8.r2.dev';

// Daxa source folder
const DAXA_PATH = 'C:\\Users\\Billy\\Documents\\GitHub\\Daxaconstruction\\public\\daxabuildingsolutions';

// S3 Client for R2
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

async function uploadFile(localPath, r2Key) {
  const fileContent = fs.readFileSync(localPath);
  const ext = path.extname(localPath).toLowerCase();

  const contentTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
  };

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: r2Key,
    Body: fileContent,
    ContentType: contentTypes[ext] || 'application/octet-stream',
  });

  await s3Client.send(command);
  return `${R2_PUBLIC_URL}/${r2Key}`;
}

async function migrate() {
  console.log('🚀 Starting Daxa Construction migration...\n');

  const uploadedImages = [];

  // 1. Upload logo
  console.log('📸 Uploading logo...');
  const logoPath = path.join(DAXA_PATH, 'logo.png');
  if (fs.existsSync(logoPath)) {
    const logoUrl = await uploadFile(logoPath, 'daxa-construction/logo.png');
    console.log(`   ✅ Logo: ${logoUrl}`);
    uploadedImages.push({ type: 'logo', url: logoUrl });
  }

  // 2. Upload gallery images
  console.log('\n📸 Uploading gallery images...');
  const galleryPath = path.join(DAXA_PATH, 'gallery');

  if (fs.existsSync(galleryPath)) {
    const files = fs.readdirSync(galleryPath)
      .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
      .sort();

    for (const file of files) {
      const localPath = path.join(galleryPath, file);
      const r2Key = `daxa-construction/gallery/${file}`;
      const url = await uploadFile(localPath, r2Key);
      console.log(`   ✅ ${file}`);
      uploadedImages.push({ type: 'gallery', file, url });
    }
  }

  // 3. Generate SQL
  console.log('\n📝 Generating SQL...\n');

  const logoUrl = uploadedImages.find(i => i.type === 'logo')?.url;
  const galleryImages = uploadedImages.filter(i => i.type === 'gallery');

  // Project titles based on services
  const projectTitles = [
    { title: 'Modern Kitchen Extension', description: 'A stunning open-plan kitchen extension with bi-fold doors opening onto the garden.' },
    { title: 'Loft Conversion', description: 'Full loft conversion with en-suite bathroom and Velux windows.' },
    { title: 'Open Plan Living', description: 'Knock-through creating a beautiful open-plan living and dining space.' },
    { title: 'Period Property Renovation', description: 'Complete renovation of a Victorian terraced house, preserving original features.' },
    { title: 'New Build Project', description: 'Quality new build construction from foundations to finishing touches.' },
    { title: 'Garden Room', description: 'Bespoke garden room perfect for a home office or studio.' },
    { title: 'Rear Extension', description: 'Single-storey rear extension maximizing living space.' },
    { title: 'Side Return Extension', description: 'Side return extension creating additional kitchen space.' },
    { title: 'Bathroom Renovation', description: 'Complete bathroom renovation with modern fixtures.' },
    { title: 'Structural Alterations', description: 'Structural alterations including steel beam installation.' },
  ];

  let sql = `-- Daxa Construction Migration
-- Generated: ${new Date().toISOString()}

-- Update company with logo
UPDATE companies SET
  logo_url = '${logoUrl}',
  hero_image_url = '${galleryImages[0]?.url || ''}',
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
`;

  // Add projects (use up to 10 gallery images as projects)
  galleryImages.slice(0, 10).forEach((img, i) => {
    const project = projectTitles[i] || { title: `Project ${i + 1}`, description: 'Quality construction work.' };
    sql += `
INSERT INTO projects (company_id, title, description, image_url, is_featured)
SELECT id, '${project.title}', '${project.description}', '${img.url}', ${i < 3 ? 'true' : 'false'}
FROM companies WHERE slug = 'daxa-construction';
`;
  });

  // Save SQL file
  const sqlPath = path.join(__dirname, 'daxa-migration.sql');
  fs.writeFileSync(sqlPath, sql);
  console.log(`✅ SQL saved to: ${sqlPath}`);

  console.log('\n' + '='.repeat(60));
  console.log('🎉 Migration complete!');
  console.log('='.repeat(60));
  console.log(`\nUploaded: ${uploadedImages.length} images`);
  console.log(`\nNext steps:`);
  console.log(`1. Run the SQL in Supabase SQL Editor:`);
  console.log(`   ${sqlPath}`);
  console.log(`2. Log in at: https://mybuildr.vercel.app/admin`);
  console.log(`   Email: daxabuilding@gmail.com`);
}

migrate().catch(console.error);
