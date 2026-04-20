# 🎨 PLAN DE DISEÑO — Catalog → Store (Adaptado)

> Basado en análisis visual profundo del catalog v5.2 vs store actual.
> Cada item es un incremento medible. No romper lo que funciona.

---

## Gap Analysis: Catalog vs Store

| Feature | Catalog v5.2 | Store (actual) | Gap |
|---------|-------------|----------------|-----|
| Cursor glow | Lerp suave (0.08 factor) | Raw mouse pos | 🟡 Medio |
| Card shadow | `0 12px 40px rgba(0,0,0,0.5)` | `var(--shadow-lg)` más ligero | 🟡 Medio |
| Card hover | Dual shadow + accent glow | Single shadow + border | 🟡 Medio |
| Sibling blur | JS-driven, blurs neighbors | ❌ No tiene | 🟠 Alto |
| Hero parallax | translateY + opacity on scroll | ❌ Solo CSS animation | 🟠 Alto |
| Scroll progress | 3-color gradient bar | Solid accent bar | 🟢 Bajo |
| Waveform on cards | Animated bars (20 bars) | ❌ No tiene | 🟠 Alto |
| Keyframes | 40+ (holograma, glitch, neon, etc.) | 18 keyframes | 🟡 Medio |
| Play pulse ring | box-shadow pulse on click | ❌ No tiene | 🟡 Medio |
| Featured badge | "TOP" pill overlay | ❌ No tiene | 🟢 Bajo |
| Glow types | 5 (active, rgb, pulse, breathe, neon) | 5 (same names, less CSS) | 🟢 Bajo |
| Animation intensity | --anim-int CSS var system | ❌ No tiene | 🟡 Medio |
| Card inner wrapper | .beat-card-inner for 3D transforms | Direct on card element | 🟡 Medio |
| Stagger reveal | IntersectionObserver per-card | ✅ use:staggerReveal | ✅ OK |
| Tilt action | perspective 800px, scale 1.01 | perspective 600px, no scale | 🟢 Bajo |
| Audio error recovery | Retry + timeout + visual feedback | ❌ No tiene | 🟡 Medio |
| Grain overlay | ✅ Same SVG pattern | ✅ Same | ✅ OK |
| Floating orbs | 3 orbs with orbF animation | 3 orbs with gradientShift | ✅ OK |
| Nav scroll-aware | hide on scroll down, show on scroll up | ✅ Same behavior | ✅ OK |
| Glassmorphism nav | backdrop-filter blur 24px | ✅ Same | ✅ OK |
| Fonts | Syne + DM Mono | Syne + Space Grotesk + DM Mono | ✅ OK (mejor) |

---

## Plan de Mejoras (orden de impacto)

### FASE 1: Card Visual Depth (alto impacto, bajo riesgo)

#### 1.1 Card Shadow Upgrade
**Qué:** Sombra más profunda en cards, igual que catalog.
**Por qué:** El catalog tiene cards que "flotan" sobre el fondo. El store tiene cards más planos.
```css
/* ANTES */
--shadow-lg: 0 8px 32px rgba(0,0,0,0.5);
/* DESPUÉS (match catalog) */
beat-card: box-shadow: 0 12px 40px rgba(0,0,0,0.5);
```
**Archivos:** `BeatCard.svelte` (CSS)

#### 1.2 Card Hover Dual Shadow
**Qué:** Hover con doble sombra: depth + accent glow, igual que catalog.
```css
/* ANTES */
box-shadow: var(--shadow-lg), 0 0 30px rgba(var(--accent-rgb), 0.08);
/* DESPUÉS */
box-shadow: 0 20px 60px rgba(0,0,0,0.4), 0 0 30px rgba(var(--accent-rgb), 0.08);
```
**Archivos:** `BeatCard.svelte` (CSS)

#### 1.3 Play Pulse Ring
**Qué:** Al hacer play, ring animado de box-shadow (no afecta la card animation).
**Por qué:** Feedback visual inmediato sin interrumpir animaciones de la card.
**Archivos:** `BeatCard.svelte` + `app.css` (nueva keyframe)

#### 1.4 Featured Badge
**Qué:** Badge "TOP" para beats featured (campo `beat.featured`).
**Archivos:** `BeatCard.svelte`, `beats.ts` (tipo)

---

### FASE 2: Scroll Effects (alto impacto, medio riesgo)

#### 2.1 Hero Parallax
**Qué:** Hero se mueve con scroll (translateY + opacity fade).
**Por qué:** Crea profundidad y transición suave al contenido.
**Archivos:** `+layout.svelte` (onScroll handler)

#### 2.2 Cursor Glow Lerp
**Qué:** Cursor glow con interpolación suave (factor 0.08) en vez de position directa.
**Por qué:** El glow se siente "pegajoso" de forma elegante, no sigue el mouse bruscamente.
**Archivos:** `+layout.svelte` (onMouseMove → rAF lerp)

#### 2.3 Scroll Progress Gradient
**Qué:** Barra de progreso con gradiente 3 colores.
```css
background: linear-gradient(90deg, var(--accent), #ff6b6b, var(--accent));
```
**Archivos:** `+layout.svelte` (CSS inline style)

---

### FASE 3: Card Effects Avanzados (alto impacto, medio riesgo)

#### 3.1 Sibling Blur
**Qué:** Al hover una card, las demás se difuminan ligeramente.
**Por qué:** Enfoca la atención. El catalog lo tiene como feature principal.
**Implementación:** Svelte action `siblingBlur` que aplica filtro a cards hermanas.
**Archivos:** `actions.ts` (nueva action), `+page.svelte` (use:siblingBlur en grid)

#### 3.2 Waveform en Cards
**Qué:** Barras de waveform animadas en cards cuando se reproduce.
**Por qué:** Feedback visual de audio. El catalog lo tiene con 20 barras.
**Archivos:** `BeatCard.svelte` (nuevo componente inline)

#### 3.3 Card Animation Intensity
**Qué:** Sistema `--anim-int` para controlar intensidad de animaciones.
**Por qué:** Permite que el admin ajuste qué tan fuerte son las animaciones.
**Archivos:** `app.css` (CSS vars), `cardStyleEngine.ts`

---

### FASE 4: Keyframes & Polish (medio impacto, bajo riesgo)

#### 4.1 Keyframes Faltantes
**Qué:** Agregar keyframes del catalog que no están en el store:
- `holograma`, `holograma-gradient`, `holograma-pulse`
- `glitch`, `neon-flicker`
- `heartbeat`, `tada`, `rubber-band`, `jello`, `swing`
- `bounce-in`, `elastic`, `flip`
- `wobble`, `shake-x`, `temblor`, `balanceo`
- `drift`, `respirar`, `latido`
**Archivos:** `app.css`

#### 4.2 Audio Error Recovery
**Qué:** Retry automático con timeout + feedback visual.
**Por qué:** UX robusta si el audio falla.
**Archivos:** `player.ts`

#### 4.3 Card Inner Wrapper
**Qué:** Envolver card content en `.beat-card-inner` para transforms separados.
**Por qué:** Permite 3D tilt en el wrapper sin afectar el positioning del card.
**Archivos:** `BeatCard.svelte` (estructura HTML)

---

## Ejecución

Cada fase se implementa en orden. Dentro de cada fase, por orden de impacto.

- **Test:** Build + visual check después de cada fase
- **Commit:** Después de cada fase completa
- **No romper:** Si algo afecta la tienda existente, revertir ese item específico

---

## 📋 AUDIT POR FASE (post-implementación)

Cada fase termina con un audit obligatorio antes de pasar a la siguiente.

### Audit Template (por fase)

```
FASE X — AUDIT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. BUILD:     ✅/❌ (0 errores)
2. VISUAL:    ✅/❌ (¿se ve bien?)
3. REGRESSION: ✅/❌ (¿algo se rompió?)
4. MOBILE:    ✅/❌ (¿responsive OK?)
5. A11Y:      ✅/❌ (¿focus, aria, keyboard?)
6. TOKENS:    ✅/❌ (¿0 hardcoded colors/sizes?)
7. CLEANUP:   ✅/❌ (¿dead code, console.logs?)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Resultado: PASS / FIX-NEEDED (items)
```

### Checklist específico por fase

**Fase 1 — Card Visual Depth:**
- [ ] Shadow visible en dark bg (no se pierde)
- [ ] Hover shadow no causa layout shift
- [ ] Play pulse se resetea correctamente (no se queda "pulsando")
- [ ] Featured badge no se superpone con cover image
- [ ] Featured badge no interfiere con play button overlay
- [ ] Cards sin `beat.featured` no muestran badge

**Fase 2 — Scroll Effects:**
- [ ] Cursor glow no aparece en mobile (touch)
- [ ] Lerp no causa jank (60fps en rAF)
- [ ] Hero parallax no rompe el layout al top
- [ ] Hero opacity no desaparece completamente (min 0.3)
- [ ] Scroll progress bar no bloquea clicks
- [ ] Gradient visible sobre dark bg

**Fase 3 — Card Effects:**
- [ ] Sibling blur solo en desktop (hover: hover)
- [ ] Blur no afecta al card que se hace hover
- [ ] Blur se quita al mouse leave (no queda borroso)
- [ ] Performance: blur no causa lag con 20+ cards
- [ ] Sibling blur no interfiere con staggerReveal

**Fase 4 — Keyframes:**
- [ ] Keyframes no generan warnings en build
- [ ] `prefers-reduced-motion` las desactiva
- [ ] No hay conflictos con keyframes existentes
- [ ] Nombres no colisionan con Svelte built-ins

---

## Referencia

- **Catalog CSS:** `store-styles.css` (765 líneas)
- **Catalog effects:** `effects.js` (cursor glow, parallax, tilt, sibling blur)
- **Catalog cards:** `cards.js` (card rendering, glow, animations)
- **Store CSS:** `src/app.css` (990 líneas)
- **Store cards:** `src/lib/components/BeatCard.svelte`
- **Store engine:** `src/lib/cardStyleEngine.ts`

---

*Plan creado: 2026-04-20 — v1.0*

---

# 🏗️ MEGA PLAN DE CONSTRUCCIÓN — Store Completo

> Audit profundo de TODO el proyecto (2026-04-20 23:11).
> 69 archivos, 9613 líneas, 29 componentes, 10 stores, 11 rutas.
> Este plan cubre lo que FALTA para que la tienda esté 100% lista.

---

## Estado Actual (post-audits)

```
TIENDA (público)                    ADMIN (privado)
━━━━━━━━━━━━━━━━━━━━━━━━           ━━━━━━━━━━━━━━━━━━━━━━━━
✅ Store page (hero, grid, filtros) ✅ Dashboard
✅ Beat Page (/beat/[id])           ✅ Beats CRUD (list + editor 5 tabs)
✅ Player bar                       ✅ Hero Editor (385 líneas)
✅ Filters (search, genre, key)     ✅ Content Editor (section, CTA, labels)
✅ Wishlist panel                   ✅ Theme Editor (colores, glow, fonts)
✅ Testimonials                     ✅ Banner Editor
✅ Login page                       ✅ Brand Editor
✅ Error page (404)                 ✅ Layout Editor
✅ Beat Modal (legacy)              ✅ Animations Editor
                                    ✅ Route guards (auth + admin check)
```

**Build:** ✅ 0 errores | **TypeScript:** ✅ 0 `any` | **Firebase Rules:** ✅ Validadas

---

## GAP ANALYSIS: Catalog → Store (features que faltan)

| # | Feature Catalog | Store Status | Prioridad | Esfuerzo |
|---|----------------|-------------|-----------|----------|
| 1 | Featured beats section ("Destacados") | ❌ No tiene | 🟠 Alto | 30 min |
| 2 | Custom links en hero (debajo del título) | ❌ No tiene | 🟡 Medio | 20 min |
| 3 | Animated stat counters (count-up) | ❌ Estático | 🟡 Medio | 15 min |
| 4 | Waveform bars en cards al reproducir | ❌ No tiene | 🟡 Medio | 45 min |
| 5 | Floating elements (admin-configurable) | ❌ No tiene | 🟢 Bajo | 1h |
| 6 | SoundCloud waveform real (Web Audio) | ❌ Solo visual | 🟢 Bajo | 1h |
| 7 | 40+ animation presets (store solo 10) | ❌ Solo 10 | 🟢 Bajo | 30 min |
| 8 | Play pulse non-disruptivo en card anim | ✅ Fixeado | ✅ | — |

---

## GAP ANALYSIS: Admin (funcionalidad que falta)

| # | Feature | Status | Prioridad | Esfuerzo |
|---|---------|--------|-----------|----------|
| 1 | Save status wired a Firebase | ⚠️ Dummy | 🟠 Alto | 20 min |
| 2 | Auto-save con debounce | ❌ No tiene | 🟠 Alto | 30 min |
| 3 | Undo/redo en admin | ❌ No tiene | 🟡 Medio | 1h |
| 4 | Export/import data (JSON) | ❌ No tiene | 🟡 Medio | 30 min |
| 5 | Storage rules (Firebase) | ❌ No tiene | 🟠 Alto | 10 min |
| 6 | Bulk actions (activate/deactivate) | ❌ No tiene | 🟡 Medio | 30 min |
| 7 | Keyboard shortcuts globales admin | ⚠️ Solo Ctrl+S | 🟢 Bajo | 15 min |
| 8 | Changelog de cambios | ❌ No tiene | 🟢 Bajo | 20 min |

---

## GAP ANALYSIS: Quality & Deploy

| # | Feature | Status | Prioridad | Esfuerzo |
|---|---------|--------|-----------|----------|
| 1 | Cloudflare Pages config | ⚠️ wrangler.jsonc existe, sin deploy | 🟠 Alto | 15 min |
| 2 | OG image por defecto | ❌ No tiene | 🟡 Medio | 10 min |
| 3 | Sitemap.xml | ❌ No tiene | 🟡 Medio | 10 min |
| 4 | robots.txt | ❌ No tiene | 🟢 Bajo | 5 min |
| 5 | Lazy load imágenes (beat cards) | ✅ Ya tiene | ✅ | — |
| 6 | Code splitting (admin routes) | ⚠️ SvelteKit default | 🟢 Bajo | 0 min |
| 7 | Performance audit (Lighthouse) | ❌ No hecho | 🟡 Medio | 20 min |
| 8 | favicons (og:image, apple-touch) | ❌ Solo SVG | 🟢 Bajo | 10 min |

---

## MEGA PLAN — Ejecución por Orden

### 🟠 PRIORIDAD 1: Crítico para funcionalidad (hoy)

```
1.1  Save status → Firebase (admin layout)
1.2  Auto-save debounce (BeatEditor)
1.3  Firebase Storage rules
1.4  Featured beats section (store page)
1.5  Cloudflare deploy config check
```

### 🟡 PRIORIDAD 2: Features importantes (esta semana)

```
2.1  Animated stat counters
2.2  Custom links en hero
2.3  Undo/redo admin
2.4  Export/import data
2.5  OG image por defecto
2.6  Sitemap + robots.txt
2.7  Bulk actions (admin beats)
2.8  Waveform bars en cards
```

### 🟢 PRIORIDAD 3: Polish & extras (cuando haya tiempo)

```
3.1  Floating elements (admin)
3.2  40+ animation presets
3.3  Keyboard shortcuts admin
3.4  Changelog de cambios
3.5  Performance audit (Lighthouse)
3.6  Apple-touch icon + favicon PNG
3.7  SoundCloud waveform real
3.8  WebGL hero background (futuro)
```

---

## Detalle por Item

### 1.1 Save status → Firebase
**Qué:** El `saveStatus` en admin layout es un state dummy. Conectarlo al `settings.update()` real.
**Dónde:** `(admin)/+layout.svelte` + cada admin page
**Cómo:** Cada page pasa `saveStatus` que refleja el estado real del write a Firebase.

### 1.2 Auto-save con debounce
**Qué:** BeatEditor guarda automáticamente 1s después del último cambio.
**Dónde:** `BeatEditor.svelte`
**Cómo:** `$effect` + `setTimeout` → `updateBeat()` + toast de confirmación.

### 1.3 Firebase Storage rules
**Qué:** Reglas para que solo admin pueda subir/borrar archivos.
**Dónde:** `storage.rules` (ya existe pero necesita validación)
**Cómo:** Verificar que la regla actual es correcta.

### 1.4 Featured beats section
**Qué:** Sección "Destacados" entre el hero y el catálogo, muestra beats con `featured: true`.
**Dónde:** `+page.svelte` (store)
**Cómo:** Nuevo bloque con grid de BeatCards, máximo 4, solo si hay featured.

### 1.5 Cloudflare deploy config
**Qué:** Verificar que `wrangler.jsonc` tiene la config correcta para deploy.
**Dónde:** `wrangler.jsonc`
**Cómo:** Check + fix si necesario.

### 2.1 Animated stat counters
**Qué:** Los números del hero (beats, géneros, licencias) animan de 0 al valor real.
**Dónde:** `+page.svelte` (store)
**Cómo:** Svelte action `animateCounter` o simple CSS counter + IntersectionObserver.

### 2.2 Custom links en hero
**Qué:** Botones de links (WhatsApp, Instagram, etc.) debajo del título hero.
**Dónde:** `+page.svelte` (store)
**Cómo:** Render `settings.links` como botones con estilos de marca.

### 2.3 Undo/redo admin
**Qué:** Botones undo/redo que deshacen/rehacen cambios en settings.
**Dónde:** `settings.ts` store + `AdminTopbar.svelte`
**Cómo:** Stack de cambios (max 20), pop/push al hacer undo/redo.

### 2.4 Export/import data
**Qué:** Botón para descargar todos los settings+beats como JSON, y subir para restaurar.
**Dónde:** Admin dashboard o topbar
**Cómo:** `JSON.stringify` + `Blob` + download. Import: `FileReader` + `settings.set()`.

### 2.5 OG image
**Qué:** Imagen por defecto para social sharing (og:image).
**Dónde:** `static/og-image.png` + `+layout.svelte`
**Cómo:** Crear imagen 1200x630, referenciar en `<meta>`.

### 2.6 Sitemap + robots
**Qué:** Archivos SEO básicos.
**Dónde:** `static/sitemap.xml`, `static/robots.txt`
**Cómo:** Archivos estáticos simples.

### 2.7 Bulk actions
**Qué:** Seleccionar múltiples beats y activar/desactivar/borrar de golpe.
**Dónde:** `admin/beats/+page.svelte`
**Cómo:** Checkboxes + action bar when selected.

### 2.8 Waveform bars en cards
**Qué:** Barras animadas en el BeatCard cuando el beat está reproduciéndose.
**Dónde:** `BeatCard.svelte`
**Cómo:** 15-20 divs con height random, animados cuando `$player.beatId === beat.id`.

---

## Execution Order (próxima sesión)

```
SESIÓN A (hoy, si queda tiempo):
  1.1 → 1.2 → 1.3 → 1.4 → 1.5
  Commit: "admin: save status + auto-save + featured section + deploy config"

SESIÓN B (siguiente):
  2.1 → 2.2 → 2.5 → 2.6 → 2.4
  Commit: "features: animated counters, hero links, OG, sitemap, export"

SESIÓN C:
  2.3 → 2.7 → 2.8 → 3.1 → 3.2
  Commit: "admin: undo/redo, bulk actions, waveform cards, animations"

SESIÓN D (polish final):
  3.3 → 3.4 → 3.5 → 3.6 → Lighthouse audit
  Commit: "polish: shortcuts, changelog, perf audit, favicons"
```

---

## Reglas del Mega Plan

1. **Cada item se testea antes de marcar ✅**
2. **Build debe pasar después de cada item**
3. **Commit por sesión (no por item individual)**
4. **Si un item bloquea otro, se hace primero**
5. **No inventar features que no están en el plan**
6. **Audit al final de cada sesión**

---

*Mega plan: 2026-04-20 23:11 — v1.0*
*Basado en audit de 69 archivos, 9613 líneas de código*
