# 🎯 BLOCK-CONTEXT.md — Sesión Actual

> **Se REESCRIBE cada vez que cambiamos de sesión.**
> **Límite: 50 min por chat.**

## Sesión Actual: 22 — Bug Fixes (Particles, Shimmer, Save, Shortcuts)

```yaml
sesión: "22"
bloque: "Bug Fixes — Particles + Shimmer + Admin UX"
objetivo: "Fix particles, shimmer design, save button, keyboard shortcuts"
tiempo: "50 min"
estado: "EN PROGRESO — FIXES NO FUNCIONAN EN PRODUCCIÓN"
último_commit: "e0ff759"
último_push: "e0ff759"
deploy_url: "https://dacewav-store.daceidk.workers.dev"
tests_total: 107
```

### Session 22 — Lo que se intentó (NO VERIFICADO EN PRODUCCIÓN)

**⚠️ IMPORTANTE: Los fixes fueron commiteados y deployed pero el usuario confirma que NO funcionan.**

1. ❌ **Particles no visibles** — Se fixeó migration + reactive $effect, pero NO funciona
   - Fix intentado: merge `_theme` en `d.theme` en `migrateOldData()`
   - Fix intentado: $effect separado que re-init particles al cambiar props
   - **Resultado**: usuario dice que siguen sin verse
   - **Posible causa real**: el data flow `settings.theme.particlesOn` → `settingsData?.theme?.particlesOn` puede no estar conectado correctamente. Verificar con datos reales de Firebase.

2. ❌ **Shimmer diseño** — Se mejoró CSS, pero NO verificado
   - Fix intentado: gradiente más ancho (20%-80%), opacidad más alta (0.08-0.2)
   - Fix intentado: CSS custom properties (--shimmer-color, --shimmer-duration)
   - **Resultado**: no verificado por usuario

3. ❌ **Save button** — Se cambió `onSave={() => {}}` a mostrar toast
   - **Resultado**: usuario dice que no hay botón de guardar ni autoguardado
   - **Posible causa real**: el topbar puede no estar visible, o el toast no se muestra

4. ❌ **Shortcuts** — Se agregó Ctrl+S
   - **Resultado**: usuario dice que no funcionan
   - **Posible causa real**: el `svelte:window onkeydown` puede no estar capturando eventos

### Qué hacer en la próxima sesión

**REGLA: Verificar CADA fix en el navegador ANTES de marcar como completado.**

1. **Diagnosticar primero**: abrir admin en browser, verificar qué se ve
2. **Particles**: verificar si `settingsData.theme.particlesOn` es `true` cuando se activa
3. **Shimmer**: verificar si algún beat tiene `shimmer: true` en su cardStyle
4. **Save**: verificar si el topbar se muestra y si el toast aparece
5. **Shortcuts**: verificar si `handleKeydown` se ejecuta
6. **NO marcar ✅ sin confirmar visualmente en el browser**

### Archivos tocados (session 22)
- `src/lib/components/Particles.svelte` — rewrite completo
- `src/lib/components/BeatCard.svelte` — shimmer CSS
- `src/lib/stores/settings.ts` — migration merge theme
- `src/routes/(admin)/+layout.svelte` — shortcuts, onSave
- `.guide/AUDIT-MASTER.md` — actualizado a v3

## Estado de Sesiones

| Sesión | Bloque | Estado |
|--------|--------|--------|
| 1-21 | Ver sesiones anteriores | ✅ |
| 22 | Bug Fixes (Particles, Shimmer, Save, Shortcuts) | ❌ Fixes no funcionan |

## Siguiente Sesión: Diagnosticar + Fix Real

```yaml
sesión: "23"
bloque: "Diagnosticar bugs reales en browser"
objetivo: "Abrir admin, verificar qué está roto, fixear con evidencia visual"
estado: "PENDIENTE"
```

### Protocolo para sesión 23
1. **NO codear nada** hasta verificar en el browser
2. Abrir admin → Theme → activar particles → verificar en store
3. Abrir admin → beats → verificar save button, auto-save, shortcuts
4. Verificar shimmer en store con un beat que tenga shimmer activo
5. Documentar qué ESTÁ roto vs qué FUNCIONA
6. Recién ahí fixear

### Datos clave
- Deploy: Cloudflare Workers via wrangler
- Auth domain: `dacewav.store` + `dacewav-store.daceidk.workers.dev`
- Firebase: `dacewav-store-3b0f5`
- Repo: https://github.com/dacewav/storewav
- Tag: v1.0.0-solid
