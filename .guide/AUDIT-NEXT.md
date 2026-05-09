# 🔍 AUDIT — Estado post-Session 69 (2026-05-10)

## ✅ Completados

### 1. Firebase rules deploy ✅
Deployed 2026-05-10.

### 2. Admin kits — usar store functions ✅
Refactorizado en Session 67. `createKitWithId()`, `updateKit()`, `deleteKit()` del store. Browser-tested.

### 3. Token inválido en uploads ✅
Root cause: `tokeninfo` de Google falla en Cloudflare Workers. Fix: decodificar JWT directamente (base64url), validar iss/aud/exp localmente. Auth centralizado en `serverAuth.ts`. Deployeado y verificado.

### 4. Hardcoded URLs centralizadas ✅ (Session 69)
`src/lib/config.ts` con STORE_URL, CDN_URL, etc. Todas las URLs de `dacewav.store` reemplazadas en: beat/[id], genre/[slug], +page, +layout, emails admin, email.ts, abandonedCarts.ts, checkout, webhook, serverAuth, cron.

### 5. Rate limiting en `/api/orders` ✅ (Session 69)
10 req/min por IP. Similar al de `/api/plays`.

### 6. Checkout endpoint CSRF protection ✅ (Session 69)
Valida `Origin` header contra `ALLOWED_ORIGINS` de `config.ts`.

### 8. Download verification con UUID token ✅ (Session 69)
Webhook genera UUID token por item → guarda en Firebase `downloadTokens/` → download endpoint verifica token como query param.

### 12. `oneTap.ts` typing ✅ (Session 69)
`(window as any).google` → `window.google` (tipos ya declarados en `app.d.ts`).

### 13. Bundle size — r2Presign dynamic import ✅ (Session 69)
`@aws-sdk/client-s3` y `@aws-sdk/s3-request-presigner` importados dinámicamente. No se incluyen en el bundle del worker hasta que se necesiten.

### 17. SEO — sitemap dinámico ✅ (Session 69)
Endpoint `/sitemap.xml` genera sitemap desde Firebase (beats + géneros). Cache 1h. Static `sitemap.xml` eliminado.

### 18. Accessibility — aria labels ✅ (Session 69)
`aria-label` agregado a botones admin con `title` attribute. Duplicados corregidos.

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

## ⏳ Pendientes de prioridad BAJA

### 9. `@html` con CSS custom injection
`+layout.svelte` usa `{@html \`<style>${customCSS}</style>\`}`. Aunque `sanitizeCSS()` bloquea patterns peligrosos, es una superficie de ataque.
**Revisar:** Que `sanitizeCSS()` cubra todos los vectores (data:, vbscript:, -moz-binding, expression).

### 11. `admin/+page.svelte` JSON.parse — ya tiene try-catch ✅
Verificado: el JSON.parse está dentro de un bloque try-catch.

### 14. `plays` endpoint — `.write: true` en Firebase rules
El endpoint tiene rate limiting server-side, pero la escritura a Firebase es sin auth.
**Fix:** Agregar auth al endpoint o usar Firebase Admin SDK.

### 15. Contratos PDF — considerar firma digital
Los contratos generados no tienen firma digital. Son PDFs planos.
**Considerar:** Agregar firma electrónica simple (imagen de firma + hash de verificación).

### 16. Testimonios — `role` vs `stars`
El tipo `Testimonial` tiene ambos campos. Firebase usa `role`, el código legacy usa `stars`.
**Fix:** Estandarizar a un solo campo.

### 20. i18n
Todo hardcodeado en español (~150+ strings). Decisión arquitectónica pendiente: svelte-i18n vs paraglide.
**Prioridad:** Baja — la mayoría de usuarios hablan español.

## Estado actual del proyecto
- **Tests:** 270/270 passing
- **Type check:** 0 errors, 1 warning (pre-existing)
- **Build:** OK (Cloudflare adapter)
- **Firebase rules:** ✅ Deployed 2026-05-10
- **Deploy:** Cloudflare Pages (via wrangler)
- **Último commit:** `911a9a7` (config imports, oneTap types, r2Presign dynamic, aria labels)
