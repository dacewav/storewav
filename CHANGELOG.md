# Changelog

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
