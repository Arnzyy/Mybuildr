# ADMIN PANEL IMPROVEMENTS - Comprehensive Build Specification

> **Project**: ByTrade/MyBuildr Admin Dashboard
> **Goal**: Make the admin panel idiot-proof, mobile-first, and delightful for UK tradespeople
> **Estimated Time**: 4-6 hours
> **Status**: Ready to Build

---

## RULES FOR THIS BUILD

1. **MOBILE-FIRST**: Every component must work perfectly on mobile before desktop
2. **IDIOT-PROOF**: If a builder with zero tech skills can't figure it out in 5 seconds, it's too complex
3. **NO JARGON**: Use plain English. "Upload Photos" not "Media Library". "Your Posts" not "Scheduled Posts"
4. **BIG TOUCH TARGETS**: Minimum 44px height for all interactive elements
5. **INSTANT FEEDBACK**: Every action shows loading state → success/error
6. **ASK, DON'T ASSUME**: If unclear about existing code structure, explore first

---

## ENTRY CRITERIA

Before starting, confirm:

- ✅ Access to the codebase (Next.js app)
- ✅ Can run `npm run dev` locally
- ✅ Understand the current file structure
- ✅ Have access to Supabase schema
- ✅ Canvas package installed for image generation

---

## CURRENT STATE ANALYSIS

### Current Navigation (8 items - TOO MANY):
```
Dashboard | Settings | Projects | Media Library | Scheduled Posts | Social Accounts | Reviews | Billing
```

### Problems Identified:
1. Navigation has too many items (8) - confusing
2. Projects vs Media Library distinction unclear to users
3. Review graphics broken (Canvas font issue - renders garbled text)
4. Settings page too long with irrelevant options (template selection)
5. No hero image upload capability
6. No "health check" status on dashboard
7. Error messages are technical jargon
8. No clear indication of "what do I need to do next?"

---

## TARGET STATE

### New Navigation (5 items):
```
Dashboard | My Photos | Posts | Socials | Settings
```

### Key Improvements:
1. Simplified navigation (5 items max)
2. Merged Projects + Media Library → "My Photos"
3. Fixed review graphic generation
4. Streamlined Settings with hero image upload
5. Dashboard shows health check status
6. Human-friendly error messages throughout
7. Clear "next action" prompts

---

## IMPLEMENTATION SECTIONS

---

### SECTION 1: NAVIGATION RESTRUCTURE

#### Purpose
Simplify navigation from 8 items to 5 items. Make it instantly clear where everything is.

#### Changes Required

**OLD NAVIGATION:**
```
Dashboard | Settings | Projects | Media Library | Scheduled Posts | Social Accounts | Reviews | Billing
```

**NEW NAVIGATION:**
```
Dashboard | My Photos | Posts | Socials | Settings
```

#### Mapping:
| Old | New Location |
|-----|--------------|
| Dashboard | Dashboard (unchanged) |
| Settings | Settings |
| Projects | My Photos (merged) |
| Media Library | My Photos (merged) |
| Scheduled Posts | Posts |
| Social Accounts | Socials |
| Reviews | Posts (as a tab) |
| Billing | Settings (as a section) |

#### Files to Update:
```
/components/admin/Navigation.tsx (or similar)
/components/admin/Sidebar.tsx (if exists)
/components/admin/MobileNav.tsx (if exists)
/app/admin/layout.tsx
```

#### Implementation:

```typescript
// Navigation items - NEW STRUCTURE
const navItems = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard, // or your icon component
  },
  {
    name: 'My Photos',
    href: '/admin/photos',
    icon: Camera,
  },
  {
    name: 'Posts',
    href: '/admin/posts',
    icon: Calendar,
  },
  {
    name: 'Socials',
    href: '/admin/social',
    icon: Share2,
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
];
```

#### Mobile Navigation Specifics:
- Bottom tab bar on mobile (not hamburger menu)
- Icons with labels below
- Active state clearly visible (filled icon + brand color)
- Minimum 44px touch targets

---

### SECTION 2: DASHBOARD IMPROVEMENTS

#### Purpose
Make dashboard show instant status so users know if they need to do anything.

#### Current Dashboard Components:
- Company name header
- "Upload Photos" CTA card
- Stats (Projects, Photos)
- "View Your Website" button
- Auto-posting status
- "How it works" section

#### New Dashboard Structure:

```
┌─────────────────────────────────────────┐
│  [Company Name]                    ☰    │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐    │
│  │  HEALTH CHECK BANNER            │    │
│  │  ✅ All good! 8 photos queued   │    │
│  │     Next post: Tomorrow 8am     │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  📷 UPLOAD PHOTOS               │    │
│  │  Add project photos to your     │    │
│  │  website & social media         │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌──────────┐  ┌──────────┐             │
│  │ 12       │  │ 8        │             │
│  │ Photos   │  │ Queued   │             │
│  └──────────┘  └──────────┘             │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  👁 View Your Website           │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  Recent Activity                │    │
│  │  ✓ Posted to Instagram 2h ago   │    │
│  │  ✓ Posted to Facebook 2h ago    │    │
│  │  ⏳ Scheduled: Tomorrow 8am     │    │
│  └─────────────────────────────────┘    │
│                                         │
│  [How it works - collapsible]           │
└─────────────────────────────────────────┘
```

#### Health Check Banner Logic:

```typescript
// Health check status calculation
function getHealthStatus(business: Business) {
  const unusedPhotos = business.photos.filter(p => !p.used_in_post).length;
  const nextPost = business.scheduled_posts.find(p => p.status === 'scheduled');
  const connectedSocials = business.social_accounts.filter(s => s.connected).length;
  
  // Critical issues (red banner)
  if (connectedSocials === 0) {
    return {
      status: 'critical',
      color: 'red',
      icon: '🔴',
      title: 'Connect your socials',
      message: 'Connect Instagram or Facebook to start posting',
      action: { label: 'Connect Now', href: '/admin/social' }
    };
  }
  
  // Warning issues (amber banner)
  if (unusedPhotos < 3) {
    return {
      status: 'warning', 
      color: 'amber',
      icon: '⚠️',
      title: 'Running low on photos',
      message: `Only ${unusedPhotos} photos left. Upload more to keep posting.`,
      action: { label: 'Upload Photos', href: '/admin/photos' }
    };
  }
  
  // All good (green banner)
  return {
    status: 'good',
    color: 'green', 
    icon: '✅',
    title: 'All good!',
    message: `${unusedPhotos} photos queued. Next post: ${formatDate(nextPost?.scheduled_for)}`,
    action: null
  };
}
```

#### Health Check Banner Component:

```typescript
// components/admin/HealthCheckBanner.tsx

interface HealthCheckBannerProps {
  status: 'good' | 'warning' | 'critical';
  icon: string;
  title: string;
  message: string;
  action?: {
    label: string;
    href: string;
  };
}

export function HealthCheckBanner({ status, icon, title, message, action }: HealthCheckBannerProps) {
  const colors = {
    good: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    critical: 'bg-red-50 border-red-200 text-red-800',
  };
  
  return (
    <div className={`rounded-lg border p-4 ${colors[status]}`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1">
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm opacity-90">{message}</p>
        </div>
        {action && (
          <Link 
            href={action.href}
            className="px-4 py-2 bg-white rounded-lg text-sm font-medium shadow-sm"
          >
            {action.label}
          </Link>
        )}
      </div>
    </div>
  );
}
```

#### Recent Activity Component:

```typescript
// components/admin/RecentActivity.tsx

export function RecentActivity({ posts }: { posts: Post[] }) {
  const recentPosts = posts.slice(0, 5);
  
  return (
    <div className="bg-white rounded-lg border p-4">
      <h3 className="font-semibold mb-3">Recent Activity</h3>
      <div className="space-y-3">
        {recentPosts.map(post => (
          <div key={post.id} className="flex items-center gap-3 text-sm">
            {post.status === 'posted' && <span className="text-green-500">✓</span>}
            {post.status === 'scheduled' && <span className="text-blue-500">⏳</span>}
            {post.status === 'failed' && <span className="text-red-500">✗</span>}
            <span className="flex-1">
              {post.status === 'posted' && `Posted to ${post.platform}`}
              {post.status === 'scheduled' && `Scheduled for ${formatDate(post.scheduled_for)}`}
              {post.status === 'failed' && `Failed: ${getHumanError(post.error)}`}
            </span>
            <span className="text-gray-400">{timeAgo(post.updated_at)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### "How It Works" - Make Collapsible After First Visit:

```typescript
// Store in localStorage if user has seen onboarding
const [showOnboarding, setShowOnboarding] = useState(() => {
  if (typeof window === 'undefined') return true;
  return !localStorage.getItem('bytrade_onboarding_seen');
});

const dismissOnboarding = () => {
  localStorage.setItem('bytrade_onboarding_seen', 'true');
  setShowOnboarding(false);
};

// Render as collapsible accordion for returning users
// Or full display for first-time users
```

---

### SECTION 3: MY PHOTOS PAGE (Merged Projects + Media Library)

#### Purpose
Merge Projects and Media Library into one unified "My Photos" page with clear upload flow.

#### User Mental Model:
- "I want to upload photos"
- "I want to see my photos"
- "I want to organize photos into projects (optional)"

#### Page Structure:

```
┌─────────────────────────────────────────┐
│  My Photos                              │
│  Upload and manage your project photos  │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐    │
│  │  📷 UPLOAD PHOTOS               │    │
│  │  Drag & drop or tap to upload   │    │
│  │  JPG, PNG, WebP (max 10MB)      │    │
│  └─────────────────────────────────┘    │
│                                         │
│  [All Photos]  [Projects]    ← Tabs     │
│  ─────────────────────────              │
│                                         │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐       │
│  │     │ │     │ │     │ │     │       │
│  │ IMG │ │ IMG │ │ IMG │ │ IMG │       │
│  │     │ │     │ │     │ │     │       │
│  └─────┘ └─────┘ └─────┘ └─────┘       │
│  Kitchen  Bath..  Exten..  Roof..       │
│                                         │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐       │
│  │     │ │     │ │     │ │     │       │
│  └─────┘ └─────┘ └─────┘ └─────┘       │
└─────────────────────────────────────────┘
```

#### Upload Flow:

```typescript
// components/admin/PhotoUploader.tsx

interface PhotoUploaderProps {
  businessId: string;
  onUploadComplete: (photos: Photo[]) => void;
}

export function PhotoUploader({ businessId, onUploadComplete }: PhotoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<Photo[]>([]);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  
  const handleUpload = async (files: File[]) => {
    setUploading(true);
    
    // Upload files to R2
    const uploaded = await Promise.all(
      files.map(file => uploadToR2(file, businessId))
    );
    
    setUploadedPhotos(uploaded);
    setUploading(false);
    
    // If multiple photos, ask if it's a project
    if (uploaded.length > 1) {
      setShowDescriptionModal(true);
    } else {
      // Single photo - just ask for description
      setShowDescriptionModal(true);
    }
  };
  
  return (
    <>
      <div 
        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center
                   hover:border-orange-400 hover:bg-orange-50 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Spinner className="w-8 h-8 text-orange-500" />
            <p className="text-gray-600">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              <Camera className="w-8 h-8 text-orange-500" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Upload Photos</p>
              <p className="text-sm text-gray-500">Drag & drop or tap to upload</p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP (max 10MB each)</p>
            </div>
          </div>
        )}
        
        <input 
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => handleUpload(Array.from(e.target.files || []))}
        />
      </div>
      
      {/* Description Modal */}
      <PhotoDescriptionModal
        open={showDescriptionModal}
        photos={uploadedPhotos}
        onComplete={(photos, isProject, projectName, description) => {
          if (isProject) {
            createProject(businessId, projectName, description, photos);
          } else {
            savePhotosWithDescription(photos, description);
          }
          setShowDescriptionModal(false);
          onUploadComplete(photos);
        }}
      />
    </>
  );
}
```

#### Photo Description Modal:

```typescript
// components/admin/PhotoDescriptionModal.tsx

interface PhotoDescriptionModalProps {
  open: boolean;
  photos: Photo[];
  onComplete: (
    photos: Photo[], 
    isProject: boolean, 
    projectName?: string, 
    description?: string
  ) => void;
}

export function PhotoDescriptionModal({ open, photos, onComplete }: PhotoDescriptionModalProps) {
  const [isProject, setIsProject] = useState(photos.length > 1);
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  
  const multiplePhotos = photos.length > 1;
  
  return (
    <Modal open={open}>
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">
          {multiplePhotos ? 'Add Project Details' : 'Add Photo Details'}
        </h2>
        
        {/* Photo preview grid */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {photos.map(photo => (
            <img 
              key={photo.id}
              src={photo.url} 
              className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
            />
          ))}
        </div>
        
        {/* Project toggle (only if multiple photos) */}
        {multiplePhotos && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isProject}
                onChange={(e) => setIsProject(e.target.checked)}
                className="w-5 h-5 rounded"
              />
              <div>
                <p className="font-medium">Group as a project</p>
                <p className="text-sm text-gray-500">
                  Posts as a carousel on Instagram, grouped on your website
                </p>
              </div>
            </label>
          </div>
        )}
        
        {/* Project name (if project) */}
        {isProject && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Project Name</label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g., Kitchen Extension - Bristol"
              className="w-full px-4 py-3 border rounded-lg text-lg"
            />
          </div>
        )}
        
        {/* Description */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            What's in {multiplePhotos ? 'these photos' : 'this photo'}?
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., New kitchen installation with island unit and integrated appliances"
            rows={3}
            className="w-full px-4 py-3 border rounded-lg text-lg"
          />
          <p className="text-sm text-gray-500 mt-2">
            Our AI will use this to write captions for your posts
          </p>
        </div>
        
        {/* Submit button */}
        <button
          onClick={() => onComplete(photos, isProject, projectName, description)}
          className="w-full py-4 bg-orange-500 text-white rounded-lg font-semibold text-lg"
        >
          Save {isProject ? 'Project' : multiplePhotos ? 'Photos' : 'Photo'}
        </button>
      </div>
    </Modal>
  );
}
```

#### Photo Grid Component:

```typescript
// components/admin/PhotoGrid.tsx

interface PhotoGridProps {
  photos: Photo[];
  projects: Project[];
  view: 'all' | 'projects';
  onPhotoClick: (photo: Photo) => void;
  onProjectClick: (project: Project) => void;
  onDeletePhoto: (photo: Photo) => void;
}

export function PhotoGrid({ photos, projects, view, ...handlers }: PhotoGridProps) {
  if (view === 'projects') {
    return (
      <div className="grid grid-cols-2 gap-4">
        {projects.map(project => (
          <div 
            key={project.id}
            onClick={() => handlers.onProjectClick(project)}
            className="relative rounded-lg overflow-hidden aspect-square cursor-pointer
                       group hover:ring-2 hover:ring-orange-400"
          >
            <img 
              src={project.cover_image_url} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
              <p className="font-semibold truncate">{project.name}</p>
              <p className="text-sm opacity-80">{project.photos_count} photos</p>
            </div>
            {/* Multi-photo indicator */}
            <div className="absolute top-2 right-2 bg-black/50 px-2 py-1 rounded text-white text-xs">
              📷 {project.photos_count}
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  // All photos view
  return (
    <div className="grid grid-cols-3 gap-2">
      {photos.map(photo => (
        <div 
          key={photo.id}
          className="relative aspect-square rounded-lg overflow-hidden group"
        >
          <img 
            src={photo.url} 
            className="w-full h-full object-cover"
          />
          {/* Used indicator */}
          {photo.used_in_post && (
            <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded">
              ✓ Posted
            </div>
          )}
          {/* Delete button on hover/tap */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlers.onDeletePhoto(photo);
            }}
            className="absolute top-1 right-1 bg-red-500 text-white w-7 h-7 rounded-full
                       opacity-0 group-hover:opacity-100 transition-opacity
                       flex items-center justify-center"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

### SECTION 4: POSTS PAGE (Scheduled Posts + Reviews)

#### Purpose
Unified view of all posts - scheduled, posted, and review graphics.

#### Page Structure:

```
┌─────────────────────────────────────────┐
│  Posts                                  │
│  Your upcoming and past posts           │
├─────────────────────────────────────────┤
│                                         │
│  [Scheduled]  [Posted]  [Reviews]  ← Tabs│
│  ─────────────────────────────────      │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ Tomorrow 8:00 AM                │    │
│  │ ┌─────┐                         │    │
│  │ │ IMG │ "Great progress on the  │    │
│  │ └─────┘  kitchen extension..."  │    │
│  │ 📸 Instagram  📘 Facebook       │    │
│  │                    [Edit] [Delete]│   │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ Wednesday 12:00 PM              │    │
│  │ ...                             │    │
│  └─────────────────────────────────┘    │
│                                         │
│  [+ Generate More Posts]                │
│                                         │
└─────────────────────────────────────────┘
```

#### Post Card Component:

```typescript
// components/admin/PostCard.tsx

interface PostCardProps {
  post: ScheduledPost;
  onEdit: (post: ScheduledPost) => void;
  onDelete: (post: ScheduledPost) => void;
  onReschedule: (post: ScheduledPost) => void;
}

export function PostCard({ post, onEdit, onDelete, onReschedule }: PostCardProps) {
  const statusColors = {
    scheduled: 'bg-blue-50 border-blue-200',
    posted: 'bg-green-50 border-green-200',
    failed: 'bg-red-50 border-red-200',
  };
  
  const statusIcons = {
    scheduled: '⏳',
    posted: '✓',
    failed: '✗',
  };
  
  return (
    <div className={`rounded-lg border p-4 ${statusColors[post.status]}`}>
      {/* Header with time */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span>{statusIcons[post.status]}</span>
          <span className="font-medium">
            {post.status === 'posted' 
              ? `Posted ${formatDate(post.posted_at)}`
              : formatDate(post.scheduled_for)
            }
          </span>
        </div>
        {post.status === 'scheduled' && (
          <div className="flex gap-2">
            <button 
              onClick={() => onEdit(post)}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Edit
            </button>
            <button 
              onClick={() => onDelete(post)}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Delete
            </button>
          </div>
        )}
      </div>
      
      {/* Content preview */}
      <div className="flex gap-3 mb-3">
        <img 
          src={post.image_url} 
          className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
        />
        <p className="text-sm text-gray-700 line-clamp-3">
          {post.caption}
        </p>
      </div>
      
      {/* Platforms */}
      <div className="flex items-center gap-3 text-xs text-gray-500">
        {post.platforms.includes('instagram') && (
          <span className="flex items-center gap-1">
            <InstagramIcon className="w-4 h-4" /> Instagram
          </span>
        )}
        {post.platforms.includes('facebook') && (
          <span className="flex items-center gap-1">
            <FacebookIcon className="w-4 h-4" /> Facebook
          </span>
        )}
        {post.platforms.includes('google') && (
          <span className="flex items-center gap-1">
            <GoogleIcon className="w-4 h-4" /> Google
          </span>
        )}
      </div>
      
      {/* Error message (human-readable) */}
      {post.status === 'failed' && (
        <div className="mt-3 p-3 bg-red-100 rounded-lg">
          <p className="text-sm text-red-800">
            {getHumanReadableError(post.error)}
          </p>
          <button 
            onClick={() => onReschedule(post)}
            className="mt-2 text-sm font-medium text-red-700 hover:underline"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
```

#### Human-Readable Error Messages:

```typescript
// lib/errors.ts

const ERROR_MESSAGES: Record<string, string> = {
  // Instagram errors
  'instagram: Unsupported post request': 
    'Instagram couldn\'t post this. The image might be too small or the wrong format.',
  'instagram: Invalid access token':
    'Your Instagram connection expired. Please reconnect in Settings.',
  'instagram: Media upload failed':
    'The image failed to upload. Try a smaller file or different format.',
  
  // Facebook errors  
  'facebook: Unsupported post request':
    'Facebook couldn\'t post this. Try reconnecting your account.',
  'facebook: Invalid access token':
    'Your Facebook connection expired. Please reconnect in Settings.',
    
  // Generic
  'Object with ID \'undefined\' does not exist':
    'Something went wrong with the connection. Please reconnect your account.',
};

export function getHumanReadableError(technicalError: string): string {
  // Check for exact matches
  if (ERROR_MESSAGES[technicalError]) {
    return ERROR_MESSAGES[technicalError];
  }
  
  // Check for partial matches
  for (const [key, message] of Object.entries(ERROR_MESSAGES)) {
    if (technicalError.toLowerCase().includes(key.toLowerCase())) {
      return message;
    }
  }
  
  // Generic fallback
  return 'Something went wrong. Please try again or contact support.';
}
```

#### Edit Caption Modal:

```typescript
// components/admin/EditCaptionModal.tsx

export function EditCaptionModal({ post, open, onSave, onClose }) {
  const [caption, setCaption] = useState(post.caption);
  const [regenerating, setRegenerating] = useState(false);
  
  const handleRegenerate = async () => {
    setRegenerating(true);
    const newCaption = await generateCaption(post.image_url, post.business_id);
    setCaption(newCaption);
    setRegenerating(false);
  };
  
  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Edit Caption</h2>
        
        {/* Image preview */}
        <img 
          src={post.image_url} 
          className="w-full h-48 object-cover rounded-lg mb-4"
        />
        
        {/* Caption textarea */}
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={5}
          className="w-full px-4 py-3 border rounded-lg text-base"
        />
        
        {/* Character count */}
        <p className="text-sm text-gray-500 mt-2">
          {caption.length} / 2,200 characters
        </p>
        
        {/* Regenerate button */}
        <button
          onClick={handleRegenerate}
          disabled={regenerating}
          className="mt-3 text-orange-600 text-sm font-medium"
        >
          {regenerating ? 'Regenerating...' : '🔄 Generate new caption with AI'}
        </button>
        
        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 border rounded-lg font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(caption)}
            className="flex-1 py-3 bg-orange-500 text-white rounded-lg font-medium"
          >
            Save Changes
          </button>
        </div>
      </div>
    </Modal>
  );
}
```

---

### SECTION 5: SETTINGS PAGE RESTRUCTURE

#### Purpose
Simplify settings into clear sections. Remove template selection. Add hero image upload.

#### New Settings Structure:

```
Settings
├── Business Information (collapsible)
│   ├── Business Name
│   ├── Trade Type (dropdown)
│   ├── Description
│   ├── Services
│   └── Areas Covered
│
├── Contact Details (collapsible)
│   ├── Email
│   ├── Phone
│   ├── WhatsApp
│   ├── City
│   └── Postcode
│
├── Website (collapsible, default open)
│   ├── Hero Image Upload (NEW)
│   ├── Primary Color
│   └── Secondary Color
│
├── Social Links (collapsible)
│   ├── Instagram URL
│   ├── Facebook URL
│   ├── Checkatrade URL
│   └── Google Business URL
│
├── Posting Schedule (collapsible, default open)
│   ├── Posts per week (dropdown)
│   ├── Schedule mode (Auto / Custom)
│   └── Custom time slots (if custom)
│
├── AI Captions (collapsible, collapsed by default)
│   ├── Caption Guidelines
│   ├── Custom Hashtags
│   └── Caption Sign-off toggle
│
└── Billing (collapsible)
    ├── Current Plan display
    └── Manage Subscription link
```

#### Collapsible Section Component:

```typescript
// components/admin/SettingsSection.tsx

interface SettingsSectionProps {
  title: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function SettingsSection({ title, icon, defaultOpen = false, children }: SettingsSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  
  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50"
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="font-semibold">{title}</span>
        </div>
        <ChevronIcon className={`w-5 h-5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      
      {open && (
        <div className="px-4 pb-4 border-t">
          {children}
        </div>
      )}
    </div>
  );
}
```

#### Hero Image Upload Component:

```typescript
// components/admin/HeroImageUpload.tsx

interface HeroImageUploadProps {
  currentImage?: string;
  businessId: string;
  onUpload: (url: string) => void;
}

export function HeroImageUpload({ currentImage, businessId, onUpload }: HeroImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    
    // Preview immediately
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    
    // Upload
    setUploading(true);
    try {
      const url = await uploadHeroImage(file, businessId);
      onUpload(url);
      toast.success('Hero image updated!');
    } catch (err) {
      toast.error('Upload failed. Please try again.');
      setPreview(currentImage);
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium">Hero Image</label>
      <p className="text-sm text-gray-500">
        This appears at the top of your website. Recommended: 1920x600px
      </p>
      
      {/* Preview */}
      <div className="relative aspect-[3/1] bg-gray-100 rounded-lg overflow-hidden">
        {preview ? (
          <img src={preview} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            No hero image set
          </div>
        )}
        
        {uploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Spinner className="w-8 h-8 text-white" />
          </div>
        )}
      </div>
      
      {/* Upload button */}
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg
                   text-gray-600 hover:border-orange-400 hover:text-orange-600 transition"
      >
        {uploading ? 'Uploading...' : preview ? 'Change Image' : 'Upload Image'}
      </button>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
}
```

#### Posting Schedule Component:

```typescript
// components/admin/PostingSchedule.tsx

const FREQUENCY_OPTIONS = [
  { value: 1, label: '1x per week' },
  { value: 2, label: '2x per week' },
  { value: 3, label: '3x per week' },
  { value: 5, label: '5x per week (Recommended)', recommended: true },
  { value: 7, label: '7x per week (Daily)' },
  { value: 14, label: '14x per week (2x daily)' },
  { value: 21, label: '21x per week (3x daily) - MAX' },
];

const DEFAULT_TIME_SLOTS = ['08:00', '12:00', '18:00'];

export function PostingSchedule({ settings, onUpdate }: PostingScheduleProps) {
  const [frequency, setFrequency] = useState(settings.posts_per_week);
  const [mode, setMode] = useState<'auto' | 'custom'>(settings.schedule_mode);
  const [customSlots, setCustomSlots] = useState(settings.custom_time_slots || []);
  
  return (
    <div className="space-y-6">
      {/* Frequency dropdown */}
      <div>
        <label className="block text-sm font-medium mb-2">Posts per week</label>
        <select
          value={frequency}
          onChange={(e) => setFrequency(Number(e.target.value))}
          className="w-full px-4 py-3 border rounded-lg text-lg bg-white"
        >
          {FREQUENCY_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <p className="text-sm text-gray-500 mt-2">
          We'll spread posts throughout the week at optimal times
        </p>
      </div>
      
      {/* Schedule mode toggle */}
      <div>
        <label className="block text-sm font-medium mb-3">Posting times</label>
        <div className="flex gap-2">
          <button
            onClick={() => setMode('auto')}
            className={`flex-1 py-3 rounded-lg font-medium transition ${
              mode === 'auto' 
                ? 'bg-orange-500 text-white' 
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            🤖 Auto (Best times)
          </button>
          <button
            onClick={() => setMode('custom')}
            className={`flex-1 py-3 rounded-lg font-medium transition ${
              mode === 'custom' 
                ? 'bg-orange-500 text-white' 
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            ⏰ Custom
          </button>
        </div>
        
        {mode === 'auto' && (
          <p className="text-sm text-gray-500 mt-3">
            We'll post at 8am, 12pm, and 6pm UK time - when your audience is most active
          </p>
        )}
      </div>
      
      {/* Custom time slots */}
      {mode === 'custom' && (
        <div className="space-y-3">
          <label className="block text-sm font-medium">Choose posting times</label>
          {customSlots.map((slot, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="time"
                value={slot}
                onChange={(e) => {
                  const newSlots = [...customSlots];
                  newSlots[index] = e.target.value;
                  setCustomSlots(newSlots);
                }}
                className="flex-1 px-4 py-3 border rounded-lg"
              />
              <button
                onClick={() => setCustomSlots(slots => slots.filter((_, i) => i !== index))}
                className="p-3 text-red-500"
              >
                ✕
              </button>
            </div>
          ))}
          
          {customSlots.length < 3 && (
            <button
              onClick={() => setCustomSlots([...customSlots, '12:00'])}
              className="text-orange-600 text-sm font-medium"
            >
              + Add time slot
            </button>
          )}
        </div>
      )}
    </div>
  );
}
```

---

### SECTION 6: FIX REVIEW GRAPHIC GENERATION

#### Purpose
Fix the broken Canvas-based review graphic generation. Currently shows garbled text due to font loading issues.

#### Root Cause
Fonts are not being registered/loaded before Canvas operations, causing text to render as placeholder boxes.

#### Implementation:

```typescript
// lib/review-graphics.ts

import { createCanvas, registerFont, loadImage } from 'canvas';
import path from 'path';

// CRITICAL: Register fonts at module load time, BEFORE any canvas operations
const FONTS_DIR = path.join(process.cwd(), 'public', 'fonts');

try {
  registerFont(path.join(FONTS_DIR, 'Inter-Regular.ttf'), { family: 'Inter', weight: '400' });
  registerFont(path.join(FONTS_DIR, 'Inter-Medium.ttf'), { family: 'Inter', weight: '500' });
  registerFont(path.join(FONTS_DIR, 'Inter-Bold.ttf'), { family: 'Inter', weight: '700' });
  registerFont(path.join(FONTS_DIR, 'Inter-Italic.ttf'), { family: 'Inter', weight: '400', style: 'italic' });
  console.log('✅ Fonts registered successfully');
} catch (error) {
  console.error('❌ Font registration failed:', error);
  // Fallback will use system fonts
}

// Font fallback chain
const FONT_FAMILY = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';

interface ReviewGraphicOptions {
  reviewerName: string;
  reviewText: string;
  rating: number; // 1-5
  businessName: string;
  primaryColor: string;
  logoUrl?: string;
}

export async function generateReviewGraphic(options: ReviewGraphicOptions): Promise<Buffer> {
  const {
    reviewerName,
    reviewText,
    rating,
    businessName,
    primaryColor,
    logoUrl
  } = options;
  
  // Canvas dimensions (Instagram square)
  const WIDTH = 1080;
  const HEIGHT = 1080;
  
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');
  
  // === BACKGROUND ===
  // Subtle gradient using brand color
  const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  gradient.addColorStop(0, lightenColor(primaryColor, 0.95));
  gradient.addColorStop(1, lightenColor(primaryColor, 0.85));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  
  // === WHITE CARD ===
  const cardPadding = 80;
  const cardX = cardPadding;
  const cardY = 200;
  const cardWidth = WIDTH - (cardPadding * 2);
  const cardHeight = 680;
  
  // Card shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 10;
  
  // Card background
  ctx.fillStyle = '#FFFFFF';
  roundRect(ctx, cardX, cardY, cardWidth, cardHeight, 24);
  ctx.fill();
  
  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  
  // === STARS ===
  const starsY = cardY + 60;
  const starSize = 40;
  const starGap = 8;
  const totalStarsWidth = (starSize * 5) + (starGap * 4);
  let starX = (WIDTH - totalStarsWidth) / 2;
  
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = i < rating ? '#FBBF24' : '#E5E7EB'; // Yellow or gray
    drawStar(ctx, starX + starSize / 2, starsY, starSize / 2);
    starX += starSize + starGap;
  }
  
  // === REVIEW TEXT ===
  ctx.fillStyle = '#1F2937';
  ctx.font = `italic 500 32px ${FONT_FAMILY}`;
  ctx.textAlign = 'center';
  
  const maxTextWidth = cardWidth - 100;
  const wrappedText = wrapText(ctx, `"${reviewText}"`, maxTextWidth);
  const lineHeight = 44;
  const textStartY = starsY + 80;
  
  wrappedText.forEach((line, index) => {
    ctx.fillText(line, WIDTH / 2, textStartY + (index * lineHeight));
  });
  
  // === DIVIDER LINE ===
  const dividerY = textStartY + (wrappedText.length * lineHeight) + 40;
  ctx.strokeStyle = primaryColor;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(WIDTH / 2 - 60, dividerY);
  ctx.lineTo(WIDTH / 2 + 60, dividerY);
  ctx.stroke();
  
  // === REVIEWER NAME ===
  ctx.fillStyle = '#1F2937';
  ctx.font = `700 28px ${FONT_FAMILY}`;
  ctx.textAlign = 'center';
  ctx.fillText(reviewerName, WIDTH / 2, dividerY + 50);
  
  // === BUSINESS NAME (Footer) ===
  ctx.fillStyle = primaryColor;
  ctx.font = `600 24px ${FONT_FAMILY}`;
  ctx.fillText(businessName, WIDTH / 2, HEIGHT - 50);
  
  // === LOGO (if provided) ===
  if (logoUrl) {
    try {
      const logo = await loadImage(logoUrl);
      const logoSize = 60;
      ctx.drawImage(logo, WIDTH / 2 - logoSize / 2, cardY - logoSize / 2, logoSize, logoSize);
    } catch (e) {
      console.warn('Could not load logo:', e);
    }
  }
  
  return canvas.toBuffer('image/png');
}

// === HELPER FUNCTIONS ===

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number) {
  const spikes = 5;
  const outerRadius = radius;
  const innerRadius = radius * 0.5;
  let rotation = -Math.PI / 2;
  
  ctx.beginPath();
  for (let i = 0; i < spikes; i++) {
    const outerX = cx + Math.cos(rotation) * outerRadius;
    const outerY = cy + Math.sin(rotation) * outerRadius;
    ctx.lineTo(outerX, outerY);
    rotation += Math.PI / spikes;
    
    const innerX = cx + Math.cos(rotation) * innerRadius;
    const innerY = cy + Math.sin(rotation) * innerRadius;
    ctx.lineTo(innerX, innerY);
    rotation += Math.PI / spikes;
  }
  ctx.closePath();
  ctx.fill();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  words.forEach(word => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  // Limit to ~6 lines to fit in card
  return lines.slice(0, 6);
}

function lightenColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.floor((num >> 16) + (255 - (num >> 16)) * amount));
  const g = Math.min(255, Math.floor(((num >> 8) & 0x00FF) + (255 - ((num >> 8) & 0x00FF)) * amount));
  const b = Math.min(255, Math.floor((num & 0x0000FF) + (255 - (num & 0x0000FF)) * amount));
  return `rgb(${r}, ${g}, ${b})`;
}
```

#### Font Setup:
```bash
# Create fonts directory
mkdir -p public/fonts

# Download Inter font (or copy from Google Fonts)
# Place these files in public/fonts/:
# - Inter-Regular.ttf
# - Inter-Medium.ttf  
# - Inter-Bold.ttf
# - Inter-Italic.ttf
```

#### Vercel Deployment Note:
For Vercel, fonts must be included in the build. Add to `vercel.json` if needed:

```json
{
  "functions": {
    "api/**/*.ts": {
      "includeFiles": "public/fonts/**"
    }
  }
}
```

---

### SECTION 7: FILE CHANGES SUMMARY

#### Files to CREATE:
```
/components/admin/HealthCheckBanner.tsx
/components/admin/RecentActivity.tsx
/components/admin/PhotoUploader.tsx
/components/admin/PhotoDescriptionModal.tsx
/components/admin/PhotoGrid.tsx
/components/admin/PostCard.tsx
/components/admin/EditCaptionModal.tsx
/components/admin/SettingsSection.tsx
/components/admin/HeroImageUpload.tsx
/components/admin/PostingSchedule.tsx
/lib/errors.ts (human-readable error messages)
/lib/review-graphics.ts (fixed Canvas implementation)
/public/fonts/Inter-Regular.ttf
/public/fonts/Inter-Medium.ttf
/public/fonts/Inter-Bold.ttf
/public/fonts/Inter-Italic.ttf
```

#### Files to UPDATE:
```
/components/admin/Navigation.tsx (simplify to 5 items)
/components/admin/Sidebar.tsx (if exists)
/app/admin/dashboard/page.tsx (add health check, recent activity)
/app/admin/settings/page.tsx (restructure with collapsible sections)
/app/admin/photos/page.tsx (NEW - merged My Photos page)
/app/admin/posts/page.tsx (add tabs for Scheduled/Posted/Reviews)
/app/admin/social/page.tsx (rename from social-accounts)
```

#### Files to DELETE/DEPRECATE:
```
/app/admin/projects/page.tsx (merged into photos)
/app/admin/media-library/page.tsx (merged into photos)
/app/admin/scheduled-posts/page.tsx (renamed to posts)
```

---

## EXIT CRITERIA

Complete when:

- ✅ Navigation has exactly 5 items: Dashboard, My Photos, Posts, Socials, Settings
- ✅ Dashboard shows health check banner with appropriate status
- ✅ Dashboard shows recent activity feed
- ✅ "How it works" is collapsible/dismissible for returning users
- ✅ My Photos page has unified upload with project grouping option
- ✅ Photo description modal captures context for AI captions
- ✅ Posts page has tabs for Scheduled/Posted/Reviews
- ✅ All error messages are human-readable (no technical jargon)
- ✅ Edit caption modal allows editing and AI regeneration
- ✅ Settings page has collapsible sections
- ✅ Hero image upload works and updates website
- ✅ Template selection is REMOVED from settings
- ✅ Billing section is inside Settings
- ✅ Review graphics generate with proper fonts and styling
- ✅ All touch targets are minimum 44px
- ✅ Everything works on mobile (test on iPhone 12 viewport)
- ✅ `npm run build` succeeds with no errors

---

## TESTING CHECKLIST

### Dashboard
- [ ] Health check shows green when photos queued
- [ ] Health check shows amber when running low (<3 photos)
- [ ] Health check shows red when no socials connected
- [ ] Recent activity shows latest posts
- [ ] "How it works" can be dismissed
- [ ] Dashboard loads fast (<2s)

### My Photos
- [ ] Can upload single photo
- [ ] Can upload multiple photos
- [ ] Modal asks if project when multiple uploaded
- [ ] Can add description to photos
- [ ] Photos appear in grid
- [ ] Can switch between All Photos and Projects tabs
- [ ] Can delete photos
- [ ] Posted indicator shows on used photos

### Posts
- [ ] Scheduled tab shows upcoming posts
- [ ] Posted tab shows past posts
- [ ] Reviews tab shows review graphics
- [ ] Can edit caption on scheduled post
- [ ] Can delete scheduled post
- [ ] AI can regenerate caption
- [ ] Error messages are human-readable
- [ ] Can retry failed posts

### Settings
- [ ] All sections are collapsible
- [ ] Website section has hero image upload
- [ ] Hero image preview shows after upload
- [ ] No template selection visible
- [ ] Posting schedule has Auto/Custom toggle
- [ ] Custom time slots work
- [ ] Billing section is present
- [ ] Save button works and shows feedback

### Review Graphics
- [ ] Text renders correctly (no garbled boxes)
- [ ] Stars display correctly based on rating
- [ ] Business name appears at bottom
- [ ] Brand color is applied to background
- [ ] Image is 1080x1080 for Instagram

### Mobile
- [ ] Bottom navigation visible and usable
- [ ] All touch targets are 44px minimum
- [ ] No horizontal scrolling
- [ ] Forms are easy to use
- [ ] Modals don't overflow screen

---

## GOLDEN PATH TESTS

### Test 1: New User First Session
```
Login → See health check (connect socials) → Go to Socials → Connect Instagram → 
Return to Dashboard → See health check (upload photos) → Go to My Photos → 
Upload 3 photos → Add description → Return to Dashboard → See "All good!"
```

### Test 2: Returning User Upload Flow
```
Login → Dashboard shows "All good" → Upload Photos CTA → 
Select 5 photos → Mark as project → Name it → Add description → 
Save → See project in My Photos grid
```

### Test 3: Edit Scheduled Post
```
Go to Posts → See scheduled posts → Click Edit on one → 
Change caption → Save → See updated caption
```

### Test 4: Change Settings
```
Go to Settings → Expand Website section → Upload hero image → 
See preview → Change posting frequency → Save → Confirm changes applied
```

If ANY test fails → Fix before deploying.

---

## NOTES FOR CLAUDE CODE

1. **Explore first**: Before making changes, explore the existing file structure to understand how components are organized

2. **Keep existing patterns**: Match the existing code style (component structure, naming conventions, etc.)

3. **Don't break existing features**: Make sure existing functionality still works after changes

4. **Test on mobile**: Use responsive design tools to verify mobile layout

5. **Font files**: You'll need to download Inter font TTF files and place in /public/fonts/

6. **Database**: Check Supabase schema for exact column names before implementing

7. **Incremental changes**: Can implement in stages - navigation first, then dashboard, then other sections
