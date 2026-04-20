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

## Referencia

- **Catalog CSS:** `store-styles.css` (765 líneas)
- **Catalog effects:** `effects.js` (cursor glow, parallax, tilt, sibling blur)
- **Catalog cards:** `cards.js` (card rendering, glow, animations)
- **Store CSS:** `src/app.css` (990 líneas)
- **Store cards:** `src/lib/components/BeatCard.svelte`
- **Store engine:** `src/lib/cardStyleEngine.ts`

---

*Plan creado: 2026-04-20 — v1.0*
