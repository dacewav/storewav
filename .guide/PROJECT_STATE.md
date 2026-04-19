# 🧠 PROJECT_STATE.md — Memoria Compartida del Proyecto

> **Este archivo es la memoria persistente entre sesiones de IA.**
> Cada chat nuevo DEBE leer este archivo antes de hacer cualquier cosa.
> Cada chat que termina una tarea DEBE actualizar este archivo.

---

## Estado Actual

```yaml
proyecto: dacewav/store
version: 0.1.0
framework: SvelteKit
firebase_project: dacewav-store-3b0f5
ultimo_chat: "2026-04-19"
bloque_actual: "Bloque 1 — Design System"
ultima_tarea: "Auditoría deep + responsive + theme engine + catalog analysis"
```

## Progreso de Bloques

### BLOQUE 0: Setup del Proyecto ✅
- [x] SvelteKit + Firebase + Cloudflare
- [x] `.env` + firebase.ts
- [x] Primer build + push
- **Estado:** ✅ COMPLETO

---

### BLOQUE 1: Design System 🟡 (casi completo)
- [x] `tokens.css` — 80+ variables (colors, spacing, radius, shadows, tracking, z-index)
- [x] `Button.svelte` — primary/secondary/ghost/danger, sm/md/lg, loading, touch targets
- [x] `Input.svelte` — text/number/email/password/search, bindable, error state
- [x] `Card.svelte` — hoverable, padding toggle
- [x] `Modal.svelte` — backdrop, Escape, slideUp
- [x] `Badge.svelte` — 5 variants con tokens
- [x] `Skeleton.svelte` — configurable lines + aspectRatio
- [x] Layout — sticky nav, hamburger mobile, cursor glow, orbs, scroll progress, footer
- [x] Page — hero fluido, section divider, skeleton grid
- [x] Responsive — 3 breakpoints (480/768/1024px), fluid padding
- [x] Touch targets ≥ 44px
- [x] `prefers-reduced-motion` + `@media (hover: none)`
- [x] IntersectionObserver para scroll reveal
- [x] Utility classes (container, truncate, line-clamp, flex helpers, sr-only)
- [x] `theme.ts` — Firebase → CSS vars bridge (12 direct + auto-variants)
- [x] CSS variable consistency audit (0 mismatches)
- [ ] **TEST:** Browser visual verification
- [ ] **TEST:** Responsive en 320px, 768px, 1024px, 1440px
- **Estado:** 🟡 95% — falta testing visual
- **Bloqueado por:** nada
- **Notas:** Colores actuales son placeholder. El accent se configura desde Firebase en Bloque 2.

---

### BLOQUE 2: Firebase Layer + Stores
- [ ] `stores/beats.ts` — onValue a `beats/`, reactive Svelte store
- [ ] `stores/settings.ts` — onValue a `settings/`, reactive
- [ ] `stores/theme.ts` — onValue a `theme/`, aplica CSS vars via theme.ts
- [ ] `stores/auth.ts` — Google Auth, expone `isAdmin`
- [ ] `stores/wishlist.ts` — localStorage + reactive
- [ ] `stores/analytics.ts` — batched events → Firebase
- [ ] `stores/player.ts` — audio state, play/pause/seek/volume
- [ ] Reglas de seguridad Firebase desplegadas
- [ ] Cache local (localStorage) para offline-first
- [ ] **TEST:** Leer/escribir datos desde consola
- [ ] **TEST:** settings aplica CSS vars al DOM
- [ ] **TEST:** auth rechaza escritura sin login
- [ ] **TEST:** player reproduce audio
- **Estado:** ⬜ NO INICIADO
- **Bloqueado por:** Bloque 1
- **Notas:** Usar Firebase modular SDK v9+. Lazy init (solo client).

---

### BLOQUE 3: Tienda — Componentes Core
- [ ] `BeatCard.svelte` — imagen, metadata, play hint, wishlist, precio, licencias CTA
- [ ] `BeatCard.svelte` — card style engine (glow, animaciones, hover FX, filters, shimmer)
- [ ] `Player.svelte` — bottom bar, play/pause/prev/next/seek/volume, EQ visualizer
- [ ] `Player.svelte` — waveform progress, auto-next, track plays
- [ ] `Filters.svelte` — genre buttons, key/mood dropdowns, search, sort, tag cloud
- [ ] `Filters.svelte` — active filter tags, "limpiar todo", counter
- [ ] `Waveform.svelte` — SVG desde audio, cache, lazy load
- [ ] `WishlistPanel.svelte` — lista, badge counter, WhatsApp share
- [ ] `BeatModal.svelte` — detalle + licenses + player integrado
- [ ] Svelte actions: `use:tilt`, `use:parallax`, `use:cursorGlow`, `use:staggerReveal`
- [ ] **TEST:** Cards renderizan con datos fake
- [ ] **TEST:** Filtros funcionan correctamente
- [ ] **TEST:** Player reproduce audio
- [ ] **TEST:** Wishlist persiste entre recargas
- [ ] **TEST:** Responsive en móvil (320px)
- **Estado:** ⬜ NO INICIADO
- **Bloqueado por:** Bloques 1, 2
- **Notas:** NO copiar card-style-engine del catalog. Reconstruir con CSS vars + Svelte reactivity.

---

### BLOQUE 4: Tienda — Página Principal
- [ ] Hero section (lee de settings/hero, glow/stroke configurable)
- [ ] Beat grid (lee de beats/, filter + sort reactivo)
- [ ] Player global (sincronizado con cards)
- [ ] Sistema de filtros completo
- [ ] Wishlist
- [ ] Animaciones de entrada (stagger reveal)
- [ ] Section divider (configurable)
- [ ] Testimonials (si settings.testimonialsActive)
- [ ] Banner animado (si settings.bannerActive)
- [ ] Floating elements
- [ ] Custom links (header, hero, footer)
- [ ] Stats animados (beat count, genre count)
- [ ] Responsive completo
- [ ] **TEST:** Beat fake en Firebase → aparece en tienda
- [ ] **TEST:** Cambio en Firebase → se actualiza sin recargar
- [ ] **TEST:** Hero title editable con glow/stroke
- [ ] **TEST:** Responsive en móvil
- **Estado:** ⬜ NO INICIADO
- **Bloqueado por:** Bloque 3
- **Notas:** La page ya tiene hero + skeleton. Expandir con datos reales.

---

### BLOQUE 5: Tienda — Página de Beat
- [ ] Ruta `/beat/[id]`
- [ ] Detalles (BPM, key, tags, description)
- [ ] Player integrado
- [ ] Licenses grid (tipo, precio MXN/USD)
- [ ] Botón de compra (WhatsApp CTA)
- [ ] Deep link funcional (compartir URL)
- [ ] Waveform visual
- [ ] Beats relacionados
- [ ] **TEST:** Navegar a `/beat/test-id` con beat fake
- [ ] **TEST:** Player funciona en página individual
- [ ] **TEST:** Deep link funciona
- **Estado:** ⬜ NO INICIADO
- **Bloqueado por:** Bloque 3

---

### BLOQUE 6: Admin — Auth + Layout
- [ ] Login con Google (Firebase Auth)
- [ ] Protección de rutas `/admin/*`
- [ ] Admin layout con sidebar
- [ ] Dashboard con stats básicos
- [ ] Nav admin (beats, settings, theme, content)
- [ ] **TEST:** Login/logout funciona
- [ ] **TEST:** Rutas protegidas redirigen a login
- **Estado:** ⬜ NO INICIADO
- **Bloqueado por:** Bloque 2

---

### BLOQUE 7: Admin — Beats CRUD
- [ ] Lista de beats con search + sort
- [ ] Crear/editar beat (form completo)
- [ ] Upload audio/cover (Firebase Storage o R2)
- [ ] Delete (soft → trash)
- [ ] Drag & drop reorder
- [ ] Bulk operations (delete, activate, deactivate)
- [ ] Card style editor (per-beat)
- [ ] License editor (tipo, MXN, USD)
- [ ] Auto-save
- [ ] Undo/redo
- [ ] Live preview (iframe o side-by-side)
- [ ] **TEST:** CRUD completo
- [ ] **TEST:** Cambios se reflejan en tienda
- **Estado:** ⬜ NO INICIADO
- **Bloqueado por:** Bloques 5, 6

---

### BLOQUE 8: Admin — Theme Editor
- [ ] Color pickers (bg, surface, accent, text, borders)
- [ ] Font selector (Google Fonts)
- [ ] Glow controls (color, intensity, blur, animation)
- [ ] Card effects (opacity, shadow, radius)
- [ ] Layout controls (padding, gap, hero margin)
- [ ] Gradient editor
- [ ] Presets (save/load/import/export)
- [ ] Live preview
- [ ] Light/dark toggle
- [ ] **TEST:** Cambios se aplican en tiempo real
- [ ] **TEST:** Presets guardan/cargan correctamente
- **Estado:** ⬜ NO INICIADO
- **Bloqueado por:** Bloque 6

---

### BLOQUE 9: Admin — Content Editor
- [ ] Hero editor (título, subtitle, eyebrow, glow/stroke, gradient)
- [ ] Text colorizer (segmentos coloreados)
- [ ] Banner editor (texto, animación, velocidad)
- [ ] Social links (WhatsApp, Instagram, email)
- [ ] Custom links (header, hero, footer)
- [ ] Floating elements (posicionar, animar)
- [ ] Gallery (upload, manage, pick)
- [ ] **TEST:** Cambios de contenido se reflejan en tienda
- **Estado:** ⬜ NO INICIADO
- **Bloqueado por:** Bloques 7, 8

---

### BLOQUE 10: Polish & Deploy
- [ ] SEO (meta tags, sitemap, robots.txt)
- [ ] Lighthouse audit (90+ en todas)
- [ ] Performance (lazy load, code split, image optimization)
- [ ] Error boundaries
- [ ] Loading states
- [ ] Deploy a Cloudflare Pages
- [ ] Custom domain
- [ ] **TEST:** Lighthouse 90+
- [ ] **TEST:** Deploy funciona
- **Estado:** ⬜ NO INICIADO
- **Bloqueado por:** Bloque 9

---

## Decisiones Técnicas

| Decisión | Opción elegida | Razón |
|---|---|---|
| TypeScript | ✅ TS | Type safety, mejor DX |
| Firebase Storage vs R2 | Pendiente | R2 más barato, Firebase más integrado |
| Auth provider | Solo Google | Simple, el user solo necesita admin |
| Card style engine | CSS vars + Svelte props | NO innerHTML como catalog |
| Admin route | `/admin` en misma app | Sin iframe, sin postMessage |
| Player | Svelte store + Web Audio API | Reactive state management |
| Responsive | 3 breakpoints + fluid (clamp) | 480/768/1024px |

---

## Errores Conocidos

| Error | Solución | Fecha |
|---|---|---|
| CSS variable mismatch (--color-*) | Renombrar a tokens directos | 2026-04-19 |
| .reveal sin IntersectionObserver | Agregar observer en layout | 2026-04-19 |
| Font-sizes hardcodeados sin token | Agregar --text-2xs, mapear a tokens | 2026-04-19 |
| Touch targets < 44px | min-height: var(--touch-min) | 2026-04-19 |

---

## Archivos de Referencia

| Archivo | Qué contiene | Cuándo usar |
|---|---|---|
| `.guide/CATALOG-ANALYSIS.md` | Features del catalog v5.2 | Antes de migrar cada feature |
| `.guide/BLOCK-CONTEXT.md` | Contexto rápido del bloque | Siempre al inicio |
| `src/lib/theme.ts` | Firebase → CSS vars bridge | Bloque 2 (stores) |
| `src/app.css` | Design tokens completos | Siempre (referencia de variables) |
