# 🎯 BLOCK-CONTEXT.md — Sesión Actual

> **Se REESCRIBE cada vez que cambiamos de sesión.**
> **Límite: 50 min por chat.**

## Sesión Actual: 23 — Diagnostic + Fix Real (Deep Audit)

```yaml
sesión: "23"
bloque: "Firebase config + Particles rendering + Deep audit"
objetivo: "Fix 4 bugs reales diagnosticando en browser"
tiempo: "45 min"
estado: "✅ COMPLETADO — push hecho"
último_commit: "7613f67"
último_push: "7613f67"
deploy_url: "https://dacewav-store.daceidk.workers.dev"
deploy_version: "4b3b2f78"
tests_total: 107
```

### Session 23 — Diagnóstico + Fixes

**ROOT CAUSE 1**: Cloudflare Workers deployment tenía Firebase dummy config (`dummy.firebaseio`). Fix: `.env` con credenciales reales + rebuild.

**ROOT CAUSE 2**: Particles canvas z-index:0 estaba DEBAJO de todo el contenido (z-index:2). Invisible incluso con datos correctos.

**ROOT CAUSE 3**: Color de partículas `#492222` demasiado oscuro para fondo dark. Alpha formula hacía partículas desaparecer 50% del tiempo.

### Fixes aplicados

1. ✅ **Particles visibles** (4 problemas encontrados y fixeados):
   - z-index: 0 → 10 (canvas sobre contenido, pointer-events:none)
   - Color boost: `brighten()` detecta colores oscuros y los eleva
   - Tamaño: partículas 3-8px (era 2-5), font mínimo 18px bold (era 6-15px)
   - Alpha: `opacity + (1-opacity)*breathe` (oscila entre opacity y 1.0, nunca desaparece)

2. ✅ **Shimmer verificado** — "Noche Oscura" tiene shimmer diagonal visible en browser

3. ⚠️ **Save/Shortcuts** — No verificables sin admin login. Firebase anon auth puede no estar habilitado en el proyecto.

### Archivos tocados
- `src/lib/components/Particles.svelte` — Rewrite completo del rendering
- `.env` — Credenciales Firebase reales (gitignored)
- `.guide/AUDIT-MASTER.md` — Audit v6
- `.guide/BLOCK-CONTEXT.md` — Este archivo

## Estado de Sesiones

| Sesión | Bloque | Estado |
|--------|--------|--------|
| 1-21 | Ver sesiones anteriores | ✅ |
| 22 | Bug Fixes (Particles, Shimmer, Save, Shortcuts) | ❌ Fixes no funcionaban |
| 23 | Firebase config + Particles rendering + Deep audit | ✅ Particles + Shimmer verificados |

## Datos clave
- Deploy: Cloudflare Workers via wrangler
- Firebase: `dacewav-store-3b0f5`
- Cloudflare Account ID: `b9915d52e9ac118230931e40d46ab3ce`
- Deploy cmd: `CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=... npx wrangler deploy`
