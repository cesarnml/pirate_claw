# P10.01 Scaffold: SvelteKit App, Tooling, Nav Shell, Dockerfile

## Goal

Bootstrap the `web/` SvelteKit application with the full toolchain, a working nav shell, and a Docker build so every subsequent ticket has a stable foundation to build on.

## Scope

- Run `bun create svelte@latest web` — SvelteKit 2, Svelte 5, TypeScript, ESLint (flat config), Prettier
- Add Tailwind 4 dependencies: `tailwindcss`, `@tailwindcss/vite`
- Add `prettier-plugin-tailwindcss` to `web/prettier.config.*` — automatic Tailwind class sort, no manual config required
- Add `vitest`, `@testing-library/svelte`, `@testing-library/jest-dom`
- Add `@sveltejs/adapter-node` and configure in `svelte.config.ts`
- Wire `PIRATE_CLAW_API_URL` as a server-only env var via `$env/static/private` — read in a shared `src/lib/server/api.ts` fetch helper; throw a clear startup error if absent
- Implement `src/routes/+layout.svelte` with top-level nav: Home (`/`), Candidates (`/candidates`), Shows (links to `/candidates` for now — show detail is P10.03), Config (`/config`)
- Scaffold stub `+page.svelte` for each route (`/`, `/candidates`, `/config`, `/shows/[slug]`) — just a heading so nav links resolve without 404
- Add `web/Dockerfile`: multi-stage build (`bun install --frozen-lockfile`, `bun run build`) → runtime stage (`node build/`)
- Add `web/.env.example` documenting `PIRATE_CLAW_API_URL=http://localhost:3000`
- One smoke test: nav renders all four links

## Out Of Scope

- Real API calls or data (P10.02–P10.05)
- Show detail page content (P10.03)

## Exit Condition

`bun run --cwd web dev` starts without error. All four nav links render. `bun run --cwd web build` produces a `build/` output. `docker build -f web/Dockerfile .` succeeds from repo root.

## Test

```ts
// web/src/routes/layout.test.ts
// render +layout.svelte, assert nav contains links to /, /candidates, /shows, /config
```

Render the layout with mock children, assert all four nav links are present with correct `href` attributes.
