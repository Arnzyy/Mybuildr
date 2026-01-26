# Claude Code Rules

## ⛔ HARD RULES - NEVER BREAK THESE

These rules apply to EVERY task, NO EXCEPTIONS.

---

### 1. ALWAYS UPDATE IMPLEMENTATION-LOG.md

After completing ANY work, update `/docs/IMPLEMENTATION-LOG.md`:

- ✅ Add any new environment variables
- ✅ Document new database tables and RLS policies
- ✅ Log what was built
- ✅ Note any configuration steps needed
- ✅ Record any third-party services added
- ✅ Update design system values if changed

This is NON-NEGOTIABLE. The log is the team's reference.

---

### 2. NEVER BODGE RLS POLICIES

Row Level Security must be implemented CORRECTLY. Never:

- ❌ Disable RLS to "fix" a permissions issue
- ❌ Use `SECURITY DEFINER` to bypass RLS
- ❌ Create overly permissive policies (e.g., `USING (true)`)
- ❌ Skip RLS "for now" with plans to add it later
- ❌ Use service_role key client-side to bypass RLS

Instead:

- ✅ Debug why the policy isn't working
- ✅ Verify the user has the correct role/permissions
- ✅ Test policies in Supabase SQL editor first
- ✅ Create granular policies (SELECT, INSERT, UPDATE, DELETE separately)

If RLS isn't working, STOP and fix the root cause.

---

### 3. NEVER DO WORKAROUNDS - ALWAYS PROPER FIXES

When something breaks, fix it properly. Never:

- ❌ Comment out broken code
- ❌ Add try/catch that swallows errors silently
- ❌ Hardcode values to "make it work"
- ❌ Skip validation "because it's just MVP"
- ❌ Use `any` type to silence TypeScript
- ❌ Disable ESLint rules
- ❌ Add // @ts-ignore

Instead:

- ✅ Understand WHY it's broken
- ✅ Fix the actual root cause
- ✅ If you can't fix it, STOP and explain the blocker
- ✅ Document the issue for review

---

### 4. NEVER SKIP SECURITY

Security is not optional. Never:

- ❌ Store sensitive data unencrypted
- ❌ Expose API keys client-side
- ❌ Trust user input without validation
- ❌ Skip rate limiting
- ❌ Log sensitive information

Instead:

- ✅ Validate all inputs server-side
- ✅ Use environment variables for secrets
- ✅ Implement proper error handling
- ✅ Test multi-tenant isolation

---

### 5. ASK, DON'T ASSUME

When requirements are unclear:

- ❌ Don't guess and implement
- ❌ Don't add features not requested
- ❌ Don't "improve" the architecture without discussion

Instead:

- ✅ STOP and ask for clarification
- ✅ List your assumptions explicitly
- ✅ Wait for confirmation before proceeding

---

### 6. ALWAYS UPDATE TECHNICAL-FLUENCY.md

This document transforms building into learning. Update it when:

- ✅ You fix a non-trivial bug → Add to Error Diary
- ✅ You make an architectural decision → Add to Key Technical Decisions
- ✅ You implement a core concept → Add to Concepts Explained
- ✅ You complete a major feature → Update Big Picture / Architecture sections

**Writing style requirements:**
- Use analogies, not jargon
- Explain WHY, not just WHAT
- Write like you're teaching a smart founder, not a developer
- If an investor could ask about it, prepare the answer
- Every bug is a lesson—capture the wrong assumption

---

## Copy This Into Every Session

```
RULES FOR THIS SESSION:

1. ALWAYS update /docs/IMPLEMENTATION-LOG.md after completing work
2. NEVER bodge RLS policies - always proper implementation
3. NEVER do workarounds - always fix root cause
4. NEVER skip security - validate everything
5. If stuck, STOP and explain - don't hack around it
6. If unclear, ASK - don't assume
7. ALWAYS update /docs/TECHNICAL-FLUENCY.md when you:
   - Fix a non-trivial bug (Error Diary)
   - Make a decision with tradeoffs (Key Decisions)
   - Implement core concepts (Concepts Explained)
   Write engagingly—analogies over jargon.

If you find yourself about to break these rules, STOP and tell me why.
```
