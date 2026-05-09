# 🔍 AUDIT — Estado post-Session 67 (2026-05-10)

## ✅ Completados (actualizado)

### 1. Firebase rules deploy ✅
Deployed 2026-05-10.

### 2. Admin kits — usar store functions ✅
Refactorizado en Session 67. `createKitWithId()`, `updateKit()`, `deleteKit()` del store. Browser-tested.

### 3. Token inválido en uploads ✅
Root cause: `tokeninfo` de Google falla en Cloudflare Workers. Fix: decodificar JWT directamente (base64url), validar iss/aud/exp localmente. Auth centralizado en `serverAuth.ts`. Deployeado y verificado.

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

## ⏳ Pendientes de prioridad ALTA

### 3. Test real de uploads
- Imagen a R2 via `/api/upload/kit-image` — no testeado con archivo real
- ZIP con audio real via `/api/upload/kit-zip` — no testeado con samples reales
- WAV duration parsing no testeado con WAVs reales de producción
**Bloqueado:** Necesita R2 credentials + archivos de audio reales. El endpoint guarda en `/static/uploads/` en dev mode.

## ⏳ Pendientes de prioridad MEDIA

### 4. Hardcoded URLs en código
Hay ~15 URLs hardcodeadas de `dacewav.store` y `dacewav-store-3b0f5` dispersas por el código:
- `src/routes/api/upload/+server.ts` — `R2_PUBLIC_BASE`, `FIREBASE_PROJECT_ID`
- `src/routes/api/upload/avatar/+server.ts` — igual
- `src/routes/api/upload/kit-image/+server.ts` — igual
- `src/routes/api/upload/kit-zip/+server.ts` — igual
- `src/routes/api/checkout/+server.ts` — origin fallback
- `src/routes/api/webhook/stripe/+server.ts` — download URL
- `src/routes/(store)/beat/[id]/+page.svelte` — canonical, og:url, schema
- `src/routes/(store)/genre/[slug]/+page.svelte` — canonical, og:url, schema
- `src/routes/(store)/+page.svelte` — schema
- `src/routes/(admin)/admin/emails/+page.svelte` — preview link
**Fix:** Centralizar en una constante de entorno o en `$lib/config.ts`.

### 5. Endpoint `/api/orders` sin rate limiting
Cualquiera puede consultar órdenes por email sin límite. Posible enumeración de emails.
**Fix:** Agregar rate limiting por IP (similar al de `/api/plays`).

### 6. Checkout endpoint sin CSRF protection
`POST /api/checkout` no valida el origin header. Un sitio malicioso podría crear checkouts en nombre del usuario.
**Fix:** Validar `Origin` o `Referer` header contra dominios permitidos.

### 7. Empty catch blocks (silent failures)
Hay ~15 `catch {}` vacíos en los API endpoints. Los errores se tragan silenciosamente.
**Fix:** Al menos loggear el error en dev mode.

### 8. Descarga sin verificación de comprador
`/api/download/[orderId]/[beatId]` solo verifica que la orden esté pagada, no que el solicitante sea el comprador. Cualquiera con el link puede descargar.
**Fix:** Agregar token firmado en la URL o verificar Firebase ID token.

## ⏳ Pendientes de prioridad BAJA

### 9. `@html` con CSS custom injection
`+layout.svelte` usa `{@html \`<style>${customCSS}</style>\`}`. Aunque `sanitizeCSS()` bloquea patterns peligrosos, es una superficie de ataque.
**Revisar:** Que `sanitizeCSS()` cubra todos los vectores (data:, vbscript:, -moz-binding, expression).

### 10. Email `from` hardcodeado
`ventas@dacewav.store` está hardcodeado en `email.ts`. Si cambia el dominio, hay que editar código.
**Fix:** Mover a template de Firebase o env var.

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

### 17. SEO — sitemap dinámico
`static/sitemap.xml` es estático. Debería generarse dinámicamente con los beats.
**Fix:** Crear endpoint `/sitemap.xml` que genere el sitemap desde Firebase.

### 18. Accessibility — aria labels en botones admin
Varios botones del admin no tienen `aria-label` (emojis, emails, etc.).

### 20. i18n
Todo hardcodeado en español (~150+ strings). Decisión arquitectónica pendiente: svelte-i18n vs paraglide.
**Prioridad:** Baja — la mayoría de usuarios hablan español.

## Estado actual del proyecto
- **Tests:** 270/270 passing
- **Type check:** 0 new errors (14 pre-existing env var issues)
- **Build:** OK (Cloudflare adapter)
- **Firebase rules:** ✅ Deployed 2026-05-10
- **Deploy:** Cloudflare Pages (via wrangler)
- **Último commit:** `41d2f78` (admin kits audio upload)
