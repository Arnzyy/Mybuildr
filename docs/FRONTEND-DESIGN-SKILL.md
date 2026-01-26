# Frontend Design Skill

> **Purpose**: Create distinctive, production-grade interfaces that avoid generic "AI slop"

---

## Current Design Direction

**Project**: Mybuildr - Construction Website Builder + Social Automation

**Aesthetic**: Mobile-first, clean, modern, professional

**Target Audience**: Construction companies (builders, tradespeople, contractors)

**Design Principles**:
1. **Trustworthy over trendy** - Builders want professional, not flashy
2. **Mobile-first** - Most builders use phones, not desktops
3. **Clear CTAs** - Orange buttons, obvious actions
4. **Minimal but intentional** - Clean without being boring

---

## Color Palette

**Primary Color**: Orange (#EA580C, #F97316)
- Used for CTAs, important actions
- High contrast, stands out
- Associated with construction/safety

**Accent Colors**: Varies by builder template
- Each template has its own color scheme
- Examples: Blue (corporate), Green (eco), Red (emergency)

**Neutrals**:
- Gray-900 for text (#111827)
- Gray-500 for secondary text (#6B7280)
- White backgrounds
- Gray-50 for subtle sections (#F9FAFB)

---

## Typography

**Current Stack**: System fonts (optimized for speed)
- Clean, readable sans-serif
- Mobile-optimized
- Fast loading (no font downloads)

**Hierarchy**:
- H1: 2xl-3xl, bold
- H2: xl-2xl, semibold
- Body: base, regular
- Small: sm-xs for labels

---

## Component Patterns

### Big Upload Button (Admin Dashboard)
```tsx
<Link
  href="/admin/photos"
  className="block bg-gradient-to-br from-orange-500 to-orange-600
  rounded-2xl p-8 md:p-12 text-center text-white shadow-lg
  hover:shadow-xl hover:scale-[1.02] transition-all"
>
  {/* Camera icon + text */}
</Link>
```

**Why this works**:
- Orange gradient = brand color + visual interest
- Large touch target = mobile-friendly
- Hover effects = desktop polish
- Clear icon + text = no ambiguity

---

### Health Check Banner
```tsx
<div className={`rounded-xl p-4 ${
  status === 'good' ? 'bg-green-50 border-green-200' :
  status === 'warning' ? 'bg-yellow-50 border-yellow-200' :
  'bg-red-50 border-red-200'
}`}>
  {/* Status message + action */}
</div>
```

**Why this works**:
- Color-coded urgency (green/yellow/red)
- Immediate visual feedback
- Optional action button for quick fixes

---

### Stats Cards
```tsx
<div className="bg-white rounded-xl border border-gray-200 p-5
hover:shadow-md transition-shadow">
  <div className="flex items-center gap-3">
    <div className="w-12 h-12 bg-blue-100 rounded-xl
    flex items-center justify-center">
      <Icon className="w-6 h-6 text-blue-600" />
    </div>
    <div>
      <p className="text-2xl font-bold">{number}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </div>
</div>
```

**Why this works**:
- Icon background matches color theme
- Large numbers = easy to scan
- Hover effect = interactivity
- Consistent 12px icon container

---

## Builder Templates Design Notes

### 1. Developer Template
- Modern, professional
- Blue accents
- Clean grid layouts
- Minimal text

### 2. Tradesman Template
- Bold, traditional
- Strong contrast
- Large hero images
- Clear CTAs

### 3. Showcase Template
- Gallery-first
- Image-heavy
- Minimal chrome
- Let work speak

### 4. Bold Template
- High-contrast
- Dark headers
- Bright accents
- Attention-grabbing

### 5. Local Template
- Community-focused
- Friendly tone
- Location emphasis
- Personal touch

### 6. Corporate Template
- Clean, business
- Structured layouts
- Professional imagery
- Trust signals

### 7. Craftsman Template
- Premium, detailed
- Elegant typography
- Refined color palette
- High-end feel

### 8. Emergency Template
- Urgent, accessible
- Phone number prominent
- 24/7 messaging
- Fast contact

### 9. Daxa Template
- Premium modern
- Sophisticated
- Boutique feel
- Curated aesthetic

---

## Animation Strategy

**Minimal but intentional**: No unnecessary flourishes

**Used animations**:
1. **Hover effects**: Scale (1.02), shadow increases
2. **Transitions**: All 200-300ms for smooth feel
3. **Loading states**: Simple spinners, no elaborate skeletons

**Not used**:
- Page transitions
- Scroll animations (except lazy loading images)
- Complex entrance animations
- Parallax effects

**Why**: Builders want fast, not fancy. Every animation must have a purpose.

---

## Mobile-First Breakpoints

```css
/* Mobile first (default) */
base styles

/* Tablet (md: 768px+) */
md:larger-text md:grid-cols-2

/* Desktop (lg: 1024px+) */
lg:grid-cols-3 lg:max-w-7xl
```

**Key principles**:
- Design for mobile first
- Test on actual phones
- Touch targets minimum 44px
- Readable text without zooming

---

## Accessibility

**Current implementation**:
- Semantic HTML (nav, main, section, article)
- Alt text on all images
- Color contrast meets WCAG AA
- Focus states visible
- Keyboard navigation works

**Not implemented yet**:
- Screen reader testing
- ARIA labels (basic only)
- Skip to content links

---

## What Makes This NOT Generic

1. **Orange as primary** - Not the typical blue/purple SaaS gradient
2. **Construction-specific templates** - Not generic landing page
3. **Real project photos** - Not stock imagery
4. **Builder-focused copy** - Technical but not jargon-heavy
5. **Mobile-obsessed** - Most SaaS tools are desktop-first

---

## Design Checklist Before Shipping

- [ ] Works perfectly on mobile (test on real phone)
- [ ] Orange CTAs are obvious and clickable
- [ ] Touch targets are at least 44px
- [ ] Loading states exist for slow connections
- [ ] Error states are helpful, not technical
- [ ] Images have alt text
- [ ] Forms have clear validation
- [ ] No broken layouts at any screen size
