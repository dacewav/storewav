# StoreWav Deep Audit — Items 8-15

**Date:** 2026-04-30  
**Repo:** dacewav/storewav  
**Branch:** main (commit `43b4a68`)

---

## ✅ Item 8: Search Typeahead — Keyboard Navigation

**Status: FIXED**

### Findings
- `Filters.svelte` typeahead had ArrowUp/Down/Enter/Escape — but **Tab was missing**
- Pressing Tab would close the dropdown (blur event) without selecting
- No ARIA attributes for screen readers

### Changes Made
1. **Tab key now selects** the highlighted beat (same as Enter)
2. Added `role="combobox"` on search input
3. Added `aria-expanded`, `aria-controls`, `aria-activedescendant`
4. Added `id` and `role="option"` on each typeahead item
5. Added `aria-label` on the listbox container

### Remaining
- `CommandPalette.svelte` (admin) is already complete — Arrow/Enter/Escape all handled
- Consider adding debounced search for very fast typing (currently fires on every keystroke)

---

## ✅ Item 9: Loading Skeletons

**Status: FIXED (genre page) + AUDITED**

### Coverage

| Page | Skeleton? | Notes |
|------|-----------|-------|
| Main store (`/`) | ✅ | 6 skeleton cards while beats load |
| Beat detail (`/beat/[id]`) | ✅ | Cover + sidebar skeleton |
| Genre page (`/genre/[slug]`) | ✅ **FIXED** | Was missing — now shows 6 skeleton cards |
| Cart | ⏭️ N/A | Client-side state, instant render |
| Login | ⏭️ N/A | No async data to wait for |
| Account pages | ✅ | Profile, favorites, notifications all have loading states |
| Admin pages | ✅ | AdminSkeleton component used across all admin pages |

### Changes Made
- Genre page: added `loading` state from `$beatsStore.loading` + skeleton grid
- Genre page: imported `beats as beatsStore` for loading state

---

## 🟡 Item 10: Image Optimization

**Status: PARTIALLY AUDITED — No code changes (infra decision needed)**

### Current State
- ✅ All BeatCard images: `loading="lazy" decoding="async"`
- ✅ Typeahead thumbnails: `loading="lazy" decoding="async"`
- ✅ Recently played images: `loading="lazy" decoding="async"`
- ✅ Beat detail cover: eager loading (above the fold — correct)
- ❌ **No `srcset` or `<picture>` elements** anywhere

### Why No srcset
Beat images come from Firebase Storage / R2 URLs. There's no image transformation CDN (Cloudinary, imgix, Bunny Optimizer) that can serve different sizes. Adding `srcset` requires infrastructure changes:

**Recommendation:**
1. Add an image proxy/CDN (e.g., Bunny CDN, Cloudflare Image Resizing, or Cloudinary)
2. Generate multiple sizes on upload (thumbnail, medium, large)
3. Then add `srcset` with `w` descriptors

### Layout Shift (CLS)
- BeatCard cover uses `aspect-ratio: 16/9` in CSS — prevents CLS ✅
- Beat detail cover uses `aspect-ratio: 1/1` — prevents CLS ✅
- Missing explicit `width`/`height` attributes on `<img>` tags (minor CLS risk)

---

## ✅ Item 11: SEO — Meta Tags & Structured Data

**Status: FIXED + AUDITED**

### Coverage

| Page | Title | Description | OG | Twitter | Canonical | JSON-LD |
|------|-------|-------------|-----|---------|-----------|---------|
| Main (`/`) | ✅ | ✅ | ✅ | ✅ | ✅ (layout) | ✅ WebSite |
| Beat detail | ✅ | ✅ | ✅ | ✅ **FIXED** | ✅ **FIXED** | ✅ MusicRecording |
| Genre | ✅ | ✅ | ✅ | ✅ **FIXED** | ✅ **FIXED** | ✅ **FIXED** MusicGenre |
| Cart | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Login | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |

### Changes Made
1. Beat detail: Added `twitter:card`, `twitter:title`, `twitter:image`, `twitter:description`
2. Beat detail: Added `<link rel="canonical">` and `og:url`
3. Genre page: Added canonical URL, `og:url`, `og:type=music.genre`
4. Genre page: Added `twitter:card`, `twitter:title`
5. Genre page: Added JSON-LD `MusicGenre` structured data

### Remaining (low priority)
- Cart/login pages don't have specific OG tags (acceptable — they're utility pages)
- Consider adding `BreadcrumbList` JSON-LD for beat detail pages

---

## 🟡 Item 12: Performance — Bundle Size & Code Splitting

**Status: AUDITED (no code changes — architectural)**

### Current State
- ✅ SvelteKit auto code-splits by route (each page is a separate chunk)
- ✅ Dynamic imports for Firebase: `await import('firebase/database')` in stores
- ✅ Dynamic imports in `Player.svelte` for audio worklet
- ⚠️ **31,853 lines of Svelte** across all components — large codebase
- ⚠️ No lazy loading of admin routes (admin bundle loads even for store visitors)
- ⚠️ All Firebase SDK modules imported (could tree-shake unused features)

### Recommendations
1. **Lazy load admin components** — admin layout should dynamically import admin-only components
2. **Code-split Firebase** — only import `database` on store pages, `auth` on login
3. **Audit npm dependencies** — `@aws-sdk/client-s3` is large; consider using presigned URLs from API
4. **Preload critical CSS** — inline above-the-fold CSS in `<head>`
5. Run `npx vite-bundle-visualizer` to identify large chunks

---

## 🟡 Item 13: Accessibility Audit

**Status: PARTIALLY FIXED + AUDITED**

### Good Practices Found ✅
- BeatCard: `role="button"`, `tabindex="0"`, Enter/Space handlers
- Player: `role="slider"` on progress bar, ARIA labels on all controls
- Filters: ARIA labels on filter buttons, "Quitar filtro" labels
- Mobile menu: Focus trap implemented, auto-focus first element
- Nav: `aria-label="Navegación principal"`
- Hamburger: `aria-expanded`, `aria-label` dynamic
- WishlistPanel: `aria-label` on close button
- OfflineBanner: `role="alert"`

### Issues Found

#### Critical
1. **49 instances of `outline: none`** — removes focus indicators
   - Most components use `border-color` changes on focus, but some don't have visible focus states
   - **Fix:** Add `:focus-visible` outline to all interactive elements

2. **Skip-to-content link missing** — no way to skip navigation
   - **Fix:** Add `<a href="#main-content" class="skip-link">Skip to content</a>`

3. **Color contrast not enforced** — theme is admin-configurable
   - `--text-muted` and `--text-secondary` could fail WCAG AA with certain accent colors
   - **Fix:** Add contrast validation in admin theme editor

#### Moderate
4. **Image alt text** — BeatCard uses `alt={beat.name}` (good), but some decorative images lack `alt=""`
5. **Form inputs** — some admin inputs lack associated `<label>` elements
6. **Modal focus management** — BeatModal, CommandPalette trap focus but don't restore it on close

### Changes Made
- Added ARIA combobox pattern to search typeahead (Item 8)

---

## ✅ Item 14: Error Recovery — Firebase Retry & Offline Mode

**Status: FIXED**

### Current State (before)
- `_firebaseStore.ts`: Error set once, no retry, store stays in error state forever
- `OfflineBanner`: Shows after 3s of disconnection ✅
- `connection.ts`: Monitors both browser online/offline and Firebase `.info/connected` ✅

### Changes Made
1. **Exponential backoff retry** in `_firebaseStore.ts`:
   - Up to 5 retries (1s → 2s → 4s → 8s → 16s → 31s total)
   - Resets retry counter on successful connection
   - Stops retrying when store is destroyed (cleanup)
   - Console warnings for each retry attempt

### Remaining
- No user-facing "retrying..." indicator (could add to OfflineBanner)
- No manual retry button on error states
- Consider adding a global error boundary component

---

## 🟡 Item 15: i18n — Internationalization

**Status: AUDITED (no changes — requires architecture decision)**

### Current State
- **Everything hardcoded in Spanish** — UI labels, error messages, placeholders, ARIA labels
- Settings store has a `labels` object for some configurable strings (good pattern)
- No i18n library installed (no `svelte-i18n`, `paraglide`, etc.)

### Scope of Hardcoded Spanish
- ~150+ Spanish strings across components
- Error messages in stores (`'Firebase no inicializado'`, `'Upload falló'`)
- ARIA labels (`'Navegación principal'`, `'Reproducir'`, `'Pausar'`)
- Filter labels, sort options, empty states

### Recommendation
**Option A: svelte-i18n** (most popular)
- Install `svelte-i18n`
- Create `src/lib/i18n/es.json` and `src/lib/i18n/en.json`
- Replace all hardcoded strings with `$t('key')` calls
- Add language switcher in nav

**Option B: Paraglide JS** (SvelteKit-native, tree-shakes unused locales)
- Better for SvelteKit — compile-time i18n
- Smaller bundle for single-locale users

**Priority:** Low — most users are Spanish-speaking. When ready for English:
1. Extract all strings to a JSON file
2. Install svelte-i18n or paraglide
3. Add `lang` attribute to `<html>` tag
4. Add `hreflang` alternate links for SEO

---

## Summary

| Item | Status | Severity | Action |
|------|--------|----------|--------|
| 8. Search typeahead | ✅ Fixed | Medium | Tab key + ARIA added |
| 9. Loading skeletons | ✅ Fixed | Low | Genre page skeleton added |
| 10. Image optimization | 🟡 Partial | Medium | Needs CDN for srcset |
| 11. SEO | ✅ Fixed | Medium | Canonical + Twitter + JSON-LD |
| 12. Performance | 🟡 Audited | Medium | Bundle analysis needed |
| 13. Accessibility | 🟡 Partial | High | Focus indicators + skip link needed |
| 14. Error recovery | ✅ Fixed | Medium | Firebase retry with backoff |
| 15. i18n | 🟡 Audited | Low | Architecture decision needed |

**Files changed:** 4  
**Lines added:** 81  
**Lines removed:** 11
