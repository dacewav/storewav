# 🔍 AUDIT — Estado post-Session 69 (2026-05-10)

## ✅ Completados (actualizado)

### 1. Firebase rules deploy ✅
Deployed 2026-05-10.

### 2. Admin kits — usar store functions ✅
Refactorizado en Session 67. `createKitWithId()`, `updateKit()`, `deleteKit()` del store. Browser-tested.

### 3. Token inválido en uploads ✅
Root cause: `tokeninfo` de Google falla en Cloudflare Workers. Fix: decodificar JWT directamente (base64url), validar iss/aud/exp localmente. Auth centralizado en `serverAuth.ts`. Deployeado y verificado.

### 5. Rate limiting en `/api/orders` ✅ (Session 69)
10 req/min por IP. Similar al de `/api/plays`.

### 6. Checkout endpoint CSRF protection ✅ (Session 69)
Valida `Origin` header contra `ALLOWED_ORIGINS` de `config.ts`.

### 8. Download verification con UUID token ✅ (Session 69)
Webhook genera UUID token por item → guarda en Firebase `downloadTokens/` → download endpoint verifica token como query param.

### 17. SEO — sitemap dinámico ✅ (Session 69)
Endpoint `/sitemap.xml` genera sitemap desde Firebase (beats + géneros). Cache 1h. Static `sitemap.xml` eliminado.

### 19. WAV duration edge cases ✅
Extraído `audioDuration.ts`, 27 tests nuevos (WAV PCM, stereo, 24-bit, extra chunks, corrupt, truncated, MP3 estimation).

### Bonus: KitCard effect_update_depth_exceeded fix ✅
`$derived` → `$state` para cart subscribe. Browser-tested, 0 errores en consola.

### Bonus: Kit detail page enhancements ✅
Progress bar con seek, auto-play next, stop button, related kits, pulse animation.

### Bonus: Admin kits — audio upload directo ✅
- 🎵 Subir audio por sample (upload directo a R2, auto-llena URL)
- ⠿ Drag & drop reorder
- ⧉ Duplicar sample
- Duración del sample como badge

### Bonus: Config centralizado ✅ (Session 69)
`src/lib/config.ts` — STORE_DOMAIN, STORE_URL, CDN_URL, FIREBASE_PROJECT_ID, ALLOWED_ORIGINS, EMAIL_FROM.
Usado en: checkout, webhook, serverAuth, email, abandonedCart.

### Bonus: Loader safety timeout ✅ (Session 69)
8s timeout en layout — si Firebase settings no cargan, el loader desaparece igual.

### Bonus: Empty catch blocks logging ✅ (Session 69)
11 catches en 5 API endpoints ahora loggean con `console.warn` + contexto.

## ⏳ Pendientes de prioridad ALTA

### 3. Test real de uploads
- Imagen a R2 via `/api/upload/kit-image` — no testeado con archivo real
- ZIP con audio real via `/api/upload/kit-zip` — no testeado con samples reales
- WAV duration parsing no testeado con WAVs reales de producción
**Bloqueado:** Necesita R2 credentials + archivos de audio reales. El endpoint guarda en `/static/uploads/` en dev mode.

## ⏳ Pendientes de prioridad MEDIA

### 4. Hardcoded URLs restantes en código
Quedan URLs hardcodeadas en uploads y páginas Svelte:
- `src/routes/api/upload/+server.ts` — `R2_PUBLIC_BASE`, `FIREBASE_PROJECT_ID`
- `src/routes/api/upload/avatar/+server.ts` — igual
- `src/routes/api/upload/kit-image/+server.ts` — igual
- `src/routes/api/upload/kit-zip/+server.ts` — igual
- `src/routes/(store)/beat/[id]/+page.svelte` — canonical, og:url, schema
- `src/routes/(store)/genre/[slug]/+page.svelte` — canonical, og:url, schema
- `src/routes/(store)/+page.svelte` — schema
- `src/routes/(admin)/admin/emails/+page.svelte` — preview link
**Fix:** Importar de `$lib/config.ts`.

## ⏳ Pendientes de prioridad BAJA

### 9. `@html` con CSS custom injection
`+layout.svelte` usa `{@html \`<style>${customCSS}</style>\`}`. Aunque `sanitizeCSS()` bloquea patterns peligrosos, es una superficie de ataque.
**Revisar:** Que `sanitizeCSS()` cubra todos los vectores (data:, vbscript:, -moz-binding, expression).

### 11. `admin/+page.svelte` usa `JSON.parse(text)` sin try-catch
Línea 126 — si el JSON es inválido, explota.
**Fix:** Envolver en try-catch.

### 12. `oneTap.ts` usa `(window as any).google`
Necesita typing para Google Identity Services.
**Fix:** Declarar tipos en `app.d.ts`.

### 13. Bundle size — imports dinámicos
Firebase, pdf-lib, fflate, @aws-sdk se importan dinámicamente (lazy). Esto ya está bien.
Pero `r2Presign.ts` importa @aws-sdk en el top-level — se incluye en el bundle del worker.
**Fix:** Hacer el import dinámico dentro de `getPresignedDownloadUrl()`.

### 14. `plays` endpoint — `.write: true` en Firebase rules
El endpoint tiene rate limiting server-side, pero la escritura a Firebase es sin auth.
**Fix:** Agregar auth al endpoint o usar Firebase Admin SDK.

### 15. Contratos PDF — considerar firma digital
Los contratos generados no tienen firma digital. Son PDFs planos.
**Considerar:** Agregar firma electrónica simple (imagen de firma + hash de verificación).

### 16. Testimonios — `role` vs `stars`
El tipo `Testimonial` tiene ambos campos. Firebase usa `role`, el código legacy usa `stars`.
**Fix:** Estandarizar a un solo campo.

### 18. Accessibility — aria labels en botones admin
Varios botones del admin no tienen `aria-label` (emojis, emails, etc.).

### 20. i18n
Todo hardcodeado en español (~150+ strings). Decisión arquitectónica pendiente: svelte-i18n vs paraglide.
**Prioridad:** Baja — la mayoría de usuarios hablan español.

## Estado actual del proyecto
- **Tests:** 270/270 passing
- **Type check:** 0 errors, 1 warning (pre-existing)
- **Build:** OK (Cloudflare adapter)
- **Firebase rules:** ✅ Deployed 2026-05-10
- **Deploy:** Cloudflare Pages (via wrangler)
- **Último commit:** `32632b4` (CSRF, rate limiting, config, sitemap, download tokens)
