# 🧠 PROJECT_STATE.md — Estado Rápido

> **Última actualización: 2026-04-26 23:02 (Session 44 — Emoji Fix + FileUpload + Presets + Animations)**

```yaml
proyecto:      dacewav/store (storewav)
repo:          https://github.com/dacewav/storewav.git
framework:     SvelteKit 2 + Cloudflare Workers + Firebase RTDB
firebase:      dacewav-store-3b0f5
firebase_db:   https://dacewav-store-3b0f5-default-rtdb.firebaseio.com
sesiones:      44 (continuar en sesión 45)
commits:       72
tests:         134 passing
build:         0 errors, 25 warnings (svelte-check: 0 errors, 25 warnings)
último_commit: "4cb673c"

## Quick Status

| Área | Status | Detalle |
|------|--------|---------|
| .env | ✅ | Credenciales reales configuradas |
| Build | ✅ | 0 errors, 0 warnings |
| Tests | ✅ | 134 passing (Vitest) |
| svelte-check | ✅ | 0 errors, 25 warnings |
| Firebase conn | ✅ | Lectura + escritura OK |
| Settings en DB | ✅ | Flat format, migration layer |
| Beats en DB | ✅ | 9 beats con schema completo |
| Theme engine | ✅ | 95+ keys → CSS vars |
| Auth | ✅ | Google + anonymous + adminWhitelist + dev bypass |
| Card Style | ✅ | **17 presets** (8 originales + 9 premium del catalog) |
| Admin | ✅ | 20 páginas, 100+ controles |
| Media Gallery | ✅ | Upload, grid, assign to beats |
| Feature Toggles | ✅ | 11 features toggleables |
| Changelog | ✅ | Historial de cambios con Firebase |
| Custom Emojis | ✅ | CRUD + reactive picker + **click fix funcionando** |
| Theme Presets | ✅ | Save/load/delete/rename |
| Soft Delete | ✅ | Trash + restore + permanent delete |
| Deploy Pages | ✅ | Auto-deploy desde Git push |
| Deploy Workers | ⚠️ | Workflow creado, falta agregar manual + secrets |
| Waveform | ✅ | Gradient + glow + breathing + organic heights |
| Player | ✅ | Mini waveform + skip ±10s + gradient progress |
| Page Transitions | ✅ | View Transitions API (fade/scale) |
| Store Layout | ✅ | Genre tabs + show more + back-to-top |
| Beat Grid | ✅ | Equal 3-column layout (fixed) |
| Banner | ✅ | **NUEVO: bgImage + FileUpload + opacity + preview** |
| Floating | ✅ | **NUEVO: FileUpload para tipo imagen** |
| Animations | ✅ | **18 animaciones** (9 originales + 8 nuevas del catalog) |
| Emoji Picker | ✅ | **FIX: click funciona, inputValue local independiente de Firebase** |

## Session 44 — What Changed

### Emoji System Fix (CRITICAL)
- **Root cause**: Firebase writes fail for anonymous users (PERMISSION_DENIED), store value never updates, Svelte re-renders revert DOM
- **Fix**: EmojiInput manages own `inputValue` state, independent from parent's Firebase-derived `value` prop
  - textarea/input binds to `inputValue` (local state)
  - Parent → local sync only when input is NOT focused
  - Local → parent sync via `oninput` callback
  - `handleSelect` reads from DOM directly (`inputEl.value`)
  - Debounce 150ms prevents double-fire from `onpointerdown` + `onclick`
  - `isSelecting` flag prevents blur race condition
- **EmojiPicker**: `onpointerdown` + `onclick` fallback (was only `onmousedown`)

### FileUpload Additions
- **Floating elements**: `FileUpload` for image type (was URL-only text input)
- **Banner**: new `bgImage` field with `FileUpload` + opacity slider + live preview
- **Banner store**: renders bg image with overlay blending
- **BannerSettings type**: added `bgImage` + `bgImageOpacity` fields

### Premium Presets (Catalog Parity)
- Added 9 presets from catalog: Noir, Brasa, Escarcha, Holo, Flota, Eco, Pop, Abismo
- Total: **17 presets** (was 8)
- Each configures: glow, filters, border, shadow, hover, animation

### New Animations
- Added 8: wobble, jello, heartbeat, breathe, drift, pop, swing, tada
- Total: **18 animations** (was 10)
- Keyframes + CSS classes in store layout

### Settings Store
- BannerSettings: `bgImage` + `bgImageOpacity` fields + defaults

## Pendientes conocidos

| Prioridad | Item | Detalle |
|-----------|------|---------|
| 🟡 | Firebase rules | Rules actualizadas — falta deploy desde Firebase Console |
| 🟡 | GitHub secrets | 9 secrets necesarios para Workers deploy |
| 🔴 | Beats sin audio | 11/11 beats sin audioUrl, solo 1 con previewUrl |
| 🟢 | Hover sound effects | Opcional, toggleable |
| 🟢 | PWA | No implementado |
| 🟡 | Animation intensity | Sistema `--anim-int: 0-1` para controlar fuerza por card |
| 🟡 | Animaciones secundarias | `anim2-*` para pseudo-elements |
| 🟢 | Parámetros editables anim | `--anim-translate-x/y`, `--anim-rotate-angle`, etc. |

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
