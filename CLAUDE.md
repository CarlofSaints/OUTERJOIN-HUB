@AGENTS.md

# OuterJoin Hub

Central portal app for OuterJoin applications.

## Key patterns
- Vercel Blob (private) for user data — NO module-level cache
- `oj_hub_session` localStorage key
- `authFetch()` sends `x-user-id` header
- `requireLogin()` server-side auth check
- Modules stored in Vercel Blob (`modules.json`) via `lib/moduleData.ts` — managed through `/admin/modules` UI
- `GET /api/modules` is public (no auth); `POST/PUT/DELETE` require super-admin
