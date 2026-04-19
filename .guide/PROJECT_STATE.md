# 🧠 PROJECT_STATE.md — Memoria Compartida del Proyecto

> **Este archivo es la memoria persistente entre sesiones de IA.**
> Cada chat nuevo DEBE leer este archivo antes de hacer cualquier cosa.
> Cada chat que termina una tarea DEBE actualizar este archivo.

---

## Estado Actual

```yaml
proyecto: dacewav/store
repo: https://github.com/dacewav/storewav.git
version: 0.2.0
framework: SvelteKit
firebase_project: dacewav-store-3b0f5
ultimo_chat: "2026-04-19 10:57"
bloque_actual: "Bloque 1 — Design System ✅ COMPLETO"
ultima_tarea: "18 componentes, 116+ tokens, catalog analysis, admin components"
proxima_tarea: "Bloque 2 — Firebase Layer + Stores"
```

## Progreso de Bloques

### BLOQUE 0: Setup del Proyecto ✅
- [x] SvelteKit + Firebase + Cloudflare
- [x] `.env` + firebase.ts
- [x] Primer build + push

---

### BLOQUE 1: Design System ✅ COMPLETO

**18 componentes:**
Button, Input, Select, Range, Textarea, Toggle, ColorPicker, Card, Modal, Skeleton, EmptyState, Toast, Spinner, Badge, Tabs, Collapsible, AdminTopbar, AdminSidebar

**116+ tokens:**
Colors (16), Typography (14), Spacing (12), Radius (5), Transitions (6), Z-index (10), Shadows (4), Glow (4), Layout (8), Opacity (3), Nav/Overlay (4), Borders (4), Tracking (4), Waveform (4), Touch (1)

**Responsive:**
480px (1 col, hamburger), 768px (mobile nav, 2 col), 1024px (compact grid). Fluid padding con clamp().

**A11y:**
prefers-reduced-motion, @media (hover: none), touch targets ≥ 44px, focus-visible, aria-labels, Escape closes modals/menus

**Theme engine:**
src/lib/theme.ts — Firebase → CSS vars bridge. 19 direct mappings + auto-variants (accent, glow, red shades). Light mode overrides.

**Zero hardcoded:**
Todo accent color usa rgba(var(--accent-rgb), opacity). 18 tokens auto-actualizan con accent change. Accent default: #dc2626 (rojo catalog).

**Keyframes (18):**
orbFloat, ldp, fadeInUp, slideUp, scaleIn, glowPulse, glowBreathe, neonFlicker, pulseRing, gradientShift, banner-scroll, banner-fade-pulse, banner-bounce, banner-glow-pulse, marquee, play-pulse-ring, slide-up-fade, shimmer

**Utilities (24):**
sr-only, truncate, line-clamp-2/3, flex-center, flex-between, btn-row, w-full, mt-xs/sm/md/lg, mb-xs/sm/md/lg, gap-xs/sm/md, fs-2xs/xs/sm, hide-mobile, hide-desktop, touch-target

**App.html:**
lang="es", preconnect Google Fonts, non-blocking font loading, noscript fallback, SVG favicon

---

### BLOQUE 2: Firebase Layer + Stores ⬜
- [ ] stores/beats.ts — onValue a beats/, reactive
- [ ] stores/settings.ts — onValue a settings/, reactive
- [ ] stores/theme.ts — onValue a theme/, aplica CSS vars
- [ ] stores/auth.ts — Google Auth, expone isAdmin
- [ ] stores/wishlist.ts — localStorage + reactive
- [ ] stores/analytics.ts — batched events
- [ ] stores/player.ts — audio state
- [ ] Reglas de seguridad Firebase
- [ ] Cache local offline-first
- [ ] TESTS

### BLOQUE 3: Core Components ⬜
- [ ] BeatCard.svelte con card style engine
- [ ] Player.svelte (bottom bar, EQ, waveform)
- [ ] Filters.svelte (genre, key, mood, search, sort, tag cloud)
- [ ] Waveform.svelte (SVG desde audio)
- [ ] WishlistPanel.svelte
- [ ] BeatModal.svelte
- [ ] Svelte actions (tilt, parallax, cursorGlow, staggerReveal)

### BLOQUE 4-10: Ver PROJECT_STATE.md anterior para detalles
- Bloque 4: Tienda — Página Principal
- Bloque 5: Tienda — Beat Page
- Bloque 6: Admin Auth + Layout
- Bloque 7: Admin Beats CRUD
- Bloque 8: Admin Theme Editor
- Bloque 9: Admin Content Editor
- Bloque 10: Polish & Deploy

---

## Decisiones Técnicas

| Decisión | Opción elegida | Razón |
|---|---|---|
| TypeScript | ✅ TS | Type safety |
| Accent default | #dc2626 (rojo) | Match catalog dark+red |
| Firebase Storage vs R2 | Pendiente | Decidir en Bloque 7 |
| Auth provider | Solo Google | Simple para admin |
| Card style engine | CSS vars + Svelte props | No innerHTML |
| Admin route | `/admin` misma app | Sin iframe |
| Font loading | Non-blocking link | Performance |
| Responsive | 3 breakpoints + fluid | 480/768/1024px |

## Errores Conocidos

| Error | Solución | Fecha |
|---|---|---|
| CSS variable mismatch (--color-*) | Renombrar a tokens directos | 2026-04-19 |
| .reveal sin IntersectionObserver | Agregar observer en layout | 2026-04-19 |
| Font-sizes hardcodeados sin token | Agregar --text-2xs | 2026-04-19 |
| Touch targets < 44px | min-height: var(--touch-min) | 2026-04-19 |
| z-index hardcodeado | Tokens --z-content, --z-progress | 2026-04-19 |
| Accent verde placeholder | Cambiado a #dc2626 rojo | 2026-04-19 |
| Font loading render-blocking | Non-blocking link + noscript | 2026-04-19 |

## Referencia

| Archivo | Qué contiene |
|---|---|
| `.guide/CATALOG-ANALYSIS.md` | Features del catalog v5.2 |
| `.guide/BLOCK-CONTEXT.md` | Contexto rápido del bloque actual |
| `src/lib/theme.ts` | Firebase → CSS vars bridge |
| `src/app.css` | Design tokens completos |
| **Catalog v5.2** | https://github.com/dacewav/catalog (referencia visual, NO código) |
