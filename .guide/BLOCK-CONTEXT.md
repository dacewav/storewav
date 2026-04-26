# 🎯 BLOCK-CONTEXT.md — Sesión Actual

> **Se REESCRIBE cada vez que cambiamos de sesión.**
> **Límite: 50 min por chat.**

## Sesión Actual: 40 — Upload R2 + Fixes

```yaml
sesión: "40"
bloque: "R2 upload migration + UX fixes"
objetivo: "Migrar uploads a R2, mejorar feedback visual"
tiempo: "~50 min"
estado: "✅ COMPLETADO"
último_commit: "4ce13e1"
tests_total: 117
svelte_check: "0 errors (build), 8 warnings"
```

### Session 40 — Resumen

**Upload R2 Migration**
- Firebase Storage → Cloudflare R2 via `/api/upload` endpoint
- wrangler.jsonc: R2 binding `MEDIA` → bucket `dace-beats`
- Public URL: `https://cdn.dacewav.store`
- XHR upload con progress real (barra se mueve)
- Jurisdiction fix en Pages R2 binding (causaba deploy failure)

**UX Fixes**
- ✓ Success flash animation después de subir (2s)
- Image preview: `object-fit: contain` (no recorta GIFs)
- Mobile: GIF preview ya no se rompe
- Always try R2 first, Firebase fallback

**Env vars**
- `$env/static/public` (build-time) — requiere vars en Pages dashboard
- Firebase vars + `PUBLIC_R2_BASE_URL` configurados en Pages

## Próxima sesión: Upload local en campos URL

### Tareas pendientes (Session 41)

1. **Testimonios** — añadir FileUpload para avatarUrl (subir desde PC)
2. **Brand** — añadir FileUpload para logoUrl
3. **Otros campos URL** — revisar todos los inputs type="url" y añadir upload local
4. **GitHub Action** — agregar workflow + secrets desde GitHub UI
5. **Firebase rules** — deploy desde Firebase Console

## Datos clave
- Deploy: Cloudflare Pages auto-deploy (trigger via API)
- R2 bucket: dace-beats (binding: MEDIA)
- CDN: https://cdn.dacewav.store
- Firebase: dacewav-store-3b0f5
- Dev server: `npm run dev -- --host 0.0.0.0 --port 5173`
- Login: `/login` → "🧪 Entrar como tester (anónimo)"
- Firebase rules: deploy manual desde Console
- CF API token: (en Cloudflare Dashboard, no guardar aquí)
