# Hoizr Business — demo branch

This branch (`demo`) is the **Vercel-deployed, no-backend demo** of the Hoizr organizer dashboard.
Hoizr is sunset and open-sourced; `main` stays the clean open-source codebase and is never modified by demo work.
Questions or help: **hoizr.tech@gmail.com**.

## How it works
- **No server.** `utils/demo/gqlClient.ts` replaces `graphql-request`'s `GraphQLClient` with one whose `fetch` is
  `utils/demo/fetch.ts`. Every GraphQL operation is answered in-process by `utils/demo/engine.ts`.
- **Engine** (`utils/demo/engine.ts`): parses the query, resolves each root field by name via
  `utils/demo/resolvers.ts`, then projects the result onto the requested selection set. Fields without data are
  auto-filled with plausible values, so unknown operations never break the UI.
- **Data** (`utils/demo/db.ts`): a deterministic "Neon Nights Collective" organizer — events, tickets, orders,
  customers, coupons, campaigns, payouts, team, scanners, reports… Mutations (create/edit/delete) persist to
  `localStorage` (`hoizr-demo-db-v1`); the banner's **Reset demo** button (or logout) clears it.
- **Auth.** `middleware.ts` treats every request as a signed-in demo host (injects an `accessToken` cookie so the SSR
  gates pass) and redirects `/login`, `/signup`, `/select-host` and blocker pages to `/dashboard`.
- **No third-party calls.** `utils/demo/externalFetch.ts` answers any cross-origin `fetch` locally (Cloudinary uploads →
  data URLs, IFSC lookup, CSV…). `/api/{contact,forms,waitlist}` are stubs that discard the submission. Marketing
  images are bundled in `public/demo/img`; the book-a-demo Zcal embed is replaced by a notice.
- **UI.** `components/demo/DemoBanner.tsx` is the slim "Demo mode" announcement bar on every page.

## Run
```bash
yarn install && yarn dev     # no .env needed
```
