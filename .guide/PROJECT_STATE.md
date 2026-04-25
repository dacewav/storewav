# 🧠 PROJECT_STATE.md — Estado Rápido

> **Última actualización: 2026-04-26 05:09 (Session 29 — Presets + Soft Delete + Rules)**

```yaml
proyecto:      dacewav/store (storewav)
repo:          https://github.com/dacewav/storewav.git
framework:     SvelteKit 2 + Cloudflare Workers + Firebase RTDB
firebase:      dacewav-store-3b0f5
firebase_db:   https://dacewav-store-3b0f5-default-rtdb.firebaseio.com
sesiones:      29 completadas
commits:       42+
tests:         117 passing
build:         0 errors, 0 warnings (svelte-check limpio)
```

## Quick Status

| Área | Status | Detalle |
|------|--------|---------|
| .env | ✅ | Creado con credenciales reales |
| Build | ✅ | 0 errors, 0 warnings (svelte-check) |
| Tests | ✅ | 117 passing (Vitest) |
| Firebase conn | ✅ | Lectura + escritura OK (con UID aprobado) |
| Settings en DB | ✅ | Flat format, migration layer + flattenPath para writes |
| Beats en DB | ✅ | 7 beats con schema completo |
| Theme engine | ✅ | 95+ keys → CSS vars, accent, glow, fonts |
| Auth | ✅ | Google + anonymous + adminWhitelist + dev bypass |
| Card Style | ✅ | 8 secciones: Glow, Filtros, Borde, Sombra, Transform, Hover, Animación, Shimmer + 5 nuevas |
| Admin | ✅ | 12 páginas, 80+ controles, sliders reactivos, keyboard, preview, command palette |
| Schema mismatch | ✅ | RESUELTO: NESTED_TO_FLAT mapping + theme/ writes separados |
| Deploy | ⚠️ | Pages auto-deploy, Workers stale |

## Qué se hizo (resumen sesiones 1-28)

- ✅ Data layer completo (Firebase stores, CRUD, migration, undo/redo, offline queue)
- ✅ Hero section (glow, segments, eyebrow, gradient, stroke)
- ✅ Banner + Divider + Nav + Footer
- ✅ Theme engine (95+ keys → CSS vars, accent, glow, fonts, particles)
- ✅ Store page (hero, grid, filters, featured, wishlist, player, testimonials, CTA)
- ✅ Beat page (cover, waveform, licenses, platforms, related beats)
- ✅ Admin panel (12 páginas, 80+ controles)
- ✅ Beat editor (5 tabs: Info, Licencias, Media, Plataformas, Card Style)
- ✅ Auth (Google + anonymous + adminWhitelist + dev bypass)
- ✅ SEO (JSON-LD, OG tags, robots.txt, sitemap)
- ✅ A11y (aria-labels, focus-visible, reduced-motion, keyboard nav)
- ✅ Mobile responsive (bottom nav, touch-friendly sliders)
- ✅ Live preview (split view, nueva pestaña, mobile popup)
- ✅ Save system (auto-save, debounced batch, status animado, undo/redo)
- ✅ Command palette (Ctrl+K), keyboard shortcuts
- ✅ Onboarding tour (4 pasos)
- ✅ Admin theme toggle (dark/light)
- ✅ Color palette generator (11 shades + harmonies)
- ✅ Font preview (Google Fonts live)
- ✅ Logo upload + crop
- ✅ 117 tests (Vitest)
- ✅ **Schema mismatch resuelto** (NESTED_TO_FLAT mapping)
- ✅ **18 nuevas opciones de personalización** (Card Style + Tienda)

## Session 28 — Schema Fix + New Customization

### Schema mismatch fix (CRITICAL)
- Firebase rules esperan paths flat (`dividerTitle`, `heroTitle`, etc.)
- Código escribía paths anidados (`section.dividerTitle`, `hero.title`, etc.)
- Rules rechazaban writes → admin no podía guardar cambios
- **Fix**: `NESTED_TO_FLAT` mapping + `flattenSettingsPath()` + `isThemePath()` + `getThemeKey()`
- Theme/heroVisual/animations writes van a `theme/` path
- Settings writes van a `settings/` path con flat keys

### Nuevas opciones — Card Style (10)
- 🎭 Fondo de card (color + opacidad)
- 🔤 Tipografía título (tamaño, peso, color, alineación)
- 💰 Precio (tamaño, color)
- 🏷️ Tags (fondo, color, radio, tamaño)
- 🖼️ Imagen (aspect ratio, hover zoom, object fit)
- 📐 Layout (padding interno, fondo info)

### Nuevas opciones — Tienda (8)
- 🏠 Hero altura mínima (vh)
- 📝 Títulos sección (tamaño, peso, alineación, color)
- 🎨 Patrón fondo (dots, lines, grid + color + opacidad)
- 📏 Scrollbar (delgado + color)

### Dev mode admin access
- `auth.ts`: en modo `dev`, cualquier usuario autenticado es admin
- Permite acceso al admin sin necesidad de agregar UID a Firebase

## Pendientes conocidos

| Prioridad | Item | Detalle |
|-----------|------|---------|
| 🔴 | Workers stale | `dacewav-store.daceidk.workers.dev` corre código viejo |
| 🟡 | Beats sin cover images | 7 beats con `imageUrl: ""` |
| 🟡 | Brand name "YUGEN" | ¿Es correcto o debería ser "DACEWAV"? |
| ⚪ | GitHub Actions CI/CD | No configurado |
| ⚪ | PWA | No implementado |

## Commands útiles

```bash
# Build
cd storewav && npm run build

# Dev
npm run dev -- --host 0.0.0.0 --port 5173

# Tests
npm test

# Deploy
npx wrangler deploy

# Firebase settings
curl -s "https://dacewav-store-3b0f5-default-rtdb.firebaseio.com/settings.json" | python3 -m json.tool

# Firebase theme
curl -s "https://dacewav-store-3b0f5-default-rtdb.firebaseio.com/theme.json" | python3 -m json.tool

# Firebase beats
curl -s "https://dacewav-store-3b0f5-default-rtdb.firebaseio.com/beats.json"
```
