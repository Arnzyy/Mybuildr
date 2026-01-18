# Source of Truth Hierarchy

When there's conflict, higher wins:

```
1. /docs/DECISIONS.md        ← Architectural decisions (FINAL)
2. Current ZIP file          ← What we're building now
3. /docs/MASTER-PLAN.md      ← Overall structure
4. /docs/ASSUMPTIONS.md      ← Scale & scope
5. Existing codebase         ← What's built
6. AI suggestions            ← Nice-to-haves only
```

## The Rule

If Claude suggests something that conflicts with a higher-level doc, the doc wins.

If you want to change direction, update DECISIONS.md FIRST.

## Key Decisions Already Made

- Single-page scrolling (not multi-page)
- No database
- Mobile-first design
- Email-based conversion (not sign-up form)
- Interactive demo with 3 tabs
- Pricing leads with £99 but positions £199
- Live this week
