# 🧠 PROJECT_STATE.md — Estado Rápido

> **Última actualización: 2026-04-26 11:36 (Session 42 — Visual Overhaul + Emoji Fix + Store Layout)**

```yaml
proyecto:      dacewav/store (storewav)
repo:          https://github.com/dacewav/storewav.git
framework:     SvelteKit 2 + Cloudflare Workers + Firebase RTDB
firebase:      dacewav-store-3b0f5
firebase_db:   https://dacewav-store-3b0f5-default-rtdb.firebaseio.com
sesiones:      42 completadas
commits:       64+
tests:         134 passing
build:         0 errors, 0 warnings (svelte-check: 0 errors, 13 warnings)
último_commit: "8ca48f9"

## Quick Status

| Área | Status | Detalle |
|------|--------|---------|
| .env | ✅ | Credenciales reales configuradas |
| Build | ✅ | 0 errors, 0 warnings |
| Tests | ✅ | 134 passing (Vitest) |
| svelte-check | ✅ | 0 errors, 13 warnings |
| Firebase conn | ✅ | Lectura + escritura OK |
| Settings en DB | ✅ | Flat format, migration layer |
| Beats en DB | ✅ | 9 beats con schema completo |
| Theme engine | ✅ | 95+ keys → CSS vars |
| Auth | ✅ | Google + anonymous + adminWhitelist + dev bypass |
| Card Style | ✅ | 8 presets + sibling hover customization |
| Admin | ✅ | 20 páginas, 100+ controles |
| Media Gallery | ✅ | Upload, grid, assign to beats |
| Feature Toggles | ✅ | 11 features toggleables |
| Changelog | ✅ | Historial de cambios con Firebase |
| Custom Emojis | ✅ | CRUD + reactive picker + live preview |
| Theme Presets | ✅ | Save/load/delete/rename |
| Soft Delete | ✅ | Trash + restore + permanent delete |
| Deploy Pages | ✅ | Auto-deploy desde Git push |
| Deploy Workers | ⚠️ | Workflow creado, falta agregar manual + secrets |
| Waveform | ✅ | Gradient + glow + breathing + organic heights |
| Player | ✅ | Mini waveform + skip ±10s + gradient progress |
| Page Transitions | ✅ | View Transitions API (fade/scale) |
| Store Layout | ✅ | Genre tabs + show more + back-to-top |
| Beat Grid | ✅ | Equal 3-column layout (fixed) |

## Session 42 — What Changed

### Visual Overhaul
- **Waveform**: gradient active bars, glow at cursor, breathing animation, organic sine-based heights
- **Player**: mini waveform (20 bars), skip ±10s, gradient progress bar, pulsing glow, track transitions
- **Beat Cards**: organic waveform bars with gradient + drop-shadow
- **Beat Detail**: parallax cover, stagger license grid, enhanced selected glow
- **Page Transitions**: View Transitions API with fade/scale

### Emoji System Fix
- Reactive picker: re-opens when emojis load from Firebase
- Preview shows shortcodes even before emojis load (pending state)
- `findEmojiQuery` rewritten — fixes back-to-back shortcode edge cases
- Picker shows "no emojis" / "no results" states

### Store Layout
- **Genre Tabs**: visible genre buttons with counts, click to filter
- **Show More**: beats batched in groups of 8, "Mostrar más" + "Mostrar todos"
- **Back to Top**: floating button after 600px scroll
- **Grid Fix**: forced `repeat(3, 1fr)` — equal column widths
- **Featured excluded**: no duplicates between featured section and main grid

## Admin Pages (20)

1. Dashboard (stats, seed, export/import)
2. Beats (CRUD, bulk, filters, reorder, trash)
3. Beat Editor (Info, Licenses, Media, Plataformas, Card Style)
4. Hero (text, glow, stroke, eyebrow, gradient, segments)
5. Contenido (site name, slogan, about, contact)
6. Links (social, store, brand, legal)
7. Testimonios (CRUD, toggle)
8. Tema (colors, glow, typography, borders, presets)
9. Card Style (8 presets + 8 secciones + sibling hover)
10. Brand (logo upload, favicon, name, slogan)
11. Banner (toggle, text, colors, position)
12. Layout (container, padding, gap, radius, pattern)
13. Animaciones (logo, cards, buttons, player, title, waveform)
14. Floating (CRUD, 5 animations, responsive)
15. Media (upload, grid, assign to beats)
16. Features (11 toggle switches)
17. Changelog (history with filters)
18. Emojis (CRUD, shortcode copy)
19. Hero Visual (glow, stroke, segments)
20. Content sections

## Pendientes conocidos

| Prioridad | Item | Detalle |
|-----------|------|---------|
| 🟡 | Firebase rules | Rules actualizadas con gallery/ y changelog/ — falta deploy |
| 🟡 | GitHub secrets | Configurar en GitHub UI |
| 🟡 | Admin animation previews | Preview en vivo de cada animación en admin/animations |
| 🟡 | Theme live preview | Panel de preview en admin/theme |
| 🟢 | Hover sound effects | Opcional, toggleable |
| 🟢 | Beat grid sin audio | Primeros 7 beats no tienen audio |
| 🟢 | PWA | No implementado |

## Commands útiles

```bash
cd ~/.openclaw/workspace/storewav

# Build
npm run build

# Dev
npm run dev -- --host 0.0.0.0 --port 5173

# Tests
npm test

# svelte-check
npx svelte-check

# Deploy Workers
npx wrangler deploy

# Firebase
curl -s "https://dacewav-store-3b0f5-default-rtdb.firebaseio.com/settings.json" | python3 -m json.tool
curl -s "https://dacewav-store-3b0f5-default-rtdb.firebaseio.com/beats.json"
```
