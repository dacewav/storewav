# 🚀 MEGA-PLAN v2 — Pulido Final + Tests

> **Creado**: 2026-04-25 07:54 (GMT+8)
> **Base**: ADMIN-OPTIMIZE-PLAN (completo), POLISH-MASTER (completo), SOLIDIFICATION-PLAN sessions 0-6 (completas)
> **Objetivo**: Tests, pulido profundo, y dejar todo production-ready
> **Regla**: Un bloque a la vez. Build limpio después de cada bloque. Commit después de cada bloque.

---

## 📋 Estado actual

- **svelte-check**: 0 errores, 0 warnings ✅
- **Build**: limpio ✅
- **Firebase**: conectado, 7 beats, settings completos
- **Auth**: Google OAuth + login anónimo para testing
- **Admin**: dashboard, CRUD, editors, import/export, mobile sidebar
- **Store**: homepage, beat detail, filters, player, wishlist, testimonials
- **SEO**: JSON-LD (MusicRecording + WebSite), OG tags, robots.txt
- **A11y**: aria-labels, focus-visible, reduced-motion, keyboard nav
- **Mobile**: responsive, sidebar overlay, touch targets

---

## 🔨 Bloque 1 — Testing Setup + Unit Tests (Stores)

**Objetivo**: Framework de tests funcionando + tests unitarios para stores críticos.

- [x] Instalar Vitest + dependencias
- [x] Configurar `vitest.config.ts` con aliases para mocks
- [x] Test: `emptyBeat()` retorna campos correctos (5 tests)
- [x] Test: `migrateOldData()` transforma flat → nested correctamente (14 tests)
- [x] Test: `mergeCardStyles()` mergea correctamente (5 tests)
- [x] Test: `cardStyleToCSS()` genera CSS válido (5 tests)
- [x] Test: `validateBeat()` detecta campos faltantes (10 tests)
- [x] `npm test` corre sin errores, 39 tests pasando ✅

**Archivos creados**:
- `vitest.config.ts`
- `src/lib/stores/__tests__/beats.test.ts`
- `src/lib/stores/__tests__/settings.test.ts`
- `src/lib/__tests__/cardStyleEngine.test.ts`
- `src/routes/(admin)/admin/__tests__/import-validation.test.ts`
- `src/lib/__tests__/mocks/` (firebase, env-public, app-environment)

---

## 🔨 Bloque 2 — Unit Tests (Components + Logic)

**Objetivo**: Tests para lógica de componentes y utilidades.

- [ ] Test: `cardStyleEngine.ts` — todos los presets generan CSS válido
- [ ] Test: `theme.ts` — `applyTheme()` genera CSS vars correctas
- [ ] Test: `sanitizeHtml()` — whitelist funciona, XSS bloqueado
- [ ] Test: `beatsStats` — calcula total, active, genres correctamente
- [ ] Test: `incrementPlay()` — throttle funciona (30s)
- [ ] Test: import validation — beats con campos faltantes rechazados
- [ ] Test: import preview — duplicados detectados correctamente
- [ ] ≥ 20 tests totales

**Archivos a crear**:
- `src/lib/__tests__/theme.test.ts`
- `src/lib/__tests__/sanitize.test.ts`
- `src/lib/stores/__tests__/analytics.test.ts`

---

## 🔨 Bloque 3 — Integration Tests (Firebase Mock)

**Objetivo**: Tests que verifican flujos completos con Firebase mockeado.

- [ ] Mock de Firebase RTDB
- [ ] Test: settings store → subscribe → recibe datos → migrateOldData se aplica
- [ ] Test: beats store → subscribe → recibe beats → allBeatsList se deriva
- [ ] Test: createBeat → push a Firebase → beats store se actualiza
- [ ] Test: auth → initAuth → checkAdmin → isAdmin se setea
- [ ] Test: wishlist → toggle → se refleja en store
- [ ] ≥ 30 tests totales

**Archivos a crear**:
- `src/lib/__tests__/mocks/firebase.ts`
- `src/lib/stores/__tests__/integration.test.ts`

---

## 🔨 Bloque 4 — Store Polish

**Objetivo**: Pulir edge cases y robustez de los stores.

- [ ] `beats.ts`: `incrementPlay()` — verificar que no incrementa si beat no existe
- [ ] `settings.ts`: `updateField()` — manejar dot-path con nested undefined (ej: `theme.newField`)
- [ ] `settings.ts`: `migrateOldData()` — cachear resultado si input no cambió (referential equality)
- [ ] `player.ts`: verificar que no crashea con `audioUrl` vacío (ya fixeado, confirmar)
- [ ] `wishlist.ts`: verificar que persiste en localStorage correctamente
- [ ] `connection.ts`: verificar reconexión automática
- [ ] `auth.ts`: verificar que `loginAnonymously()` maneja errores gracefully
- [ ] Commit + build limpio

---

## 🔨 Bloque 5 — Admin Polish

**Objetivo**: Pulir UX del admin y cerrar edge cases.

- [ ] Dashboard: verificar que stats se actualizan cuando beats cambian (reactive)
- [ ] Beats CRUD: verificar que bulk actions manejan errores parciales
- [ ] Beat Editor: verificar que auto-save no dispara en cambios vacíos
- [ ] Import: verificar que modal se cierra con Escape
- [ ] Import: verificar que import con 0 beats + settings funciona
- [ ] Import: verificar que import con 0 beats + 0 settings muestra mensaje
- [ ] Sidebar: verificar que se cierra al navegar en mobile
- [ ] Sidebar: verificar que backdrop se cierra con Escape
- [ ] Admin Topbar: verificar que hamburger solo aparece en mobile
- [ ] Commit + build limpio

---

## 🔨 Bloque 6 — Store Polish (Visual)

**Objetivo**: Pulir la tienda visualmente.

- [ ] BeatCard: verificar que shimmer animation funciona correctamente
- [ ] BeatCard: verificar que hover scale funciona
- [ ] Player: verificar que waveform se renderiza correctamente
- [ ] Player: verificar que progress bar es clickeable (seek)
- [ ] Filters: verificar que tags filter funciona con múltiples tags
- [ ] Testimonials: verificar que stars se renderizan correctamente
- [ ] Hero: verificar que glow word animation funciona
- [ ] Hero: verificar que color segments se aplican
- [ ] Particles: verificar que no hay memory leak al desmontar
- [ ] Commit + build limpio

---

## 🔨 Bloque 7 — Error Handling + Edge Cases

**Objetivo**: Que la app no crashee en ningún caso.

- [ ] Beat detail: beat con `licenses: []` → mostrar "Sin licencias"
- [ ] Beat detail: beat con `imageUrl: ''` → mostrar placeholder
- [ ] Store: Firebase vacío → mostrar EmptyState (no crash)
- [ ] Admin: settings null → mostrar loading (no crash)
- [ ] Import: JSON con `beats: null` → manejar gracefully
- [ ] Import: JSON con `settings: "not-an-object"` → rechazar
- [ ] Export: 0 beats → exportar vacío correctamente
- [ ] Player: beat sin `audioUrl` → toast "Sin audio" (ya fixeado, confirmar)
- [ ] Player: error de red → retry o skip gracefully
- [ ] Commit + build limpio

---

## 🔨 Bloque 8 — Performance Audit

**Objetivo**: Que la app sea rápida.

- [ ] Verificar `loading="lazy"` en todas las imágenes
- [ ] Verificar `decoding="async"` en imágenes grandes
- [ ] Verificar que no hay re-renders innecesarios (Svelte devtools)
- [ ] Verificar que Firebase subscriptions se limpian al desmontar
- [ ] Verificar que no hay memory leaks en particles canvas
- [ ] Verificar bundle size (no chunks > 100KB)
- [ ] Verificar que admin pages lazy-load (SvelteKit code splitting)
- [ ] Commit + build limpio

---

## 🔨 Bloque 9 — Final Verification

**Objetivo**: Última pasada completa.

- [ ] `npx svelte-check` → 0 errores, 0 warnings
- [ ] `npm run build` → 0 errores
- [ ] `npm test` → todos los tests pasan
- [ ] Store: homepage, beat detail, filters, player, wishlist
- [ ] Admin: dashboard, beats CRUD, all editors, import/export
- [ ] Mobile: sidebar toggle, beats list, responsive
- [ ] SEO: JSON-LD, OG tags, robots.txt
- [ ] A11y: aria-labels, keyboard nav, focus-visible
- [ ] Git: working tree clean, todos los bloques commiteados
- [ ] Actualizar POLISH-MASTER.md con estado final

---

## ⏱️ Ritmo

- **Un bloque a la vez.**
- **Build limpio** después de cada bloque.
- **Commit** después de cada bloque exitoso.
- **Si algo no funciona**, no lo salves — arréglalo antes de seguir.
- **Actualizar este archivo** marcando los checkboxes completados.
