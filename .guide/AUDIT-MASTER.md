# 📋 AUDIT-MASTER.md — Guía para Siguiente Sesión

> **Objetivo:** Audit profundo bloque por bloque, encontrar bugs visuales en admin,
> comparar catalog v5.2 vs store, fixear todo. Sesión de pulido masivo.

---

## 🎯 Protocolo de Audit por Bloque

Para CADA bloque, hacer estos checks:

```
BLOQUE X — AUDIT COMPLETO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. BUILD:        npm run build → 0 errores
2. TYPESCRIPT:   npm run check → 0 errores
3. VISUAL:       Revisar cada página/feature en browser
4. COMPARAR:     Catalog v5.2 equivalente → ¿qué falta?
5. MOBILE:       ¿Se ve bien en 480px/768px?
6. A11Y:         ¿focus, aria, keyboard navigation?
7. TOKENS:       ¿0 hardcoded colors/sizes?
8. CLEANUP:      ¿dead code, console.logs, TODOs?
9. INTEGRATION:  ¿Firebase conecta? ¿stores actualizan?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Resultado: PASS / FIX (items) / MISSING (features)
```

---

## 📦 Bloque 0: Setup
- [ ] Build pasa sin .env real? (ahora necesita placeholder)
- [ ] .env.example tiene todas las vars?
- [ ] wrangler.jsonc correcto para deploy?
- [ ] Firebase conecta en dev?

## 📦 Bloque 1: Design System (20 componentes, 116+ tokens)
### Componentes a auditar uno por uno:
- [ ] Button — variants, sizes, disabled states
- [ ] Input — focus, error, placeholder
- [ ] Select — options, keyboard nav
- [ ] Range — value display, touch
- [ ] Textarea — resize, maxlength
- [ ] Toggle — label, checked state
- [ ] ColorPicker — popup, hex input
- [ ] Card — hover, padding
- [ ] Modal — focus trap, escape, backdrop
- [ ] Skeleton — shimmer animation
- [ ] EmptyState — icon, title, action slot
- [ ] Toast — types, auto-dismiss, stack
- [ ] Spinner — size variants
- [ ] Badge — variants (accent, muted, danger, warning)
- [ ] Tabs — active, scrollable
- [ ] Collapsible — animation, chevron
- [ ] AdminTopbar — save status, actions
- [ ] AdminSidebar — active state, mobile collapse
- [ ] Icon — all 20 icons render?
- [ ] ToastContainer — max 5, positioning

### Tokens a verificar:
- [ ] Colors (16) — ¿todos se usan?
- [ ] Typography (14) — ¿font sizes correctos?
- [ ] Spacing (12) — ¿consistente?
- [ ] Light mode overrides — ¿completos?

## 📦 Bloque 2: Firebase Layer + Stores (9 stores)
- [ ] `_firebaseStore` — ref counting, lazy subscribe, cleanup
- [ ] `beats` — onValue, derived stores, CRUD functions
- [ ] `settings` — sub-stores, updateField, saveStatus, undo/redo
- [ ] `theme` — CSS vars bridge, 19 mappings
- [ ] `auth` — Google Auth, admin check (local + Firebase DB)
- [ ] `wishlist` — localStorage, reactive, cross-tab sync
- [ ] `analytics` — batched events, flush, max queue
- [ ] `player` — audio state, timeupdate, SSR guards
- [ ] `init` — Promise.allSettled, destroy

### Checks específicos:
- [ ] ¿settings.updateField() realmente escribe a Firebase?
- [ ] ¿undo/redo stack funciona correctamente?
- [ ] ¿saveStatus cambia: saved → saving → saved?
- [ ] ¿beats CRUD (create/update/delete) funciona?
- [ ] ¿player.play() actualiza UI en BeatCard?

## 📦 Bloque 3: Core Components (6 components, 4 actions)
### BeatCard
- [ ] ¿Se renderiza correctamente?
- [ ] ¿Tilt action funciona (mouse tracking)?
- [ ] ¿Play button reproduce audio?
- [ ] ¿Wishlist toggle funciona?
- [ ] ¿Featured badge aparece si beat.featured?
- [ ] ¿Waveform bars animan cuando reproduce?
- [ ] ¿Click navega a /beat/[id]?
- [ ] ¿Responsive en mobile?

### Player
- [ ] ¿Barra aparece al reproducir?
- [ ] ¿Progress bar funciona (click + drag)?
- [ ] ¿Play/pause/mute/close funcionan?
- [ ] ¿Cover + info se actualizan?
- [ ] ¿Responsive?

### Filters
- [ ] ¿Search funciona?
- [ ] ¿Genre pills filtran?
- [ ] ¿Key selector funciona?
- [ ] ¿Sort cambia orden?
- [ ] ¿Tags cloud funciona?
- [ ] ¿Active filters bar aparece?
- [ ] ¿Counter muestra "X de Y"?

### Waveform
- [ ] ¿Static mode renderiza barras?
- [ ] ¿Live mode funciona (Web Audio)?

### WishlistPanel
- [ ] ¿Slide-in animation?
- [ ] ¿Muestra items correctos?
- [ ] ¿Play from wishlist funciona?

### BeatModal
- [ ] ¿Abre al click? (Nota: ya no se usa, fue reemplazado por /beat/[id])
- [ ] ¿Focus trap funciona?

### Actions
- [ ] `tilt` — 3D mouse tracking, cleanup
- [ ] `parallax` — scroll translate, passive
- [ ] `staggerReveal` — IntersectionObserver
- [ ] `reveal` — IntersectionObserver
- [ ] `siblingBlur` — blur neighbors
- [ ] `ripple` — click effect
- [ ] `countUp` — animated counter

## 📦 Bloque 4: Store Page
### Comparar con catalog v5.2:
- [ ] Hero section — title, subtitle, glow word, eyebrow
- [ ] Hero stats — animated counters?
- [ ] Hero links — pill buttons render?
- [ ] Featured beats section — shows when beats.featured?
- [ ] Section divider — HTML title, subtitle
- [ ] Beat grid — staggerReveal, siblingBlur
- [ ] Filters — search, genre, key, sort, tags
- [ ] BeatCard — click → /beat/[id]
- [ ] Testimonials — render if settings.testimonials?
- [ ] CTA section — title, subtitle, button, WhatsApp link
- [ ] Footer — brand, links, copyright

### Catalog features que podrían faltar:
- [ ] Cursor glow lerp (factor 0.08) — ¿está suavizado?
- [ ] Scroll progress — ¿gradiente 3 colores o sólido?
- [ ] Floating orbs — ¿3 orbs con animación?
- [ ] Grain overlay — ¿SVG pattern?
- [ ] Nav scroll-aware — ¿hide down, show up?

## 📦 Bloque 5: Beat Page (/beat/[id])
- [ ] Cover grande 1:1, hover zoom
- [ ] Waveform interactivo
- [ ] Licencias grid (2x2), select/deselect
- [ ] Buy CTA → WhatsApp
- [ ] Related beats (same genre, max 4)
- [ ] Meta tags SEO (og:title, og:description, og:image)
- [ ] Platform links (Spotify, YouTube, SoundCloud)
- [ ] Back link al catálogo
- [ ] Loading skeleton
- [ ] Responsive (2col → 1col)

## 📦 Bloque 6: Admin Auth + Layout
- [ ] Login page — Google Auth button
- [ ] Route guard — redirect si no auth / no admin
- [ ] Admin layout — sidebar + content
- [ ] Save status — ¿cambia al editar?
- [ ] Mobile — ¿sidebar colapsa?
- [ ] Keyboard shortcuts — Ctrl+Z, Ctrl+B/H/T/D/G

## 📦 Bloque 7: Admin Beats CRUD
- [ ] Lista — búsqueda, filtros, sort
- [ ] Stats row — total, activos, inactivos, géneros
- [ ] Beat row — cover, info, price, actions
- [ ] Move up/down — ¿swap orders?
- [ ] Edit — 5 tabs funcionan?
- [ ] Auto-save — ¿guarda 1s después?
- [ ] FileUpload — ¿sube a Firebase Storage?
- [ ] Bulk actions — select, activate, deactivate, delete
- [ ] New beat — ¿crea en Firebase?
- [ ] Delete — ¿confirma y borra?

## 📦 Bloque 8: Admin Theme Editor
- [ ] Accent color picker — ¿actualiza CSS vars?
- [ ] Glow color/intensity/blur — ¿se ven cambios?
- [ ] Font display/body — ¿cambia fuentes?
- [ ] Radius sliders — ¿cambia border-radius?
- [ ] Section padding / beat gap — ¿cambia layout?
- [ ] Card opacity / blur bg — ¿cambia cards?

## 📦 Bloque 9: Admin Content Editor
### Hero
- [ ] Title/subtitle/eyebrow/glowWord — ¿se ven en store?
- [ ] Visual settings — size, glow, stroke, gradient

### Content
- [ ] Section title/divider — ¿se ven?
- [ ] CTA — title, subtitle, button, url
- [ ] Labels — ¿24 labels editables?

### Brand
- [ ] Name — ¿cambia en nav/footer?
- [ ] Logo URL — ¿renderiza?
- [ ] Footer text — ¿se ve?

### Banner
- [ ] Enabled toggle — ¿muestra/oculta?
- [ ] Text/url — ¿funciona?
- [ ] Animation — static/scroll/fade-pulse/bounce/glow-pulse

### Animations
- [ ] 6 slots — ¿aplican animaciones?

## 📦 Bloque 10: Polish & Deploy
- [ ] SEO — meta tags en todas las páginas
- [ ] robots.txt — ¿bloquea /admin/?
- [ ] sitemap.xml — ¿válido?
- [ ] Favicon — ¿se ve?
- [ ] OG image — ¿se ve en social?
- [ ] Twitter card — ¿meta tags?
- [ ] CHANGELOG.md — ¿actualizado?

---

## 🔄 Catalog v5.2 vs Store — Gap Analysis Final

| Feature | Catalog | Store | Status |
|---------|---------|-------|--------|
| Cursor glow lerp | Suave 0.08 | ¿raw o lerp? | CHECK |
| Card shadow depth | 12px 40px | ¿qué tiene? | CHECK |
| Card hover dual shadow | depth + glow | ¿qué tiene? | CHECK |
| Sibling blur | JS-driven | ✅ action | OK |
| Hero parallax | translateY+opacity | ¿solo CSS? | CHECK |
| Scroll progress | 3-color gradient | ¿solid? | CHECK |
| Waveform on cards | 20 bars | ✅ 16 bars | OK |
| Keyframes | 40+ | ✅ 53 | OK |
| Play pulse ring | box-shadow | ¿está? | CHECK |
| Featured badge | TOP pill | ✅ | OK |
| Glow types | 5 | ✅ 5 | OK |
| Anim intensity | --anim-int CSS var | ¿existe? | CHECK |
| Audio error recovery | retry+timeout | ¿existe? | CHECK |
| Grain overlay | SVG pattern | ¿está? | CHECK |
| Floating orbs | 3 orbs | ¿están? | CHECK |
| Nav scroll-aware | hide/show | ¿está? | CHECK |

---

## 🔧 Issues Conocidos Pendientes

1. **Waveform bars** — `Math.random()` en cada render causa re-layout
2. **use:reveal** — ya fixeado con `{{}}` pero verificar en browser
3. **BeatCard role="button"** — a11y warning, verificar si causa problemas
4. **Empty CSS rulesets** en Player — limpiar
5. **Section divider em** — CSS unused selector

---

## 📁 Archivos Clave para Revisar

```
src/app.css                          — 1188 líneas CSS
src/lib/actions.ts                   — 7 actions
src/lib/cardStyleEngine.ts           — 44 anim presets
src/lib/icons.ts                     — 20 icons
src/lib/firebase.ts                  — Firebase init
src/lib/stores/settings.ts           — 510 líneas (más grande)
src/lib/stores/beats.ts              — CRUD functions
src/lib/stores/player.ts             — Audio state
src/lib/components/BeatCard.svelte   — 386 líneas
src/lib/components/Player.svelte     — 304 líneas
src/lib/components/Filters.svelte    — 433 líneas
src/lib/components/BeatEditor.svelte — 643 líneas (más grande)
src/routes/(store)/+page.svelte      — 657 líneas (store page)
src/routes/(store)/+layout.svelte    — 763 líneas (más grande)
src/routes/(store)/beat/[id]/+page.svelte — 729 líneas
src/routes/(admin)/+layout.svelte    — 209 líneas
src/routes/(admin)/admin/beats/+page.svelte — 613 líneas
```

---

**Generado: 2026-04-21 00:06 — Para siguiente sesión de pulido**
