# 🎯 BLOCK-CONTEXT.md — Sesión Actual

> **Se REESCRIBE cada vez que cambiamos de sesión.**
> **Límite: 50 min por chat.**

## Sesión Actual: 43 — Admin Polish + Firebase Deploy

```yaml
sesión: "43"
bloque: "Admin polish + Firebase deploy"
objetivo: "Pulir admin (animation previews, theme preview) + deploy Firebase rules"
tiempo: "~50 min"
estado: "🟡 PARCIAL — code done, deploy pending"
último_commit: "6d52083"
tests_total: 134
svelte_check: "0 errors, 13 warnings"
```

## TAREAS SESIÓN 43 (estado)

### 1. ✅ Admin: Animation Previews en vivo
- Mini-card previews realistas para cada elemento (logo, title, cards, CTA, player, waveform)
- Timing por elemento (dur, delay, easing) reflejado en cada preview
- Galería de presets separada

### 2. ✅ Theme: Live Preview Panel
- Split-view: controles izquierda, preview derecha (sticky)
- Mini mockup de tienda: nav, hero, cards, CTA
- Se actualiza en tiempo real con cada slider
- Toggle button, responsive (<1100px se oculta)

### 3. 🟡 Firebase Rules Deploy
- Rules ya incluyen gallery/, changelog/, customEmojis/ en firebase.rules.json
- **FALTA**: deploy desde Firebase Console (requiere credenciales)
- Comando: `firebase deploy --only database`

### 4. 🟡 GitHub Secrets
- Workflow necesita 9 secrets:
  - PUBLIC_FIREBASE_API_KEY, AUTH_DOMAIN, DATABASE_URL, PROJECT_ID, STORAGE_BUCKET, MESSAGING_SENDER_ID, APP_ID
  - PUBLIC_ADMIN_UIDS
  - CF_API_TOKEN, CF_ACCOUNT_ID
- **FALTA**: agregarlos en GitHub repo → Settings → Secrets

### 5. 🔴 Beats sin audio
- 11/11 beats sin audioUrl (solo 1 tiene previewUrl)
- Necesitan audio files subidos via admin/media o R2

## Datos clave
- Dev: `npm run dev -- --host 0.0.0.0 --port 5173`
- Login: `/login` → "🧪 Entrar como tester (anónimo)"
- Firebase: dacewav-store-3b0f5
- CDN: https://cdn.dacewav.store
- Tests: `npm test -- --run` (134 passing)
- Check: `npx svelte-check` (0 errors)
- Repo: https://github.com/dacewav/storewav
