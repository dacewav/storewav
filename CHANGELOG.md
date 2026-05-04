# Changelog

## v1.4.0 — 2026-05-04 (Session 63 — Drumkits Section)

### 🥁 Drumkits
- **Kit type + store** — `src/lib/stores/kits.ts` with Firebase CRUD, `kitsList`, `kitsStats`, `kitGenres`
- **KitCard component** — cover image, genre badge, sample count, play button, add-to-cart
- **`/kits` store page** — grid with search, genre pills, empty state
- **`/kit/[id]` detail page** — cover, description, pricing, sample list with inline audio preview (play/pause per sample)
- **Admin CRUD** — `/admin/kits` with create/edit/delete, sample management, active toggle
- **Cart integration** — kits use `kit-{id}` as beatId, same cart system as beats
- **Store nav** — "Kits" link in desktop nav + mobile menu
- **Admin nav** — "🥁 Drumkits" in sidebar under Tienda
- **Firebase rules** — public read, admin write, field validation for kits

### 📁 Files Changed
- `src/lib/stores/kits.ts` — new store
- `src/lib/stores/index.ts` — export kit types and functions
- `src/lib/components/KitCard.svelte` — new component
- `src/lib/components/index.ts` — export KitCard
- `src/routes/(store)/kits/+page.svelte` — store page
- `src/routes/(store)/kit/[id]/+page.svelte` — detail page
- `src/routes/(admin)/admin/kits/+page.svelte` — admin CRUD
- `src/routes/(admin)/+layout.svelte` — admin nav link
- `src/routes/(store)/+layout.svelte` — store nav + mobile menu link
- `firebase.rules.json` — kits rules

## v1.3.0 — 2026-05-04 (Session 63 — User Profiles Completos + Audit)

### 👤 User Profiles
- **Banner upload** — `/api/upload/banner` endpoint → R2, 3:1 crop (1200×400), 4MB max
- **Banner UI** — dashed border placeholder, hover overlay, 3:1 crop with canvas
- **Username uniqueness** — real-time check against Firebase REST API, debounced 500ms, visual status indicator (⏳/✓/✕)
- **Username input** — `@` prefix, lowercase alphanumeric + dashes, max 24 chars
- **Account layout avatar** — now shows R2 custom avatar instead of Google photoURL when available

### 🔧 Admin Users Page (`/admin/users`)
- **User list** — all Firebase users with avatar, name, username, email, badges, country
- **Stats cards** — total users, with profile, with badges, banned
- **Search** — by name, email, username, artist name
- **Sort** — most recent, name A-Z, most purchases
- **Badge editor** — toggle badges (first-beat, fan, super-fan, vocal, early-bird, vip) per user
- **Ban/unban** — toggle ban status with confirmation styling
- **Profile detail** — expandable panel showing full profile, UID, public profile link
- **Sidebar link** — added "👤 Usuarios" to Ventas group in admin nav
- **REST API pattern** — uses auth token via `getAuthToken()` (not Firebase SDK) to work with deployed rules

### 🔒 Firebase Rules
- **Users path** — public `.read` for profile data, `.write` restricted to owner + admin
- **`.indexOn: ["username"]`** — enables efficient username queries
- **Field validation** — username (24 chars, alphanumeric), bio (160 chars), artistName (100 chars), badges, banned
- **⚠️ NOT DEPLOYED** — rules updated in `firebase.rules.json` but need `firebase deploy --only database`

### 🧪 Browser Testing (Session 63)
- **Store page** — all 29 Lucide icons verified rendering correctly (search, cart, heart, play, share, etc.)
- **Beat detail page** — chevronLeft, play, heart, share, shoppingCart, music all ✅
- **Player** — skipBack, skipForward, pause, play, volumeOn, volumeOff, close all ✅
- **Filters** — search, close, chevronDown, tag all ✅
- **Account tabs** — export, shoppingCart, heart, music icons ✅
- **Admin topbar** — undo, redo, save, export, import, logout all ✅
- **Profile page** — banner upload, avatar upload, username validation, save to Firebase all ✅
- **Admin users** — loads users from Firebase, stats display, search, sort all ✅
- **Mobile 375px** — single column, icons scale correctly ✅
- **Brand icons** — whatsapp, instagram, youtube render as inline SVG ✅

### ⚠️ Known Issues (deployed rules)
- `/u/[username]` returns "Usuario no encontrado" — deployed rules block public reads
- Admin users shows 0 — deployed rules restrict `/users` to own-data-only
- **Fix**: deploy `firebase.rules.json` → `firebase deploy --only database`

### 👤 User Profiles
- **Banner upload** — `/api/upload/banner` endpoint → R2, 3:1 crop (1200×400), 4MB max
- **Banner UI** — drag-to-upload with preview, dashed border placeholder, hover overlay
- **Username uniqueness** — real-time check against Firebase on input, debounced 500ms, visual status indicator (⏳/✓/✕)
- **Username input** — `@` prefix, lowercase alphanumeric + dashes, max 24 chars
- **Account layout avatar** — now shows R2 custom avatar instead of Google photoURL when available

### 🔧 Admin Users Page (`/admin/users`)
- **User list** — all Firebase users with avatar, name, username, email, badges, country
- **Stats cards** — total users, with profile, with badges, banned
- **Search** — by name, email, username, artist name
- **Sort** — most recent, name A-Z, most purchases
- **Badge editor** — toggle badges (first-beat, fan, super-fan, vocal, early-bird, vip) per user
- **Ban/unban** — toggle ban status with confirmation styling
- **Profile detail** — expandable panel showing full profile, UID, public profile link
- **Sidebar link** — added "👤 Usuarios" to Ventas group in admin nav

### 🔒 Firebase Rules
- **Users path** — public `.read` for profile data, `.write` restricted to owner + admin
- **`.indexOn: ["username"]`** — enables efficient username queries
- **Field validation** — username (24 chars, alphanumeric), bio (160 chars), artistName (100 chars), badges, banned

### 📁 Files Changed
- `src/routes/api/upload/banner/+server.ts` — new endpoint
- `src/routes/(store)/account/profile/+page.svelte` — banner upload, username validation
- `src/routes/(store)/account/+layout.svelte` — custom avatar display
- `src/routes/(admin)/admin/users/+page.svelte` — new admin page
- `src/routes/(admin)/+layout.svelte` — added Users nav link
- `firebase.rules.json` — updated users rules
- `CHANGELOG.md` — updated

## v1.2.0 — 2026-05-04 (Session 63 — Lucide Icons Migration)

### ✨ Lucide Icons Migration
- **Migrated 29 icons** from inline SVG strings to `lucide-svelte` components
- **`icons.ts` reduced** from 380+ lines of SVG strings → 12-line type re-export
- **`{@html svg}` eliminated** — removes XSS vector flagged in audit v0.8 (medium risk)
- **Tree-shakeable** — individual icon imports (`import Heart from 'lucide-svelte/icons/heart'`), no barrel import
- **Brand icons preserved** — whatsapp, instagram, youtube kept as inline SVG (Lucide doesn't include brand icons)
- **`filled` prop** — heart filled state uses Lucide's native `fill` prop (no more conditional SVG generation)

### Icon Mapping
| Old (icons.ts) | New (Lucide) |
|---|---|
| heart | Heart |
| play | Play |
| pause | Pause |
| close | X |
| search | Search |
| check | Check |
| warning | TriangleAlert |
| error | CircleX |
| volumeOn | Volume2 |
| volumeOff | VolumeX |
| music | Music |
| tag | Tag |
| sun | Sun |
| moon | Moon |
| chevronDown | ChevronDown |
| chevronLeft | ChevronLeft |
| chevronUp | ChevronUp |
| settings | Settings |
| edit | Pencil |
| trash | Trash2 |
| plus | Plus |
| undo | Undo2 |
| redo | Redo2 |
| save | Save |
| export | Download |
| share | Share2 |
| import | Upload |
| logout | LogOut |
| skipBack | SkipBack |
| skipForward | SkipForward |
| shoppingCart | ShoppingCart |
| bell | Bell |
| whatsapp | *(kept as inline SVG)* |
| instagram | *(kept as inline SVG)* |
| youtube | *(kept as inline SVG)* |

### 🧪 Testing
- **228/228 tests passing** (no regressions)
- **svelte-check: 0 new errors** (12 pre-existing env var errors)
- **Build: clean** (Cloudflare adapter)

### 📁 Files Changed
- `package.json` — added `lucide-svelte` dependency
- `src/lib/icons.ts` — replaced 380+ lines of SVG with type re-export
- `src/lib/components/Icon.svelte` — rewritten to use Lucide components with brand SVG fallback
- `CHANGELOG.md` — updated

---

## v1.1.0 — 2026-05-04 (Session 62 — Mega Audit Implementation)

### 🔒 Security
- **XSS fix: `escapeJsonLd()`** — JSON-LD scripts now escape `</script>` to prevent script injection via beat names/artist fields
- **CSP headers** — `Content-Security-Policy` added to `_headers` for Cloudflare Pages (script-src, style-src, connect-src whitelisted)
- **`_headers` moved to project root** — Cloudflare adapter requires it at root, not in `static/`

### 📱 Mobile Responsive (Option A)
- **Genre pills fade edge** — Horizontal scroll now has gradient mask on both sides to indicate more content
- **Player progress bar** — Bigger touch targets on mobile (8px track, 20px thumb vs 4px/12px desktop)
- **Player mini-mode** — Artist label hidden, cover shrunk to 32px on ≤480px
- **Hero stats 2x2 grid** — Stats now display as 2×2 grid on mobile instead of cramped row
- **Hero links full-width** — Social links stack vertically on mobile
- **Beat detail cover** — Added `loading="lazy"` for performance

### 📊 Analytics Dashboard (Option D)
- **Plays KPI card** — Total plays from Firebase analytics events
- **Carts KPI card** — Total cart additions from analytics events
- **Recent activity feed** — Last 20 events (plays, likes, carts, comments) with timestamps and icons

### 👤 User Profiles (Option B)
- **Username field** — Unique @handle with validation (lowercase, alphanumeric, dashes)
- **Bio field** — 160-char bio with live character counter
- **BadgeDisplay component** — New component showing earned badges (🎵 first-beat, ❤️ fan, 🔥 super-fan, 💬 vocal, ⭐ early-bird, 👑 vip)
- **Public profile page** — `/u/[username]` route showing user's profile, bio, badges, socials, and beats
- **Badges in account header** — User's earned badges shown below their name
- **Profile fields** — username, bio integrated into account profile page

### 🧪 Testing
- **6 new tests** — `escapeJsonLd` test suite (empty input, XSS escape, case-insensitive, safe strings, JSON roundtrip)
- **228/228 tests passing** (was 222)
- **svelte-check: 0 errors, 0 warnings**
- **Build: clean** (Cloudflare adapter)

### 📁 Files Changed
- `src/lib/sanitize.ts` — Added `escapeJsonLd()`
- `src/lib/__tests__/sanitize.test.ts` — 6 new tests
- `src/lib/components/BadgeDisplay.svelte` — New component
- `src/lib/components/index.ts` — Export BadgeDisplay
- `src/lib/components/Filters.svelte` — Genre pills fade edge
- `src/lib/components/Player.svelte` — Mobile touch targets
- `src/routes/(store)/+page.svelte` — XSS fix, hero responsive
- `src/routes/(store)/beat/[id]/+page.svelte` — XSS fix, lazy loading
- `src/routes/(store)/account/+layout.svelte` — Badges display
- `src/routes/(store)/account/profile/+page.svelte` — Username, bio fields
- `src/routes/(store)/u/[username]/+page.svelte` — New public profile page
- `src/routes/(admin)/admin/analytics/+page.svelte` — Plays, carts, activity feed
- `_headers` — CSP headers (new file, project root)
- `.env` — Created from `.env.example`

---

## v1.0.0 — 2026-04-25 (Audit Complete + Integration Tests + A11Y)

### 🧪 Testing
- **28 integration tests** — Firebase mock completo (database, auth, env)
- **Settings migration tests** — flat→nested, globalCardStyle, animations, labels, CTA
- **Beats derived stores tests** — allBeatsList, beatsList, beatsStats, genres, allTags
- **Beats CRUD tests** — create, update, delete, reorder, swap
- **Wishlist tests** — toggle, has, clear, isIn reactive
- **Auth tests** — initAuth, loginAnonymously, logout, destroyAuth
- **80 tests total, 6 test files, all passing**

### 🔧 Type Safety Overhaul
- **0 `Record<string, any>`** — replaced with proper types (ThemeSettings, HeroSettings, etc.) in all 7 admin pages + root layout
- **0 `as any`** — LinkItem.icon typed as IconName, store page uses proper type
- **`shimmerOpacity` added to CardStyleConfig** — was created by migration but missing from type
- **`lightMode` added to ThemeSettings** — was used in theme page but missing from type
- **Package version aligned** — 0.5.0 → 1.0.0

### ♿ Accessibility
- **11/13 `svelte-ignore` a11y eliminated** — proper ARIA roles, keyboard handlers, tabindex
- **BeatCard**: removed ignore (already had role=button + keyboard)
- **Modal.svelte**: removed ignore (already had role=dialog + keyboard)
- **FileUpload.svelte**: removed ignore (already had role=button + keyboard)
- **WishlistPanel**: role=button + aria-label
- **Store layout mobile overlay**: proper Escape handler
- **Admin layout sidebar**: keyboard + role=button + aria-label
- **BeatEditor + beats list delete modals**: role=alertdialog + keyboard + aria-modal
- **Beats [id] wrapper**: role=form + aria-label
- **Admin import modal**: role=dialog + aria-modal
- **aria-pressed** on wishlist toggle button
- **Meaningful alt text** on Player cover + WishlistPanel images

### 🐛 Bug Fixes
- **`shimmerOpacity` dead field** — added to CardStyleConfig type + cardStyleEngine + BeatCard CSS var
- **console.log in production** — gated behind `dev` in auth.ts, init.ts
- **Empty `onkeydown` handler** — replaced with proper Escape handler

### 🧹 Cleanup
- **AdminSidebar.svelte deleted** — 118 lines dead code (exported but never imported)
- **`getComputedStyle` → shared store** — cssVars.ts with MutationObserver (1 read vs N)
- **console.log gated** — auth.ts, init.ts info logs behind `dev` flag

### 📊 Final Status
- svelte-check: **0 errors, 0 warnings**
- Tests: **80 passing, 6 files**
- Build: **clean**
- svelte-ignore a11y: **2** (legitimate modal overlay backdrops)

---

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
> **v1.0.0 update: 19/22 findings fixed.** Remaining: offline write queue, lazy loading admin, unused keyframes (low priority).

1. ✅ `untrack()` for `lastStatus` in admin layout — **FIXED in v0.8.0**
2. ✅ Sanitize `{@html dividerTitle}` — **FIXED in v0.8.0**
3. ✅ `untrack()` for `autoSaveTimer` in BeatEditor — **FIXED in v0.8.0** (version counter)
4. ✅ try/catch for all bulk admin operations — **FIXED in v0.8.0**
5. ✅ Use `$app/state` consistently — **FIXED in v0.8.0**
6. ✅ Replace `Record<string, any>` with proper types — **FIXED in v1.0.0**

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
