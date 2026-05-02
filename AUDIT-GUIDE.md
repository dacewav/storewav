# StoreWav — Guía de Auditoría & Mejoras
**Última actualización:** 2026-05-02 | **Sesión 66**

---

## 📋 Resumen Ejecutivo

Auditoría profunda de UX/Visual/Performance en toda la aplicación: store (nav, cards, player, favoritos, carrito, login, beat detail) y admin (dashboard, sidebar, topbar, modals, toasts, layout).

**Hallazgo principal:** La app tiene una base sólida (buen sistema de temas, animaciones, accesibilidad), pero le falta **microinteracciones** y **polish de transiciones** que separan lo "funcional" de lo "impresionante".

---

## ✅ Items Completados (Sesiones anteriores)

| # | Item | Status | Sesión |
|---|------|--------|--------|
| 1 | Admin login — retry + timeout | ✅ | 62 |
| 2 | Connection grace period | ✅ | 62 |
| 3 | Login page UX | ✅ | 62 |
| 4 | signInWithRedirect | ✅ | 62 |
| 5 | CSP frame-src firebaseapp | ✅ | 62 |
| 6 | CSP connect-src firebaseapp | ✅ | 62 |
| 7 | .env configuración | ✅ | 62 |
| 8 | Search typeahead keyboard nav | ✅ | 63 |
| 9 | Loading skeletons | ✅ | 63 |
| 10 | Image optimization audit | ✅ | 63 |
| 11 | SEO meta tags | ✅ | 63 |
| 12 | Performance bundle analysis | ✅ | 63 |
| 13 | Accessibility audit | ✅ | 63 |
| 14 | Firebase retry + offline | ✅ | 63 |
| 15 | i18n audit | ✅ | 63 |

---

## 🔴 Items 16-22: Microinteracciones & Polish Visual (NUEVO)

### 16. Nav Badges — Sin animación de aparición
**Severidad:** Alta | **Esfuerzo:** Bajo | **Impacto:** Alto
**Status:** ✅ IMPLEMENTADO (sesión anterior)
**Animación:** `badgePop` keyframe con scale(0)→scale(1.2)→scale(1)

**Problema:** Los badges del corazón ❤️ y campana 🔔 aparecen/desaparecen de golpe. Sin transición, sin "pop", sin feedback cuando cambia el valor.

**Código actual** (`+layout.svelte`):
```svelte
{#if wishCount > 0}
  <span class="nav-badge">{wishCount}</span>
{/if}
```

**Mejora sugerida:**
```css
/* Pop-in animation */
@keyframes badgePop {
  0% { transform: scale(0); opacity: 0; }
  60% { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
}

.nav-badge {
  animation: badgePop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Pulse when value changes */
@keyframes badgePulse {
  0% { box-shadow: 0 0 0 0 rgba(var(--accent-rgb), 0.6); }
  100% { box-shadow: 0 0 0 8px rgba(var(--accent-rgb), 0); }
}
```

**Archivos:** `src/routes/(store)/+layout.svelte`

---

### 17. WishlistPanel — Items sin stagger, exit sin animación
**Severidad:** Alta | **Esfuerzo:** Medio | **Impacto:** Alto
**Status:** ✅ IMPLEMENTADO (sesión 67)

**Problema:**
- Items aparecen todos de golpe al abrir el panel (sin stagger)
- Al quitar un item, desaparece sin transición
- Hover en items es sutil (`translateX(2px)` casi imperceptible)
- Empty state genérico (solo corazón + texto)

**Mejora sugerida:**
1. **Stagger animation** al abrir: cada item entra con delay incremental (60ms)
2. **Exit animation** al quitar: slide-out izquierda + fade + height collapse
3. **Hover más pronounced**: scale(1.02) + accent border glow
4. **Empty state mejorado**: animación de floating corazón + CTA button con glow

**Archivos:** `src/lib/components/WishlistPanel.svelte`

---

### 18. BeatCard Wishlist Button — Sin burst effect al dar like
**Severidad:** Alta | **Esfuerzo:** Bajo | **Impacto:** Alto
**Status:** ✅ IMPLEMENTADO (sesión anterior)

**Problema:** El botón de wishlist en las BeatCards (`beat-wish`) solo cambia el ícono de outline a filled. Sin animación de "me gusta". El `LikeButton` tiene `heartBurst` pero el botón del card no.

**Mejora sugerida:**
```css
.beat-wish.just-liked::after {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(var(--accent-rgb), 0.4), transparent 70%);
  animation: wishBurst 0.5s ease-out forwards;
  pointer-events: none;
}

@keyframes wishBurst {
  0% { transform: scale(0.5); opacity: 1; }
  100% { transform: scale(2.5); opacity: 0; }
}
```

**Archivos:** `src/lib/components/BeatCard.svelte`

---

### 19. Player — Cover sin rotación, mini waveform decorativo
**Severidad:** Media | **Esfuerzo:** Medio | **Impacto:** Alto
**Status:** ✅ IMPLEMENTADO (sesión 67)

**Problema:**
- Cover tiene `play-cover-pulse` (scale) pero no rotación sutil tipo vinilo
- Mini waveform (`Waveform` component) es puramente decorativo — no refleja audio real
- Skip buttons ocultos en mobile (se pierde funcionalidad)
- No muestra género del beat

**Mejoras sugeridas:**
1. **Cover rotation**: rotación sutil (2deg oscillation) cuando está playing
2. **Genre badge** en el player info
3. **Mobile skip**: mantener skip como gestos swipe en el cover area
4. **Waveform**: conectar al AnalyserNode del audio para reflejar frecuencias reales

**Archivos:** `src/lib/components/Player.svelte`, `src/lib/components/Waveform.svelte`

---

### 20. AuthButton Dropdown — Sin animación de entrada
**Severidad:** Media | **Esfuerzo:** Bajo | **Impacto:** Medio
**Status:** ✅ IMPLEMENTADO (sesión anterior)

**Problema:** El dropdown de usuario aparece de golpe. Sin fade, sin scale, sin transform-origin.

**Mejora sugerida:**
```css
.auth-dropdown {
  animation: dropdownIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-origin: top right;
}

@keyframes dropdownIn {
  from { opacity: 0; transform: scale(0.95) translateY(-4px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
```

**Archivos:** `src/lib/components/AuthButton.svelte`

---

### 21. Página de Favoritos — Grid estática, sin vida
**Severidad:** Media | **Esfuerzo:** Medio | **Impacto:** Medio
**Status:** ✅ IMPLEMENTADO (sesión 67)

**Problema:** `/account/favorites` es una grid estática de BeatCards. Sin stagger, sin animación de entrada, sin filtros, sin acciones bulk.

**Mejoras sugeridas:**
1. Agregar `staggerReveal` como tiene la página principal
2. Header con contador animado (countUp)
3. Filtros básicos (por género)
4. Acción "Quitar todos" con confirmación
5. Transición al quitar un like (exit animation)

**Archivos:** `src/routes/(store)/account/favorites/+page.svelte`

---

### 22. Toast Container — Posición subóptima en mobile
**Severidad:** Baja | **Esfuerzo:** Bajo | **Impacto:** Medio
**Status:** ✅ IMPLEMENTADO (sesión 67)

**Problema:** Los toasts aparecen centrados abajo. En mobile, pueden tapar el player bar o los botones de acción.

**Mejora sugerida:** En mobile, posicionar toasts más arriba (top-safe-area) o usar el espacio entre el player y el contenido.

**Archivos:** `src/lib/components/ToastContainer.svelte`

---

## 🟡 Items 23-30: Admin UX & Store Pages (NUEVO)

### 23. Admin Dashboard — Stats cards sin animación de números
**Severidad:** Media | **Esfuerzo:** Bajo | **Impacto:** Medio
**Status:** ✅ IMPLEMENTADO (sesión 67)

**Problema:** Las stat cards del dashboard muestran números estáticos. La página principal tiene `use:countUp` para animar números, pero el admin dashboard no.

**Mejora sugerida:** Agregar `countUp` action a las stat cards del dashboard.

**Archivos:** `src/routes/(admin)/admin/+page.svelte`

---

### 24. Admin Sidebar — Colapsar sin transición de labels
**Severidad:** Baja | **Esfuerzo:** Bajo | **Impacto:** Medio
**Status:** ✅ IMPLEMENTADO (sesión 67)

**Problema:** Al colapsar el sidebar, los labels desaparecen instantáneamente (`display: none`). No hay fade ni width transition suave.

**Mejora sugerida:**
```css
.sidebar.collapsed .si-label {
  opacity: 0;
  width: 0;
  overflow: hidden;
  transition: opacity 0.2s, width 0.2s;
}
```

**Archivos:** `src/routes/(admin)/+layout.svelte`

---

### 25. Admin Import Modal — Sin loading state visual
**Severidad:** Media | **Esfuerzo:** Bajo | **Impacto:** Medio
**Status:** ✅ IMPLEMENTADO (sesión 67)

**Problema:** Al confirmar la importación, el botón dice "Importando..." pero no hay spinner ni progress visual. Para imports grandes, el usuario no sabe si está funcionando.

**Mejora sugerida:** Agregar spinner al botón + barra de progreso si es posible.

**Archivos:** `src/routes/(admin)/admin/+page.svelte`

---

### 26. Cart Page — Discount code sin feedback visual de éxito
**Severidad:** Media | **Esfuerzo:** Bajo | **Impacto:** Medio
**Status:** ✅ IMPLEMENTADO (sesión 67)

**Problema:** Al aplicar un código de descuento, el feedback es solo un cambio de estado (el código aparece como "aplicado"). No hay animación de éxito, no hay visualización del ahorro.

**Mejora sugerida:**
1. Animación de "checkmark" al aplicar descuento
2. Mostrar precio tachado + precio con descuento + ahorro
3. Badge "XX% OFF" con animación

**Archivos:** `src/routes/(store)/cart/+page.svelte`

---

### 27. Beat Detail Page — License cards sin interactividad
**Severidad:** Media | **Esfuerzo:** Medio | **Impacto:** Medio
**Status:** ✅ IMPLEMENTADO (sesión 67)

**Problema:** Las licencias se muestran como cards estáticas. No hay visualización clara de qué incluye cada una (MP3 vs WAV vs Stems), no hay comparación side-by-side, no hay "recomendado" badge en la más popular.

**Mejoras sugeridas:**
1. Badge "Popular" en la licencia más vendida
2. Iconos claros por tipo (🎵 MP3, 🎧 WAV, 🎹 Stems)
3. Progress bar o checkmarks para features incluidas
4. Animación de selección (border glow + scale)

**Archivos:** `src/routes/(store)/beat/[id]/+page.svelte`

---

### 28. Filters Component — Expand/collapse sin animación de altura
**Severidad:** Baja | **Esfuerzo:** Bajo | **Impacto:** Medio
**Status:** ✅ IMPLEMENTADO (sesión 67)

**Problema:** Los filtros expanden/colapsan con `filtersExpanded` boolean pero el cambio es instantáneo. No hay animación de altura (accordion-style).

**Mejora sugerida:** Usar CSS `grid-template-rows: 0fr` → `1fr` transition para animación suave de accordion.

**Archivos:** `src/lib/components/Filters.svelte`

---

### 29. Admin Topbar — Save status sin transición entre estados
**Severidad:** Baja | **Esfuerzo:** Bajo | **Impacto:** Bajo
**Status:** ✅ IMPLEMENTADO (sesión 67)

**Problema:** Los dots de estado (saved/saving/error/unsaved) cambian instantáneamente. Ya tienen animaciones individuales (`popIn`, `pulse`, `shake`) pero la transición entre estados no es fluida.

**Mejora sugerida:** Agregar crossfade entre estados.

**Archivos:** `src/lib/components/AdminTopbar.svelte`

---

### 30. Modal Component — Body scroll lock puede causar jump
**Severidad:** Baja | **Esfuerzo:** Bajo | **Impacto:** Bajo

**Problema:** El Modal usa `position: fixed` + `top: -${scrollY}px` para lock del scroll. Al cerrar, hace `window.scrollTo(0, scrollY)` que puede causar un jump visible si el contenido detrás cambió.

**Mejora sugerida:** Usar `overscroll-behavior: contain` en el modal en vez del hack de position fixed.

**Archivos:** `src/lib/components/Modal.svelte`

---

## 🟢 Items 31-36: Polish & Consistencia (NUEVO)

### 31. Login Page — Botón "Tester anónimo" visible en producción
**Severidad:** Media | **Esfuerzo:** Bajo
**Status:** ✅ IMPLEMENTADO (sesión anterior — gated behind `dev`)

**Problema:** El botón `🧪 Entrar como tester (anónimo)` está siempre visible. En producción, usuarios reales podrían confundirse.

**Mejora:** Ocultar en producción (`import { dev } from '$app/environment'`).

**Archivos:** `src/routes/(store)/login/+page.svelte`

---

### 32. BeatCard — Plays badge usa emoji 🔥 inconsistente
**Severidad:** Baja | **Esfuerzo:** Bajo

**Problema:** El badge de plays usa `🔥 {beat.plays}` con emoji, mientras que otros badges usan el sistema `Icon` component. Inconsistente.

**Mejora:** Cambiar a `Icon name="fire"` o mantener el emoji pero ser consistente en toda la app.

**Archivos:** `src/lib/components/BeatCard.svelte`

---

### 33. Scroll Progress Bar — Usa gradiente genérico
**Severidad:** Baja | **Esfuerzo:** Bajo
**Status:** ✅ IMPLEMENTADO (sesión 67)

**Problema:** La barra de progreso de scroll en el layout usa un gradiente genérico. Podría usar el accent color del theme.

**Mejora:** `background: linear-gradient(90deg, var(--accent), color-mix(in srgb, var(--accent) 70%, white))`

**Archivos:** `src/routes/(store)/+layout.svelte`

---

### 34. EmptyState Component — Animación de float repetitiva
**Severidad:** Baja | **Esfuerzo:** Bajo
**Status:** ✅ IMPLEMENTADO (sesión 67)

**Problema:** El ícono del EmptyState tiene `animation: float 3s ease-in-out infinite` que se repite indefinidamente. En contextos largos (usuario viendo la pantalla), puede resultar molesto.

**Mejora:** Limitar a 3-5 iteraciones o usar `animation-play-state: paused` después de un tiempo.

**Archivos:** `src/lib/components/EmptyState.svelte`

---

### 35. Mobile Menu — Search sin sugerencias recientes
**Severidad:** Baja | **Esfuerzo:** Medio
**Status:** ✅ IMPLEMENTADO (sesión 67)

**Problema:** El search bar del mobile menu no tiene sugerencias recientes ni trending searches. El usuario debe escribir desde cero cada vez.

**Mejora:** Guardar últimas 5 búsquedas en localStorage y mostrarlas como pills al hacer focus.

**Archivos:** `src/routes/(store)/+layout.svelte`

---

### 36. Loader — Genérico, no refleja la marca
**Severidad:** Baja | **Esfuerzo:** Medio
**Status:** ✅ IMPLEMENTADO (sesión 67)

**Problema:** El loader muestra el nombre de la marca + 3 dots. Es funcional pero genérico. Para una tienda de beats, podría ser más engaging.

**Mejora:** Waveform animation o equalizer bars que reflejen la identidad de marca.

**Archivos:** `src/routes/(store)/+layout.svelte`

---

## 📊 Resumen por Área

### Store (Frontend)
| Área | Issues | Mejor issue |
|------|--------|-------------|
| Nav + Badges | #16 | Pop animation |
| WishlistPanel | #17 | Stagger + exit |
| BeatCard | #18, #32 | Wishlist burst |
| Player | #19 | Cover rotation + waveform |
| AuthButton | #20 | Dropdown animation |
| Favoritos page | #21 | Stagger + filtros |
| Cart | #26 | Discount feedback |
| Beat detail | #27 | License cards |
| Filters | #28 | Accordion animation |
| Login | #31 | Hide tester button |
| Toast | #22 | Mobile positioning |
| Loader | #36 | Brand-aware |
| EmptyState | #34 | Animation limits |
| Mobile menu | #35 | Search suggestions |

### Admin (Backend UI)
| Área | Issues | Mejor issue |
|------|--------|-------------|
| Dashboard | #23 | countUp stats |
| Sidebar | #24 | Collapse transition |
| Import modal | #25 | Loading state |
| Topbar | #29 | Status transitions |
| Modal | #30 | Scroll lock |

---

## 🎯 Prioridad de Implementación

### Quick Wins (< 30 min cada uno, alto impacto)
1. **#16** Nav badge pop animation
2. **#18** BeatCard wishlist burst
3. **#20** AuthButton dropdown animation
4. **#23** Admin dashboard countUp
5. **#31** Hide tester button in prod
6. **#33** Scroll progress accent color

### Medium Effort (1-2h cada uno)
7. **#17** WishlistPanel stagger + exit
8. **#21** Favoritos page stagger
9. **#26** Cart discount feedback
10. **#27** Beat detail license cards
11. **#28** Filters accordion animation

### High Effort (2h+ cada uno)
12. **#19** Player waveform real + cover rotation
13. **#35** Mobile search suggestions
14. **#36** Brand-aware loader

---

## 📁 Archivos Más Frecuentes

| Archivo | Issues |
|---------|--------|
| `src/routes/(store)/+layout.svelte` | #16, #33, #35, #36 |
| `src/lib/components/BeatCard.svelte` | #18, #32 |
| `src/lib/components/WishlistPanel.svelte` | #17 |
| `src/lib/components/Player.svelte` | #19 |
| `src/lib/components/AuthButton.svelte` | #20 |
| `src/routes/(store)/account/favorites/+page.svelte` | #21 |
| `src/routes/(store)/cart/+page.svelte` | #26 |
| `src/routes/(store)/beat/[id]/+page.svelte` | #27 |
| `src/lib/components/Filters.svelte` | #28 |
| `src/routes/(admin)/admin/+page.svelte` | #23, #25 |

---

## 📊 Estado Actual

- **Tests:** 222+ passing
- **Producción:** Deployed via Cloudflare Workers
- **Auth:** signInWithRedirect + retry logic
- **UX Score:** 8/10 (microinteracciones implementadas)
- **Accessibility:** Good (skip link, focus-visible, ARIA)
- **Performance:** Good (code-split, lazy images, dynamic imports)
- **i18n:** Spanish hardcoded (low priority)
