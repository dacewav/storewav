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

## Bloque A — Fix críticos de sliders (Prioridad MAX)

**Objetivo**: Que TODOS los sliders funcionen y tengan feedback visual inmediato.

### A1. Particles sliders no afectan la tienda
- [ ] Verificar que `Particles.svelte` recibe props reactivas del store
- [ ] Verificar que el store layout pasa `settingsData.theme.particles*` como props
- [ ] Testear: cambiar count/speed/type desde admin → verificar en store page
- [ ] Si el problema es que el canvas no re-init al cambiar props → fixear el `$effect` en Particles.svelte

### A2. Todos los sliders con local state pattern
- [ ] Aplicar el patrón `$state` local a PÁGINA HERO (ya hecho)
- [ ] Aplicar a PÁGINA LAYOUT
- [ ] Aplicar a PÁGINA BANNER
- [ ] Aplicar a PÁGINA ANIMATIONS
- [ ] Cada slider debe: actualizar label instantáneamente + guardar en Firebase

### A3. Slider keyboard support
- [ ] Todos los sliders responden a ← → (step 1) y Shift+← → (step 10)
- [ ] Focus visible en sliders (outline accent)

**Archivos**: `Particles.svelte`, `(store)/+layout.svelte`, admin pages

---

## Bloque B — Save system y feedback (Alta prioridad)

**Objetivo**: Que el usuario sepa exactamente qué pasa cuando edita algo.

### B1. Save status indicator mejorado
- [ ] Topbar: mostrar "Guardando..." con spinner durante save
- [ ] Topbar: mostrar "✓ Guardado" con checkmark por 2s después de save exitoso
- [ ] Topbar: mostrar "⚠ Error al guardar" con retry button si falla
- [ ] Indicador de escrituras pendientes (offline queue count)

### B2. Confirmaciones y undo
- [ ] "Restaurar defaults" → modal de confirmación con preview de lo que se va a resetear
- [ ] Undo/Redo → toast mostrando qué se deshizo ("Deshacer: accent → #dc2626")
- [ ] Ctrl+Z/Ctrl+Shift+Z → funcionan en TODAS las páginas admin (verificar)

### B3. Export/Import mejorado
- [ ] Export: incluir animaciones, labels, CTA, brand (no solo theme+beats)
- [ ] Import: preview de cambios antes de aplicar (diff view)
- [ ] Import: botón de descarga del último backup

**Archivos**: `(admin)/+layout.svelte`, `AdminTopbar.svelte`, `toastStore.ts`

---

## Bloque C — Live preview (Game changer)

**Objetivo**: Ver los cambios en tiempo real sin salir del admin.

### C1. Preview panel
- [ ] Split view: admin controls a la izquierda, preview de la tienda a la derecha
- [ ] Preview se actualiza en tiempo real al mover sliders
- [ ] Toggle para ocultar/mostrar preview (fullscreen admin mode)
- [ ] Preview usa los mismos CSS vars que la tienda real

### C2. Quick preview
- [ ] Botón "👁 Preview" en topbar → abre la tienda en nueva pestaña con los settings actuales
- [ ] Botón "📱 Mobile preview" → abre preview en viewport mobile

**Archivos**: nuevo `AdminPreview.svelte`, `(admin)/+layout.svelte`

---

## Bloque D — Controles de animación completos

**Objetivo**: Que las animaciones sean configurables y visibles.

### D1. Duration/delay/easing por elemento
- [ ] Cada preset de animación (logo, title, cards, etc.) tiene:
  - Duration slider (0.2s - 10s)
  - Delay slider (0s - 5s)
  - Easing dropdown (linear, ease, ease-in-out, spring, bouncy)
- [ ] Preview de la animación al lado de cada selector

### D2. Animation preview en admin
- [ ] Cada preset muestra un mini-preview animado (ya existe parcialmente)
- [ ] Preview usa los sliders de duration/delay/easing actuales
- [ ] "Probar animación" button → aplica temporalmente a la tienda

### D3. Custom animation keyframes
- [ ] Editor de keyframes CSS (textarea)
- [ ] O seleccionar de presets predefinidos
- [ ] Preview del keyframe custom

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
