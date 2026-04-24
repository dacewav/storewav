# 🏗️ SOLIDIFICATION-PLAN.md — Mega Plan de Solidificación

> **Creado: 2026-04-24 09:23 | Actualizado: 2026-04-25 02:19**
> **Objetivo: Llevar la tienda de "funciona" a "sólida, profesional, lista para producción"**
> **Total: 9 sesiones × 50 min = ~7.5 horas reales**

---

## ⚠️ Sesión 0: CRITICAL BUGS (PRIMERO — antes de cualquier otra sesión)

**Objetivo:** Fixear los 2 bugs críticos y 4 bugs altos encontrados en el audit v2 del 2026-04-25.

### Tareas Críticas (2) — FIXED ✅

- [x] **Fix `effect_update_depth_exceeded` en admin layout** (10 min)
  - Ya estaba fixeado — `untrack()` en admin layout desde sesión anterior

- [x] **Sanitize `{@html dividerTitle}` XSS vector** (10 min)
  - Archivo: `src/routes/(store)/+page.svelte`
  - Fix: `sanitizeHtml()` con whitelist em/strong/b/i/span
  - Commit: `4842832`

### Tareas Altas (4) — FIXED ✅

- [x] **Fix BeatEditor `$effect` optimization** (5 min)
  - Archivo: `src/lib/components/BeatEditor.svelte`
  - Fix: Replaced `JSON.stringify(beat)` con version counter ligero
  - Commit: `4842832`

- [x] **Add try/catch to bulk operations** (10 min)
  - Archivo: `src/routes/(admin)/admin/beats/+page.svelte`
  - Fix: try/catch en bulkSetActive, bulkDelete, confirmDelete, moveBeat, handleDuplicate
  - Commit: `4842832`

- [x] **Fix `$app/stores` → `$app/state`** (2 min)
  - Archivo: `src/routes/(store)/beat/[id]/+page.svelte`
  - Commit: `4842832`

- [x] **Fix `undoField`/`redoField` error handling** (5 min)
  - Archivo: `src/lib/stores/settings.ts`
  - Fix: try/catch con revert de stack en fallo
  - Commit: `4842832`

### Verificación — PASSED ✅
- [x] `npm run build` → 0 errores
- [x] `npx svelte-check` → 0 errores, 0 warnings
- [x] XSS sanitizer en divider
- [x] Bulk ops con error handling
- [x] undo/redo con error handling

---

---

## Filosofía

La tienda ya **funciona** — tiene beats, player, admin, auth, theme engine. Pero "funciona" no es "sólida". Este plan cierra los huecos que separan un MVP de un producto real:

1. **Feedback** — El usuario siempre sabe qué pasó
2. **Resiliencia** — La app no se rompe ante errores
3. **Datos** — Los datos se pierden correctamente y se recuperan
4. **Performance** — La app es rápida y suave
5. **Accesibilidad** — Todos pueden usarla
6. **SEO** — Google la encuentra
7. **Testing** — Sabés que funciona antes de que el usuario te lo diga
8. **Polish** — Los detalles que separan "hecho" de "bien hecho"

---

## Sesión 1: Toast System + Feedback Visual (50 min)

**Objetivo:** Que el usuario SIEMPRE sepa qué pasó después de cada acción.

### Tareas

- [ ] **Wire up toast notifications** (20 min)
  - `saveStatus` → toast automático: "Guardado ✓" / "Error al guardar"
  - Beat created → toast "Beat creado"
  - Beat deleted → toast "Beat eliminado"
  - Beat duplicated → toast "Beat duplicado"
  - Import → toast "Datos importados" / "Error al importar"
  - Seed → toast "8 beats creados"
  - File upload → toast "Archivo subido" / "Error al subir"

- [ ] **Add toast to key user flows** (15 min)
  - Wishlist toggle → toast "Añadido a favoritos" / "Quitado de favoritos"
  - Copy beat link (si existe) → toast "Link copiado"
  - Theme reset → toast "Tema restaurado"

- [ ] **Toast auto-dismiss + manual dismiss** (5 min)
  - Ya existe en ToastContainer — verificar que funciona

- [ ] **Test all toast flows** (5 min)
  - Crear beat → ver toast
  - Borrar beat → ver toast
  - Cambiar theme → ver toast

- [ ] **Build + svelte-check + commit** (5 min)

### Archivos a tocar
- `src/lib/stores/settings.ts` — toast en updateField
- `src/routes/(admin)/admin/beats/[id]/+page.svelte` — toast en save/delete
- `src/routes/(admin)/admin/beats/new/+page.svelte` — toast en create
- `src/routes/(admin)/admin/+page.svelte` — toast en seed/import
- `src/lib/components/FileUpload.svelte` — toast en upload
- `src/routes/(store)/+page.svelte` — toast en wishlist

### Criterio de éxito
- [ ] Cada acción del admin muestra un toast con resultado
- [ ] Toast desaparece automáticamente después de 3s
- [ ] 0 errores en build + svelte-check

---

## Sesión 2: Plays Counter + Analytics Reales (50 min)

**Objetivo:** Que los beats cuenten reproducciones y que el dashboard muestre datos reales.

### Tareas

- [ ] **Incrementar `plays` en Firebase** (15 min)
  - Cuando `player.play()` se llama → incrementar `beats/{id}/plays`
  - Usar `increment(1)` de Firebase (no read-then-write)
  - Throttle: máximo 1 incremento por beat por 30 segundos

- [ ] **Mostrar plays en BeatCard** (10 min)
  - Badge "🔥 123 plays" si plays > 0
  - Estilo: mono, small, muted

- [ ] **Mostrar plays en admin beat list** (5 min)
  - Columna de plays en la tabla de beats

- [ ] **Dashboard con datos reales** (10 min)
  - "Plays totales" stat card
  - "Beat más reproducido" stat card
  - "Plays hoy" stat card (si hay analytics)

- [ ] **Build + svelte-check + commit** (5 min)

### Archivos a tocar
- `src/lib/stores/player.ts` — increment plays
- `src/lib/components/BeatCard.svelte` — show plays badge
- `src/routes/(admin)/admin/beats/+page.svelte` — show plays column
- `src/routes/(admin)/admin/+page.svelte` — real stats

### Criterio de éxito
- [ ] Plays se incrementan al reproducir un beat
- [ ] Plays se muestran en la tienda y en admin
- [ ] Dashboard muestra stats reales (no hardcoded)

---

## Sesión 3: Connection State + Error Resilience (50 min)

**Objetivo:** Que la app maneje errores gracefully y informe al usuario sobre problemas de conexión.

### Tareas

- [ ] **Connection state indicator** (15 min)
  - Detectar desconexión de Firebase (`.info/connected`)
  - Banner amarillo "Sin conexión — los cambios se guardarán cuando vuelva"
  - Badge en nav: 🟢 Conectado / 🔴 Desconectado

- [ ] **Retry logic en CRUD** (10 min)
  - `createBeat`, `updateBeat`, `deleteBeat` → retry 1 vez en caso de error de red
  - Mostrar toast con error si falla después de retry

- [ ] **Error boundary en páginas** (10 min)
  - Beat page → si el beat no carga, mostrar error amigable + link de vuelta
  - Admin pages → si settings no cargan, mostrar error + retry button
  - Store page → si beats no cargan, mostrar skeleton + retry

- [ ] **Loading states mejorados** (10 min)
  - Skeleton loaders en admin pages (no solo spinner)
  - Progress indicator en uploads (ya existe, verificar)

- [ ] **Build + svelte-check + commit** (5 min)

### Archivos a tocar
- `src/lib/firebase.ts` — connection state
- `src/lib/stores/_firebaseStore.ts` — retry logic
- `src/routes/(store)/+layout.svelte` — connection banner
- `src/routes/(store)/beat/[id]/+page.svelte` — error state
- `src/routes/(admin)/+layout.svelte` — error state

### Criterio de éxito
- [ ] Banner aparece cuando se pierde conexión
- [ ] CRUD retry funciona en errores de red
- [ ] Cada página tiene un estado de error manejado

---

## Sesión 4: Testimonials + globalCardStyle Migration (50 min)

**Objetivo:** Cerrar los 2 huecos de schema que quedaron del migration.

### Tareas

- [ ] **Testimonials migration** (15 min)
  - Firebase tiene `{ name, text, role }`
  - Código espera `{ name, text, stars?, avatar?, role? }`
  - Migration layer ya soporta ambos (Testimonial type tiene `role?`)
  - Verificar que el componente renderiza correctamente con datos reales
  - Si Firebase tiene `role` → mostrar como subtítulo (ya implementado)
  - Test: curl Firebase → verificar que testimonials se muestran

- [ ] **globalCardStyle migration audit** (20 min)
  - Leer Firebase `settings.globalCardStyle` real
  - Verificar que CADA sub-objeto (glow, filter, border, shadow, hover, style, transform) se migra correctamente
  - Test: cambiar globalCardStyle en Firebase → verificar que las cards cambian
  - Fixear cualquier campo que no se migre

- [ ] **Card style per-beat** (10 min)
  - Verificar que `beat.cardStyle` overrides funcionan
  - Verificar que `beat.glowConfig` funciona
  - Test: crear beat con cardStyle custom → verificar que se ve diferente

- [ ] **Build + svelte-check + commit** (5 min)

### Archivos a tocar
- `src/lib/stores/settings.ts` — migration layer
- `src/lib/cardStyleEngine.ts` — merge logic
- `src/lib/components/BeatCard.svelte` — card style application
- `src/lib/components/Testimonials.svelte` — verify rendering

### Criterio de éxito
- [ ] Testimonials de Firebase se muestran correctamente
- [ ] globalCardStyle de Firebase se aplica a todas las cards
- [ ] Per-beat cardStyle overrides funcionan

---

## Sesión 5: Performance + Mobile Polish (50 min)

**Objetivo:** Que la app sea rápida y se vea bien en todos los dispositivos.

### Tareas

- [ ] **Image optimization** (10 min)
  - `loading="lazy"` en todas las imágenes (verificar)
  - `decoding="async"` en imágenes grandes
  - Placeholder blur mientras carga

- [ ] **Animation performance** (10 min)
  - Verificar que todas las animaciones usan `transform` y `opacity` (no layout props)
  - `will-change` en elementos animados complejos
  - Reducir animaciones en `prefers-reduced-motion`

- [ ] **Mobile responsive audit** (15 min)
  - Admin panel en mobile — sidebar colapsa a iconos ✅
  - Beat editor en mobile — tabs scroll horizontal ✅
  - Store page en mobile — grid 1 columna ✅
  - Player bar en mobile — compacto ✅
  - Verificar que NO hay horizontal scroll en ninguna página

- [ ] **Touch targets** (10 min)
  - Todos los botones ≥ 44px (touch-min)
  - Verificar en BeatCard, Player, Filters, Admin

- [ ] **Build + svelte-check + commit** (5 min)

### Archivos a tocar
- `src/app.css` — reduced motion, will-change
- `src/lib/components/*.svelte` — responsive fixes
- `src/routes/(store)/+layout.svelte` — mobile nav

### Criterio de éxito
- [ ] No horizontal scroll en mobile
- [ ] Animaciones suaves en mobile (60fps)
- [ ] Touch targets ≥ 44px

---

## Sesión 6: Accessibility + SEO Deep (50 min)

**Objetivo:** Que la app sea accesible y que Google la indexe bien.

### Tareas

- [ ] **A11y audit** (20 min)
  - `aria-label` en todos los botones sin texto
  - `role` en elementos interactivos custom
  - `alt` en todas las imágenes
  - `tabindex` en elementos focusables
  - Color contrast ratio ≥ 4.5:1 (text on background)
  - Focus visible indicators

- [ ] **Keyboard navigation** (10 min)
  - Tab order lógico en todas las páginas
  - Escape cierra modals/menus
  - Enter activa buttons/cards
  - Arrow keys en filters/selects

- [ ] **SEO deep** (15 min)
  - `<link rel="canonical">` en beat pages
  - Structured data (JSON-LD) para beats: `MusicRecording`
  - Structured data para la tienda: `WebSite`
  - Sitemap dinámico con beats (si es posible con Cloudflare)
  - Open Graph + Twitter Card en todas las páginas

- [ ] **Build + svelte-check + commit** (5 min)

### Archivos a tocar
- `src/routes/(store)/beat/[id]/+page.svelte` — structured data, canonical
- `src/routes/(store)/+page.svelte` — structured data
- `src/routes/+layout.svelte` — global a11y
- `static/sitemap.xml` — update
- `src/lib/components/*.svelte` — aria fixes

### Criterio de éxito
- [ ] Lighthouse a11y ≥ 90
- [ ] Lighthouse SEO ≥ 90
- [ ] Structured data válido (Google Rich Results test)

---

## Sesión 7: Testing Foundation (50 min)

**Objetivo:** Que haya tests que verifiquen que las cosas funcionan.

### Tareas

- [ ] **Setup testing** (10 min)
  - Instalar Vitest + @sveltejs/kit adapter
  - Configurar `vitest.config.ts`
  - Test runner funciona

- [ ] **Unit tests: stores** (15 min)
  - `beats.ts` — `emptyBeat()` retorna campos correctos
  - `beats.ts` — `createBeat` tiene los campos requeridos
  - `settings.ts` — migration layer transforma flat → nested
  - `settings.ts` — migration layer preserva nested
  - `wishlist.ts` — toggle, has, clear

- [ ] **Unit tests: utilities** (10 min)
  - `cardStyleEngine.ts` — `mergeCardStyles` mergea correctamente
  - `cardStyleEngine.ts` — `cardStyleToCSS` genera CSS válido
  - `actions.ts` — countUp actualiza valor

- [ ] **Integration test: beat CRUD** (10 min)
  - Test de integración simple: crear beat → verificar estructura
  - Test de integración: duplicar beat → verificar nombre

- [ ] **Build + svelte-check + commit** (5 min)

### Archivos a crear
- `vitest.config.ts`
- `src/lib/stores/__tests__/beats.test.ts`
- `src/lib/stores/__tests__/settings.test.ts`
- `src/lib/stores/__tests__/wishlist.test.ts`
- `src/lib/__tests__/cardStyleEngine.test.ts`

### Criterio de éxito
- [ ] `npm test` corre sin errores
- [ ] ≥ 15 tests pasando
- [ ] Tests cubren lógica crítica (migration, CRUD, card style)

---

## Sesión 8: Final Polish + Deploy (50 min)

**Objetivo:** Limpieza final, deploy, y verificación de que todo funciona en producción.

### Tareas

- [ ] **Dead code removal** (10 min)
  - `console.log` → 0 en producción
  - `TODO` / `FIXME` → 0
  - Imports no usados → 0
  - CSS no usado → revisar

- [ ] **Build optimization** (10 min)
  - Bundle size check — no chunks > 100KB
  - Tree shaking verification
  - Lazy loading de admin pages (ya lo hace SvelteKit)

- [ ] **Deploy a Cloudflare** (10 min)
  - Push a GitHub
  - Verificar que Cloudflare Pages build funciona
  - Verificar que el deploy está live

- [ ] **Smoke test en producción** (15 min)
  - Store page carga con beats
  - Beat page carga con datos
  - Player reproduce audio
  - Wishlist funciona
  - Admin login funciona
  - Admin beat editor guarda
  - Theme changes se reflejan
  - Mobile responsive

- [ ] **Commit final + tag** (5 min)
  - Tag: `v1.0.0-solid`
  - Update CHANGELOG.md

### Archivos a tocar
- Todos los archivos con `console.log`
- `package.json` — version bump
- `CHANGELOG.md` — update

### Criterio de éxito
- [ ] Deploy live en Cloudflare
- [ ] Smoke test pasa en producción
- [ ] 0 console.log, 0 TODO, 0 FIXME
- [ ] Tag v1.0.0-solid creado

---

## Resumen de Sesiones

| # | Sesión | Foco | Tiempo |
|---|--------|------|--------|
| 1 | Toast System + Feedback | UX — el usuario sabe qué pasó | 50 min |
| 2 | Plays Counter + Analytics | Datos — métricas reales | 50 min |
| 3 | Connection State + Errors | Resiliencia — no se rompe | 50 min |
| 4 | Testimonials + CardStyle | Schema — cerrar huecos | 50 min |
| 5 | Performance + Mobile | UX — rápido y responsive | 50 min |
| 6 | Accessibility + SEO | Alcance — todos pueden usarla | 50 min |
| 7 | Testing Foundation | Calidad — tests que verifican | 50 min |
| 8 | Final Polish + Deploy | Ship — producción | 50 min |

**Total: 8 sesiones × 50 min = ~6.5 horas**

---

## Después de este plan

La tienda estará:
- ✅ Sólida — errores manejados, feedback claro
- ✅ Rápida — optimizada para mobile y desktop
- ✅ Accesible — a11y ≥ 90, keyboard navigation
- ✅ Indexada — SEO ≥ 90, structured data
- ✅ Testeada — ≥ 15 tests, lógica crítica cubierta
- ✅ En producción — deploy en Cloudflare, smoke test pasado

**Próximos pasos opcionales (no incluidos en este plan):**
- PWA (offline support)
- i18n (multi-language)
- Rate limiting en analytics
- Email notifications
- Payment integration
- User accounts (no solo admin)

---

*Proyecto por @dacewav — 2026*
