# Nummerplade-API-integration

## Arkitektur

Provider-uafhængig (spec pkt. 11). Klienten kender kun den normaliserede model — leverandøren kan skiftes uden ændringer i brugerfladen.

```
Klient (StepPlate) → Edge Function plate-lookup → provider (mock | kommerciel leverandør)
                                        │
                                        └── vehicle_lookup_logs (hashet plade + IP, status, svartid)
```

- **Interface:** `VehicleLookupProvider` og `NormalizedVehicleLookupResult` i `src/features/plate-lookup/types.ts` (klient) og tilsvarende i `supabase/functions/plate-lookup/index.ts` (server).
- **Mock-provider:** deterministisk, markeret `isMock: true`, vises som "DEMO-MODE" i UI. Plader der starter med `XX` simulerer "ikke fundet". Løsningen foregiver ALDRIG, at et rigtigt registeropslag er gennemført.
- **Sikkerhed:** API-nøglen findes kun som Supabase function secret. Rate limit: 5 opslag/minut og 20/time pr. IP (autoritativt server-side, baseret på hashede IP'er i loggen). Timeout 8 s, 1 retry. Feature flag: `VEHICLE_LOOKUP_ENABLED=false` slår opslag fra (UI falder tilbage til manuel indtastning).

## Sådan tilsluttes en rigtig leverandør

1. **Vælg leverandør** ud fra kriterierne i `docs/PLAN-06-EKSTERNE-KONTI.md` (datadækning, kommercielle brugsrettigheder, databehandleraftale, hvad der må lagres og hvor længe, om data må bruges til leadgenerering, pris, rate limits, testmiljø). Kandidattyper: MotorAPI, NummerpladeAPI, TjekBil API, Synsbasen API m.fl. **Vælg ikke alene ud fra pris.**
2. **Sæt secrets:**
   ```bash
   supabase secrets set VEHICLE_LOOKUP_PROVIDER=<navn> \
     VEHICLE_LOOKUP_API_URL=https://api.leverandor.dk/v1/vehicles \
     VEHICLE_LOOKUP_API_KEY=<nøgle>
   ```
3. **Tilpas feltmapningen** i `httpProviderLookup()` i `supabase/functions/plate-lookup/index.ts` til leverandørens svarformat (markeret med TODO). Autentificering (Bearer/header/query) tilpasses samme sted.
4. **Rå leverandørdata** (`rawProviderData`) gemmes kun i `lead_vehicle_snapshots`, hvis leverandørens licens tillader det — fjern feltet fra mapningen, hvis ikke.
5. **Genudrul:** `supabase functions deploy plate-lookup`.

Der hentes og vises aldrig private ejeroplysninger — kun tekniske køretøjsdata.

# E-mailintegration

Adapter i `supabase/functions/_shared/email.ts`: `mock` (logger til konsol), `resend`, `postmark`. Vælges med `EMAIL_PROVIDER` + `EMAIL_API_KEY` + `EMAIL_FROM_ADDRESS` (verificér afsenderdomæne med SPF/DKIM hos leverandøren). Alle afsendelser logges i `email_logs` med status, provider-ID, fejl og forsøg. Leadmodtager pr. brand: `brands.lead_email` (fallback: `ADMIN_LEAD_EMAIL`-secret). Store billeder vedhæftes aldrig — forhandleren ser dem via signerede links i adminpanelet.
