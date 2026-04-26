# 🧠 PROJECT_STATE.md — Estado Rápido

> **Última actualización: 2026-04-26 08:00 (Session 38 — MEGA-REBUILD-PLAN completo)**

```yaml
proyecto:      dacewav/store (storewav)
repo:          https://github.com/dacewav/storewav.git
framework:     SvelteKit 2 + Cloudflare Workers + Firebase RTDB
firebase:      dacewav-store-3b0f5
firebase_db:   https://dacewav-store-3b0f5-default-rtdb.firebaseio.com
sesiones:      38 completadas
commits:       51+
tests:         117 passing
build:         0 errors, 0 warnings (svelte-check: 0 errors, 8 warnings)
```

## Quick Status

| Área | Status | Detalle |
|------|--------|---------|
| .env | ✅ | Credenciales reales configuradas |
| Build | ✅ | 0 errors, 0 warnings |
| Tests | ✅ | 117 passing (Vitest) |
| svelte-check | ✅ | 0 errors, 8 warnings |
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
| Custom Emojis | ✅ | CRUD con Firebase |
| Theme Presets | ✅ | Save/load/delete/rename |
| Soft Delete | ✅ | Trash + restore + permanent delete |
| Deploy Pages | ✅ | Auto-deploy desde Git push |
| Deploy Workers | ⚠️ | Workflow creado, falta agregar manual + secrets |

## Admin Pages (20)

1. Dashboard (stats, seed, export/import)
2. Beats (CRUD, bulk, filters, reorder, trash)
3. Beat Editor (Info, Licencias, Media, Plataformas, Card Style)
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
15. **Media** (NUEVO — upload, grid, assign to beats)
16. **Features** (NUEVO — 11 toggle switches)
17. **Changelog** (NUEVO — history with filters)
18. **Emojis** (NUEVO — CRUD, shortcode copy)
19. Hero Visual (glow, stroke, segments)
20. Content sections

## MEGA-REBUILD-PLAN — Estado

| Session | Features | Estado | Commit |
|---------|----------|--------|--------|
| 1 | Theme Presets + Soft Delete | ✅ | Pre-existente |
| 2 | Floating Elements + Scroll Nav | ✅ | Pre-existente |
| 3 | Cursor Glow + Scroll Progress | ✅ | Pre-existente |
| 4 | Media Gallery | ✅ | `cb6ee26` |
| 5 | Card Style Presets + Sibling Hover | ✅ | `77adacd` |
| 6 | Feature Toggles + Changelog | ✅ | `18c0af9` |
| 7 | Custom Emojis | ✅ | `dda2bcd` |
| 8 | Dead Code Cleanup + Type Fixes | ✅ | `b24130a` |

## Pendientes conocidos

| Prioridad | Item | Detalle |
|-----------|------|---------|
| 🔴 | Subir audio/cover | 9 beats sin media — subir desde admin |
| 🔴 | GitHub Action | Agregar workflow manual + secrets |
| 🟡 | Firebase rules | Deploy rules para paths nuevos (themePresets, gallery, etc.) |
| 🟡 | Hero glow default | Color negro → cambiar a accent |
| ⚪ | Stats productores | Contar artistas únicos |
| ⚪ | PWA | No implementado |

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
