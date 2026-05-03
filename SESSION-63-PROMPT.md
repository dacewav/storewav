# DACEWAV.STORE — SESSION 63 PROMPT
> Generado: Mayo 2026 | Repo: github.com/dacewav/storewav | Stack: SvelteKit 5 + Firebase RTDB + Cloudflare Pages + R2

---

## 📊 ESTADO ACTUAL (post-Session 62)

| Métrica | Estado |
|---|---|
| Tests | ✅ 228/228 passing |
| TypeScript errors | ✅ 0 |
| svelte-check | ✅ 0 errors, 0 warnings |
| Build | ✅ Clean (Cloudflare adapter) |
| Mobile responsive | ✅ Beat grid, cards, hero, footer, menu, player |
| Cart page | ✅ Fixed (process shim for Firebase SDK) |
| User profiles | ⚠️ BadgeDisplay creado, schema definido, falta implementación completa |
| Drumkits section | ❌ Pendiente |
| Blog section | ❌ Pendiente |
| Pasarela de pago | ❌ Pendiente |

---

## ✅ LO QUE SE HIZO EN SESSION 62

### Mobile Responsive
- **Beat grid fix**: inline `grid-template-columns` overrideaba media queries → ahora usa CSS var `--cards-per-row`
- **BeatCard touch targets**: play 56px, wishlist/cart 40px en mobile
- **BeatCard mobile layout**: cover 16:10, título más grande + line-clamp, precio XL
- **Hero stats**: 2x2 grid en mobile (ya existía)
- **Genre pills**: fade edge para scroll horizontal (ya existía)
- **Player**: touch targets mejorados (ya existía)
- **Admin**: bottom nav mobile, sidebar drawer (ya existía)

### Bug Fixes
- **Cart page crash**: `process is not defined` de Firebase SDK → `process-shim.ts` + app.html polyfill
- **svelte-check warning**: `line-clamp` standard property agregado

### Otras mejoras ya existentes (session 61 y anteriores)
- XSS fix: `escapeJsonLd()` para JSON-LD scripts
- CSP headers en `_headers` y `hooks.server.ts`
- 28 integration tests (Firebase mock)
- LikeButton con animación heartBurst
- WishlistPanel con exit animations
- Admin sidebar collapse mode
- Command palette (Ctrl+K)
- Preview panel split-view en admin

---

## 🤖 PROMPT PARA SESIÓN 63

```
DACEWAV.STORE — SESIÓN 63
Repo: https://github.com/dacewav/storewav
Stack: SvelteKit 2 + Svelte 5 + Firebase RTDB + Cloudflare Pages/Workers + R2 + TypeScript

════════════════════════════════════════
CONTEXTO
════════════════════════════════════════

Beat store personal. Brand: "YUGEN". Dev: Dace, Puebla MX.
Aesthetic: dark luxury, minimal, premium.
Géneros: Trap, Corrido Tumbado, R&B, Drill, Reggaeton, Hip-Hop.

Estado post-Session 62:
- 228/228 tests passing, 0 TS errors, 0 svelte-check warnings
- Mobile responsive completo (store + admin)
- Cart page fixeado (process shim)
- User profiles: BadgeDisplay creado, schema definido

Lo que existe:
STORE: hero animado, beat grid 3-col desktop / 1-col mobile, filter pills con fade edge, BeatCard (waveform, like count realtime, 56px play en mobile), Player sticky con mini-mode mobile, WishlistPanel drawer, EmojiPicker, CommentSection, share button, featured beats, "Para ti" recommendations, recently played, SEO completo, page transitions (View Transitions API)
ADMIN: CRUD beats, theme editor, content editor, brand (R2 uploads, nav links), banner/hero, animations (44 presets, cardStyle engine), discounts, notifications, testimonials, emojis, floating effects, bulk actions, import/export JSON, undo/redo, keyboard shortcuts, command palette (Ctrl+K), preview split-view, analytics page (plays, carts, orders), customers page

Lo que NO existe aún:
- Lucide icons migration (actualmente usa SVG inline custom)
- Real payment gateway (Stripe/Conekta)
- Drumkits section (/kits)
- Blog section (/blog)
- User profiles completos (avatar upload, public /u/[username])
- Beat scheduling (lanzamiento programado)

════════════════════════════════════════
OBJETIVO — ELEGIR UNO
════════════════════════════════════════

[OPCIÓN A — LUCIDE ICONS MIGRATION]
Migrar de SVG inline custom a Lucide Svelte.

1. npm install lucide-svelte
2. Auditar src/lib/icons.ts — mapear cada nombre a su equivalente Lucide
3. Actualizar Icon.svelte wrapper para usar Lucide como fallback
4. Reemplazar iconos en: admin sidebar, nav links, beat cards, player, filters, wishlist, etc.
5. Verificar tree-shaking (import individual, no barrel)
6. Mantener 228+ tests passing

[OPCIÓN B — USER PROFILES COMPLETOS]
Completar el sistema de perfiles.

Firebase schema:
  /users/{uid}/
    displayName, username (único), avatarUrl (R2), bannerUrl (R2),
    bio (160 chars), badges[], createdAt, totalPurchases,
    preferences: { emailNotifications, theme }

Componentes a crear/mejorar:
- AvatarUploader con crop circular → R2 upload
- BannerUploader 3:1 → R2 upload
- ProfileEditor form completo
- /profile página editable
- /u/[username] página pública (ya existe, verificar)
- Admin users: lista, asignar badges, ban

Firebase rules para users/.

[OPCIÓN C — PASARELA DE PAGO (STRIPE)]
Conectar checkout real con Stripe.

1. Verificar STRIPE_SECRET_KEY y STRIPE_WEBHOOK_SECRET en env
2. Revisar /api/checkout y /api/webhook/stripe existentes
3. Implementar flujo: cart → checkout → Stripe session → webhook → order creation
4. Order history en /account/orders
5. Email de confirmación (Resend)
6. Download links con R2 presigned URLs

[OPCIÓN D — DRUMKITS SECTION]
Nueva sección /kits para drumkits.

1. Schema: Kit { id, name, description, genre, samples[], priceMXN, priceUSD, imageUrl }
2. Firebase path: /kits/{kitId}
3. Admin CRUD para kits
4. /kits página con grid de cards
5. /kit/[id] detalle con audio previews de samples
6. Agregar al carrito (mismo sistema que beats)

════════════════════════════════════════
CONSTRAINTS
════════════════════════════════════════

- Svelte 5: $state, $derived, $effect, $props (NO Svelte 4 stores en componentes nuevos)
- 0 TypeScript errors al final
- npm run test debe seguir pasando 228+
- npm run check: 0 errors, 0 warnings
- No tocar: firebase.json, wrangler.jsonc
- Usar CSS vars existentes (--primary, --accent, --bg, etc.)
- R2 uploads: seguir patrón de src/routes/api/upload/
- process-shim.ts ya existe en src/lib/ (no duplicar)

════════════════════════════════════════
PRIMERO: LEE ESTOS ARCHIVOS
════════════════════════════════════════

1. src/app.css — CSS vars del design system
2. src/lib/types.ts — tipos base
3. src/lib/icons.ts — iconos actuales
4. src/lib/components/Icon.svelte — wrapper de iconos
5. CHANGELOG.md — historial completo
6. src/lib/process-shim.ts — polyfill Firebase

════════════════════════════════════════
DESPUÉS DE CADA CAMBIO
════════════════════════════════════════

1. npm run check → 0 errors, 0 warnings
2. npm run test → 228+ passing
3. Browser test en mobile (375px) y desktop (1280px)
4. Actualizar CHANGELOG.md
5. Crear SESSION-63-PROMPT.md

════════════════════════════════════════
FIN DEL PROMPT
════════════════════════════════════════
```
