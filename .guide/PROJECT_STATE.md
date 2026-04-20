# 🧠 PROJECT_STATE.md — Memoria Compartida del Proyecto

> **Este archivo es la memoria persistente entre sesiones de IA.**
> Cada chat nuevo DEBE leer este archivo antes de hacer cualquier cosa.
> Cada chat que termina una tarea DEBE actualizar este archivo.

---

## Estado Actual

```yaml
proyecto: dacewav/store
repo: https://github.com/dacewav/store.git
version: 0.6.0
framework: SvelteKit + Cloudflare
firebase_project: dacewav-store-3b0f5
ultimo_chat: "2026-04-21 00:06"
bloque_actual: "Post-Bloque 10 — Pulido Profundo (audit bloque por bloque)"
ultima_tarea: "Mega plan 26/26 + audit profundo + fix 7 TS errors + bloques 6-10 actualizados"
proxima_tarea: "Audit bloque por bloque, fix bugs visuales admin, catalog comparison"
commit_actual: "97528e2"
svelte_check: "0 errores, 6 warnings"
```

## Progreso de Bloques

### BLOQUE 0: Setup del Proyecto ✅
- [x] SvelteKit + Firebase + Cloudflare
- [x] `.env` + firebase.ts
- [x] Primer build + push

---

### BLOQUE 1: Design System ✅ COMPLETO

**20 componentes:**
Button, Input, Select, Range, Textarea, Toggle, ColorPicker, Card, Modal, Skeleton, EmptyState, Toast, Spinner, Badge, Tabs, Collapsible, AdminTopbar, AdminSidebar, Icon (nuevo), ToastContainer

**116+ tokens:**
Colors (16), Typography (14), Spacing (12), Radius (5), Transitions (6), Z-index (10), Shadows (4), Glow (4), Layout (8), Opacity (3), Nav/Overlay (4), Borders (4), Tracking (4), Waveform (4), Touch (1)

**Responsive:**
480px (1 col, hamburger), 768px (mobile nav, 2 col), 1024px (compact grid). Fluid padding con clamp().

**A11y:**
prefers-reduced-motion, @media (hover: none), touch targets ≥ 44px, focus-visible, aria-labels, Escape closes modals/menus, focus trap en modales, focus restore

**Theme engine:**
src/lib/theme.ts — Firebase → CSS vars bridge. 19 direct mappings + auto-variants (accent, glow, red shades). Light mode completo con overrides de danger/warning.

**Zero hardcoded:**
Todo accent color usa rgba(var(--accent-rgb), opacity). 18 tokens auto-actualizan con accent change. Accent default: #dc2626 (rojo catalog).

**Keyframes (18):**
orbFloat, ldp, fadeInUp, slideUp, scaleIn, glowPulse, glowBreathe, neonFlicker, pulseRing, gradientShift, banner-scroll, banner-fade-pulse, banner-bounce, banner-glow-pulse, marquee, play-pulse-ring, slide-up-fade, shimmer

**Utilities (24):**
sr-only, truncate, line-clamp-2/3, flex-center, flex-between, btn-row, w-full, mt-xs/sm/md/lg, mb-xs/sm/md/lg, gap-xs/sm/md, fs-2xs/xs/sm, hide-mobile, hide-desktop, touch-target

**App.html:**
lang="es", preconnect Google Fonts, non-blocking font loading, noscript fallback, SVG favicon

**Icon system:**
`src/lib/icons.ts` — 20 íconos centralizados (heart, play, pause, close, search, check, warning, error, volumeOn, volumeOff, music, tag, sun, moon, chevronDown, chevronUp, settings, edit, trash, plus). Componente `<Icon>` declarativo.

**Card Style Engine:**
`src/lib/cardStyleEngine.ts` — 30 animation presets (float, hologram, glitch, colorShift, shimmer, borderGlow, rotate3d, jello, wobble, heartbeat, tada, rubberBand, swing, bounce, shake, headShake, flip, lightSpeed, blurIn, zoomPulse, gradientBorder, etc.) + glow (5 tipos) + CSS filters + hover effects + shimmer overlay. Merge global (settings.cardStyle) + per-beat (beat.cardStyle).

---

### BLOQUE 2: Firebase Layer + Stores ✅ COMPLETO

**9 stores:**
`_firebaseStore.ts` (base), `beats.ts`, `settings.ts`, `theme.ts`, `auth.ts`, `wishlist.ts`, `analytics.ts`, `player.ts`, `init.ts`

**Settings structure (11 secciones, 42+ textos editables desde admin):**
- `settings/hero` → title, subtitle, eyebrow, glowWord
- `settings/section` → title, dividerTitle (HTML), dividerSub
- `settings/cta` → title, subtitle, buttonText, buttonUrl
- `settings/layout` → cardsPerRow, showWishlist
- `settings/links` → [{label, url, icon}]
- `settings/brand` → name, logo, favicon, footerText, metaDescription
- `settings/loader` → enabled, brandText
- `settings/banner` → enabled, text, url, animation (static|scroll|fade-pulse|bounce|glow-pulse)
- `settings/testimonials` → [{name, text, stars, avatar}]
- `settings/cardStyle` → glow, animation, shimmer, hoverScale, brightness, saturate
- `settings/labels` → 24 labels (search, empty states, modal, filters, stats, prices, license names/descs)

**Arquitectura:**
- `_firebaseStore.ts`: Factory genérico con ref counting, lazy subscribe, loading/error/data state
- `beats.ts`: onValue a beats/, derived stores (beatsList, beatsCount, genres, allTags)
- `settings.ts`: onValue a settings/, sub-stores por sección (hero, layout, links, brand)
- `theme.ts`: onValue a theme/ → applyTheme() → CSS vars en DOM
- `auth.ts`: Google Auth + verificación admin desde Firebase DB (admins/{uid}) + env var fallback
- `wishlist.ts`: localStorage + reactive + cross-tab sync
- `analytics.ts`: batched events (10 por batch, flush 30s, max queue 50)
- `player.ts`: Audio state con timeupdate throttled (200ms), SSR guards, cleanup de listeners
- `init.ts`: Promise.allSettled para init paralelo

**Firebase rules:**
- Admin write via `root.child('admins').child(auth.uid)` (no requiere Cloud Functions)
- Validación estricta en beats (required fields, types, ranges)
- Analytics: cualquier auth puede escribir, solo admin puede leer
- Fields extra rechazados (`$other: { ".validate": false }`)

**Barrel exports:**
`stores/index.ts` exporta todos los stores + tipos + init/destroy

---

### BLOQUE 3: Core Components ✅ COMPLETO

**6 componentes core + 4 actions:**

| Componente | Líneas | Features |
|---|---|---|
| BeatCard.svelte | 273 | tilt action, play overlay, wishlist toggle, genre badge, tags, price, cover placeholder, lazy img |
| Player.svelte | 261 | Bottom bar, progress slider (click+keyboard), cover+info, play/pause/mute/close, responsive |
| Filters.svelte | 401 | Search+clear, genre pills scrollable, key selector (24), sort (8), tag cloud collapsable, active filters bar, $bindable |
| Waveform.svelte | ~120 | SVG bars, static mode (seeded random), live mode (Web Audio API + AnalyserNode), rAF cleanup |
| WishlistPanel.svelte | 206 | Slide-in panel, backdrop, empty state, play from wishlist, keyed each |
| BeatModal.svelte | 264 | Cover, badges, waveform, play button, license grid, uses Modal base |

**Svelte actions (4):**
- `tilt`: 3D mouse tracking, respeta `(hover: hover)`, cleanup
- `parallax`: scroll translate, passive listener, cleanup
- `staggerReveal`: IntersectionObserver por child, unobserve tras reveal, cleanup
- `ripple`: click effect con DOM element + auto-remove 600ms

**Integración verificada:**
- initStores() → Firebase → stores → components (onMount, lazy)
- BeatCard → player.play() → Player.svelte
- Player.svelte → Waveform.svelte (progress via $player store)
- Filters.svelte ↔ parent ($bindable two-way)
- BeatModal → Modal → z-index stacking
- WishlistPanel ↔ wishlist store ↔ BeatCard (reactive isIn())
- theme.ts engine → stores/theme.ts → Firebase

---

### BLOQUE 4: Tienda — Página Principal ✅ COMPLETO + PULIDO
- [x] Hero section (título/subtitle desde settings)
- [x] Grid de beats con BeatCard (tilt, play, wishlist)
- [x] Filtros integrados (search, genre, key, sort, tags)
- [x] Player bottom bar en layout
- [x] Wishlist panel (nav button + mobile menu)
- [x] Beat modal al click (cover, badges, waveform, licenses)
- [x] Skeleton loading states
- [x] Empty state (sin beats + sin resultados filtro)
- [x] Sort funcional (8 opciones)
- [x] Filtrado reactivo (search, genre, key, tags combinables)
- [x] **Pulido:** SVGs inline → Icon (11 componentes, 20 iconos)
- [x] **Pulido:** Light mode fix (hardcoded colors → tokens)
- [x] **Pulido:** CardStyleEngine (30 animation presets, per-beat + global)
- [x] **Pulido:** Hero staggered entrance animations
- [x] **Pulido:** BeatModal license select + buy CTA + cover genre badge
- [x] **Pulido:** Player playing glow + cover pulse
- [x] **Pulido:** Beat grid staggerReveal
- [x] **Pulido:** CTA radial glow + hover lift
- [x] **Pulido:** Firebase rules (cardStyle field)
- [x] **Pulido s3:** Filters counter (X de Y beats), animated active tags
- [x] **Pulido s3:** Nav accent glow on scroll, brand hover scale, wishlist badge
- [x] **Pulido s3:** Footer gradient line, link underline animation, brand hover
- [x] **Pulido s3:** Mobile menu staggered links, shadow, hover translateX
- [x] **Pulido s3:** WishlistPanel count badge, item hover
- [x] **Pulido s3:** Skeleton accent-tinted shimmer
- [x] **Pulido s3:** Section badge hover glow, global fadeIn keyframe
- [x] **Pulido s4-s7:** Settings-driven (42+ editables), zero hardcoded brand, banner, testimonials
- [x] **Pulido s8:** Auditoría profunda final — AdminTopbar 6 SVGs→Icon, login SVG→Icon, 6 nuevos iconos, font-sizes 10px→tokens (7 fixes), transiciones 0.2s→tokens (25+ fixes, 12 files), 0 TODOs, 0 console.log debug, focus trap modal ✅, ARIA labels ✅, `prefers-reduced-motion` ✅

### BLOQUE 5: Tienda — Beat Page 🚧
- [x] Ruta dinámica `/beat/[id]`
- [x] Beat detail con cover grande (1:1, hover zoom, sticky en desktop)
- [x] Waveform interactivo
- [x] Licencias + precios (2x2 grid, select/deselect, buy CTA WhatsApp)
- [x] Beats relacionados (same genre, max 4, fallback random)
- [x] Meta tags SEO (og:title, og:description, og:image)
- [x] Platform links (Spotify, YouTube, SoundCloud)
- [x] Back link al catálogo
- [x] Loading skeleton + empty state
- [x] Responsive (2col → 1col)
- [x] Store page: click → navega a /beat/[id] (modal removido)
- [x] Todos los textos editables desde settings
- [ ] Testing visual en browser real

### BLOQUE 6: Admin Auth + Layout ✅
- [x] Login page con Google Auth UI
- [x] Route guard (redirect a /login si no auth, isAdmin check)
- [x] Admin layout con sidebar + content split
- [x] Save status indicator (wired a Firebase real)
- [x] Mobile admin layout (sidebar colapsa a iconos)
- [x] Keyboard shortcuts (Ctrl+Z undo, Ctrl+B/H/T/D/G nav)

### BLOQUE 7: Admin Beats CRUD ✅
- [x] Lista de beats con búsqueda/filtros (8 sort options)
- [x] Crear/editar beat (form 5 tabs: info, lics, media, platforms, style)
- [x] Upload cover + audio (Firebase Storage via FileUpload)
- [x] Delete con confirmación (modal)
- [x] Bulk actions (select, activate/deactivate, delete)
- [x] Auto-save con debounce (1s)
- [ ] Preview de audio inline en lista (solo en BeatEditor)

### BLOQUE 8: Admin Theme Editor ✅
- [x] Color pickers para accent, glow
- [x] Font selector (display + body)
- [x] Radius, glow intensity, blur sliders
- [x] Glow animation selector
- [x] Section padding, beat gap controls
- [ ] Light/dark toggle (solo en theme store, no en UI admin)
- [ ] Preview en vivo (requiere ver store en otra pestaña)
- [ ] Reset a defaults

### BLOQUE 9: Admin Content Editor ✅
- [x] Hero title/subtitle/eyebrow/glowWord editor
- [x] Hero visual settings (size, glow, stroke, gradient)
- [x] Section title/divider editor
- [x] CTA editor (title, subtitle, button, url)
- [x] Labels editor (24 labels editables)
- [x] Brand settings (name, logo, favicon, footer)
- [x] Banner editor (text, url, animation, colors)
- [x] Links manager (en settings, render en store)
- [x] Animations editor (6 animation slots)

### BLOQUE 10: Polish & Deploy ⚠️
- [x] Cloudflare Pages deploy config (wrangler.jsonc)
- [x] robots.txt
- [x] sitemap.xml
- [x] Favicon SVG
- [x] OG image SVG
- [x] Twitter card meta
- [x] CHANGELOG.md
- [x] Performance audit (bundles verificados)
- [ ] Lighthouse audit formal (necesita browser)
- [ ] Custom domain setup (Cloudflare dashboard)
- [ ] Monitoring/analytics (Google Analytics, Cloudflare analytics)

---

## Auditoría y Mejoras (2026-04-19)

### Auditoría Bloques 2-3
- Revisión de 16 archivos (stores, components, actions, firebase, theme engine)
- Verificado: SSR safety, memory leaks, error handling, edge cases, a11y, integration
- Build: 0 errores, 0 warnings críticos

### 18 Mejoras aplicadas

**Seguridad (5):**
1. Firebase rules: `auth.token.admin` → `admins/{uid}` lookup
2. Rules: validación estricta + reject fields extra
3. Rules: precios `>= 0`, BPM `<= 999`
4. Auth: admin check desde Firebase DB + env var fallback
5. Auth: user inmediato, admin async (no bloquea login)

**TypeScript (1):**
6. `firebase.ts`: eliminados 3 `any` → tipos Firebase reales

**Performance (5):**
7. Player: timeupdate throttled 200ms
8. Player: event listeners nombrados + detach
9. Player: SSR guards en todos los métodos
10. Toasts: max 5 visibles simultáneos
11. Beats: early return en derived si lista vacía

**Accesibilidad (3):**
12. Modal: focus trap real (Tab/Shift+Tab)
13. Modal: focus restore al cerrar
14. Modal: auto-focus primer elemento al abrir

**Design System (1):**
15. Light mode: danger/warning overrides para contraste

**DX/Mantenibilidad (3):**
16. `icons.ts`: 14 íconos centralizados
17. `Icon.svelte`: componente declarativo
18. Barrel exports actualizados

---

## Decisiones Técnicas

| Decisión | Opción elegida | Razón |
|---|---|---|
| TypeScript | ✅ TS estricto (0 any) | Type safety |
| Accent default | #dc2626 (rojo) | Match catalog dark+red |
| Firebase Storage vs R2 | Pendiente | Decidir en Bloque 7 |
| Auth provider | Solo Google | Simple para admin |
| Admin check | Firebase DB admins/{uid} + env var | Sin Cloud Functions |
| Card style engine | CSS vars + Svelte props | No innerHTML |
| Admin route | `/admin` misma app | Sin iframe |
| Font loading | Non-blocking link | Performance |
| Responsive | 3 breakpoints + fluid | 480/768/1024px |
| Íconos | SVG inline centralizado | Zero dependencies |

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
| Build fallaba sin .env | Copiado .env.example → .env | 2026-04-19 |
| ADMIN_UIDS vacío | Env var + Firebase DB check | 2026-04-19 |
| Player SSR crash | Browser guards en getAudio + métodos | 2026-04-19 |
| Waveform live no funcionaba | Exponer getAudioElement() desde player | 2026-04-19 |
| Analytics queue sin límite | MAX_QUEUE_SIZE = 50 | 2026-04-19 |

## Referencia

| Archivo | Qué contiene |
|---|---|
| `.guide/CATALOG-ANALYSIS.md` | Features del catalog v5.2 |
| `.guide/BLOCK-CONTEXT.md` | Contexto rápido del bloque actual |
| `src/lib/theme.ts` | Firebase → CSS vars bridge |
| `src/lib/icons.ts` | Íconos SVG centralizados (14) |
| `src/app.css` | Design tokens completos (820 líneas) |
| `src/lib/firebase.ts` | Firebase init lazy + typed |
| `firebase.rules.json` | Reglas de seguridad Firebase |
| **Catalog v5.2** | https://github.com/dacewav/catalog (referencia visual, NO código) |
