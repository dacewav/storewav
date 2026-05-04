# DACEWAV.STORE — SESSION 64 PROMPT
> Generado: Mayo 2026 | Repo: github.com/dacewav/storewav | Stack: SvelteKit 2 + Svelte 5 + Firebase RTDB + Cloudflare Pages + R2 + TypeScript

---

## 📊 ESTADO ACTUAL (post-Session 63)

| Métrica | Estado |
|---|---|
| Tests | ✅ 228/228 passing |
| TypeScript errors | ✅ 0 |
| svelte-check | ✅ 0 errors, 0 warnings |
| Build | ✅ Clean (Cloudflare adapter) |
| Mobile responsive | ✅ Store + admin |
| Lucide icons | ✅ 29 icons migrated |
| User profiles | ✅ Banner, avatar, username, admin users |
| Drumkits | ✅ /kits, /kit/[id], admin CRUD |
| Pasarela de pago | ⚠️ Endpoints existen, falta conexión real |

---

## ✅ LO QUE SE HIZO EN SESSION 63

### A) Lucide Icons Migration
- 29 icons migrados de inline SVG a `lucide-svelte`
- Tree-shakeable (individual imports)
- Brand icons (whatsapp/instagram/youtube) kept as inline SVG
- `icons.ts` reducido de 380+ lines a type re-export
- XSS vector eliminado (`{@html svg}` minimizado)

### B) User Profiles Completos
- Banner upload `/api/upload/banner` → R2 (3:1 crop, 4MB max)
- Username uniqueness validation (real-time, debounced 500ms)
- Account layout muestra avatar R2 custom
- Admin users page: lista, search, sort, badge editor, ban/unban
- Firebase rules: public read, owner+admin write, field validation

### D) Drumkits Section
- Kit type + Firebase store (`kits.ts`)
- KitCard component (cover, genre badge, play, cart)
- `/kits` store page con search + genre pills
- `/kit/[id]` detail con inline audio previews
- Admin CRUD: create/edit/delete kits, sample management
- Cart integration (`kit-{id}` como beatId)
- Nav links en store + admin sidebar
- Firebase rules para kits

### ⚠️ Pendientes (deploy)
- `firebase deploy --only database` — rules para users (public read) y kits (new)
- `/u/[username]` no funciona hasta deployar rules

---

## 🤖 PROMPT PARA SESIÓN 64

```
DACEWAV.STORE — SESIÓN 64
Repo: https://github.com/dacewav/storewav
Stack: SvelteKit 2 + Svelte 5 + Firebase RTDB + Cloudflare Pages/Workers + R2 + TypeScript

════════════════════════════════════════
CONTEXTO
════════════════════════════════════════

Beat store personal. Brand: "YUGEN". Dev: Dace, Puebla MX.
Aesthetic: dark luxury, minimal, premium.
Géneros: Trap, Corrido Tumbado, R&B, Drill, Reggaeton, Hip-Hop.

Estado post-Session 63:
- 228/228 tests passing, 0 TS errors, 0 svelte-check warnings
- Lucide icons migrados (29 icons)
- User profiles: banner, avatar, username, admin users
- Drumkits: /kits, /kit/[id], admin CRUD
- Mobile responsive completo
- Cart funcional (beats + kits)

Lo que existe:
STORE: hero, beat grid, filters, BeatCard, Player, WishlistPanel, cart, /kits, /kit/[id],
       /u/[username], /account/profile, SEO, page transitions
ADMIN: CRUD beats, CRUD kits, users (badges, ban), theme, content, brand, banner,
       animations, discounts, analytics, customers, contracts, emails, command palette

Lo que NO existe aún:
- Pasarela de pago real (Stripe/Conekta) — endpoints /api/checkout y /api/webhook/stripe existen
- Blog section (/blog)
- Beat scheduling (lanzamiento programado)
- Email de confirmación (Resend)
- Download links con R2 presigned URLs

════════════════════════════════════════
OBJETIVO — ELEGIR UNO
════════════════════════════════════════

[OPCIÓN A — PASARELA DE PAGO (STRIPE)]
Conectar checkout real con Stripe.

1. Verificar STRIPE_SECRET_KEY y STRIPE_WEBHOOK_SECRET en env
2. Revisar /api/checkout y /api/webhook/stripe existentes
3. Implementar flujo: cart → checkout → Stripe session → webhook → order creation
4. Order history en /account/orders
5. Email de confirmación (Resend)
6. Download links con R2 presigned URLs

[OPCIÓN B — BLOG SECTION]
Nuevo /blog con Markdown/CMS.

1. Schema: Post { id, title, slug, excerpt, content, coverImage, author, tags, publishedAt }
2. Firebase path: /blog/{postId}
3. Admin CRUD para posts
4. /blog página con listado
5. /blog/[slug] detalle con contenido renderizado
6. SEO meta tags por post

[OPCIÓN C — BEAT SCHEDULING]
Lanzamiento programado de beats.

1. Campo `scheduledAt` en Beat schema
2. Admin: date picker para programar lanzamiento
3. Store: beats con scheduledAt futuro no aparecen en catálogo
4. Countdown page para beats programados
5. Notificación cuando beat se activa

[OPCIÓN D — AUDIT + POLISH]
Deep audit del código actual.

1. Revisar todos los componentes nuevos (KitCard, admin users, admin kits)
2. Accessibility audit (ARIA, keyboard nav, screen reader)
3. Performance audit (lazy loading, bundle size)
4. Error handling audit (try/catch, fallbacks)
5. Mobile responsive audit profundo
6. Test coverage gaps

════════════════════════════════════════
CONSTRAINTS
════════════════════════════════════════

- Svelte 5: $state, $derived, $effect, $props
- 0 TypeScript errors al final
- npm run test debe seguir pasando 228+
- npm run check: 0 errors, 0 warnings
- No tocar: firebase.json, wrangler.jsonc
- Usar CSS vars existentes (--primary, --accent, --bg, etc.)
- R2 uploads: seguir patrón de src/routes/api/upload/
- process-shim.ts ya existe en src/lib/

════════════════════════════════════════
PRIMERO: LEE ESTOS ARCHIVOS
════════════════════════════════════════

1. CHANGELOG.md — historial completo
2. src/lib/types.ts (si existe) o src/lib/stores/beats.ts — tipos base
3. src/lib/stores/cart.ts — sistema de carrito
4. src/routes/api/checkout/+server.ts — endpoint checkout existente
5. src/routes/api/webhook/stripe/+server.ts — webhook existente

════════════════════════════════════════
DESPUÉS DE CADA CAMBIO
════════════════════════════════════════

1. npm run check → 0 errors, 0 warnings
2. npm run test → 228+ passing
3. Browser test en mobile (375px) y desktop (1280px)
4. Actualizar CHANGELOG.md
5. Git commit + push

════════════════════════════════════════
FIN DEL PROMPT
════════════════════════════════════════
```
