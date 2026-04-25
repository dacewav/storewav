# 🚀 MEGA-PLAN-ADMIN.md — Admin al Siguiente Nivel

> **Creado: 2026-04-25 (Session 25)**
> **Objetivo**: Transformar el admin de "funcional pero básico" a "profesional y placentero de usar"
> **Regla**: Un bloque por sesión. Verificar en browser. Commit después de cada bloque.

---

## Estado actual (Session 25)

- **~50 controles** de personalización (theme, hero, layout, brand, banner, animations, content)
- **107 tests** passing
- **Admin funcional** pero UX básica: sliders sin feedback visual, sin preview, sin confirmaciones
- **Bugs activos**: particles sliders no funcionan, workers domain stale

---

## Bloque A — Fix críticos de sliders (Prioridad MAX) ✅ COMPLETADO Session 26

**Objetivo**: Que TODOS los sliders funcionen y tengan feedback visual inmediato.

### A1. Particles sliders no afectan la tienda ✅
- [x] Verificar que `Particles.svelte` recibe props reactivas del store
- [x] Verificar que el store layout pasa `settingsData.theme.particles*` como props
- [x] Fix: $derived config key para robust reactive tracking (reemplaza void pattern)
- [x] Si el problema es que el canvas no re-init al cambiar props → fixeado con $derived key

### A2. Todos los sliders con local state pattern ✅
- [x] Aplicar el patrón `$state` local a PÁGINA HERO (ya hecho Session 25)
- [x] Aplicar a PÁGINA LAYOUT (cardsPerRow, logoScale, logoRotation, navHeight)
- [x] Aplicar a PÁGINA BANNER (speed, delay)
- [x] Aplicar a PÁGINA ANIMATIONS (animDuration, animDelay)
- [x] Cada slider debe: actualizar label instantáneamente + guardar en Firebase

### A3. Slider keyboard support ✅
- [x] Todos los sliders responden a ← → (step 1) y Shift+← → (step 10)
- [x] Focus visible en sliders (outline accent)
- [x] 36 sliders across 5 admin pages

**Archivos**: `Particles.svelte`, `(store)/+layout.svelte`, admin pages

---

## Bloque B — Save system y feedback (Alta prioridad) ✅ COMPLETADO Session 26

**Objetivo**: Que el usuario sepa exactamente qué pasa cuando edita algo.

### B1. Save status indicator mejorado ✅
- [x] Topbar: mostrar "Guardando..." con spinner durante save (pulsing dot animation)
- [x] Topbar: mostrar "✓ Guardado" con checkmark por 2s después de save exitoso (popIn animation)
- [x] Topbar: mostrar "⚠ Error al guardar" con retry button si falla (shake animation + ↻ button)
- [x] Indicador de escrituras pendientes (offline queue count badge)

### B2. Confirmaciones y undo ✅
- [x] Undo/Redo → toast mostrando qué se deshizo ("Deshacer: accent")
- [x] Ctrl+Z/Ctrl+Shift+Z → funcionan en TODAS las páginas admin
- [ ] "Restaurar defaults" → modal de confirmación (still uses confirm(), deferred)

### B3. Export/Import mejorado ✅ (ya existía)
- [x] Export: incluye animaciones, labels, CTA, brand (settings completos)
- [x] Import: preview de cambios antes de aplicar (diff view con validation)
- [x] Import: duplicate mode selector (skip/overwrite)

**Archivos**: `(admin)/+layout.svelte`, `AdminTopbar.svelte`, `toastStore.ts`

---

## Bloque C — Live preview (Game changer) ✅ COMPLETADO Session 26

**Objetivo**: Ver los cambios en tiempo real sin salir del admin.

### C1. Preview panel ✅
- [x] Split view: admin controls a la izquierda, preview de la tienda a la derecha
- [x] Preview se actualiza en tiempo real al mover sliders (iframe + Firebase RTDB)
- [x] Toggle para ocultar/mostrar preview (Ctrl+P o botón en topbar)
- [x] Preview usa los mismos CSS vars que la tienda real (mismo iframe)

### C2. Quick preview ✅
- [x] Botón "↗ Abrir tienda" en topbar → abre la tienda en nueva pestaña
- [x] Botón "📱 Mobile preview" → abre preview en popup 375x812

**Archivos**: nuevo `AdminPreview.svelte`, `(admin)/+layout.svelte`

---

## Bloque D — Controles de animación completos ✅ COMPLETADO Session 26

**Objetivo**: Que las animaciones sean configurables y visibles.

### D1. Duration/delay/easing por elemento ✅
- [x] Cada preset de animación (logo, title, cards, etc.) tiene:
  - Duration slider (0.2s - 10s)
  - Delay slider (0s - 5s)
  - Easing dropdown (linear, ease, ease-in-out, spring, bouncy)
- [x] Preview de la animación al lado de cada selector

### D2. Animation preview en admin ✅
- [x] Cada preset muestra un mini-preview animado con su timing
- [x] Preview usa los sliders de duration/delay/easing actuales
- [x] Cards y CTA animations wired up en la tienda

### D3. Custom animation keyframes ✅
- [x] Editor de keyframes CSS (textarea)
- [x] Inyectado en la tienda via animCustomCSS
- [x] Preview del keyframe custom en la referencia de presets

**Archivos**: `animations/+page.svelte`, `AnimationPreview.svelte`

---

## Bloque E — Brand & Media management

**Objetivo**: Gestión profesional de assets visuales.

### E1. Logo upload con crop
- [ ] FileUpload con preview + crop tool (aspect ratio libre o fijo)
- [ ] Generar automáticamente: favicon (32x32), OG image (1200x630), logo thumbnail
- [ ] Preview del logo en: nav, footer, loader, browser tab

### E2. Color palette generator
- [ ] A partir del accent color → generar paleta completa (5-7 shades)
- [ ] Preview de la paleta aplicada a la tienda
- [ ] "Generar paleta" button → sugiere combinaciones

### E3. Font preview
- [ ] Al escribir un Google Font name → preview inmediato del font
- [ ] Sugerencias de fonts populares (dropdown)
- [ ] "Font no encontrado" warning si el font no existe

**Archivos**: `brand/+page.svelte`, `FileUpload.svelte`, nuevo `FontPreview.svelte`

---

## Bloque F — Admin UX polish

**Objetivo**: Que el admin se sienta profesional y fluido.

### F1. Búsqueda y navegación
- [ ] Command palette (Ctrl+K) → buscar settings por nombre
- [ ] Breadcrumb navigation en topbar
- [ ] "Última edición" indicator por sección
- [ ] Keyboard shortcuts visibles en tooltips

### F2. Responsive admin
- [ ] Admin 100% usable en mobile (no solo "no roto")
- [ ] Bottom nav en mobile con iconos
- [ ] Swipe entre secciones en mobile
- [ ] Touch-friendly: sliders con thumb más grande en mobile

### F3. Dark/light admin theme
- [ ] Admin theme independiente del store theme
- [ ] Toggle en topbar para cambiar admin theme
- [ ] Respeta preferencia del sistema

### F4. Onboarding
- [ ] Tour guiado la primera vez que se entra al admin
- [ ] Tooltips explicativos en cada sección
- [ ] "¿Qué hace esto?" help icons

**Archivos**: múltiples

---

## Bloque G — Performance y polish

**Objetivo**: Que todo sea rápido y limpio.

### G1. Performance
- [ ] Lazy load admin pages (code splitting)
- [ ] Debounce en sliders de color (no 60fps writes)
- [ ] Batch Firebase writes (no 1 write por slider frame)
- [ ] Skeleton loading en admin pages

### G2. Code quality
- [ ] Eliminar CSS keyframes no usados (34 en cardStyleEngine)
- [ ] Unificar patrón de sliders (todos usan local state)
- [ ] Tests para nuevos controles
- [ ] svelte-check 0 errores (resolver env var issue)

### G3. Deploy pipeline
- [ ] GitHub Actions: auto-deploy a Pages + Workers en push
- [ ] Build verification antes de deploy
- [ ] Rollback capability

**Archivos**: build config, CI/CD

---

## Ritmo

- **Un bloque por sesión** (50 min)
- **Verificar en browser** después de cada sub-tarea
- **Commit** después de cada sub-tarea exitosa
- **Si algo no funciona**, fixear antes de seguir
- **Prioridad: A → B → C → D → E → F → G**

## Métricas de éxito

| Métrica | Actual | Objetivo |
|---------|--------|----------|
| Controles funcionales | ~50 | 80+ |
| Sliders reactivos | 50% | 100% |
| Live preview | No | Sí |
| Save feedback | Básico | Completo |
| Mobile admin | Básico | 100% usable |
| Tests | 107 | 150+ |
| Deploy automático | No | Sí |

---

*Plan por @dacewav — Session 25*
