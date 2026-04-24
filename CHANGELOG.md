# Changelog

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
