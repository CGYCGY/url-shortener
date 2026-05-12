# url-shortener

Self-hosted URL shortener for `s.gylab.cc`. Single-operator: create, share, gate, and track short links.

## Stack

- **App:** Next.js 16 (App Router) on Node, React 19, TypeScript strict + `noUncheckedIndexedAccess`
- **Backend:** Convex (reactive DB + serverless functions)
- **Auth:** WorkOS AuthKit via `@workos-inc/authkit-nextjs` (operator-only — sign-up disabled in the WorkOS dashboard)
- **UI:** Tailwind CSS v4 + shadcn/ui + Radix primitives + lucide icons
- **Forms:** React Hook Form + Zod
- **Tooling:** Bun, Biome, Lefthook, Vitest, Playwright

## Local development

Prereqs: Bun ≥ 1.3, a WorkOS account, and a Convex account.

```bash
bun install
cp .env.example .env.local
# fill in WORKOS_*, CONVEX_*, NEXT_PUBLIC_*, LINK_UNLOCK_COOKIE_SECRET (see below)

# in one terminal — pushes Convex schema/functions and watches for changes
bunx convex dev

# in another — Next.js dev server
bun run dev
```

Visit http://localhost:3000.

### WorkOS dashboard setup

1. Create a WorkOS project at https://dashboard.workos.com. Enable **AuthKit**.
2. Disable **self-service sign-up** (operator-only).
3. Add redirect URI: `http://localhost:3000/callback` (dev) and `https://s.gylab.cc/callback` (prod).
4. Copy `Client ID` and `API Key` into `.env.local` as `WORKOS_CLIENT_ID` and `WORKOS_API_KEY`.
5. Generate `WORKOS_COOKIE_PASSWORD` (32+ chars): `openssl rand -base64 32`.
6. Set up the WorkOS webhook endpoint pointing at your Convex HTTP action (from `convex.config.ts`). Copy the webhook signing secret into `WORKOS_WEBHOOK_SECRET`.

### Seeding the operator user

WorkOS is the source of truth for users. Provision your account via the CLI:

```bash
bun run seed-user -- --email you@example.com --password 'a-strong-passphrase' \
  --first-name Your --last-name Name
```

After this, sign in at http://localhost:3000/login.

## Environment variables

| Name | Set in | Notes |
|---|---|---|
| `WORKOS_CLIENT_ID` | server `.env.local` | from WorkOS dashboard |
| `WORKOS_API_KEY` | server `.env.local` | from WorkOS dashboard |
| `WORKOS_COOKIE_PASSWORD` | server `.env.local` | 32+ chars, generated |
| `WORKOS_WEBHOOK_SECRET` | server `.env.local` AND `convex env set` | webhook signature verification |
| `NEXT_PUBLIC_WORKOS_REDIRECT_URI` | server `.env.local` | `http://localhost:3000/callback` in dev, `https://s.gylab.cc/callback` in prod |
| `CONVEX_DEPLOYMENT` | server `.env.local` | populated by `bunx convex dev` on first run |
| `NEXT_PUBLIC_CONVEX_URL` | server `.env.local` | populated by `bunx convex dev` |
| `NEXT_PUBLIC_BASE_URL` | server `.env.local` (prod) | `https://s.gylab.cc` — defaults to `window.location.origin` in the browser when unset |
| `LINK_UNLOCK_COOKIE_SECRET` | server `.env.local` | 32+ chars, generated; HMAC secret for the password-protected-link unlock cookie. Rotating invalidates outstanding unlock cookies. |

Convex-side env vars (set via `bunx convex env set NAME value`):
- `WORKOS_CLIENT_ID`, `WORKOS_API_KEY`, `WORKOS_WEBHOOK_SECRET` — read by the `@convex-dev/workos-authkit` component.

All Next.js env vars are validated by `@t3-oss/env-nextjs` (`src/env.ts`). Use `SKIP_ENV_VALIDATION=true` to bypass validation during build steps that don't need real values.

## Common commands

```bash
bun run dev          # Next.js dev server
bunx convex dev      # Convex functions + schema watcher (run in parallel with dev)
bun run build        # Production build
bun run start        # Production server
bun run check        # Biome lint + format (auto-fix)
bun run lint         # Biome lint only
bun run format       # Biome format only
bun run typecheck    # tsc --noEmit (whole repo)
bun run test         # Vitest unit tests
bun run test:watch   # Vitest watch mode
bun run seed-user -- --email X --password Y   # WorkOS user provisioning
```

Pre-commit hook (via Lefthook) runs `biome check --write` on staged files.

## Routes

| Path | Purpose | Auth |
|---|---|---|
| `/` | Redirect to `/dashboard` or `/login` | open |
| `/login` | Sign-in trigger (links to WorkOS) | open |
| `/callback` | WorkOS code exchange | open (handled by AuthKit) |
| `/dashboard` | Owner's links list | required |
| `/dashboard/new` | Create-link form | required |
| `/dashboard/links/[id]` | Link detail + stats + management | required |
| `/[slug]` | Public redirect (302 / 404 / 410) | open |
| `/[slug]/unlock` | Password interstitial | open |

The AuthKit proxy is configured at `src/proxy.ts` with `matcher: ['/', '/login', '/dashboard/:path*']` — `/[slug]` and `/[slug]/unlock` stay off the auth hot path.

## Deployment

This project is designed for self-hosting on the operator's own server. There is no managed deploy target.

### Convex (managed)

```bash
bunx convex deploy
```

This pushes schema and functions to your prod Convex deployment. After the first deploy, set Convex env vars:

```bash
bunx convex env set WORKOS_CLIENT_ID client_xxx
bunx convex env set WORKOS_API_KEY sk_live_xxx
bunx convex env set WORKOS_WEBHOOK_SECRET whsec_xxx
```

### Next.js (self-hosted)

```bash
bun install --production
bun run build
bun run start   # listens on $PORT (default 3000)
```

Run behind Caddy or Nginx with Let's Encrypt TLS termination. Example Caddyfile:

```
s.gylab.cc {
  reverse_proxy localhost:3000
}
```

### DNS

Point `s.gylab.cc` A/AAAA records at the server.

### WorkOS production config

In the WorkOS dashboard, add the production redirect URI `https://s.gylab.cc/callback` alongside the dev one. Keep self-service sign-up disabled.

### Webhook endpoint

In the WorkOS dashboard, point the user-events webhook at the Convex HTTP endpoint configured by `@convex-dev/workos-authkit` (see `convex.config.ts`). The path is exposed by Convex; check `bunx convex dashboard` for the exact URL.

## Rollback

- **Convex:** function rollback via the Convex dashboard's deployment history (`bunx convex dashboard`).
- **Next.js:** `git revert <bad commit>` → `bun run build` → restart the server. No special tooling.
- **Webhook secret rotation:** rotate `WORKOS_WEBHOOK_SECRET` in both the WorkOS dashboard and Convex (`bunx convex env set ...`). Old webhooks will be rejected until both sides have the new value.
- **Unlock cookie secret rotation:** rotate `LINK_UNLOCK_COOKIE_SECRET` in the server env. All outstanding unlock cookies become invalid — visitors will re-enter passwords.

## Testing

Unit tests live next to source as `*.test.ts`. End-to-end Playwright tests run against a dev Convex deployment and require a real WorkOS user (or a test-only auth shim).

```bash
bun run test
```
