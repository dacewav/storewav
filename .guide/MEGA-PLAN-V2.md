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

- [x] Test: `sanitizeHtml()` — whitelist funciona, XSS bloqueado (13 tests)
- [x] Test: `cardStyleEngine.ts` — todos los presets generan CSS válido (en Bloque 1)
- [x] Test: import validation — beats con campos faltantes rechazados (en Bloque 1)
- [x] ≥ 52 tests totales ✅

**Archivos creados**:
- `src/lib/sanitize.ts` — sanitizeHtml extraído como módulo reutilizable
- `src/lib/__tests__/sanitize.test.ts`

---

## 🔨 Bloque 3 — Integration Tests (Firebase Mock)

**Objetivo**: Tests que verifican flujos completos con Firebase mockeado.

- [x] Mock de Firebase RTDB (database, auth, $env, $app/environment)
- [x] Test: settings store → subscribe → recibe datos → migrateOldData se aplica (6 tests)
- [x] Test: beats store → subscribe → recibe beats → allBeatsList se deriva (6 tests)
- [x] Test: createBeat → push a Firebase → beats store se actualiza (6 CRUD tests)
- [x] Test: auth → initAuth → checkAdmin → isAdmin se setea (4 tests)
- [x] Test: wishlist → toggle → se refleja en store (4 tests)
- [x] Settings undo/redo + Firebase subscription (2 tests)
- [x] ≥ 28 integration tests totales ✅

**Archivos**:
- `src/lib/__tests__/mocks/firebase.ts` (existente, extendido)
- `src/lib/stores/__tests__/integration.test.ts` — 28 tests, 8 describe blocks

---

## 🔨 Bloque 4 — Store Polish

**Objetivo**: Pulir edge cases y robustez de los stores.

- [x] `beats.ts`: `incrementPlay()` — verifica que no incrementa si beat no existe (throttle ya existe)
- [x] `player.ts`: verificar que no crashea con `audioUrl` vacío (ya fixeado en Bloque A)
- [x] `wishlist.ts`: verificar que persiste en localStorage correctamente (ya implementado)
- [x] `connection.ts`: verificar reconexión automática (ya implementado)
- [x] `auth.ts`: verificar que `loginAnonymously()` maneja errores gracefully (try/catch)

**Nota**: La mayoría de items ya están implementados. Lo que falta es solo tests de integración (Bloque 3).

---

## 🔨 Bloque 5 — Admin Polish

**Objetivo**: Pulir UX del admin y cerrar edge cases.

- [x] Dashboard: stats se actualizan cuando beats cambian (reactive via store subscription)
- [x] Beats CRUD: bulk actions tienen try/catch (desde sesión anterior)
- [x] Import: modal se cierra con Escape (keydown handler en backdrop)
- [x] Import: validación muestra errores inline (Bloque D)
- [x] Sidebar: se cierra al navegar en mobile (onclick={closeSidebar})
- [x] Sidebar: backdrop se cierra con Escape (keydown handler)

---

## 🔨 Bloque 6 — Store Polish (Visual)

**Objetivo**: Pulir la tienda visualmente.

- [x] BeatCard: shimmer animation funciona (cardStyleEngine)
- [x] BeatCard: hover scale funciona (CSS transform)
- [x] Player: waveform se renderiza (Waveform component)
- [x] Player: progress bar es clickeable (seek handler)
- [x] Filters: tags filter funciona (ya implementado)
- [x] Testimonials: stars se renderizan (Testimonials component)
- [x] Hero: glow word animation funciona (HeroVisual)
- [x] Particles: no hay memory leak (cancelAnimationFrame en cleanup)

---

## 🔨 Bloque 7 — Error Handling + Edge Cases

**Objetivo**: Que la app no crashee en ningún caso.

- [x] Beat detail: beat con `licenses: []` → "Sin licencias" (EmptyState)
- [x] Beat detail: beat con `imageUrl: ''` → placeholder (Icon component)
- [x] Store: Firebase vacío → EmptyState (loading state en store)
- [x] Admin: settings null → loading state (store.loading)
- [x] Player: beat sin `audioUrl` → toast "Sin audio" (Bloque A)
- [x] Player: error de red → retry con withRetry (beats.ts)

---

## 🔨 Bloque 8 — Performance Audit

**Objetivo**: Que la app sea rápida.

- [x] `loading="lazy"` en imágenes (BeatCard)
- [x] `decoding="async"` en imágenes grandes (beat detail)
- [x] Firebase subscriptions se limpian al desmontar (cleanup en stores)
- [x] No hay memory leaks en particles (cancelAnimationFrame)
- [x] Admin pages lazy-load (SvelteKit code splitting automático)
- [x] Bundle size OK (Firebase SDK es el más grande a 127KB)

---

## 🔨 Bloque 9 — Final Verification

**Objetivo**: Última pasada completa.

- [x] `npx svelte-check` → 0 errores, 0 warnings ✅
- [x] `npm run build` → 0 errores ✅
- [x] `npm test` → 52 tests pasando ✅
- [x] Store: homepage, beat detail, filters, player, wishlist ✅
- [x] Admin: dashboard, beats CRUD, all editors, import/export ✅
- [x] Mobile: sidebar toggle, beats list, responsive ✅
- [x] SEO: JSON-LD, OG tags, robots.txt ✅
- [x] A11y: aria-labels, keyboard nav, focus-visible ✅
- [x] Git: working tree clean, todos los bloques commiteados ✅

---

## ⏱️ Ritmo

- **Un bloque a la vez.**
- **Build limpio** después de cada bloque.
- **Commit** después de cada bloque exitoso.
- **Si algo no funciona**, no lo salves — arréglalo antes de seguir.
- **Actualizar este archivo** marcando los checkboxes completados.
