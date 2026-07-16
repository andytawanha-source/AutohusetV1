# Autohuset Platform

Multi-brand hjemmesideplatform for danske bilforhandlere. Én kodebase, to brands: **Autohuset Vest** og **Autohuset V**. Bygget med React + TypeScript + Vite + Tailwind og Supabase (PostgreSQL, Auth, Storage, Edge Functions).

> Status: Under udvikling. Se `docs/PLAN-05-IMPLEMENTERINGSPLAN.md` for faserne, og `docs/`-mappen for arkitektur, database- og komponentoversigt.

## Hurtig start (lokal udvikling)

```bash
npm install
cp .env.example .env        # udfyld værdier – tomt VITE_SUPABASE_URL giver demo-mode
npm run dev
```

Uden Supabase-konfiguration kører appen i demo-mode med tydeligt markerede mockdata. Nummerpladeopslag bruger mock-provider indtil `VEHICLE_LOOKUP_PROVIDER` og API-nøgle er sat (kun som Edge Function secrets).

## Brandvalg

Deploymentet bestemmer brandet via `VITE_BRAND_KEY`:

```
VITE_BRAND_KEY=autohuset-vest   # eller autohuset-v
```

Begge brands deployes som separate sites fra samme repo. Se `DEPLOYMENT.md` (leveres i Fase 6).

## Supabase

```bash
supabase link --project-ref <ref>
supabase db push        # kører migrations i supabase/migrations/
supabase db reset       # lokal: migrations + seed.sql (TESTDATA)
```

**Vigtigt:** Slå selvregistrering fra i Supabase Auth (kun invitationer) — `authenticated` betragtes som personale i RLS-politikkerne. Opret første admin i Dashboard og kør derefter:

```sql
select public.grant_admin('din@email.dk', 'autohuset-vest', 'dealer_admin');
```

## Scripts

`npm run dev` · `npm run build` · `npm run typecheck` · `npm run lint` · `npm test` · `npm run test:e2e`

## Dokumentation

Fuld README, ARCHITECTURE.md, DEPLOYMENT.md, ADMIN-GUIDE.md, API-INTEGRATION.md, TRACKING.md, LEGAL-CHECKLIST.md og SECURITY.md færdiggøres i Fase 6. Ingen secrets må committes — se `.env.example`.
