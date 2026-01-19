import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const R2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

const BUCKET = process.env.R2_BUCKET_NAME!
const PUBLIC_URL = process.env.R2_PUBLIC_URL!

// Generate a unique filename
function generateFilename(originalName: string, companySlug: string): string {
  const ext = originalName.split('.').pop()?.toLowerCase() || 'jpg'
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `${companySlug}/${timestamp}-${random}.${ext}`
}

// Upload file directly
export async function uploadToR2(
  file: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: filename,
    Body: file,
    ContentType: contentType,
  })

  await R2.send(command)
  return `${PUBLIC_URL}/${filename}`
}

// Get presigned URL for client-side upload
export async function getPresignedUploadUrl(
  filename: string,
  contentType: string
): Promise<{ uploadUrl: string; publicUrl: string }> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: filename,
    ContentType: contentType,
  })

  const uploadUrl = await getSignedUrl(R2, command, { expiresIn: 3600 })
  const publicUrl = `${PUBLIC_URL}/${filename}`

  return { uploadUrl, publicUrl }
}

// Delete file
export async function deleteFromR2(url: string): Promise<void> {
  // Extract key from URL
  const key = url.replace(`${PUBLIC_URL}/`, '')

  const command = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  })

  await R2.send(command)
}

// Helper to generate upload params
export function createUploadParams(originalName: string, companySlug: string) {
  const filename = generateFilename(originalName, companySlug)
  return { filename }
}

export { R2, BUCKET, PUBLIC_URL }
