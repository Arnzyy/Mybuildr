# ZIP-07: Admin Projects + Images

> **Time**: ~4 hours  
> **Outcome**: Full project management with image upload to R2  
> **Dependencies**: ZIP-06 complete

---

## WHAT YOU'LL HAVE AFTER THIS ZIP

- ✅ Projects list page with cards
- ✅ Create new project form
- ✅ Edit existing project
- ✅ Delete project with confirmation
- ✅ Image upload to Cloudflare R2
- ✅ Drag & drop image upload
- ✅ Multiple images per project
- ✅ Reorder images
- ✅ Feature gated to Pro+ tiers

---

## STEP 1: CLOUDFLARE R2 SETUP

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your account → R2 → Create bucket
3. Bucket name: `bytrade-images`
4. Location: Auto
5. Create bucket

6. Go to R2 → Overview → Manage R2 API Tokens
7. Create API Token:
   - Name: `bytrade-upload`
   - Permissions: Object Read & Write
   - Specify bucket: `bytrade-images`
   - Create

8. Copy:
   - Access Key ID
   - Secret Access Key
   - Endpoint (e.g., `https://<account-id>.r2.cloudflarestorage.com`)

9. Enable public access:
   - Go to bucket → Settings → Public Access
   - Add custom domain or use R2.dev subdomain
   - Copy public URL (e.g., `https://pub-xxx.r2.dev` or `https://images.bytrade.co.uk`)

---

## STEP 2: UPDATE ENV VARS

**File: `.env.local`** (add)

```env
# Cloudflare R2
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=bytrade-images
R2_PUBLIC_URL=https://pub-xxx.r2.dev
```

---

## STEP 3: INSTALL AWS SDK

R2 is S3-compatible, so we use AWS SDK:

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

---

## STEP 4: R2 CLIENT

**File: `src/lib/r2/client.ts`**

```typescript
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
```

---

## STEP 5: UPLOAD API ROUTE

**File: `src/app/api/admin/upload/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCompanyForUser } from '@/lib/supabase/queries'
import { uploadToR2, createUploadParams } from '@/lib/r2/client'
import { hasFeature } from '@/lib/features'

export async function POST(request: NextRequest) {
  try {
    // Verify auth
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const company = await getCompanyForUser(user.email!)
    if (!company) {
      return NextResponse.json({ error: 'No company found' }, { status: 404 })
    }

    // Check feature access
    if (!hasFeature(company.tier, 'upload_projects')) {
      return NextResponse.json({ error: 'Upgrade required' }, { status: 403 })
    }

    // Get form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })
    }

    // Generate filename and upload
    const { filename } = createUploadParams(file.name, company.slug)
    const buffer = Buffer.from(await file.arrayBuffer())
    const url = await uploadToR2(buffer, filename, file.type)

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
```

---

## STEP 6: PRESIGNED URL API (ALTERNATIVE)

**File: `src/app/api/admin/upload/presign/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCompanyForUser } from '@/lib/supabase/queries'
import { getPresignedUploadUrl, createUploadParams } from '@/lib/r2/client'
import { hasFeature } from '@/lib/features'

export async function POST(request: NextRequest) {
  try {
    // Verify auth
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const company = await getCompanyForUser(user.email!)
    if (!company) {
      return NextResponse.json({ error: 'No company found' }, { status: 404 })
    }

    // Check feature access
    if (!hasFeature(company.tier, 'upload_projects')) {
      return NextResponse.json({ error: 'Upgrade required' }, { status: 403 })
    }

    const { filename: originalName, contentType } = await request.json()

    // Validate content type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(contentType)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }

    const { filename } = createUploadParams(originalName, company.slug)
    const { uploadUrl, publicUrl } = await getPresignedUploadUrl(filename, contentType)

    return NextResponse.json({ uploadUrl, publicUrl })
  } catch (error) {
    console.error('Presign error:', error)
    return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 })
  }
}
```

---

## STEP 7: PROJECTS API ROUTES

**File: `src/app/api/admin/projects/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCompanyForUser } from '@/lib/supabase/queries'
import { createAdminClient } from '@/lib/supabase/admin'
import { hasFeature } from '@/lib/features'

// GET all projects
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const company = await getCompanyForUser(user.email!)
    if (!company) {
      return NextResponse.json({ error: 'No company found' }, { status: 404 })
    }

    const admin = createAdminClient()
    const { data: projects, error } = await admin
      .from('projects')
      .select('*')
      .eq('company_id', company.id)
      .order('display_order', { ascending: true })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
    }

    return NextResponse.json({ projects })
  } catch (error) {
    console.error('Projects fetch error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST create new project
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const company = await getCompanyForUser(user.email!)
    if (!company) {
      return NextResponse.json({ error: 'No company found' }, { status: 404 })
    }

    if (!hasFeature(company.tier, 'upload_projects')) {
      return NextResponse.json({ error: 'Upgrade required' }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, location, project_type, images } = body

    if (!title) {
      return NextResponse.json({ error: 'Title required' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Get max display order
    const { data: maxOrder } = await admin
      .from('projects')
      .select('display_order')
      .eq('company_id', company.id)
      .order('display_order', { ascending: false })
      .limit(1)
      .single()

    const nextOrder = (maxOrder?.display_order || 0) + 1

    const { data: project, error } = await admin
      .from('projects')
      .insert({
        company_id: company.id,
        title,
        description,
        location,
        project_type,
        images: images || [],
        featured_image_url: images?.[0] || null,
        display_order: nextOrder,
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create project:', error)
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
    }

    return NextResponse.json({ project })
  } catch (error) {
    console.error('Project create error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
```

**File: `src/app/api/admin/projects/[id]/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCompanyForUser } from '@/lib/supabase/queries'
import { createAdminClient } from '@/lib/supabase/admin'
import { deleteFromR2 } from '@/lib/r2/client'
import { hasFeature } from '@/lib/features'

// GET single project
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const company = await getCompanyForUser(user.email!)
    if (!company) {
      return NextResponse.json({ error: 'No company found' }, { status: 404 })
    }

    const admin = createAdminClient()
    const { data: project, error } = await admin
      .from('projects')
      .select('*')
      .eq('id', params.id)
      .eq('company_id', company.id)
      .single()

    if (error || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json({ project })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// PUT update project
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const company = await getCompanyForUser(user.email!)
    if (!company) {
      return NextResponse.json({ error: 'No company found' }, { status: 404 })
    }

    if (!hasFeature(company.tier, 'upload_projects')) {
      return NextResponse.json({ error: 'Upgrade required' }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, location, project_type, images, is_featured } = body

    const admin = createAdminClient()

    // Verify ownership
    const { data: existing } = await admin
      .from('projects')
      .select('company_id')
      .eq('id', params.id)
      .single()

    if (!existing || existing.company_id !== company.id) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const { data: project, error } = await admin
      .from('projects')
      .update({
        title,
        description,
        location,
        project_type,
        images,
        featured_image_url: images?.[0] || null,
        is_featured,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
    }

    return NextResponse.json({ project })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE project
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const company = await getCompanyForUser(user.email!)
    if (!company) {
      return NextResponse.json({ error: 'No company found' }, { status: 404 })
    }

    const admin = createAdminClient()

    // Get project to delete images
    const { data: project } = await admin
      .from('projects')
      .select('*')
      .eq('id', params.id)
      .eq('company_id', company.id)
      .single()

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Delete images from R2
    if (project.images && project.images.length > 0) {
      for (const imageUrl of project.images) {
        try {
          await deleteFromR2(imageUrl)
        } catch (e) {
          console.error('Failed to delete image:', imageUrl, e)
        }
      }
    }

    // Delete project
    const { error } = await admin
      .from('projects')
      .delete()
      .eq('id', params.id)

    if (error) {
      return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
```

---

## STEP 8: REORDER API

**File: `src/app/api/admin/projects/reorder/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCompanyForUser } from '@/lib/supabase/queries'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const company = await getCompanyForUser(user.email!)
    if (!company) {
      return NextResponse.json({ error: 'No company found' }, { status: 404 })
    }

    const { projectIds } = await request.json()

    if (!Array.isArray(projectIds)) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Update each project's display_order
    for (let i = 0; i < projectIds.length; i++) {
      await admin
        .from('projects')
        .update({ display_order: i })
        .eq('id', projectIds[i])
        .eq('company_id', company.id)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
```

---

## STEP 9: PROJECTS LIST PAGE

**File: `src/app/admin/projects/page.tsx`**

```typescript
import { createClient } from '@/lib/supabase/server'
import { getCompanyForUser, getCompanyProjects } from '@/lib/supabase/queries'
import { redirect } from 'next/navigation'
import { hasFeature } from '@/lib/features'
import Link from 'next/link'
import ProjectsList from '@/components/admin/ProjectsList'
import { Plus, Lock } from 'lucide-react'

export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')
  
  const company = await getCompanyForUser(user.email!)
  if (!company) redirect('/login')

  const canManageProjects = hasFeature(company.tier, 'upload_projects')

  if (!canManageProjects) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Upgrade Required</h1>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          Project management is available on Pro and Full Package plans. 
          Upgrade to add and manage your project portfolio.
        </p>
        <Link
          href="/admin/billing"
          className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600"
        >
          View Plans
        </Link>
      </div>
    )
  }

  const projects = await getCompanyProjects(company.id)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Projects
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your portfolio of work
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600"
        >
          <Plus className="w-5 h-5" />
          Add Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No projects yet</h2>
          <p className="text-gray-600 mb-6">
            Add your first project to showcase your work on your website
          </p>
          <Link
            href="/admin/projects/new"
            className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600"
          >
            <Plus className="w-5 h-5" />
            Add Your First Project
          </Link>
        </div>
      ) : (
        <ProjectsList initialProjects={projects} />
      )}
    </div>
  )
}
```

---

## STEP 10: PROJECTS LIST COMPONENT

**File: `src/components/admin/ProjectsList.tsx`**

```typescript
'use client'

import { useState } from 'react'
import { Project } from '@/lib/supabase/types'
import Link from 'next/link'
import { GripVertical, Edit, Trash2, Image as ImageIcon } from 'lucide-react'

interface ProjectsListProps {
  initialProjects: Project[]
}

export default function ProjectsList({ initialProjects }: ProjectsListProps) {
  const [projects, setProjects] = useState(initialProjects)
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project? This cannot be undone.')) {
      return
    }

    setDeleting(id)

    try {
      const res = await fetch(`/api/admin/projects/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setProjects(projects.filter(p => p.id !== id))
      } else {
        alert('Failed to delete project')
      }
    } catch (error) {
      alert('Failed to delete project')
    } finally {
      setDeleting(null)
    }
  }

  const handleReorder = async (dragIndex: number, dropIndex: number) => {
    const newProjects = [...projects]
    const [removed] = newProjects.splice(dragIndex, 1)
    newProjects.splice(dropIndex, 0, removed)
    setProjects(newProjects)

    // Save new order
    try {
      await fetch('/api/admin/projects/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectIds: newProjects.map(p => p.id),
        }),
      })
    } catch (error) {
      console.error('Failed to save order')
    }
  }

  return (
    <div className="space-y-4">
      {projects.map((project, index) => (
        <div
          key={project.id}
          className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4"
        >
          {/* Drag handle */}
          <button className="cursor-grab text-gray-400 hover:text-gray-600">
            <GripVertical className="w-5 h-5" />
          </button>

          {/* Image preview */}
          <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            {project.images && project.images[0] ? (
              <img
                src={project.images[0]}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-gray-300" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{project.title}</h3>
            <p className="text-sm text-gray-500 truncate">
              {project.description || 'No description'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {project.images?.length || 0} images
              {project.location && ` • ${project.location}`}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/projects/${project.id}`}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <Edit className="w-5 h-5" />
            </Link>
            <button
              onClick={() => handleDelete(project.id)}
              disabled={deleting === project.id}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}

      <p className="text-sm text-gray-500 text-center pt-4">
        Drag projects to reorder how they appear on your website
      </p>
    </div>
  )
}
```

---

## STEP 11: NEW PROJECT PAGE

**File: `src/app/admin/projects/new/page.tsx`**

```typescript
import { createClient } from '@/lib/supabase/server'
import { getCompanyForUser } from '@/lib/supabase/queries'
import { redirect } from 'next/navigation'
import { hasFeature } from '@/lib/features'
import ProjectForm from '@/components/admin/ProjectForm'

export default async function NewProjectPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')
  
  const company = await getCompanyForUser(user.email!)
  if (!company) redirect('/login')

  if (!hasFeature(company.tier, 'upload_projects')) {
    redirect('/admin/projects')
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Add New Project
        </h1>
        <p className="text-gray-600 mt-1">
          Showcase your work with photos and details
        </p>
      </div>

      <ProjectForm companySlug={company.slug} />
    </div>
  )
}
```

---

## STEP 12: EDIT PROJECT PAGE

**File: `src/app/admin/projects/[id]/page.tsx`**

```typescript
import { createClient } from '@/lib/supabase/server'
import { getCompanyForUser } from '@/lib/supabase/queries'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect, notFound } from 'next/navigation'
import { hasFeature } from '@/lib/features'
import ProjectForm from '@/components/admin/ProjectForm'

export default async function EditProjectPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')
  
  const company = await getCompanyForUser(user.email!)
  if (!company) redirect('/login')

  if (!hasFeature(company.tier, 'upload_projects')) {
    redirect('/admin/projects')
  }

  // Get project
  const admin = createAdminClient()
  const { data: project } = await admin
    .from('projects')
    .select('*')
    .eq('id', params.id)
    .eq('company_id', company.id)
    .single()

  if (!project) {
    notFound()
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Edit Project
        </h1>
        <p className="text-gray-600 mt-1">
          Update project details and images
        </p>
      </div>

      <ProjectForm companySlug={company.slug} project={project} />
    </div>
  )
}
```

---

## STEP 13: PROJECT FORM COMPONENT

**File: `src/components/admin/ProjectForm.tsx`**

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Project } from '@/lib/supabase/types'
import ImageUploader from './ImageUploader'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface ProjectFormProps {
  companySlug: string
  project?: Project
}

export default function ProjectForm({ companySlug, project }: ProjectFormProps) {
  const router = useRouter()
  const isEditing = !!project

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: project?.title || '',
    description: project?.description || '',
    location: project?.location || '',
    project_type: project?.project_type || '',
    is_featured: project?.is_featured || false,
  })
  const [images, setImages] = useState<string[]>(project?.images || [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      alert('Please enter a project title')
      return
    }

    setLoading(true)

    try {
      const url = isEditing 
        ? `/api/admin/projects/${project.id}`
        : '/api/admin/projects'

      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          images,
        }),
      })

      if (res.ok) {
        router.push('/admin/projects')
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to save project')
      }
    } catch (error) {
      alert('Failed to save project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Back link */}
      <Link 
        href="/admin/projects"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to projects
      </Link>

      {/* Images */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Project Photos</h2>
        <ImageUploader 
          images={images} 
          onChange={setImages}
          companySlug={companySlug}
        />
      </div>

      {/* Details */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-6">Project Details</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g. Kitchen Extension - Bristol"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe the project, what you did, any challenges..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Bristol, BS1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Type
              </label>
              <select
                name="project_type"
                value={formData.project_type}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Select type</option>
                <option value="extension">Extension</option>
                <option value="renovation">Renovation</option>
                <option value="new_build">New Build</option>
                <option value="loft_conversion">Loft Conversion</option>
                <option value="kitchen">Kitchen</option>
                <option value="bathroom">Bathroom</option>
                <option value="landscaping">Landscaping</option>
                <option value="electrical">Electrical</option>
                <option value="plumbing">Plumbing</option>
                <option value="roofing">Roofing</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_featured"
              name="is_featured"
              checked={formData.is_featured}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
            />
            <label htmlFor="is_featured" className="text-sm text-gray-700">
              Feature this project (shows prominently on your website)
            </label>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center justify-end gap-4">
        <Link
          href="/admin/projects"
          className="px-6 py-3 text-gray-700 font-medium hover:text-gray-900"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Project'}
        </button>
      </div>
    </form>
  )
}
```

---

## STEP 14: IMAGE UPLOADER COMPONENT

**File: `src/components/admin/ImageUploader.tsx`**

```typescript
'use client'

import { useState, useCallback } from 'react'
import { Upload, X, GripVertical, Loader2 } from 'lucide-react'

interface ImageUploaderProps {
  images: string[]
  onChange: (images: string[]) => void
  companySlug: string
  maxImages?: number
}

export default function ImageUploader({ 
  images, 
  onChange, 
  companySlug,
  maxImages = 10 
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const uploadFile = async (file: File): Promise<string | null> => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        const { url } = await res.json()
        return url
      } else {
        const { error } = await res.json()
        alert(error || 'Upload failed')
        return null
      }
    } catch (error) {
      alert('Upload failed')
      return null
    }
  }

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const remainingSlots = maxImages - images.length
    if (remainingSlots <= 0) {
      alert(`Maximum ${maxImages} images allowed`)
      return
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots)
    setUploading(true)

    const newUrls: string[] = []
    for (const file of filesToUpload) {
      const url = await uploadFile(file)
      if (url) {
        newUrls.push(url)
      }
    }

    if (newUrls.length > 0) {
      onChange([...images, ...newUrls])
    }

    setUploading(false)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }, [images])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const removeImage = (index: number) => {
    const newImages = [...images]
    newImages.splice(index, 1)
    onChange(newImages)
  }

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images]
    const [removed] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, removed)
    onChange(newImages)
  }

  return (
    <div className="space-y-4">
      {/* Upload zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          dragOver 
            ? 'border-orange-500 bg-orange-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        {uploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-2" />
            <p className="text-gray-600">Uploading...</p>
          </div>
        ) : (
          <>
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 mb-2">
              Drag & drop images here, or{' '}
              <label className="text-orange-500 hover:underline cursor-pointer">
                browse
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={(e) => handleFiles(e.target.files)}
                  className="hidden"
                />
              </label>
            </p>
            <p className="text-xs text-gray-400">
              JPG, PNG or WebP. Max 10MB per file. {images.length}/{maxImages} images.
            </p>
          </>
        )}
      </div>

      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((url, index) => (
            <div
              key={url}
              className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100"
            >
              <img
                src={url}
                alt={`Image ${index + 1}`}
                className="w-full h-full object-cover"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {/* Drag handle */}
                <button
                  type="button"
                  className="p-2 bg-white rounded-lg text-gray-700 hover:bg-gray-100"
                  title="Drag to reorder"
                >
                  <GripVertical className="w-4 h-4" />
                </button>
                
                {/* Remove */}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="p-2 bg-white rounded-lg text-red-600 hover:bg-red-50"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* First image badge */}
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                  Cover
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {images.length > 1 && (
        <p className="text-xs text-gray-500 text-center">
          First image is used as the cover photo. Drag to reorder.
        </p>
      )}
    </div>
  )
}
```

---

## STEP 15: TEST IT

1. Make sure R2 is set up with env vars
2. Run dev server:
```bash
npm run dev
```

3. Go to `http://localhost:3000/admin/projects`
4. If tier is starter, should see upgrade prompt
5. Update test company to pro tier:
```sql
UPDATE companies SET tier = 'pro' WHERE slug = 'test-builder';
```
6. Refresh - should see projects page
7. Click "Add Project"
8. Upload images, fill in details, save
9. Edit project - change images, update info
10. Delete project
11. Check builder site - projects should appear

---

## EXIT CRITERIA

- ✅ R2 bucket configured and working
- ✅ Image upload to R2 working
- ✅ Projects list page showing all projects
- ✅ Create new project with images
- ✅ Edit existing project
- ✅ Delete project (and images from R2)
- ✅ Drag & drop image upload
- ✅ Image reordering in form
- ✅ Feature gated to Pro+ tiers
- ✅ Images showing on builder site gallery
- ✅ `npm run build` passes

---

## NEXT: ZIP-08

ZIP-08 will add:
- Auto-posting engine
- Scheduled posts view
- Post queue management
- AI caption generation (Claude API)

---

**Projects with images working. Builders can showcase their work.**
