# 🧠 PROJECT_STATE.md — Estado Rápido

> **Última actualización: 2026-04-25 02:19 (Deep Audit v2)**

```yaml
proyecto:      dacewav/store (storewav)
repo:          https://github.com/dacewav/storewav.git
framework:     SvelteKit 2 + Cloudflare Workers + Firebase RTDB
firebase:      dacewav-store-3b0f5
firebase_db:   https://dacewav-store-3b0f5-default-rtdb.firebaseio.com
sesiones:      15 planificadas (~50 min c/u)
sesión_actual: 9 (Bloque 3A — Connection State + Error Resilience)
commits:       35
```

## Quick Status

| Área | Status | Detalle |
|------|--------|---------|
| .env | ⚠️ | Template existe, falta copia con credenciales reales |
| Build | ✅ | 0 code errors, 0 warnings (svelte-check limpio) |
| Firebase conn | ✅ | Lectura OK, escritura requiere admin |
| Settings en DB | ✅ | Formato flat (viejo), migration layer OK |
| Beats en DB | ❌ | `null` — vacío |
| Theme engine | ✅ | accent, glow, fonts desde Firebase |
| Auth | ✅ | Google login + adminWhitelist |
| Rules deployadas | ✅ | 1391 líneas, restauradas |
| Schema mismatch | ✅ | Resuelto: code alineado con rules |
| Hydration bug | ✅ | **RESOLVIDO** — fix `ssr = false` listo, necesita deploy |
| Deploy | ⚠️ | Chunks viejos en Workers — ejecutar `npx wrangler deploy` |

## Qué se hizo (sesiones 1-8)

- ✅ Data layer (Firebase stores, CRUD, migration)
- ✅ Hero section (glow, segments, eyebrow, gradient)
- ✅ Banner + Divider + Nav
- ✅ Theme store reescrito (single source of truth)
- ✅ Root layout limpio
- ✅ fontSize fix, CSS vars px suffix
- ✅ BeatEditor auto-save reactivo
- ✅ Dashboard con allBeatsList
- ✅ .env creado, build OK
- ✅ Rules deployadas restauradas
- ✅ Todo pusheado a GitHub
- ✅ **Mismatch code↔rules resuelto** (title→name, coverUrl→imageUrl, createdAt→date, licenses restructured, platforms flattened)
- ✅ **Audit profundo sesión 8** — 0 errores, 0 warnings, Svelte 5 runes correctos
- ✅ **Hydration bug identificado** — deploy viejo, fix listo

## ✅ Bloque 2A — CERRADO

1. ✅ Deploy con wrangler — hydration fix live
2. ✅ svelte-check: 0 errores
3. ✅ Guide actualizado
4. ✅ Push a GitHub

## ✅ Bloque 2B — CERRADO

1. ✅ Plays counter: incrementPlay() throttled 30s
2. ✅ Toast wiring: CRUD, wishlist, upload, seed, import
3. ✅ Plays display: BeatCard badge + admin column
4. ✅ Analytics: play + wishlist events tracked
5. ✅ Deploy + push

## ✅ Bloque 3A — CERRADO

1. ✅ Connection store (Firebase `.info/connected` + `navigator.onLine`)
2. ✅ OfflineBanner component (fixed bottom, dismissable)
3. ✅ Retry logic en beats CRUD (1x retry on network error)
4. ✅ Retry logic en settings updateField
5. ✅ Skeleton loading en admin beats list + dashboard
6. ✅ Deploy + push

## 🔴 AUDIT v2 — 2026-04-25 (25 findings)

### Bugs Críticos (2)
1. **`effect_update_depth_exceeded`** — `(admin)/+layout.svelte:37`: `$effect` lee+escribe `lastStatus` → loop infinito. Fix: `untrack()`.
2. **XSS `{@html dividerTitle}`** — `(store)/+page.svelte:248`: HTML crudo desde Firebase sin sanitizar.

### Bugs Altos (4)
3. BeatEditor `$effect` lee+escribe `autoSaveTimer` → mismo patrón peligroso
4. Bulk operations sin try/catch (4 funciones)
5. `confirmDelete` sin try/catch
6. `undoField`/`redoField` sin error handling

### Bugs Medios (11)
7. `$app/stores` deprecated en beat/[id]
8. `as any` bypass en Icon name
9. `getComputedStyle` por cada BeatCard
10. `JSON.stringify(beat)` como effect trigger
11. 14× `Record<string, any>` en vez de tipos propios
12. No offline write queue
13. Mobile overlay `onkeydown` vacío
14. Delete modals sin keyboard handler
15. Import errors solo console.log
16. Per-card `$effect` para shared data
17. No lazy loading admin pages

### Bugs Bajos (8)
18-25. alt vacío, aria-pressed, keyframes no usados, dead code, version mismatch, etc.

**Fix priority: Session 0 en SOLIDIFICATION-PLAN.md**

## 🔴 Qué falta — Bloque 3B (Beat Editor)

1. Beat editor: upload de archivos real (Firebase Storage)
2. Beat editor: validación de campos obligatorios
3. Beat editor: preview de audio inline
4. Beat editor: drag & drop para reordenar imágenes
5. Beat editor: auto-save indicator en tiempo real

## Commands útiles

```bash
# Build
cd storewav && npm run build

# Deploy
npx wrangler deploy

# Firebase beats
curl -s "https://dacewav-store-3b0f5-default-rtdb.firebaseio.com/beats.json"

# Firebase settings
curl -s "https://dacewav-store-3b0f5-default-rtdb.firebaseio.com/settings.json" | python3 -m json.tool
```
