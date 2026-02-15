# ZIP-08: Auto-Posting Engine

> **Time**: ~5 hours  
> **Outcome**: Automated post scheduling, AI captions, post queue management  
> **Dependencies**: ZIP-07 complete

---

## WHAT YOU'LL HAVE AFTER THIS ZIP

- ✅ Post scheduling engine
- ✅ AI caption generation (Claude API)
- ✅ Scheduled posts admin view
- ✅ Post queue management
- ✅ Cron job for triggering posts
- ✅ Post status tracking (pending/posted/failed)
- ✅ Feature gated to Full Package tier

---

## HOW AUTO-POSTING WORKS

```
1. Builder uploads project images
2. System picks unused images
3. Claude generates caption + hashtags
4. Post scheduled for next slot
5. Cron job runs every hour
6. Posts sent to Instagram/Facebook/Google (ZIP-09)
7. Status updated in database
```

**Posting Schedule:**
- 5 posts per week (configurable)
- Optimal times: 8am, 12pm, 6pm UK time
- Spread across weekdays

---

## STEP 1: UPDATE ENV VARS

**File: `.env.local`** (add)

```env
# Claude API for caption generation
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Cron secret (for secure cron endpoint)
CRON_SECRET=your-random-secret-string
```

---

## STEP 2: INSTALL ANTHROPIC SDK

```bash
npm install @anthropic-ai/sdk
```

---

## STEP 3: CAPTION GENERATOR

**File: `src/lib/ai/captions.ts`**

```typescript
import Anthropic from '@anthropic-ai/sdk'
import { Company, Project } from '@/lib/supabase/types'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

interface GeneratedCaption {
  caption: string
  hashtags: string[]
}

export async function generateCaption(
  company: Company,
  project: Project,
  imageIndex: number = 0
): Promise<GeneratedCaption> {
  const prompt = `You are a social media manager for a ${company.trade_type || 'construction'} company called "${company.name}" based in ${company.city || 'the UK'}.

Generate an Instagram caption for a project photo. The project is:
- Title: ${project.title}
- Description: ${project.description || 'No description provided'}
- Location: ${project.location || company.city || 'Local area'}
- Type: ${project.project_type || 'construction work'}

Rules:
1. Keep it SHORT - max 2-3 sentences
2. Sound like a real tradesperson, not a marketing agency
3. Be proud of the work but not boastful
4. Include a subtle call to action (contact us, get in touch, etc.)
5. Don't use emojis excessively (1-2 max)
6. Sound authentic, not salesy

Also provide 5-8 relevant hashtags for the UK construction/trades market.

Respond in this exact JSON format:
{
  "caption": "Your caption here",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"]
}

Only respond with the JSON, nothing else.`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 300,
      messages: [
        { role: 'user', content: prompt }
      ],
    })

    const text = response.content[0].type === 'text' 
      ? response.content[0].text 
      : ''

    // Parse JSON response
    const parsed = JSON.parse(text)
    
    return {
      caption: parsed.caption,
      hashtags: parsed.hashtags.map((h: string) => h.replace('#', '')),
    }
  } catch (error) {
    console.error('Caption generation failed:', error)
    
    // Fallback caption
    return {
      caption: `Another great ${project.project_type || 'project'} completed${project.location ? ` in ${project.location}` : ''}. Get in touch for a free quote! 🏗️`,
      hashtags: [
        company.trade_type?.toLowerCase().replace(/\s+/g, '') || 'construction',
        'ukbuilder',
        'tradesman',
        company.city?.toLowerCase().replace(/\s+/g, '') || 'local',
        'qualitywork',
      ],
    }
  }
}

// Generate multiple caption variants
export async function generateCaptionVariants(
  company: Company,
  project: Project,
  count: number = 3
): Promise<GeneratedCaption[]> {
  const variants: GeneratedCaption[] = []
  
  for (let i = 0; i < count; i++) {
    const caption = await generateCaption(company, project, i)
    variants.push(caption)
  }
  
  return variants
}
```

---

## STEP 4: POST SCHEDULER

**File: `src/lib/posting/scheduler.ts`**

```typescript
import { createAdminClient } from '@/lib/supabase/admin'
import { generateCaption } from '@/lib/ai/captions'
import { Company, Project } from '@/lib/supabase/types'

// UK timezone
const UK_TIMEZONE = 'Europe/London'

// Optimal posting times (hour in 24h format)
const POSTING_TIMES = [8, 12, 18] // 8am, 12pm, 6pm

// Get next available posting slot
function getNextPostingSlot(
  existingSlots: Date[],
  postsPerWeek: number = 5
): Date {
  const now = new Date()
  const ukNow = new Date(now.toLocaleString('en-US', { timeZone: UK_TIMEZONE }))
  
  // Start from tomorrow
  let checkDate = new Date(ukNow)
  checkDate.setDate(checkDate.getDate() + 1)
  checkDate.setHours(0, 0, 0, 0)

  // Count posts this week
  const weekStart = new Date(ukNow)
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  weekStart.setHours(0, 0, 0, 0)

  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 7)

  // Find posts already scheduled this week
  const scheduledThisWeek = existingSlots.filter(slot => {
    const slotDate = new Date(slot)
    return slotDate >= weekStart && slotDate < weekEnd
  })

  // Look for next available slot
  for (let day = 0; day < 14; day++) {
    const date = new Date(checkDate)
    date.setDate(date.getDate() + day)
    
    // Skip weekends (optional - can post on weekends too)
    const dayOfWeek = date.getDay()
    
    // Check each posting time
    for (const hour of POSTING_TIMES) {
      const slot = new Date(date)
      slot.setHours(hour, 0, 0, 0)
      
      // Skip if in the past
      if (slot <= now) continue
      
      // Check if slot is already taken
      const slotTaken = existingSlots.some(existing => {
        const existingDate = new Date(existing)
        return Math.abs(existingDate.getTime() - slot.getTime()) < 60 * 60 * 1000 // Within 1 hour
      })
      
      if (!slotTaken) {
        return slot
      }
    }
  }

  // Fallback: tomorrow at noon
  const fallback = new Date(ukNow)
  fallback.setDate(fallback.getDate() + 1)
  fallback.setHours(12, 0, 0, 0)
  return fallback
}

// Get an unused image from company's projects
async function getUnusedImage(companyId: string): Promise<{
  project: Project
  imageUrl: string
  imageIndex: number
} | null> {
  const supabase = createAdminClient()

  // Get all projects with images
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })

  if (!projects || projects.length === 0) return null

  // Find an image that hasn't been posted recently
  for (const project of projects) {
    if (!project.images || project.images.length === 0) continue

    for (let i = 0; i < project.images.length; i++) {
      const imageUrl = project.images[i]

      // Check if this image was posted in the last 30 days
      const { data: recentPost } = await supabase
        .from('scheduled_posts')
        .select('id')
        .eq('image_url', imageUrl)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .single()

      if (!recentPost) {
        return {
          project: project as Project,
          imageUrl,
          imageIndex: i,
        }
      }
    }
  }

  // If all images used recently, pick random one
  const randomProject = projects[Math.floor(Math.random() * projects.length)]
  if (randomProject.images && randomProject.images.length > 0) {
    const randomIndex = Math.floor(Math.random() * randomProject.images.length)
    return {
      project: randomProject as Project,
      imageUrl: randomProject.images[randomIndex],
      imageIndex: randomIndex,
    }
  }

  return null
}

// Schedule a new post for a company
export async function schedulePost(company: Company): Promise<{
  success: boolean
  postId?: string
  error?: string
}> {
  const supabase = createAdminClient()

  try {
    // Get unused image
    const imageData = await getUnusedImage(company.id)
    if (!imageData) {
      return { success: false, error: 'No images available for posting' }
    }

    // Get existing scheduled posts for slot calculation
    const { data: existingPosts } = await supabase
      .from('scheduled_posts')
      .select('scheduled_for')
      .eq('company_id', company.id)
      .eq('status', 'pending')
      .gte('scheduled_for', new Date().toISOString())

    const existingSlots = (existingPosts || []).map(p => new Date(p.scheduled_for))

    // Get next slot
    const scheduledFor = getNextPostingSlot(existingSlots, company.posts_per_week)

    // Generate caption
    const { caption, hashtags } = await generateCaption(
      company,
      imageData.project,
      imageData.imageIndex
    )

    // Create scheduled post
    const { data: post, error } = await supabase
      .from('scheduled_posts')
      .insert({
        company_id: company.id,
        project_id: imageData.project.id,
        image_url: imageData.imageUrl,
        caption,
        hashtags,
        scheduled_for: scheduledFor.toISOString(),
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create scheduled post:', error)
      return { success: false, error: 'Failed to schedule post' }
    }

    return { success: true, postId: post.id }
  } catch (error) {
    console.error('Schedule post error:', error)
    return { success: false, error: 'Scheduling failed' }
  }
}

// Fill up the post queue for a company
export async function fillPostQueue(
  company: Company,
  targetCount: number = 7 // 1 week ahead
): Promise<number> {
  const supabase = createAdminClient()

  // Count existing pending posts
  const { count: existingCount } = await supabase
    .from('scheduled_posts')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', company.id)
    .eq('status', 'pending')
    .gte('scheduled_for', new Date().toISOString())

  const currentCount = existingCount || 0
  const postsNeeded = Math.max(0, targetCount - currentCount)

  let scheduled = 0
  for (let i = 0; i < postsNeeded; i++) {
    const result = await schedulePost(company)
    if (result.success) {
      scheduled++
    } else {
      // Stop if we can't schedule more (e.g., no images)
      break
    }
  }

  return scheduled
}
```

---

## STEP 5: CRON ENDPOINT

**File: `src/app/api/cron/schedule-posts/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { fillPostQueue } from '@/lib/posting/scheduler'
import { Company } from '@/lib/supabase/types'

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  try {
    // Get all companies with posting enabled (Full Package)
    const { data: companies, error } = await supabase
      .from('companies')
      .select('*')
      .eq('tier', 'full')
      .eq('posting_enabled', true)
      .eq('is_active', true)

    if (error || !companies) {
      return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 })
    }

    const results: { companyId: string; scheduled: number }[] = []

    for (const company of companies as Company[]) {
      const scheduled = await fillPostQueue(company)
      results.push({ companyId: company.id, scheduled })
    }

    return NextResponse.json({
      success: true,
      companiesProcessed: companies.length,
      results,
    })
  } catch (error) {
    console.error('Cron schedule-posts error:', error)
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 })
  }
}
```

---

## STEP 6: POST EXECUTION CRON

**File: `src/app/api/cron/execute-posts/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  try {
    // Get posts due for execution
    const { data: duePosts, error } = await supabase
      .from('scheduled_posts')
      .select(`
        *,
        company:companies(*)
      `)
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .limit(10) // Process in batches

    if (error || !duePosts) {
      return NextResponse.json({ error: 'Failed to fetch due posts' }, { status: 500 })
    }

    const results: { postId: string; status: string; error?: string }[] = []

    for (const post of duePosts) {
      try {
        // TODO: Actually post to social media (ZIP-09)
        // For now, just mark as posted
        
        // This is where we'll call Instagram/Facebook/Google APIs
        // const instagramResult = await postToInstagram(post)
        // const facebookResult = await postToFacebook(post)
        // const googleResult = await postToGoogle(post)

        // Mark as posted (placeholder until ZIP-09)
        await supabase
          .from('scheduled_posts')
          .update({
            status: 'posted',
            posted_at: new Date().toISOString(),
            // instagram_post_id: instagramResult.id,
            // facebook_post_id: facebookResult.id,
            // google_post_id: googleResult.id,
          })
          .eq('id', post.id)

        // Update project's last_posted_at
        await supabase
          .from('projects')
          .update({
            used_in_post: true,
            last_posted_at: new Date().toISOString(),
          })
          .eq('id', post.project_id)

        results.push({ postId: post.id, status: 'posted' })
      } catch (postError: any) {
        // Mark as failed
        await supabase
          .from('scheduled_posts')
          .update({
            status: 'failed',
            error_message: postError.message || 'Unknown error',
            retry_count: (post.retry_count || 0) + 1,
          })
          .eq('id', post.id)

        results.push({ postId: post.id, status: 'failed', error: postError.message })
      }
    }

    return NextResponse.json({
      success: true,
      postsProcessed: duePosts.length,
      results,
    })
  } catch (error) {
    console.error('Cron execute-posts error:', error)
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 })
  }
}
```

---

## STEP 7: VERCEL CRON CONFIG

**File: `vercel.json`** (create or update)

```json
{
  "crons": [
    {
      "path": "/api/cron/schedule-posts",
      "schedule": "0 6 * * *"
    },
    {
      "path": "/api/cron/execute-posts",
      "schedule": "0 8,12,18 * * *"
    }
  ]
}
```

This runs:
- `schedule-posts`: Daily at 6am UTC (fills queue for week ahead)
- `execute-posts`: 8am, 12pm, 6pm UTC (posts due content)

---

## STEP 8: SCHEDULED POSTS API

**File: `src/app/api/admin/posts/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCompanyForUser } from '@/lib/supabase/queries'
import { createAdminClient } from '@/lib/supabase/admin'
import { hasFeature } from '@/lib/features'

// GET scheduled posts
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

    if (!hasFeature(company.tier, 'view_scheduled_posts')) {
      return NextResponse.json({ error: 'Upgrade required' }, { status: 403 })
    }

    const admin = createAdminClient()
    
    // Get URL params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '20')

    let query = admin
      .from('scheduled_posts')
      .select(`
        *,
        project:projects(title)
      `)
      .eq('company_id', company.id)
      .order('scheduled_for', { ascending: true })
      .limit(limit)

    if (status) {
      query = query.eq('status', status)
    }

    const { data: posts, error } = await query

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
    }

    return NextResponse.json({ posts })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
```

**File: `src/app/api/admin/posts/[id]/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCompanyForUser } from '@/lib/supabase/queries'
import { createAdminClient } from '@/lib/supabase/admin'
import { hasFeature } from '@/lib/features'

// DELETE (cancel) a scheduled post
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

    if (!hasFeature(company.tier, 'view_scheduled_posts')) {
      return NextResponse.json({ error: 'Upgrade required' }, { status: 403 })
    }

    const admin = createAdminClient()

    // Verify ownership and status
    const { data: post } = await admin
      .from('scheduled_posts')
      .select('*')
      .eq('id', params.id)
      .eq('company_id', company.id)
      .single()

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    if (post.status !== 'pending') {
      return NextResponse.json({ error: 'Can only cancel pending posts' }, { status: 400 })
    }

    // Update to skipped status
    await admin
      .from('scheduled_posts')
      .update({ status: 'skipped' })
      .eq('id', params.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// PUT update caption
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

    const { caption, hashtags } = await request.json()

    const admin = createAdminClient()

    // Verify ownership
    const { data: post } = await admin
      .from('scheduled_posts')
      .select('*')
      .eq('id', params.id)
      .eq('company_id', company.id)
      .eq('status', 'pending')
      .single()

    if (!post) {
      return NextResponse.json({ error: 'Post not found or not editable' }, { status: 404 })
    }

    await admin
      .from('scheduled_posts')
      .update({ caption, hashtags })
      .eq('id', params.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
```

---

## STEP 9: MANUAL SCHEDULE TRIGGER API

**File: `src/app/api/admin/posts/generate/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCompanyForUser } from '@/lib/supabase/queries'
import { fillPostQueue } from '@/lib/posting/scheduler'
import { hasFeature } from '@/lib/features'

// POST - manually trigger post generation
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

    if (!hasFeature(company.tier, 'auto_posting')) {
      return NextResponse.json({ error: 'Upgrade to Full Package required' }, { status: 403 })
    }

    if (!company.posting_enabled) {
      return NextResponse.json({ error: 'Posting is not enabled' }, { status: 400 })
    }

    const scheduled = await fillPostQueue(company, 7)

    return NextResponse.json({ 
      success: true,
      postsScheduled: scheduled,
    })
  } catch (error) {
    console.error('Generate posts error:', error)
    return NextResponse.json({ error: 'Failed to generate posts' }, { status: 500 })
  }
}
```

---

## STEP 10: SCHEDULED POSTS ADMIN PAGE

**File: `src/app/admin/posts/page.tsx`**

```typescript
import { createClient } from '@/lib/supabase/server'
import { getCompanyForUser } from '@/lib/supabase/queries'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { hasFeature } from '@/lib/features'
import Link from 'next/link'
import PostsList from '@/components/admin/PostsList'
import { Lock, Calendar, Zap } from 'lucide-react'

export default async function PostsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')
  
  const company = await getCompanyForUser(user.email!)
  if (!company) redirect('/login')

  const canViewPosts = hasFeature(company.tier, 'view_scheduled_posts')

  if (!canViewPosts) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Upgrade to Full Package</h1>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          Automated social media posting is available on the Full Package plan. 
          We'll post to Instagram, Facebook, and Google 5x per week - automatically.
        </p>
        <Link
          href="/admin/billing"
          className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600"
        >
          Upgrade to Full Package
        </Link>
      </div>
    )
  }

  // Get scheduled posts
  const admin = createAdminClient()
  const { data: posts } = await admin
    .from('scheduled_posts')
    .select(`
      *,
      project:projects(title)
    `)
    .eq('company_id', company.id)
    .order('scheduled_for', { ascending: true })
    .limit(50)

  // Count by status
  const pendingCount = posts?.filter(p => p.status === 'pending').length || 0
  const postedCount = posts?.filter(p => p.status === 'posted').length || 0
  const failedCount = posts?.filter(p => p.status === 'failed').length || 0

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Scheduled Posts
          </h1>
          <p className="text-gray-600 mt-1">
            Your upcoming and past social media posts
          </p>
        </div>
        
        {company.posting_enabled && (
          <GeneratePostsButton />
        )}
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
              <p className="text-sm text-gray-500">Scheduled</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{postedCount}</p>
              <p className="text-sm text-gray-500">Posted</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-red-600">!</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{failedCount}</p>
              <p className="text-sm text-gray-500">Failed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Posting status */}
      {!company.posting_enabled && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8">
          <p className="text-yellow-800">
            <strong>Posting is paused.</strong> Connect your social accounts to enable automatic posting.
          </p>
          <Link 
            href="/admin/social"
            className="text-yellow-600 hover:underline text-sm mt-1 inline-block"
          >
            Connect accounts →
          </Link>
        </div>
      )}

      {/* Posts list */}
      {posts && posts.length > 0 ? (
        <PostsList initialPosts={posts} />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No posts yet</h2>
          <p className="text-gray-600 mb-6">
            Add some projects with photos and we'll start generating posts automatically.
          </p>
          <Link
            href="/admin/projects/new"
            className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600"
          >
            Add a Project
          </Link>
        </div>
      )}
    </div>
  )
}

// Client component for generate button
function GeneratePostsButton() {
  return <GeneratePostsButtonClient />
}
```

---

## STEP 11: GENERATE POSTS BUTTON

**File: `src/components/admin/GeneratePostsButton.tsx`**

```typescript
'use client'

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'

export default function GeneratePostsButtonClient() {
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)

    try {
      const res = await fetch('/api/admin/posts/generate', {
        method: 'POST',
      })

      const data = await res.json()

      if (res.ok) {
        alert(`Generated ${data.postsScheduled} new posts!`)
        window.location.reload()
      } else {
        alert(data.error || 'Failed to generate posts')
      }
    } catch (error) {
      alert('Failed to generate posts')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleGenerate}
      disabled={loading}
      className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50"
    >
      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
      {loading ? 'Generating...' : 'Generate Posts'}
    </button>
  )
}
```

---

## STEP 12: POSTS LIST COMPONENT

**File: `src/components/admin/PostsList.tsx`**

```typescript
'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Calendar, Check, X, AlertCircle, Edit2, Trash2 } from 'lucide-react'

interface Post {
  id: string
  image_url: string
  caption: string
  hashtags: string[]
  scheduled_for: string
  status: string
  posted_at: string | null
  error_message: string | null
  project: { title: string } | null
}

interface PostsListProps {
  initialPosts: Post[]
}

export default function PostsList({ initialPosts }: PostsListProps) {
  const [posts, setPosts] = useState(initialPosts)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editCaption, setEditCaption] = useState('')
  const [editHashtags, setEditHashtags] = useState('')

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this scheduled post?')) return

    try {
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setPosts(posts.map(p => 
          p.id === id ? { ...p, status: 'skipped' } : p
        ))
      }
    } catch (error) {
      alert('Failed to cancel post')
    }
  }

  const startEdit = (post: Post) => {
    setEditingId(post.id)
    setEditCaption(post.caption)
    setEditHashtags(post.hashtags?.join(', ') || '')
  }

  const handleSaveEdit = async () => {
    if (!editingId) return

    try {
      const res = await fetch(`/api/admin/posts/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caption: editCaption,
          hashtags: editHashtags.split(',').map(h => h.trim()).filter(Boolean),
        }),
      })

      if (res.ok) {
        setPosts(posts.map(p => 
          p.id === editingId 
            ? { ...p, caption: editCaption, hashtags: editHashtags.split(',').map(h => h.trim()) }
            : p
        ))
        setEditingId(null)
      }
    } catch (error) {
      alert('Failed to save changes')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
            <Calendar className="w-3 h-3" />
            Scheduled
          </span>
        )
      case 'posted':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
            <Check className="w-3 h-3" />
            Posted
          </span>
        )
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
            <AlertCircle className="w-3 h-3" />
            Failed
          </span>
        )
      case 'skipped':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
            <X className="w-3 h-3" />
            Cancelled
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div
          key={post.id}
          className="bg-white rounded-xl border border-gray-200 p-4"
        >
          <div className="flex gap-4">
            {/* Image */}
            <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={post.image_url}
                alt="Post preview"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  {getStatusBadge(post.status)}
                  <p className="text-sm text-gray-500 mt-1">
                    {post.status === 'posted' && post.posted_at
                      ? `Posted ${format(new Date(post.posted_at), 'MMM d, yyyy h:mm a')}`
                      : `Scheduled for ${format(new Date(post.scheduled_for), 'MMM d, yyyy h:mm a')}`
                    }
                  </p>
                </div>

                {post.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(post)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCancel(post.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Caption */}
              {editingId === post.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editCaption}
                    onChange={(e) => setEditCaption(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <input
                    type="text"
                    value={editHashtags}
                    onChange={(e) => setEditHashtags(e.target.value)}
                    placeholder="hashtag1, hashtag2, hashtag3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveEdit}
                      className="px-3 py-1 bg-orange-500 text-white rounded text-sm font-medium"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {post.caption}
                  </p>
                  {post.hashtags && post.hashtags.length > 0 && (
                    <p className="text-xs text-blue-500 mt-1">
                      {post.hashtags.map(h => `#${h}`).join(' ')}
                    </p>
                  )}
                </>
              )}

              {/* Error message */}
              {post.status === 'failed' && post.error_message && (
                <p className="text-xs text-red-600 mt-2">
                  Error: {post.error_message}
                </p>
              )}

              {/* Project reference */}
              {post.project && (
                <p className="text-xs text-gray-400 mt-2">
                  From: {post.project.title}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
```

---

## STEP 13: ADD DATE-FNS

```bash
npm install date-fns
```

---

## STEP 14: UPDATE ADMIN SIDEBAR (add import for button)

**File: `src/app/admin/posts/page.tsx`** 

Add at the top:
```typescript
import GeneratePostsButtonClient from '@/components/admin/GeneratePostsButton'
```

And update the button component call:
```typescript
{company.posting_enabled && (
  <GeneratePostsButtonClient />
)}
```

---

## STEP 15: TEST IT

1. Update test company to full tier and enable posting:
```sql
UPDATE companies 
SET tier = 'full', posting_enabled = true 
WHERE slug = 'test-builder';
```

2. Make sure you have some projects with images

3. Run dev server:
```bash
npm run dev
```

4. Go to `http://localhost:3000/admin/posts`
5. Click "Generate Posts"
6. Should see scheduled posts appear with AI-generated captions
7. Try editing a caption
8. Try cancelling a post

9. Test cron manually:
```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" http://localhost:3000/api/cron/schedule-posts
curl -H "Authorization: Bearer YOUR_CRON_SECRET" http://localhost:3000/api/cron/execute-posts
```

---

## EXIT CRITERIA

- ✅ Claude API generating captions
- ✅ Post scheduler creating posts for the week ahead
- ✅ Scheduled posts page showing queue
- ✅ Edit caption working
- ✅ Cancel post working
- ✅ Status badges (pending/posted/failed/cancelled)
- ✅ Generate posts button working
- ✅ Cron endpoints created
- ✅ Feature gated to Full Package
- ✅ `npm run build` passes

---

## POSTING FLOW SUMMARY

```
┌─────────────────────────────────────────────────────────────┐
│                     DAILY (6am UTC)                         │
│  Cron: /api/cron/schedule-posts                            │
│  - For each Full Package company                           │
│  - Find unused project images                              │
│  - Generate AI caption via Claude                          │
│  - Schedule for next available slot                        │
│  - Fill queue to 7 posts ahead                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  3x DAILY (8am, 12pm, 6pm)                 │
│  Cron: /api/cron/execute-posts                             │
│  - Find posts due for execution                            │
│  - Post to Instagram/Facebook/Google (ZIP-09)              │
│  - Update status to posted/failed                          │
└─────────────────────────────────────────────────────────────┘
```

---

## NEXT: ZIP-09

ZIP-09 will add:
- Instagram OAuth & posting
- Facebook OAuth & posting
- Google Business Profile posting
- Social account management page

---

**Auto-posting engine ready. Captions generated, posts queued.**
