# 🎯 BLOCK-CONTEXT.md — Sesión Actual

> **Se REESCRIBE cada vez que cambiamos de sesión.**
> **Límite: 50 min por chat.**

## Sesión Actual: 41 — FileUpload + Emoji System + Audio Fix

```yaml
sesión: "41"
bloque: "FileUpload + Emoji autocomplete + Audio player fix"
objetivo: "FileUpload en URL fields, emoji system estilo Discord/TTV, fix audio playback"
tiempo: "~50 min"
estado: "✅ COMPLETADO"
último_commit: "3309bd4"
tests_total: 134
svelte_check: "0 errors, 13 warnings"
```

## Pendientes para próxima sesión

1. **Firebase rules** — deploy `firebase.rules.json` desde Firebase Console
2. **GitHub secrets** — CF_API_TOKEN, CF_ACCOUNT_ID, PUBLIC_FIREBASE_*, PUBLIC_ADMIN_UIDS
3. **Beat grid** — no aparece en la tienda (necesita debug con browser console)
4. **Cloudflare Pages** — verificar que auto-deploy funciona con env vars
5. **Emoji picker polish** — refinar UX según feedback
6. **Audio uploads** — primeros 7 beats no tienen audio

## Datos clave
- Deploy: Cloudflare Pages auto-deploy (trigger via API)
- R2 bucket: dace-beats (binding: MEDIA)
- CDN: https://cdn.dacewav.store
- Firebase: dacewav-store-3b0f5
- Dev server: `npm run dev -- --host 0.0.0.0 --port 5173`
- Login: `/login` → "🧪 Entrar como tester (anónimo)"
- Firebase rules: deploy manual desde Console
