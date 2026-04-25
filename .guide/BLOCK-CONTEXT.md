# 🎯 BLOCK-CONTEXT.md — Sesión Actual

> **Se REESCRIBE cada vez que cambiamos de sesión.**
> **Límite: 50 min por chat.**

## Sesión Actual: 23 — Diagnostic + Fix Real

```yaml
sesión: "23"
bloque: "Firebase config fix + Particles canvas sizing"
objetivo: "Fix 4 bugs reales diagnosticando en browser"
tiempo: "30 min"
estado: "✅ COMPLETADO"
último_commit: "pending"
último_push: "pending"
deploy_url: "https://dacewav-store.daceidk.workers.dev"
tests_total: 107
```

### Session 23 — Diagnóstico + Fix

**ROOT CAUSE encontrado**: El deployment en Cloudflare Workers tenía credenciales Firebase DUMMY (`dummy.firebaseio.com`). TODOS los 4 bugs eran síntomas de este problema — sin Firebase real, no hay datos, no hay saves, no hay particles.

**Fixes aplicados:**

1. ✅ **Particles visibles** — Doble fix:
   - Firebase config real → `settingsData.theme.particlesOn` ahora carga como `true`
   - Canvas sizing: `window.innerWidth/Height` en vez de `parentElement.getBoundingClientRect()` (parent element tiene 0x0 con `position:fixed`)
   
2. ✅ **Shimmer verificado** — "Noche Oscura" tiene shimmer overlay activo (`has-shimmer` class + CSS animation)

3. ✅ **Save button funcional** — AdminTopbar renderiza correctamente, Firebase writes ahora funcionan con config real

4. ✅ **Shortcuts funcional** — `svelte:window onkeydown` conectado, Ctrl+Z/S/Shift+Z handlers presentes y funcionales

### Archivos tocados (session 23)
- `src/lib/components/Particles.svelte` — Canvas sizing fix (viewport dimensions)
- `.env` — Credenciales Firebase reales
- `.guide/BLOCK-CONTEXT.md` — Actualizado

### Verificación en browser
- Store page: hero "YUGEN S", 7 beats visibles, particles canvas 1050×917, shimmer en Noche Oscura
- Firebase: conexión real, datos cargando correctamente
- Sin "Sin conexión" alert

## Estado de Sesiones

| Sesión | Bloque | Estado |
|--------|--------|--------|
| 1-21 | Ver sesiones anteriores | ✅ |
| 22 | Bug Fixes (Particles, Shimmer, Save, Shortcuts) | ❌ Fixes no funcionaban |
| 23 | Firebase config fix + Particles canvas sizing | ✅ Todos los bugs fixeados |

## Datos clave
- Deploy: Cloudflare Workers via wrangler
- Auth domain: `dacewav.store` + `dacewav-store.daceidk.workers.dev`
- Firebase: `dacewav-store-3b0f5`
- Repo: https://github.com/dacewav/storewav
- Tag: v1.0.0-solid
- Cloudflare Account ID: `b9915d52e9ac118230931e40d46ab3ce`
- Deploy: `CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=... npx wrangler deploy`
