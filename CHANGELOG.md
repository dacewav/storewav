# Changelog

## v0.8.0 — 2026-04-25 (Deep Audit v2 — Full Codebase)

### 🔍 Comprehensive Audit Results (25 findings)

#### 🔴 Critical (2)
- **`effect_update_depth_exceeded` ROOT CAUSE FOUND** — `(admin)/+layout.svelte:37`: `$effect` reads AND writes `lastStatus` ($state). Svelte 5 registers `lastStatus` as a dependency (read in conditional), then the write triggers re-run → infinite loop. **Fix:** wrap `lastStatus` read in `untrack()`.
- **XSS via `{@html dividerTitle}`** — `(store)/+page.svelte:248`: Section divider renders raw HTML from Firebase `settings.section.dividerTitle` with no sanitization. Any admin can inject arbitrary HTML/JS. **Fix:** sanitize with DOMPurify or use structured format.

#### 🟡 High (4)
- **BeatEditor `$effect` reads+writes `autoSaveTimer`** — `BeatEditor.svelte:102`: Same pattern as critical bug #1. `$effect` reads `autoSaveTimer` in conditional, then writes it → potential loop. **Fix:** use `untrack()` or module-level `let`.
- **Missing try/catch in bulk operations** — `admin/beats/+page.svelte:76-121`: `bulkSetActive`, `bulkDelete`, `moveBeat`, `handleDuplicate` all lack error handling. Firebase failures are silent.
- **Missing try/catch in `confirmDelete`** — `admin/beats/+page.svelte:98`: `deleteBeat` called without error handling.
- **`undoField`/`redoField` no error handling** — `settings.ts`: Undo/redo stacks mutate before Firebase update; if update fails, state is inconsistent.

#### 🟡 Medium (11)
- **Mixed `$app/stores` vs `$app/state`** — `(store)/beat/[id]/+page.svelte:2`: Uses deprecated `$app/stores` while all other files use Svelte 5's `$app/state`.
- **`{@html svg}` in Icon component** — `Icon.svelte:29`: Low risk (hardcoded source) but no validation if `name` comes from user input.
- **`as any` bypasses icon type safety** — `(store)/+page.svelte:205`: `link.icon as any` casts Firebase data to bypass `IconName` type.
- **Import errors only logged to console** — `admin/+page.svelte:64`: Beat creation failures during import are `console.error` only, not shown to user.
- **Empty `onkeydown` handler on mobile overlay** — `(store)/+layout.svelte:195`: `onkeydown={() => {}}` is a no-op a11y suppression.
- **Delete modals suppress a11y warnings** — `BeatEditor.svelte`, `admin/beats/+page.svelte`: Use `svelte-ignore` instead of proper keyboard handlers.
- **`getComputedStyle` per BeatCard instance** — `BeatCard.svelte:31`: Each of N cards runs `$effect` calling `getComputedStyle`. Should be shared.
- **`JSON.stringify(beat)` on every keystroke** — `BeatEditor.svelte:103`: Auto-save effect serializes entire beat object as dependency trigger.
- **No offline write queue** — `settings.ts`: Failed settings updates retry once then give up. No persistent queue.
- **14× `Record<string, any>` casts** — All admin pages: Settings sub-objects cast to `any`, losing type safety. Proper types exist (`ThemeSettings`, etc.).
- **Per-card `$effect` for shared `accentRgb`** — `BeatCard.svelte:31`: Should be a shared store read once at layout level.

#### 🟢 Low (8)
- **Empty `alt=""` on player cover** — `Player.svelte:45`: Should have meaningful alt for currently playing beat.
- **Missing `aria-pressed` on wishlist button** — `BeatCard.svelte:100`: Button has `aria-label` but no pressed state.
- **No lazy loading for admin pages** — Admin layout eagerly loads all page components.
- **40+ unused keyframe definitions** — `cardStyleEngine.ts`: Most animations never used, adding CSS bloat.
- **No `onDisconnect` handling** — `connection.ts`: Firebase disconnect not handled for presence.
- **Analytics events silently dropped** — `analytics.ts:35`: Events lost when flush fails and queue overflows.
- **`AdminSidebar` component never used** — Dead code in `src/lib/components/AdminSidebar.svelte`.
- **Version mismatch** — `admin/+page.svelte`: Shows "v0.7.0" in badge but "v0.6.0" in system info.

### 📋 Fix Priority Order
1. `untrack()` for `lastStatus` in admin layout (fixes `effect_update_depth_exceeded`)
2. Sanitize `{@html dividerTitle}` (XSS vector)
3. `untrack()` for `autoSaveTimer` in BeatEditor
4. try/catch for all bulk admin operations
5. Use `$app/state` consistently
6. Replace `Record<string, any>` with proper types

---

## v0.7.0 — 2026-04-24 (Deep Audit + Solidification)

### 🔧 Schema & Types
- **Beat schema aligned** — todos los campos alineados con deployed Firebase rules
- **Dead types removed** — Platforms, License, LicenseNames eliminados
- **Deprecated fields removed** — coverUrl, createdAt eliminados del Beat type
- **Broken re-exports fixed** — index.ts ya no exporta tipos inexistentes
- **License labels cleaned** — 8 campos de labels obsoletos eliminados (licenseBasic/Premium/Unlimited/Exclusive)

### ✨ Nuevas features
- **Seed demo beats** — 8 beats de ejemplo (Trap, R&B, Drill, Corrido, Pop, Ambient, Hip-Hop, Reggaeton)
- **Seed button** — botón en admin dashboard para poblar Firebase con un click
- **Content editor mejorado** — 15 campos de labels nuevos (testimonials, beat page, login, error)

### 🐛 Fixes (12 issues)
- **16 missing keyframes** — drift, spin, tilt, sway, popIn, elastic, dropIn, riseUp, flipX, flipY, rubber, squeeze, float
- **Object.keys() en array** — licenses.length corregido en dashboard + store page
- **shimmerCSS incompleta** — función simplificada, ya no retorna código muerto
- **countUp re-animación** — ahora re-anima cuando el valor target cambia
- **siblingBlur cleanup** — event listeners correctamente removidos en destroy()
- **Player metadata leak** — wrapper one-shot se remueve a sí mismo
- **CSS warnings** — .grid-3 eliminado de BeatEditor
- **svelte-check** — 0 errores, 0 warnings

### 📋 Guide System
- **AUDIT-MASTER.md** — actualizado con estado real del proyecto (verificado 2026-04-24)
- **SOLIDIFICATION-PLAN.md** — nuevo mega plan de 8 sesiones para solidificación

---

## v0.6.0 — 2026-04-20 (Sesión A+B+C+D)

### ✨ Nuevas features
- **Save status real** — admin layout conectado a Firebase writes
- **Auto-save** — BeatEditor guarda 1s después de último cambio
- **Featured beats** — sección "Destacados" en store page
- **Animated counters** — stats del hero animan de 0 a valor
- **Hero links** — settings.links como pill buttons
- **OG image** — svg estático + twitter:card meta
- **SEO** — robots.txt + sitemap.xml
- **Export/import** — backup JSON desde admin dashboard
- **Undo/redo** — stack 20 entries, Ctrl+Z/Ctrl+Shift+Z
- **Bulk actions** — select, activate/deactivate/delete múltiple
- **Waveform cards** — 16 barras animadas cuando reproduce
- **44 animation presets** — drift, spin, tilt, sway, popIn, elastic, etc.
- **Keyboard shortcuts** — Ctrl+B/H/T/D/G, / para search

### 🔒 Security
- Storage rules: catch-all block, size/type restrictions
- DB rules: admin-only write, strict validation

### 🐛 Fixes
- Build sin .env (placeholder para auditorías)
- BLOCK-CONTEXT.md formato unificado

---

## v0.5.0 — 2026-04-20 (Audits + Diseño)

- Audit profundo 26 issues fixeados
- Catalog→Store design: fases 1-4
- 53 keyframes, 258 CSS vars
- Mega plan de construcción (26 items, 4 sesiones)

---

## v0.4.0 — 2026-04-19 (Bloques 0-5)

- SvelteKit + Firebase + Cloudflare setup
- Design system (20 componentes, 116+ tokens)
- Firebase stores (9 stores, real-time sync)
- Store page (hero, grid, filters, player, wishlist)
- Beat page (/beat/[id])
- Admin panel completo (beats CRUD, theme, content, brand, banner, layout, animations)
