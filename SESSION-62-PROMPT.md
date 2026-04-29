# Session 62 — Storewav Continuación

## Contexto
Repo: https://github.com/dacewav/storewav
Stack: SvelteKit 2 + Firebase RTDB + Cloudflare Pages/Workers + R2
Brand: "YUGEN" (configurado en Firebase settings)

## Completado en Session 61 (ya en main)

### Fase 1 — Quick Wins
- Sticky add-to-cart bar on beat detail (mobile, shows when license selected)
- Collapsible filters on mobile (search + toggle button, expands on tap)
- 6 built-in theme presets (Dark Red, Midnight Blue, Neon Purple, Emerald, Sunset, Minimal Light)
- Keyboard shortcuts in store: Space=play/pause, Left/Right=seek ±5s, M=mute
- Now-playing indicator on beat cards (animated equalizer bars)
- Presets section opens by default in theme editor

### Fase 2 — Layout Overhaul
- Collapsible admin sidebar (icon-only mode, persisted in localStorage)
- Dashboard mini charts: genre distribution + top beats by plays (CSS bar charts)
- Hero responsive: reduced padding on mobile (768px/480px breakpoints)

### Fase 3 — Features Mayores
- Genre landing pages (/genre/[slug]) with hero, beat grid, explore more genres
- Recently played section on home (localStorage, tracks last 12 beats)
- Search typeahead in Filters: instant results dropdown with cover, name, artist, genre, BPM
- Keyboard nav in typeahead (↑/↓/Enter/Esc)

### Stats
- svelte-check: 0 errors, 0 warnings
- vitest: 198/198 passing
- 173 source files (92 .svelte, 81 .ts)
- 47 components, 40 route pages, 26 stores

## Pendientes críticos

### Code Quality
1. **`any` types** — 7 instances in contractGenerator.ts, oneTap.ts (type properly)
2. **Large components** — 5 files > 1000 lines (store layout, home, theme, dashboard, beat detail)
3. **No error boundaries** — missing `+error.svelte` in routes
4. **Console.log cleanup** — verify all dev-only logs use `if (dev)`

### Features Fase 3 pendientes
1. **Drag & drop beat reorder** — en admin beats list
2. **Customer list** — ver quién compró qué (orders endpoint exists)
3. **Revenue dashboard** — total ventas, por beat, por período

### Performance
4. **Image optimization** — only 11 images use `loading="lazy"`, should be all
5. **Firebase imports** — 24 import statements, consider tree-shaking
6. **Bundle analysis** — run `vite-bundle-visualizer` to identify large deps

### UX Polish
7. **Offline state** — OfflineBanner exists but could be more prominent
8. **Empty states** — verify all pages have proper empty states
9. **Loading states** — verify skeleton loaders on all data-dependent pages
10. **Toast consistency** — verify all actions provide feedback

### Admin Features
11. **Media library** — grid view, folder organization
12. **Scheduled publish** — beat se activa a fecha/hora
13. **Beat versioning** — ver historial de cambios por beat

### Store Features
14. **Beat comparison** — seleccionar 2-3 beats para comparar side by side
15. **Price filter range slider** — en vez de sort por precio
16. **Audio quality indicator** — mostrar sample rate, bit depth en licenses
17. **Share optimization** — OG images dinámicas por beat

### Security
18. **Firebase rules** — verify all paths have proper auth rules
19. **Rate limiting** — API endpoints need rate limiting
20. **Input validation** — verify all user inputs are sanitized

## Testing manual pendiente

```bash
cd storewav
npm run dev -- --host 0.0.0.0 --port 5173
# Browser tests:
# 1. Genre pages: /genre/trap, /genre/drill, etc.
# 2. Recently played: play beats → check home section
# 3. Search typeahead: type 2+ chars → see dropdown
# 4. Sidebar collapse: toggle → verify persistence
# 5. Dashboard charts: verify data matches beats
# 6. Mobile: hero, filters, sticky cart
# 7. Admin: theme presets apply correctly
```

## Arquitectura nota

### File structure
- `src/lib/components/` — 47 reusable components
- `src/lib/stores/` — 26 Svelte stores (Firebase RTDB)
- `src/lib/actions/` — Svelte actions (reveal, tilt, stagger, etc.)
- `src/routes/(store)/` — Public store pages
- `src/routes/(admin)/admin/` — Admin panel pages
- `src/routes/api/` — Server endpoints (checkout, upload, cron)

### Key patterns
- All Firebase reads use lazy init (`await getDb()`)
- Settings auto-save via `updateFieldDebounced`
- Admin sidebar state persisted in localStorage
- Recently played persisted in localStorage
- Genre pages use slug-based routing

### CSS Design System
- CSS variables in `app.css` (admin-editable via Firebase)
- Accent color: `--accent` (default #dc2626)
- Font stack: Syne (display), Space Grotesk (body), DM Mono (mono)
- Dark theme default, light mode via `theme.lightMode`

## Firebase config (en .env)
```
PUBLIC_FIREBASE_API_KEY=AIzaSyCr2dekkLLifIg0_JlLfEleaV32b5XdvIQ
PUBLIC_FIREBASE_AUTH_DOMAIN=dacewav-store-3b0f5.firebaseapp.com
PUBLIC_FIREBASE_DATABASE_URL=https://dacewav-store-3b0f5-default-rtdb.firebaseio.com
PUBLIC_FIREBASE_PROJECT_ID=dacewav-store-3b0f5
```

## Admin UIDs (para .env)
```
PUBLIC_ADMIN_UIDS=<tu-uid-firebase>
```

## R2 bucket (Cloudflare)
- Bucket: dace-beats
- Domain: cdn.dacewav.store
- Needs: public access + CORS config
