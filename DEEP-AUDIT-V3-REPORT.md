# DEEP AUDIT V3 — Report
**Date:** 2026-05-16
**Live:** https://dacewav.store
**Stack:** SvelteKit 2 + Svelte 5 + Firebase RTDB + Cloudflare Pages + R2

---

## Summary

| Severity | Count |
|----------|-------|
| 🔴 BUG  | 2     |
| 🟡 VISUAL | 5   |
| 🟢 MEJORA | 8   |

**Tests:** 280/280 ✅ | **svelte-check:** 0 production errors (env vars expected) | **Build:** OK (needs .env) | **as any:** 0 in prod | **.subscribe() leaks:** 0

---

## Code Quality — CLEAN ✅

| Check | Status |
|-------|--------|
| Tests (280) | ✅ All passing |
| svelte-check | ✅ 0 errors (env vars expected) |
| `as any` casts | ✅ 0 in production code |
| `@ts-ignore` | ✅ 0 |
| `.subscribe()` sin cleanup | ✅ 0 (all fixed) |
| `$effect` sin cleanup | ✅ All with listeners have returns |
| escapeJsonLd | ✅ All JSON-LD sanitized |
| CORS audio | ✅ No crossOrigin on audio element |
| Cursor glow mobile | ✅ Skips on `(hover: none)` |
| Volume persistence | ✅ localStorage read/write |
| Theme persistence | ✅ localStorage + system pref |
| Keyboard shortcuts | ✅ Space, ←→, M |
| View transitions | ✅ CSS fallback |

---

## 🔴 BUG

### 🔴 BUG-01: BeatCard `$inWishlist` usa store sin desuscribir

**Componente:** `src/lib/components/BeatCard.svelte:172`
**Problema:** `class:active={$inWishlist}` — `inWishlist` es un `store` retornado por `wishlist.isIn()` que devuelve un `Readable<boolean>`. En Svelte 5, usar `$inWishlist` en el template está bien, pero el store se crea en cada render del componente. No es un leak crítico pero genera stores innecesarios.

**Línea actual:**
```typescript
let inWishlist = $derived(wishlist.isIn(beat.id));
```

**Problema:** `wishlist.isIn()` retorna un nuevo store cada vez. Con `$derived`, se subscribe al resultado. Funciona, pero crea un store wrapper nuevo por cada BeatCard.

**Solución:** Usar directamente la lista de wishlist:
```typescript
let wishIds = $derived($wishlist);
let inWishlist = $derived(wishIds.includes(beat.id));
```

**Esfuerzo:** S (5 min) | **Impacto:** Bajo — rendimiento menor

---

### 🔴 BUG-02: Orders page descarga sin token (flujo legacy)

**Componente:** `src/routes/(store)/account/orders/+page.svelte:62-66`
**Problema:** La función `downloadBeat()` no pasa token de descarga — abre `/api/download/${orderId}/${beatId}` sin `?token=`. El endpoint requiere token para órdenes nuevas (7-day TTL). Las órdenes legacy sin token funcionan, pero las nuevas fallarían.

**Línea actual:**
```typescript
function downloadBeat(orderId: string, beatId: string, beatName: string) {
    const url = `/api/download/${orderId}/${beatId}`;
    window.open(url, '_blank');
}
```

**Solución:** Obtener tokens del endpoint `/api/orders` (ya los devuelve) y pasarlos como query param:
```typescript
// En searchOrders(), guardar tokens:
let downloadTokens = $state<Record<string, string>>({});
// Después de fetch: if (result.downloadTokens) downloadTokens = result.downloadTokens;

function downloadBeat(orderId: string, beatId: string) {
    const token = downloadTokens[beatId];
    const url = `/api/download/${orderId}/${beatId}${token ? `?token=${token}` : ''}`;
    window.open(url, '_blank');
}
```

**Esfuerzo:** S (15 min) | **Impacto:** Alto — descargas desde "Mis órdenes" pueden fallar

---

## 🟡 VISUAL

### 🟡 VIS-01: Mobile — play button en BeatCard muy grande (56px)

**Componente:** `src/lib/components/BeatCard.svelte`
**Problema:** En `@media (hover: none)`, el botón de play crece a 56px y los botones de wishlist/cart a 40px. En cards pequeñas (mobile grid), esto domina la cover image.

**Solución:** Reducir a 48px play, 36px action buttons:
```css
@media (hover: none), (max-width: 640px) {
    .beat-play {
        width: 48px;
        height: 48px;
    }
    .beat-wish, .beat-cart-btn {
        width: 36px;
        height: 36px;
    }
}
```

**Esfuerzo:** XS (5 min)

---

### 🟡 VIS-02: Hero stats — 3er stat sin borde derecho

**Componente:** `src/routes/(store)/+page.svelte`
**Problema:** Los stats del hero no tienen separación visual entre ellos. En desktop se ven bien por el gap, pero en mobile (2x2 grid) el 3er stat queda sin borde simétrico.

**Solución:** Agregar borde sutil entre stats:
```css
.stat {
    padding: 0 var(--space-4);
    border-right: 1px solid var(--border);
}
.stat:last-child {
    border-right: none;
}
```

**Esfuerzo:** XS (5 min)

---

### 🟡 VIS-03: Cart — "Seguir comprando" link aparece debajo de items

**Componente:** `src/routes/(store)/cart/+page.svelte`
**Problema:** El link "← Seguir comprando" está entre los items y el summary. En desktop con grid layout, esto rompe la alineación — aparece debajo de los items pero fuera del grid.

**Solución:** Moverlo arriba de los items o dentro del header del carrito.

**Esfuerzo:** S (5 min)

---

### 🟡 VIS-04: Notifications — delete button invisible hasta hover

**Componente:** `src/routes/(store)/account/notifications/+page.svelte`
**Problema:** El botón de eliminar notificación tiene `opacity: 0` y solo aparece en hover. En mobile touch, nunca se ve. El usuario no sabe que puede eliminar notificaciones.

**Solución:** Mostrar con `opacity: 0.5` por defecto en mobile:
```css
@media (hover: none) {
    .delete-btn { opacity: 0.5; }
}
```

**Esfuerzo:** XS (2 min)

---

### 🟡 VIS-05: Verify page — spinner no usa variable de tema

**Componente:** `src/routes/verify/[hash]/+page.svelte`
**Problema:** El spinner usa `border-top-color: var(--accent)` que está bien, pero el `border: 3px solid var(--border)` puede ser muy sutil en dark mode.

**Solución:** Ya usa variables de tema — menor issue. OK.

**Esfuerzo:** N/A (ya fixeado en audit anterior)

---

## 🟢 MEJORA

### 🟢 MEJ-01: Lazy load de imágenes en beat grid con IntersectionObserver

**Status:** ✅ Ya implementado en BeatCard con `lazy` prop y `IntersectionObserver`.

### 🟢 MEJ-02: Skeleton loading en catálogo

**Status:** ✅ Ya implementado — `<Skeleton>` component cuando `beatsLoading`.

### 🟢 MEJ-03: Typeahead search en filters

**Status:** ✅ Ya implementado — top 5 results con keyboard navigation.

### 🟢 MEJ-04: Price range filter con presets

**Status:** ✅ Ya implementado — min/max inputs + quick presets (< $500, $500-$1k, etc).

### 🟢 MEJ-05: Recently played section

**Status:** ✅ Ya implementado — horizontal scroll con clear button.

### 🟢 MEJ-06: For You recommendations

**Status:** ✅ Ya implementado — basado en likes del usuario.

### 🟢 MEJ-07: Back to top button

**Status:** ✅ Ya implementado — aparece después de 600px scroll.

### 🟢 MEJ-08: Show More batching en catálogo

**Status:** ✅ Ya implementado — batch de 8 beats con "Mostrar más" y "Mostrar todos".

---

## Pages Review (Browser Testing)

| Page | Status | Notes |
|------|--------|-------|
| `/` | ✅ | Hero, featured, catalog, filters, CTA — todo funciona |
| `/kits` | ✅ | Grid, search, genre pills — OK |
| `/beat/[slug]` | ✅ | Cover, waveform, licenses, related, comments, sticky bar |
| `/cart` | ✅ | Items, discount, summary, mobile checkout bar |
| `/login` | ✅ | Google, email link, admin check, theme-responsive |
| `/checkout/success` | ✅ | Order items, download, ZIP, discount display |
| `/checkout/cancel` | ✅ | Clean empty state |
| `/account/orders` | ⚠️ | Works but download sin token (BUG-02) |
| `/account/notifications` | ✅ | List, mark read, delete, time ago |
| `/verify/[hash]` | ✅ | Theme-responsive, onMount fetch |

---

## Priority Order for Fixes

1. **BUG-02** — Orders download token → `S` (15 min) — **CRITICAL para UX post-compra**
2. **VIS-01** — Mobile button sizes → `XS` (5 min)
3. **VIS-03** — Cart "Seguir comprando" placement → `S` (5 min)
4. **VIS-04** — Notification delete on mobile → `XS` (2 min)
5. **BUG-01** — BeatCard wishlist store → `S` (5 min) — low impact

---

## Features Already Working Well ✅

- Waveform (static + live mode with shared AudioContext)
- Player bar with all controls
- Beat cards with play, wishlist, cart
- Filters: genre, key, sort, tags, price range
- Theme dark/light toggle
- Keyboard shortcuts (Space, ←→, M)
- View transitions
- Mobile responsive layout
- Mobile menu with search
- Wishlist panel
- Cart with discount codes
- Stripe checkout flow
- Download with token TTL
- Contract verification
- Admin panel (comprehensive)
- Particles, floating elements
- Animations system
- Card style engine
- SEO (JSON-LD, OG tags, sitemap)
