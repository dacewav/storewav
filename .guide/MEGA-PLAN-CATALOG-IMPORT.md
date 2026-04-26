# 🔥 MEGA PLAN — Importar estilos del Catalog a la Tienda

> **Fecha**: 2026-04-26 (Sesión 44+)
> **Fuente**: `dacewav/catalog` → `dacewav/storewav`
> **Objetivo**: Paridad visual con el catalog — cards premium, animaciones ricas, presets bonitos

---

## 🔴 Problemas actuales

### 1. Cards transparentes (partículas se ven through)
- Los beat cards usan `opacity` del theme engine que hace el fondo semi-transparente
- Las partículas se ven **a través** de los cards porque están en un layer superior
- **Fix**: Ajustar z-index de partículas (`z-index: 0`) vs cards (`z-index: 1`), y/o usar `background` sólido en vez de solo `opacity`

### 2. Presets feos
- Store tiene 8 presets básicos: `clean`, `noir`, `neon`, `vintage`, `dreamy`, `brutalist`, `glass`, `warm`
- Catalog tiene **13 presets premium**: `Limpio`, `Cine`, `Noir`, `Retiro`, `Brasa`, `Escarcha`, `Cristal`, `Holo`, `Flota`, `Glitch`, `Eco`, `Pop`, `Abismo`
- Cada preset del catalog es un **cardStyle completo** con: filtros, glow, animación, borde, sombra, hover, transform
- Los presets del store son genéricos y no configuran animaciones ni hover

### 3. Animaciones limitadas
- Store: 9 animaciones básicas (float, pulse, bounce, spin, shake, glow, slide-up, slide-down, fade-in)
- Catalog: **40+ animaciones** incluyendo:
  - Holograma (hue-rotate cycling con brillo/saturación)
  - Glitch (distorsión controlada con aberración cromática)
  - Neon flicker (parpadeo neón con brillo)
  - Drift (traslación + rotación orgánica)
  - Wobble, Jello, Rubber band, Flip, Swing, Tada, Bounce-in, Elastic
  - Heartbeat, Latido, Respirar, Zoom-in/out, Pop
  - Temblor, Balanceo, Deslizar (4 direcciones)
  - Spin rápido, Fade-in, Typing

### 4. Sistema de intensidad de animación
- Catalog: `--anim-int: 0-1` controla la fuerza de cada animación per-card
- Store: no tiene este sistema — las animaciones son binarias (on/off)

### 5. Animaciones secundarias (anim2)
- Catalog: sistema `anim2-*` para animaciones en `::before` pseudo-elements
- Permite combinar 2 animaciones por card (ej: flotar + glitch)
- Store: no tiene

### 6. Parámetros de animación editables
- Catalog: cada animación tiene parámetros editables:
  - `--anim-translate-x/y` (distancia)
  - `--anim-rotate-angle` (grados)
  - `--anim-scale-min/max` (escala)
  - `--anim-shake-x/y` (intensidad shake)
  - `--anim-hue-start/end` (holograma)
  - `--anim-glitch-x/y/rot` (glitch)
  - `--anim-neon-min/max/bright` (neon flicker)
  - `--anim-parpadeo-min/max` (parpadeo)
  - `--anim-brillo-min/max` (brillo)
  - `--anim-cs-hue-start/end/sat` (cambio-color)
  - `--anim-holo-bright-min/max/sat-min/max/blur` (holograma)
- Store: no tiene parámetros editables

### 7. Efectos holográficos
- Catalog: `holograma`, `holograma-gradient`, `holograma-pulse` con colores custom (`--holo-c0` a `--holo-c3`)
- Overlay `::after` con `mix-blend-mode: overlay` y `background-size: 400% 400%`
- Store: no tiene

### 8. Filtros CSS per-card
- Catalog: brillo, contraste, saturación, opacidad, grayscale, sepia, hue-rotate, blur, invert, drop-shadow
- Store: tiene algunos pero no todos están expuestos en el admin

### 9. Hover avanzado
- Catalog: scale, brightness, saturate, shadowBlur, transition, borderColor, glowIntensify, blur, siblingsBlur, hueRotate, opacity, enableAnim, animType, animDur
- Store: solo scale, brightness, saturate, hoverTransition

### 10. Transform per-card
- Catalog: rotate, scale, skewX, skewY, x, y
- Store: no tiene

---

## 📋 Plan de implementación

### Fase 1: Fix bugs críticos (1 sesión)
**Prioridad: 🔴**

1. **Fix z-index de partículas vs cards**
   - `Particles.svelte`: `z-index: 0` o `pointer-events: none`
   - Beat cards: `z-index: 1` y `position: relative`
   - Verificar que las partículas NO se vean a través de los cards

2. **Mejorar presets existentes**
   - Reemplazar los 8 presets básicos con los 13 premium del catalog
   - Cada preset debe incluir: filtros, glow, animación, borde, sombra, hover, transform
   - Importar `EFFECT_PRESETS` del catalog (adaptar a Svelte store)

### Fase 2: Sistema de animaciones (1 sesión)
**Prioridad: 🟡**

3. **Importar las 40+ keyframes del catalog**
   - Copiar todos los `@keyframes` del catalog a `app.css`
   - Agregar las utility classes `.anim-*` correspondientes
   - Testear que no rompan el build

4. **Sistema de intensidad `--anim-int`**
   - Agregar `--anim-int` como CSS variable per-card
   - Slider en Card Style para controlar intensidad (0-1)
   - Aplicar a todas las animaciones via `calc()`

5. **Parámetros editables de animación**
   - Agregar campos en Card Style para los parámetros por animación:
     - Translate X/Y, Rotate angle, Scale min/max
     - Shake X/Y, Hue start/end, Glitch X/Y/rot
     - Neon min/max/bright, Parpadeo min/max
   - Guardar como CSS custom properties en el cardStyle

### Fase 3: Efectos avanzados (1 sesión)
**Prioridad: 🟢**

6. **Sistema anim2 (animaciones secundarias)**
   - Agregar campo `anim2` en cardStyle
   - Aplicar en `::before` pseudo-element
   - Utility classes `.anim2-*` (solo transform/opacity-based, no filter)

7. **Efectos holográficos**
   - `holograma`, `holograma-gradient`, `holograma-pulse`
   - Colores custom `--holo-c0` a `--holo-c3`
   - Overlay `::after` con `mix-blend-mode: overlay`

8. **Hover avanzado**
   - Agregar: blur, siblingsBlur, hueRotate, opacity, enableAnim, animType, animDur
   - UI en Card Style para cada campo

9. **Transform per-card**
   - Agregar: rotate, scale, skewX, skewY, x, y
   - UI con sliders en Card Style

### Fase 4: Galería de efectos (1 sesión)
**Prioridad: 🟢**

10. **Galería visual de presets**
    - Grid de cards con preview de cada efecto
    - Click para aplicar
    - Categorías: Base, Color, Glow, Animación
    - Preview en mini-card con el efecto aplicado

11. **Snapshots (antes/después)**
    - Guardar estado actual del cardStyle
    - Comparar visualmente antes/después
    - Botón para revertir

---

## 📊 Diferencias técnicas

| Feature | Catalog (HTML/JS) | Store (Svelte) | Gap |
|---------|-------------------|----------------|-----|
| Presets | 13 premium | 8 básicos | +5 presets premium |
| Animaciones | 40+ | 9 | +31 animaciones |
| Anim intensity | `--anim-int` | No | Nuevo sistema |
| Anim2 | `::before` anim | No | Nuevo sistema |
| Holo effects | `::after` overlay | No | Nuevo sistema |
| Anim params | 20+ vars | 0 | Nuevo sistema |
| CSS filters | 10 per-card | 6 | +4 filtros |
| Hover props | 12 | 4 | +8 props |
| Transform | 6 DoF | 0 | Nuevo sistema |
| Gallery | Visual grid | No | Nuevo UI |
| Snapshots | Sí | No | Nuevo feature |

---

## 🔧 Archivos a modificar

### CSS
- `src/app.css` — agregar 30+ keyframes y utility classes

### Stores
- `src/lib/stores/settings.ts` — agregar campos de cardStyle extendidos
- `src/lib/cardStyleEngine.ts` — importar EFFECT_PRESETS, aplicar anim2/hover/transform

### Components
- `src/lib/components/BeatCard.svelte` — aplicar anim2, hover avanzado, transform
- `src/lib/components/Particles.svelte` — fix z-index
- `src/routes/(admin)/admin/cardstyle/+page.svelte` — UI para nuevos campos

### Admin
- `src/routes/(admin)/admin/cardstyle/+page.svelte` — galería de efectos, snapshots
- `src/routes/(admin)/admin/animations/+page.svelte` — parámetros editables

---

## 🎯 Orden de ejecución

1. **Fix z-index partículas** (15 min) — bug crítico
2. **Importar keyframes del catalog** (20 min) — foundation
3. **Reemplazar presets** (30 min) — impacto visual inmediato
4. **Sistema --anim-int** (20 min) — foundation para todo
5. **Parámetros editables** (45 min) — UX
6. **Hover avanzado** (30 min) — UX
7. **anim2 + holo** (45 min) — premium effects
8. **Galería visual** (30 min) — UX final

**Total estimado: ~3.5 horas (4-5 sesiones)**
