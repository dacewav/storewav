# DACEWAV.STORE — SESIÓN 67
> Repo: https://github.com/dacewav/storewav
> Stack: SvelteKit 2 + Svelte 5 + Firebase RTDB + Cloudflare Pages + R2 + TypeScript


Lee MEMORY.md y memory/2026-05-10.md para contexto completo.


Resumen de Session 66:

Fix kits store init (subscribeFirebase missing en init.ts — root cause de "0 kits")
Fix sample duration: WAV header parsing + MP3 estimation from file size
Fix MIME type detection: extension → MIME map (was hardcoded audio/mpeg)
Fix cart link for kits: /beat/kit-{id} → /kit/{id}
Clean debug logging en kit-image endpoint
Add createKitWithId() al store de kits
Add 15 tests nuevos para kits store
Full browser testing: admin CRUD, store, detail, cart, toggle active, mobile 375px
1 commit, 243 tests, 0 errors

Objetivo Session 67:

1.Deploy Firebase rules — firebase deploy --only database (las rules están reescritas desde session 65 pero NUNCA se deployearon)
2.Test real uploads — imagen a R2 (kit-image endpoint) y ZIP con audio real (kit-zip endpoint con duración)
3.Refinar kit detail page — ¿necesita algo más? (waveform, preview player mejorado, related kits)
4.Admin kits refactor — usar createKitWithId/updateKit/deleteKit del store en vez de direct REST calls
5.Si hay tiempo: testing de edge cases de WAV duration (headers no estándar, WAV comprimido)

Arrancar: npm install → npm run dev → login anónimo → deploy rules → probar uploads reales


Constraints: Svelte 5, 0 TS errors, 243+ tests, browser test después de cada cambio.
