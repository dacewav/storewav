# MEGA AUDIT — dacewav.store

## Contexto
- **Repo:** https://github.com/dacewav/storewav
- **Stack:** SvelteKit 2 + Svelte 5 + Firebase RTDB + Cloudflare Pages + R2 + TypeScript
- **Live:** https://dacewav.store
- **Último commit:** `651c0bc`

## Estado actual
- 280 tests passing
- Build OK (Cloudflare adapter)
- R2 credentials verificados (presigned URLs working)
- Firebase rules simplificadas (recién publicadas)
- Known issue: Firebase rules se rompían con validación estricta de arrays → ya simplificadas

## Objetivo del audit

### 1. AUDIT VISUAL COMPLETO (Browser)
Recorrer TODAS las páginas en browser con screenshots y verificar:
- **Store pages:** /, /kits, /beat/[slug], /cart, /checkout/success, /checkout/cancel, /login, /account/orders, /account/notifications, /verify/[hash]
- **Admin pages:** /admin, /admin/beats, /admin/kits, /admin/orders, /admin/brand, /admin/settings, /admin/team, /admin/subscribers, /admin/changelog
- Para cada página: revisar layout, spacing, tipografía, colores, responsive, accesibilidad (aria-labels, keyboard nav)

### 2. FUNCIONALIDAD — TEST CADA BOTÓN/ACCIÓN
Para cada interacción verificar que funcione:
- **Beat cards:** play/pause, like, add to cart, share
- **Filters:** genre, key, sort, tags, price slider
- **Cart:** add/remove items, quantity, discount codes, checkout flow
- **Auth:** Google login, email link, anonymous tester
- **Audio player:** play/pause, progress, volume, beat switching
- **Admin CRUD:** crear/editar/eliminar beats, kits, upload audio/images
- **Theme:** toggle light/dark, custom themes
- **Verify:** contract hash verification endpoint

### 3. E2E FLOW (Stripe test mode)
Test completo: browse → add to cart → checkout → webhook → download → contract
- Verificar que orders se escriben en Firebase (sin null values)
- Verificar que download tokens se crean
- Verificar que contracts se generan
- Verificar que presigned R2 URLs funcionan

### 4. DISEÑO & UX — MEJORAS
Para cada página identificar:
- Jerarquía visual débil
- Espaciado inconsistente
- Tipografía mal escalada
- CTAs poco claros
- Estados vacíos sin guía
- Loading states faltantes
- Animaciones/microinteracciones que faltan
- Mobile responsiveness issues

### 5. FEATURES FALTANTES
Evaluar qué podría mejorar el negocio:
- SEO: meta tags, structured data, sitemap completeness
- Performance: lazy loading, image optimization, bundle size
- Analytics: event tracking, conversion funnel
- Marketing: email capture, social proof, urgency
- Accessibility: WCAG compliance

### 6. CÓDIGO & ARQUITECTURA
- TypeScript errors o warnings
- Svelte 5 runes usage (¿hay Svelte 4 patterns sin migrar?)
- Error handling completeness
- Security review (CSRF, XSS, auth flows)
- Test coverage gaps

## Output esperado
Por cada hallazgo:
1. **Página/componente** afectado
2. ** Severidad:** 🔴 Critical | 🟡 Medium | 🟢 Nice-to-have
3. **Descripción** del problema o mejora
4. **Propuesta** de solución concreta
5. **Esfuerzo estimado** (S/M/L)

## Notas técnicas
- Firebase REST API no requiere auth para read/write (reglas simplificadas)
- R2 presigned URLs: GET funciona, HEAD da 403 (normal)
- Firebase keys están en .env.example (ya configurado)
- Cloudflare tokens para API: usar cfut_* tokens
- GitHub token: usar el proporcionado para push

## Archivos clave
- `firebase.rules.json` — reglas RTDB (simplificadas, sin validación estricta)
- `src/routes/api/webhook/stripe/+server.ts` — webhook con idempotency
- `src/routes/api/download/` — download endpoints con TTL
- `src/routes/(store)/` — store pages
- `src/routes/(admin)/admin/` — admin pages
- `src/lib/stores/` — Svelte stores
- `.guide/AUDIT-NEXT.md` — estado del proyecto
