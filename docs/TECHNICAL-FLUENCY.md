# Mybuildr - Technical Fluency Document

> **Purpose**: Transform every build into a learning experience
> **Updated by**: Claude Code (continuously during development)
> **Goal**: Founder can explain every technical decision with confidence

---

## How This Document Works

This document captures how your system works in plain language. It's designed to give you confidence explaining your product to investors, partners, or technical hires—without needing to memorize developer jargon.

By the end of this document, you'll understand exactly what you've built and why every decision was made.

---

## The Big Picture

**Mybuildr is a construction website builder with automated social media posting.**

Think of it like a restaurant with three stations working together:

1. **The Front of House** (Marketing Site): Where customers discover you and see what's possible
2. **The Kitchen** (Admin Dashboard): Where builders upload photos and manage their content
3. **The Delivery Service** (Automated Posting System): Takes those photos and delivers them to Instagram, Facebook, and Google Business on autopilot

Here's what makes it special: Construction companies are terrible at social media. They take beautiful photos of their work, but posting consistently feels like a chore. Mybuildr solves this by giving them a simple admin panel where they drag-and-drop photos. The system then:
- Instantly updates their professional website
- Writes AI-generated captions that sound natural (not robotic)
- Schedules posts across multiple platforms at the best times
- Never runs out of content because every new project photo feeds the queue

The business model is simple: £99/month for just a website, £199/month for the full package with automated posting. Builders pay monthly, no contracts, and can manage everything from their phone.

---

## System Architecture

### The Analogy: A Restaurant Kitchen

Your system works like a well-run restaurant kitchen:

**The Dining Room (Marketing Site)**:
- Open to the public (`/(marketing)` routes)
- Beautiful presentation (9 different template styles)
- Shows off what you can do (hero, pricing, testimonials)

**The Prep Station (Media Library)**:
- Where ingredients (photos/videos) are stored and organized
- Each item is tracked: "Has this been used? How many times?"
- Fresh ingredients (new uploads) get priority
- Old ingredients (overused photos) get rotated out
- Special ingredients (reviews) are mixed in periodically

**The Order Tickets (Scheduled Posts)**:
- Each ticket says: "Post THIS photo to THESE platforms at THIS time with THIS caption"
- Tickets are lined up in order (the queue)
- The system works through them one by one
- Failed orders can be retried or deleted

**The Head Chef (Scheduler)**:
- Runs every night at 2am UTC
- Looks at how many posts you want per week
- Picks fresh photos from the media library
- Writes captions using AI
- Creates new order tickets for the week
- Occasionally adds a review post (every N posts based on `review_post_frequency`)

**The Line Cooks (Posting Service)**:
- Check every hour: "Any posts ready to go out?"
- If a post is scheduled for now, they execute it
- Post to Instagram, Facebook, Google Business
- Mark the ticket as "posted" or "failed"
- Retry failed posts with exponential backoff

**The Inventory System (Database)**:
- Tracks everything: companies, projects, photos, posts, reviews
- Multi-tenant: Each company only sees their own data
- Row Level Security (RLS) is like having locked storage—you can only access what's yours

### How Data Flows (A Typical User Action)

Let's say a builder uploads 5 photos of a kitchen renovation:

1. **Upload** → Photos hit your Next.js API route `/api/admin/upload/presign`
2. **Presigned URL** → Cloudflare R2 generates secure upload URLs
3. **Direct Upload** → Browser uploads files directly to R2 (bypasses your server)
4. **Project Creation** → Builder creates a project with those R2 URLs
5. **Database Trigger** → PostgreSQL trigger automatically adds each photo to the media_library table
6. **Immediate Effect** → The website updates instantly (photos appear in the gallery at `/sites/[slug]`)
7. **Nightly Scheduler** → At 2am UTC, the system checks: "How many posts do we need this week?"
8. **AI Captions** → Anthropic's Claude writes natural captions for each photo
9. **Queue Creation** → Scheduled posts are created with specific times (e.g., 8am, 12pm, 6pm)
10. **Hourly Execution** → Every hour, the system checks: "Any posts ready to go?" and publishes them
11. **Social Media** → Photos appear on Instagram/Facebook/Google with AI captions
12. **Tracking** → Media library updates: "This photo was posted 1 time on Jan 25"

### The Cast of Characters (Key Files)

| File | Role | Plain English |
|------|------|---------------|
| [src/app/admin/page.tsx](../src/app/admin/page.tsx) | Admin Dashboard | The homepage builders see—shows health check, upload button, stats |
| [src/lib/posting/scheduler.ts](../src/lib/posting/scheduler.ts) | The Head Chef | Creates the week's worth of scheduled posts every night |
| [src/lib/posting/poster.ts](../src/lib/posting/poster.ts) | The Line Cook | Actually publishes posts to social media platforms |
| [src/lib/supabase/queries.ts](../src/lib/supabase/queries.ts) | Database Queries | All the functions that fetch data from the database |
| [src/app/sites/[slug]/page.tsx](../src/app/sites/[slug]/page.tsx) | The Public Website | What customers see when they visit a builder's site |
| [src/app/api/cron/schedule-posts/route.ts](../src/app/api/cron/schedule-posts/route.ts) | Nightly Scheduler Cron | Vercel runs this every night at 2am UTC |
| [src/app/api/cron/execute-posts/route.ts](../src/app/api/cron/execute-posts/route.ts) | Hourly Poster Cron | Vercel runs this every hour to publish pending posts |
| [src/lib/graphics/review-graphic.ts](../src/lib/graphics/review-graphic.ts) | Review Graphics Generator | Creates branded images from 5-star reviews |
| [src/lib/scrapers/checkatrade.ts](../src/lib/scrapers/checkatrade.ts) | Review Scraper | Pulls reviews from Checkatrade automatically |
| [migrations/*.sql](../migrations) | Database Changes | The history of all database structure changes |

---

## Key Technical Decisions

### Jan 18, 2026 — Next.js 15 with App Router

**What we chose**: Next.js 15 (latest) with App Router, not Pages Router

**Why this over alternatives**:
- App Router is the future of Next.js (Pages Router is legacy)
- Server Components by default = faster page loads
- Built-in API routes = no separate backend needed
- Vercel deployment is one-click and handles cron jobs
- TypeScript gives us autocomplete and catches errors early

**Tradeoffs we accepted**:
- App Router has a learning curve (different from Pages Router)
- Some libraries haven't fully adapted yet
- Server vs Client Components can be confusing at first

**When we might revisit this**:
- If Next.js changes direction (unlikely)
- If we need more control over server infrastructure (e.g., WebSockets)

---

### Jan 19, 2026 — Supabase for Database & Auth

**What we chose**: Supabase (managed PostgreSQL + Auth + RLS)

**Why this over alternatives**:
- Row Level Security (RLS) is built-in, not bolted on
- Authentication is handled—no need to build login systems
- Real-time subscriptions available if needed later
- PostgreSQL is battle-tested and scalable
- Generous free tier, predictable pricing

**Alternatives considered**:
- MongoDB: NoSQL is overkill, relational data fits our use case better
- Firebase: More expensive, vendor lock-in concerns
- Custom database: Way too much work for an MVP

**Tradeoffs we accepted**:
- Slightly slower queries than self-hosted (but negligible)
- Some advanced Postgres features require workarounds
- Dashboard UI can be clunky for complex operations

**When we might revisit this**:
- If we need complex joins that RLS makes difficult
- If Supabase pricing becomes unsustainable at scale

---

### Jan 19, 2026 — Cloudflare R2 for Image Storage

**What we chose**: Cloudflare R2 instead of AWS S3

**Why this over alternatives**:
- Zero egress fees (S3 charges every time someone views an image)
- S3-compatible API (easy migration if needed)
- Cheaper storage costs
- Fast global CDN included
- Presigned URLs for direct browser uploads

**Tradeoffs we accepted**:
- Less mature than S3 (fewer features)
- Smaller community/fewer tutorials
- Need to manage our own image resizing (no built-in transforms like Cloudinary)

**When we might revisit this**:
- If we need advanced image processing (might add Cloudinary)
- If R2 has outages (hasn't happened yet)

---

### Jan 19, 2026 — Anthropic Claude for AI Captions

**What we chose**: Anthropic Claude (Sonnet) for generating social media captions

**Why this over alternatives**:
- Best at natural, human-sounding writing (better than GPT-4 for captions)
- Follows instructions well (respects tone, hashtag preferences)
- Fast response times
- Good pricing ($3 per million tokens)
- Can customize per-platform (Instagram vs Facebook vs Google)

**Alternatives considered**:
- OpenAI GPT-4: More expensive, sometimes too formal
- GPT-3.5: Cheaper but quality suffers
- No AI: Manual captions are too much work for builders

**Tradeoffs we accepted**:
- Monthly API costs (scales with usage)
- Need to handle rate limits
- Captions still need occasional human review

**When we might revisit this**:
- If a cheaper model with equal quality emerges
- If we want to fine-tune our own model (expensive, only at scale)

---

### Jan 19, 2026 — Multi-Tenant with RLS, Not Separate Databases

**What we chose**: Single database with Row Level Security for all companies

**Why this over alternatives**:
- Simpler infrastructure (one database to manage)
- Easier backups and migrations
- Lower costs (no per-tenant overhead)
- RLS enforces security at the database level (can't accidentally leak data)

**Alternatives considered**:
- Separate database per company: Too expensive, too complex
- Application-level filtering: Risky (one bug = data leak)

**Tradeoffs we accepted**:
- All companies share database resources (noisy neighbor problem)
- RLS policies can be complex to debug
- Need to be extra careful with queries (always filter by company_id)

**When we might revisit this**:
- If a single large client needs guaranteed performance (separate DB)
- If RLS becomes a performance bottleneck (hasn't yet)

---

### Jan 25, 2026 — Database Trigger for Media Library Sync

**What we chose**: PostgreSQL trigger to auto-sync project images to media_library

**Why this over alternatives**:
- Impossible to get out of sync (trigger runs automatically)
- No application code to remember to call
- Faster than API round-trips
- Single source of truth (database enforces consistency)

**Alternatives considered**:
- Manual sync in API endpoints: Error-prone, easy to forget
- Application hooks: Still requires discipline to call everywhere

**Tradeoffs we accepted**:
- Triggers are harder to debug than application code
- Need to be careful with trigger logic (infinite loops possible)
- Database migrations become more important

**When we might revisit this**:
- If trigger performance becomes a bottleneck (hasn't)
- If we need more complex sync logic that doesn't fit in SQL

---

## The Error Diary

### Jan 25, 2026 — Carousel Posts Scheduling Multiple Times

**What broke**:
When a project had multiple images, the scheduler was creating a separate post for EACH image in the same project on the SAME day. This meant a 5-image project would result in 5 posts scheduled for the same time.

**What I initially assumed**:
The scheduler was correctly treating carousel posts as a single unit. I thought the issue was elsewhere (maybe in the posting logic).

**Actual root cause**:
The scheduler was iterating through ALL available media items and creating posts without checking if it already created a carousel post from the same project. Each image was treated as independent, not as part of a group.

**The fix**:
Added logic in [scheduler.ts](../src/lib/posting/scheduler.ts:1-280) to skip creating additional posts if a carousel post from the same project was already scheduled for that day. Now multi-image projects = 1 carousel post, not N posts.

**The lesson**:
When scheduling content with grouped items (carousels), always check if you've already scheduled the group—don't blindly iterate through every item.

**Technical concept unlocked**:
**Idempotency in scheduling systems** — Don't create duplicate work for the same logical unit.

---

### Jan 24, 2026 — Project Images Not Appearing in Media Library

**What broke**:
When users uploaded photos to a project, the photos showed on the project page but didn't appear in the media library. This meant the automated posting system couldn't find them.

**What I initially assumed**:
I thought there was an API endpoint that wasn't being called to sync the images. I was looking for a JavaScript bug.

**Actual root cause**:
There was no automatic sync mechanism at all. The media library and projects were completely separate. You had to manually add the same images to both places.

**The fix**:
Created a PostgreSQL database trigger in [migrations/populate_media_library.sql](../migrations/populate_media_library.sql:1-60) that automatically runs whenever a project is created, updated, or deleted. The trigger syncs all images from the project's `images` array into the `media_library` table. Now it's impossible for them to be out of sync.

**The lesson**:
Use database triggers for data that must stay synchronized. Don't rely on application code to remember to sync things—it will eventually fail.

**Technical concept unlocked**:
**Database triggers** — Code that runs automatically inside the database when certain events happen (INSERT, UPDATE, DELETE).

---

### Jan 20, 2026 — Missing Video Support in Media Library

**What broke**:
Users wanted to upload videos for their projects, but the media_library table only had an `image_url` field. We couldn't distinguish between images and videos.

**What I initially assumed**:
We could just put video URLs in the `image_url` field and detect the file extension. Simple hack.

**Actual root cause**:
Different platforms handle videos differently (Instagram Reels, Facebook videos, Google posts). We needed to know upfront if something was a video to route it correctly.

**The fix**:
Added `media_type` enum field to both `media_library` and `scheduled_posts` tables in [migrations/add_media_type.sql](../migrations/add_media_type.sql:1-28). Now we can explicitly track 'image' vs 'video' and handle them differently in the posting logic.

**The lesson**:
Don't hack type detection when you can make it explicit. Database schema should reflect business logic clearly.

**Technical concept unlocked**:
**Enum types in databases** — Constrain fields to specific values for data integrity.

---

## Concepts Explained

### Row Level Security (RLS)

Think of RLS like having separate locked filing cabinets for each company in a shared office.

Without RLS, you'd have to write code in every single function that says: "Hey, remember to only show this company's data!" If you forget even once, you accidentally show Company A's data to Company B. That's a disaster.

With RLS, the database itself enforces the rules. When Company A's user makes a request, the database automatically adds a filter: "WHERE company_id = 'company-a-id'". You literally cannot see other companies' data, even if you try.

Here's a real example from our system:

```sql
CREATE POLICY "Companies can only see own projects"
ON projects
FOR SELECT
USING (company_id = (SELECT id FROM companies WHERE email = auth.email()));
```

This says: "When someone tries to read from the projects table, only show rows where the company_id matches the logged-in user's company." The database enforces this automatically. Your code doesn't need to remember.

**Why this matters**: Security at the database level is the last line of defense. Even if your application code has a bug, RLS prevents data leaks.

---

### Multi-Tenant Architecture

Multi-tenancy means multiple customers (companies) share the same application and database, but their data is isolated.

Imagine an apartment building: Everyone lives in the same building (shared infrastructure), but each apartment is private (data isolation). You don't see your neighbor's stuff, even though you're in the same building.

In our system:
- **Single codebase**: One Next.js app serves all companies
- **Single database**: One Supabase database with all companies' data
- **Isolation via RLS**: Row Level Security ensures Company A can't see Company B's data
- **Efficiency**: We don't need separate servers/databases for each customer

**The alternative** (single-tenant) would be like giving each company their own private building. That's expensive and hard to maintain.

**Why this matters for investors**: Multi-tenancy = better margins. We can serve 1,000 companies on the same infrastructure we use for 10 companies.

---

### Cron Jobs (Scheduled Background Tasks)

A cron job is a task that runs automatically at specific times, like a robot alarm clock.

We have two cron jobs running on Vercel:

**1. Schedule Posts (Daily at 2am UTC)**
- Wakes up every night
- Checks each company's posting settings ("How many posts per week?")
- Looks at available photos in media library
- Generates AI captions
- Creates scheduled_posts for the upcoming week
- Occasionally inserts review posts (every N posts based on `review_post_frequency`)
- Goes back to sleep

**2. Execute Posts (Hourly)**
- Wakes up every hour
- Checks: "Are any posts scheduled for right now?"
- If yes: publishes them to Instagram/Facebook/Google
- Marks them as "posted" or "failed"
- Retries failed posts with exponential backoff
- Goes back to sleep

**Why separate jobs?**:
- Scheduling is slow (AI captions take time) → Do it once per day
- Posting is fast (API calls) → Check every hour for precision

**Why this matters**: The system runs on autopilot. Builders upload photos, and posts appear on social media without them lifting a finger.

---

### AI Caption Generation

We use Anthropic's Claude to write social media captions. Here's how it works:

1. **Input**: We give Claude:
   - The image URL (or video URL)
   - Project title and description
   - Company name and trade type
   - Caption guidelines (e.g., "Keep it friendly, mention location")
   - Hashtag preferences
   - Sign-off text per platform (Instagram vs Facebook vs Google)

2. **Prompt**: We ask Claude to write a caption that sounds natural, not robotic. Different tone for each platform:
   - Instagram: Casual, emoji-friendly, hashtag-heavy
   - Facebook: Slightly more formal, community-focused
   - Google Business: Professional, service-oriented

3. **Output**: Claude returns a caption like:
   > "Just wrapped up this stunning kitchen extension in Manchester! Modern white cabinets, quartz worktops, and underfloor heating throughout. Love how it's completely transformed the space. 🏡✨ #KitchenExtension #Manchester #HomeImprovement"

4. **Customization**: Builders can set their own:
   - Caption guidelines (tone, must-mention items)
   - Hashtag preferences (custom tags per company)
   - Sign-offs per platform (e.g., "📞 Call us: 0800 123 456")

**Why AI vs Templates**: Templates ("Check out this project! 😊") get repetitive and boring. AI captions feel unique every time while still following the builder's style.

**Cost**: About $0.003 per caption (less than a penny). For 100 posts/month, that's 30p in AI costs.

---

### Database Triggers

A database trigger is a piece of code that runs automatically inside the database when certain events happen.

Think of it like a security camera that turns on when someone walks through a door. You don't have to remember to turn it on—it just happens.

We use a trigger to sync project images to the media library:

```sql
CREATE TRIGGER sync_project_images
  AFTER INSERT OR UPDATE OR DELETE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION sync_project_images_to_media_library();
```

This means:
- **After** you add/update/delete a project
- **Automatically** run a function that syncs images to media_library
- You don't have to remember to do it in your code

**Why triggers vs application code**: Triggers are faster (no network round-trip) and more reliable (can't be skipped by buggy code).

---

### OAuth (Social Media Connections)

OAuth is how users connect their Instagram, Facebook, and Google Business accounts without giving you their passwords.

Think of it like a hotel key card: The hotel gives you a card that only opens your room (not the master key). If you lose it, they cancel that card without changing the room's lock.

**Our OAuth flow**:

1. User clicks "Connect Instagram" in [/admin/social](../src/app/admin/social)
2. We redirect them to Instagram's login page
3. Instagram asks: "Do you want to give Mybuildr permission to post on your behalf?"
4. User says yes
5. Instagram sends us an **access token** (the key card)
6. We store the token in the `social_tokens` table
7. When posting, we use that token to prove "this user gave us permission"

**Refresh tokens**: Access tokens expire (usually after 60 days). Refresh tokens let us get a new access token without asking the user to log in again.

**Why this matters**: Users never give us their passwords. If they revoke access, we lose the token but they keep their account.

---

### Presigned URLs (Secure File Uploads)

Presigned URLs let users upload files directly to Cloudflare R2 without the files passing through your server.

**Old way** (insecure and slow):
1. User uploads photo to your Next.js server
2. Your server uploads photo to R2
3. Two uploads = slow, expensive bandwidth

**Presigned URL way** (fast and secure):
1. User requests upload permission from [/api/admin/upload/presign](../src/app/api/admin/upload/presign.ts)
2. Your server generates a **presigned URL** from R2 (expires in 10 minutes)
3. Browser uploads directly to R2 using that URL
4. Your server stores the final R2 URL in the database

**Why this matters**: Faster uploads, cheaper bandwidth costs, and your server doesn't need to handle large files.

---

## Investor-Ready Explanations

### "How does the multi-tenant architecture work?"

We use a single shared database with Row Level Security (RLS). Think of it like an apartment building—everyone's in the same structure, but you can only access your own apartment.

Each company has a unique `company_id` that's attached to all their data (projects, photos, posts). The database automatically filters everything by `company_id`, so Company A literally cannot see Company B's data—even if our application code had a bug.

This architecture lets us serve hundreds of companies on the same infrastructure, which keeps costs low and improves margins.

---

### "What happens if you get 10x the users tomorrow?"

We're designed to scale horizontally, meaning we can handle more traffic by adding more servers (not upgrading one big server).

**Current bottlenecks and solutions**:

1. **Database connections**: Supabase handles connection pooling. We're currently using ~5% of our limit. At 10x scale, we'd upgrade to Supabase Pro (£25/mo).

2. **Image storage**: Cloudflare R2 has no egress fees and scales automatically. No action needed.

3. **AI captions**: Anthropic's API scales with usage. At 10x, we'd pay ~£300/mo for captions (still profitable).

4. **Cron jobs**: Vercel cron jobs run on serverless functions. They scale automatically with load.

5. **API rate limits**: Instagram/Facebook have rate limits. We'd implement queuing (e.g., BullMQ) to spread requests over time.

**Cost at 10x scale**: ~£600/mo infrastructure (vs ~£60/mo now). Still profitable at our pricing (£99-199/mo per customer).

---

### "How do you handle security / user data?"

Security is built into the database, not just the application:

**Row Level Security (RLS)**: Every table has policies that prevent companies from seeing each other's data. This is enforced at the database level, so even a buggy API route can't leak data.

**Authentication**: We use Supabase Auth (built on top of proven open-source libraries). Passwords are hashed with bcrypt, sessions use JWT tokens, and we support password resets.

**Secrets management**: All API keys (Instagram, Facebook, Anthropic, R2) are stored in Vercel environment variables—never in code. Social tokens are encrypted at rest in the database.

**HTTPS**: All traffic is encrypted. Vercel provides SSL certificates automatically.

**Data retention**: Companies can delete their account anytime. We cascade-delete all their data (projects, photos, posts). GDPR-compliant.

---

### "What's your tech stack and why?"

We use modern, battle-tested tools that let us move fast without sacrificing quality:

**Next.js 15**: React framework with built-in API routes, server-side rendering, and one-click Vercel deployment. It's the industry standard for full-stack JavaScript apps.

**Supabase**: Managed PostgreSQL with built-in auth and Row Level Security. We don't have to build a login system or worry about SQL injection.

**Cloudflare R2**: Image storage with zero egress fees (unlike AWS S3, which charges every time someone views a photo). Massive cost savings.

**Anthropic Claude**: Best-in-class AI for writing natural-sounding captions. Better than GPT-4 for creative writing tasks.

**Vercel**: Serverless deployment with automatic scaling, built-in cron jobs, and edge caching. No DevOps needed.

This stack lets one developer do the work of a full team. Everything is managed services—no servers to maintain.

---

### "How long would it take another developer to understand this codebase?"

**For a Next.js developer**: 1-2 days to understand the core flow, 1 week to be fully productive.

**For a general full-stack developer**: 2-5 days (need to learn Next.js App Router specifics).

**Why it's maintainable**:
- Standard Next.js conventions (app router, API routes)
- Clear file structure (admin routes, marketing routes, API routes)
- Type-safe with TypeScript (autocomplete prevents bugs)
- All external APIs are wrapped in helper functions (easy to swap)
- Database schema is well-documented in this file

**Documentation**:
- This TECHNICAL-FLUENCY.md explains the "why" behind decisions
- IMPLEMENTATION-LOG.md is the "what" (current state)
- Code comments explain the "how" (complex logic only)

---

## If I Had To Rebuild This

**What worked really well**:
1. **Row Level Security from day one**: Never had to worry about data leaks. Worth the upfront complexity.
2. **Database triggers for syncing**: Project images auto-sync to media library. Never get out of sync.
3. **Separation of scheduling and posting**: Slow work (AI captions) happens nightly. Fast work (posting) happens hourly.
4. **TypeScript everywhere**: Caught so many bugs before they hit production.
5. **Feature flags based on tier**: Easy to gate features behind paid plans (hasFeature helper).
6. **Presigned URLs for uploads**: Users upload directly to R2, not through our server. Faster and cheaper.

**What I'd do differently**:
1. **Start with better media organization sooner**: We added `times_posted` tracking later. Wish we'd done it from day one.
2. **Use a queue for social posting from the start**: We'll eventually need BullMQ or similar. Instagram's rate limits will force this.
3. **Add better error tracking**: We have basic error logging, but something like Sentry would catch issues faster.
4. **Design the media library schema more carefully**: We've had to migrate it twice already (adding media_type, adding source_project_id).
5. **Build review posting frequency from the start**: Added `review_post_frequency` later—should've been in initial schema.

**Patterns worth reusing**:
- Multi-tenant with RLS (perfect for SaaS)
- Cron jobs for background work
- AI for content generation (huge value-add for low effort)
- Separate admin and public routes (clean separation of concerns)
- Database triggers for maintaining consistency

---

## Quick Reference

### This App In One Sentence

"Mybuildr gives construction companies professional websites and auto-posts their project photos to social media with AI-generated captions—so they can focus on building, not marketing."

---

### The Three Most Important Files

1. **[src/lib/posting/scheduler.ts](../src/lib/posting/scheduler.ts)** — because this is the brain that generates the week's worth of posts every night
2. **[src/lib/supabase/queries.ts](../src/lib/supabase/queries.ts)** — because every database interaction flows through here (single source of truth)
3. **[src/app/sites/[slug]/page.tsx](../src/app/sites/[slug]/page.tsx)** — because this renders the public-facing builder websites (the product customers see)

---

### The Most Clever Thing About This Build

**The database trigger that syncs project images to media library.**

Most systems would require the developer to remember to sync data in two places. We made it impossible to forget by using a database trigger. Add/update/delete a project? The media library updates automatically. Zero bugs from forgetting to sync.

---

### The Biggest Gotcha For Future Maintenance

**Social media API rate limits.**

Right now, we're below Instagram and Facebook's rate limits. But if we 10x our customers, we'll hit them. The fix is to implement a queuing system (BullMQ) that spreads posts over time, but that's a big architectural change.

Keep an eye on error messages like "Rate limit exceeded" in the cron logs. That's your early warning sign.

---

**Last Updated**: Jan 26, 2026
**Next Review**: When major features added or before investor meetings
