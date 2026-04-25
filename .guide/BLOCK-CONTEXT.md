# 🎯 BLOCK-CONTEXT.md — Sesión Actual

> **Se REESCRIBE cada vez que cambiamos de sesión.**
> **Límite: 50 min por chat.**

## Sesión Actual: 24 — Particles z-index + Admin bugs

```yaml
sesión: "24"
bloque: "Particles z-index fix"
objetivo: "Fix particles z-index, verify in browser, deploy"
tiempo: "50 min"
estado: "✅ FIX COMPLETADO — deploy hecho, verificado en browser. Push pendiente (sin GitHub token)."
último_commit: "53b4dbb"
último_push: "PENDIENTE — commit local hecho, falta push"
deploy_url: "https://dacewav-store.daceidk.workers.dev"
deploy_version: "70ab5c42"
tests_total: 107
```

### Session 24 — Resultados

**Particles z-index**: ✅ FIXEADO — z-index cambiado de `10` a `var(--z-orbs)` (1). Particles ahora renderizan DEBAJO del contenido (nav, hero, cards, footer) pero encima del fondo. Verificado en browser post-deploy.

### Bug #1: Particles z-index

**PROBLEMA**: Canvas de partículas tenía `z-index: 10`, por encima de todo el contenido (z-index: 2 = `--z-content`).

**FIX**: Cambiar `z-index: 10` → `z-index: var(--z-orbs)` (= 1). Jerarquía z-index del proyecto:
```
--z-base: 0     (fondo)
--z-orbs: 1     (orbs + particles) ← AQUÍ
--z-content: 2  (texto, cards, nav)
--z-nav: 100
--z-player: 500
```

**VERIFICADO**: Browser screenshot post-deploy muestra partículas como dots sutiles detrás de todo el contenido. Nav, hero, cards y footer están por encima.

### Siguiente sesión: bugs restantes
- 🟡 **Save button** — no verificado, requiere admin login
- 🟡 **Shortcuts (Ctrl+S/Z)** — no verificados, requiere admin login
- 🟡 **Admin auth** — "Permission denied" al revisar adminWhitelist. Posible fix: habilitar Anonymous Auth en Firebase Console.
- ⬜ **Push pendiente** — falta GitHub token para pushear commit `53b4dbb`

### Archivos tocados
- `src/lib/components/Particles.svelte` — z-index: 10 → var(--z-orbs)
- `.env` — Credenciales Firebase (extraídas del deploy, gitignored)

## Estado de Sesiones

| Sesión | Bloque | Estado |
|--------|--------|--------|
| 1-21 | Ver sesiones anteriores | ✅ |
| 22 | Bug Fixes (Particles, Shimmer, Save, Shortcuts) | ❌ Fixes no funcionaban |
| 23 | Firebase config + Particles rendering + Deep audit | ✅ Particles + Shimmer verificados |
| 24 | Particles z-index fix | ✅ Fix verificado en browser. Push pendiente. |

## Datos clave
- Deploy: Cloudflare Workers via wrangler
- Firebase: `dacewav-store-3b0f5`
- Cloudflare Account ID: `b9915d52e9ac118230931e40d46ab3ce`
- Deploy cmd: `CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=... npx wrangler deploy`
