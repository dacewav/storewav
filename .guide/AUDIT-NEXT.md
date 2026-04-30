# 🔍 AUDIT — Próxima sesión (2026-04-30)

## Pendientes de prioridad MEDIA

### 1. Hardcoded URLs en código
Hay ~15 URLs hardcodeadas de `dacewav.store` y `dacewav-store-3b0f5` dispersas por el código:
- `src/routes/api/upload/+server.ts` — `R2_PUBLIC_BASE`, `FIREBASE_PROJECT_ID`
- `src/routes/api/upload/avatar/+server.ts` — igual
- `src/routes/api/checkout/+server.ts` — origin fallback
- `src/routes/api/webhook/stripe/+server.ts` — download URL
- `src/routes/(store)/beat/[id]/+page.svelte` — canonical, og:url, schema
- `src/routes/(store)/genre/[slug]/+page.svelte` — canonical, og:url, schema
- `src/routes/(store)/+page.svelte` — schema
- `src/routes/(admin)/admin/emails/+page.svelte` — preview link

**Fix:** Centralizar en una constante de entorno o en `$lib/config.ts`.

### 2. Endpoint `/api/orders` sin rate limiting
Cualquiera puede consultar órdenes por email sin límite. Posible enumeración de emails.
**Fix:** Agregar rate limiting por IP (similar al de `/api/plays`).

### 3. Checkout endpoint sin CSRF protection
`POST /api/checkout` no valida el origin header. Un sitio malicioso podría crear checkouts en nombre del usuario.
**Fix:** Validar `Origin` o `Referer` header contra dominios permitidos.

### 4. Empty catch blocks (silent failures)
Hay ~15 `catch {}` vacíos en los API endpoints. Los errores se tragan silenciosamente.
**Fix:** Al menos loggear el error en dev mode.

### 5. Descarga sin verificación de comprador
`/api/download/[orderId]/[beatId]` solo verifica que la orden esté pagada, no que el solicitante sea el comprador. Cualquiera con el link puede descargar.
**Fix:** Agregar token firmado en la URL o verificar Firebase ID token.

## Pendientes de prioridad BAJA

### 6. `@html` con CSS custom injection
`+layout.svelte` usa `{@html \`<style>${customCSS}</style>\`}`. Aunque `sanitizeCSS()` bloquea patterns peligrosos, es una superficie de ataque.
**Revisar:** Que `sanitizeCSS()` cubra todos los vectores (data:, vbscript:, -moz-binding, expression).

### 7. Email `from` hardcodeado
`ventas@dacewav.store` está hardcodeado en `email.ts`. Si cambia el dominio, hay que editar código.
**Fix:** Mover a template de Firebase o env var.

### 8. `admin/+page.svelte` usa `JSON.parse(text)` sin try-catch
Línea 126 — si el JSON es inválido, explota.
**Fix:** Envolver en try-catch.

### 9. Missing `alt` en imágenes decorativas
`FloatingElement.svelte` tiene `alt=""` que es correcto para decorativas. OK.

### 10. `oneTap.ts` usa `(window as any).google`
Necesita typing para Google Identity Services.
**Fix:** Declarar tipos en `app.d.ts`.

### 11. Bundle size — imports dinámicos
Firebase, pdf-lib, fflate, @aws-sdk se importan dinámicamente (lazy). Esto ya está bien.
Pero `r2Presign.ts` importa @aws-sdk en el top-level — se incluye en el bundle del worker.
**Fix:** Hacer el import dinámico dentro de `getPresignedDownloadUrl()`.

### 12. `plays` endpoint — `.write: true` en Firebase rules
El endpoint tiene rate limiting server-side, pero la escritura a Firebase es sin auth.
**Fix:** Agregar auth al endpoint o usar Firebase Admin SDK.

### 13. Contratos PDF — considerar firma digital
Los contratos generados no tienen firma digital. Son PDFs planos.
**Considerar:** Agregar firma electrónica simple (imagen de firma + hash de verificación).

### 14. Testimonios — `role` vs `stars`
El tipo `Testimonial` tiene ambos campos. Firebase usa `role`, el código legacy usa `stars`.
**Fix:** Estandarizar a un solo campo.

### 15. SEO — sitemap dinámico
`static/sitemap.xml` es estático. Debería generarse dinámicamente con los beats.
**Fix:** Crear endpoint `/sitemap.xml` que genere el sitemap desde Firebase.

### 16. Accessibility — aria labels en botones admin
Varios botones del admin no tienen `aria-label` (emojis, emails, etc.).

### 17. `rules-pack.tar.gz` eliminado del track
Si se necesita en el futuro, está en el historial de git.

## Estado actual del proyecto
- **Tests:** 217/217 passing
- **Type check:** 0 errors
- **Build:** OK
- **Browser:** sin errores, CSP funciona
- **Firebase rules:** `paidOrders` locked, `orders` writable
- **Security headers:** CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy
