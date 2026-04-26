# 🎯 BLOCK-CONTEXT.md — Sesión Actual

> **Se REESCRIBE cada vez que cambiamos de sesión.**
> **Límite: 50 min por chat.**

## Sesión Actual: 41 — FileUpload en campos URL + GitHub Action

```yaml
sesión: "41"
bloque: "FileUpload integration + CI/CD"
objetivo: "Añadir FileUpload a campos URL y crear GitHub Action"
tiempo: "~50 min"
estado: "✅ COMPLETADO"
último_commit: "(pendiente)"
tests_total: 117
svelte_check: "0 errors, 10 warnings"
```

### Session 41 — Resumen

**FileUpload en Testimonios**
- Avatar URL: input URL → FileUpload + URL fallback
- Folder: `testimonials/avatars/`
- Max: 5MB, accepts images

**FileUpload en Emojis**
- Emoji image URL: input URL → FileUpload + URL fallback
- Folder: `emojis/custom/`
- Max: 2MB, accepts images

**GitHub Action — Workers Deploy**
- Workflow: `.github/workflows/deploy-workers.yml`
- Trigger: push to main + manual dispatch
- Secrets necesarios en GitHub UI:
  - `CF_API_TOKEN` — Cloudflare API token
  - `CF_ACCOUNT_ID` — Cloudflare account ID
  - `PUBLIC_FIREBASE_*` — todas las vars de Firebase
  - `PUBLIC_ADMIN_UIDS`

**TypeScript fix**
- `upload.ts`: `deleteFile` return type `void` → `Promise<void>`

## Pendientes restantes

1. **Firebase rules** — deploy `firebase.rules.json` desde Firebase Console (themePresets/, gallery/, customEmojis/, changelog/ ya están en el archivo)
2. **Brand logoUrl** — ya tiene FileUpload (verificar que funciona)
3. **Links** — URLs externas, probablemente no necesitan upload
4. **Verificar stats productores** — dashboard ya muestra "Artistas únicos"

## Datos clave
- Deploy: Cloudflare Pages auto-deploy (trigger via API)
- R2 bucket: dace-beats (binding: MEDIA)
- CDN: https://cdn.dacewav.store
- Firebase: dacewav-store-3b0f5
- Dev server: `npm run dev -- --host 0.0.0.0 --port 5173`
- Login: `/login` → "🧪 Entrar como tester (anónimo)"
- Firebase rules: deploy manual desde Console
- CF API token: (en Cloudflare Dashboard, no guardar aquí)
