# 🎯 BLOCK-CONTEXT.md — Sesión Actual

> **Se REESCRIBE cada vez que cambiamos de sesión.**
> **Límite: 50 min por chat.**

## Sesión Actual: 28 — Schema Fix + New Customization Options

```yaml
sesión: "28"
bloque: "Firebase schema mismatch fix + 18 nuevas opciones de personalización"
objetivo: "Fix writes a Firebase, agregar controles de Card Style y Tienda"
tiempo: "~60 min"
estado: "✅ COMPLETADO — pending push"
último_commit: "pending"
tests_total: 117
svelte_check: "0 errors, 0 warnings"
```

### Session 28 — Resumen

**Fix crítico: Schema mismatch**
- Firebase rules esperan flat keys, código escribía nested paths
- `NESTED_TO_FLAT` mapping: ~70 paths mapeados
- `isThemePath()`: theme/heroVisual/animations van a `theme/`
- `getThemeKey()`: convierte `heroVisual.glowOn` → `heroGlowOn`
- Batch writes separados: settings + theme por separado
- Flush pending writes también usa flat paths

**Nuevas opciones Card Style (10)**
- Fondo card (color + opacidad)
- Tipografía título (size, weight, color, align)
- Precio (size, color)
- Tags (bg, color, radius, size)
- Imagen (aspect ratio, hover zoom, object fit)
- Layout (padding, info bg)

**Nuevas opciones Tienda (8)**
- Hero min-height (vh slider)
- Section titles (size, weight, align, color)
- Background pattern (dots/lines/grid + color + opacity)
- Scrollbar (thin + color)

**Dev mode admin bypass**
- `auth.ts`: en dev, cualquier usuario autenticado es admin
- Futuros chats: login anónimo → acceso directo al admin

**Archivos modificados**
- `src/lib/stores/settings.ts` — NESTED_TO_FLAT, isThemePath, getThemeKey, flushBatch, flushPendingWrites, CLAMP_MAP, ThemeSettings, LayoutSettings, DEFAULT
- `src/lib/cardStyleEngine.ts` — CardStyleConfig + 7 funciones CSS
- `src/lib/components/BeatCard.svelte` — imports + computed styles + template
- `src/lib/components/CardStyleEditor.svelte` — 5 nuevas secciones UI
- `src/routes/(admin)/admin/theme/+page.svelte` — 4 nuevas Cards (Hero, Títulos, Fondo, Scrollbar)
- `src/routes/(store)/+page.svelte` — heroMinHeight, sectionTitleStyle
- `src/routes/(store)/+layout.svelte` — bgPattern, scrollbar CSS
- `src/lib/stores/auth.ts` — dev mode bypass
- `.guide/PROJECT_STATE.md` — actualizado

## Estado de Sesiones

| Sesión | Bloque | Estado |
|--------|--------|--------|
| 1-27 | Anteriores | ✅ |
| 28 | Schema fix + new customization | ✅ pending push |

## Datos clave
- Deploy: Cloudflare Pages auto-deploy desde Git push
- Firebase: `dacewav-store-3b0f5`
- Cloudflare Account ID: `b9915d52e9ac118230931e40d46ab3ce`
- Admin access: dev mode bypass (cualquier usuario autenticado)
